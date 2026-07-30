from core.llm import LLMMessage
from .base import BaseContext


class MicroCompressor(BaseContext):

    def __init__(
        self,
        threshold_percent: float = 0.50,
        tail_budget_ratio: float = 0.25,
        protect_first_n: int = 3,
        protect_last_n: int = 6,
        max_tail_message_floor: int = 2,
        chars_per_token: int = 4,
        max_tool_result_chars: int = 4_000,
        context_length: int = 128_000,
    ):
        self.threshold_percent = threshold_percent
        self.tail_budget_ratio = tail_budget_ratio
        self.protect_first_n = protect_first_n
        self.protect_last_n = protect_last_n

        self.chars_per_token = chars_per_token
        self.max_tool_result_chars = max_tool_result_chars

        self.context_length = context_length
        self.max_tail_message_floor = max_tail_message_floor
        self.threshold_tokens = int(context_length * threshold_percent)
        self.tail_budget_tokens = int(self.threshold_tokens * self.tail_budget_ratio)
        self._ineffective_count = 0
        self._awaiting_real_usage = False

    @property
    def name(self) -> str:
        return "micro"

    def track_usage(self, usage: dict[str, int]) -> None:
        self.last_prompt_tokens = usage.get(
            "prompt_tokens", usage.get("input_tokens", 0)
        )
        self.last_completion_tokens = usage.get(
            "completion_tokens", usage.get("output_tokens", 0)
        )
        self.last_total_tokens = usage.get(
            "total_tokens",
            self.last_prompt_tokens + self.last_completion_tokens,
        )
        self._awaiting_real_usage = False
    
    def needs_compaction(self, prompt_tokens: int | None = None) -> bool:
        """
        # pre turn call llm 
        Kiểm tra số lượng token trước khi đưa vào llm
        
        """
        if prompt_tokens is not None:
            tokens = prompt_tokens
        else:
            # sau khi có call response
            tokens = self.last_prompt_tokens
            
        if tokens <= self.threshold_tokens:
            return False
        
        if self._ineffective_count >= 2:
            # Nếu 2 lần nén liên tiếp không tiết kiệm được ≥10% token → back-off, không nén nữa
            # Nếu context toàn code ngắn, tool results nhỏ → nén chẳng giảm được bao nhiêu → back-off sau 2 lần, không phí công vô ích.
            return False
        return True
    
    def compact(
        self,
        messages: list[LLMMessage],
        current_tokens: int | None = None,
        focus_topic: str | None = None
    ) -> list[LLMMessage]:
        if len(messages) <= self.protect_first_n + self.protect_last_n + 1:
            return list(messages)
        
        head_end = self._protect_head(messages=messages)
        tail_start = self._find_tail_start(messages=messages, compress_start=head_end)
        tail_start = self._align_boundary(messages, tail_start)

        if head_end >= tail_start:
            return list(messages)
        
        middle = messages[head_end:tail_start]
        compacted, original_chars, compacted_chars = self._run_middle(middle)

        if original_chars > 0:
            savings_pct = (original_chars - compacted_chars) / original_chars
        
        else:
            savings_pct = 0.0

        self._track_effectiveness(savings_pct)

        self.compression_count += 1
        self._awaiting_real_usage = True
        result = list(messages[:head_end]) + compacted + list(messages[tail_start:])
        return self._sanitize_pairs(result)
    
    # -- Preflight ---------------------------------------------------------
    
    def estimate_before_call(self, messages: list[LLMMessage]) -> int:
        total_chars = sum(len(m.content or "") for m in messages)
        return (total_chars + self.chars_per_token - 1) // self.chars_per_token

    def skip_estimate(self, rough_tokens: int) -> bool:
        if rough_tokens < self.threshold_tokens:
            return False
        return self._awaiting_real_usage
    
    def can_compact(self, messages: list[LLMMessage]) -> bool:
        head_end = self._protect_head(messages)
        tail_start = self._find_tail_start(messages, head_end)
        return head_end < tail_start
    
    # -- Internal ----------------------------------------------------------

    def _protect_head(self, messages: list[LLMMessage]) -> int:
        first_n = self.protect_first_n
        if self.compression_count > 0:
            first_n = 0
        
        idx = 0
        if messages and messages[0].role == "system":
            idx = 1 # luôn dùng system prompt (khôn được nén)
        
        idx += first_n
        return min(idx, len(messages))
    
    def _find_tail_start(
        self, messages: list[LLMMessage], compress_start: int
    ) -> int:
        accumulated = 0
        idx = len(messages) - 1
        tail_msg_count = 0
        floor = min(self.protect_last_n, self.max_tail_message_floor)
        while idx > compress_start:
            accumulated += len(messages[idx].content or "") // self.chars_per_token + 10
            tail_msg_count += 1
            if accumulated >= self.tail_budget_tokens and tail_msg_count >= floor:
                break

            idx -= 1
        
        return max(idx, compress_start)


    def _align_boundary(
        self, messages: list[LLMMessage], tail_start: int
    ) -> int:
        if tail_start >= len(messages):
            return tail_start
        for _ in range(5):
            if tail_start <= 0:
                break
            msg = messages[tail_start]
            if msg.role == "tool" and msg.tool_call_id:
                tail_start -= 1
                continue
            break
        return max(tail_start, 0)
    
    def _run_middle(
        self, middle: list[LLMMessage]
    ) -> tuple[list[LLMMessage], int, int]:
        import hashlib

        original_chars = sum(len(m.content or "") for m in middle)
        result: list[LLMMessage] = []
        seen: dict[str, int] = {}

        for msg in middle:
            content = msg.content or ""

            if msg.role == "tool":
                h = hashlib.md5(content.encode()).hexdigest()
                if h in seen:
                    result.append(
                        LLMMessage(
                            role="tool",
                            content="[Same as earlier result — deduplicated]",
                            tool_call_id=msg.tool_call_id,
                        )
                    )
                    continue
                seen[h] = 1

                if len(content) > self.max_tool_result_chars:
                    truncated = (
                        content[:self.max_tool_result_chars]
                        + f"\n\n... [truncated {len(content) - self.max_tool_result_chars} chars "
                        f"to save context space]"
                    )
                    result.append(
                        LLMMessage(
                            role="tool",
                            content=truncated,
                            tool_call_id=msg.tool_call_id,
                        )
                    )
                    continue

            result.append(msg)

        compacted_chars = sum(len(m.content or "") for m in result)
        return result, original_chars, compacted_chars
    
    def _track_effectiveness(self, savings_pct: float) -> None:
        if savings_pct < 0.10:
            self._ineffective_count += 1
        else:
            self._ineffective_count = 0

    def _sanitize_pairs(self, messages: list[LLMMessage]) -> list[LLMMessage]:
        active_ids: set[str] = set()
        for m in messages:
            if m.tool_calls:
                for tc in m.tool_calls or []:
                    active_ids.add(tc.id)

        result: list[LLMMessage] = []
        for m in messages:
            if (
                m.role == "tool"
                and m.tool_call_id
                and m.tool_call_id not in active_ids
            ):
                continue
            result.append(m)
        return result