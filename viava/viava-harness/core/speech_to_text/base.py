from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from .models import TranscriptResult


class SpeechToTextBase(ABC):
    @abstractmethod
    async def transcribe(self, source: str | Path) -> TranscriptResult:
        ...

    @abstractmethod
    async def transcribe_bytes(self, audio_bytes: bytes, format: str) -> TranscriptResult:
        ...

    @property
    @abstractmethod
    def supported_formats(self) -> list[str]:
        ...
