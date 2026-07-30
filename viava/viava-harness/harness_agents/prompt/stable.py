
from typing import Any

from .base import PromptBase
from utils.platform import detect_platform, PlatformName


class PlatformDetector:
    def get_os_info(self) -> str:
        plat = detect_platform()
        names = {
            PlatformName.WINDOWS: "Windows",
            PlatformName.LINUX: "Linux",
            PlatformName.MACOS: "macOS",
            PlatformName.WSL: "WSL (Windows Subsystem for Linux)",
            PlatformName.UNKNOWN: "Unknown",
        }

        return names.get(plat, "Unknown")
    
    def get_shell(self) -> str:
        plat = detect_platform()
        if plat == PlatformName.WINDOWS:
            return "PowerShell / cmd.exe"
        return "bash / sh"
    
TOOL_GUIDANCE = """\
## Công cụ

Bạn có các công cụ để tương tác với hệ thống tệp, chạy lệnh, tìm kiếm web, \
truy vấn cơ sở dữ liệu và nhiều hơn nữa.

- Luôn kiểm tra kết quả trả về từ công cụ trước khi tiếp tục.
- Nếu một công cụ trả về lỗi, hãy phân tích lỗi và thử cách khác.
- Không gọi cùng một công cụ với cùng tham số nếu đã thất bại trước đó.
- Sử dụng nhiều công cụ song song khi các lệnh gọi không phụ thuộc vào nhau.\
"""

PLATFORM_HINT = """\
## Môi trường

- Hệ điều hành: {platform}
- Trình bao: {shell}\
"""

class ToolGuidancePrompt(PromptBase):
    name: str = "tool_guidance"
    description: str = "Hướng dẫn sử dụng công cụ cho LLM"

    async def render(self, **kwargs: Any) -> str:
        return TOOL_GUIDANCE
    
class PlatformHintPrompt(PromptBase):
    name: str = "platform_hint"
    description: str = "Thông tin về hệ điều hành và môi trường"

    async def render(self, **kwargs: Any) -> str:
        detector = PlatformDetector()
        os_info = detector.get_os_info()
        shell = detector.get_shell()
        return PLATFORM_HINT.format(platform=os_info, shell=shell)
    
