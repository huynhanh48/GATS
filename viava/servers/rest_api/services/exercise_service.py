from __future__ import annotations

import logging

from capabilities.course_exercises import BaseCourseExercises, CourseGenConfig
from capabilities.course_exercises.models import LearningPath
from capabilities.retrieval_augmented_generation.models import DocInsert, RetrievalParam
from servers.rest_api.exceptions import AppError

logger = logging.getLogger(__name__)


class ExerciseService:
    def __init__(self, generator: BaseCourseExercises) -> None:
        self._generator = generator

    async def generate_learning_path(self, doc: DocInsert, config: CourseGenConfig) -> LearningPath:
        logger.info("Sinh lo trinh hoc tap...")
        try:
            return await self._generator.generate_learning_path(doc, config)
        except Exception as e:
            raise AppError("GENERATION_FAILED", "Loi khi sinh lo trinh hoc tap", str(e)) from e

    async def generate_exercise_by_type(
        self, learning_path: LearningPath,
        config: CourseGenConfig, exercise_type: str,
    ) -> list:
        logger.info("Sinh bai tap loai: %s", exercise_type)
        try:
            return await self._generator.generate_exercises_by_type(
                learning_path, config, exercise_type, retrieval_param=RetrievalParam(),
            )
        except Exception as e:
            raise AppError("GENERATION_FAILED", f"Loi khi sinh bai tap {exercise_type}", str(e)) from e
