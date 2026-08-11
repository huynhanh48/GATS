from __future__ import annotations

from fastapi import UploadFile
from pydantic import BaseModel, Field, model_validator


class CourseGenerateRequest(BaseModel):
    model_config = {"extra": "forbid"}

    file: UploadFile | None = Field(default=None, description="File upload (PDF, DOCX, TXT, ...)")
    file_url: str | None = Field(default=None, description="URL tải file hoặc audio (audio sẽ được transcribe)")
    text: str | None = Field(default=None, description="Nội dung text nhập trực tiếp")
    language: str = Field(default="vi", description="Ngôn ngữ khóa học (vd: 'vi', 'english', 'vietnamese')")
    target_level: str = Field(default="intermediate", description="Trình độ mục tiêu: beginner | intermediate | advanced | expert")
    detail_level: str = Field(default="standard", description="Mức độ chi tiết: concise | standard | detailed")
    max_lessons: int = Field(default=3, ge=1, le=100, description="Số bài học tối đa")
    exercises_per_lesson: int = Field(default=3, ge=1, le=20, description="Số bài tập mỗi bài học")
    domain: str = Field(..., description="Domain khóa học để RAG scoping (vd: 'programming', 'legal', 'chemistry') — bắt buộc")

    @model_validator(mode="after")
    def validate_input(self) -> "CourseGenerateRequest":
        if not any(self._has_value(v) for v in [self.file, self.file_url, self.text]):
            raise ValueError("Phải cung cấp ít nhất file, file_url hoặc text")
        return self

    @staticmethod
    def _has_value(value) -> bool:
        if value is None:
            return False
        if isinstance(value, str):
            return value.strip() and value.strip().lower() != "string"
        return True

    @property
    def has_file(self) -> bool:
        return self.file is not None

    @property
    def has_file_url(self) -> bool:
        return bool(self.file_url and self.file_url.strip())

    @property
    def has_text(self) -> bool:
        return bool(self.text and self.text.strip())


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Mã lỗi (VALIDATION_ERROR, GENERATION_FAILED, CONTENT_EMPTY, ...)")
    message: str = Field(..., description="Thông báo lỗi tiếng Việt")
    details: str | None = Field(default=None, description="Chi tiết lỗi (traceback hoặc thông tin bổ sung)")
