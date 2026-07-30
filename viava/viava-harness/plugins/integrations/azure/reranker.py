from __future__ import annotations

import httpx

from core.llm.exception import (
    LLMAuthenticationError,
    LLMBadRequestError,
    LLMConnectionError,
    LLMRateLimitError,
)
from core.rerank import BaseReranker
from core.vector_storage.models import ScoredItem


class AzureCohereReranker(BaseReranker):
    def __init__(
        self,
        api_key: str,
        endpoint: str,
        model: str,
        timeout: float = 60.0,
    ):
        self._api_key = api_key
        self._endpoint = endpoint.rstrip("/")
        self._model = model
        self._http = httpx.AsyncClient(timeout=timeout)

    async def close(self) -> None:
        await self._http.aclose()

    async def rerank(
        self, query: str, candidates: list[ScoredItem], top_k: int
    ) -> list[ScoredItem]:
        if not candidates:
            return []
        if len(candidates) <= top_k:
            return candidates

        documents = [c.content for c in candidates]

        try:
            resp = await self._http.post(
                self._endpoint,
                headers=self._get_headers(),
                json=self._build_body(query, documents, top_k),
            )
            if not resp.is_success:
                self._raise_for_status(resp)
            data = resp.json()
        except httpx.HTTPStatusError as e:
            self._raise_for_status(e.response)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            raise LLMConnectionError(str(e), cause=e)

        return self._parse_results(data, candidates, top_k)

    def _get_headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "api-key": self._api_key,
        }

    def _build_body(
        self, query: str, documents: list[str], top_k: int
    ) -> dict:
        return {
            "model": self._model,
            "query": query,
            "documents": documents,
            "top_n": top_k,
        }

    def _raise_for_status(self, resp: httpx.Response) -> None:
        status = resp.status_code
        body = ""
        try:
            body = resp.text
        except Exception:
            pass

        if status == 401:
            raise LLMAuthenticationError(f"Authentication failed: {body}")
        if status == 429:
            raise LLMRateLimitError(f"Rate limit exceeded: {body}")
        if 400 <= status < 500:
            raise LLMBadRequestError(f"Bad request ({status}): {body}")
        resp.raise_for_status()

    def _parse_results(
        self,
        data: dict,
        candidates: list[ScoredItem],
        top_k: int,
    ) -> list[ScoredItem]:
        score_map: dict[int, float] = {}
        for item in data.get("results", []):
            score_map[item["index"]] = item["relevance_score"]

        for i, c in enumerate(candidates):
            c.score = score_map.get(i, 0.0)

        reranked = sorted(candidates, key=lambda x: x.score, reverse=True)
        return reranked[:top_k]
