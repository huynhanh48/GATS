-- Thêm 2 dạng câu hỏi phổ biến cho quiz thủ công (không dùng AI).
-- true_false : câu Đúng/Sai, tự chấm (2 lựa chọn, 1 đáp án đúng)
-- short_answer: trả lời ngắn, tự chấm theo danh sách đáp án được chấp nhận
ALTER TYPE "quiz_question_type" ADD VALUE IF NOT EXISTS 'true_false';
--> statement-breakpoint
ALTER TYPE "quiz_question_type" ADD VALUE IF NOT EXISTS 'short_answer';
