from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.mcp.manager import MCPManager
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class ListMcpResourcesArgs(BaseModel):
    server: str | None = None


class ListMcpResourcesTool(ToolBase[ListMcpResourcesArgs]):
    name = "list_mcp_resources"
    toolset = "mcp"
    description = (
        "List MCP resources discovered from connected servers. "
        "Optionally filter by server name."
    )

    def __init__(self, manager: MCPManager) -> None:
        self._manager = manager

    def is_available(self) -> bool:
        return self._manager is not None

    def get_args_tool(self) -> Type[ListMcpResourcesArgs]:
        return ListMcpResourcesArgs

    async def execute(self, context: ToolContext, args: ListMcpResourcesArgs) -> ToolResult:
        try:
            resources = self._manager.list_resources()
            if args.server:
                resources = [r for r in resources if r.server_name == args.server]
            if not resources:
                return ToolResult(success=True, result="(no MCP resources)")
            lines = [f"{r.server_name}:{r.uri} {r.description}".strip() for r in resources]
            return ToolResult(success=True, result="\n".join(lines))
        except Exception as e:
            logger.exception("list_mcp_resources failed")
            return ToolResult(success=False, result=str(e), error=str(e))
