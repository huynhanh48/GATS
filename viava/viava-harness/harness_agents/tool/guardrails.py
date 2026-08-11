import json
from enum import StrEnum
from pydantic import BaseModel

from core.tool import ToolResult

from utils.uitls import compute_mdhash_id

class GuardDecision(StrEnum):
    ALLOW = "allow"
    WARN = "warn"
    BLOCK = "block"

class GuardResult(BaseModel):
    decision: GuardDecision
    reason: str = ""

### Hard Code (Cần chỉnh sửa sau này)
READ_ONLY_TOOLS: frozenset[str] = frozenset({
    "web_search", "read_file", "list_files", "search_files",
    "get_current_time", "web_fetch", "list_mcp_resources", "read_mcp_resource",
})


class ToolGuardrails:
    def __init__(self, hard_stop: bool = False):
        self.hard_stop = hard_stop
        self.exact_failure_counts: dict[tuple[str, str], int] = {}
        self.same_tool_failure_counts: dict[str, int] = {}
        self.no_progress_hashes: dict[str, list[str]] = {}

    def before_call(self, tool_name: str, args: dict) -> GuardResult:
        result = self._check_exact_repeat(tool_name, args)
        if result.decision == GuardDecision.BLOCK:
            return result
        result = self._check_same_tool_failure(tool_name)
        if result.decision == GuardDecision.BLOCK:
            return result
        return self._check_no_progress(tool_name)
    
    def after_call(self, tool_name: str, args: dict, success: bool, tool_result: ToolResult) -> None:
        args_hash = compute_mdhash_id(content=json.dumps(args, sort_keys=True), prefix="tool-args-")
        if not success:
            key = (tool_name, args_hash)
            self.exact_failure_counts[key] = self.exact_failure_counts.get(key, 0) + 1
            self.same_tool_failure_counts[tool_name] = (
                self.same_tool_failure_counts.get(tool_name, 0) + 1
            )
            return

        self.exact_failure_counts.pop((tool_name, args_hash), None)
        self.same_tool_failure_counts.pop(tool_name, None)

        if tool_name in READ_ONLY_TOOLS:
            output_hash = compute_mdhash_id(content=tool_result.result, prefix="tool-args-")
            if tool_name not in self.no_progress_hashes:
                self.no_progress_hashes[tool_name] = []
            self.no_progress_hashes[tool_name].append(output_hash)

    def reset(self) -> None:
        self.exact_failure_counts.clear()
        self.same_tool_failure_counts.clear()
        self.no_progress_hashes.clear()

    def _check_exact_repeat(self, tool_name: str, args: dict) -> GuardResult:
        key = compute_mdhash_id(content=json.dumps(args, sort_keys=True), prefix="tool-args-")
        count = self.exact_failure_counts.get(key, 0)
        if count >= 3:
            decision = GuardDecision.BLOCK if self.hard_stop else GuardDecision.WARN
            return GuardResult(decision=decision, reason=f"Exact repeat failure: {tool_name} with same args failed {count} times")
        return GuardResult(decision=GuardDecision.ALLOW)
    
    def _check_same_tool_failure(self, tool_name: str) -> GuardResult:
        count = self.same_tool_failure_counts.get(tool_name, 0)
        if count >= 5:
            decision = GuardDecision.BLOCK if self.hard_stop else GuardDecision.WARN
            return GuardResult(decision=decision, reason=f"Same-tool failure loop: {tool_name} failed {count} times")
        return GuardResult(decision=GuardDecision.ALLOW)
    
    def _check_no_progress(self, tool_name: str) -> GuardResult:
        if tool_name not in READ_ONLY_TOOLS:
            return GuardResult(decision=GuardDecision.ALLOW)
        hashes = self.no_progress_hashes.get(tool_name, [])
        if len(hashes) >= 3 and len(set(hashes[-3:])) == 1:
            decision = GuardDecision.BLOCK if self.hard_stop else GuardDecision.WARN
            return GuardResult(decision=decision, reason=f"No-progress loop: {tool_name} returned identical result {len(hashes)} times")
        return GuardResult(decision=GuardDecision.ALLOW)
    
