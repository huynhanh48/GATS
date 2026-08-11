from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ToolMemory(BaseModel):
    question: str
    tool_name: str
    args: Dict[str, Any]
    memory_id: Optional[str] = None
    timestamp: Optional[str] = None
    success: bool = True
    metadata: Optional[Dict[str, Any]] = None


class TextMemory(BaseModel):
    content: str
    memory_id: Optional[str] = None
    timestamp: Optional[str] = None


class ToolMemorySearchResult(BaseModel):
    memory: ToolMemory
    similarity_score: float
    rank: int


class TextMemorySearchResult(BaseModel):
    memory: TextMemory
    similarity_score: float
    rank: int


class MemoryStats(BaseModel):
    total_memories: int
    unique_tools: int
    unique_questions: int
    success_rate: float
    most_used_tools: Dict[str, int]
