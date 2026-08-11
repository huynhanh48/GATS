from typing import Optional
from pydantic import BaseModel


class FileSearchMatch(BaseModel):
    path: str
    snippet: Optional[str] = None


class CommandResult(BaseModel):
    stdout: str
    stderr: str
    returncode: int
