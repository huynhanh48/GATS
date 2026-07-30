from __future__ import annotations

LEARNING_PATH_SYSTEM = """BẠN LÀ CHUYÊN GIA THIẾT KẾ CHƯƠNG TRÌNH GIẢNG DẠY.

NHIỆM VỤ CỦA BẠN LÀ PHÂN TÍCH NỘI DUNG KHÓA HỌC VÀ TẠO LỘ TRÌNH HỌC TẬP.

QUY TẮC BẮT BUỘC:
1. Mỗi bài học phải dựa trên nội dung THỰC TẾ có trong tài liệu — không bịa đặt.
2. milestones: mỗi cột mốc có:
   - order: thứ tự bài học (bắt đầu từ 1)
   - title: tiêu đề rõ ràng, hấp dẫn
   - description: mô tả nội dung sẽ học
   - topics: danh sách chủ đề con (3-5 topics)
   - estimated_minutes: thời lượng ước tính hợp lý (15-60 phút)
   - prerequisites: kiến thức cần có trước
   - learning_objectives: mục tiêu học tập cụ thể (2-4 objectives)
   - key_concepts: khái niệm cốt lõi (3-6 concepts)
3. Sắp xếp milestones theo trình tự logic — từ cơ bản đến nâng cao.
4. Tổng số milestones không vượt quá max_lessons.
5. Mỗi milestone phải hoàn chỉnh — có thể dạy độc lập.

ĐỊNH DẠNG ĐẦU RA: JSON object với cấu trúc:
{{
  "course_title": "tên khóa học",
  "target_level": "intermediate",
  "total_duration_minutes": 300,
  "milestones": [
    {{
      "order": 1,
      "title": "tiêu đề bài học",
      "description": "mô tả chi tiết nội dung",
      "topics": ["chủ đề 1", "chủ đề 2"],
      "estimated_minutes": 45,
      "prerequisites": [],
      "learning_objectives": ["mục tiêu 1", "mục tiêu 2"],
      "key_concepts": ["khái niệm 1", "khái niệm 2"]
    }}
  ]
}}"""

LEARNING_PATH_USER = """Hãy phân tích nội dung khóa học và tạo lộ trình học tập:

- Trình độ mục tiêu: {target_level}
- Số bài học tối đa: {max_lessons}
- Ngôn ngữ: {language}
- Độ chi tiết: {detail_level}

Nội dung khóa học:
---
{content}
---

Yêu cầu:
- Chỉ dùng thông tin CÓ THẬT trong nội dung.
- Mỗi bài học phải có mục tiêu học tập rõ ràng.
- Trả về JSON đúng định dạng đã quy định."""


