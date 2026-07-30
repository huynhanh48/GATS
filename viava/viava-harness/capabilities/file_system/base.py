from abc import ABC, abstractmethod
from typing import List, Optional

from .models import CommandResult, FileSearchMatch
from core.tool import ToolContext

class FileSystem(ABC):
    
    @abstractmethod
    async def list_files(self, directory_path: str, context: ToolContext) -> List[str]:
        ...

    @abstractmethod
    async def read_file(self, filename: str, context: ToolContext) -> str:
        ...

    @abstractmethod
    async def write_file(self, filename: str, content: str, context: ToolContext, overwrite: bool = False):
        ...

    @abstractmethod
    async def exists(self, path: str, context: ToolContext) -> bool:
        ...

    @abstractmethod
    async def is_directory(self, directory_path: str, context: ToolContext) -> bool:
        ...

    @abstractmethod
    async def search_file(self, query: str, context: ToolContext, *, max_result: int = 20, include_content: bool = False) -> List[FileSearchMatch]:
        ...

    @abstractmethod
    async def run_bash(self, command: str, context: ToolContext, *, timeout: Optional[float] = None) -> CommandResult:
        ...