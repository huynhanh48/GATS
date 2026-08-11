# harness_agents/prompt/sub_agent.py
from typing import Any

from .base import PromptBase
from harness_agents.sub_agent import SubAgentRole, SubAgentOptions


def build_child_system_prompt(
    goal: str,
    context: str | None = None,
    role: "SubAgentRole" = SubAgentRole.LEAF,
    child_depth: int = 1,
    params: "SubAgentOptions | None" = None,
) -> str:
    parts = [
        "Bạn là một subagent tập trung làm việc trên một nhiệm vụ được ủy quyền cụ thể.",
        "",
        f"NHIỆM VỤ CỦA BẠN:\n{goal}",
    ]
    if context:
        parts.append(f"\nNGỮ CẢNH:\n{context}")
    parts.append(
        "\nHOÀN THÀNH NHIỆM VỤ:\n"
        "Sử dụng các công cụ có sẵn, khi hoàn thành trả về tóm tắt rõ ràng, súc tích:\n"
        "- Bạn đã làm gì\n"
        "- Bạn tìm thấy / đạt được gì\n"
        "- Các file đã tạo hoặc sửa đổi\n"
        "- Vấn đề gặp phải (nếu có)\n\n"
        "QUAN TRỌNG:\n"
        "- Dẫn kết quả bằng kết quả chính, dùng bullet points\n"
        "- Không tua lại toàn bộ quá trình\n"
        "- Phản hồi của bạn được trả về parent agent dưới dạng tóm tắt"
    )
    if role == SubAgentRole.ORCHESTRATOR:
        max_depth = params.max_spawn_depth if params else 1
        can_spawn = child_depth + 1 < max_depth
        note = (
            "Worker của bạn PHẢI là leaf (không thể spawn tiếp) "
            "vì chúng đã ở giới hạn độ sâu."
            if not can_spawn
            else "Worker của bạn có thể là orchestrator hoặc leaf, "
            "tùy `role` bạn truyền cho sub_agent_task."
        )
        parts.append(
            "\nKỸ NĂNG SPAWN SUBAGENT (Orchestrator):\n"
            "Bạn có quyền dùng sub_agent_task để spawn subagent.\n\n"
            "KHI NÀO NÊN: 2+ subtask độc lập chạy song song / subtask nặng suy luận dễ tràn context.\n"
            "KHI NÀO KHÔNG: công việc đơn giản một bước / re-spawn toàn bộ cho 1 worker.\n"
            "Tổng hợp kết quả worker trước khi báo cáo về parent.\n\n"
            f"Bạn ở depth={child_depth}, max_spawn_depth={max_depth}. {note}"
        )
    return "\n".join(parts)


class SubAgentPrompt(PromptBase):
    name: str = "sub_agent"
    description: str = "System prompt cho subagent được ủy quyền"

    async def render(
        self,
        goal: str = "",
        context: str | None = None,
        role: str = "leaf",
        child_depth: int = 1,
        max_spawn_depth: int = 2,
        **kwargs: Any,
    ) -> str:
        # Map string role to SubAgentRole
        sub_role = SubAgentRole.ORCHESTRATOR if role == "orchestrator" else SubAgentRole.LEAF
        params = SubAgentOptions(max_spawn_depth=max_spawn_depth)
        return build_child_system_prompt(
            goal=goal,
            context=context,
            role=sub_role,
            child_depth=child_depth,
            params=params,
        )