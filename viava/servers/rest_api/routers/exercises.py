from __future__ import annotations

import logging

from fastapi import APIRouter, Body, Depends

from capabilities.course_exercises import CourseGenConfig
from servers.rest_api.dependencies import get_course_service
from servers.rest_api.schemas.exercises import (
    CodingExerciseResponse,
    ExerciseGenerateRequest,
    FillInBlankExerciseResponse,
    FlashcardExerciseResponse,
    MCQExerciseResponse,
    MatchingExerciseResponse,
    OrderingExerciseResponse,
    ShortAnswerExerciseResponse,
    TrueFalseExerciseResponse,
)
from servers.rest_api.services.course_service import CourseService

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/course/exercises",
    tags=["Exercises"],
)

EXERCISE_DESCRIPTIONS = {
    "mcq": (
        "Sinh câu hỏi trắc nghiệm (Multiple Choice Questions) dựa trên lộ trình học tập. "
        "Mỗi câu hỏi có 4-6 lựa chọn, đáp án đúng, giải thích chi tiết, và feedback sư phạm."
    ),
    "short_answer": (
        "Sinh câu hỏi trả lời ngắn. Mỗi câu hỏi có đáp án mẫu, từ khóa bắt buộc, "
        "giới hạn số từ (min/max), và tiêu chí chấm điểm."
    ),
    "fill_in_blank": (
        "Sinh bài tập điền vào chỗ trống với các blank được đánh dấu bằng ___ trong văn bản. "
        "Mỗi blank có đáp án đúng, các đáp án thay thế chấp nhận được, và gợi ý riêng."
    ),
    "true_false": (
        "Sinh câu hỏi đúng/sai. Mỗi câu có phát biểu, đáp án (đúng/sai), "
        "giải thích, và phiên bản chỉnh sửa nếu phát biểu sai."
    ),
    "matching": (
        "Sinh bài tập nối cặp giữa cột trái (khái niệm) và cột phải (định nghĩa). "
        "Số lượng cặp có thể điều chỉnh."
    ),
    "ordering": (
        "Sinh bài tập sắp xếp thứ tự đúng của các bước trong một quy trình. "
        "Mỗi bước có vị trí đúng (1-based) và giải thích."
    ),
    "coding": (
        "Sinh bài tập lập trình với mô tả bài toán, ngôn ngữ, code khởi đầu, "
        "lời giải mẫu, bộ test cases, ràng buộc, và gợi ý độ phức tạp."
    ),
    "flashcard": (
        "Sinh thẻ ghi nhớ (flashcard) với mặt trước (câu hỏi/tình huống) "
        "và mặt sau (đáp án/kiến thức cô đọng). Có gợi ý mnemonics để ghi nhớ."
    ),
}


async def _do_generate(
    request: ExerciseGenerateRequest,
    exercise_type: str,
    response_cls: type,
    service: CourseService,
):
    config = CourseGenConfig(
        language=request.language,
        target_level=request.target_level,
        detail_level=request.detail_level,
        exercises_per_lesson=request.exercises_per_lesson,
    )
    exercises = await service.generate_exercise(
        request.learning_path, config, exercise_type,
    )
    return response_cls(
        course_title=request.learning_path.course_title,
        total_exercises=len(exercises),
        exercises=exercises,
    )


@router.post(
    "/mcq/generate",
    response_model=MCQExerciseResponse,
    summary="Sinh câu hỏi trắc nghiệm (MCQ)",
    description=EXERCISE_DESCRIPTIONS["mcq"],
)
async def generate_mcq(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> MCQExerciseResponse:
    return await _do_generate(request, "mcq", MCQExerciseResponse, service)


@router.post(
    "/short-answer/generate",
    response_model=ShortAnswerExerciseResponse,
    summary="Sinh câu hỏi trả lời ngắn",
    description=EXERCISE_DESCRIPTIONS["short_answer"],
)
async def generate_short_answer(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> ShortAnswerExerciseResponse:
    return await _do_generate(request, "short_answer", ShortAnswerExerciseResponse, service)


@router.post(
    "/fill-in-blank/generate",
    response_model=FillInBlankExerciseResponse,
    summary="Sinh bài tập điền vào chỗ trống",
    description=EXERCISE_DESCRIPTIONS["fill_in_blank"],
)
async def generate_fill_in_blank(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> FillInBlankExerciseResponse:
    return await _do_generate(request, "fill_in_blank", FillInBlankExerciseResponse, service)


@router.post(
    "/true-false/generate",
    response_model=TrueFalseExerciseResponse,
    summary="Sinh câu hỏi đúng/sai",
    description=EXERCISE_DESCRIPTIONS["true_false"],
)
async def generate_true_false(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> TrueFalseExerciseResponse:
    return await _do_generate(request, "true_false", TrueFalseExerciseResponse, service)


@router.post(
    "/matching/generate",
    response_model=MatchingExerciseResponse,
    summary="Sinh bài tập nối cặp",
    description=EXERCISE_DESCRIPTIONS["matching"],
)
async def generate_matching(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> MatchingExerciseResponse:
    return await _do_generate(request, "matching", MatchingExerciseResponse, service)


@router.post(
    "/ordering/generate",
    response_model=OrderingExerciseResponse,
    summary="Sinh bài tập sắp xếp thứ tự",
    description=EXERCISE_DESCRIPTIONS["ordering"],
)
async def generate_ordering(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> OrderingExerciseResponse:
    return await _do_generate(request, "ordering", OrderingExerciseResponse, service)


@router.post(
    "/coding/generate",
    response_model=CodingExerciseResponse,
    summary="Sinh bài tập lập trình",
    description=EXERCISE_DESCRIPTIONS["coding"],
)
async def generate_coding(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> CodingExerciseResponse:
    return await _do_generate(request, "coding", CodingExerciseResponse, service)


@router.post(
    "/flashcard/generate",
    response_model=FlashcardExerciseResponse,
    summary="Sinh thẻ ghi nhớ (flashcard)",
    description=EXERCISE_DESCRIPTIONS["flashcard"],
)
async def generate_flashcard(
    request: ExerciseGenerateRequest = Body(),
    service: CourseService = Depends(get_course_service),
) -> FlashcardExerciseResponse:
    return await _do_generate(request, "flashcard", FlashcardExerciseResponse, service)
