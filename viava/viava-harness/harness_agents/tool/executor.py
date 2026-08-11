import asyncio

from core.tool.models import ToolCall, ToolContext, ToolResult
from harness_agents.tool.guardrails import GuardDecision, ToolGuardrails


class ToolExecutor:
    def __init__(
        self,
        guardrails: ToolGuardrails,
        timeout: float = 420.0,
    ):
        self.guardrails = guardrails
        self.timeout = timeout
        self.cancel_event = asyncio.Event()

    def cancel(self) -> None:
        self.cancel_event.set()

    async def execute_all(
        self,
        tool_calls: list[ToolCall],
        context: ToolContext,
    ) -> list[ToolResult]:
        if self.cancel_event.is_set():
            return [
                ToolResult(success=False, result="Tool execution cancelled", error="cancelled")
                for _ in tool_calls
            ]

        coroutines = []
        for tc in tool_calls:
            guard = self.guardrails.before_call(tc.name, tc.arguments)
            if guard.decision == GuardDecision.BLOCK:
                coroutines.append(self._blocked_result(tc.name, guard.reason))
            else:
                coroutines.append(self._execute_one(tc, context))

        gathered = await asyncio.gather(*coroutines, return_exceptions=True)

        results: list[ToolResult] = []
        for tc, raw in zip(tool_calls, gathered):
            if isinstance(raw, BaseException):
                result = ToolResult(
                    success=False,
                    result=f"Unexpected error: {str(raw)}",
                    error=str(raw),
                )
            elif isinstance(raw, ToolResult):
                result = raw
            else:
                result = ToolResult(
                    success=False,
                    result=f"Unexpected result type: {type(raw)}",
                    error=str(raw),
                )
            self.guardrails.after_call(tc.name, tc.arguments, result.success, result)
            results.append(result)

        return results

    async def _execute_one(self, tc: ToolCall, context: ToolContext) -> ToolResult:
        if self.cancel_event.is_set():
            return ToolResult(success=False, result="Tool execution cancelled", error="cancelled")
        try:
            async with asyncio.timeout(self.timeout):
                from harness_agents.tool.model_tools import handle_function_call
                return await handle_function_call(tc.name, tc.arguments, context)
        except asyncio.CancelledError:
            return ToolResult(success=False, result="Tool execution cancelled", error="cancelled")
        except TimeoutError:
            return ToolResult(success=False, result="Tool execution timed out", error="timeout")

    async def _blocked_result(self, tool_name: str, reason: str) -> ToolResult:
        return ToolResult(success=False, result=f"Blocked by guardrails: {reason}", error=reason)
