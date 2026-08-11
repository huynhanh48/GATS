import re
import time
from typing import Sequence

from core.chunk_strategy.base import BaseChunkStrategy
from core.chunk_strategy.models import Chunk, ChunkResult

_SpanPiece = tuple[str, int, int]


class RecursiveChunkStrategy(BaseChunkStrategy):
    """Chia đệ quy mirroring LangChain RecursiveCharacterTextSplitter.

    Walk separator cascade từ thô (\\n\\n) đến mịn (""):
    1. Split trên best-matching separator → track source span.
    2. Merge các piece nhỏ liền kề (đến khi đạt chunk_token_size).
    3. Piece oversize được đệ quy re-split với separator tier tiếp theo.
    4. Overlap được áp dụng trong phase merge (pop từ front).
    """

    strategy_name = "recursive"

    def __init__(
        self,
        chunk_token_size: int = 1200,
        chunk_overlap: int = 100,
        separators: list[str] | None = None,
    ):
        if chunk_overlap > chunk_token_size:
            raise ValueError("chunk_overlap must be smaller than chunk_token_size")
        self.chunk_token_size = max(int(chunk_token_size), 1)
        self.chunk_overlap = max(int(chunk_overlap), 0)
        self.separators = separators or ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""]

    async def chunk(self, text: str) -> ChunkResult:
        start_time = time.time()
        if not text or not text.strip():
            return ChunkResult(chunks=[], total_tokens=0, strategy_name=self.strategy_name, execution_time_ms=0.0)

        pieces = self._split_text_with_spans(text, base_offset=0, separators=list(self.separators))

        chunks: list[Chunk] = []
        for idx, (raw_body, start_index, end_index) in enumerate(pieces):
            left = 0
            right = len(raw_body)
            while left < right and raw_body[left].isspace():
                left += 1
            while right > left and raw_body[right - 1].isspace():
                right -= 1
            body = raw_body[left:right]
            if not body:
                continue
            start_index += left
            end_index -= len(raw_body) - right

            chunks.append(Chunk(
                content=body,
                index=idx,
                metadata={
                    "start_char": start_index,
                    "end_char": end_index,
                    "_source_span": {"start": start_index, "end": end_index},
                },
                token_count=self._count_tokens(body),
            ))

        if not chunks:
            body = text.strip()
            if body:
                start = text.find(body)
                end = start + len(body) if start >= 0 else len(body)
                chunks.append(Chunk(
                    content=body,
                    index=0,
                    metadata={
                        "start_char": start if start >= 0 else 0,
                        "end_char": end,
                        "_source_span": {"start": start if start >= 0 else 0, "end": end},
                    },
                    token_count=self._count_tokens(body),
                ))

        elapsed = (time.time() - start_time) * 1000
        total_tokens = sum(c.token_count or 0 for c in chunks)
        return ChunkResult(chunks=chunks, total_tokens=total_tokens, strategy_name=self.strategy_name, execution_time_ms=elapsed)

    def _split_text_with_spans(
        self, text: str, *, base_offset: int, separators: list[str],
    ) -> list[_SpanPiece]:
        separator = separators[-1]
        new_separators: list[str] = []
        for i, candidate in enumerate(separators):
            pattern = re.escape(candidate)
            if not candidate:
                separator = candidate
                break
            if re.search(pattern, text):
                separator = candidate
                new_separators = separators[i + 1:]
                break

        separator_pattern = re.escape(separator)
        splits = self._split_text_with_regex_spans(text, separator_pattern, base_offset=base_offset)

        final_chunks: list[_SpanPiece] = []
        good_splits: list[_SpanPiece] = []
        for split in splits:
            if self._count_tokens(split[0]) < self.chunk_token_size:
                good_splits.append(split)
            else:
                if good_splits:
                    final_chunks.extend(self._merge_splits_with_spans(good_splits, separator))
                    good_splits = []
                if not new_separators:
                    final_chunks.append(split)
                else:
                    final_chunks.extend(
                        self._split_text_with_spans(split[0], base_offset=split[1], separators=new_separators)
                    )
        if good_splits:
            final_chunks.extend(self._merge_splits_with_spans(good_splits, separator))
        return final_chunks

    def _merge_splits_with_spans(
        self, splits: Sequence[_SpanPiece], separator: str,
    ) -> list[_SpanPiece]:
        separator_len = self._count_tokens(separator) if separator else 0
        docs: list[_SpanPiece] = []
        current_doc: list[_SpanPiece] = []
        total = 0

        for split in splits:
            split_len = self._count_tokens(split[0])
            if (
                total + split_len + (separator_len if len(current_doc) > 0 else 0)
                > self.chunk_token_size
            ):
                if len(current_doc) > 0:
                    doc = self._join_span_pieces(current_doc, separator)
                    if doc is not None:
                        docs.append(doc)
                    while total > self.chunk_overlap or (
                        total + split_len + (separator_len if len(current_doc) > 0 else 0)
                        > self.chunk_token_size
                        and total > 0
                    ):
                        total -= self._count_tokens(current_doc[0][0]) + (
                            separator_len if len(current_doc) > 1 else 0
                        )
                        current_doc = current_doc[1:]
            current_doc.append(split)
            total += split_len + (separator_len if len(current_doc) > 1 else 0)

        doc = self._join_span_pieces(current_doc, separator)
        if doc is not None:
            docs.append(doc)
        return docs

    @staticmethod
    def _split_text_with_regex_spans(
        text: str, separator_pattern: str, *, base_offset: int,
    ) -> list[_SpanPiece]:
        if not separator_pattern:
            return [
                (char, base_offset + i, base_offset + i + 1)
                for i, char in enumerate(text)
                if char
            ]

        matches = list(re.finditer(separator_pattern, text))
        if not matches:
            return [(text, base_offset, base_offset + len(text))] if text else []

        pieces: list[_SpanPiece] = []
        cursor = 0
        for match in matches:
            if match.start() > cursor:
                pieces.append((
                    text[cursor:match.start()],
                    base_offset + cursor,
                    base_offset + match.start(),
                ))
            cursor = match.end()
        if cursor < len(text):
            pieces.append((
                text[cursor:],
                base_offset + cursor,
                base_offset + len(text),
            ))

        return [p for p in pieces if p[0]]

    @staticmethod
    def _join_span_pieces(pieces: list[_SpanPiece], separator: str) -> _SpanPiece | None:
        if not pieces:
            return None

        chars: list[str] = []
        char_offsets: list[int] = []
        for index, (fragment, start, end) in enumerate(pieces):
            if index > 0 and separator:
                previous_end = pieces[index - 1][2]
                for sep_index, sep_char in enumerate(separator):
                    chars.append(sep_char)
                    char_offsets.append(previous_end + sep_index)
            chars.extend(fragment)
            char_offsets.extend(range(start, end))

        text = "".join(chars)
        left = 0
        right = len(text)
        while left < right and text[left].isspace():
            left += 1
        while right > left and text[right - 1].isspace():
            right -= 1

        if left >= right:
            return None
        return text[left:right], char_offsets[left], char_offsets[right - 1] + 1

    @staticmethod
    def _count_tokens(text: str) -> int:
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4o")
        return len(enc.encode(text, disallowed_special=()))
