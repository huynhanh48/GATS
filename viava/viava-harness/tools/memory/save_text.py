from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.agent_memory import AgentMemory
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class SaveTextMemoryArgs(BaseModel):
    content: str


class SaveTextMemoryTool(ToolBase[SaveTextMemoryArgs]):
    name = "memory_save_text"
    toolset = "memory"
    description = "Lưu một đoạn văn bản vào bộ nhớ dài hạn."

    def __init__(self, memory: AgentMemory) -> None:
        self._memory = memory

    def is_available(self) -> bool:
        return self._memory is not None

    def get_args_tool(self) -> Type[SaveTextMemoryArgs]:
        return SaveTextMemoryArgs

    async def execute(self, context: ToolContext, args: SaveTextMemoryArgs) -> ToolResult:
        try:
            text_mem = await self._memory.save_text_memory(args.content, context)
            return ToolResult(success=True, result=f"Đã lưu văn bản vào bộ nhớ (id: {text_mem.memory_id}).")
        except Exception as e:
            return ToolResult(success=False, result=str(e), error=str(e))
