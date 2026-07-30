import math
import re
import time

import numpy as np

from core.chunk_strategy.base import BaseChunkStrategy
from core.chunk_strategy.models import Chunk, ChunkResult
from core.embedding import BaseEmbedding


DEFAULT_SENTENCE_SPLIT_REGEX = r"(?<=[.?!])\s+|(?<=[。？！])"

_VALID_THRESHOLD_TYPES = {"percentile", "standard_deviation", "interquartile", "gradient"}

_DEFAULT_THRESHOLD_AMOUNTS = {
    "percentile": 95.0,
    "standard_deviation": 3.0,
    "interquartile": 1.5,
    "gradient": None,
}


class SemanticChunkStrategy(BaseChunkStrategy):
    """Chia khi chủ đề thay đổi, dùng embedding similarity.

    4 loại breakpoint threshold (mirror LightRAG + LangChain SemanticChunker):
      - percentile:        break nếu distance > percentile(distances, amt)
      - standard_deviation: break nếu distance > mean + amt * std
      - interquartile:     break nếu distance > Q3 + amt * IQR
      - gradient:          break tại local maxima của diff(distances) > mean

    Fallback: nếu embedding=None → recursive (overlap=0)
    Re-split: chunk vượt chunk_token_size → recursive (overlap=0)
    """

    strategy_name = "semantic"

    def __init__(
        self,
        embedding: BaseEmbedding | None,
        chunk_token_size: int = 1200,
        breakpoint_threshold_type: str = "percentile",
        breakpoint_threshold_amount: float | None = None,
        buffer_size: int = 1,
        min_chunk_size: int | None = None,
        number_of_chunks: int | None = None,
        sentence_split_regex: str = DEFAULT_SENTENCE_SPLIT_REGEX,
    ):
        if breakpoint_threshold_type not in _VALID_THRESHOLD_TYPES:
            raise ValueError(
                f"breakpoint_threshold_type must be one of {_VALID_THRESHOLD_TYPES}, "
                f"got '{breakpoint_threshold_type}'"
            )
        self.embedding = embedding
        self.chunk_token_size = max(int(chunk_token_size), 1)
        self.breakpoint_threshold_type = breakpoint_threshold_type
        self.breakpoint_threshold_amount = breakpoint_threshold_amount
        self.buffer_size = max(int(buffer_size), 1)
        self.min_chunk_size = min_chunk_size
        self.number_of_chunks = number_of_chunks
        self.sentence_split_regex = sentence_split_regex

    async def chunk(self, text: str) -> ChunkResult:
        start_time = time.time()
        if not text:
            return ChunkResult(chunks=[], total_tokens=0, strategy_name=self.strategy_name, execution_time_ms=0.0)

        if self.embedding is None:
            from plugins.logic.chunk_strategy.recursive import RecursiveChunkStrategy
            fallback = RecursiveChunkStrategy(chunk_token_size=self.chunk_token_size, chunk_overlap=0)
            result = await fallback.chunk(text)
            return ChunkResult(
                chunks=result.chunks,
                total_tokens=result.total_tokens,
                strategy_name=self.strategy_name,
                execution_time_ms=result.execution_time_ms,
            )

        sentences = self._split_sentences(text)
        if not sentences:
            return ChunkResult(chunks=[], total_tokens=0, strategy_name=self.strategy_name, execution_time_ms=0.0)

        spans = self._sentence_spans(text, sentences)
        windows = []
        window_spans = []
        for i in range(0, len(sentences), self.buffer_size):
            group = sentences[i:i + self.buffer_size]
            windows.append(" ".join(group))
            s_start, _ = spans[i]
            _, s_end = spans[min(i + self.buffer_size, len(sentences)) - 1]
            window_spans.append((s_start, s_end))

        if len(windows) == 1:
            chunks = self._make_chunks(text, windows, window_spans)
            return self._finalize(chunks, start_time)

        try:
            embeddings = await self.embedding.embed_batch(windows)
        except Exception:
            from plugins.logic.chunk_strategy.recursive import RecursiveChunkStrategy
            fallback = RecursiveChunkStrategy(chunk_token_size=self.chunk_token_size, chunk_overlap=0)
            result = await fallback.chunk(text)
            return ChunkResult(
                chunks=result.chunks,
                total_tokens=result.total_tokens,
                strategy_name=self.strategy_name,
                execution_time_ms=result.execution_time_ms,
            )
        embeddings = [list(map(float, v)) for v in embeddings]

        distances = self._compute_distances(embeddings)
        breakpoint_indices = self._find_breakpoints(distances)

        chunk_windows = []
        chunk_window_spans = []
        start_idx = 0
        for bp in breakpoint_indices:
            merged = " ".join(windows[start_idx:bp + 1])
            s_start, _ = window_spans[start_idx]
            _, s_end = window_spans[bp]
            if self.min_chunk_size is not None and len(merged) < self.min_chunk_size:
                continue
            chunk_windows.append(merged)
            chunk_window_spans.append((s_start, s_end))
            start_idx = bp + 1

        if start_idx < len(windows):
            merged = " ".join(windows[start_idx:])
            s_start, _ = window_spans[start_idx]
            _, s_end = window_spans[-1]
            chunk_windows.append(merged)
            chunk_window_spans.append((s_start, s_end))

        chunks = self._make_chunks(text, chunk_windows, chunk_window_spans)
        chunks = await self._resplit_oversized(chunks)

        return self._finalize(chunks, start_time)

    def _compute_distances(self, embeddings: list[list[float]]) -> list[float]:
        distances: list[float] = []
        for i in range(1, len(embeddings)):
            dist = 1.0 - self._cosine_similarity(embeddings[i - 1], embeddings[i])
            distances.append(max(0.0, dist))
        return distances

    def _find_breakpoints(self, distances: list[float]) -> list[int]:
        if self.number_of_chunks is not None:
            k = self.number_of_chunks
            if k <= 1:
                return []
            sorted_indices = sorted(range(len(distances)), key=lambda i: distances[i], reverse=True)
            top_indices = sorted(sorted_indices[:k - 1])
            return top_indices

        threshold_amount = self.breakpoint_threshold_amount
        if threshold_amount is None:
            threshold_amount = _DEFAULT_THRESHOLD_AMOUNTS.get(self.breakpoint_threshold_type, 95.0)

        if self.breakpoint_threshold_type == "percentile":
            if threshold_amount is None:
                threshold_amount = 95.0
            threshold = float(np.percentile(distances, threshold_amount))
            breakpoint_array = distances

        elif self.breakpoint_threshold_type == "standard_deviation":
            if threshold_amount is None:
                threshold_amount = 3.0
            threshold = float(np.mean(distances) + threshold_amount * np.std(distances))
            breakpoint_array = distances

        elif self.breakpoint_threshold_type == "interquartile":
            if threshold_amount is None:
                threshold_amount = 1.5
            q1 = float(np.percentile(distances, 25))
            q3 = float(np.percentile(distances, 75))
            iqr = q3 - q1
            threshold = q3 + threshold_amount * iqr
            breakpoint_array = distances

        elif self.breakpoint_threshold_type == "gradient":
            grad = np.diff(distances).tolist()
            if threshold_amount is None:
                threshold_amount = float(np.mean([abs(g) for g in grad]))
            breakpoint_array = grad
            threshold = threshold_amount

        else:
            return []

        return [i for i, x in enumerate(breakpoint_array) if x > threshold]

    def _split_sentences(self, text: str) -> list[str]:
        sentences = re.split(self.sentence_split_regex, text.strip())
        return [s.strip() for s in sentences if s.strip()]

    @staticmethod
    def _sentence_spans(text: str, sentences: list[str]) -> list[tuple[int, int]]:
        spans: list[tuple[int, int]] = []
        cursor = 0
        for s in sentences:
            if not s:
                spans.append((cursor, cursor))
                continue
            start = text.find(s, cursor)
            if start < 0:
                start = cursor
            if start < 0:
                start = cursor
            end = start + len(s)
            spans.append((start, end))
            cursor = end
        return spans

    @staticmethod
    def _cosine_similarity(a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def _make_chunks(self, text: str, contents: list[str], spans: list[tuple[int, int]]) -> list[Chunk]:
        chunks: list[Chunk] = []
        for idx, (content, (s_start, s_end)) in enumerate(zip(contents, spans)):
            s, e = self._trim_span(text, s_start, s_end)
            if s >= e:
                continue
            chunks.append(Chunk(
                content=text[s:e].strip(),
                index=idx,
                metadata={
                    "start_char": s,
                    "end_char": e,
                    "_source_span": {"start": s, "end": e},
                },
                token_count=self._count_tokens(text[s:e].strip()),
            ))
        return chunks

    async def _resplit_oversized(self, chunks: list[Chunk]) -> list[Chunk]:
        from plugins.logic.chunk_strategy.recursive import RecursiveChunkStrategy
        fallback = RecursiveChunkStrategy(chunk_token_size=self.chunk_token_size, chunk_overlap=0)

        result: list[Chunk] = []
        for c in chunks:
            if (c.token_count or 0) <= self.chunk_token_size:
                result.append(c)
                continue
            sub_result = await fallback.chunk(c.content)
            source_start = c.metadata.get("start_char", 0)
            for sub in sub_result.chunks:
                sub_span = sub.metadata.get("_source_span")
                adjusted_span = None
                if isinstance(sub_span, dict):
                    adjusted_span = {
                        "start": source_start + sub_span.get("start", 0),
                        "end": source_start + sub_span.get("end", 0),
                    }
                result.append(Chunk(
                    content=sub.content,
                    index=len(result),
                    metadata={
                        "start_char": adjusted_span["start"] if adjusted_span else source_start,
                        "end_char": adjusted_span["end"] if adjusted_span else source_start + len(sub.content),
                        "_source_span": adjusted_span or {},
                    },
                    token_count=sub.token_count,
                ))
        return result

    @staticmethod
    def _trim_span(text: str, start: int, end: int) -> tuple[int, int]:
        s = max(0, min(start, len(text)))
        e = max(s, min(end, len(text)))
        while s < e and text[s].isspace():
            s += 1
        while e > s and text[e - 1].isspace():
            e -= 1
        return s, e

    @staticmethod
    def _count_tokens(text: str) -> int:
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4o")
        return len(enc.encode(text, disallowed_special=()))

    def _finalize(self, chunks: list[Chunk], start_time: float) -> ChunkResult:
        elapsed = (time.time() - start_time) * 1000
        total_tokens = sum(c.token_count or 0 for c in chunks)
        return ChunkResult(chunks=chunks, total_tokens=total_tokens, strategy_name=self.strategy_name, execution_time_ms=elapsed)
