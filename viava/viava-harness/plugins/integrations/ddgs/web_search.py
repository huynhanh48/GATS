from __future__ import annotations

import asyncio
import logging
from typing import List, Optional
from urllib.parse import urlparse

from capabilities.web_search import WebSearchBase, WebSearchItem, WebSearchResult

logger = logging.getLogger(__name__)


class DuckDuckGoWebSearch(WebSearchBase):
    def __init__(
        self,
        max_results: int = 5,
    ) -> None:
        self._default_max_results = max_results

    async def search(
        self,
        query: str,
        max_results: int = 5,
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None,
    ) -> WebSearchResult:
        limit = max_results or self._default_max_results
        try:
            from ddgs import DDGS
        except Exception as exc:
            logger.exception("DDGS dependency is not installed")
            return WebSearchResult(items=[])

        try:
            loop = asyncio.get_running_loop()
            items = await loop.run_in_executor(None, self._search_sync, DDGS, query, limit)
        except Exception as exc:
            logger.exception("DDGS search failed")
            return WebSearchResult(items=[])

        if include_domains:
            include_set = set(include_domains)
            items = [r for r in items if urlparse(r.url).netloc in include_set]
        if exclude_domains:
            exclude_set = set(exclude_domains)
            items = [r for r in items if urlparse(r.url).netloc not in exclude_set]

        return WebSearchResult(items=items[:limit])

    def _search_sync(self, ddgs_cls, query: str, limit: int) -> List[WebSearchItem]:
        results: List[WebSearchItem] = []
        with ddgs_cls() as ddgs:
            for item in ddgs.text(query, max_results=limit):
                url = str(item.get("href") or item.get("url") or "")
                if not url:
                    continue
                title = str(item.get("title") or "")
                body = str(item.get("body") or item.get("snippet") or "")
                results.append(WebSearchItem(title=title, url=url, snippet=body))
        return results
