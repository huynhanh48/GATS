from __future__ import annotations

import asyncio
from pathlib import Path

from core.media import MediaProcessorBase, MediaResult


class LocalMediaService(MediaProcessorBase):
    def __init__(self, ffmpeg_path: str = "ffmpeg") -> None:
        self._ffmpeg = ffmpeg_path

    @property
    def supported_formats(self) -> list[str]:
        return ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"]

    async def extract_audio(self, source: str | Path, output_format: str = "mp3") -> MediaResult:
        source_path = Path(source)
        if not source_path.is_file():
            raise FileNotFoundError(f"Không thấy file: {source_path}")

        proc = await asyncio.create_subprocess_exec(
            self._ffmpeg,
            "-i", str(source_path),
            "-vn",
            "-ar", "16000",
            "-ac", "1",
            "-b:a", "64k",
            "-f", output_format,
            "pipe:1",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
        stdout, _ = await proc.communicate()

        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg failed with return code {proc.returncode}")

        return MediaResult(audio_bytes=stdout, format=output_format)
