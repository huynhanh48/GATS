from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.file_system import FileSystem
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class WriteFileArgs(BaseModel):
    filename: str
    content: str
    overwrite: bool = False


class WriteFileTool(ToolBase[WriteFileArgs]):
    name = "write_file"
    toolset = "file"
    description = "Ghi nội dung vào một file"

    def __init__(self, file_system: FileSystem) -> None:
        self._file_system = file_system

    def is_available(self) -> bool:
        return self._file_system is not None

    def get_args_tool(self) -> Type[WriteFileArgs]:
        return WriteFileArgs

    async def execute(self, context: ToolContext, args: WriteFileArgs) -> ToolResult:
        try:
            await self._file_system.write_file(args.filename, args.content, context, args.overwrite)
            return ToolResult(success=True, result=f"Đã ghi {len(args.content)} ký tự vào '{args.filename}'")
        except Exception as e:
            logger.exception("write_file thất bại")
            return ToolResult(success=False, result=str(e), error=str(e))
