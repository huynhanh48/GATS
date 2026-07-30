from abc import ABC, abstractmethod
from typing import Any, Generic, Protocol, TypeVar

from core.user.models import User

from .models import ToolContext, ToolDefinition, ToolResult, ToolCall, ToolRejection

T = TypeVar("T")

class ToolBase(ABC, Generic[T]):
    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        ...

    # @property
    # def access_groups(self) -> list[str]:
    #     return []

    @property
    @abstractmethod
    def toolset(self) -> str:
        ...

    @property
    def emoji(self) -> str:
        return ""

    def is_available(self) -> bool:
        return True

    def requires_env(self) -> list[str]:
        return []

    @abstractmethod
    def get_args_tool(self) -> type[T]:
        ...

    @abstractmethod
    async def execute(self, context: ToolContext, args: T) -> ToolResult:
        ...
    
    def get_tool_define(self) -> ToolDefinition:
        args_model = self.get_args_tool()
        schema = args_model.model_json_schema() if hasattr(args_model, "model_json_schema") else {}
        return ToolDefinition(
            name=self.name,
            description=self.description,
            parameters=schema,
        )