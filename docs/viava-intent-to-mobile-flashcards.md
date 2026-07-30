# Từ “ý muốn” đến Flashcard cho Mobile (GATS + viava v2)

Tài liệu này mô tả quy trình để lấy “ý muốn”/ngữ cảnh học tập (text hoặc file) và chuyển thành **Flashcard** cho mobile bằng cách:

1. Gọi viava v2 để tạo `learning_path`
2. Gọi viava v2 để sinh exercise loại `flashcard`
3. Map response thành dữ liệu trong DB của **Flashcard decks/cards**
4. Mobile tự lấy card cần ôn qua endpoint `GET /api/flashcards/due`

Phạm vi: tài liệu tập trung vào **flashcard deck/cards trên mobile**, không làm hóa đơn hay các phần khác.

Nguồn Swagger/docs để đối chiếu contract viava:
- `https://judiciarily-ruffled-lenny.ngrok-free.dev/docs`
- Đây là Swagger UI của viava Course API mà team có thể mở trực tiếp để xem request/response thực tế của các endpoint generate.

---

## 1. Contract mobile đang đọc flashcard như thế nào

Mobile không cần biết viava. Mobile chỉ cần DB có deck/cards ở trạng thái phù hợp.

### 1.1 Endpoint lấy card đến hạn

`GET /api/flashcards/due?limit=20&courseId?=...`

BE trả về shape (theo `BE/src/services/FlashcardService.ts:due`):

- `data: Array<{
  id, deckId, deckTitle,
  courseId, courseTitle,
  front, back, hint,
  version, dueAt, ease, intervalDays
}>`

Trong mobile:
- `mobile-app/lib/data/api/flashcard_api_service.dart` parse `front/back/hint` từ response
- `flashcard_deck_section.dart` group theo `deckId` và render từng deck

### 1.2 Điều kiện để card xuất hiện trong due()

Trong `FlashcardService.due()` BE filter:

- `flashcard_decks.status = 'published'`
- `flashcards.status = 'published'`
- user có **enrollment active** với `courseId`
- `flashcard_user_state.dueAt is null OR dueAt <= now`

Hệ quả quan trọng:
- Nếu bạn tạo **deck/cards published** mà chưa tạo `flashcard_user_state` cho người dùng, thì `dueAt` sẽ là `null` và card sẽ “đến hạn” ngay (đối với người dùng phù hợp enrollment).

---

## 2. DB model để tạo Flashcard cho mobile

Các bảng chính trong `BE/src/db/schema/mobile-experience.ts`:

- `flashcard_decks`
  - `courseId` (bắt buộc, FK courses)
  - `lessonId` (nullable)
  - `title` / `description`
  - `status`: `draft | published | archived`
  - `sortOrder`
- `flashcards`
  - `deckId` (FK flashcard_decks)
  - `front`, `back` (bắt buộc, max 4000 ký tự)
  - `hint` (optional, lưu null)
  - `status`: `draft | published | archived`
  - `sortOrder`

Mobile hiển thị:
- Front: `flashcards.front`
- Back: `flashcards.back`
- Hint: `flashcards.hint` (được hiển thị trên mặt trước)

---

## 3. “Ý muốn” nghĩa là gì trong luồng này

Ở context viava, “ý muốn” thường là:

- nội dung để sinh flashcard (text / file / file_url)
- bối cảnh độ khó & chi tiết (`target_level`, `detail_level`)
- domain phục vụ viava (`domain` là bắt buộc ở bước `learning-path` theo tài liệu v2)

Tài liệu viava v2 của bạn mô tả format chung cho 8 loại exercise, trong đó:
- `learning-path`: `POST /course/learning-path/generate` (multipart/form-data)
- `flashcard`: `POST /course/exercises/flashcard/generate`

Link docs tham chiếu trực tiếp:
- Swagger UI: `https://judiciarily-ruffled-lenny.ngrok-free.dev/docs`

Trong GATS hiện tại chưa có field `domain` trên course (course chỉ có `categoryId` + category có `slug/name`).
Vì vậy cần một rule mapping trước khi gọi viava.

---

## 4. Rule mapping `domain` cho viava v2 (khuyến nghị MVP)

