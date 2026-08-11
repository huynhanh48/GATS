from __future__ import annotations

import asyncio
import json
import logging

from capabilities.course_exercises import BaseCourseExercises
from capabilities.course_exercises.models import (
    CodingExercise,
    CourseGenConfig,
    FillInBlankExercise,
    FlashcardEntity,
    LearningPath,
    MCQExercise,
    MatchingExercise,
    OrderingExercise,
    ShortAnswerExercise,
    TrueFalseExercise,
)
from capabilities.retrieval_augmented_generation import BaseRAG
from capabilities.retrieval_augmented_generation.models import (
    DocInsert,
    RetrievalContext,
    RetrievalParam,
)
from core.llm import BaseLLM, LLMInput, LLMMessage
from .prompts import (
    CODING_SYSTEM,
    CODING_USER,
    FILL_IN_BLANK_SYSTEM,
    FILL_IN_BLANK_USER,
    FLASHCARD_SYSTEM,
    FLASHCARD_USER,
    LEARNING_PATH_SYSTEM,
    LEARNING_PATH_USER,
    MATCHING_SYSTEM,
    MATCHING_USER,
    MCQ_SYSTEM,
    MCQ_USER,
    ORDERING_SYSTEM,
    ORDERING_USER,
    SHORT_ANSWER_SYSTEM,
    SHORT_ANSWER_USER,
    TRUE_FALSE_SYSTEM,
    TRUE_FALSE_USER,
)

logger = logging.getLogger(__name__)


