from __future__ import annotations

import logging

from capabilities.retrieval_augmented_generation import BaseRAG
from capabilities.retrieval_augmented_generation.models import (
    GenerationParam,
    RetrievalParam,
)

logger = logging.getLogger(__name__)


class ChatbotService:
    def __init__(self, rag: BaseRAG) -> None:
        self._rag = rag

    async def chat(self, query: str, domains: list[str] | None = None) -> tuple[str, list[str]]:
        logger.info("Chatbot query (domains=%s): %s", domains, query)
        retrieval_param = RetrievalParam(domains=domains) if domains else RetrievalParam()
        ctx = await self._rag.aretrieve(query, retrieval_param)
        result = await self._rag.agenerate(query, ctx, GenerationParam())
        return result.content, ctx.references
