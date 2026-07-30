from typing import Any, Dict, List
from pydantic import BaseModel, Field
from core.user import User


class ToolCall(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any]


class ToolContext(BaseModel):
    user: User
    conv_id: str
    request_id: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ToolResult(BaseModel):
    result: str
    success: bool
    error: str | None = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    access_groups: List[str] = Field(default_factory=list)


class ToolRejection(BaseModel):
    reason: str

class ToolEntry(BaseModel):
    class Config:
        arbitrary_types_allowed = True

    tool: Any
    toolset: str
    definition: ToolDefinition
    is_available: bool
    requires_env: list[str] = Field(default_factory=list)
    max_result_chars: int = 100_000
