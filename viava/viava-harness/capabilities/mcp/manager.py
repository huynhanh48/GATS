from __future__ import annotations

from typing import Dict, List

from .base import MCPGateway
from .models import (
    MCPConnectionStatus,
    MCPResourceInfo,
    MCPResourceTemplate,
    MCPToolInfo,
)


class MCPManager:
    """Aggregate multiple MCPGateway instances. Tools inject this."""

    def __init__(self) -> None:
        self._clients: Dict[str, MCPGateway] = {}

    async def connect_server(self, name: str, client: MCPGateway) -> None:
        """Connect a single server and register it."""
        await client.connect()
        self._clients[name] = client

    async def disconnect_all(self) -> None:
        """Disconnect all registered servers."""
        for client in list(self._clients.values()):
            await client.disconnect()
        self._clients.clear()

    def list_statuses(self) -> List[MCPConnectionStatus]:
        return [c.get_status() for c in self._clients.values()]

    def list_tools(self) -> List[MCPToolInfo]:
        result: List[MCPToolInfo] = []
        for server_name, client in self._clients.items():
            for tool in client.list_tools():
                result.append(MCPToolInfo(
                    server_name=server_name,
                    name=tool.name,
                    description=tool.description,
                    input_schema=tool.input_schema,
                ))
        return result

    async def call_tool(
        self, server_name: str, tool_name: str, arguments: Dict[str, object]
    ) -> str:
        client = self._clients.get(server_name)
        if client is None:
            raise ValueError(f"MCP server '{server_name}' is not connected")
        return await client.call_tool(tool_name, arguments)

    def list_resources(self) -> List[MCPResourceInfo]:
        result: List[MCPResourceInfo] = []
        for server_name, client in self._clients.items():
            for res in client.list_resources():
                result.append(MCPResourceInfo(
                    server_name=server_name,
                    name=res.name,
                    uri=res.uri,
                    description=res.description,
                ))
        return result

    async def read_resource(self, server_name: str, uri: str) -> str:
        client = self._clients.get(server_name)
        if client is None:
            raise ValueError(f"MCP server '{server_name}' is not connected")
        return await client.read_resource(uri)

    def list_resource_templates(self) -> List[MCPResourceTemplate]:
        result: List[MCPResourceTemplate] = []
        for server_name, client in self._clients.items():
            for tmpl in client.list_resource_templates():
                result.append(MCPResourceTemplate(
                    server_name=server_name,
                    uri_template=tmpl.uri_template,
                    name=tmpl.name,
                    description=tmpl.description,
                ))
        return result
