from abc import ABC, abstractmethod

from core.tool import ToolContext

from .models import TextToSQLInput, TextToSQLOutput


class TextToSQLGenerator(ABC):
    @abstractmethod
    async def generate(
        self, input: TextToSQLInput, context: ToolContext
    ) -> TextToSQLOutput: ...
