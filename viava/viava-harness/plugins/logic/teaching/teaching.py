import logging

from capabilities.teaching import TeachingAgentBase
from capabilities.teaching.models import (
    Evaluation,
    Explanation,
    Lesson,
    LevelAssessment,
    PracticalExercise,
    ResourceList,
    Summary,
)
from core.llm import BaseLLM, LLMInput, LLMMessage
from .prompts import (
    ASSESS_SYSTEM,
    ASSESS_USER,
    EVALUATE_SYSTEM,
    EVALUATE_USER,
    EXERCISE_SYSTEM,
    EXERCISE_USER,
    EXPLAIN_SYSTEM,
    EXPLAIN_USER,
    LESSON_SYSTEM,
    LESSON_USER,
    RECOMMEND_SYSTEM,
    RECOMMEND_USER,
    SUMMARIZE_SYSTEM,
    SUMMARIZE_USER,
)

logger = logging.getLogger(__name__)


class LLMTeaching(TeachingAgentBase):
    """Triển khai TeachingAgentBase sử dụng BaseLLM qua constructor DI.

    Tất cả 12 method gọi BaseLLM.chat() với prompt chuyên biệt và
    output_parser là pydantic model tương ứng.
    """

    def __init__(self, llm: BaseLLM) -> None:
        self._llm = llm

    async def _call_llm(
        self, system_prompt: str, user_message: str, output_model: type
    ):
        llm_input = LLMInput(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_message),
            ],
            user_id="teaching-agent",
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

    # === Đánh giá ===

    async def assess_level(self, topic: str, responses: list[dict]) -> LevelAssessment:
        responses_text = "\n\n".join(
            f"Câu hỏi {i+1}: {r.get('question', '')}\nTrả lời: {r.get('answer', '')}"
            for i, r in enumerate(responses)
        )
        user_message = (
            ASSESS_USER
            .replace("{topic}", topic)
            .replace("{responses_text}", responses_text)
        )
        return await self._call_llm(ASSESS_SYSTEM, user_message, LevelAssessment)

    # === Sinh nội dung giảng dạy ===

    async def generate_lesson(
        self, topic: str, level: str, style: str = "explanatory"
    ) -> Lesson:
        user_message = (
            LESSON_USER
            .replace("{topic}", topic)
            .replace("{level}", level)
            .replace("{style}", style)
        )
        return await self._call_llm(LESSON_SYSTEM, user_message, Lesson)

    async def generate_exercise(
        self, content: str, exercise_type: str = "practice"
    ) -> PracticalExercise:
        user_message = (
            EXERCISE_USER
            .replace("{content}", content)
            .replace("{exercise_type}", exercise_type)
        )
        return await self._call_llm(EXERCISE_SYSTEM, user_message, PracticalExercise)

    # === Phản hồi & Chấm bài ===

    async def evaluate_answer(
        self, question: str, student_answer: str, reference_answer: str | None = None
    ) -> Evaluation:
        ref_section = f"\n\nĐáp án tham khảo: {reference_answer}" if reference_answer else ""
        user_message = (
            EVALUATE_USER
            .replace("{question}", question)
            .replace("{student_answer}", student_answer)
            .replace("{reference_answer_section}", ref_section)
        )
        return await self._call_llm(EVALUATE_SYSTEM, user_message, Evaluation)

    async def explain_concept(
        self, concept: str, student_level: str, max_words: int = 300
    ) -> Explanation:
        user_message = (
            EXPLAIN_USER
            .replace("{concept}", concept)
            .replace("{student_level}", student_level)
            .replace("{max_words}", str(max_words))
        )
        return await self._call_llm(EXPLAIN_SYSTEM, user_message, Explanation)

    # === Tổng hợp & Gợi ý ===

    async def summarize_topic(
        self, content: str, level: str, max_points: int = 5
    ) -> Summary:
        user_message = (
            SUMMARIZE_USER
            .replace("{content}", content)
            .replace("{level}", level)
            .replace("{max_points}", str(max_points))
        )
        return await self._call_llm(SUMMARIZE_SYSTEM, user_message, Summary)

    async def recommend_resources(
        self, topic: str, level: str, count: int = 5
    ) -> ResourceList:
        user_message = (
            RECOMMEND_USER
            .replace("{topic}", topic)
            .replace("{level}", level)
            .replace("{count}", str(count))
        )
        return await self._call_llm(RECOMMEND_SYSTEM, user_message, ResourceList)


