import json
from typing import Type

from pydantic import BaseModel, Field

from core.tool import ToolBase, ToolContext, ToolResult


class SubAgentTaskArgs(BaseModel):
    goal: str = Field(description="Mô tả nhiệm vụ cần ủy quyền cho subagent")
    context: str | None = Field(
        default=None,
        description="Ngữ cảnh bổ sung giúp subagent hiểu rõ nhiệm vụ",
    )
    role: str = Field(
        default="leaf",
        description="Vai trò: 'leaf' (mặc định, không subagent tiếp) hoặc 'orchestrator' (được spawn worker)",
    )
    background: bool = Field(
        default=False,
        description="True nếu chạy nền (không đợi kết quả), False nếu đợi kết quả trước khi tiếp tục",
    )


class SubAgentTaskTool(ToolBase[SubAgentTaskArgs]):
    name = "sub_agent_task"
    toolset = "agent"
    description = (
        "Ủy quyền một nhiệm vụ cho subagent chạy độc lập. "
        "Subagent có context riêng, toolset giới hạn và trả về tóm tắt kết quả. "
        "Dùng khi cần song song hóa nhiều subtask độc lập hoặc giảm tải context."
    )

    def get_args_tool(self) -> Type[SubAgentTaskArgs]:
        return SubAgentTaskArgs

    async def execute(self, context: ToolContext, args: SubAgentTaskArgs) -> ToolResult:
        return ToolResult(
            success=True,
            result=json.dumps({
                "status": "routed",
                "goal": args.goal,
                "role": args.role,
                "note": "delegate_task được xử lý bởi AgentLoop, không qua ToolEngine",
            }, ensure_ascii=False),
        )
