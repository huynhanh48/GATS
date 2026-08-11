from core.tool.models import ToolCall, ToolContext, ToolDefinition, ToolResult
from harness_agents.tool.executor import ToolExecutor
from harness_agents.tool.guardrails import ToolGuardrails
from harness_agents.tool.budget_store import ToolBudgetStore
from harness_agents.tool.budget import ToolBudget


class ToolEngine:
    def __init__(
        self,
        executor: ToolExecutor,
        guardrails: ToolGuardrails,
        budget_store: ToolBudgetStore,
        tool_budget: ToolBudget,
        enabled_tool_names: list[str] | None = None,
    ):
        self.executor = executor
        self.guardrails = guardrails
        self.budget_store = budget_store
        self.tool_budget = tool_budget
        self.enabled_tool_names = enabled_tool_names

    async def execute_all(
        self,
        tool_calls: list[ToolCall],
        context: ToolContext,
    ) -> list[ToolResult]:
        results = await self.executor.execute_all(tool_calls, context)
        results = [self.budget_store.process(r) for r in results]
        results = self.budget_store.process_all(results)
        return results

    def cancel(self) -> None:
        self.executor.cancel()

    def reset_turn(self) -> None:
        self.guardrails.reset()
        self.budget_store.reset_turn()

    def get_tool_defines(self, user=None) -> list[ToolDefinition]:
        from harness_agents.tool.model_tools import get_tool_definitions
        return get_tool_definitions(tool_names=self.enabled_tool_names)
