from __future__ import annotations

from abc import ABC, abstractmethod


class BaseEmbedding(ABC):
    @property
    @abstractmethod
    def embedding_dim(self) -> int:
        """Kích thước vector embedding đầu ra (số chiều)"""
        ...

    @abstractmethod
    async def embed(self, text: str) -> list[float]: ...

    @abstractmethod
    async def embed_batch(self, texts: list[str]) -> list[list[float]]: ...
