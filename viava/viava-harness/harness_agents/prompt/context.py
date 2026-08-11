from typing import Any

from .base import PromptBase
from .scanner import FileScanner
from .truncation import compute_dynamic_cap, truncate_content


class ContextPrompt(PromptBase):
    model_config = {"arbitrary_types_allowed": True}
    name: str = "context"
    description: str = "Nội dung động từ filesystem (MEMORY.md)"

    scanner: FileScanner

    async def render(
        self,
        cwd: str = "",
        context_window_tokens: int = 200_000,
        **kwargs: Any,
    ) -> str:
        parts: list[str] = []

        memory = await self.scanner.find_file(cwd, "MEMORY.md")
        if memory:
            max_chars = compute_dynamic_cap(context_window_tokens)
            truncated = truncate_content(
                memory, max_chars, source_name="MEMORY.md"
            )
            parts.append(f"## Bộ nhớ dự án\n\n{truncated}")

        return "\n\n".join(parts) if parts else ""