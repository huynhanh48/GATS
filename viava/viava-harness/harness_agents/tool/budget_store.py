import os
import time
from pathlib import Path

from core.tool.models import ToolResult
from harness_agents.tool.budget import ToolBudget
from utils.paths import get_data_dir

# cải tiên thêm 
# viết core Budget Store
# integrations core Budget Store gồm json và sqlite
# dùng base core Budget này
# kiểm tra xem có quan hệ với session không, nếu có thì thêm thông tin session vào luôn

class ToolBudgetStore:
    def __init__(self, budget: ToolBudget):
        self.budget = budget
        self.turn_total: int = 0
        self.spilled: list[int] = []
        self.spill_dir = self._resolve_spill_dir()

    def process(self, result: ToolResult) -> ToolResult:
        content = result.result
        content = self._truncate_lines(content)
        content = self._truncate_chars(content)
        result.result = content
        return result

    def process_all(self, results: list[ToolResult]) -> list[ToolResult]:
        processed: list[ToolResult] = []
        for result in results:
            processed.append(self._spill_if_needed(result))

        self.turn_total = sum(len(r.result) for r in processed)
        if self.turn_total > self.budget.max_turn_chars:
            processed = self._enforce_turn_budget(processed)

        return processed

    def reset_turn(self) -> None:
        self.turn_total = 0
        self.spilled.clear()

    def _resolve_spill_dir(self) -> Path:
        if self.budget.spill_dir:
            return Path(self.budget.spill_dir)
        path = get_data_dir() / "tool-results"
        path.mkdir(parents=True, exist_ok=True)
        return path

    def _truncate_lines(self, content: str) -> str:
        lines = content.split("\n")
        truncated = max(0, len(lines) - self.budget.max_lines)
        result_lines: list[str] = []

        for line in lines[:self.budget.max_lines]:
            if len(line) > self.budget.max_line_length:
                line = line[:self.budget.max_line_length] + "..."
            result_lines.append(line)

        if truncated:
            result_lines.append(f"... [truncated {truncated} lines]")

        return "\n".join(result_lines)

    def _truncate_chars(self, content: str) -> str:
        if len(content) <= self.budget.max_result_chars:
            return content
        truncated = len(content) - self.budget.max_result_chars
        return content[:self.budget.max_result_chars] + f"\n... [truncated {truncated} chars]"

    def _spill_if_needed(self, result: ToolResult) -> ToolResult:
        if len(result.result) <= self.budget.spill_threshold_chars:
            return result
        spill_path = self.spill_dir / f"result_{int(time.time() * 1000)}.txt"
        spill_path.write_text(result.result, encoding="utf-8")
        preview = result.result[:500] # đã hardcode cần thêm tham số ở đây
        result.result = f"{preview}\n... [full result spilled to {spill_path}]"
        return result

    def _enforce_turn_budget(self, results: list[ToolResult]) -> list[ToolResult]:
        excess = self.turn_total - self.budget.max_turn_chars
        indexed = sorted(enumerate(results), key=lambda x: len(x[1].result), reverse=True)
        for idx, result in indexed:
            if excess <= 0:
                break
            result = self._spill_if_needed(result)
            results[idx] = result
        return results