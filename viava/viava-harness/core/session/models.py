from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum
from typing import Literal
from pydantic import BaseModel, Field

from core.tool import ToolCall


class EndReason(StrEnum):
    COMPRESSION = "compression"
    BRANCHED = "branched"
    AGENT_CLOSE = "agent_close"
    ERROR = "error"
    USER_QUIT = "user_quit"


class Message(BaseModel):
    session_id: str
    role: Literal["system", "user", "assistant", "tool"]
    content: str | None = None
    model: str | None = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    tool_calls: list[ToolCall] | None = None
    tool_call_id: str | None = None
    token_count: int | None = None
    finish_reason: str | None = None
    reasoning_content: str | None = None


class Session(BaseModel):
    id: str
    cwd: str
    user_id: str
    model: str | None = None
    system_prompt: str | None = None
    parent_session_id: str | None = None
    end_reason: EndReason | None = None
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: datetime | None = None
    title: str = "New Session"
    message_count: int = 0
    tool_call_count: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0
    reasoning_tokens: int = 0
    model_config_data: dict = Field(default_factory=dict, alias="model_config")


class TokenCounts(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0
    reasoning_tokens: int = 0


class SessionSummary(BaseModel):
    session_id: str
    title: str
    model: str | None
    message_count: int
    started_at: datetime
    ended_at: datetime | None
    end_reason: EndReason | None
    input_tokens: int
    output_tokens: int


class SearchResult(BaseModel):
    session_id: str
    message: Message
    rank: float
