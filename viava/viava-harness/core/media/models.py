from __future__ import annotations

from pydantic import BaseModel, Field


class AudioTrack(BaseModel):
    format: str
    sample_rate: int
    channels: int
    duration_seconds: float | None = None


class MediaResult(BaseModel):
    audio_bytes: bytes
    format: str
    tracks: list[AudioTrack] = Field(default_factory=list)
