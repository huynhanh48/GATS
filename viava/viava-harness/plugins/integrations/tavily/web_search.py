from __future__ import annotations

import logging
from typing import Dict, List, Optional

import httpx

from capabilities.web_search import WebSearchBase, WebSearchItem, WebSearchResult

logger = logging.getLogger(__name__)

TAVILY_API_URL = "https://api.tavily.com/search"


class TavilyWebSearch(WebSearchBase):
    def __init__(self, api_key: str, client: Optional[httpx.AsyncClient] = None, timeout: int = 15) -> None:
        self._api_key = api_key
        self._client = client
        self._timeout = timeout

    async def search(
        self,
        query: str,
        max_results: int = 5,
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None,
    ) -> WebSearchResult:
        body: Dict = {
            "api_key": self._api_key,
            "query": query,
            "max_results": max_results,
        }
        if include_domains:
            body["include_domains"] = include_domains
        if exclude_domains:
            body["exclude_domains"] = exclude_domains

        client = self._client if self._client else httpx.AsyncClient(timeout=self._timeout)
        try:
            if self._client is None:
                async with client:
                    return await self._do_request(client, body)
            return await self._do_request(client, body)
        except httpx.HTTPError as e:
            logger.exception("Tavily request failed")
            return WebSearchResult(items=[])

    async def _do_request(self, client: httpx.AsyncClient, body: Dict) -> WebSearchResult:
        resp = await client.post(TAVILY_API_URL, json=body)
        resp.raise_for_status()
        data = resp.json()

        items = [
            WebSearchItem(
                title=r.get("title", ""),
                url=r.get("url", ""),
                snippet=r.get("content", ""),
            )
            for r in data.get("results", [])
        ]
        return WebSearchResult(items=items, total_estimated=data.get("total_results"))
