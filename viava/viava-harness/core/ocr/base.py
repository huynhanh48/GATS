from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from .models import OCRResult


class OCRBase(ABC):
    @abstractmethod
    async def extract(self, source: str | Path) -> OCRResult:
        ...

    @property
    @abstractmethod
    def supported_formats(self) -> list[str]:
        ...
