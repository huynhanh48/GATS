from __future__ import annotations

import logging

from capabilities.teaching import TeachingAgentBase
from capabilities.teaching.models import Evaluation, Explanation, Summary
from capabilities.web_search import WebSearchBase
from servers.rest_api.exceptions import AppError

logger = logging.getLogger(__name__)


class TeachingService:
    def __init__(self, teaching: TeachingAgentBase, web_search: WebSearchBase | None = None) -> None:
        self._teaching = teaching
        self._web_search = web_search

    async def evaluate(self, question: str, student_answer: str, reference_answer: str | None) -> Evaluation:
        try:
            return await self._teaching.evaluate_answer(question, student_answer, reference_answer)
        except Exception as e:
            raise AppError("GENERATION_FAILED", "Lỗi khi đánh giá câu trả lời", str(e)) from e

    async def explain(self, concept: str, context: str | None, level: str, max_words: int, use_web_search: bool) -> Explanation:
        try:
            if use_web_search and self._web_search:
                search_context = await self._search_context(concept)
                if search_context:
                    context = (context or "") + "\n\nKết quả tìm kiếm:\n" + search_context
            return await self._teaching.explain_concept(concept, level, max_words)
        except Exception as e:
            raise AppError("GENERATION_FAILED", "Lỗi khi giải thích khái niệm", str(e)) from e

    async def summarize(self, content: str, level: str, max_points: int) -> Summary:
        try:
            return await self._teaching.summarize_topic(content, level, max_points)
        except Exception as e:
            raise AppError("GENERATION_FAILED", "Lỗi khi tóm tắt nội dung", str(e)) from e

    async def _search_context(self, query: str) -> str:
        try:
            result = await self._web_search.search(query)
            items = result.items[:3] if result.items else []
            return "\n".join(f"- {item.title}: {item.snippet}" for item in items)
        except Exception:
            logger.warning("Web search failed for query: %s", query, exc_info=True)
            return ""
