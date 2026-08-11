from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ── Config ──

class CourseGenConfig(BaseModel):
    """Cấu hình sinh khóa học — chỉ field ảnh hưởng đến learning path."""
    language: str = Field(default="vietnamese", description="Ngôn ngữ khóa học")
    target_level: Literal["beginner", "intermediate", "advanced", "expert"] = Field(
        default="beginner", description="Trình độ mục tiêu của khóa học",
    )
    max_lessons: int = Field(default=5, ge=1, le=50, description="Số bài học tối đa")
    exercises_per_lesson: int = Field(default=3, ge=1, le=20, description="Số bài tập mỗi bài học")
    detail_level: str = Field(default="standard", description="Mức độ chi tiết: basic/standard/comprehensive")


# ── Learning Path ──

class LearningMilestone(BaseModel):
    model_config = ConfigDict(extra="forbid")
    order: int = Field(default=1, description="Thứ tự bài học (bắt đầu từ 1)")
    title: str = Field(default="", description="Tiêu đề bài học")
    description: str = Field(default="", description="Mô tả nội dung bài học")
    topics: list[str] = Field(default_factory=list, description="Các chủ đề con")
    estimated_minutes: int = Field(default=30, description="Thời lượng ước tính (phút)")
    prerequisites: list[str] = Field(default_factory=list, description="Kiến thức tiên quyết")
    learning_objectives: list[str] = Field(default_factory=list, description="Mục tiêu học tập")
    key_concepts: list[str] = Field(default_factory=list, description="Khái niệm cốt lõi")


class LearningPath(BaseModel):
    model_config = ConfigDict(extra="forbid")
    course_title: str = Field(default="", description="Tên khóa học")
    target_level: str = Field(default="", description="Trình độ mục tiêu")
    total_duration_minutes: int = Field(default=0, description="Tổng thời lượng (phút)")
    milestones: list[LearningMilestone] = Field(default_factory=list, description="Danh sách bài học")
    track_id: str | None = Field(default=None, description="Track ID từ RAG ainsert để truy vết")
    domain: str = Field(default="", description="Domain khóa học để scoping RAG")


# ── Exercise Common Metadata ──

class ExerciseMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")
    exercise_id: str = Field(default="", description="Mã định danh bài tập")
    lesson_index: int = Field(default=0, description="Thuộc bài học thứ mấy")
    difficulty: Literal["beginner", "intermediate", "advanced", "expert"] = Field(
        default="intermediate", description="Độ khó"
    )
    points: int = Field(default=10, description="Điểm số")
    tags: list[str] = Field(default_factory=list, description="Chủ đề con")
    estimated_time_minutes: int = Field(default=5, description="Thời gian dự kiến (phút)")
    learning_objective: str = Field(default="", description="Mục tiêu học tập")
    source_reference: str | None = Field(default=None, description="Trích dẫn từ tài liệu gốc")
    hint: str | None = Field(default=None, description="Gợi ý khi học viên bí")


# ── MCQ ──

class MCQOption(BaseModel):
    key: str = Field(default="", description="Ký tự đại diện (A/B/C/D)")
    text: str = Field(default="", description="Nội dung phương án")
    is_correct: bool = Field(default=False, description="Có phải đáp án đúng không")
    rationale: str = Field(default="", description="Giải thích tại sao phương án này đúng hoặc sai")
    feedback_if_chosen: str | None = Field(
        default=None, description="Phản hồi sư phạm nếu học viên chọn phương án này"
    )


class MCQExercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["mcq"] = "mcq"
    metadata: ExerciseMetadata = Field(default_factory=ExerciseMetadata)
    question: str = Field(default="", description="Nội dung câu hỏi")
    options: list[MCQOption] = Field(
        default_factory=list, min_length=4, max_length=6,
        description="Danh sách 4-6 phương án"
    )
    correct_answer: str = Field(default="", description="Key của đáp án đúng (A/B/C/D)")
    explanation_correct: str = Field(default="", description="Giải thích chi tiết tại sao đáp án đúng")
    explanation_wrong: str | None = Field(default=None, description="Giải thích tổng quát tại sao các đáp án còn lại sai")
    allow_multiple: bool = Field(default=False, description="Có cho phép chọn nhiều đáp án")
    hint: str | None = Field(default=None, description="Gợi ý nhẹ cho người trả lời (không tiết lộ đáp án)")
    max_options: int = Field(default=4, ge=2, le=10, description="Số phương án tối đa cho câu hỏi")
    shuffle_options: bool = Field(default=True, description="Trộn thứ tự phương án khi hiển thị")


# ── Short Answer ──

class ShortAnswerExercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["short_answer"] = "short_answer"
    metadata: ExerciseMetadata = Field(default_factory=ExerciseMetadata)
    question: str = Field(default="", description="Nội dung câu hỏi")
    model_answer: str = Field(default="", description="Đáp án mẫu")
    keywords: list[str] = Field(default_factory=list, description="Từ khóa bắt buộc phải có trong câu trả lời")
    min_words: int | None = Field(default=None, description="Độ dài tối thiểu (từ)")
    max_words: int | None = Field(default=None, description="Độ dài tối đa (từ)")
    grading_rubric: str | None = Field(default=None, description="Tiêu chí chấm điểm")
    sample_bad_answer: str | None = Field(default=None, description="Ví dụ câu trả lời chưa đạt")


