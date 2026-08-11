from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.agent_memory import AgentMemory
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class SearchToolUsageArgs(BaseModel):
    question: str
    limit: int = 10
    similarity_threshold: float = 0.7
    tool_name_filter: str | None = None


class SearchToolUsageTool(ToolBase[SearchToolUsageArgs]):
    name = "memory_search_tool_usage"
    toolset = "memory"
    description = "Tìm kiếm các lần sử dụng công cụ tương tự trong bộ nhớ dựa trên câu hỏi."

    def __init__(self, memory: AgentMemory) -> None:
        self._memory = memory

    def is_available(self) -> bool:
        return self._memory is not None

    def get_args_tool(self) -> Type[SearchToolUsageArgs]:
        return SearchToolUsageArgs

    async def execute(self, context: ToolContext, args: SearchToolUsageArgs) -> ToolResult:
        try:
            results = await self._memory.search_similar_usage(
                question=args.question, context=context,
                limit=args.limit, similarity_threshold=args.similarity_threshold,
                tool_name_filter=args.tool_name_filter,
            )
            if not results:
                return ToolResult(success=True, result="Không tìm thấy cách dùng tool tương tự trong bộ nhớ.")
            lines = [f"Tìm thấy {len(results)} kết quả tương tự:\n"]
            for i, r in enumerate(results, 1):
                m = r.memory
                lines.append(f"{i}. {m.tool_name} (độ tương đồng: {r.similarity_score:.2f})")
                lines.append(f"   Câu hỏi: {m.question}")
                lines.append(f"   Tham số: {m.args}\n")
            logger.info("memory search: %d results", len(results))
            return ToolResult(success=True, result="\n".join(lines))
        except Exception as e:
            return ToolResult(success=False, result=str(e), error=str(e))
