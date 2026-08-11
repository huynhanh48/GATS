import asyncio
from pathlib import Path

class FileScanner:
    async def find_file(
        self,
        cwd: str,
        filename: str
    ) -> str | None:
        git_root = await self._find_git_root(cwd)
        current = Path(cwd).resolve()
        while True:
            target = current / filename
            if target.exists() and target.is_file():
                try:
                    content = await asyncio.to_thread(
                        target.read_text, encoding="utf-8"
                    )
                    return content
                except (OSError, UnicodeDecodeError):
                    return None

            if (
                str(current) == str(git_root)
                or current.parent == current
            ):
                break
            current = current.parent

        return None

    async def _find_git_root(self, cwd: str) -> str:
        current = Path(cwd).resolve()
        while True:
            git_dir = current / ".git"
            if git_dir.exists() and git_dir.is_dir():
                return str(current)
            if current.parent == current:
                break
            current = current.parent
        return str(Path(cwd).resolve())