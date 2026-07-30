Dưới đây là nội dung một file MD bạn có thể đặt vào `docs/viava-v2-migration.md` để mô tả **quá trình chuyển sang viava Course API v2.0** (áp dụng cho GATS hiện tại).

```markdown
# Viava Course API v2.0 Migration Process (GATS)

Tài liệu này mô tả quy trình chuyển integration của GATS từ contract cũ
`POST /api/v1/course/generate` sang **Viava Course API v2.0**.

Phạm vi áp dụng chính:
- `BE/src/services/QuizAiService.ts` (AI quiz / per-exercise generation)
- `BE/src/services/LearningCoachService.ts` (AI coach tips)
- `admin-dashboard/src/services/quiz.client.ts` (giữ UI contract nội bộ; chỉ thay BE wiring)
- (tuỳ chọn) teaching endpoints: `/course/evaluate`, `/course/explain`, `/course/summarize`, `/course/chat`

> Lưu ý: Tài liệu viava v2.0 của bạn yêu cầu request theo 2 bước:
> 1) tạo `learning_path` bằng `/course/learning-path/generate`
> 2) sinh `exercises` theo từng type bằng `/course/exercises/{type}/generate`

---

## 1. Inventory: GATS hiện đang gọi viava thế nào

Hiện tại GATS gọi viava qua một endpoint duy nhất:

- `POST ${VIAVA_COURSE_GEN_URL}${VIAVA_COURSE_GEN_PATH}` trong:
  - `BE/src/services/QuizAiService.ts` (`callViavaGenerate`)
  - `BE/src/services/LearningCoachService.ts` (`callViavaCoach`)

Contract cũ (rút gọn) thường trả về:
- `learning_path` (ít/không đủ schema)
- `exercise_suite.exercises` (array các exercise)

---

## 2. Chuẩn hoá kế hoạch migration (đề xuất)

Khuyến nghị chạy **song song qua feature flag** để giảm rủi ro:
- Mặc định giữ v1 hiện tại (đang chạy quiz + mapping)
- Khi bật viava v2, BE sẽ gọi các endpoint v2 và adapter response sang schema quiz GATS

Trong bước migration tài liệu này, ta tập trung 2 luồng:

### Luồng A: AI quiz generation (QuizAiService)
- Mục tiêu: map được 4 loại quiz GATS:
  - `mcq`, `true_false`, `fill_in_blank`, `short_answer`
- Loại bỏ mapping cho `matching`, `ordering`, `coding` (đưa vào `skipped` như hiện tại)

### Luồng B: AI coach tips (LearningCoachService)
- Mục tiêu: xuất câu trả lời dạng tiếng Việt để gắn vào Markdown báo cáo
- Cách thực dụng nhất theo tài liệu v2.0: dùng `/course/chat`

---

## 3. Chuẩn bị dữ liệu: lấy `domain` bắt buộc của v2.0

V2.0 yêu cầu field `domain` là **bắt buộc** ở `POST /course/learning-path/generate`.

Trong GATS hiện tại:
- `BE/src/db/schema/course.ts` có `categoryId`, không có field `domain`.

**Bạn cần chốt rule map domain** theo một trong các hướng:
1) `domain = category.slug` (hoặc normalize slug)
2) Có bảng mapping cố định trong code/env: `category.slug -> viava domain`
3) (Không khuyến nghị cho MVP) thêm field `domain` vào course (cần migration + UI)

> Nếu bạn muốn nhanh mà ít sửa DB: chọn (2) bằng mapping table trong code/env.

---

## 4. Quá trình gọi viava v2 cho AI quiz (5.1 → 5.10 trong doc)

Giả sử GATS muốn sinh N câu hỏi cho quiz.

### Bước 1: `learning_path` generate
Endpoint:
- `POST /course/learning-path/generate`

Request (theo doc v2):
- Content input: `file` hoặc `file_url` hoặc `text` (giống contract form-data hiện tại của quiz)
- `language`: `vi`
- `target_level`: theo `GenerateQuizAiFields.target_level`
- `detail_level`: theo `GenerateQuizAiFields.detail_level`
- `max_lessons`: đề xuất `1` (hoặc giữ logic cũ nhưng cần vì quiz chỉ cần câu hỏi)
- `exercises_per_lesson`: `question_count` (để gom đủ số câu hỏi)
- `domain`: theo rule ở mục (3)

Response:
- `learning_path` trả về `milestones[]` và `course_title`.

> Gợi ý: Khi mục tiêu là quiz (không cần milestones nhiều), đặt `max_lessons = 1` để giảm nhiễu & chi phí.

### Bước 2: generate exercises theo từng type
Với mỗi `exercise_type` mà GATS muốn map:
- `mcq` -> `POST /course/exercises/mcq/generate`
- `true_false` -> `POST /course/exercises/true-false/generate`
- `fill_in_blank` -> `POST /course/exercises/fill-in-blank/generate`
- `short_answer` -> `POST /course/exercises/short-answer/generate`

Request chung (theo doc v2):
- `learning_path`: object từ Bước 1
- `language`, `target_level`, `detail_level`
- `exercises_per_lesson`: `question_count` (hoặc chia đều theo từng type nếu muốn đúng tổng số)
  
Response chung:
- `{ course_title, exercise_type, total_exercises, exercises: [...] }`

### Bước 3: Adapter map `exercises[]` → schema quiz GATS
Hiện tại `QuizAiService.ts` có các hàm:
- `mapMcq`
- `mapTrueFalse`
- `mapFillBlank`
- `mapShortAnswer`

Việc migration cần:
- Cập nhật field-path lấy dữ liệu từ response v2.0 (vì object shape có thể khác v1)
- Thêm “normalization”:
  - `question/prompt/statement`
  - `options/choices`
  - `correct_answer` / `correctAnswer` / `answer`
  - `blanks` / `answers` / `keywords`

### Bước 4: “skipped” như hiện tại
- Nếu viava trả type không hỗ trợ -> `skipped.push({ type, reason })`
- Nếu không map được -> `skipped.push({ type, reason })`

---

## 5. Quá trình gọi viava v2 cho AI coach (LearningCoachService)

Luồng hiện tại:
- `LearningCoachService` build Markdown lịch sử chi tiết
- Gọi viava bằng prompt tự do để lấy tips

Với v2.0, cách phù hợp nhất để giữ UX:
- Dùng `POST /course/chat`
  - `query`: chứa prompt + `markdownHistory` (dạng tiếng Việt như hiện tại)
  - `domains`: nếu có rule map domain, filter vào domain khóa học

Response:
- `{ answer, references }`

Adapter:
- `answer` được chèn trực tiếp vào markdown report dưới mục:
  - `## Gợi ý cải thiện (AI)`

