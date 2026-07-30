import time
from core.chunk_strategy.base import BaseChunkStrategy
from core.chunk_strategy.models import Chunk, ChunkResult
from core.llm import BaseLLM


SPLIT_PROMPT = """Split the following text into coherent, self-contained sections.
Separate each section with the marker: ===CHUNK===
Do not add any commentary. Return ONLY the sections with the marker.

Text to split:
{text}"""


class LLMBasedChunkStrategy(BaseChunkStrategy):
    """Dùng LLM để xác định điểm cắt chunk."""

    strategy_name = "llm-based"

    def __init__(self, llm: BaseLLM, split_prompt: str | None = None):
        self.llm = llm
        self.split_prompt = split_prompt or SPLIT_PROMPT

    async def chunk(self, text: str) -> ChunkResult:
        start_time = time.time()
        if not text:
            return ChunkResult(chunks=[], strategy_name=self.strategy_name, execution_time_ms=0.0)

        from core.llm.models import LLMMessage, LLMInput, FinishReason

        prompt = self.split_prompt.format(text=text)
        messages = [LLMMessage(role="user", content=prompt)]
        llm_input = LLMInput(messages=messages)
        llm_output = await self.llm.chat(llm_input)

        if llm_output.finish_reason not in {FinishReason.STOP, FinishReason.LENGTH}:
            raise RuntimeError(f"LLM chunking failed with reason: {llm_output.finish_reason}")

        sections = [s.strip() for s in llm_output.content.split("===CHUNK===") if s.strip()]

        if not sections:
            return ChunkResult(chunks=[Chunk(content=text.strip(), index=0)], strategy_name=self.strategy_name)

        chunks: list[Chunk] = []
        for idx, section in enumerate(sections):
            chunks.append(Chunk(content=section, index=idx))

        elapsed = (time.time() - start_time) * 1000
        return ChunkResult(chunks=chunks, strategy_name=self.strategy_name, execution_time_ms=elapsed)