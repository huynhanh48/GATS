from typing import Any

from .base import PromptBase


COMPACT_SUMMARY_PROMPT = """\
Bạn là một trợ lý tổng hợp thông tin. Nhiệm vụ của bạn là tạo một bản tóm tắt \
ngắn gọn về cuộc hội thoại bên dưới.

## Yêu cầu

1. Chỉ giữ lại thông tin quan trọng: quyết định đã đưa ra, lỗi đã gặp, giải pháp \
   đã thử, file đã sửa, kết quả đạt được.
2. Loại bỏ chi tiết thừa, tool calls, log output không cần thiết.
3. Sắp xếp theo thứ tự thời gian.
4. Đầu ra tối đa {max_tokens} tokens.
5. Viết bằng tiếng Việt.

## Hội thoại cần tóm tắt

{messages}\
"""


class CompactSummaryPrompt(PromptBase):
    name: str = "compact_summary"
    description: str = "Prompt cho LLM tóm tắt context cũ khi compaction"

    async def render(
        self,
        messages: str = "",
        max_tokens: int = 2000,
        **kwargs: Any,
    ) -> str:
        return COMPACT_SUMMARY_PROMPT.format(
            max_tokens=max_tokens,
            messages=messages,
        )