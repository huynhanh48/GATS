from abc import ABC, abstractmethod
from typing import Any, List, TypeVar, AsyncGenerator

from pydantic import BaseModel

from .models import LLMInput, LLMOutput, LlmStreamChunk

T = TypeVar("T", bound=BaseModel)

class BaseLLM(ABC):
    @abstractmethod
    async def chat(self, input: LLMInput) -> LLMOutput: 
        ...

    @abstractmethod
    async def chat_stream(
        self, input: LLMInput
    ) -> AsyncGenerator[LlmStreamChunk, None]:
        """Stream a input to the LLM.

        Args:
            input: The LLM input to stream

        Yields:
            LlmStreamChunk instances as they arrive
        """
        # This is an async generator method
        raise NotImplementedError
   

    @abstractmethod
    async def validate_tools(self, tools: List[Any]) -> List[str]:
        raise NotImplementedError
