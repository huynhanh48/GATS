from enum import StrEnum
from pydantic import BaseModel

class SubAgentRole(StrEnum):
    LEAF = "leaf"
    ORCHESTRATOR = "orchestrator"

class SubAgentTask(BaseModel):
    goal: str
    context: str | None = None
    role: SubAgentRole = SubAgentRole.LEAF

BLOCKED_SUBAGENT_TOOLS: frozenset[str] = frozenset({
    "sub_agent_task",
    "agent_memory",
    "write_file",
    "edit_file",
    "bash",
    "schema_train",
})

class SubAgentOptions(BaseModel):
    max_spawn_depth: int = 1
    orchestrator_enabled: bool = True
    max_concurrent_children: int = 3
    child_max_iterations: int = 30
    child_timeout_seconds: int = 0
    max_summary_chars: int = 24000
    child_model: str | None = None
    child_provider: str | None = None
    blocked_tools: frozenset[str] = BLOCKED_SUBAGENT_TOOLS
    background_timeout_seconds: int = 300
    max_background_tasks: int = 5