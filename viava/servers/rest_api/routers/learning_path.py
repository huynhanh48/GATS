from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from capabilities.course_exercises.models import LearningPath
from servers.rest_api.dependencies import get_course_service
from servers.rest_api.schemas.common import CourseGenerateRequest
from servers.rest_api.services.course_service import CourseService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/course/learning-path", tags=["Learning Path"])


@router.post(
    "/generate",
    response_model=LearningPath,
    summary="Sinh lộ trình học tập",
    description=(
        "Tạo một lộ trình học tập từ nội dung đầu vào (file upload, URL, hoặc text trực tiếp). "
        "Hệ thống trích xuất nội dung, ingest vào RAG để xây dựng knowledge graph, "
        "và sử dụng LLM để sinh ra lộ trình học tập gồm nhiều bài học (milestones). "
        "Mỗi bài học có tiêu đề, mô tả, chủ đề, mục tiêu học tập, và khái niệm cốt lõi.\n\n"
        "**Đầu vào:** Ít nhất 1 trong 3: `file` (UploadFile), `file_url` (URL file/audio), `text` (text trực tiếp).\n"
        "**Domain:** Bắt buộc, để RAG scoping chính xác (vd: \"programming\", \"legal\", \"chemistry\").\n"
        "**Lưu ý:** Audio URL sẽ được transcribe qua Azure Speech-to-Text."
    ),
)
async def generate_learning_path(
    request: CourseGenerateRequest = Depends(),
    service: CourseService = Depends(get_course_service),
) -> LearningPath:
    logger.info("POST /course/learning-path/generate")
    return await service.generate_learning_path(request)
