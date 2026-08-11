from abc import ABC, abstractmethod

from capabilities.course_gen.models import (
    CourseGenConfig,
    LearningPath,
)


class BaseCourseGenerator(ABC):
    """Hợp đồng cho course generator — nhận nội dung, sinh lộ trình và bài tập."""

    @abstractmethod
    async def generate_learning_path(
        self, content: str, config: CourseGenConfig,
    ) -> LearningPath:
        """Sinh lộ trình học tập từ nội dung khóa học.

        Args:
            content: Nội dung thô của khóa học (text).
            config: Cấu hình sinh (ngôn ngữ, trình độ, số bài học, ...).

        Returns:
            LearningPath với danh sách milestones.
        """
        ...

    @abstractmethod
    async def generate_exercises_by_type(
        self, content: str, learning_path: LearningPath,
        config: CourseGenConfig, exercise_type: str,
    ) -> list:
        """Sinh bài tập chỉ 1 loại cụ thể.

        Args:
            content: Nội dung thô của khóa học (text).
            learning_path: Lộ trình đã sinh từ generate_learning_path.
            config: Cấu hình sinh.
            exercise_type: Loại bài tập: "mcq", "short_answer", "fill_in_blank",
                           "true_false", "matching", "ordering", "coding", "flashcard".
        Returns:
            list[MCQExercise] | list[ShortAnswerExercise] | ... | list[FlashcardEntity].
        """
        ...

