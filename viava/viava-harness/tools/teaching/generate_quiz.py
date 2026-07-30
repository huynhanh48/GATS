"""Tool sinh quiz từ nội dung học liệu."""
from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Type

from pydantic import BaseModel, Field

from capabilities.teaching import TeachingAgentBase
from core.tool import ToolBase, ToolContext, ToolResult
from utils.paths import get_data_dir

logger = logging.getLogger(__name__)


class GenerateQuizArgs(BaseModel):
    """Tham số cho tool generate_quiz."""
    content: str = Field(description="Nội dung học liệu để sinh quiz")
    source_file: str | None = Field(default=None, description="Đường dẫn file nội dung (.md, .txt)")
    num_questions: int = Field(default=5, ge=1, le=30, description="Số lượng câu hỏi")
    quiz_type: str = Field(default="mcq", description="Loại quiz (mcq, short_answer, fill_in_blank, true_false, matching, ordering, coding)")
    output_dir: str | None = Field(default=None, description="Thư mục lưu file output (mặc định: ~/.harness-agents/data/teaching)")


class GenerateQuizTool(ToolBase[GenerateQuizArgs]):
    name = "generate_quiz"
    toolset = "teaching"
    description = (
        "Sinh quiz (bộ câu hỏi kiểm tra) từ nội dung học liệu. "
        "Hỗ trợ 7 loại câu hỏi: mcq, short_answer, fill_in_blank, true_false, matching, ordering, coding. "
        "Kết quả được tự động kiểm tra chéo với nội dung gốc để đảm bảo độ chính xác."
    )
    emoji = "\U0001f4dd"

    def __init__(self, backend: TeachingAgentBase) -> None:
        self._backend = backend

    def is_available(self) -> bool:
        return self._backend is not None

    def get_args_tool(self) -> Type[GenerateQuizArgs]:
        return GenerateQuizArgs

    async def execute(self, context: ToolContext, args: GenerateQuizArgs) -> ToolResult:
        try:
            học_liệu = args.content
            if args.source_file:
                try:
                    học_liệu = Path(args.source_file).read_text(encoding="utf-8")
                except Exception as e:
                    return ToolResult(
                        success=False,
                        result=f"Không thể đọc file: {e}",
                        error=str(e),
                    )

            suite = await self._backend.generate_quiz(
                content=học_liệu,
                num_questions=args.num_questions,
                quiz_type=args.quiz_type,
            )

            validated = await self._backend.validate_quiz(suite, học_liệu)

            output_dir = Path(args.output_dir) if args.output_dir else get_data_dir() / "teaching"
            output_dir.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = output_dir / f"quiz_{timestamp}.md"

            lines = [
                f"# {suite.quiz_title}",
                f"",
                f"**Loại quiz:** {args.quiz_type} | **Số câu:** {len(suite.questions)}",
                f"**Xác minh:** {validated.verified_count}/{validated.total_items} câu đạt yêu cầu",
                f"",
            ]
            for i, q in enumerate(suite.questions):
                lines.append(f"## Câu {i+1} ({q.question_type})")
                lines.append(f"{q.question_text}")
                if q.options:
                    for opt in q.options:
                        lines.append(f"- **{opt.key}.** {opt.value}")
                lines.append(f"")
                lines.append(f"**Đáp án:** {q.correct_answer}")
                lines.append(f"**Giải thích:** {q.explanation}")
                if validated.items and i < len(validated.items) and not validated.items[i].is_verified:
                    lines.append(f"> \u26a0\ufe0f Cần xem lại: {validated.items[i].issue}")
                lines.append(f"")

            text_lines = [
                f"**{suite.quiz_title}** \u2014 {len(suite.questions)} c\u00e2u ({args.quiz_type})",
                f"",
            ]
            for i, q in enumerate(suite.questions):
                v = validated.items[i] if validated.items and i < len(validated.items) else None
                status = "\u2705" if (v is None or v.is_verified) else "\u26a0\ufe0f"
                text_lines.append(f"{status} **Câu {i+1}:** {q.question_text[:100]}... \u2192 `{q.correct_answer}`")
            text_lines.append(f"")
            text_lines.append(f"\U0001f4c4 Đã lưu: `{filepath}`")

            filepath.write_text("\n".join(lines), encoding="utf-8")

            return ToolResult(
                success=True,
                result="\n".join(text_lines),
                metadata={
                    "saved_path": str(filepath),
                    "num_questions": len(suite.questions),
                    "quiz_type": args.quiz_type,
                    "validated": validated.model_dump(),
                },
            )
        except Exception as e:
            logger.exception("generate_quiz failed")
            return ToolResult(success=False, result=str(e), error=str(e))