> Nếu bạn muốn cấu trúc “explanation_text / analogies / examples” đúng schema teaching,
> có thể đổi sang `/course/explain` hoặc `/course/summarize`, nhưng coach hiện tại đang dùng format tips dài trong Markdown, nên `/course/chat` là thực dụng nhất.

---

## 6. Error mapping (v2 codes → GATS HttpStatusCodes)

Tài liệu viava v2.0 có:
- `VALIDATION_ERROR`, `FETCH_FAILED`, `CONTENT_TOO_LONG`, `EXTRACT_FAILED`, `GENERATION_FAILED`, ...

Trong BE wrapper hiện tại đã xử lý theo status code:
- 400 / 413 / 422 / ... để map sang `HttpStatusCodes.*`

Migration cần:
- Khi `response.status` là 422 (Unprocessable) hoặc payload có `detail.code`,
  append code vào message để admin biết lý do.

---

## 7. Migration plan theo bước triển khai

### Step 0: Feature flag
- Thêm env: ví dụ `VIAVA_COURSE_GEN_V2_ENABLED=true|false`
- Khi false: giữ gọi v1 hiện tại
- Khi true: chuyển sang:
  - LearningPath generate + per-exercise generate cho QuizAiService
  - chat endpoint cho LearningCoachService

### Step 1: Domain resolution
- Implement `resolveViavaDomain(courseId)`:
  - đọc `course.categoryId` -> đọc `category.slug`
  - map slug -> domain (bằng config env hoặc mapping table)

### Step 2: QuizAiService v2 adapter
- Thay `callViavaGenerate()` thành wrapper theo chuỗi 2 bước:
  - learning-path endpoint
  - per-exercise endpoint (loop theo `exercise_types`)
- Update mapping functions để đọc đúng field-path của v2.

### Step 3: LearningCoachService v2
- Replace prompt call từ `POST /api/v1/course/generate` sang:
  - `POST /course/chat` với query = prompt + markdownHistory

### Step 4: Tests / fixtures
- Thêm unit tests cho adapter:
  - normalize mcq/true_false/fill_blank/short_answer
- Bảo đảm mapping không crash khi viava trả thiếu field
  - fallback như hiện tại

### Step 5: Rollout
- Bật v2 cho staging / cho một số admin
- Nếu map sai nhiều -> disable flag, quay về v1

---

## 8. Checklist “sẽ không gãy” với quiz hiện tại

- Không thay UI contract `/quizzes/:quizId/ai-generate` của BE
- Không đổi schema DB quiz (chỉ thay adapter gọi viava + map response)
- `skipped` vẫn hoạt động để tránh tạo câu hỏi lỗi
- Giữ behavior “apply=true lưu vào quiz” như hiện tại

---

## 9. Tài liệu tham chiếu trong repo

- Viava integration hiện tại:
  - `BE/src/services/QuizAiService.ts`
  - `BE/src/services/LearningCoachService.ts`
- Quiz Ai UI / client:
  - `admin-dashboard/src/services/quiz.client.ts`
- Script docs cũ về viava:
  - `docs/AI_gen_api_docs.md`

---

## 10. Kết luận

Việc chuyển sang v2.0 không chỉ là đổi URL, mà là:
- đổi sang quy trình 2 bước `learning_path -> per-exercise generation`
- cập nhật adapter map vì schema response có thể khác
- với AI coach: đổi sang `chat`/teaching endpoints phù hợp để lấy answer dạng tips

```

Bạn muốn mình **tạo file thật** trong `docs/` với tên gì (mặc định mình đề xuất `docs/viava-v2-migration.md`)?