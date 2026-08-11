from __future__ import annotations

from fastapi import Request

from servers.rest_api.services.content_resolver import ContentResolver
from servers.rest_api.services.course_service import CourseService
from servers.rest_api.services.exercise_service import ExerciseService
from servers.rest_api.services.teaching_service import TeachingService


def get_course_service(request: Request) -> CourseService:
    resolver = ContentResolver(
        extractor=request.app.state.extractor,
        transcriber=request.app.state.transcriber,
    )
    exercise_svc = ExerciseService(generator=request.app.state.generator)
    teaching_svc = TeachingService(
        teaching=getattr(request.app.state, "teaching", None),
        web_search=getattr(request.app.state, "web_search", None),
    )
    return CourseService(
        resolver=resolver,
        exercise_svc=exercise_svc,
        teaching_svc=teaching_svc,
    )
