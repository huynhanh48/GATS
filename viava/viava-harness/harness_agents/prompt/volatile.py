from datetime import datetime
from typing import Any

from .base import PromptBase


VOLATILE_TEMPLATE = """\
## Thông tin phiên

- Thời gian hiện tại: {timestamp}
- Model: {model}
- Phiên: {session_id}\
"""


class VolatilePrompt(PromptBase):
    name: str = "volatile"
    description: str = "Thông tin phiên làm việc hiện tại"

    async def render(
        self,
        model: str = "",
        session_id: str = "",
        **kwargs: Any,
    ) -> str:
        now = datetime.now().strftime("%A, %B %d, %Y")
        return VOLATILE_TEMPLATE.format(
            timestamp=now,
            model=model or "unknown",
            session_id=session_id or "unknown",
        )