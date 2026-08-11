from typing import Any
from abc import ABC, abstractmethod

from core.llm import LLMMessage


class BaseContext(ABC):
    """Abstract base class for context compaction engines.

    Concrete implementations maintain their own state via declared
    instance attributes.  No separate config or state model objects
    — everything lives directly on the instance.
    """

    # -- Identity ----------------------------------------------------------

    @property
    @abstractmethod
    def name(self) -> str:
        """Short identifier (e.g. 'micro', 'compressor', 'lcm')."""

    # -- Configuration (set before first use) -------------------------------

    threshold_percent: float = 0.70
    """Fraction of context_window_tokens that triggers compaction."""

    protect_first_n: int = 3
    """Non-system messages at the head always preserved verbatim."""

    protect_last_n: int = 6
    """Messages at the tail always preserved verbatim."""

    # -- Runtime state (updated by engine) ----------------------------------

    last_prompt_tokens: int = 0
    last_completion_tokens: int = 0
    last_total_tokens: int = 0
    threshold_tokens: int = 0
    context_length: int = 0
    compression_count: int = 0

    # -- Core interface ----------------------------------------------------

    @abstractmethod
    def track_usage(self, usage: dict[str, int]) -> None:
        """Theo dõi sử dụng token từ API response.
        Gọi sau mỗi LLM call với dict usage đã normalize.
        """

    @abstractmethod
    def needs_compaction(self, prompt_tokens: int | None = None) -> bool:
        """Trả về True nếu session cần nén ngữ cảnh."""

    @abstractmethod
    def compact(
        self,
        messages: list[LLMMessage],
        current_tokens: int | None = None,
        focus_topic: str | None = None,
    ) -> list[LLMMessage]:
        """Entry point chính: nhận message list, trả về message list đã nén."""

    # -- Optional: pre-flight check ----------------------------------------

    def estimate_before_call(self, messages: list[LLMMessage]) -> bool:
        """Kiểm tra nhanh trước khi gọi LLM (chưa có real token count).

        Default: skip preflight.
        """
        return False

    def skip_estimate(self, rough_tokens: int) -> bool:
        """Trả về True khi nên bỏ qua preflight và đợi real usage.

        Dùng khi vừa compact xong, estimate thô không chính xác.
        """
        return False

    # -- Optional: manual /compact preflight ------------------------------

    def can_compact(self, messages: list[LLMMessage]) -> bool:
        """Kiểm tra nhanh: có content nào nằm ngoài vùng head/tail không?"""
        return True



    # # -- Optional: status / display ----------------------------------------

    def status(self) -> dict[str, Any]:
        """Trả về thông tin trạng thái."""
        last_prompt = self.last_prompt_tokens if self.last_prompt_tokens > 0 else 0
        return {
            "last_prompt_tokens": last_prompt,
            "threshold_tokens": self.threshold_tokens,
            "context_length": self.context_length,
            "usage_percent": (
                min(100, last_prompt / self.context_length * 100)
                if self.context_length else 0
            ),
            "compression_count": self.compression_count,
        }

    # # -- Optional: model switch --------------------------------------------
    def switch_model(
        self,
        model: str,
        context_length: int,
        base_url: str = "",
        api_key: str = "",
        provider: str = "",
        api_mode: str = "",
    ) -> None:
        """Gọi khi chuyển model."""
        self.context_length = context_length
        self.threshold_tokens = int(context_length * self.threshold_percent)
