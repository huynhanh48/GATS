import re
import time
from core.chunk_strategy.base import BaseChunkStrategy
from core.chunk_strategy.models import Chunk, ChunkResult
from core.graph_storage import BaseGraphStorage
from core.llm import BaseLLM


_SQL_CHUNK_PROMPT = """\
Chia tài liệu SQL sau thành các đoạn (chunk) có ý nghĩa, độc lập và tự chứa đủ thông tin để trả lời câu hỏi.

QUY TẮC QUAN TRỌNG:
- Mỗi đoạn PHẢI được phân cách bằng dấu: ===CHUNK===
- Giữ nguyên nội dung gốc, KHÔNG được viết lại hay tóm tắt
- Đối với tài liệu (documentation): mỗi bảng dữ liệu (data dictionary) và các trường của nó nằm trong cùng một đoạn
- Đối với ví dụ SQL: mỗi cặp câu hỏi + câu SQL nằm trong cùng một đoạn
- Không tách câu hỏi khỏi câu SQL của nó
- Không thêm bất kỳ bình luận hay giải thích nào

Tài liệu:
{text}"""


class SQLChunkStrategy(BaseChunkStrategy):
    strategy_name = "sql"

    _DDL_BOUNDARY = re.compile(
        r'(?=^(?:CREATE\s+(?:TABLE|INDEX|UNIQUE\s+INDEX|OR\s+REPLACE)|COMMENT\s+ON\s+TABLE))',
        re.MULTILINE | re.IGNORECASE,
    )

    _SECTION_BOUNDARY = re.compile(
        r'(?=^\d+\.(?:\w+\.)?\s+\S)',
        re.MULTILINE,
    )

    def __init__(
        self,
        llm: BaseLLM,
        chunk_token_size: int = 1200,
        chunk_overlap: int = 0,
        split_prompt: str | None = None,
    ):
        from utils.uitls import count_tokens
        self.llm = llm
        self.chunk_token_size = chunk_token_size
        self.chunk_overlap = chunk_overlap
        self.split_prompt = split_prompt or _SQL_CHUNK_PROMPT
        self._count_tokens = staticmethod(count_tokens)

    async def chunk(self, text: str, *args, **kwargs) -> ChunkResult:
        start_time = time.time()
        if not text or not text.strip():
            return ChunkResult(
                chunks=[],
                total_tokens=0,
                strategy_name=self.strategy_name,
                execution_time_ms=0.0,
            )

        category = kwargs.get("category", "documentation")

        if category == "ddl":
            blocks = self._split_ddl(text)
        else:
            blocks = await self._split_with_llm(text)

        chunks = self._merge_blocks(blocks, category)
        elapsed = (time.time() - start_time) * 1000
        total_tokens = sum(c.token_count for c in chunks)
        return ChunkResult(
            chunks=chunks,
            total_tokens=total_tokens,
            strategy_name=self.strategy_name,
            execution_time_ms=elapsed,
        )

    def _detect_type(self, text: str) -> str:
        if re.search(r'CREATE\s+TABLE\s+\w+', text, re.IGNORECASE):
            return "ddl"
        return "sql_doc"

    def _split_ddl(self, text: str) -> list[str]:
        parts = self._DDL_BOUNDARY.split(text.strip())
        blocks: list[str] = []

        pending: list[str] = []
        for part in parts:
            stripped = part.strip()
            if not stripped:
                continue
            if re.match(r'CREATE\s+TABLE\s+\w+', stripped, re.IGNORECASE):
                if pending:
                    blocks.append("\n\n".join(pending))
                    pending = []
                pending.append(stripped)
            elif re.match(r'COMMENT\s+ON\s+TABLE\s+', stripped, re.IGNORECASE):
                pending.append(stripped)
            elif re.match(r'CREATE\s+(?:UNIQUE\s+)?INDEX\s+', stripped, re.IGNORECASE):
                pending.append(stripped)
            else:
                if pending:
                    pending.append(stripped)
                else:
                    blocks.append(stripped)

        if pending:
            blocks.append("\n\n".join(pending))

        return blocks

    async def _split_with_llm(self, text: str) -> list[str]:
        from core.llm.models import LLMMessage, LLMInput

        try:
            prompt = self.split_prompt.format(text=text)
            messages = [LLMMessage(role="user", content=prompt)]
            llm_input = LLMInput(messages=messages, user_id="sql_chunk")
            llm_output = await self.llm.chat(llm_input)
        except Exception:
            return self._split_by_sections(text)

        sections = [
            s.strip()
            for s in (llm_output.content or "").split("===CHUNK===")
            if s.strip()
        ]

        if sections:
            return sections

        return self._split_by_sections(text)

    def _split_by_sections(self, text: str) -> list[str]:
        parts = self._SECTION_BOUNDARY.split(text.strip())

        if len(parts) <= 1:
            return [text.strip()]

        blocks: list[str] = []
        for part in parts:
            stripped = part.strip()
            if not stripped:
                continue
            blocks.append(stripped)

        return blocks

    def _merge_blocks(self, blocks: list[str], content_type: str) -> list[Chunk]:
        if not blocks:
            return []

        chunks: list[Chunk] = []
        idx = 0
        buffer: str = ""
        buffer_tokens: int = 0

        for block in blocks:
            block_tokens = self._count_tokens(block)

            if block_tokens >= self.chunk_token_size:
                if buffer:
                    chunks.append(self._make_chunk(buffer, idx, content_type))
                    idx += 1
                    buffer = ""
                    buffer_tokens = 0

                chunks.append(self._make_chunk(block, idx, content_type))
                idx += 1
                continue

            if buffer_tokens + block_tokens > self.chunk_token_size and buffer:
                chunks.append(self._make_chunk(buffer, idx, content_type))
                idx += 1
                buffer = block
                buffer_tokens = block_tokens
            else:
                joiner = "\n\n" if buffer else ""
                buffer = buffer + joiner + block if buffer else block
                buffer_tokens += block_tokens

        if buffer:
            chunks.append(self._make_chunk(buffer, idx, content_type))

        return chunks

    def _make_chunk(self, content: str, index: int, content_type: str) -> Chunk:
        return Chunk(
            content=content,
            index=index,
            token_count=self._count_tokens(content),
            metadata={
                "sql_content_type": content_type,
            },
        )