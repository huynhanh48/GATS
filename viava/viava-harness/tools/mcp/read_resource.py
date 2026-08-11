from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.mcp.manager import MCPManager
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class ReadMcpResourceArgs(BaseModel):
    server: str
    uri: str


class ReadMcpResourceTool(ToolBase[ReadMcpResourceArgs]):
    name = "read_mcp_resource"
    toolset = "mcp"
    description = "Read an MCP resource by server name and URI."

    def __init__(self, manager: MCPManager) -> None:
        self._manager = manager

    def is_available(self) -> bool:
        return self._manager is not None

    def get_args_tool(self) -> Type[ReadMcpResourceArgs]:
        return ReadMcpResourceArgs

    async def execute(self, context: ToolContext, args: ReadMcpResourceArgs) -> ToolResult:
        try:
            output = await self._manager.read_resource(args.server, args.uri)
            return ToolResult(success=True, result=output)
        except Exception as e:
            logger.exception("read_mcp_resource failed")
            return ToolResult(success=False, result=str(e), error=str(e))
