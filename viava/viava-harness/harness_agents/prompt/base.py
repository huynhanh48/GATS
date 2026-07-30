from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel

class PromptBase(BaseModel, ABC):
    name: str
    description: str = ""

    @abstractmethod
    async def render(self, **kwargs: Any) -> str:
        ...


class StaticPrompt(PromptBase):
    content: str = ""

    async def render(self, **kwargs: Any) -> str:
        return self.content


class PromptAssemblerConfig(BaseModel):
    identity_path: str = ""
    context_window_tokens: int = 200_000
    context_file_max_chars: int | None = None
    head_tail_ratio: float = 0.7

