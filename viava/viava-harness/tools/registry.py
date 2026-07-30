from __future__ import annotations

import logging
import time
from typing import Any

from core.tool.base import ToolBase
from core.tool.models import ToolContext, ToolDefinition, ToolEntry, ToolResult

logger = logging.getLogger(__name__)


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, ToolEntry] = {}
        self._generation: int = 0

    @property
    def generation(self) -> int:
        return self._generation

    def register(self, tool: ToolBase[Any]) -> None:
        if tool.name in self._tools:
            raise ValueError(f"Tool '{tool.name}' already registered")
        entry = ToolEntry(
            tool=tool,
            toolset=tool.toolset,
            definition=tool.get_tool_define(),
            is_available=tool.is_available(),
            requires_env=tool.requires_env(),
        )
        self._tools[tool.name] = entry
        self._generation += 1

    def deregister(self, name: str) -> bool:
        if name not in self._tools:
            return False
        del self._tools[name]
        self._generation += 1
        return True

    def get_definitions(
        self,
        tool_names: list[str] | None = None,
        skip_unavailable: bool = True,
    ) -> list[ToolDefinition]:
        defs: list[ToolDefinition] = []
        names = tool_names if tool_names is not None else list(self._tools.keys())
        for name in names:
            entry = self._tools.get(name)
            if entry is None:
                continue
            if skip_unavailable and not entry.is_available:
                continue
            defs.append(entry.definition)
        return defs

    async def dispatch(
        self, name: str, args: dict[str, Any], context: ToolContext
    ) -> ToolResult:
        entry = self._tools.get(name)
        if entry is None:
            msg = f"Tool '{name}' not found"
            return ToolResult(success=False, result=msg, error=msg)

        try:
            args_model = entry.tool.get_args_tool()(**args)
        except Exception as e:
            msg = f"Invalid arguments for tool '{name}': {e}"
            return ToolResult(success=False, result=msg, error=msg)

        try:
            start_time = time.perf_counter()
            result = await entry.tool.execute(context, args_model)
            execution_time_ms = (time.perf_counter() - start_time) * 1000
            result.metadata["execution_time_ms"] = execution_time_ms
            return result
        except Exception as e:
            logger.exception("Tool '%s' execution failed", name)
            msg = f"Tool '{name}' execution failed: {e}"
            return ToolResult(success=False, result=msg, error=msg)

    def list_tool_names(self) -> list[str]:
        return list(self._tools.keys())

    def get_toolset_for_tool(self, tool_name: str) -> str | None:
        entry = self._tools.get(tool_name)
        return entry.toolset if entry else None

    def is_tool_available(self, name: str) -> bool:
        entry = self._tools.get(name)
        return entry.is_available if entry else False


registry = ToolRegistry()
