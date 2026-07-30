"""ABC cho Teaching Agent — định nghĩa contract cho mọi teaching capability implementation."""
from abc import ABC, abstractmethod

from .models import (
    Evaluation,
    Explanation,
    Lesson,
    LevelAssessment,
    PracticalExercise,
    ResourceList,
    Summary,
    ValidatedResult,
)


class TeachingAgentBase(ABC):
    """Giao diện trừu tượng cho teaching agent.

    Chia làm 4 nhóm chức năng:
    - Đánh giá (1 method)
    - Sinh nội dung giảng dạy (3 method)
    - Phản hồi & Chấm bài (2 method)
    - Tổng hợp & Gợi ý (2 method)
    """

    # === Đánh giá ===

    @abstractmethod
    async def assess_level(self, topic: str, responses: list[dict]) -> LevelAssessment:
        """Đánh giá trình độ hiện tại của học viên về một chủ đề."""
        ...

    # === Sinh nội dung giảng dạy ===

    @abstractmethod
    async def generate_lesson(
        self, topic: str, level: str, style: str = "explanatory"
    ) -> Lesson:
        """Tạo bài giảng từ chủ đề."""
        ...

    @abstractmethod
    async def generate_exercise(
        self, content: str, exercise_type: str = "practice"
    ) -> PracticalExercise:
        """Sinh bài tập thực hành từ nội dung học liệu."""
        ...

    # === Phản hồi & Chấm bài ===

    @abstractmethod
    async def evaluate_answer(
        self, question: str, student_answer: str, reference_answer: str | None = None
    ) -> Evaluation:
        """Chấm điểm và nhận xét câu trả lời của học viên."""
        ...

    @abstractmethod
    async def explain_concept(
        self, concept: str, student_level: str, max_words: int = 300
    ) -> Explanation:
        """Giải thích một khái niệm phù hợp với trình độ học viên."""
        ...

    # === Tổng hợp & Gợi ý ===

    @abstractmethod
    async def summarize_topic(
        self, content: str, level: str, max_points: int = 5
    ) -> Summary:
        """Tóm tắt nội dung thành các điểm chính."""
        ...

    @abstractmethod
    async def recommend_resources(
        self, topic: str, level: str, count: int = 5
    ) -> ResourceList:
        """Gợi ý tài nguyên học tập cho một chủ đề."""
        ...


