from typing import Any, Dict, List, Optional, Literal, TypeVar
from enum import StrEnum
from pydantic import BaseModel, Field
from core.tool import ToolCall, ToolDefinition
# from core.user import User

T = TypeVar("T", bound=BaseModel)


class FinishReason(StrEnum):
    STOP = "stop"
    LENGTH = "length"
    TOOL_CALLS = "tool_calls"
    CONTENT_FILTER = "content_filter"
    ERROR = "error"


class LLMMessage(BaseModel):
    role: Literal["system", "user", "assistant", "tool"]
    content: Optional[str] = None
    tool_calls: Optional[List[ToolCall]] = None
    tool_call_id: Optional[str] = None


class LLMInput(BaseModel):
    messages: List[LLMMessage]
    tools: Optional[List[ToolDefinition]]
    user_id: str
    stream: bool = True
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    output_parser: Optional[T] = None
    system_prompt: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LLMOutput(BaseModel):
    content: Optional[str | T] = None
    tool_calls: Optional[List[ToolCall]] = None
    finish_reason: Optional[FinishReason] = None
    usage: Optional[Dict[str, int]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def is_tool_call(self) -> bool:
        return self.tool_calls is not None and len(self.tool_calls) > 0


class LlmStreamChunk(BaseModel):
    content: Optional[str] = None
    tool_calls: Optional[List[ToolCall]] = None
    finish_reason: Optional[FinishReason] = None
    usage: Optional[Dict[str, int]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
