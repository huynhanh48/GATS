from __future__ import annotations

import csv
from pathlib import Path
from typing import Callable

from core.file_extractor import FileExtractorBase, ExtractedFile


class LocalFileExtractor(FileExtractorBase):
    def __init__(self) -> None:
        self._parsers: dict[str, Callable[[str], str]] = {
            "txt": self._parse_text,
            "md": self._parse_text,
            "csv": self._parse_csv,
            "json": self._parse_text,
            "yaml": self._parse_text,
            "yml": self._parse_text,
            "xml": self._parse_text,
            "html": self._parse_text,
        }
        self._try_register("pdf", self._parse_pdf, "PyPDF2")
        self._try_register("docx", self._parse_docx, "docx")
        self._try_register("xlsx", self._parse_xlsx, "openpyxl")
        self._try_register("pptx", self._parse_pptx, "pptx")
        self._try_register("epub", self._parse_epub, "ebooklib")

    @property
    def supported_formats(self) -> list[str]:
        return list(self._parsers.keys())

    def _try_register(self, fmt: str, parse_fn: Callable[[str], str], lib_name: str) -> None:
        try:
            __import__(lib_name)
            self._parsers[fmt] = parse_fn
        except ImportError:
            pass

    def _detect_format(self, path: Path) -> str:
        return path.suffix.lower().lstrip(".")

    def _parse_text(self, path_str: str) -> str:
        with open(path_str, "r", encoding="utf-8", errors="replace") as f:
            return f.read()

    def _parse_csv(self, path_str: str) -> str:
        with open(path_str, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f)
            rows = [" | ".join(row) for row in reader]
            return "\n".join(rows)

    def _parse_pdf(self, path_str: str) -> str:
        import PyPDF2
        with open(path_str, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)

    def _parse_docx(self, path_str: str) -> str:
        import docx
        d = docx.Document(path_str)
        paragraphs = [p.text for p in d.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)

    def _parse_xlsx(self, path_str: str) -> str:
        import openpyxl
        wb = openpyxl.load_workbook(path_str, read_only=True, data_only=True)
        parts: list[str] = []
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            parts.append(f"=== {sheet_name} ===")
            for row in ws.iter_rows(values_only=True):
                parts.append(" | ".join(str(cell) if cell is not None else "" for cell in row))
        wb.close()
        return "\n".join(parts)

    def _parse_pptx(self, path_str: str) -> str:
        from pptx import Presentation
        prs = Presentation(path_str)
        slides: list[str] = []
        for i, slide in enumerate(prs.slides, 1):
            texts: list[str] = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for para in shape.text_frame.paragraphs:
                        t = para.text.strip()
                        if t:
                            texts.append(t)
            if texts:
                slides.append(f"--- Slide {i} ---\n" + "\n".join(texts))
        return "\n\n".join(slides)

    def _parse_epub(self, path_str: str) -> str:
        import ebooklib
        from ebooklib import epub
        from bs4 import BeautifulSoup

        book = epub.read_epub(path_str)
        chapters: list[str] = []
        for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
            soup = BeautifulSoup(item.get_content(), "html.parser")
            text = soup.get_text(separator="\n", strip=True)
            if text:
                chapters.append(text)
        return "\n\n".join(chapters)

    async def extract(self, source: str | Path) -> list[ExtractedFile]:
        source_path = Path(source)
        if not source_path.exists():
            raise FileNotFoundError(f"File not found: {source}")
        fmt = self._detect_format(source_path)
        parser = self._parsers.get(fmt)
        if parser is None:
            raise ValueError(f"Unsupported format: {fmt}")
        content = parser(str(source_path))
        return [
            ExtractedFile(
                content=content,
                metadata={"source": str(source_path), "format": fmt, "filename": source_path.name},
                source=str(source_path),
                format=fmt,
                filename=source_path.name,
            )
        ]