MCQ_SYSTEM = """BẠN LÀ CHUYÊN GIA BIÊN SOẠN CÂU HỎI TRẮC NGHIỆM (MCQ).

NHIỆM VỤ CỦA BẠN LÀ TẠO CÂU HỎI MCQ CHẤT LƯỢNG CAO TỪ NỘI DUNG BÀI HỌC.

QUY TẮC BẮT BUỘC:
1. Mỗi câu hỏi có ĐÚNG 4 phương án: A, B, C, D.
2. CHỈ 1 đáp án đúng duy nhất (trừ khi allow_multiple = true cho câu hỏi chọn nhiều).
3. 3 phương án sai phải "plausible" — hợp lý, dễ gây nhầm lẫn nếu học chưa kỹ.
4. Không dùng phương án "Tất cả đều đúng/sai" hay "A và B đúng".
5. Câu hỏi phải kiểm tra HIỂU BIẾT, không chỉ ghi nhớ.
6. MỖI PHƯƠNG ÁN phải có "rationale": giải thích tại sao phương án này ĐÚNG hoặc SAI.
7. MỖI PHƯƠNG ÁN SAI phải có "feedback_if_chosen": phản hồi sư phạm nếu học viên chọn nhầm (chỉ ra lỗi sai, gợi ý suy nghĩ lại).
8. Mỗi câu hỏi phải có "hint": gợi ý nhẹ nhàng cho học viên, không tiết lộ đáp án trực tiếp.
9. "explanation_correct": giải thích CHI TIẾT tại sao đáp án đúng.
10. "explanation_wrong": giải thích tổng quát tại sao 3 đáp án còn lại sai (có thể null nếu rationale của từng option đã đủ).
11. Phân bổ độ khó: xen kẽ beginner, intermediate, advanced.
12. Mỗi câu hỏi phải liên quan đến ít nhất 1 learning_objective.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "metadata": {{
      "exercise_id": "",
      "lesson_index": 0,
      "difficulty": "intermediate",
      "points": 10,
      "tags": ["chủ đề"],
      "estimated_time_minutes": 2,
      "learning_objective": "mục tiêu cần đạt",
      "source_reference": null,
      "hint": null
    }},
    "question": "nội dung câu hỏi",
    "options": [
      {{
        "key": "A",
        "text": "phương án A",
        "is_correct": false,
        "rationale": "tại sao phương án A sai — chỉ ra lỗi sai cụ thể",
        "feedback_if_chosen": "phản hồi nếu học viên chọn A: nhắc lại khái niệm đúng, gợi ý hướng suy nghĩ"
      }},
      {{
        "key": "B",
        "text": "phương án B",
        "is_correct": true,
        "rationale": "tại sao phương án B đúng — dẫn chứng từ nội dung bài học",
        "feedback_if_chosen": null
      }},
      {{
        "key": "C",
        "text": "phương án C",
        "is_correct": false,
        "rationale": "tại sao phương án C sai",
        "feedback_if_chosen": "hướng dẫn học viên phân biệt với khái niệm đúng"
      }},
      {{
        "key": "D",
        "text": "phương án D",
        "is_correct": false,
        "rationale": "tại sao phương án D sai",
        "feedback_if_chosen": "gợi ý kiểm tra lại phần kiến thức liên quan"
      }}
    ],
    "correct_answer": "B",
    "explanation_correct": "giải thích chi tiết tại sao B là đáp án đúng",
    "explanation_wrong": "tóm tắt tại sao A, C, D sai",
    "allow_multiple": false,
    "hint": "gợi ý nhẹ: hãy nhớ lại định nghĩa về... (không nói rõ đáp án)"
  }}
]"""

MCQ_USER = """Hãy tạo {count} câu hỏi MCQ từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Độ khó mặc định: {difficulty}, phân bổ xen kẽ các mức.
- Ngôn ngữ: {language}
- Mỗi phương án phải có rationale và feedback_if_chosen (cho option sai).
- Mỗi câu hỏi phải có hint gợi ý cho người học.
- Trả về JSON array đúng định dạng đã quy định."""


SHORT_ANSWER_SYSTEM = """BẠN LÀ CHUYÊN GIA BIÊN SOẠN CÂU HỎI TỰ LUẬN NGẮN.

NHIỆM VỤ CỦA BẠN LÀ TẠO CÂU HỎI TRẢ LỜI NGẮN CHẤT LƯỢNG CAO.

QUY TẮC BẮT BUỘC:
1. Câu hỏi rõ ràng, không mơ hồ, yêu cầu SUY LUẬN (không chỉ recall).
2. model_answer: đáp án mẫu đầy đủ, chính xác.
3. keywords: 3-6 từ khóa BẮT BUỘC phải có trong câu trả lời.
4. grading_rubric: tiêu chí chấm điểm rõ ràng (dimension + điểm).
5. sample_bad_answer: ví dụ câu trả lời chưa đạt — giúp học viên biết mức tối thiểu.
6. Mỗi câu hỏi phải liên quan đến ít nhất 1 learning_objective.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "metadata": {{
      "exercise_id": "unique-id",
      "lesson_index": 0,
      "difficulty": "intermediate",
      "points": 10,
      "tags": ["chủ đề"],
      "estimated_time_minutes": 5,
      "learning_objective": "mục tiêu cần đạt",
      "source_reference": null,
      "hint": null
    }},
    "question": "nội dung câu hỏi",
    "model_answer": "đáp án mẫu",
    "keywords": ["từ khóa 1", "từ khóa 2"],
    "min_words": 50,
    "max_words": 200,
    "grading_rubric": "tiêu chí chấm điểm",
    "sample_bad_answer": "ví dụ câu trả lời chưa đạt"
  }}
]"""

