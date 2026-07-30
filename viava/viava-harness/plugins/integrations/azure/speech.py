from __future__ import annotations

import io
from pathlib import Path

from openai import AzureOpenAI

from core.speech_to_text import SpeechToTextBase, TranscriptResult


class AzureSpeechToText(SpeechToTextBase):
    def __init__(
        self,
        api_key: str,
        base_url: str,
        deployment: str,
        language: str = "vi",
        api_version: str = "2024-10-21",
    ) -> None:
        self._client = AzureOpenAI(
            azure_endpoint=base_url,
            api_key=api_key,
            api_version=api_version,
        )
        self._deployment = deployment
        self._language = language

    @property
    def supported_formats(self) -> list[str]:
        return ["mp3", "wav", "m4a", "ogg", "flac", "wma"]

    async def transcribe(self, source: str | Path) -> TranscriptResult:
        path = Path(source)
        if not path.is_file():
            raise FileNotFoundError(f"Không thấy file: {path}")
        with path.open("rb") as audio_file:
            result = self._client.audio.transcriptions.create(
                model=self._deployment,
                file=audio_file,
                language=self._language,
                response_format="json",
            )
        return TranscriptResult(text=result.text, language=self._language)

    async def transcribe_bytes(self, audio_bytes: bytes, format: str) -> TranscriptResult:
        buf = io.BytesIO(audio_bytes)
        buf.name = f"audio.{format}"
        result = self._client.audio.transcriptions.create(
            model=self._deployment,
            file=buf,
            language=self._language,
            response_format="json",
        )
        return TranscriptResult(text=result.text, language=self._language)
