from abc import ABC, abstractmethod

from .models import ChunkResult


class BaseChunkStrategy(ABC):
    """ABC cho chiến lược chia nhỏ văn bản."""

    @property
    @abstractmethod
    def strategy_name(self) -> str:
        """Tên chiến lược (vd: 'fixed-size', 'recursive', 'semantic')."""
        ...

    @abstractmethod
    async def chunk(self, text: str, *args, **kwargs) -> ChunkResult:
        """Chia text thành list các Chunk.

        Args:
            text: Văn bản cần chia.
            *args, **kwargs: Tham số mở rộng (vd: category) cho strategy đặc thù.
        """
        ...

    async def chunk_batch(self, texts: list[str], *args, **kwargs) -> list[ChunkResult]:
        """Chia batch text. Mặc định: gọi chunk() tuần tự từng text."""
        return [await self.chunk(t, *args, **kwargs) for t in texts]