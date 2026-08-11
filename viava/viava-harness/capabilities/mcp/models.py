from typing import Literal, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class McpStdioServerConfig(BaseModel):
    command: str
    args: List[str] = Field(default_factory=list)
    env: Optional[Dict[str, str]] = None
    cwd: Optional[str] = None
    type: str = "stdio"


class McpHttpServerConfig(BaseModel):
    url: str
    headers: Dict[str, str] = Field(default_factory=dict)
    type: str = "http"


class McpWebSocketServerConfig(BaseModel):
    url: str
    headers: Dict[str, str] = Field(default_factory=dict)
    type: str = "ws"


McpServerConfig = McpStdioServerConfig | McpHttpServerConfig | McpWebSocketServerConfig


class McpJsonConfig(BaseModel):
    mcpServers: Dict[str, McpServerConfig] = Field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Dict[str, object]) -> "McpJsonConfig":
        servers: Dict[str, McpServerConfig] = {}
        for name, cfg in data.get("mcpServers", {}).items():
            if not isinstance(cfg, dict):
                continue
            type_ = cfg.get("type", "stdio")
            if type_ == "stdio":
                servers[name] = McpStdioServerConfig(**cfg)
            elif type_ == "http":
                servers[name] = McpHttpServerConfig(**cfg)
            elif type_ == "ws":
                servers[name] = McpWebSocketServerConfig(**cfg)
        return cls(mcpServers=servers)


class MCPToolInfo(BaseModel):
    model_config = ConfigDict(frozen=True)
    server_name: str
    name: str
    description: str
    input_schema: Dict[str, object]


class MCPResourceInfo(BaseModel):
    model_config = ConfigDict(frozen=True)
    server_name: str
    name: str
    uri: str
    description: str = ""


class MCPResourceTemplate(BaseModel):
    model_config = ConfigDict(frozen=True)
    server_name: str
    uri_template: str
    name: str
    description: str = ""


class MCPConnectionStatus(BaseModel):
    name: str
    state: Literal["connected", "failed", "pending", "disabled"]
    detail: str = ""
    transport: str = "unknown"
    auth_configured: bool = False
    tools: List[MCPToolInfo] = Field(default_factory=list)
    resources: List[MCPResourceInfo] = Field(default_factory=list)
