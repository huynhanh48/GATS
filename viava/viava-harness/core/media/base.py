from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from .models import MediaResult


class MediaProcessorBase(ABC):
    @abstractmethod
    async def extract_audio(self, source: str | Path, output_format: str = "mp3") -> MediaResult:
        ...

    @property
    @abstractmethod
    def supported_formats(self) -> list[str]:
        ...
