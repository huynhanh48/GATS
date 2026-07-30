from __future__ import annotations

from pydantic import BaseModel, Field


class EvaluateRequest(BaseModel):
    question: str = Field(..., description="Câu hỏi cần đánh giá")
    student_answer: str = Field(..., description="Câu trả lời của học viên")
    reference_answer: str | None = Field(default=None, description="Đáp án tham khảo (nếu có)")

class ExplainRequest(BaseModel):
    concept: str = Field(..., description="Khái niệm cần giải thích")
    context: str | None = Field(default=None, description="Ngữ cảnh bổ sung (không bắt buộc)")
    level: str = Field(default="intermediate", description="Trình độ học viên: beginner | intermediate | advanced | expert")
    max_words: int = Field(default=300, ge=50, le=2000, description="Số từ tối đa cho lời giải thích")
    use_web_search: bool = Field(default=False, description="Có tìm kiếm web để bổ sung context hay không")

class SummarizeRequest(BaseModel):
    content: str = Field(..., description="Nội dung cần tóm tắt")
    level: str = Field(default="intermediate", description="Trình độ học viên: beginner | intermediate | advanced | expert")
    max_points: int = Field(default=5, ge=1, le=20, description="Số ý chính tối đa")
