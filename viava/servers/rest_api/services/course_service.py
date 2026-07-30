from __future__ import annotations

import logging

from capabilities.course_exercises import CourseGenConfig
from capabilities.course_exercises.models import LearningPath
from capabilities.teaching.models import Evaluation, Explanation, Summary
from servers.rest_api.exceptions import AppError
from servers.rest_api.schemas.common import CourseGenerateRequest
from servers.rest_api.schemas.teaching import EvaluateRequest, ExplainRequest, SummarizeRequest
from servers.rest_api.services.content_resolver import ContentResolver
from servers.rest_api.services.exercise_service import ExerciseService
from servers.rest_api.services.teaching_service import TeachingService

logger = logging.getLogger(__name__)

VALID_LEVELS = frozenset({"beginner", "intermediate", "advanced", "expert"})
VALID_DETAIL_LEVELS = frozenset({"concise", "standard", "detailed"})
VALID_EXERCISE_TYPES = frozenset({
    "mcq", "short_answer", "fill_in_blank", "true_false",
    "matching", "ordering", "coding", "flashcard",
})


class CourseService:
    def __init__(
        self, resolver: ContentResolver,
        exercise_svc: ExerciseService,
        teaching_svc: TeachingService,
    ) -> None:
        self._resolver = resolver
        self._exercise_svc = exercise_svc
        self._teaching_svc = teaching_svc

    async def generate_learning_path(self, req: CourseGenerateRequest) -> LearningPath:
        doc = await self._resolver.resolve(req)
        config = self._build_config(req)
        return await self._exercise_svc.generate_learning_path(doc, config)

    async def generate_exercise(
        self, learning_path: LearningPath,
        config: CourseGenConfig, exercise_type: str,
    ) -> list:
        if exercise_type not in VALID_EXERCISE_TYPES:
            raise AppError("VALIDATION_ERROR", f"Loai bai tap khong ho tro: {exercise_type}")
        exercises = await self._exercise_svc.generate_exercise_by_type(
            learning_path, config, exercise_type,
        )
        return exercises

    async def evaluate(self, req: EvaluateRequest) -> Evaluation:
        return await self._teaching_svc.evaluate(req.question, req.student_answer, req.reference_answer)

    async def explain(self, req: ExplainRequest) -> Explanation:
        return await self._teaching_svc.explain(req.concept, req.context, req.level, req.max_words, req.use_web_search)

    async def summarize(self, req: SummarizeRequest) -> Summary:
        return await self._teaching_svc.summarize(req.content, req.level, req.max_points)

    def _build_config(self, req: CourseGenerateRequest) -> CourseGenConfig:
        target_level = req.target_level if req.target_level in VALID_LEVELS else "intermediate"
        detail_level = req.detail_level if req.detail_level in VALID_DETAIL_LEVELS else "standard"
        return CourseGenConfig(
            language=req.language,
            target_level=target_level,
            detail_level=detail_level,
            max_lessons=req.max_lessons,
            exercises_per_lesson=req.exercises_per_lesson,
        )