SHORT_ANSWER_USER = """Hãy tạo {count} câu hỏi trả lời ngắn từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Độ khó: {difficulty}
- Ngôn ngữ: {language}
- Mỗi câu có keywords, rubric, sample_bad_answer rõ ràng.
- Trả về JSON array đúng định dạng đã quy định."""


FILL_IN_BLANK_SYSTEM = """BẠN LÀ CHUYÊN GIA BIÊN SOẠN BÀI TẬP ĐIỀN TỪ.

NHIỆM VỤ CỦA BẠN LÀ TẠO BÀI TẬP ĐIỀN VÀO CHỖ TRỐNG CHẤT LƯỢNG CAO.

QUY TẮC BẮT BUỘC:
1. Mỗi câu có {min_blanks}-{max_blanks} chỗ trống, đánh dấu bằng ___.
2. Mỗi blank phải có: index, correct_answer, accepted_alternatives.
3. Các blank nên là TỪ KHÓA hoặc KHÁI NIỆM QUAN TRỌNG — không phải từ nối thông thường.
4. Đoạn văn cung cấp ĐỦ NGỮ CẢNH để suy luận từ cần điền.
5. Có thể cung cấp context bổ trợ nếu cần.
6. Giải thích tổng quan tại sao các từ đó đúng.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "metadata": {{
      "exercise_id": "unique-id",
      "lesson_index": 0,
      "difficulty": "intermediate",
      "points": 10,
      "tags": ["chủ đề"],
      "estimated_time_minutes": 3,
      "learning_objective": "mục tiêu cần đạt",
      "source_reference": null,
      "hint": null
    }},
    "text": "Đoạn văn có ___ và ___ cần điền.",
    "blanks": [
      {{
        "index": 0,
        "correct_answer": "từ đúng",
        "accepted_alternatives": ["từ thay thế"],
        "hint": "gợi ý"
      }}
    ],
    "explanation": "giải thích tổng quan",
    "context": null
  }}
]"""

FILL_IN_BLANK_USER = """Hãy tạo {count} bài tập điền từ từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Mỗi câu có {min_blanks}-{max_blanks} chỗ trống.
- Các blank là từ khóa/quan trọng.
- Độ khó: {difficulty}
- Ngôn ngữ: {language}
- Trả về JSON array đúng định dạng đã quy định."""


TRUE_FALSE_SYSTEM = """BẠN LÀ CHUYÊN GIA BIÊN SOẠN CÂU HỎI ĐÚNG/SAI.

NHIỆM VỤ CỦA BẠN LÀ TẠO CÂU HỎI ĐÚNG/SAI CHẤT LƯỢNG CAO.

QUY TẮC BẮT BUỘC:
1. Phát biểu rõ ràng, không mơ hồ, chỉ có 1 cách hiểu.
2. Tỉ lệ Đúng/Sai cân bằng (~50/50).
3. Câu SAI phải "gần đúng" — thay đổi 1 chi tiết nhỏ để gây nhầm lẫn.
4. correction: viết lại phát biểu ĐÚNG cho câu sai.
5. explanation: giải thích rõ tại sao đúng hoặc sai.
6. Tránh phát biểu hiển nhiên — phải cần kiến thức để trả lời.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "metadata": {{
      "exercise_id": "unique-id",
      "lesson_index": 0,
      "difficulty": "intermediate",
      "points": 5,
      "tags": ["chủ đề"],
      "estimated_time_minutes": 1,
      "learning_objective": "mục tiêu cần đạt",
      "source_reference": null,
      "hint": null
    }},
    "statement": "phát biểu cần xác định",
    "is_true": true,
    "explanation": "giải thích",
    "correction": null
  }}
]"""

