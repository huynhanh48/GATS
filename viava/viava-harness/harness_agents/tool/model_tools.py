from __future__ import annotations

from core.tool.models import ToolContext, ToolDefinition, ToolResult
from tools.registry import registry
from tools.toolsets import resolve_toolsets


def get_tool_definitions(
    enabled_toolsets: list[str] | None = None,
    disabled_toolsets: list[str] | None = None,
    tool_names: list[str] | None = None,
    skip_unavailable: bool = True,
) -> list[ToolDefinition]:
    if tool_names is not None:
        return registry.get_definitions(tool_names=tool_names, skip_unavailable=skip_unavailable)

    if enabled_toolsets is not None:
        enabled = resolve_toolsets(enabled_toolsets)
    else:
        enabled = None

    if disabled_toolsets is not None:
        disabled = resolve_toolsets(disabled_toolsets)
    else:
        disabled = set()

    if enabled is not None:
        final_names = list(enabled - disabled)
    else:
        final_names = [n for n in registry.list_tool_names() if n not in disabled]

    return registry.get_definitions(tool_names=final_names, skip_unavailable=skip_unavailable)


async def handle_function_call(
    name: str, args: dict, context: ToolContext
) -> ToolResult:
    return await registry.dispatch(name, args, context)


def get_toolset_for_tool(tool_name: str) -> str | None:
    return registry.get_toolset_for_tool(tool_name)


def check_tool_availability() -> dict[str, bool]:
    return {n: registry.is_tool_available(n) for n in registry.list_tool_names()}
