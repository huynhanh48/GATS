from __future__ import annotations

import json
import logging

from capabilities.course_gen import BaseCourseGenerator
from capabilities.course_gen.models import (
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


class LLMCourseGenerator(BaseCourseGenerator):
    """Triển khai BaseCourseGenerator sử dụng BaseLLM qua constructor DI.

    Mỗi method gọi BaseLLM.chat() với prompt chuyên biệt và
    output_parser là pydantic model tương ứng.
    """

    def __init__(self, llm: BaseLLM) -> None:
        self._llm = llm

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

    async def generate_learning_path(
        self, content: str, config: CourseGenConfig,
    ) -> LearningPath:
        user_message = (
            LEARNING_PATH_USER
            .replace("{target_level}", config.target_level)
            .replace("{max_lessons}", str(config.max_lessons))
            .replace("{language}", config.language)
            .replace("{detail_level}", config.detail_level)
            .replace("{content}", content)
        )
        logger.info("Đang sinh lộ trình học tập...")
        return await self._call_llm_single(LEARNING_PATH_SYSTEM, user_message, LearningPath)

    #TODO thay thế bằng RAG
    @staticmethod
    def _scope_content(content: str, milestone) -> str:
        if len(content) < 2000:
            return content

        keywords = set(milestone.topics + milestone.key_concepts)
        if not keywords:
            return content[:5000]

        lines = content.split("\n")
        scored_lines = []
        for line in lines:
            score = sum(1 for kw in keywords if kw.lower() in line.lower())
            if score > 0:
                scored_lines.append((score, line))

        if scored_lines:
            scored_lines.sort(key=lambda x: x[0], reverse=True)
            return "\n".join(line for _, line in scored_lines[:80])

        return content[:5000]

    async def generate_exercises_by_type(
        self, content: str, learning_path: LearningPath,
        config: CourseGenConfig, exercise_type: str,
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

        for milestone in learning_path.milestones:
            lesson_content = self._scope_content(content, milestone)

            kwargs = dict(
                lesson_title=milestone.title,
                lesson_content=lesson_content,
                count=config.exercises_per_lesson,
                difficulty=config.target_level,
                language=config.language,
            )

            if exercise_type == "fill_in_blank":
                kwargs["min_blanks"] = config.min_blanks_per_fill
                kwargs["max_blanks"] = config.max_blanks_per_fill
            elif exercise_type == "matching":
                kwargs["pairs_per_matching"] = config.pairs_per_matching
            elif exercise_type == "ordering":
                kwargs["steps_per_ordering"] = config.steps_per_ordering

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