class LLMCourseGenerator(BaseCourseExercises):
    """Triển khai BaseCourseExercises — LLM + RAG.

    Constructor DI: nhận BaseLLM và BaseRAG.
    generate_learning_path: ingest content vào RAG + LLM sinh learning path (song song).
    generate_exercises_by_type: retrieve context từ RAG cho từng milestone, LLM sinh bài tập.
    """

    def __init__(self, llm: BaseLLM, rag: BaseRAG) -> None:
        self._llm = llm
        self._rag = rag

    # ── helpers ──────────────────────────────────────────

    async def _call_llm_single(
        self, system_prompt: str, user_message: str, output_model: type,
    ):
        llm_input = LLMInput(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_message),
            ],
            user_id="course-generator",
            stream=False,
            temperature=0.3,
            output_parser=output_model(),
            tools=None,
        )
        output = await self._llm.chat(llm_input)
        if isinstance(output.content, output_model):
            return output.content
        raise ValueError(
            f"LLM không trả về {output_model.__name__}, "
            f"nhận được: {type(output.content).__name__}"
        )

    async def _call_llm_list(
        self, system_prompt: str, user_message: str, item_model: type,
    ) -> list:
        llm_input = LLMInput(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_message),
            ],
            user_id="course-generator",
            stream=False,
            temperature=0.3,
            tools=None,
        )
        output = await self._llm.chat(llm_input)
        raw = output.content or ""
        items = json.loads(raw)
        return [item_model.model_validate(item) for item in items]

    @staticmethod
    def _format_rag_context(ctx: RetrievalContext) -> str:
        parts: list[str] = []

        if ctx.entities:
            parts.append("THỰC THỂ LIÊN QUAN:")
            for e in ctx.entities:
                name = e.id.split("<SEP>")[-1] if "<SEP>" in e.id else e.id
                desc = e.description or ""
                parts.append(f"  - {name}: {desc}")

        if ctx.relations:
            parts.append("\nMỐI QUAN HỆ:")
            for r in ctx.relations:
                src = r.source.split("<SEP>")[-1] if "<SEP>" in r.source else r.source
                dst = r.destination.split("<SEP>")[-1] if "<SEP>" in r.destination else r.destination
                desc = r.description or ""
                parts.append(f"  - {src} -> {dst}: {desc}")

        if ctx.chunks:
            parts.append("\nĐOẠN VĂN LIÊN QUAN:")
            for i, c in enumerate(ctx.chunks, 1):
                content = c.get("content", "") if isinstance(c, dict) else str(c)
                if content:
                    parts.append(f"  [{i}] {content[:500]}...")

        return "\n".join(parts) if parts else ""

    # ── public methods ───────────────────────────────────

    async def generate_learning_path(
        self, doc: DocInsert, config: CourseGenConfig,
    ) -> LearningPath:
        if not doc.domain:
            raise ValueError("DocInsert.domain là bắt buộc — không được để None hoặc empty")

        full_text = "\n\n".join(doc.contents)

        async def _generate() -> LearningPath:
            user_message = (
                LEARNING_PATH_USER
                .replace("{target_level}", config.target_level)
                .replace("{max_lessons}", str(config.max_lessons))
                .replace("{language}", config.language)
                .replace("{detail_level}", config.detail_level)
                .replace("{content}", full_text)
            )
            logger.info("Đang sinh lộ trình học tập...")
            return await self._call_llm_single(LEARNING_PATH_SYSTEM, user_message, LearningPath)

        async def _ingest() -> str:
            logger.info("Đang ingest nội dung vào RAG (domain=%s)...", doc.domain)
            return await self._rag.ainsert(doc)

        learning_path, track_id = await asyncio.gather(_generate(), _ingest())
        learning_path.track_id = track_id
        learning_path.domain = doc.domain
        logger.info("Lộ trình đã sẵn sàng, track_id=%s domain=%s", track_id, doc.domain)
        return learning_path

    async def aretrieve_course_context(
        self,
        learning_path: LearningPath,
        retrieval_param: RetrievalParam | None = None,
    ) -> RetrievalContext:
        topics: list[str] = []
        for m in learning_path.milestones:
            topics.extend(m.topics)
            if m.title:
                topics.append(m.title)
        query = " ".join(topics) if topics else learning_path.course_title
        logger.info("Đang retrieve context cho learning path...")
        return await self._rag.aretrieve(query, retrieval_param or RetrievalParam())

    async def generate_exercises_by_type(
        self,
        learning_path: LearningPath,
        config: CourseGenConfig,
        exercise_type: str,
        retrieval_param: RetrievalParam,
    ) -> list:
        type_config = {
            "mcq": (MCQ_SYSTEM, MCQ_USER, MCQExercise),
            "short_answer": (SHORT_ANSWER_SYSTEM, SHORT_ANSWER_USER, ShortAnswerExercise),
            "fill_in_blank": (FILL_IN_BLANK_SYSTEM, FILL_IN_BLANK_USER, FillInBlankExercise),
            "true_false": (TRUE_FALSE_SYSTEM, TRUE_FALSE_USER, TrueFalseExercise),
            "matching": (MATCHING_SYSTEM, MATCHING_USER, MatchingExercise),
            "ordering": (ORDERING_SYSTEM, ORDERING_USER, OrderingExercise),
            "coding": (CODING_SYSTEM, CODING_USER, CodingExercise),
            "flashcard": (FLASHCARD_SYSTEM, FLASHCARD_USER, FlashcardEntity),
        }

        if exercise_type not in type_config:
            raise ValueError(f"Loại bài tập không hỗ trợ: {exercise_type}")

        system_prompt, user_template, item_model = type_config[exercise_type]
        logger.info("Đang sinh bài tập loại: %s", exercise_type)

        all_items: list = []
        item_id_counter = 0
        param = retrieval_param

        for milestone in learning_path.milestones:
            topics_query = " ".join(milestone.topics + [milestone.title])
            logger.info("  Bài %d: đang retrieve context...", milestone.order)
            ctx = await self._rag.aretrieve(topics_query, param)
            rag_context = self._format_rag_context(ctx)

            if not rag_context:
                logger.warning(
                    "  Bài %d: không có context từ RAG, dùng mô tả milestone",
                    milestone.order,
                )
                rag_context = milestone.description

            kwargs = dict(
                lesson_title=milestone.title,
                rag_context=rag_context,
                count=config.exercises_per_lesson,
                difficulty=config.target_level,
                language=config.language,
            )

            if exercise_type == "fill_in_blank":
                kwargs["min_blanks"] = FillInBlankExercise.model_fields["min_blanks"].default
                kwargs["max_blanks"] = FillInBlankExercise.model_fields["max_blanks"].default
            elif exercise_type == "matching":
                kwargs["pairs_per_matching"] = MatchingExercise.model_fields["pairs_count"].default
            elif exercise_type == "ordering":
                kwargs["steps_per_ordering"] = OrderingExercise.model_fields["steps_count"].default
            elif exercise_type == "mcq":
                kwargs["max_options"] = MCQExercise.model_fields["max_options"].default

            user_message = user_template
            for k, v in kwargs.items():
                user_message = user_message.replace("{" + k + "}", str(v))

            try:
                items = await self._call_llm_list(
                    system_prompt, user_message, item_model,
                )
                for item in items:
                    item_id_counter += 1
                    if hasattr(item, "metadata") and hasattr(item.metadata, "exercise_id"):
                        item.metadata.exercise_id = f"ex-{item_id_counter:04d}"
                        item.metadata.lesson_index = milestone.order - 1
                    elif isinstance(item, FlashcardEntity):
                        item.card_id = f"card-{item_id_counter:04d}"
                    all_items.append(item)
                logger.info(
                    "  Bài %d/%d: sinh được %d %s",
                    milestone.order, len(learning_path.milestones),
                    len(items), exercise_type,
                )
            except Exception:
                logger.exception(
                    "  Lỗi khi sinh %s cho bài %d", exercise_type, milestone.order,
                )

        return all_items