# ── Fill in Blank ──

class BlankItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    index: int = Field(default=0, description="Thứ tự blank (0-based)")
    correct_answer: str = Field(default="", description="Đáp án đúng")
    accepted_alternatives: list[str] = Field(default_factory=list, description="Đáp án thay thế chấp nhận được")
    hint: str | None = Field(default=None, description="Gợi ý riêng cho blank này")


class FillInBlankExercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["fill_in_blank"] = "fill_in_blank"
    metadata: ExerciseMetadata = Field(default_factory=ExerciseMetadata)
    text: str = Field(default="", description="Văn bản có ___ đánh dấu chỗ trống")
    blanks: list[BlankItem] = Field(default_factory=list, description="Chi tiết từng blank")
    explanation: str = Field(default="", description="Giải thích tổng quan")
    context: str | None = Field(default=None, description="Đoạn văn bổ trợ ngữ cảnh")
    min_blanks: int = Field(default=2, ge=1, description="Số chỗ trống tối thiểu")
    max_blanks: int = Field(default=6, ge=1, description="Số chỗ trống tối đa")


# ── True/False ──

class TrueFalseExercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["true_false"] = "true_false"
    metadata: ExerciseMetadata = Field(default_factory=ExerciseMetadata)
    statement: str = Field(default="", description="Phát biểu cần xác định đúng/sai")
    is_true: bool = Field(default=False, description="Phát biểu đúng hay sai")
    explanation: str = Field(default="", description="Giải thích tại sao đúng hoặc sai")
    correction: str | None = Field(default=None, description="Nếu sai thì phát biểu đúng là gì")


# ── Matching ──

class MatchingPair(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(default="", description="Mã cặp")
    left: str = Field(default="", description="Cột trái (khái niệm/thuật ngữ)")
    right: str = Field(default="", description="Cột phải (định nghĩa/mô tả)")


class MatchingExercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["matching"] = "matching"
    metadata: ExerciseMetadata = Field(default_factory=ExerciseMetadata)
    instruction: str = Field(default="", description="Hướng dẫn ghép cặp")
    pairs: list[MatchingPair] = Field(default_factory=list, description="Danh sách cặp ghép đúng")
    explanation: str = Field(default="", description="Giải thích từng cặp")
    pairs_count: int = Field(default=5, ge=2, description="Số cặp ghép trong bài tập")


# ── Ordering ──

class OrderingStep(BaseModel):
    model_config = ConfigDict(extra="forbid")
    order: int = Field(default=1, description="Thứ tự đúng (1-based)")
    text: str = Field(default="", description="Nội dung bước")
    explanation: str | None = Field(default=None, description="Tại sao bước này ở vị trí này")


class OrderingExercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["ordering"] = "ordering"
    metadata: ExerciseMetadata = Field(default_factory=ExerciseMetadata)
    instruction: str = Field(default="", description="Hướng dẫn sắp xếp")
    steps: list[OrderingStep] = Field(default_factory=list, description="Các bước đã sắp xếp đúng thứ tự")
    steps_count: int = Field(default=5, ge=2, description="Số bước sắp xếp trong bài tập")


# ── Coding ──

class TestCase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    input: str = Field(default="", description="Đầu vào")
    expected_output: str = Field(default="", description="Đầu ra mong đợi")
    description: str | None = Field(default=None, description="Mô tả test case")


class CodingExercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["coding"] = "coding"
    metadata: ExerciseMetadata = Field(default_factory=ExerciseMetadata)
    problem: str = Field(default="", description="Mô tả bài toán")
    language: str = Field(default="python", description="Ngôn ngữ lập trình")
    starter_code: str | None = Field(default=None, description="Code mẫu khởi đầu")
    solution_code: str = Field(default="", description="Lời giải mẫu")
    test_cases: list[TestCase] = Field(default_factory=list, description="Bộ test cases")
    constraints: list[str] | None = Field(default=None, description="Ràng buộc")
    time_complexity_hint: str | None = Field(default=None, description="Gợi ý độ phức tạp")


# ── Flashcard ──

class FlashcardEntity(BaseModel):
    """Thẻ ghi nhớ — di chuyển từ capabilities/teaching."""
    model_config = ConfigDict(extra="forbid")
    card_id: str = Field(default="", description="Mã định danh thẻ học")
    front_side_prompt: str = Field(default="", description="Câu hỏi kích thích tư duy, định nghĩa bị khuyết hoặc tình huống thực tế")
    back_side_answer: str = Field(default="", description="Giải thích ngắn gọn, từ khóa cốt lõi hoặc khối kiến thức cô đọng nhất")
    mnemonics_hint: str = Field(default="", description="Gợi ý mẹo ghi nhớ hoặc liên kết thực tế giúp ghi nhớ nhanh")