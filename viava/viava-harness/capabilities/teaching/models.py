from pydantic import BaseModel, Field
from typing import List, Literal



class AssessmentRubricItem(BaseModel):
    dimension_name: str = Field(default="", description="Tên chiều đánh giá (ví dụ: Logic, Hiệu năng, Cú pháp)")
    max_score_allocated: int = Field(default=0, description="Điểm tối đa cho chiều này")
    achievement_standard: str = Field(default="", description="Yêu cầu chi tiết để đạt điểm tối đa")

class PracticalExercise(BaseModel):
    exercise_id: str = Field(default="", description="Mã bài tập")
    instruction_prompt: str = Field(default="", description="Yêu cầu chi tiết của bài tập thực hành")
    context_reference: str = Field(default="", description="Ngữ cảnh hoặc dữ liệu đầu vào cho bài tập")
    evaluation_rubrics: List[AssessmentRubricItem] = Field(default_factory=list, description="Bộ tiêu chí đánh giá phân tích")


class LevelAssessment(BaseModel):
    """Đánh giá trình độ hiện tại của học viên về một chủ đề."""
    topic: str = Field(default="", description="Chủ đề được đánh giá")
    current_level: Literal["beginner", "intermediate", "advanced", "expert"] = Field(
        default="beginner", description="Trình độ hiện tại của học viên"
    )
    score: float = Field(default=0.0, description="Điểm số đánh giá (0-100)")
    strengths: list[str] = Field(default_factory=list, description="Các điểm mạnh đã xác định")
    weaknesses: list[str] = Field(default_factory=list, description="Các điểm yếu cần cải thiện")
    recommendation: str = Field(default="", description="Đề xuất lộ trình học tập tiếp theo")


class LessonSection(BaseModel):
    """Một phần trong bài giảng."""
    heading: str = Field(default="", description="Tiêu đề của phần")
    content: str = Field(default="", description="Nội dung chi tiết của phần")
    source_citation: str | None = Field(default=None, description="Trích dẫn từ nội dung gốc")


class Lesson(BaseModel):
    """Bài giảng được sinh tự động từ nội dung."""
    title: str = Field(default="", description="Tiêu đề bài giảng")
    topic: str = Field(default="", description="Chủ đề bài giảng")
    level: str = Field(default="", description="Trình độ mục tiêu của bài giảng")
    style: str = Field(default="", description="Phong cách giảng dạy (explanatory, storytelling, analogy, step_by_step)")
    sections: list[LessonSection] = Field(default_factory=list, description="Các phần nội dung của bài giảng")
    key_takeaways: list[str] = Field(default_factory=list, description="Các điểm chính cần ghi nhớ")
    estimated_minutes: int = Field(default=0, description="Thời gian ước tính để hoàn thành bài giảng (phút)")


class Evaluation(BaseModel):
    """Kết quả chấm điểm và nhận xét câu trả lời của học viên."""
    score: float = Field(default=0.0, description="Điểm số đạt được (0-100)")
    max_score: float = Field(default=100.0, description="Điểm tối đa có thể đạt được")
    is_correct: bool = Field(default=False, description="Câu trả lời có đúng hay không")
    feedback: str = Field(default="", description="Nhận xét chi tiết về câu trả lời")
    suggestions: list[str] = Field(default_factory=list, description="Gợi ý cải thiện")
    follow_up_questions: list[str] = Field(default_factory=list, description="Câu hỏi gợi mở để đào sâu kiến thức")


class Explanation(BaseModel):
    """Giải thích một khái niệm theo trình độ của học viên."""
    concept: str = Field(default="", description="Khái niệm cần giải thích")
    student_level: str = Field(default="", description="Trình độ của học viên")
    explanation_text: str = Field(default="", description="Nội dung giải thích chi tiết")
    analogies: list[str] = Field(default_factory=list, description="Các phép tương tự giúp dễ hiểu")
    examples: list[str] = Field(default_factory=list, description="Các ví dụ minh họa cụ thể")
    related_concepts: list[str] = Field(default_factory=list, description="Các khái niệm liên quan")


class Summary(BaseModel):
    """Tóm tắt kiến thức thành các điểm chính."""
    topic: str = Field(default="", description="Chủ đề được tóm tắt")
    level: str = Field(default="", description="Trình độ mục tiêu của bản tóm tắt")
    key_points: list[str] = Field(default_factory=list, description="Danh sách các điểm chính")
    summary_text: str = Field(default="", description="Đoạn văn tóm tắt tổng quan")


class Resource(BaseModel):
    """Một tài nguyên học tập được gợi ý."""
    title: str = Field(default="", description="Tiêu đề tài nguyên")
    url: str = Field(default="", description="URL đến tài nguyên")
    type: str = Field(default="", description="Loại tài nguyên (article, video, book, course, exercise)")
    difficulty: str = Field(default="", description="Độ khó (beginner, intermediate, advanced)")
    description: str = Field(default="", description="Mô tả ngắn gọn về tài nguyên")


class ResourceList(BaseModel):
    """Danh sách tài nguyên học tập được gợi ý."""
    topic: str = Field(default="", description="Chủ đề cần tài nguyên")
    level: str = Field(default="", description="Trình độ mục tiêu")
    resources: list[Resource] = Field(default_factory=list, description="Danh sách tài nguyên gợi ý")


class ValidatedItem(BaseModel):
    """Kết quả kiểm tra chéo một item (câu hỏi hoặc flashcard)."""
    index: int = Field(default=0, description="Thứ tự của item trong bộ (bắt đầu từ 0)")
    is_verified: bool = Field(default=False, description="Item có chính xác với nội dung gốc hay không")
    confidence: float = Field(default=0.0, description="Độ tin cậy (0-1)")
    issue: str | None = Field(default=None, description="Vấn đề phát hiện được (nếu có)")
    suggestion: str | None = Field(default=None, description="Đề xuất sửa lại (nếu có)")


class ValidatedResult(BaseModel):
    """Kết quả kiểm tra chéo toàn bộ quiz hoặc flashcard."""
    total_items: int = Field(default=0, description="Tổng số item được kiểm tra")
    verified_count: int = Field(default=0, description="Số item đã xác minh chính xác")
    needs_review_count: int = Field(default=0, description="Số item cần xem xét lại")
    items: list[ValidatedItem] = Field(default_factory=list, description="Danh sách kết quả từng item")
    overall_assessment: str = Field(default="", description="Đánh giá tổng quan về chất lượng bộ item")


# PEP8