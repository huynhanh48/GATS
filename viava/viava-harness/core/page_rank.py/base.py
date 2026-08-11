from abc import ABC, abstractmethod
from .models import PPRParam
class PersonalizedPageRankBase(ABC):
    
    @abstractmethod
    async def rank(
        self,
        graph,
        seed_nodes: list[str],
        params: PPRParam
    ) -> dict[str, float]:
        ...

        