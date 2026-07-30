from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from .models import ExtractedFile


class FileExtractorBase(ABC):
    @abstractmethod
    async def extract(self, source: str | Path) -> list[ExtractedFile]:
        ...

    @property
    @abstractmethod
    def supported_formats(self) -> list[str]:
        ...
