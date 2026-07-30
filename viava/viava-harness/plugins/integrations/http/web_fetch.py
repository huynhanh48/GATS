from __future__ import annotations

import re
from html.parser import HTMLParser
from typing import Optional
from urllib.parse import urlparse

import httpx

from capabilities.web_fetch import WebFetchBase, WebFetchItem

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) "
    "AppleWebKit/537.36 (KHTML, like Gecko) harness-agents/0.1"
)
MAX_REDIRECTS = 5


class HttpWebFetch(WebFetchBase):
    def __init__(self, client: Optional[httpx.AsyncClient] = None, timeout: int = 15) -> None:
        self._client = client
        self._timeout = timeout

    async def fetch(self, url: str, max_chars: int = 12000) -> WebFetchItem:
        is_valid, error_message = _validate_url(url)
        if not is_valid:
            return WebFetchItem(url=url, status_code=0, content_type="", content=error_message)

        try:
            client = self._client or httpx.AsyncClient(
                follow_redirects=True,
                max_redirects=MAX_REDIRECTS,
                timeout=self._timeout,
            )
            if self._client is None:
                async with client:
                    return await self._do_request(client, url, max_chars)
            return await self._do_request(client, url, max_chars)
        except httpx.HTTPError as exc:
            return WebFetchItem(url=url, status_code=0, content_type="", content=f"HTTP error: {exc}")

    async def _do_request(self, client: httpx.AsyncClient, url: str, max_chars: int) -> WebFetchItem:
        resp = await client.get(url, headers={"User-Agent": USER_AGENT})
        content_type = resp.headers.get("Content-Type", "")
        body = resp.text

        if "html" in content_type:
            body = _html_to_text(body)

        body = body.strip()
        truncated = False
        if len(body) > max_chars:
            body = body[:max_chars].rstrip() + "\n...[truncated]"
            truncated = True

        return WebFetchItem(
            url=str(resp.url),
            status_code=resp.status_code,
            content_type=content_type or "(unknown)",
            content=body,
            truncated=truncated,
        )


def _validate_url(url: str) -> tuple[bool, str]:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False, "only http and https URLs are allowed"
    if not parsed.netloc:
        return False, "URL must include a host"
    if parsed.username or parsed.password:
        return False, "URLs with embedded credentials are not allowed"
    return True, ""


def _html_to_text(html: str) -> str:
    parser = _HTMLTextExtractor()
    parser.feed(html)
    parser.close()
    text = " ".join(parser.parts)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return re.sub(r"[ \t\r\f\v]+", " ", text).replace(" \n", "\n").strip()


class _HTMLTextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        del attrs
        if tag in {"script", "style"}:
            self._skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"} and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        stripped = data.strip()
        if stripped:
            self.parts.append(stripped)
