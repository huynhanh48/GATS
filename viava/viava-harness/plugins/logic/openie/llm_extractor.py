from __future__ import annotations

import asyncio
import logging
from typing import Any

from core.llm import LLMInput, LLMMessage, LLMOutput, BaseLLM
from capabilities.information_extraction import (
    BaseExtractor,
    ExtractionResult,
)

from .config import (
    DEFAULT_LANGUAGE,
    DEFAULT_MAX_ENTITY_RECORDS,
    DEFAULT_MAX_TOTAL_RECORDS,
)
from .prompts import (
    ENTITY_TYPES_GUIDANCE,
    EXTRACTION_SYSTEM,
    EXTRACTION_USER,
    JSON_EXAMPLE,
)

logger = logging.getLogger(__name__)


class LLMExtractor(BaseExtractor):
    """Trích xuất entity + relationship từ văn bản dùng LLM với JSON structured output

    Prompt được dịch từ LightRAG, dùng JSON mode để có chất lượng trích xuất cao hơn.
    Nhận BaseLLM qua constructor DI — hoạt động với mọi provider.
    """

    def __init__(
        self,
        llm: BaseLLM,
        *,
        max_total_records: int = DEFAULT_MAX_TOTAL_RECORDS,
        max_entity_records: int = DEFAULT_MAX_ENTITY_RECORDS,
        language: str = DEFAULT_LANGUAGE,
        batch_processor: Any | None = None,
    ) -> None:
        self._llm = llm
        self._max_total_records = max_total_records
        self._max_entity_records = max_entity_records
        self._language = language
        self._batch_processor = batch_processor

    def _text_to_llm_input(self, text: str) -> LLMInput:
        system_prompt = (
            EXTRACTION_SYSTEM
            .replace("{entity_types_guidance}", ENTITY_TYPES_GUIDANCE)
            .replace("{json_example}", JSON_EXAMPLE)
            .replace("{max_total_records}", str(self._max_total_records))
            .replace("{max_entity_records}", str(self._max_entity_records))
            .replace("{language}", self._language)
        )
        user_prompt = (
            EXTRACTION_USER
            .replace("{entity_types_guidance}", ENTITY_TYPES_GUIDANCE)
            .replace("{max_total_records}", str(self._max_total_records))
            .replace("{max_entity_records}", str(self._max_entity_records))
            .replace("{language}", self._language)
            .replace("{input_text}", text)
        )
        return LLMInput(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_prompt),
            ],
            user_id="system",
            stream=False,
            temperature=0.0,
            output_parser=ExtractionResult(),
            tools=None,
        )

    def _llm_output_to_result(self, output: LLMOutput) -> ExtractionResult:
        if output.content is None:
            return ExtractionResult()
        if isinstance(output.content, ExtractionResult):
            return output.content
        try:
            return ExtractionResult.model_validate_json(str(output.content))
        except Exception:
            logger.warning("Failed to parse LLM output as ExtractionResult", exc_info=True)
        return ExtractionResult()

    async def extract(self, text: str) -> ExtractionResult:
        if not text.strip():
            return ExtractionResult()

        llm_input = self._text_to_llm_input(text)

        try:
            output = await self._llm.chat(llm_input)
        except Exception:
            logger.warning("Entity extraction LLM call failed", exc_info=True)
            return ExtractionResult()

        return self._llm_output_to_result(output)

    async def extract_batch(self, texts: list[str]) -> list[ExtractionResult]:
        if not texts:
            return []

        inputs = [
            self._text_to_llm_input(t)
            for t in texts
            if t.strip()
        ]

        if not inputs:
            return [ExtractionResult() for _ in texts]

        if self._batch_processor is not None:
            outputs = await self._batch_processor.process(inputs)
        else:
            sem = asyncio.Semaphore(10)
            async def _one(inp):
                async with sem:
                    return await self._llm.chat(inp)
            outputs = await asyncio.gather(*[_one(inp) for inp in inputs])

        return [self._llm_output_to_result(o) for o in outputs]
