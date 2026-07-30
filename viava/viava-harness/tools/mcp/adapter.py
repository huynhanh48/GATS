from __future__ import annotations

import logging
import re
from typing import Any, Type

from pydantic import create_model

from capabilities.mcp.manager import MCPManager
from capabilities.mcp.models import MCPToolInfo
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)

_JSON_TYPE_MAP: dict[str, type] = {
    "string": str, "integer": int, "number": float,
    "boolean": bool, "array": list, "object": dict,
}


def _sanitize_tool_segment(value: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9_]", "_", value)
    if not sanitized:
        return "tool"
    if not sanitized[0].isalpha():
        return f"mcp_{sanitized}"
    return sanitized


def _input_model_from_schema(tool_name: str, schema: dict[str, object]) -> type:
    properties = schema.get("properties", {})
    if not isinstance(properties, dict):
        return create_model(tool_name)
    field_defs: dict[str, tuple] = {}
    required_set: set[str] = (
        set(schema.get("required", []))
        if isinstance(schema.get("required", []), list)
        else set()
    )
    for key in properties:
        prop = properties[key] if isinstance(properties[key], dict) else {}
        py_type = _JSON_TYPE_MAP.get(str(prop.get("type", "")), str)
        clean_key = key.replace("-", "_")
        if key not in required_set:
            field_defs[clean_key] = (py_type | None, None)
        else:
            field_defs[clean_key] = (py_type, ...)
    safe_name = tool_name.replace("-", "_").replace(" ", "_")
    return create_model(safe_name, **field_defs)


class MCPToolAdapter(ToolBase[Any]):
    name = ""
    toolset = "mcp"
    description = ""

    def __init__(self, manager: MCPManager, tool_info: MCPToolInfo) -> None:
        self._manager = manager
        self._tool_info = tool_info
        server_segment = _sanitize_tool_segment(tool_info.server_name)
        tool_segment = _sanitize_tool_segment(tool_info.name)
        self._name = f"mcp__{server_segment}__{tool_segment}"
        self._description = tool_info.description or f"MCP tool {tool_info.name}"
        self._args_cls = _input_model_from_schema(self._name, tool_info.input_schema)

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description

    def is_available(self) -> bool:
        return self._manager is not None

    def get_args_tool(self) -> Type[Any]:
        return self._args_cls

    async def execute(self, context: ToolContext, args: Any) -> ToolResult:
        try:
            output = await self._manager.call_tool(
                self._tool_info.server_name, self._tool_info.name, args.model_dump(),
            )
            return ToolResult(success=True, result=output)
        except Exception as e:
            logger.exception("MCP tool %s failed", self._name)
            return ToolResult(success=False, result=str(e), error=str(e))
