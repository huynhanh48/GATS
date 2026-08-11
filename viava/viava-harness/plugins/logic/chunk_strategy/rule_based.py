import re
import time
from typing import Any

from core.chunk_strategy.base import BaseChunkStrategy
from core.chunk_strategy.models import Chunk, ChunkResult



class FixedTokenChunkStrategy(BaseChunkStrategy):
    """Chia theo token-ID window (BPE-accurate).

    Gộp FixedSize + SlidingWindow — khi overlap=0 là fixed, overlap>0 là sliding.
    Hỗ trợ split_by_character delimiter-aware mode.
    """

    strategy_name = "fixed-token"

    def __init__(
        self,
        chunk_token_size: int = 1200,
        chunk_overlap: int = 100,
        chunk_by: str = "token",
        split_by_character: str | None = None,
        split_by_character_only: bool = False,
        emit_source_span: bool = True,
    ):
        if chunk_overlap >= chunk_token_size:
            raise ValueError(f"chunk_overlap ({chunk_overlap}) must be < chunk_token_size ({chunk_token_size})")
        self.chunk_token_size = chunk_token_size
        self.chunk_overlap = chunk_overlap
        self.chunk_by = chunk_by
        self.split_by_character = split_by_character
        self.split_by_character_only = split_by_character_only
        self.emit_source_span = emit_source_span

    async def chunk(self, text: str) -> ChunkResult:
        start_time = time.time()
        if not text:
            return ChunkResult(chunks=[], total_tokens=0, strategy_name=self.strategy_name, execution_time_ms=0.0)

        import tiktoken

        enc = tiktoken.encoding_for_model("gpt-4o")

        if self.chunk_by == "char":
            chunks = self._split_by_char_sliding(text)
        elif self.split_by_character:
            chunks = self._split_by_delimiter(text, enc)
        else:
            chunks = self._split_by_token_window(text, enc)

        elapsed = (time.time() - start_time) * 1000
        total_tokens = sum(c.token_count for c in chunks)
        return ChunkResult(chunks=chunks, total_tokens=total_tokens, strategy_name=self.strategy_name, execution_time_ms=elapsed)

    def _split_by_token_window(self, text: str, enc) -> list[Chunk]:
        tokens = enc.encode(text, disallowed_special=())
        if not tokens:
            return []

        step = self.chunk_token_size - self.chunk_overlap
        if step <= 0:
            step = 1

        chunks: list[Chunk] = []
        anchor = (0, 0)
        idx = 0

        for i in range(0, len(tokens), step):
            end_token = min(i + self.chunk_token_size, len(tokens))
            window = enc.decode(tokens[i:end_token])

            source_span = None
            if self.emit_source_span:
                source_span, anchor = self._compute_source_span(text, tokens, i, end_token, enc, anchor)

            metadata: dict[str, Any] = {}
            if source_span:
                metadata["start_char"] = source_span["start"]
                metadata["end_char"] = source_span["end"]
                metadata["_source_span"] = source_span

            chunk_tokens = len(tokens[i:end_token])
            chunks.append(Chunk(
                content=window.strip(),
                index=idx,
                metadata=metadata,
                token_count=chunk_tokens,
            ))
            idx += 1

        return chunks

    def _compute_source_span(
        self, content: str, tokens: list[int], start_token: int, end_token: int, enc, anchor: tuple[int, int]
    ) -> tuple[dict[str, int] | None, tuple[int, int]]:
        anchor_token, anchor_char = anchor
        window = enc.decode(tokens[start_token:end_token])

        if start_token >= anchor_token:
            start = anchor_char + len(enc.decode(tokens[anchor_token:start_token]))
        else:
            start = len(enc.decode(tokens[:start_token]))

        end = start + len(window)

        if content[start:end] != window:
            found = content.find(
                window,
                max(0, start - 32),
                min(len(content), end + 32 + len(window)),
            )
            if found < 0:
                return None, anchor
            start = found
            end = found + len(window)

        span = _source_span_fn(content, start, end)
        return span, (start_token, start)

    def _split_by_char_sliding(self, text: str) -> list[Chunk]:
        step = self.chunk_token_size - self.chunk_overlap
        if step <= 0:
            step = 1
        chunks: list[Chunk] = []
        idx = 0
        i = 0
        while i < len(text):
            segment = text[i:i + self.chunk_token_size]
            metadata: dict[str, Any] = {"start_char": i, "end_char": min(i + self.chunk_token_size, len(text))}
            if self.emit_source_span:
                metadata["_source_span"] = {"start": i, "end": min(i + self.chunk_token_size, len(text))}
            chunks.append(Chunk(content=segment, index=idx, metadata=metadata))
            idx += 1
            i += step
            if i >= len(text):
                break
        return chunks

    def _split_by_delimiter(self, text: str, enc) -> list[Chunk]:
        raw_chunks = text.split(self.split_by_character)
        raw_spans: list[tuple[int, int]] = []
        cursor = 0
        for rc in raw_chunks:
            s = cursor
            e = s + len(rc)
            raw_spans.append((s, e))
            cursor = e + len(self.split_by_character)

        chunks: list[Chunk] = []
        idx = 0
        for chunk_text, (cs, ce) in zip(raw_chunks, raw_spans):
            if not chunk_text:
                continue
            t = enc.encode(chunk_text, disallowed_special=())
            if self.split_by_character_only:
                if len(t) > self.chunk_token_size:
                    raise ValueError(
                        f"Chunk exceeds token limit: {len(t)} > {self.chunk_token_size} "
                        f"('{chunk_text[:120]}...')"
                    )
                span = _source_span_fn(text, cs, ce) if self.emit_source_span else None
                metadata = self._make_metadata(cs, ce, span)
                chunks.append(Chunk(content=chunk_text, index=idx, metadata=metadata, token_count=len(t)))
                idx += 1
            else:
                if len(t) > self.chunk_token_size:
                    anchor = (0, 0)
                    step = self.chunk_token_size - self.chunk_overlap
                    if step <= 0:
                        step = 1
                    for i in range(0, len(t), step):
                        et = min(i + self.chunk_token_size, len(t))
                        sub_text = enc.decode(t[i:et])
                        span = None
                        if self.emit_source_span:
                            span, anchor = self._compute_source_span(text, t, i, et, enc, anchor)
                        metadata = self._make_metadata(cs, ce, span)
                        chunks.append(Chunk(content=sub_text, index=idx, metadata=metadata, token_count=min(self.chunk_token_size, len(t) - i)))
                        idx += 1
                else:
                    span = _source_span_fn(text, cs, ce) if self.emit_source_span else None
                    metadata = self._make_metadata(cs, ce, span)
                    chunks.append(Chunk(content=chunk_text, index=idx, metadata=metadata, token_count=len(t)))
                    idx += 1
        return chunks

    @staticmethod
    def _make_metadata(cs: int, ce: int, span: dict | None) -> dict[str, Any]:
        meta: dict[str, Any] = {"start_char": cs, "end_char": ce}
        if span:
            meta["_source_span"] = span
        return meta


def _source_span_fn(content: str, start: int, end: int) -> dict[str, int] | None:
    s = max(0, min(start, len(content)))
    e = max(s, min(end, len(content)))
    while s < e and content[s].isspace():
        s += 1
    while e > s and content[e - 1].isspace():
        e -= 1
    if s >= e:
        return None
    return {"start": s, "end": e}
