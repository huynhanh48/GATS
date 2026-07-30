from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx

from core.llm.exception import (
    LLMAuthenticationError,
    LLMBadRequestError,
    LLMConnectionError,
    LLMContextLengthError,
    LLMRateLimitError,
)


class AzureOpenAIBaseClient:
    def __init__(
        self,
        api_key: str,
        azure_endpoint: str,
        deployment: str,
        api_version: str = "2024-10-21",
        timeout: float = 60.0,
    ):
        self._api_key = api_key
        self._azure_endpoint = azure_endpoint.rstrip("/")
        self._deployment = deployment
        self._api_version = api_version
        self._http = httpx.AsyncClient(timeout=timeout)

    async def close(self) -> None:
        await self._http.aclose()

    @property
    def _path(self) -> str:
        raise NotImplementedError

    @property
    def _base_url(self) -> str:
        return (
            f"{self._azure_endpoint}/openai/deployments/{self._deployment}/{self._path}"
            f"?api-version={self._api_version}"
        )

    def _get_headers(self) -> dict:
        return {"Content-Type": "application/json", "api-key": self._api_key}

    async def _post(self, body: dict) -> dict:
        try:
            resp = await self._http.post(self._base_url, headers=self._get_headers(), json=body)
            if not resp.is_success:
                self._raise_for_status(resp)
            return resp.json()
        except httpx.HTTPStatusError as e:
            self._raise_for_status(e.response)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            raise LLMConnectionError(str(e), cause=e)

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
        if status == 400 and "context length" in body.lower():
            raise LLMContextLengthError(f"Context length exceeded: {body}")
        if 400 <= status < 500:
            raise LLMBadRequestError(f"Bad request ({status}): {body}")
        resp.raise_for_status()


class AzureOpenAIClient(AzureOpenAIBaseClient):
    @property
    def _path(self) -> str:
        return "chat/completions"

    async def chat_completion(self, body: dict) -> dict:
        return await self._post(body)

    async def chat_completion_stream(self, body: dict) -> AsyncIterator[dict]:
        body["stream"] = True
        try:
            async with self._http.stream(
                "POST", self._base_url, headers=self._get_headers(), json=body
            ) as resp:
                if not resp.is_success:
                    self._raise_for_status(resp)
                async for line in resp.aiter_lines():
                    line = line.strip()
                    if not line or line.startswith(":"):
                        continue
                    if line == "data: [DONE]":
                        return
                    if line.startswith("data: "):
                        yield json.loads(line[6:])
        except httpx.HTTPStatusError as e:
            self._raise_for_status(e.response)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            raise LLMConnectionError(str(e), cause=e)

    async def create_batch(self, body: dict) -> dict:
        """Submit a batch job. body must contain 'input_file_id', 'endpoint',
        and 'completion_window' (default '24h')."""
        return await self._post(body)

    async def get_batch(self, batch_id: str) -> dict:
        """GET a single batch's status by batch_id."""
        try:
            resp = await self._http.get(
                f"{self._azure_endpoint}/openai/batches/{batch_id}"
                f"?api-version={self._api_version}",
                headers=self._get_headers(),
            )
            if not resp.is_success:
                self._raise_for_status(resp)
            return resp.json()
        except httpx.HTTPStatusError as e:
            self._raise_for_status(e.response)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            raise LLMConnectionError(str(e), cause=e)

    async def download_batch_output(self, output_file_id: str) -> str:
        """Download batch output file content by file_id."""
        try:
            resp = await self._http.get(
                f"{self._azure_endpoint}/openai/files/{output_file_id}/content"
                f"?api-version={self._api_version}",
                headers=self._get_headers(),
            )
            if not resp.is_success:
                self._raise_for_status(resp)
            return resp.text
        except httpx.HTTPStatusError as e:
            self._raise_for_status(e.response)
        except (httpx.ConnectError, httpx.TimeoutException) as e:
            raise LLMConnectionError(str(e), cause=e)


class AzureOpenAIEmbeddingClient(AzureOpenAIBaseClient):
    @property
    def _path(self) -> str:
        return "embeddings"

    async def embed(self, body: dict) -> dict:
        return await self._post(body)
