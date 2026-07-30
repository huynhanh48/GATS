from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.web_search import WebSearchBase
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class WebSearchArgs(BaseModel):
    query: str
    max_results: int = 5
    include_domains: list[str] | None = None
    exclude_domains: list[str] | None = None


class WebSearchTool(ToolBase[WebSearchArgs]):
    name = "web_search"
    toolset = "web"
    description = "Tìm kiếm thông tin trên web. Hỗ trợ lọc theo domain include/exclude."
    emoji = "\U0001f50d"

    def __init__(self, backend: WebSearchBase) -> None:
        self._backend = backend

    def is_available(self) -> bool:
        return self._backend is not None

    def get_args_tool(self) -> Type[WebSearchArgs]:
        return WebSearchArgs

    async def execute(self, context: ToolContext, args: WebSearchArgs) -> ToolResult:
        try:
            result = await self._backend.search(
                query=args.query,
                max_results=args.max_results,
                include_domains=args.include_domains,
                exclude_domains=args.exclude_domains,
            )
            if not result.items:
                return ToolResult(success=True, result="Không tìm thấy kết quả nào.")

            lines = [f"Kết quả tìm kiếm cho '{args.query}':\n"]
            for i, item in enumerate(result.items, 1):
                lines.append(f"{i}. {item.title}")
                lines.append(f"   URL: {item.url}")
                lines.append(f"   {item.snippet}\n")

            return ToolResult(success=True, result="\n".join(lines))
        except Exception as e:
            logger.exception("web_search failed")
            return ToolResult(success=False, result=str(e), error=str(e))