Course hiện có:
- `BE/src/db/schema/course.ts`: `categoryId`, `level`
- `BE/src/db/schema/category.ts`: `slug`, `name`

Khuyến nghị rule nhanh:

- `domain = normalize(category.slug)`

Nếu bạn muốn domain theo “tên miền” khác ví dụ `programming/legal`:
- tạo mapping cố định trong env hoặc code (ví dụ `category.slug -> viava domain`)

---

## 5. Chuỗi gọi viava v2 để sinh flashcard

Mục tiêu: tạo ra một danh sách flashcard items để map thành `flashcard_decks` + `flashcards`.

### 5.1 Bước 1: Generate `learning_path`

Endpoint:
- `POST /course/learning-path/generate`

Request (theo doc viava v2.0):
- `file` hoặc `file_url` hoặc `text` (ít nhất 1)
- `language`: `vietnamese` (hoặc `vi`)
- `target_level`: `beginner|intermediate|advanced|expert`
- `detail_level`: `concise|standard|detailed`
- `max_lessons`: dùng đề xuất `1` nếu bạn chỉ cần flashcards theo một cụm
- `exercises_per_lesson`: số flashcards bạn muốn (hoặc chia theo type)
- `domain`: bắt buộc

Response:
- `learning_path` chứa `milestones[]`

### 5.2 Bước 2: Generate exercise type `flashcard`

Endpoint:
- `POST /course/exercises/flashcard/generate`

Request format chung của viava v2 yêu cầu body JSON:
- `learning_path`: nhận từ bước 1
- `language`
- `target_level`
- `detail_level`
- `exercises_per_lesson`: số lượng flashcard cần sinh (mapping từ `question_count/cards_per_deck` của bạn)

Response:
- Mỗi exercise endpoint trả về object gồm:
  - `course_title`, `exercise_type`, `total_exercises`, `exercises[]`

> Lưu ý: tài liệu v2 bạn gửi mô tả response chung, nhưng phần schema chi tiết field trong `exercises[]` cho `flashcard` không nằm trong đoạn bạn paste.
> Vì vậy bước map `front/back/hint` cần dựa trên response thực tế của viava v2 (xem checklist ở phần 8).

---

## 6. Map viava `exercises[]` → Flashcard cards (front/back/hint)

Giả định mỗi `exercise` trong response flashcard chứa các field tương tự:
- “mặt trước” (question/prompt/text/front)
- “mặt sau” (answer/correct_answer/back)
- “gợi ý” (hint/mnemonic/hints)

Rule map đề xuất (có fallback theo nhiều tên field):

- `front`:
  - ưu tiên `ex.question` / `ex.prompt` / `ex.text` / `ex.front`
- `back`:
  - ưu tiên `ex.answer` / `ex.correct_answer` / `ex.back`
- `hint`:
  - ưu tiên `ex.hint` / `ex.mnemonic` / `ex.mnemonics` (nếu là mảng thì join thành chuỗi)

Validation tối thiểu:
- `front` phải non-empty
- `back` phải non-empty
- Nếu `hint` vắng -> lưu `null`
- Truncate nếu vượt max 4000 ký tự (theo schema flashcards)

---

## 7. Map “milestones” → Flashcard deck(s)

Mobile cần deck để group cards theo `deckId`, và hiển thị `deck.title` + `deck.moduleName`.

Khuyến nghị triển khai:

### 7.1 Deck theo milestone (đúng tinh thần learning path)

- Mỗi `milestone` trong `learning_path.milestones[]` tạo 1 deck:
  - `deck.title = milestone.title`
  - `deck.description = milestone.description` (nếu có)
  - `lessonId = null` (MVP) hoặc map sang lessonId nếu bạn có mapping milestone→lesson
  - `status = 'draft'` → tạo xong cards → set `'published'`
  - `sortOrder = milestone.order`

### 7.2 Card theo exercise

- Với mỗi exercise sinh ra từ endpoint `flashcard`:
  - xác định deck đích:
    - MVP: tất cả cards vào 1 deck đầu tiên
    - nâng cấp: nếu viava trả thêm field “milestone/order” thì phân vào đúng deck
  - `sortOrder = index` theo thứ tự trong response

---

## 8. Tạo deck/cards qua các endpoint admin hiện có

