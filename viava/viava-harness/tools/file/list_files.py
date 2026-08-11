from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.file_system import FileSystem
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class ListFilesArgs(BaseModel):
    directory: str = "."


class ListFilesTool(ToolBase[ListFilesArgs]):
    name = "list_files"
    toolset = "file"
    description = "Liệt kê các file trong một thư mục"

    def __init__(self, file_system: FileSystem) -> None:
        self._file_system = file_system

    def is_available(self) -> bool:
        return self._file_system is not None

    def get_args_tool(self) -> Type[ListFilesArgs]:
        return ListFilesArgs

    async def execute(self, context: ToolContext, args: ListFilesArgs) -> ToolResult:
        try:
            files = await self._file_system.list_files(args.directory, context)
            if not files:
                return ToolResult(success=True, result=f"Không có file nào trong thư mục '{args.directory}'")
            files_list = "\n".join(f"- {f}" for f in files)
            return ToolResult(success=True, result=f"File trong '{args.directory}':\n{files_list}")
        except Exception as e:
            logger.exception("list_files thất bại")
            return ToolResult(success=False, result=str(e), error=str(e))
