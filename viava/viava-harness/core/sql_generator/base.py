from abc import ABC, abstractmethod

from .models import SqlOutput


class SqlGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        question: str,
        tables: list[str],
        additional_context: list[str],
        question_sql_pairs: list[dict],
    ) -> SqlOutput: ...