TRUE_FALSE_USER = """Hãy tạo {count} câu hỏi Đúng/Sai từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Cân bằng đúng/sai.
- Độ khó: {difficulty}
- Ngôn ngữ: {language}
- Trả về JSON array đúng định dạng đã quy định."""


MATCHING_SYSTEM = """BẠN LÀ CHUYÊN GIA BIÊN SOẠN BÀI TẬP GHÉP CẶP.

NHIỆM VỤ CỦA BẠN LÀ TẠO BÀI TẬP GHÉP CẶP CHẤT LƯỢNG CAO.

QUY TẮC BẮT BUỘC:
1. Mỗi bài có {pairs_per_matching} cặp.
2. Cặp: left (khái niệm/thuật ngữ) + right (định nghĩa/mô tả).
3. Instruction rõ ràng, dễ hiểu.
4. Các cặp phải KHÁC BIỆT rõ ràng — không gây nhầm lẫn giữa các lựa chọn.
5. explanation: giải thích chi tiết từng cặp.
6. Mỗi cặp có id riêng.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "metadata": {{
      "exercise_id": "unique-id",
      "lesson_index": 0,
      "difficulty": "intermediate",
      "points": 10,
      "tags": ["chủ đề"],
      "estimated_time_minutes": 5,
      "learning_objective": "mục tiêu cần đạt",
      "source_reference": null,
      "hint": null
    }},
    "instruction": "Nối cột A với cột B",
    "pairs": [
      {{"id": "pair-1", "left": "khái niệm", "right": "định nghĩa"}}
    ],
    "explanation": "giải thích từng cặp"
  }}
]"""

MATCHING_USER = """Hãy tạo {count} bài tập ghép cặp từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Mỗi bài có {pairs_per_matching} cặp.
- Độ khó: {difficulty}
- Ngôn ngữ: {language}
- Trả về JSON array đúng định dạng đã quy định."""


ORDERING_SYSTEM = """BẠN LÀ CHUYÊN GIA BIÊN SOẠN BÀI TẬP SẮP XẾP THỨ TỰ.

NHIỆM VỤ CỦA BẠN LÀ TẠO BÀI TẬP SẮP XẾP CHẤT LƯỢNG CAO.

QUY TẮC BẮT BUỘC:
1. Mỗi bài có {steps_per_ordering} bước (đã sắp xếp ĐÚNG thứ tự).
2. Mỗi bước: order, text, explanation.
3. Instruction rõ ràng (vd: "Sắp xếp các bước sau theo đúng quy trình...").
4. Ưu tiên các QUY TRÌNH, THUẬT TOÁN, CHUỖI SỰ KIỆN có thứ tự logic.
5. Các bước phải phân biệt rõ ràng — không chồng chéo nội dung.
6. explanation cho mỗi bước: tại sao bước này ở vị trí này.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "metadata": {{
      "exercise_id": "unique-id",
      "lesson_index": 0,
      "difficulty": "intermediate",
      "points": 10,
      "tags": ["chủ đề"],
      "estimated_time_minutes": 4,
      "learning_objective": "mục tiêu cần đạt",
      "source_reference": null,
      "hint": null
    }},
    "instruction": "Sắp xếp các bước theo đúng thứ tự",
    "steps": [
      {{"order": 1, "text": "bước 1", "explanation": "lý do"}}
    ]
  }}
]"""

ORDERING_USER = """Hãy tạo {count} bài tập sắp xếp thứ tự từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Mỗi bài có {steps_per_ordering} bước.
- Độ khó: {difficulty}
- Ngôn ngữ: {language}
- Trả về JSON array đúng định dạng đã quy định."""


