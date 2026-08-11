import asyncio
from pathlib import Path
from typing import Any

from .base import PromptBase

DEFAULT_IDENTITY = """\
Bạn là một trợ lý AI giúp người dùng thực hiện các tác vụ \
phần mềm. Bạn hoạt động trong môi trường dòng lệnh và có khả năng sử dụng \
các công cụ để đọc, viết, chỉnh sửa file, chạy lệnh, tìm kiếm, v.v.
"""

class IdentityPrompt(PromptBase):
    name: str = "identity"
    description: str = "Định danh và tính cách của agent"
    identity_path: str

    async def render(self, **kwargs: Any) -> str:
        try:
            path = Path(self.identity_path)
            if not path.exists():
                return DEFAULT_IDENTITY

            content = await asyncio.to_thread(path.read_text, encoding="utf-8")
            stripped = content.strip()
            if stripped:
                return stripped
        except (OSError, UnicodeDecodeError):
            pass

        return DEFAULT_IDENTITY