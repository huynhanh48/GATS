from __future__ import annotations

from pathlib import Path

from azure.ai.documentintelligence.aio import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import DocumentContentFormat
from azure.core.credentials import AzureKeyCredential

from core.ocr import OCRBase, OCRResult, OCRPage


class AzureDocumentIntelligence(OCRBase):
    def __init__(self, endpoint: str, credential: AzureKeyCredential) -> None:
        self._client = DocumentIntelligenceClient(endpoint, credential)

    @property
    def supported_formats(self) -> list[str]:
        return ["jpg", "jpeg", "png", "bmp", "tiff", "gif", "webp"]

    @property
    def _suffix_to_content_type(self) -> dict[str, str]:
        return {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".bmp": "image/bmp",
            ".tiff": "image/tiff",
            ".gif": "image/gif",
            ".webp": "image/webp",
        }

    async def extract(self, source: str | Path) -> OCRResult:
        source_path = Path(source)
        if not source_path.is_file():
            raise FileNotFoundError(f"Không thấy file: {source_path}")

        suffix = source_path.suffix.lower()
        content_type = self._suffix_to_content_type.get(suffix, "image/jpeg")

        with open(source_path, "rb") as f:
            poller = await self._client.begin_analyze_document(
                "prebuilt-read",
                body=f,
                content_type=content_type,
                output_content_format=DocumentContentFormat.MARKDOWN,
            )
        result = await poller.result()

        text = result.content or ""
        pages: list[OCRPage] = []
        if result.pages:
            for p in result.pages:
                page_text = ""
                confidence_sum = 0.0
                line_count = 0
                if p.lines:
                    lines = [line.content for line in p.lines if line.content]
                    page_text = "\n".join(lines)
                    confidences = [line.confidence for line in p.lines if line.confidence is not None]
                    if confidences:
                        confidence_sum = sum(confidences)
                        line_count = len(confidences)
                pages.append(OCRPage(
                    page_number=p.page_number,
                    text=page_text,
                    confidence=(confidence_sum / line_count) if line_count > 0 else None,
                ))

        return OCRResult(text=text, pages=pages)
