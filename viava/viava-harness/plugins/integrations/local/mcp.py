from __future__ import annotations

import asyncio
import contextlib
from contextlib import AsyncExitStack
from typing import Any, Dict, List

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.types import CallToolResult, ReadResourceResult

from capabilities.mcp.base import MCPGateway
from capabilities.mcp.models import (
    MCPConnectionStatus,
    MCPResourceInfo,
    MCPResourceTemplate,
    MCPToolInfo,
    McpStdioServerConfig,
)


class LocalMCPClient(MCPGateway):
    """Connect to one MCP server via stdio subprocess."""

    def __init__(self, name: str, config: McpStdioServerConfig) -> None:
        self._name = name
        self._config = config
        self._session: ClientSession | None = None
        self._stack: AsyncExitStack | None = None
        self._tools: List[MCPToolInfo] = []
        self._resources: List[MCPResourceInfo] = []
        self._templates: List[MCPResourceTemplate] = []
        self._state: str = "pending"
        self._detail: str = ""

    async def connect(self) -> None:
        stack = AsyncExitStack()
        try:
            read_stream, write_stream = await stack.enter_async_context(
                stdio_client(
                    StdioServerParameters(
                        command=self._config.command,
                        args=self._config.args,
                        env=self._config.env,
                        cwd=self._config.cwd,
                    )
                )
            )
            await self._register_session(stack, read_stream, write_stream)
        except asyncio.CancelledError as exc:
            await self._close_stack(stack)
            self._mark_failed(str(exc) or "cancelled")
            raise
        except Exception as exc:
            await self._close_stack(stack)
            self._mark_failed(str(exc) or exc.__class__.__name__)
            raise

    async def disconnect(self) -> None:
            if self._stack is not None:
                with contextlib.suppress(asyncio.CancelledError, RuntimeError, BaseExceptionGroup):
                    try:
                        await self._stack.aclose()
                    except Exception:
                        pass
            self._session = None
            self._stack = None
            self._tools.clear()
            self._resources.clear()
            self._templates.clear()
            self._state = "pending"

    def get_status(self) -> MCPConnectionStatus:
        return MCPConnectionStatus(
            name=self._name,
            state=self._state,
            detail=self._detail,
            transport="stdio",
            auth_configured=bool(self._config.env),
            tools=list(self._tools),
            resources=list(self._resources),
        )

    def list_tools(self) -> List[MCPToolInfo]:
        return list(self._tools)

    async def call_tool(self, tool_name: str, arguments: Dict[str, object]) -> str:
        if self._session is None:
            raise RuntimeError(f"MCP server '{self._name}' is not connected")
        try:
            result: CallToolResult = await self._session.call_tool(tool_name, arguments)
        except Exception as exc:
            raise RuntimeError(
                f"MCP server '{self._name}' call failed: {exc}"
            ) from exc

        parts: List[str] = []
        for item in result.content:
            if getattr(item, "type", None) == "text":
                parts.append(getattr(item, "text", ""))
            else:
                parts.append(item.model_dump_json())
        if result.structuredContent and not parts:
            parts.append(str(result.structuredContent))
        if not parts:
            parts.append("(no output)")
        return "\n".join(parts).strip()

    def list_resources(self) -> List[MCPResourceInfo]:
        return list(self._resources)

    async def read_resource(self, uri: str) -> str:
        if self._session is None:
            raise RuntimeError(f"MCP server '{self._name}' is not connected")
        try:
            result: ReadResourceResult = await self._session.read_resource(uri)
        except Exception as exc:
            raise RuntimeError(
                f"MCP server '{self._name}' resource read failed: {exc}"
            ) from exc

        parts: List[str] = []
        for item in result.contents:
            text = getattr(item, "text", None)
            if text is not None:
                parts.append(text)
            else:
                parts.append(str(getattr(item, "blob", "")))
        return "\n".join(parts).strip()

    def list_resource_templates(self) -> List[MCPResourceTemplate]:
        return list(self._templates)

    async def _register_session(
        self, stack: AsyncExitStack, read_stream: Any, write_stream: Any
    ) -> None:
        session = await stack.enter_async_context(
            ClientSession(read_stream, write_stream)
        )
        await session.initialize()

        tool_result = await session.list_tools()
        self._tools = [
            MCPToolInfo(
                server_name=self._name,
                name=tool.name,
                description=tool.description or "",
                input_schema=dict(
                    tool.inputSchema or {"type": "object", "properties": {}}
                ),
            )
            for tool in tool_result.tools
        ]

        self._resources = []
        try:
            resource_result = await session.list_resources()
            self._resources = [
                MCPResourceInfo(
                    server_name=self._name,
                    name=resource.name or str(resource.uri),
                    uri=str(resource.uri),
                    description=resource.description or "",
                )
                for resource in resource_result.resources
            ]
        except Exception:
            pass

        self._templates = []
        try:
            template_result = await session.list_resource_templates()
            self._templates = [
                MCPResourceTemplate(
                    server_name=self._name,
                    uri_template=str(
                        getattr(t, "uriTemplate", getattr(t, "uri_template", ""))
                    ),
                    name=t.name,
                    description=getattr(t, "description", "") or "",
                )
                for t in getattr(template_result, "resourceTemplates", [])
            ]
        except Exception:
            pass

        self._session = session
        self._stack = stack
        self._state = "connected"
        self._detail = ""

    def _mark_failed(self, detail: str) -> None:
        self._state = "failed"
        self._detail = detail
        self._tools.clear()
        self._resources.clear()
        self._session = None
        self._stack = None

    @staticmethod
    async def _close_stack(stack: AsyncExitStack) -> None:
        try:
            await stack.aclose()
        except BaseException:
            pass
