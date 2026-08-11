from __future__ import annotations

import logging
from typing import Any, Type

from pydantic import BaseModel

from capabilities.agent_memory import AgentMemory
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class SaveToolUsageArgs(BaseModel):
    question: str
    tool_name: str
    args: dict[str, Any]


class SaveToolUsageTool(ToolBase[SaveToolUsageArgs]):
    name = "memory_save_tool_usage"
    toolset = "memory"
    description = "Lưu một lần sử dụng công cụ thành công vào bộ nhớ để tham khảo sau này."

    def __init__(self, memory: AgentMemory) -> None:
        self._memory = memory

    def is_available(self) -> bool:
        return self._memory is not None

    def get_args_tool(self) -> Type[SaveToolUsageArgs]:
        return SaveToolUsageArgs

    async def execute(self, context: ToolContext, args: SaveToolUsageArgs) -> ToolResult:
        try:
            await self._memory.save_tool_usage(
                question=args.question, tool_name=args.tool_name,
                args=args.args, context=context, success=True,
            )
            return ToolResult(success=True, result=f"Đã lưu cách dùng tool '{args.tool_name}' vào bộ nhớ.")
        except Exception as e:
            return ToolResult(success=False, result=str(e), error=str(e))
