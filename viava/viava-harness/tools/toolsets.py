from __future__ import annotations

from pydantic import BaseModel


class ToolsetDef(BaseModel):
    name: str
    description: str
    tools: list[str] = []
    includes: list[str] = []


TOOLSETS: dict[str, ToolsetDef] = {
    "file": ToolsetDef(
        name="file",
        description="Đọc, ghi, sửa, tìm kiếm file và chạy lệnh bash",
        tools=["read_file", "write_file", "edit_file", "list_files", "search_files", "bash"],
    ),
    "web": ToolsetDef(
        name="web",
        description="Tìm kiếm và đọc nội dung web",
        tools=["web_search", "web_fetch"],
    ),
    "memory": ToolsetDef(
        name="memory",
        description="Lưu và tìm kiếm bộ nhớ agent",
        tools=["memory_save_tool_usage", "memory_search_tool_usage", "memory_save_text"],
    ),
    "mcp": ToolsetDef(
        name="mcp",
        description="Tương tác với MCP servers",
        tools=["list_mcp_resources", "read_mcp_resource"],
    ),
    "sql": ToolsetDef(
        name="sql",
        description="Text-to-SQL và thực thi SQL",
        tools=["run_sql", "text_to_sql", "schema_train"],
    ),
    "agent": ToolsetDef(
        name="agent",
        description="Ủy quyền task cho subagent",
        tools=["sub_agent_task"],
    ),
    "time": ToolsetDef(
        name="time",
        description="Thời gian hiện tại theo múi giờ",
        tools=["current_time"],
    ),
    "weather": ToolsetDef(
        name="weather",
        description="Tra cứu thời tiết",
        tools=["weather"],
    ),
    # "teaching": ToolsetDef(
    #     name="teaching",
    #     description="Sinh quiz, flashcard và bài tập thực hành từ nội dung học liệu",
    #     tools=["generate_quiz", "generate_flashcard", "generate_exercise"],
    # ),

}


def _resolve_impl(name: str, toolsets: dict[str, ToolsetDef], seen: set[str]) -> set[str]:
    if name in seen:
        return set()
    seen.add(name)
    ts = toolsets.get(name)
    if ts is None:
        return set()
    result: set[str] = set(ts.tools)
    for included in ts.includes:
        result |= _resolve_impl(included, toolsets, seen)
    return result


def resolve_toolset(name: str) -> set[str]:
    return _resolve_impl(name, TOOLSETS, set())


def resolve_toolsets(names: list[str]) -> set[str]:
    result: set[str] = set()
    for name in names:
        result |= resolve_toolset(name)
    return result
