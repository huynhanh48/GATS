import time

from core.chunk_strategy.base import BaseChunkStrategy
from core.chunk_strategy.models import Chunk, ChunkResult


class SectionHeaderChunkStrategy(BaseChunkStrategy):
    """Chia theo heading structure của markdown/HTML, giữ nguyên section."""

    strategy_name = "section-header"

    def __init__(self, max_section_tokens: int = 4000):
        self.max_section_tokens = max_section_tokens

    async def chunk(self, text: str) -> ChunkResult:
        import re
        start = time.time()
        if not text:
            return ChunkResult(chunks=[], strategy_name=self.strategy_name, execution_time_ms=0.0)

        header_pattern = re.compile(r'^(#{1,6}\s+.+)$', re.MULTILINE)
        matches = list(header_pattern.finditer(text))

        if not matches:
            return ChunkResult(chunks=[Chunk(content=text.strip(), index=0)], strategy_name=self.strategy_name)

        chunks: list[Chunk] = []
        idx = 0
        for i, m in enumerate(matches):
            start_pos = m.start()
            end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            section_content = text[start_pos:end_pos].strip()
            header_line = m.group(1)

            chunks.append(Chunk(
                content=section_content,
                index=idx,
                metadata={
                    "start_char": start_pos,
                    "end_char": end_pos,
                    "heading_level": header_line.count("#"),
                    "heading_title": header_line.lstrip("#").strip(),
                },
            ))
            idx += 1

        elapsed = (time.time() - start) * 1000
        return ChunkResult(chunks=chunks, strategy_name=self.strategy_name, execution_time_ms=elapsed)


class DocumentAwareChunkStrategy(BaseChunkStrategy):
    """Chia dựa vào cấu trúc tài liệu: giữ nguyên code block, list, quote."""

    strategy_name = "document-aware"

    def __init__(self, chunk_token_size: int = 1200, overlap: int = 100):
        self.chunk_token_size = chunk_token_size
        self.overlap = overlap

    async def chunk(self, text: str) -> ChunkResult:
        import re
        start = time.time()
        if not text:
            return ChunkResult(chunks=[], strategy_name=self.strategy_name, execution_time_ms=0.0)

        # Extract and protect special blocks
        blocks: list[dict] = []  # {type, content}

        # Fenced code blocks
        fence_pattern = re.compile(r'```(\w*)\n(.*?)```', re.DOTALL)
        # Inline code
        inline_code_pattern = re.compile(r'`([^`]+)`')

        # Split text by top-level elements: paragraphs, lists, blockquotes, headings
        element_pattern = re.compile(
            r'(?:(?:^#{1,6}\s+.+$)|'  # headings
            r'(?:^>\s.*$)|'             # blockquotes
            r'(?:^[*-]\s.*$)|'          # bullet lists
            r'(?:^\d+\.\s.*$)|'         # numbered lists
            r'(?:^```[\s\S]*?```$)|'    # code blocks
            r'(?:^(?:\|[^|\n]+\|[\s\S]*?(?=\n\n|\Z))))',  # tables
            re.MULTILINE,
        )

        elements = element_pattern.findall(text)

        if not elements:
            # Fallback: split by double newline
            elements = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]

        if not elements:
            return ChunkResult(chunks=[Chunk(content=text.strip(), index=0)], strategy_name=self.strategy_name)

        chunks: list[Chunk] = []
        idx = 0
        pos = 0
        for elem in elements:
            start_char = text.index(elem, pos) if elem in text[pos:] else pos
            pos = start_char + len(elem)
            elem_type = self._detect_element_type(elem)
            chunks.append(Chunk(
                content=elem.strip(),
                index=idx,
                metadata={"start_char": start_char, "end_char": pos, "element_type": elem_type},
            ))
            idx += 1

        elapsed = (time.time() - start) * 1000
        return ChunkResult(chunks=chunks, strategy_name=self.strategy_name, execution_time_ms=elapsed)

    @staticmethod
    def _detect_element_type(text: str) -> str:
        stripped = text.strip()
        if stripped.startswith("```"):
            return "code_block"
        if stripped.startswith("#"):
            return "heading"
        if stripped.startswith(">"):
            return "blockquote"
        if stripped.startswith("- ") or stripped.startswith("* "):
            return "bullet_list"
        if stripped and stripped[0].isdigit() and ". " in stripped[:4]:
            return "numbered_list"
        if stripped.startswith("|") and "|" in stripped[1:]:
            return "table"
        return "paragraph"


class TableAwareChunkStrategy(BaseChunkStrategy):
    """Giữ nguyên bảng, không cắt ngang bảng."""

    strategy_name = "table-aware"

    def __init__(self, chunk_token_size: int = 1200, overlap: int = 100):
        self.chunk_token_size = chunk_token_size
        self.overlap = overlap

    async def chunk(self, text: str) -> ChunkResult:
        import re
        start = time.time()
        if not text:
            return ChunkResult(chunks=[], strategy_name=self.strategy_name, execution_time_ms=0.0)

        # Split keeping tables intact
        table_pattern = re.compile(
            r'(?:^.*?\|.*?\|.*?$\n^[|\- :]+$\n(?:^.*?\|.*?\|.*?$\n?)*)',
            re.MULTILINE,
        )

        parts: list[tuple[str, bool]] = []  # (content, is_table)
        last_end = 0
        for m in table_pattern.finditer(text):
            if m.start() > last_end:
                parts.append((text[last_end:m.start()].strip(), False))
            parts.append((m.group().strip(), True))
            last_end = m.end()

        if last_end < len(text):
            remaining = text[last_end:].strip()
            if remaining:
                parts.append((remaining, False))

        if not parts:
            return ChunkResult(chunks=[Chunk(content=text.strip(), index=0)], strategy_name=self.strategy_name)

        chunks: list[Chunk] = []
        idx = 0
        pos = 0
        for content, is_table in parts:
            if not content:
                continue
            start_char = text.index(content, pos) if content in text[pos:] else pos
            pos = start_char + len(content)
            chunks.append(Chunk(
                content=content,
                index=idx,
                metadata={"start_char": start_char, "end_char": pos, "is_table": is_table},
            ))
            idx += 1

        elapsed = (time.time() - start) * 1000
        return ChunkResult(chunks=chunks, strategy_name=self.strategy_name, execution_time_ms=elapsed)