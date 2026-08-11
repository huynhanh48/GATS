"""Tool sinh bài tập thực hành từ nội dung học liệu."""
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


class GenerateExerciseArgs(BaseModel):
    """Tham số cho tool generate_exercise."""
    content: str = Field(description="Nội dung học liệu để sinh bài tập")
    source_file: str | None = Field(default=None, description="Đường dẫn file nội dung (.md, .txt)")
    exercise_type: str = Field(default="practice", description="Loại bài tập (practice, challenge, project)")
    output_dir: str | None = Field(default=None, description="Thư mục lưu file output")


class GenerateExerciseTool(ToolBase[GenerateExerciseArgs]):
    name = "generate_exercise"
    toolset = "teaching"
    description = (
        "Sinh bài tập thực hành từ nội dung học liệu. "
        "Bài tập đi kèm rubric đánh giá chi tiết giúp học viên tự đánh giá kết quả."
    )
    emoji = "\U0001f3cb\ufe0f"

    def __init__(self, backend: TeachingAgentBase) -> None:
        self._backend = backend

    def is_available(self) -> bool:
        return self._backend is not None

    def get_args_tool(self) -> Type[GenerateExerciseArgs]:
        return GenerateExerciseArgs

    async def execute(self, context: ToolContext, args: GenerateExerciseArgs) -> ToolResult:
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

            exercise = await self._backend.generate_exercise(
                content=học_liệu,
                exercise_type=args.exercise_type,
            )

            output_dir = Path(args.output_dir) if args.output_dir else get_data_dir() / "teaching"
            output_dir.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = output_dir / f"exercise_{timestamp}.md"

            lines = [
                f"# Bài tập thực hành",
                f"",
                f"**ID:** {exercise.exercise_id} | **Loại:** {args.exercise_type}",
                f"",
                f"## Yêu cầu",
                f"",
                f"{exercise.instruction_prompt}",
                f"",
                f"## Ngữ cảnh / Dữ liệu đầu vào",
                f"",
                f"{exercise.context_reference}",
                f"",
                f"## Tiêu chí đánh giá (Rubric)",
                f"",
            ]
            for rubric in exercise.evaluation_rubrics:
                lines.append(f"### {rubric.dimension_name} ({rubric.max_score_allocated} điểm)")
                lines.append(f"{rubric.achievement_standard}")
                lines.append(f"")

            text_lines = [
                f"**Bài tập thực hành** \u2014 `{args.exercise_type}`",
                f"",
                f"{exercise.instruction_prompt[:200]}...",
                f"",
                f"**Rubric ({len(exercise.evaluation_rubrics)} tiêu chí):**",
            ]
            for r in exercise.evaluation_rubrics:
                text_lines.append(f"  - {r.dimension_name}: {r.max_score_allocated}đ")
            text_lines.append(f"")
            text_lines.append(f"\U0001f4c4 Đã lưu: `{filepath}`")

            filepath.write_text("\n".join(lines), encoding="utf-8")

            return ToolResult(
                success=True,
                result="\n".join(text_lines),
                metadata={
                    "saved_path": str(filepath),
                    "exercise_type": args.exercise_type,
                    "rubric_count": len(exercise.evaluation_rubrics),
                },
            )
        except Exception as e:
            logger.exception("generate_exercise failed")
            return ToolResult(success=False, result=str(e), error=str(e))
