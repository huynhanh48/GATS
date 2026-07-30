from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, List

from .models import (
    MCPConnectionStatus,
    MCPResourceInfo,
    MCPResourceTemplate,
    MCPToolInfo,
)


class MCPGateway(ABC):
    """Capability ABC for a single MCP server. Integrations implement this directly."""

    @abstractmethod
    async def connect(self) -> None:
        """Connect to the MCP server and discover tools/resources."""

    @abstractmethod
    async def disconnect(self) -> None:
        """Close the connection."""

    @abstractmethod
    def get_status(self) -> MCPConnectionStatus:
        """Return the current connection status."""

    @abstractmethod
    def list_tools(self) -> List[MCPToolInfo]:
        """List tools available on this server."""

    @abstractmethod
    async def call_tool(self, tool_name: str, arguments: Dict[str, object]) -> str:
        """Call a tool on this server and return stringified output."""

    @abstractmethod
    def list_resources(self) -> List[MCPResourceInfo]:
        """List resources available on this server."""

    @abstractmethod
    async def read_resource(self, uri: str) -> str:
        """Read a resource from this server and return stringified content."""

    @abstractmethod
    def list_resource_templates(self) -> List[MCPResourceTemplate]:
        """List resource templates available on this server."""
