from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.file_system import FileSystem
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)

FILENAME_MATCH_SNIPPET = "[filename match]"


class SearchFilesArgs(BaseModel):
    query: str
    include_content: bool = True
    max_results: int = 20


class SearchFilesTool(ToolBase[SearchFilesArgs]):
    name = "search_files"
    toolset = "file"
    description = "Tìm kiếm file theo tên hoặc nội dung"

    def __init__(self, file_system: FileSystem) -> None:
        self._file_system = file_system

    def is_available(self) -> bool:
        return self._file_system is not None

    def get_args_tool(self) -> Type[SearchFilesArgs]:
        return SearchFilesArgs

    async def execute(self, context: ToolContext, args: SearchFilesArgs) -> ToolResult:
        try:
            matches = await self._file_system.search_file(
                args.query, context,
                max_result=args.max_results,
                include_content=args.include_content,
            )
        except Exception as exc:
            logger.exception("search_files thất bại")
            return ToolResult(success=False, result=str(exc), error=str(exc))

        if not matches:
            return ToolResult(success=True, result=f"Không tìm thấy kết quả nào cho '{args.query}'.")

        lines: list[str] = []
        for match in matches:
            snippet = match.snippet
            if snippet == FILENAME_MATCH_SNIPPET:
                snippet_text = "(trùng tên file)"
            elif snippet:
                snippet_text = snippet
            else:
                snippet_text = ""
            if snippet_text and len(snippet_text) > 200:
                snippet_text = f"{snippet_text[:197]}..."
            if snippet_text:
                lines.append(f"- {match.path}: {snippet_text}")
            else:
                lines.append(f"- {match.path}")

        summary = f"Tìm thấy {len(matches)} kết quả cho '{args.query}' (tối đa {args.max_results})."
        return ToolResult(success=True, result=f"{summary}\n" + "\n".join(lines))
