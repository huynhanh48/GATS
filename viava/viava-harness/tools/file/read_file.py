from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.file_system import FileSystem
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class ReadFileArgs(BaseModel):
    filename: str


class ReadFileTool(ToolBase[ReadFileArgs]):
    name = "read_file"
    toolset = "file"
    description = "Đọc nội dung của một file"

    def __init__(self, file_system: FileSystem) -> None:
        self._file_system = file_system

    def is_available(self) -> bool:
        return self._file_system is not None
    
    # đang thiếu def toolset(self) -> str:

    def get_args_tool(self) -> Type[ReadFileArgs]:
        return ReadFileArgs

    async def execute(self, context: ToolContext, args: ReadFileArgs) -> ToolResult:
        try:
            content = await self._file_system.read_file(args.filename, context)
            return ToolResult(success=True, result=f"Nội dung của '{args.filename}':\n\n{content}")
        except Exception as e:
            logger.exception("read_file thất bại")
            return ToolResult(success=False, result=str(e), error=str(e))
