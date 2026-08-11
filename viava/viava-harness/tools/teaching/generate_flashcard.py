"""Tool sinh flashcard từ nội dung học liệu."""
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


class GenerateFlashcardArgs(BaseModel):
    """Tham số cho tool generate_flashcard."""
    content: str = Field(description="Nội dung học liệu để sinh flashcard")
    source_file: str | None = Field(default=None, description="Đường dẫn file nội dung (.md, .txt)")
    num_cards: int = Field(default=10, ge=1, le=50, description="Số lượng thẻ")
    output_dir: str | None = Field(default=None, description="Thư mục lưu file output")


class GenerateFlashcardTool(ToolBase[GenerateFlashcardArgs]):
    name = "generate_flashcard"
    toolset = "teaching"
    description = (
        "Sinh bộ thẻ ghi nhớ (flashcard) từ nội dung học liệu. "
        "Mỗi thẻ gồm mặt trước (câu hỏi), mặt sau (đáp án) và gợi ý ghi nhớ (mnemonics)."
    )
    emoji = "\U0001f0cf"

    def __init__(self, backend: TeachingAgentBase) -> None:
        self._backend = backend

    def is_available(self) -> bool:
        return self._backend is not None

    def get_args_tool(self) -> Type[GenerateFlashcardArgs]:
        return GenerateFlashcardArgs

    async def execute(self, context: ToolContext, args: GenerateFlashcardArgs) -> ToolResult:
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

            cards = await self._backend.generate_flashcards(
                content=học_liệu,
                num_cards=args.num_cards,
            )

            validated = await self._backend.validate_flashcards(cards, học_liệu)

            output_dir = Path(args.output_dir) if args.output_dir else get_data_dir() / "teaching"
            output_dir.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = output_dir / f"flashcard_{timestamp}.md"

            lines = [
                f"# Bộ Flashcard",
                f"",
                f"**Số thẻ:** {len(cards)} | **Xác minh:** {validated.verified_count}/{validated.total_items} thẻ đạt yêu cầu",
                f"",
            ]
            for i, card in enumerate(cards):
                v = validated.items[i] if validated.items and i < len(validated.items) else None
                status = "" if (v is None or v.is_verified) else " \u26a0\ufe0f Cần xem lại"
                lines.append(f"## Thẻ {i+1}{status}")
                lines.append(f"**Mặt trước:** {card.front_side_prompt}")
                lines.append(f"**Mặt sau:** {card.back_side_answer}")
                lines.append(f"**Mẹo ghi nhớ:** {card.mnemonics_hint}")
                if v and not v.is_verified and v.issue:
                    lines.append(f"> Vấn đề: {v.issue}")
                lines.append(f"")

            text_lines = [
                f"**Bộ Flashcard** \u2014 {len(cards)} thẻ",
                f"",
            ]
            for i, card in enumerate(cards):
                v = validated.items[i] if validated.items and i < len(validated.items) else None
                status = "\u2705" if (v is None or v.is_verified) else "\u26a0\ufe0f"
                text_lines.append(f"{status} **{card.front_side_prompt[:80]}...** \u2192 {card.back_side_answer[:80]}...")
            text_lines.append(f"")
            text_lines.append(f"\U0001f4c4 Đã lưu: `{filepath}`")

            filepath.write_text("\n".join(lines), encoding="utf-8")

            return ToolResult(
                success=True,
                result="\n".join(text_lines),
                metadata={
                    "saved_path": str(filepath),
                    "num_cards": len(cards),
                    "validated": validated.model_dump(),
                },
            )
        except Exception as e:
            logger.exception("generate_flashcard failed")
            return ToolResult(success=False, result=str(e), error=str(e))
