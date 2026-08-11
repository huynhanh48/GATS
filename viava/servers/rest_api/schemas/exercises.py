from __future__ import annotations

from pydantic import BaseModel, Field

from capabilities.course_exercises.models import (
    CodingExercise,
    FillInBlankExercise,
    FlashcardEntity,
    LearningPath,
    MCQExercise,
    MatchingExercise,
    OrderingExercise,
    ShortAnswerExercise,
    TrueFalseExercise,
)


class ExerciseGenerateRequest(BaseModel):
    model_config = {"extra": "forbid"}

    learning_path: LearningPath = Field(..., description="Lộ trình học tập đã sinh từ POST /course/learning-path/generate")
    language: str = Field(default="vietnamese", description="Ngôn ngữ bài tập (vd: 'vietnamese', 'english')")
    target_level: str = Field(default="intermediate", description="Trình độ mục tiêu: beginner | intermediate | advanced | expert")
    detail_level: str = Field(default="standard", description="Mức độ chi tiết: concise | standard | detailed")
    exercises_per_lesson: int = Field(default=3, ge=1, le=20, description="Số bài tập sinh ra cho mỗi bài học")


class MCQExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="mcq", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[MCQExercise] = Field(..., description="Danh sách câu hỏi trắc nghiệm")


class ShortAnswerExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="short_answer", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[ShortAnswerExercise] = Field(..., description="Danh sách câu hỏi trả lời ngắn")


class FillInBlankExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="fill_in_blank", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[FillInBlankExercise] = Field(..., description="Danh sách bài tập điền vào chỗ trống")


class TrueFalseExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="true_false", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[TrueFalseExercise] = Field(..., description="Danh sách câu hỏi đúng/sai")


class MatchingExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="matching", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[MatchingExercise] = Field(..., description="Danh sách bài tập nối cặp")


class OrderingExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="ordering", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[OrderingExercise] = Field(..., description="Danh sách bài tập sắp xếp thứ tự")


class CodingExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="coding", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[CodingExercise] = Field(..., description="Danh sách bài tập lập trình")


class FlashcardExerciseResponse(BaseModel):
    course_title: str = Field(..., description="Tên khóa học")
    exercise_type: str = Field(default="flashcard", description="Loại bài tập")
    total_exercises: int = Field(..., description="Tổng số bài tập đã sinh")
    exercises: list[FlashcardEntity] = Field(..., description="Danh sách thẻ ghi nhớ")
