from __future__ import annotations

from pydantic import BaseModel, Field
from fastapi import APIRouter

router = APIRouter(tags=["Info"])


class CourseInfoResponse(BaseModel):
    exercise_types: list[str] = Field(..., description="Danh sách các loại bài tập được hỗ trợ")
    valid_levels: list[str] = Field(..., description="Các trình độ hợp lệ (beginner/intermediate/advanced/expert)")
    valid_detail_levels: list[str] = Field(..., description="Các mức độ chi tiết hợp lệ (concise/standard/detailed)")
    languages: list[str] = Field(..., description="Các ngôn ngữ được hỗ trợ")
    max_lessons_range: tuple[int, int] = Field(..., description="Khoảng số bài học tối đa (min, max)")
    exercises_per_lesson_range: tuple[int, int] = Field(..., description="Khoảng số bài tập mỗi bài học (min, max)")


@router.get(
    "/course/info",
    response_model=CourseInfoResponse,
    summary="Thông tin cấu hình API",
    description=(
        "Trả về các thông tin cấu hình của API: các loại bài tập được hỗ trợ, "
        "các trình độ hợp lệ, mức độ chi tiết, ngôn ngữ, và các khoảng giới hạn "
        "của tham số (số bài học, số bài tập mỗi bài). "
        "Dùng API này để kiểm tra các giá trị hợp lệ trước khi gọi các endpoint khác."
    ),
)
async def get_course_info() -> CourseInfoResponse:
    return CourseInfoResponse(
        exercise_types=[
            "mcq", "short_answer", "fill_in_blank", "true_false",
            "matching", "ordering", "coding", "flashcard",
        ],
        valid_levels=["beginner", "intermediate", "advanced", "expert"],
        valid_detail_levels=["concise", "standard", "detailed"],
        languages=["vietnamese", "english"],
        max_lessons_range=(1, 50),
        exercises_per_lesson_range=(1, 20),
    )
