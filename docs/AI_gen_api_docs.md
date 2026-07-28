# API Course / Quiz Generation — viava + GATS

Phiên bản 1.2 — 2026-07-28

## 1. Tổng quan

Provider **viava** nhận nội dung (file / URL / text), dùng Azure OpenAI để sinh
`LearningPath` + `ExerciseSuite`.

GATS BE bọc lại cho **Quiz Admin**:

- Gọi viava với cùng contract multipart
- Map bài tập tương thích → schema quiz GATS (`single_choice` / `multiple_choice` / `fill_blank`)
- (Tuỳ chọn) ghi thẳng câu hỏi vào quiz đang mở

## 2. Provider gốc (viava)

`POST /api/v1/course/generate` — `Content-Type: multipart/form-data`

### Input (chọn đúng 1)

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `file` | UploadFile | No | txt, md, csv, json, yaml, xml, html, pdf, docx, xlsx, pptx, epub |
| `file_url` | str | No | URL file (text + audio transcribe) |
| `text` | str | No | Nội dung text |

### Cấu hình sinh (provider)

| Tham số | Mặc định | Mô tả |
|---|---|---|
| `language` | `vi` | Ngôn ngữ đầu ra |
| `target_level` | `intermediate` | beginner / intermediate / advanced / expert |
| `max_lessons` | `10` | Số bài trong lộ trình |
| `exercises_per_lesson` | `5` | Số bài tập / bài |
| `exercise_types` | trừ coding | mcq, short_answer, fill_in_blank, true_false, matching, ordering, coding |
| `detail_level` | `standard` | concise / standard / detailed |
| `include_coding` | `false` | Có sinh coding |
| `shuffle_options` | `true` | Xáo MCQ |
| `max_options_per_mcq` | `5` | 4–6 |

### Response provider (rút gọn)

```json
{
  "learning_path": { "course_title": "...", "milestones": [] },
  "exercise_suite": {
    "exercises": [
      { "type": "mcq", "question": "...", "options": ["A","B"], "correct_answer": "A" },
      { "type": "true_false", "statement": "...", "is_true": true },
      { "type": "fill_in_blank", "text": "...", "blanks": [{ "answer": "..." }] },
      { "type": "short_answer", "question": "...", "keywords": ["..."] }
    ]
  }
}
```

## 3. GATS — sinh quiz từ AI

### Endpoint Admin

```http
POST /api/quizzes/:quizId/ai-generate
Authorization: cookie / Bearer (staff + quyền update course)
Content-Type: multipart/form-data
```

### Env BE

```env
VIAVA_COURSE_GEN_URL=https://your-viava-host
VIAVA_API_KEY=           # optional Bearer
VIAVA_COURSE_GEN_PATH=/api/v1/course/generate
```

### Form fields (GATS)

| Tham số | Mặc định | Mô tả |
|---|---|---|
| `text` / `file_url` / `file` | — | Đúng 1 nguồn (giống assignment/viava) |
| `language` | `vi` | |
| `target_level` | `intermediate` | |
| `question_count` | `5` | Map → `exercises_per_lesson` (max_lessons=1) |
| `exercise_types` | `mcq,true_false,fill_in_blank,short_answer` | Chỉ loại map được |
| `detail_level` | `standard` | |
| `shuffle_options` | `true` | Forward sang viava |
| `max_options_per_mcq` | `4` | |
| `apply` | `true` | `true` = lưu câu hỏi vào quiz |

### Ánh xạ → quiz GATS

| Viava `type` | Quiz GATS |
|---|---|
| `mcq` | `single_choice` hoặc `multiple_choice` |
| `true_false` | `single_choice` (Đúng / Sai) |
| `fill_in_blank` | `fill_blank` |
| `short_answer` | `fill_blank` (keywords = đáp án chấp nhận) |
| `matching` / `ordering` / `coding` | **bỏ qua** (trả trong `skipped`) |

### Response GATS

```json
{
  "message": "Đã thêm 5 câu hỏi AI vào quiz",
  "data": {
    "course_title": "...",
    "question_count": 5,
    "skipped_count": 1,
    "skipped": [{ "type": "coding", "reason": "..." }],
    "questions": [ /* QuizQuestion đã lưu nếu apply=true */ ],
    "applied": true,
    "supported_exercise_types": ["mcq", "true_false", "fill_in_blank", "short_answer"]
  }
}
```

### UI

Admin → Curriculum → lesson quiz → **Sinh câu hỏi bằng AI**
(`quiz-ai-generate-panel.tsx`).

## 4. GATS — lịch sử làm bài + AI Coach (Admin)

### Nhu cầu

- Gom lịch sử quiz/assignment theo **course + user** (điểm %, câu sai, feedback).
- Dùng lịch sử đó để **đánh giá + gợi ý cải thiện**.
- **Lưu file** Markdown + JSON lên MinIO/S3 để tải / chèn lại.

### Endpoints

```http
GET  /api/courses/:courseId/enrollments/learners/:userId/exercise-history
POST /api/courses/:courseId/enrollments/learners/:userId/ai-coach
Authorization: cookie / Bearer (staff quản lý khóa)
```

### `GET …/exercise-history`

Trả `data`:

- `course`, `user`
- `summary`: số quiz/assignment, điểm quiz TB, `weakLessons`
- `items[]`: quiz attempts (kèm `wrongQuestions`) + assignment submissions

### `POST …/ai-coach`

1. Aggregate history (như GET)
2. Build Markdown baseline
3. (Nếu có `VIAVA_COURSE_GEN_URL`) gọi viava để bổ sung mục **Gợi ý cải thiện (AI)**
4. Upload:
   - `learning-coach/{courseId}/{userId}/{stamp}-report.md`
   - `learning-coach/{courseId}/{userId}/{stamp}-history.json`

Response:

```json
{
  "message": "Đã tạo báo cáo AI coach và lưu file",
  "data": {
    "history": { },
    "reportMarkdown": "# Báo cáo…",
    "usedAi": true,
    "files": {
      "markdown": { "storageKey": "…", "url": "…", "filename": "…" },
      "historyJson": { "storageKey": "…", "url": "…", "filename": "…" }
    }
  }
}
```

Không có lịch sử → `422`. Không cấu hình Viava → vẫn lưu file baseline (`usedAi: false`).

### UI

Admin → Khóa học → Học viên → **Lịch sử & AI coach**  
(`/course/[id]/learners/[userId]`).

## 5. Lỗi thường gặp

| HTTP | Ý nghĩa |
|---|---|
| 400 | NO_INPUT / MULTIPLE_INPUTS / validate form |
| 413 | File > 25MB (GATS upload) hoặc CONTENT_TOO_LONG (viava) |
| 422 | AI không trả bài tập map được / học viên chưa có lịch sử (coach) |
| 502/500 | Lỗi gọi viava / GENERATION_FAILED |
| 503 | Chưa cấu hình `VIAVA_COURSE_GEN_URL` (quiz generate bắt buộc; coach vẫn chạy baseline) |

## 6. Lưu ý

- Thời gian: ~1–3 phút khi gọi AI — Admin client timeout 180s.
- Quiz GATS **không** hỗ trợ matching / ordering / coding; gửi `exercise_types` quiz-compatible để tránh skip nhiều.
- Assignment builder hiện chưa có UI AI riêng; dùng cùng contract multipart nếu sau này mở rộng assignment.
- File coach public URL phụ thuộc `MINIO_PUBLIC_BASE_URL` / endpoint bucket.