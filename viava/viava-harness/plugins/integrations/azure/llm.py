from __future__ import annotations

import hashlib
import json
import time
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import aiosqlite

from core.llm import (
    BaseLLM,
    FinishReason,
    LLMInput,
    LLMOutput,
    LlmStreamChunk,
    LLMInvalidResponseError,
)
from core.tool import ToolCall, ToolDefinition
from utils.paths import get_data_dir

from .client import AzureOpenAIClient


REASONING_MODELS: Set[str] = {
    "o1", "o1-mini", "o1-preview", "o3-mini",
    "gpt-5", "gpt-5-mini", "gpt-5-nano",
    "gpt-5-pro", "gpt-5-codex",
}


class AzureOpenAILLM(BaseLLM):
    def __init__(
        self,
        client: AzureOpenAIClient,
        cache_path: str | Path | None = None,
    ):
        self._client = client
        deployment_lower = client._deployment.lower()
        self._is_reasoning = any(
            m in deployment_lower for m in REASONING_MODELS
        )
        self._cache_path = (
            Path(cache_path)
            if cache_path
            else get_data_dir() / "azure_llm_cache.db"
        )
        self._conn: aiosqlite.Connection | None = None

    async def _cache_conn(self) -> aiosqlite.Connection:
        if self._conn is None:
            self._conn = await aiosqlite.connect(str(self._cache_path))
            self._conn.row_factory = aiosqlite.Row
            await self._conn.execute("PRAGMA journal_mode=WAL")
            await self._conn.execute(
                "CREATE TABLE IF NOT EXISTS cache ("
                "  key TEXT PRIMARY KEY,"
                "  value TEXT NOT NULL,"
                "  created_at REAL NOT NULL"
                ")"
            )
            await self._conn.commit()
        return self._conn

    def _cache_key(self, body: dict) -> str:
        return hashlib.sha256(
            json.dumps(body, sort_keys=True, default=str).encode("utf-8")
        ).hexdigest()

    async def _cache_get(self, key: str) -> dict | None:
        conn = await self._cache_conn()
        cursor = await conn.execute("SELECT value FROM cache WHERE key = ?", (key,))
        row = await cursor.fetchone()
        if row:
            return json.loads(row["value"])
        return None

    async def _cache_set(self, key: str, value: dict) -> None:
        conn = await self._cache_conn()
        await conn.execute(
            "INSERT OR REPLACE INTO cache (key, value, created_at) VALUES (?, ?, ?)",
            (key, json.dumps(value), time.time()),
        )
        await conn.commit()

    async def close(self) -> None:
        if self._conn is not None:
            await self._conn.close()
            self._conn = None
        await self._client.close()

    async def chat(self, input: LLMInput) -> LLMOutput:
        body = self._build_body(input)
        cache_key = self._cache_key(body)
        cached = await self._cache_get(cache_key)
        if cached is not None:
            return self._parse_response(cached, input)
        data = await self._client.chat_completion(body)
        await self._cache_set(cache_key, data)
        return self._parse_response(data, input)

    async def chat_stream(
        self, input: LLMInput
    ) -> AsyncIterator[LlmStreamChunk]:
        body = self._build_body(input)
        body["stream_options"] = {"include_usage": True}
        tc_builders: Dict[int, Dict[str, Optional[str]]] = {}
        last_finish: Optional[str] = None
        last_usage: Optional[Dict[str, int]] = None

        async for chunk in self._client.chat_completion_stream(body):
            parsed = self._parse_chunk(chunk, tc_builders)
            if parsed is not None:
                if parsed.finish_reason:
                    last_finish = parsed.finish_reason
                if parsed.usage:
                    last_usage = parsed.usage
                yield parsed

        final_calls = self._finalize_tool_calls(tc_builders)
        if final_calls:
            yield LlmStreamChunk(tool_calls=final_calls, finish_reason=last_finish, usage=last_usage)
        elif last_finish:
            yield LlmStreamChunk(finish_reason=last_finish, usage=last_usage)

    async def validate_tools(self, tools: List[Any]) -> List[str]:
        errors: List[str] = []
        for t in tools:
            name = getattr(t, "name", None)
            if not name or len(name) > 64:
                errors.append(f"Invalid tool name: {name!r}")
        return errors

    def _build_body(self, input: LLMInput) -> Dict[str, Any]:
        body: Dict[str, Any] = {
            "messages": self._serialize_messages(input),
        }

        if not self._is_reasoning:
            body["temperature"] = input.temperature

        if input.max_tokens is not None:
            body["max_tokens"] = input.max_tokens

        if input.tools:
            body["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": t.name,
                        "description": t.description,
                        "parameters": t.parameters,
                    },
                }
                for t in input.tools
            ]
            body["tool_choice"] = "auto"

        if input.output_parser is not None and not input.tools:
            schema = input.output_parser.model_json_schema()

            def _make_strict(s: dict) -> None:
                if s.get("type") != "object":
                    return
                s["additionalProperties"] = False
                if "properties" in s:
                    s["required"] = list(s["properties"].keys())
                for v in s.get("properties", {}).values():
                    if isinstance(v, dict):
                        if "$ref" in v:
                            ref_key = v["$ref"].split("/")[-1]
                            ref_schema = schema.get("$defs", {}).get(ref_key)
                            if ref_schema:
                                _make_strict(ref_schema)
                        for k in ("items", "additionalProperties", "prefixItems"):
                            if k in v:
                                _make_strict(v[k])

            _make_strict(schema)
            for def_schema in schema.get("$defs", {}).values():
                _make_strict(def_schema)

            body["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": input.output_parser.__class__.__name__,
                    "schema": schema,
                    "strict": True,
                },
            }

        return body

    def _serialize_messages(self, input: LLMInput) -> List[Dict[str, Any]]:
        messages: List[Dict[str, Any]] = []

        if input.system_prompt:
            messages.append({"role": "system", "content": input.system_prompt})

        for m in input.messages:
            msg: Dict[str, Any] = {"role": m.role, "content": m.content}
            if m.role == "tool" and m.tool_call_id:
                msg["tool_call_id"] = m.tool_call_id
            elif m.role == "assistant" and m.tool_calls:
                msg["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.name,
                            "arguments": json.dumps(tc.arguments),
                        },
                    }
                    for tc in m.tool_calls
                ]
            messages.append(msg)

        return messages

    def _parse_response(
        self, data: Dict[str, Any], input: LLMInput
    ) -> LLMOutput:
        try:
            choice = data["choices"][0]
            message = choice.get("message", {})
            content: Optional[str] = message.get("content")

            finish_reason = FinishReason(choice.get("finish_reason", "stop"))

            raw_usage = data.get("usage") or {}
            details = raw_usage.get("prompt_tokens_details") or {}
            usage: Optional[Dict[str, int]] = {
                "prompt_tokens": raw_usage.get("prompt_tokens", 0),
                "completion_tokens": raw_usage.get("completion_tokens", 0),
                "total_tokens": raw_usage.get("total_tokens", 0),
                "cached_tokens": details.get("cached_tokens", 0),
            } if raw_usage else None

            tool_calls_raw = message.get("tool_calls")
            tool_calls: Optional[List[ToolCall]] = None
            if tool_calls_raw:
                tool_calls = [
                    ToolCall(
                        id=tc["id"],
                        name=tc["function"]["name"],
                        arguments=json.loads(tc["function"]["arguments"]),
                    )
                    for tc in tool_calls_raw
                ]

            if input.output_parser is not None and content:
                try:
                    parsed = input.output_parser.model_validate_json(content)
                    return LLMOutput(
                        content=parsed,
                        tool_calls=tool_calls,
                        finish_reason=finish_reason,
                        usage=usage,
                    )
                except Exception:
                    pass

            return LLMOutput(
                content=content,
                tool_calls=tool_calls,
                finish_reason=finish_reason,
                usage=usage,
            )
        except (KeyError, IndexError, ValueError, json.JSONDecodeError) as e:
            raise LLMInvalidResponseError(
                f"Failed to parse response: {e}", cause=e
            )

    def _parse_chunk(
        self,
        data: Dict[str, Any],
        tc_builders: Dict[int, Dict[str, Optional[str]]],
    ) -> Optional[LlmStreamChunk]:
        try:
            raw_usage = data.get("usage")
            choices = data.get("choices", [])
            if not choices:
                if raw_usage:
                    details = raw_usage.get("prompt_tokens_details") or {}
                    usage = {
                        "prompt_tokens": raw_usage.get("prompt_tokens", 0),
                        "completion_tokens": raw_usage.get("completion_tokens", 0),
                        "total_tokens": raw_usage.get("total_tokens", 0),
                        "cached_tokens": details.get("cached_tokens", 0),
                    }
                    return LlmStreamChunk(usage=usage)
                return None
            choice = choices[0]
            delta = choice.get("delta", {})
            finish_reason: Optional[str] = choice.get("finish_reason")

            content: Optional[str] = delta.get("content")
            if content:
                return LlmStreamChunk(content=content)

            streamed_tc = delta.get("tool_calls")
            if streamed_tc:
                for tc in streamed_tc:
                    idx = tc.get("index", 0)
                    b = tc_builders.setdefault(
                        idx, {"id": None, "name": None, "arguments": ""}
                    )
                    if tc.get("id"):
                        b["id"] = tc["id"]
                    fn = tc.get("function")
                    if fn:
                        if fn.get("name"):
                            b["name"] = fn["name"]
                        if fn.get("arguments"):
                            b["arguments"] = (b["arguments"] or "") + fn["arguments"]

            if finish_reason:
                usage = None
                raw_usage = data.get("usage")
                if raw_usage:
                    details = raw_usage.get("prompt_tokens_details") or {}
                    usage = {
                        "prompt_tokens": raw_usage.get("prompt_tokens", 0),
                        "completion_tokens": raw_usage.get("completion_tokens", 0),
                        "total_tokens": raw_usage.get("total_tokens", 0),
                        "cached_tokens": details.get("cached_tokens", 0),
                    }
                return LlmStreamChunk(finish_reason=finish_reason, usage=usage)

            return None
        except (KeyError, IndexError, ValueError) as e:
            raise LLMInvalidResponseError(f"Failed to parse chunk: {e}", cause=e)

    def _finalize_tool_calls(
        self, tc_builders: Dict[int, Dict[str, Optional[str]]]
    ) -> List[ToolCall]:
        calls: List[ToolCall] = []
        for b in tc_builders.values():
            if not b.get("name"):
                continue
            args_raw = b.get("arguments") or "{}"
            try:
                loaded = json.loads(args_raw)
                args_dict: Dict[str, Any] = loaded if isinstance(loaded, dict) else {"args": loaded}
            except Exception:
                args_dict = {"_raw": args_raw}
            calls.append(ToolCall(
                id=b.get("id") or "tool_call",
                name=b["name"] or "tool",
                arguments=args_dict,
            ))
        return calls