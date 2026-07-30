from __future__ import annotations

import logging

from fastapi import APIRouter, Depends

from capabilities.teaching.models import Evaluation, Explanation, Summary
from servers.rest_api.dependencies import get_course_service
from servers.rest_api.schemas.teaching import EvaluateRequest, ExplainRequest, SummarizeRequest
from servers.rest_api.services.course_service import CourseService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/course", tags=["Teaching"])


@router.post(
    "/evaluate",
    response_model=Evaluation,
    summary="Đánh giá câu trả lời của học viên",
    description=(
        "So sánh câu trả lời của học viên với đáp án tham khảo (nếu có) "
        "để đánh giá mức độ chính xác. Trả về điểm số (0-100), nhận xét, "
        "gợi ý cải thiện, và câu hỏi tiếp theo để kiểm tra sâu hơn."
    ),
)
async def evaluate(
    request: EvaluateRequest,
    service: CourseService = Depends(get_course_service),
) -> Evaluation:
    logger.info("POST /course/evaluate")
    return await service.evaluate(request)


@router.post(
    "/explain",
    response_model=Explanation,
    summary="Giải thích khái niệm",
    description=(
        "Giải thích một khái niệm cho học viên ở một trình độ cụ thể. "
        "Tự động tìm kiếm web (nếu bật) để bổ sung context. "
        "Trả về lời giải thích, suy luận tương tự, ví dụ, và khái niệm liên quan."
    ),
)
async def explain(
    request: ExplainRequest,
    service: CourseService = Depends(get_course_service),
) -> Explanation:
    logger.info("POST /course/explain (web_search=%s)", request.use_web_search)
    return await service.explain(request)


@router.post(
    "/summarize",
    response_model=Summary,
    summary="Tóm tắt nội dung",
    description=(
        "Tóm tắt một đoạn nội dung dài thành các ý chính cô đọng. "
        "Trả về chủ đề, các ý chính (key points), và đoạn tóm tắt."
    ),
)
async def summarize(
    request: SummarizeRequest,
    service: CourseService = Depends(get_course_service),
) -> Summary:
    logger.info("POST /course/summarize")
    return await service.summarize(request)
