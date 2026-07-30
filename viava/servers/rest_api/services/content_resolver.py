from __future__ import annotations

import logging
import tempfile
from pathlib import Path

import httpx

from capabilities.retrieval_augmented_generation.models import DocInsert
from core.file_extractor import FileExtractorBase
from core.speech_to_text import SpeechToTextBase
from servers.rest_api.exceptions import AppError
from servers.rest_api.schemas.common import CourseGenerateRequest

logger = logging.getLogger(__name__)

AUDIO_MIME_PREFIXES = ("audio/",)
MAX_CONTENT_LENGTH = 100_000


class ContentResolver:
    def __init__(self, extractor: FileExtractorBase, transcriber: SpeechToTextBase) -> None:
        self._extractor = extractor
        self._transcriber = transcriber
        self._http = httpx.AsyncClient(timeout=60.0)

    async def resolve(self, request: CourseGenerateRequest) -> DocInsert:
        parts: list[str] = []
        file_paths: list[str] = []

        if request.has_file:
            content, source = await self._extract_upload(request.file)
            parts.append(content)
            file_paths.append(source)

        if request.has_file_url:
            content, source = await self._fetch_and_extract(request.file_url)
            parts.append(content)
            file_paths.append(source)

        if request.has_text:
            parts.append(request.text.strip())

        content = "\n\n".join(parts).strip()
        if not content:
            raise AppError("CONTENT_EMPTY", "Noi dung trich xuat rong")
        if len(content) > MAX_CONTENT_LENGTH:
            raise AppError("CONTENT_TOO_LONG", f"Noi dung vuot qua {MAX_CONTENT_LENGTH} ky tu")

        return DocInsert(
            contents=content,
            file_paths=file_paths if file_paths else None,
            domain=request.domain,
        )

    async def _extract_upload(self, file) -> tuple[str, str]:
        filename = file.filename or "upload.txt"
        suffix = Path(filename).suffix or ".txt"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            results = await self._extractor.extract(tmp_path)
            return "\n\n".join(r.content for r in results), filename
        except Exception:
            raise AppError("EXTRACT_FAILED", "Khong the trich xuat noi dung tu file")
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    async def _fetch_and_extract(self, url: str) -> tuple[str, str]:
        try:
            resp = await self._http.get(url)
            resp.raise_for_status()
        except Exception as e:
            raise AppError("FETCH_FAILED", f"Khong the tai file tu URL: {e}") from e

        content_type = resp.headers.get("content-type", "")

        if content_type.lower().startswith(AUDIO_MIME_PREFIXES):
            text, _ = await self._transcribe_bytes(resp.content, content_type)
            return text, url

        text, _ = await self._extract_bytes(resp.content, url)
        return text, url

    async def _transcribe_bytes(self, data: bytes, mime_type: str) -> tuple[str, str]:
        fmt = self._mime_to_audio_format(mime_type)
        with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        try:
            result = await self._transcriber.transcribe(tmp_path)
            return result.text, tmp_path
        except Exception as e:
            raise AppError("TRANSCRIBE_FAILED", f"Khong the chuyen doi am thanh: {e}") from e
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    async def _extract_bytes(self, data: bytes, source: str) -> tuple[str, str]:
        suffix = Path(source.split("?")[0]).suffix or ".txt"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        try:
            results = await self._extractor.extract(tmp_path)
            return "\n\n".join(r.content for r in results), source
        except Exception:
            raise AppError("EXTRACT_FAILED", "Khong the trich xuat noi dung tu file tai ve")
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    @staticmethod
    def _mime_to_audio_format(mime_type: str) -> str:
        mapping = {
            "audio/mpeg": "mp3", "audio/wav": "wav", "audio/flac": "flac",
            "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/x-ms-wma": "wma",
        }
        return mapping.get(mime_type.lower(), "mp3")

    async def close(self) -> None:
        await self._http.aclose()
