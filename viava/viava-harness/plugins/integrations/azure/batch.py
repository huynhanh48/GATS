from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional

from core.llm import LLMInput, LLMOutput, LLMMessage, FinishReason

from .client import AzureOpenAIClient
from .llm import AzureOpenAILLM

logger = logging.getLogger(__name__)


class AzureBatchProcessor:
    """Xử lý Azure OpenAI Batch API — upload JSONL, submit, poll, download.

    Dùng cho batch lớn (>50 requests). Batch nhỏ nên dùng asyncio.gather trực tiếp.
    """

    def __init__(
        self,
        client: AzureOpenAIClient,
        *,
        poll_interval: float = 30.0,
        max_wait: float = 86400.0,
    ):
        self._client = client
        self._poll_interval = poll_interval
        self._max_wait = max_wait
        self._llm = AzureOpenAILLM(client, cache_path=None)

    async def process(
        self,
        inputs: list[LLMInput],
        *,
        max_per_batch: int = 50000,
    ) -> list[LLMOutput]:
        if not inputs:
            return []

        chunks = [
            inputs[i:i + max_per_batch]
            for i in range(0, len(inputs), max_per_batch)
        ]

        all_results: list[LLMOutput | None] = [None] * len(inputs)

        async def _process_chunk(chunk_index: int, chunk: list[LLMInput]) -> list[tuple[int, LLMOutput]]:
            jsonl_bytes, ids = self._build_jsonl(chunk, start_offset=chunk_index * max_per_batch)
            batch_id, _ = await self._submit_batch(jsonl_bytes)
            output_file_id = await self._poll_batch(batch_id)
            results = await self._download_results(output_file_id)
            return list(zip(ids, results))

        tasks = [_process_chunk(i, chunk) for i, chunk in enumerate(chunks)]
        chunk_results = await asyncio.gather(*tasks)

        for pairs in chunk_results:
            for idx, output in pairs:
                all_results[idx] = output

        return [r for r in all_results if r is not None]

    def _build_jsonl(
        self, inputs: list[LLMInput], start_offset: int = 0
    ) -> tuple[bytes, list[int]]:
        ids: list[int] = []
        lines: list[str] = []

        for i, inp in enumerate(inputs):
            custom_id = str(start_offset + i)
            ids.append(start_offset + i)

            body = self._llm._build_body(inp)
            line = json.dumps({
                "custom_id": custom_id,
                "method": "POST",
                "url": "/chat/completions",
                "body": body,
            })
            lines.append(line)

        jsonl_content = "\n".join(lines) + "\n"
        return jsonl_content.encode("utf-8"), ids

    async def _submit_batch(self, jsonl_bytes: bytes) -> tuple[str, list[int]]:
        resp = await self._client._http.post(
            f"{self._client._azure_endpoint}/openai/files"
            f"?api-version={self._client._api_version}",
            headers={"api-key": self._client._api_key},
            files={"file": ("batch.jsonl", jsonl_bytes, "application/jsonl")},
            data={"purpose": "batch"},
        )
        if not resp.is_success:
            self._client._raise_for_status(resp)
        file_data = resp.json()
        input_file_id = file_data["id"]

        batch_resp = await self._client.create_batch({
            "input_file_id": input_file_id,
            "endpoint": "/chat/completions",
            "completion_window": "24h",
        })
        return batch_resp["id"], []

    async def _poll_batch(self, batch_id: str) -> str:
        elapsed = 0.0
        while elapsed < self._max_wait:
            data = await self._client.get_batch(batch_id)
            status = data.get("status")

            if status == "completed":
                output_file_id = data.get("output_file_id")
                if not output_file_id:
                    raise RuntimeError(f"Batch {batch_id} completed but has no output_file_id")
                return output_file_id

            if status in ("failed", "expired", "cancelled"):
                errors = data.get("errors") or {}
                raise RuntimeError(
                    f"Batch {batch_id} failed with status={status}: {errors}"
                )

            await asyncio.sleep(self._poll_interval)
            elapsed += self._poll_interval

        raise TimeoutError(f"Batch {batch_id} did not complete within {self._max_wait}s")

    async def _download_results(self, output_file_id: str) -> list[LLMOutput]:
        content = await self._client.download_batch_output(output_file_id)
        outputs: list[LLMOutput] = []

        for line in content.strip().split("\n"):
            if not line.strip():
                continue
            try:
                entry = json.loads(line)
                response_body = entry.get("response", {}).get("body", {})
                status_code = entry.get("response", {}).get("status_code", 200)

                if status_code != 200:
                    outputs.append(LLMOutput(content=None, finish_reason=FinishReason.ERROR))
                    continue

                raw_usage = response_body.get("usage") or {}
                details = raw_usage.get("prompt_tokens_details") or {}
                usage = {
                    "prompt_tokens": raw_usage.get("prompt_tokens", 0),
                    "completion_tokens": raw_usage.get("completion_tokens", 0),
                    "total_tokens": raw_usage.get("total_tokens", 0),
                    "cached_tokens": details.get("cached_tokens", 0),
                } if raw_usage else None

                choice = (response_body.get("choices") or [{}])[0]
                message = choice.get("message", {})
                content = message.get("content")

                finish_reason = FinishReason(choice.get("finish_reason", "stop"))

                outputs.append(LLMOutput(
                    content=content,
                    finish_reason=finish_reason,
                    usage=usage,
                ))
            except Exception:
                logger.warning("Failed to parse batch output line", exc_info=True)
                outputs.append(LLMOutput(content=None, finish_reason=FinishReason.ERROR))

        return outputs
