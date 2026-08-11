from abc import ABC, abstractmethod
from typing import List

from core.vector_storage.models import ScoredItem


class BaseReranker(ABC):
    @abstractmethod
    async def rerank(self, query: str, candidates: List[ScoredItem], top_k: int) -> List[ScoredItem]: ...