Admin hiện có sẵn CRUD deck/cards trong:
- `BE/src/routes/flashcard/flashcardAdminRouter.ts`
- `BE/src/services/FlashcardAdminService.ts`

Endpoints (được admin-dashboard dùng qua `flashcardClient`):

1) Tạo deck:
   - `POST /course-management/courses/:courseId/flashcard-decks`
   - body: `{ title, description?, status?, sortOrder?, lessonId? }`
2) Tạo card:
   - `POST /flashcard-decks/:deckId/cards`
   - body: `{ front, back, hint?, sortOrder?, status? }`
3) Publish deck:
   - `PATCH /flashcard-decks/:deckId` với `{ status: "published" }`

> Bạn có thể tạo deck/cards ở admin rồi publish, hoặc triển khai một “AI generate flashcards” endpoint mới chạy end-to-end.
> Tài liệu này tập trung vào *mapping logic* và “điểm chạm” DB/contract để mobile dùng được.

---

## 9. Scheduling cho mobile (dueAt) — hiện tại hoạt động theo mặc định

BE due() chỉ cần:
- card deck status published
- card status published
- `flashcard_user_state.dueAt` null/<= now

Hiện tại không có endpoint trong mobile flow để admin set `dueAt` trước khi user ôn.
Do đó:
- Nếu bạn chỉ tạo deck/cards published, user sẽ thấy card theo logic `dueAt is null`.
- Để có lịch ôn chính xác theo ngày, bạn sẽ cần thêm flow backend cho việc “seed dueAt” cho từng card theo user (cái này không có trong scope tài liệu).

---

## 10. Daily task catalog (mock) — không tự ăn theo deck DB

Mobile còn có “daily tasks” đang dùng dữ liệu mock từ:
- `mobile-app/assets/data/daily_tasks.json`
- `mobile-app/assets/data/flashcard_decks.json`

Phần daily task khi cần flashcard mở deck theo `deckId` trong mock.
Vì vậy:
- Để daily task đi đúng deck bạn generate, bạn sẽ cần update catalog/mapping hoặc thay UI daily task sang lấy deck động từ BE.

Trong khi đó, section “Flashcard due hôm nay” đã dùng API BE (`GET /api/flashcards/due`) nên sẽ đúng nếu deck/cards published.

---

## 11. Checklist khi áp dụng viava v2 `flashcard`

1) `domain` có được trước khi gọi `/course/learning-path/generate`
2) Response `exercises[]` của endpoint `flashcard` có đủ field để map:
   - front -> `flashcard.front`
   - back -> `flashcard.back`
   - hint -> `flashcard.hint` (null nếu không có)
3) Tất cả card tạo xong được đưa vào deck với `status=published`
4) Mobile validate:
   - mở trang flashcards section
   - kiểm tra card swipe flip đúng front/back
   - hint chỉ hiển thị ở mặt trước
5) Giới hạn độ dài front/back theo schema (max 4000)

---

## 12. Dẫn chiếu tài liệu/điểm chạm trong code (để dev implement nhanh)

Viava (contract v2.0):
- `POST /course/learning-path/generate`
- `POST /course/exercises/flashcard/generate`
- Swagger docs: `https://judiciarily-ruffled-lenny.ngrok-free.dev/docs`

Flashcard contract mobile:
- `BE/src/services/FlashcardService.ts` (`due`)
- `BE/src/routes/mobile/mobileApi.ts` (`/api/flashcards/due`)
- `mobile-app/lib/data/api/flashcard_api_service.dart` (parse `front/back/hint`)
- `mobile-app/lib/features/flashcard/presentation/widgets/flashcard_deck_section.dart`

Flashcard admin:
- `BE/src/services/FlashcardAdminService.ts` (createDeck/createCard)
- `admin-dashboard/src/services/flashcard.client.ts` (endpoints CRUD)
- `admin-dashboard/src/app/(dashboard)/course/[id]/flashcards/_components/course-flashcard-manager.tsx`

Nếu bạn muốn, mình có thể chỉnh file này theo “đúng trường” của response viava v2 `flashcard` bằng cách bạn gửi 1 sample JSON `exercises[]` từ endpoint `/course/exercises/flashcard/generate` (1 response đủ, mình sẽ map field front/back/hint chính xác hơn).

