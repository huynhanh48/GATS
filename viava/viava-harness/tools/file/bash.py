from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.file_system import FileSystem
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class BashArgs(BaseModel):
    command: str
    timeout: float | None = None


class BashTool(ToolBase[BashArgs]):
    name = "bash"
    toolset = "file"
    description = "Run a shell command in the user's workspace"

    def __init__(self, file_system: FileSystem) -> None:
        self._file_system = file_system

    def is_available(self) -> bool:
        return self._file_system is not None

    def get_args_tool(self) -> Type[BashArgs]:
        return BashArgs

    async def execute(self, context: ToolContext, args: BashArgs) -> ToolResult:
        preflight_error = _preflight_interactive_command(args.command)
        if preflight_error is not None:
            return ToolResult(success=False, result=preflight_error, error=preflight_error)
        try:
            result = await self._file_system.run_bash(args.command, context, timeout=args.timeout)
        except Exception as exc:
            logger.exception("bash thất bại")
            return ToolResult(success=False, result=str(exc), error=str(exc))
        return ToolResult(
            success=result.returncode == 0,
            result=result.stdout,
            error=result.stderr if result.returncode != 0 else None,
        )


def _preflight_interactive_command(command: str) -> str | None:
    lowered_command = command.lower()
    if not _looks_like_interactive_scaffold(lowered_command):
        return None
    return (
        "This command appears to require interactive input before it can continue. "
        "The bash tool is non-interactive, so it cannot answer installer/scaffold prompts live. "
        "Prefer non-interactive flags (for example --yes, -y, --skip-install, --defaults, --non-interactive), "
        "or run the scaffolding step once in an external terminal before asking the agent to continue."
    )


def _looks_like_interactive_scaffold(lowered_command: str) -> bool:
    scaffold_markers: tuple[str, ...] = (
        "create-next-app", "npm create ", "pnpm create ", "yarn create ",
        "bun create ", "pnpm dlx ", "npm init ", "pnpm init ",
        "yarn init ", "bunx create-", "npx create-",
    )
    non_interactive_markers: tuple[str, ...] = (
        "--yes", " -y", "--skip-install", "--defaults",
        "--non-interactive", "--ci",
    )
    return any(m in lowered_command for m in scaffold_markers) and not any(
        m in lowered_command for m in non_interactive_markers
    )