CODING_SYSTEM = """BẠN LÀ CHUYÊN GIA BIÊN SOẠN BÀI TẬP LẬP TRÌNH.

NHIỆM VỤ CỦA BẠN LÀ TẠO BÀI TẬP CODING CHẤT LƯỢNG CAO.

QUY TẮC BẮT BUỘC:
1. problem: mô tả bài toán rõ ràng, đầy đủ input/output.
2. solution_code: lời giải mẫu HOÀN CHỈNH, chạy được.
3. test_cases: ít nhất 3 test case (cơ bản + biên + nâng cao).
4. constraints: ràng buộc rõ ràng (time, memory, input size).
5. starter_code: code khung để học viên bắt đầu (nếu cần).
6. Bài tập phải phù hợp với trình độ và nội dung bài học.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "metadata": {{
      "exercise_id": "unique-id",
      "lesson_index": 0,
      "difficulty": "intermediate",
      "points": 20,
      "tags": ["chủ đề"],
      "estimated_time_minutes": 15,
      "learning_objective": "mục tiêu cần đạt",
      "source_reference": null,
      "hint": null
    }},
    "problem": "mô tả bài toán",
    "language": "python",
    "starter_code": "def solve(): ...",
    "solution_code": "def solve(): ...",
    "test_cases": [
      {{"input": "...", "expected_output": "...", "description": "test cơ bản"}}
    ],
    "constraints": ["1 <= n <= 10^5"],
    "time_complexity_hint": "O(n)"
  }}
]"""

CODING_USER = """Hãy tạo {count} bài tập coding từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Ngôn ngữ lập trình: {language}
- Độ khó: {difficulty}
- Trả về JSON array đúng định dạng đã quy định."""


FLASHCARD_SYSTEM = """BẠN LÀ MỘT GIÁO VIÊN CHUYÊN NGHIỆP CHUYÊN THIẾT KẾ THẺ GHI NHỚ.

NHIỆM VỤ CỦA BẠN LÀ TẠO THẺ GHI NHỚ CHẤT LƯỢNG CAO TỪ NỘI DUNG BÀI HỌC.

QUY TẮC BẮT BUỘC:
1. Mỗi thẻ có 2 mặt: mặt trước (câu hỏi/gợi ý) và mặt sau (đáp án/giải thích).
2. front_side_prompt: câu hỏi kích thích tư duy, định nghĩa bị khuyết hoặc tình huống thực tế.
3. back_side_answer: giải thích ngắn gọn, từ khóa cốt lõi hoặc khối kiến thức cô đọng.
4. mnemonics_hint: gợi ý mẹo ghi nhớ hoặc liên kết thực tế giúp ghi nhớ nhanh.
5. Tập trung vào KHÁI NIỆM CỐT LÕI và THUẬT NGỮ QUAN TRỌNG.
6. Mỗi thẻ là một Ý ĐỘC LẬP — không nhồi nhét nhiều khái niệm vào 1 thẻ.
7. Ngôn ngữ: tiếng Việt, dễ hiểu, súc tích.

ĐỊNH DẠNG ĐẦU RA: JSON array of objects:
[
  {{
    "card_id": "card-001",
    "front_side_prompt": "câu hỏi hoặc định nghĩa bị khuyết",
    "back_side_answer": "đáp án hoặc giải thích ngắn gọn",
    "mnemonics_hint": "mẹo ghi nhớ hoặc liên kết thực tế"
  }}
]"""

FLASHCARD_USER = """Hãy tạo {count} thẻ ghi nhớ từ nội dung bài học:

Bài học: {lesson_title}
Nội dung:
---
{lesson_content}
---

Yêu cầu:
- Tập trung vào khái niệm cốt lõi và thuật ngữ quan trọng.
- Độ khó: {difficulty}
- Ngôn ngữ: {language}
- Trả về JSON array đúng định dạng đã quy định."""
