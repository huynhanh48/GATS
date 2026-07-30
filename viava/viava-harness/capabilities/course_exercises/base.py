from __future__ import annotations

from abc import ABC, abstractmethod

from capabilities.course_exercises.models import (
    CourseGenConfig,
    LearningPath,
)
from capabilities.retrieval_augmented_generation.models import (
    DocInsert,
    RetrievalContext,
    RetrievalParam,
)


class BaseCourseExercises(ABC):
    """Hợp đồng cho course generator — nhận DocInsert, sinh lộ trình và bài tập qua RAG."""

    @abstractmethod
    async def generate_learning_path(
        self, doc: DocInsert, config: CourseGenConfig,
    ) -> LearningPath:
        """Sinh lộ trình học tập từ DocInsert.

        Nối doc.contents thành full text → LLM sinh learning path.
        Song song: rag.ainsert(doc) → lấy track_id gán vào LearningPath.
        """
        ...

    @abstractmethod
    async def generate_exercises_by_type(
        self,
        learning_path: LearningPath,
        config: CourseGenConfig,
        exercise_type: str,
        retrieval_param: RetrievalParam | None = None,
    ) -> list:
        """Sinh bài tập một loại cụ thể, dùng RAG retrieve context cho từng milestone.

        exercise_type: "mcq", "short_answer", "fill_in_blank",
                       "true_false", "matching", "ordering", "coding", "flashcard".
        """
        ...

    @abstractmethod
    async def aretrieve_course_context(
        self,
        learning_path: LearningPath,
        retrieval_param: RetrievalParam | None = None,
    ) -> RetrievalContext:
        """Retrieve toàn bộ context cho learning path (public, để caller kiểm tra)."""
        ...
