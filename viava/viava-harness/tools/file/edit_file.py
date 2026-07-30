from __future__ import annotations

import difflib
import logging
from typing import Type

from pydantic import BaseModel

from capabilities.file_system import FileSystem
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class LineEdit(BaseModel):
    start_line: int
    end_line: int | None = None
    new_content: str = ""


class EditFileArgs(BaseModel):
    filename: str
    edits: list[LineEdit]


class EditFileTool(ToolBase[EditFileArgs]):
    name = "edit_file"
    toolset = "file"
    description = "Sửa các dòng cụ thể trong một file"

    def __init__(self, file_system: FileSystem) -> None:
        self._file_system = file_system

    def is_available(self) -> bool:
        return self._file_system is not None

    def get_args_tool(self) -> Type[EditFileArgs]:
        return EditFileArgs

    async def execute(self, context: ToolContext, args: EditFileArgs) -> ToolResult:
        if not args.edits:
            return ToolResult(success=True, result="Không có thay đổi nào được cung cấp.")

        normalized_edits: list[LineEdit] = []
        for item in args.edits:
            if isinstance(item, dict):
                normalized_edits.append(LineEdit(**item))
            else:
                normalized_edits.append(item)

        try:
            original_content = await self._file_system.read_file(args.filename, context)
        except Exception as exc:
            logger.exception("edit_file đọc file thất bại")
            return ToolResult(success=False, result=str(exc), error=str(exc))

        lines = original_content.splitlines(keepends=True)

        for edit in sorted(normalized_edits, key=lambda e: e.start_line, reverse=True):
            start_line = edit.start_line
            end_line = edit.end_line if edit.end_line is not None else edit.start_line

            if start_line < 1:
                return ToolResult(success=False, result=f"start_line {start_line} phải >= 1")

            if end_line < start_line - 1:
                return ToolResult(success=False, result="end_line phải >= start_line - 1")

            if start_line > len(lines) + 1:
                return ToolResult(success=False, result=f"start_line {start_line} vượt quá cuối file (len={len(lines)})")

            start_index = start_line - 1
            end_index = end_line if end_line <= len(lines) else len(lines)
            replacement_lines = edit.new_content.splitlines(keepends=True)
            lines[start_index:end_index] = replacement_lines

        new_content = "".join(lines)

        if new_content == original_content:
            return ToolResult(success=True, result=f"Không có thay đổi nào ở '{args.filename}' (nội dung đã cập nhật).")

        try:
            await self._file_system.write_file(args.filename, new_content, context, overwrite=True)
        except Exception as exc:
            logger.exception("edit_file ghi file thất bại")
            return ToolResult(success=False, result=str(exc), error=str(exc))

        diff_lines = list(
            difflib.unified_diff(
                original_content.splitlines(),
                new_content.splitlines(),
                fromfile=f"a/{args.filename}",
                tofile=f"b/{args.filename}",
                lineterm="",
            )
        )
        diff_text = "\n".join(diff_lines) if diff_lines else "(Không có diff nào)"
        return ToolResult(success=True, result=f"Đã cập nhật '{args.filename}' với {len(args.edits)} edit(s).\n{diff_text}")
