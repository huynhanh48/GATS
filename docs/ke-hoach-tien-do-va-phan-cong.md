# Kế hoạch tiến độ và phân công GATS Academy

> Cập nhật: 23/07/2026  
> Phạm vi: Web App (bao gồm Admin Dashboard), Backend, Mobile App và quy trình AI nhập liệu khóa học  
> Trạng thái dùng trong tài liệu: `✅ Hoàn thành` · `🟡 Đang làm/đã có nhưng cần UAT` · `⬜ Chưa làm` · `⏸ Tạm hoãn`

## 1. Mục tiêu chung

Hoàn thiện GATS Academy thành một nền tảng có thể:

1. Bán khóa học và xác nhận thanh toán an toàn.
2. Cho học viên học đồng bộ trên Web và Mobile.
3. Cho giảng viên chỉ quản lý các khóa học do mình tạo hoặc được chỉ định.
4. Cho Admin vận hành người dùng, khóa học, đơn hàng, nội dung và báo cáo.
5. Dùng AI để tiếp nhận tài liệu, phân tích và đề xuất cấu trúc chương/bài.
6. Có quy trình biên soạn, kiểm duyệt và phát hành khóa học rõ ràng.

Refund/refund request hiện **tạm hoãn**, không đưa vào phạm vi hoàn thành của kế hoạch này.

## 2. Ba nhân tố kỹ thuật do Giao phụ trách

| Nhân tố | Phạm vi | Tiến độ ước lượng | Trạng thái |
|---|---|---:|---|
| Web App + Admin | Website bán/học khóa học, workspace giảng viên và hệ thống quản trị | 85% | 🟡 |
| Backend | API, database, phân quyền, thanh toán, học tập, chat và vận hành | 78% | 🟡 |
| Mobile App | Ứng dụng học viên, thanh toán, học tập và nhóm khóa học | 75% | 🟡 |

Các tỷ lệ trên phản ánh mức độ hoàn thiện source hiện tại, chưa đồng nghĩa với production-ready. Điều kiện phát hành vẫn cần staging UAT, migration rehearsal, OAuth trên thiết bị thật, signing và kiểm tra vận hành.

## 3. Phân công nhân sự

| Người phụ trách | Vai trò chính | Đầu ra phải bàn giao |
|---|---|---|
| **Giao** | Technical owner của Web App + Admin, Backend và Mobile | Source ổn định, API đồng bộ, build/release pass, staging hoạt động và tài liệu triển khai |
| **Anh Văn** | Phụ trách AI xử lý nhập liệu và chia chương/bài | Pipeline nhập tài liệu → trích xuất → đề xuất chương/bài → dữ liệu nháp có thể đưa vào Admin |
| **Huỳnh Anh** | Điều phối công việc và soạn khóa học | Backlog, lịch thực hiện, nội dung khóa học hoàn chỉnh, kiểm duyệt và quyết định sẵn sàng xuất bản |

### Nguyên tắc phối hợp

- Giao chịu trách nhiệm **khả năng vận hành kỹ thuật**, không chịu trách nhiệm viết toàn bộ nội dung khóa học.
- Anh Văn tạo **bản nháp có cấu trúc bằng AI**; kết quả AI không được tự động publish.
- Huỳnh Anh là người điều phối và duyệt nội dung cuối trước khi chuyển trạng thái xuất bản.
- Mỗi đầu việc phải có người nhận, ngày dự kiến, tiêu chí nghiệm thu và bằng chứng hoàn thành.

## 4. Tiến độ chi tiết — Giao

### 4.1. Web App và Admin Dashboard

#### Đã hoàn thành hoặc đã nối source

- ✅ Danh mục, chi tiết khóa học, giỏ hàng và checkout chuyển khoản QR/SePay.
- ✅ Lead đăng ký tư vấn, coupon và lịch sử đơn hàng.
- ✅ Khu vực học tập: video, tiến độ, quiz, assignment, bài viết liên quan.
- ✅ Light/dark mode và giao diện học tập responsive.
- ✅ Nhóm chat chung theo từng khóa học trên Web.
- ✅ Admin quản lý khóa học, curriculum, lesson, quiz và bài tập.
- ✅ Admin đăng nhập email/password và Google.
- ✅ Admin phân công instructor theo khóa học.
- ✅ Instructor đăng nhập được chuyển thẳng vào khu vực khóa học.
- ✅ Instructor chỉ thấy khóa học do mình tạo hoặc được Admin chỉ định.
- ✅ Instructor không truy cập Users, Orders, Analytics, Leads và các khu vực quản trị hệ thống.

#### Còn thiếu

| Ưu tiên | Hạng mục | Tiêu chí hoàn thành |
|---|---|---|
| P0 | E2E mua → thanh toán → vào học | Chạy thành công trên staging bằng giao dịch SePay thực tế/test |
| P0 | UAT workspace instructor | Instructor tạo/sửa chương, bài, quiz, assignment và chat đúng khóa được giao |
| P0 | Kiểm tra Google Login production | Hoạt động trên Chrome, Edge, Safari và máy khác, không phụ thuộc localhost |
| P1 | Certificate verify/download/share | Có trang verify public và tải/chia sẻ chứng chỉ |
| P1 | Admin bank account/reconciliation | CRUD tài khoản nhận tiền, đối soát và export giao dịch |
| P1 | Làm sạch Admin production | Ẩn/xóa route và navigation template/demo |
| P1 | Accessibility | Player, modal, form và keyboard/focus đạt kiểm tra cơ bản |
| P2 | Learning analytics | Ghi nhận sự kiện xem bài, hoàn thành, bỏ dở và hiệu quả khóa học |

### 4.2. Backend

#### Đã hoàn thành hoặc đã nối source

- ✅ Auth, Google token, session và role/permission.
- ✅ Course, section, lesson, post, media, quiz và assignment.
- ✅ Cart, order, coupon, bank transfer và SePay.
- ✅ Enrollment và tiến độ học tập.
- ✅ Lead, notification, moderation, analytics và audit log.
- ✅ Nhóm chat chung theo khóa học.
- ✅ Quyền instructor được scope theo `course.instructor_id`.
- ✅ Instructor tạo khóa mới sẽ tự được gắn làm người phụ trách.
- ✅ Instructor không thể truy cập hoặc chuyển ownership khóa học của người khác.
- ✅ Production build Backend hiện pass.

#### Còn thiếu

| Ưu tiên | Hạng mục | Tiêu chí hoàn thành |
|---|---|---|
| P0 | Migration rehearsal | Dựng được DB rỗng, upgrade staging và có phương án forward-fix |
| P0 | Security production | CORS allowlist, kiểm tra proxy/cookie, rotate secrets và chống replay webhook |
| P0 | Sửa full type-check/test debt | Seed, mock, fixture và Vitest đồng bộ; CI xanh toàn bộ |
| P0 | Test ownership instructor | Có test tự động cho list/get/update/create khóa thuộc và không thuộc instructor |
| P1 | Health/readiness | Kiểm tra DB, Redis, storage, queue và worker |
| P1 | Observability | Request ID, structured log, metrics và cảnh báo lỗi thanh toán/video/email |
| P1 | Reconciliation job | Đối soát giao dịch ngân hàng với order theo lịch |
| P1 | Queue reliability | Retry, dead-letter và theo dõi trạng thái video/email |
| P2 | Data privacy | Export/xóa dữ liệu cá nhân và retention policy |

### 4.3. Mobile App

> Lộ trình phát hành Google Play / App Store (6 tháng, effort theo phiên AI): [`roadmap-mobile-store-release.docx`](./roadmap-mobile-store-release.docx).

#### Đã hoàn thành hoặc đã nối source

- ✅ Đăng nhập email/password và khôi phục session.
- ✅ Google Sign-In đã nối contract Backend.
- ✅ Catalog, curriculum, enrollment và tiến độ từ Backend.
- ✅ Video, quiz, assignment, Q&A, note và bookmark.
- ✅ Cart, coupon, QR/SePay, polling và lịch sử đơn hàng.
- ✅ Nhóm chat theo khóa học.
- ✅ Logo GATS đồng bộ với Web.
- ✅ Package ID release và tắt cleartext trong release.

#### Còn thiếu

| Ưu tiên | Hạng mục | Tiêu chí hoàn thành |
|---|---|---|
| P0 | OAuth trên thiết bị thật | Android debug/release SHA và iOS scheme hoạt động |
| P0 | Release signing | Có keystore thật, backup an toàn và build AAB release |
| P0 | UAT mua và học | Checkout, coupon, progress và chat chạy trên máy thật |
| P1 | Đồng bộ Web ↔ Mobile | Hoàn thành bài trên một nền tảng hiển thị đúng ở nền tảng còn lại |
| P1 | Gamification dùng dữ liệu thật | Giữ XP, streak, badge, nhiệm vụ và leaderboard nhưng đồng bộ từ Backend, không dùng số liệu mock |
| P1 | Notification | Push notification và deep link vào đúng khóa/bài/chat |
| P1 | Offline/error UX | Mạng yếu, mất mạng, retry và cache không làm ứng dụng crash |
| P2 | Store readiness | Privacy, Data Safety, screenshot, listing và internal testing |

### 4.4. Kế hoạch giữ Gamification trên Mobile

#### Định hướng

Mobile tiếp tục là trải nghiệm học tập có tính gamification mạnh hơn Web. Tuy nhiên, gamification phải khuyến khích **học thật và hoàn thành mục tiêu**, không thưởng cho việc mở ứng dụng hoặc bấm lặp để lấy điểm.

Những thành phần hiện có như XP, streak, daily task, badge và leaderboard được giữ lại về mặt trải nghiệm. Dữ liệu mock/local sẽ được thay bằng dữ liệu do Backend xác nhận; local storage chỉ dùng để cache và hiển thị khi offline.

#### Vòng lặp trải nghiệm

```text
Chọn mục tiêu hôm nay
    ↓
Học một bài / làm quiz / nộp assignment
    ↓
Backend xác nhận sự kiện hợp lệ
    ↓
Nhận XP + cập nhật streak/nhiệm vụ
    ↓
Mở khóa badge hoặc mốc cá nhân
    ↓
Gợi ý bài học tiếp theo
```

#### Các lớp Gamification

| Lớp | Mục đích | Quy tắc đề xuất |
|---|---|---|
| XP | Phản ánh hoạt động học có giá trị | Chỉ Backend cấp điểm; mỗi sự kiện có giới hạn và idempotency |
| Streak | Tạo thói quen học đều | Tính khi hoàn thành ít nhất một hoạt động học hợp lệ trong ngày |
| Daily/Weekly Quest | Chia mục tiêu lớn thành việc nhỏ | Nhiệm vụ dựa trên khóa đang học, không sinh nhiệm vụ giả |
| Badge | Ghi nhận cột mốc | Dùng tiêu chí rõ ràng: hoàn thành khóa, quiz tốt, chuỗi học |
| Level | Thể hiện hành trình cá nhân | Level tăng theo tổng XP; không dùng để chặn nội dung đã mua |
| Leaderboard | Tạo động lực xã hội | Ưu tiên bảng theo khóa/tuần; cho phép ẩn danh hoặc opt-out |
| Celebration | Phản hồi tích cực | Animation ngắn 150–300ms, tôn trọng reduced motion |

#### Bảng XP khởi điểm

| Hoạt động | XP đề xuất | Giới hạn/chống lạm dụng |
|---|---:|---|
| Hoàn thành bài video/text | +10 | Một lần cho mỗi lesson |
| Hoàn thành quiz đạt yêu cầu | +20 | Một lần cho lần đạt đầu tiên |
| Quiz đạt từ 90% | +5 bonus | Một lần cho mỗi quiz |
| Nộp assignment hợp lệ | +25 | Một lần; không thưởng khi spam cập nhật |
| Hoàn thành một chương | +30 | Một lần cho mỗi section |
| Hoàn thành khóa học | +100 | Một lần cho mỗi enrollment |
| Trả lời được mentor đánh dấu hữu ích | +10 | Có giới hạn theo ngày |
| Check-in/mở ứng dụng | 0 | Không thưởng nếu chưa có hoạt động học thật |

Giá trị XP là cấu hình ban đầu để pilot; Huỳnh Anh theo dõi hành vi học và đề xuất điều chỉnh, Giao triển khai cấu hình thay vì hard-code rải rác trong Mobile.

#### Quy tắc Streak hợp lý

- Một ngày được tính streak khi học viên hoàn thành lesson, quiz hoặc assignment hợp lệ.
- Dùng timezone của tài khoản nhưng Backend lưu mốc thời gian chuẩn UTC.
- Không cộng streak chỉ vì mở ứng dụng.
- Có thể cấp tối đa một `streak freeze` mỗi tháng từ thành tích học, không bán để tạo áp lực.
- Khi mất streak, thông báo trung tính và cho bắt đầu lại; không dùng ngôn ngữ gây tội lỗi.
- Hiển thị kỷ lục streak tốt nhất để người học vẫn thấy thành quả cũ.

#### Daily và Weekly Quest

Mỗi ngày chỉ nên có tối đa ba nhiệm vụ:

1. Một nhiệm vụ chính: tiếp tục bài đang học.
2. Một nhiệm vụ củng cố: quiz/flashcard/note.
3. Một nhiệm vụ cộng đồng tùy chọn: đặt câu hỏi hoặc tham gia nhóm khóa học.

Nhiệm vụ tuần tập trung vào kết quả lớn hơn như hoàn thành một chương hoặc duy trì ba ngày học. Nhiệm vụ không được yêu cầu mua khóa học mới, spam chat hay cạnh tranh bắt buộc.

#### Leaderboard

- Mặc định ưu tiên `Khóa học này · Tuần này`, không dùng bảng toàn hệ thống vô thời hạn.
- Xếp hạng theo XP hợp lệ trong kỳ, reset theo tuần nhưng vẫn lưu thành tích cá nhân.
- Cho phép hiển thị nickname và avatar thay cho danh tính đầy đủ.
- Có lựa chọn ẩn khỏi leaderboard.
- Không dùng leaderboard làm điều kiện cấp chứng chỉ.
- Có kiểm tra sự kiện bất thường trước khi chốt bảng xếp hạng.

#### Backend là nguồn dữ liệu chuẩn

Backend cần bổ sung các nhóm dữ liệu:

| Nhóm | Nội dung |
|---|---|
| `gamification_events` | Sự kiện nhận XP, nguồn, khóa/bài liên quan và idempotency key |
| `user_gamification_profiles` | Tổng XP, level, streak hiện tại, streak tốt nhất và ngày hoạt động cuối |
| `achievements` | Danh mục badge, điều kiện, icon và trạng thái phát hành |
| `user_achievements` | Badge người dùng đã nhận và thời điểm nhận |
| `quests` | Nhiệm vụ ngày/tuần và điều kiện |
| `user_quest_progress` | Tiến độ và trạng thái claim |
| Leaderboard API | Bảng theo course/week, phân trang và quyền riêng tư |

XP phải được phát sinh từ những service đã xác nhận hoàn thành lesson, quiz, assignment hoặc course. Mobile không được gửi trực tiếp số XP muốn cộng.

#### API tối thiểu

```text
GET  /api/gamification/me
GET  /api/gamification/quests
POST /api/gamification/quests/:id/claim
GET  /api/gamification/achievements
GET  /api/gamification/leaderboards?scope=course&courseId=...&period=week
PATCH /api/gamification/privacy
```

#### Phân chia triển khai

| Mã | Công việc | Owner | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| GAME-01 | Chốt hành vi được thưởng và bảng XP | Huỳnh Anh + Giao | P0 | ⬜ |
| GAME-02 | Schema, migration và XP event service | Giao | P0 | ⬜ |
| GAME-03 | Tích hợp lesson/quiz/assignment/course completion | Giao | P0 | ⬜ |
| GAME-04 | API profile, streak, quest và badge | Giao | P0 | ⬜ |
| GAME-05 | Thay dữ liệu mock/local bằng repository API trên Mobile | Giao | P0 | ⬜ |
| GAME-06 | UI Home/Hub: XP, level, streak và nhiệm vụ | Giao | P1 | ⬜ |
| GAME-07 | Leaderboard theo khóa học và quyền riêng tư | Giao | P1 | ⬜ |
| GAME-08 | Admin cấu hình XP/badge/quest | Giao | P1 | ⬜ |
| GAME-09 | Theo dõi tác động đến tỷ lệ hoàn thành | Huỳnh Anh | P1 | ⬜ |
| GAME-10 | Anti-abuse, rate limit và audit | Giao | P1 | ⬜ |

#### Lộ trình triển khai Gamification

| Giai đoạn | Thời lượng | Phạm vi | Điều kiện nghiệm thu |
|---|---:|---|---|
| Giai đoạn 1 — Core | 3–4 ngày | XP event, profile, level, streak | Đổi máy vẫn giữ đúng XP/streak; không cộng trùng |
| Giai đoạn 2 — Habit | 3–4 ngày | Daily/weekly quest, claim reward | Quest lấy từ Backend và bám khóa đang học |
| Giai đoạn 3 — Achievement | 2–3 ngày | Badge và celebration | Badge có tiêu chí rõ, nhận đúng một lần |
| Giai đoạn 4 — Social | 3–4 ngày | Leaderboard theo course/week | Có opt-out, phân trang và kiểm tra bất thường |
| Giai đoạn 5 — Admin/Analytics | 3–4 ngày | Cấu hình, audit, funnel | Theo dõi được gamification có cải thiện việc học hay không |

#### Tiêu chí nghiệm thu Gamification

- [ ] XP và streak không mất khi đăng nhập trên thiết bị khác.
- [ ] Một sự kiện không thể được cộng XP hai lần.
- [ ] Không thể sửa XP bằng cách thay local storage hoặc gọi API tùy ý.
- [ ] XP không phải điều kiện để truy cập khóa học đã mua.
- [ ] Chứng chỉ vẫn dựa trên hoàn thành khóa học, không dựa vào leaderboard.
- [ ] Daily quest sử dụng dữ liệu khóa học và tiến độ thật.
- [ ] Leaderboard có opt-out và không công khai email/họ tên đầy đủ.
- [ ] UI dùng icon vector nhất quán, touch target tối thiểu 44–48 px.
- [ ] Light/dark mode đủ tương phản; animation hỗ trợ reduced motion.
- [ ] Có analytics để so sánh completion/retention trước và sau khi bật gamification.

### 4.5. Khôi phục Daily, AI Coach và Flashcard trên Mobile theo API-first

#### Kết quả kiểm tra source ngày 23/07/2026

| Hạng mục | Source hiện có | Vấn đề hiện tại | Đánh giá |
|---|---|---|---|
| Daily | `features/daily/presentation/daily_screen.dart` | Màn hình còn nguyên nhưng đã bị tháo khỏi `MainShell`; task hoàn thành lưu bằng `SharedPreferences` | Có thể tái sử dụng UI, phải thay data layer |
| AI Coach | `features/ai_coach/presentation/ai_coach_screen.dart` | Màn hình còn nguyên nhưng không có entry point; câu trả lời lấy từ `MockData` sau delay 800 ms | Chỉ giữ UI, phải thay service |
| Flashcard | `features/flashcard/*` | Có swipe/flip/session UI nhưng deck lấy từ JSON và `MockData` | Có thể tái sử dụng phần lớn UI |
| Streak | `StreakController` và `DailyCheckInStore` | Mobile đang giữ trạng thái cục bộ; đổi máy có thể mất hoặc sai streak | Backend phải là source of truth |
| Daily check-in API | Mobile đã khai báo `/api/user/daily-checkin` | Backend chưa có route/service tương ứng | Contract đang treo, chưa được gọi production |
| Progress | Mobile đã gọi API tiến độ khóa học/bài học | Đây là dữ liệu thật có thể dùng để sinh Daily task | Tái sử dụng |
| Quiz/assignment | Backend đã có API làm quiz và nộp bài | Có thể dùng kết quả thật để hoàn thành task | Tái sử dụng |
| XP/quest/badge | UI và local state đã có một phần | Chưa có ledger/idempotency phía Backend | Không cho Mobile tự cộng XP |

#### Luồng điều hướng đề xuất

Giữ thanh điều hướng tối đa 5 điểm đến, không nhồi Daily và Coach vào menu phụ:

```text
Trang chủ     Daily     [AI Coach]     Khóa học     Bài viết
```

- `AI Coach` là nút trung tâm nổi bật, mở workspace riêng và giữ lịch sử hội thoại.
- `Daily` là tab chính, có badge số nhiệm vụ chưa hoàn thành.
- `Khóa học` tiếp tục dùng catalog/enrollment/progress thật.
- Quick action cũ chuyển vào Trang chủ hoặc menu dấu cộng trong từng màn, tránh có hai nút trung tâm cạnh tranh nhau.
- Dùng lại `LazyIndexedStack` cho các tab chính để giữ scroll/state; AI Coach có thể mở route riêng nếu cần giải phóng bộ nhớ chat.
- Touch target tối thiểu 44–48 px, nhãn luôn hiển thị hoặc có semantic label; light/dark mode dùng token hiện có.

#### Nguyên tắc dữ liệu

1. Backend là nguồn sự thật cho XP, streak, task, lịch ôn và lịch sử AI Coach.
2. Mobile cache dữ liệu gần nhất để đọc offline, nhưng không tự xác nhận phần thưởng.
3. Mọi thao tác hoàn thành phải có `idempotencyKey`; bấm lại hoặc retry mạng không được cộng XP hai lần.
4. Daily task được sinh từ khóa đã đăng ký, tiến độ bài học, flashcard đến hạn, quiz chưa làm và lịch học; không dùng task giả cố định.
5. AI Coach chỉ được truy cập nội dung khóa học mà người dùng có quyền học.
6. Câu trả lời liên quan nội dung khóa phải trả citation đến course/section/lesson/post; không có nguồn thì ghi rõ là gợi ý chung.
7. Nội dung flashcard do AI sinh phải ở trạng thái draft và được instructor/admin duyệt trước khi phát hành.

#### Mô hình Backend cần bổ sung

| Bảng/miền dữ liệu | Trường chính | Mục đích |
|---|---|---|
| `flashcard_decks` | `id`, `course_id`, `lesson_id?`, `title`, `status`, `created_by` | Bộ thẻ theo khóa/bài |
| `flashcards` | `id`, `deck_id`, `front`, `back`, `hint?`, `source_type`, `source_id`, `order` | Nội dung thẻ và nguồn |
| `flashcard_reviews` | `user_id`, `flashcard_id`, `rating`, `due_at`, `interval_days`, `repetitions` | Spaced repetition theo từng học viên |
| `daily_plans` | `id`, `user_id`, `plan_date`, `timezone`, `status` | Kế hoạch trong ngày |
| `daily_tasks` | `plan_id`, `type`, `entity_id`, `target`, `progress`, `status`, `xp_reward` | Lesson/quiz/flashcard/coach task |
| `gamification_events` | `user_id`, `event_type`, `entity_id`, `xp`, `idempotency_key` | Ledger chống cộng XP trùng |
| `user_gamification_profiles` | `user_id`, `total_xp`, `level`, `current_streak`, `best_streak` | Tổng hợp nhanh cho UI |
| `coach_conversations` | `id`, `user_id`, `course_id?`, `title`, `last_message_at` | Lịch sử hội thoại |
| `coach_messages` | `conversation_id`, `role`, `content`, `citations`, `token_usage` | Tin nhắn, nguồn và kiểm soát chi phí |

Không tạo bảng check-in độc lập nếu streak đã được suy ra chắc chắn từ `gamification_events`. Nếu vẫn cần “điểm danh” như một hành vi riêng, endpoint claim phải ghi event duy nhất theo `user + local_date`.

#### API contract đề xuất

```text
# Daily + gamification
GET  /api/mobile/daily?date=YYYY-MM-DD&timezone=Asia/Ho_Chi_Minh
POST /api/mobile/daily/tasks/:taskId/complete
GET  /api/gamification/me
GET  /api/gamification/events?cursor=...

# Flashcard
GET  /api/flashcards/decks?courseId=...&dueOnly=true
GET  /api/flashcards/decks/:deckId/session
POST /api/flashcards/reviews
GET  /api/flashcards/stats?courseId=...

# AI Coach
GET  /api/ai-coach/conversations
POST /api/ai-coach/conversations
GET  /api/ai-coach/conversations/:id/messages?cursor=...
POST /api/ai-coach/conversations/:id/messages
DELETE /api/ai-coach/conversations/:id

# Admin/Instructor authoring
POST  /api/course-management/courses/:courseId/flashcards/generate
GET   /api/course-management/courses/:courseId/flashcard-decks
PATCH /api/course-management/flashcards/:cardId
POST  /api/course-management/flashcard-decks/:deckId/publish
```

Payload review flashcard:

```json
{
  "flashcardId": "uuid",
  "rating": "again | hard | good | easy",
  "reviewedAt": "2026-07-23T10:30:00.000Z",
  "idempotencyKey": "uuid-generated-by-mobile"
}
```

Backend tự tính `dueAt`, interval và XP. Mobile không gửi `xp`, `streak` hoặc ngày ôn tiếp theo.

Payload AI Coach nên nhận context có kiểm soát:

```json
{
  "message": "Giải thích lại phần YOLO segmentation",
  "context": {
    "courseId": "uuid",
    "lessonId": "uuid"
  },
  "clientMessageId": "uuid"
}
```

Backend xác minh enrollment trước khi lấy nội dung, lọc context theo quyền và trả `answer`, `citations`, `conversationId`. Cần rate limit, timeout, moderation, giới hạn lịch sử và theo dõi chi phí.

#### Cách vận dụng API vào từng tính năng

##### Daily

`GET /api/mobile/daily` trả một view model duy nhất để Mobile không phải ghép 6 API:

- Streak, XP hôm nay và cấp độ.
- Danh sách task đã cá nhân hóa.
- Flashcard đến hạn.
- Bài học nên tiếp tục.
- Quiz/assignment cần hoàn thành.
- Trạng thái claim/complete từ server.

Ví dụ sinh task:

- Có bài đang học dở → “Hoàn thành bài X”.
- Có từ 5 thẻ đến hạn → “Ôn 5 flashcard”.
- Vừa xong chương → “Làm quiz chương”.
- Không có enrollment → task onboarding hoặc xem khóa học phù hợp, không tạo task học giả.

##### Flashcard

- Admin/instructor tạo thủ công hoặc yêu cầu AI sinh từ lesson/post.
- AI phải lưu `sourceId` và đoạn nguồn; instructor duyệt rồi mới publish.
- Mobile gọi session API lấy tối đa 10–20 thẻ đến hạn.
- Khi vuốt/chọn `Chưa thuộc/Khó/Đã thuộc/Dễ`, Mobile gửi từng review có idempotency key.
- Backend áp dụng spaced repetition và trả `nextDueAt`, `remainingDue`, `xpAwarded`.
- Offline: queue review cục bộ; khi online gửi lại cùng key để không nhân đôi.
- Daily task flashcard chỉ hoàn tất khi Backend xác nhận đủ target, không dựa vào việc mở màn hình.

##### AI Coach

- Giai đoạn đầu chỉ hỗ trợ hỏi đáp dựa trên khóa học và đề xuất “học tiếp gì”.
- Coach lấy progress thật để gợi ý bài tiếp theo, lấy flashcard stats để đề xuất ôn và lấy quiz result để giải thích điểm yếu.
- Không cho Coach tự đánh dấu lesson/quiz hoàn thành.
- Các action như “Mở bài tiếp theo”, “Ôn 5 thẻ” là deep link có xác nhận của người dùng.
- Phản hồi lỗi phải phân biệt: mất mạng, quá giới hạn, không có quyền khóa học và AI chưa tìm thấy nguồn.
- Streaming có thể làm sau; Phase 1 dùng request/response ổn định để giảm độ phức tạp.

#### Kế hoạch triển khai

| Mã | Phase | Công việc | Phụ trách | Ưu tiên | Trạng thái |
|---|---|---|---|---|---|
| MOB-HABIT-01 | 0 — Restore shell | Đưa Daily trở lại tab, AI Coach trở lại nút trung tâm; giữ UI cũ và gắn feature flag | Giao | P0 | ⬜ |
| MOB-HABIT-02 | 0 — Audit mock | Đánh dấu toàn bộ `MockData`, JSON catalog và SharedPreferences trong Daily/Coach/Flashcard | Giao | P0 | ✅ Đã xác định điểm chính |
| MOB-HABIT-03 | 1 — Contract | Chốt schema Daily, flashcard review, gamification event và Coach citation | Giao + Anh Văn | P0 | ⬜ |
| MOB-HABIT-04 | 1 — Core BE | Migration, repo/service/API cho gamification profile, event và daily plan | Giao | P0 | ⬜ |
| MOB-HABIT-05 | 1 — Mobile repo | Tạo repository API/cache; bỏ việc UI gọi trực tiếp MockData | Giao | P0 | ⬜ |
| MOB-HABIT-06 | 2 — Flashcard BE | Deck/card/review/due session và idempotency | Giao | P0 | ⬜ |
| MOB-HABIT-07 | 2 — Flashcard Admin | CRUD, AI generate draft, review/publish và source preview | Giao + Anh Văn + Huỳnh Anh | P1 | ⬜ |
| MOB-HABIT-08 | 2 — Flashcard Mobile | Nối swipe UI với session/review API, cache offline và retry | Giao | P0 | ⬜ |
| MOB-HABIT-09 | 3 — Daily engine | Sinh task từ progress, flashcard due, quiz/assignment và trả aggregate endpoint | Giao | P0 | ⬜ |
| MOB-HABIT-10 | 3 — Daily Mobile | Badge, refresh, empty/error/offline state; bỏ checkbox tự cộng XP | Giao | P0 | ⬜ |
| MOB-HABIT-11 | 4 — Coach BE | Conversation/message API, enrollment guard, RAG context, citations, rate limit | Giao + Anh Văn | P1 | ⬜ |
| MOB-HABIT-12 | 4 — Coach Mobile | Thay mock reply bằng API, history, retry, citation và deep link | Giao | P1 | ⬜ |
| MOB-HABIT-13 | 5 — Hardening | Analytics, anti-abuse, observability, device/offline test và rollout | Giao + Huỳnh Anh | P1 | ⬜ |

#### Thứ tự phát hành an toàn

1. Khôi phục navigation nhưng để Daily/Coach sau feature flag trên production.
2. Làm gamification ledger và profile trước; không nối UI cộng XP khi chưa có idempotency.
3. Làm flashcard end-to-end trước Daily engine vì Daily cần số thẻ đến hạn thật.
4. Nối Daily với progress/quiz/flashcard API thật và xóa checkbox hoàn thành tùy ý.
5. Làm AI Coach sau cùng vì cần course context, progress và flashcard stats đã ổn định.
6. Pilot với một khóa học, một nhóm học viên và giới hạn Coach.
7. Đo retention/completion 2 tuần rồi mới bật rộng.

#### Tiêu chí nghiệm thu

- [ ] Daily và AI Coach xuất hiện lại trong navigation, không vượt quá 5 điểm đến.
- [ ] Đổi thiết bị vẫn giữ đúng XP, streak, task và lịch ôn.
- [ ] Không thể cộng XP bằng cách sửa SharedPreferences hoặc gọi API lặp.
- [ ] Flashcard chỉ lấy từ khóa đã đăng ký hoặc nội dung public được cho phép.
- [ ] Một review retry nhiều lần chỉ được ghi nhận một lần.
- [ ] Task flashcard chỉ hoàn thành khi đủ số review được Backend xác nhận.
- [ ] AI Coach không đọc được khóa chưa mua/đăng ký.
- [ ] Câu trả lời theo khóa học có citation mở đúng bài/nguồn.
- [ ] Mất mạng vẫn xem được cache gần nhất và review được đồng bộ lại an toàn.
- [ ] Light/dark mode, loading, empty, error và reduced motion đều được kiểm tra.
- [ ] Có analytics cho Daily open, task complete, flashcard retention và Coach helpfulness.

### 4.6. Kế hoạch tách Catalog Web và quyền quản lý Instructor

#### Vấn đề hiện tại

Web App và Admin Dashboard đang cùng gọi `GET /api/courses`. Backend thấy tài khoản có role `instructor` thì tự thêm điều kiện `instructor_id = user hiện tại`. Vì vậy instructor vào trang khóa học công khai cũng chỉ thấy khóa được phân công, trong khi quy tắc này chỉ được phép áp dụng tại khu vực Admin/Giảng dạy.

#### Luồng đúng cần đạt

| Ngữ cảnh | Instructor được xem | Instructor được can thiệp |
|---|---|---|
| Web `/courses` | Tất cả khóa `published`, giống học viên thông thường | Không có quyền quản trị từ Web catalog |
| Web chi tiết khóa học | Mọi khóa `published` | Chỉ mua, đăng ký hoặc học theo enrollment |
| Admin `/course` | Chỉ khóa do mình tạo hoặc được chỉ định | Được sửa nội dung trong phạm vi quyền |
| Admin truy cập khóa người khác bằng URL | Không hiển thị dữ liệu quản trị | Trả `403` hoặc `404` |
| Admin hệ thống | Tất cả khóa và mọi trạng thái | Toàn quyền theo permission |

#### Contract API đề xuất

Tách API đọc catalog và API quản trị, không dùng query parameter do client tự khai báo để quyết định quyền.

```text
# Public catalog — Web/Mobile
GET /api/courses
GET /api/courses/slug/:slug

# Management workspace — Admin/Instructor
GET /api/course-management/courses
GET /api/course-management/courses/:id
```

Quy tắc:

- `GET /api/courses` luôn chỉ trả khóa `published`, bất kể người gọi là learner, instructor hay admin.
- `GET /api/course-management/courses` yêu cầu đăng nhập staff:
  - Admin: thấy tất cả khóa và mọi trạng thái.
  - Instructor: thêm điều kiện `courses.instructor_id = authUser.id`.
- `GET /api/course-management/courses/:id`:
  - Admin: được đọc.
  - Instructor: chỉ được đọc khi là instructor của khóa.
- Các API create/update/publish/curriculum/lesson/quiz tiếp tục kiểm tra permission và ownership phía Backend.
- Không tin `instructorId`, `role`, `scope=admin` hoặc `showAll=true` do frontend gửi lên.

#### Kế hoạch triển khai

| Mã | Bước | Thay đổi | Tiêu chí hoàn thành |
|---|---|---|---|
| COURSE-SCOPE-01 | Chốt contract | Thêm nhóm path `course-management` và response schema dùng chung | ✅ Hoàn thành |
| COURSE-SCOPE-02 | Sửa public list | `CourseService.listPublic()` luôn ép `status=published`, không lọc theo role instructor | ✅ Hoàn thành |
| COURSE-SCOPE-03 | Tạo management list | `CourseService.listManaged(actor, query)` áp dụng Admin/all và Instructor/owned | ✅ Hoàn thành |
| COURSE-SCOPE-04 | Tạo management detail | Kiểm tra ownership trước khi trả draft/detail quản trị | ✅ Hoàn thành |
| COURSE-SCOPE-05 | Chuyển Admin client | `fetchCourses`, quiz manager, video/course selector dùng API management | ✅ Hoàn thành |
| COURSE-SCOPE-06 | Giữ Web/Mobile public | Web và Mobile tiếp tục dùng `/courses`, không gọi API management | ✅ Hoàn thành |
| COURSE-SCOPE-07 | Siết mutation | Rà update/publish/section/lesson/quiz/assignment/media theo course ID | ✅ Đã có permission theo course; test ownership pass |
| COURSE-SCOPE-08 | Test tự động | Thêm ma trận public/instructor/admin cho public và management | ✅ 13/13 test scope/role/access pass |
| COURSE-SCOPE-09 | UAT hai tài khoản | Một instructor được giao khóa A, không được giao khóa B | 🟡 Chờ UAT staging: Web thấy A+B; Admin chỉ thấy và sửa A |

#### Ma trận test bắt buộc

Giả sử có:

- Khóa A: `published`, gắn Instructor 1.
- Khóa B: `published`, gắn Instructor 2.
- Khóa C: `draft`, gắn Instructor 2.

| Tài khoản và thao tác | Kết quả mong đợi |
|---|---|
| Guest gọi public list | Thấy A và B; không thấy C |
| Learner gọi public list | Thấy A và B; không thấy C |
| Instructor 1 gọi public list | Thấy A và B; không thấy C |
| Instructor 1 gọi management list | Chỉ thấy A |
| Instructor 1 mở management detail B/C | `403` hoặc `404` |
| Instructor 1 update/publish B/C | `403` |
| Admin gọi public list | Thấy A và B; không thấy C |
| Admin gọi management list | Thấy A, B và C |

#### Thứ tự triển khai an toàn

1. Viết test tái hiện lỗi instructor chỉ thấy khóa của mình trên Web.
2. Thêm API management mới mà chưa xóa API cũ.
3. Chuyển toàn bộ Admin sang API management.
4. Sửa `/api/courses` thành public-only.
5. Chạy build và test Web, Admin, Backend.
6. UAT bằng guest, learner, instructor và admin trên staging.
7. Sau khi ổn định mới dọn logic ownership cũ trong public list.

#### Definition of Done

- [ ] Instructor đăng nhập Web vẫn thấy toàn bộ khóa đã publish.
- [ ] Instructor có thể mua/đăng ký/học khóa không do mình phụ trách như learner bình thường.
- [ ] Nút `Giảng dạy` vẫn dẫn instructor vào Admin `/course`.
- [ ] Admin instructor chỉ liệt kê khóa do mình tạo hoặc được phân công.
- [ ] Instructor không đọc được draft hoặc dữ liệu quản trị của khóa khác.
- [ ] Instructor không thể sửa, publish, xóa hoặc thay curriculum khóa khác bằng API trực tiếp.
- [ ] Admin hệ thống không bị giới hạn ownership.
- [ ] Web/Mobile public catalog và Admin management có test contract riêng.

## 5. Kế hoạch AI nhập liệu — Anh Văn

### Mục tiêu

Tạo một pipeline giúp người biên soạn tải tài liệu đầu vào và nhận cấu trúc khóa học nháp, gồm chương, bài, mục tiêu học tập và nội dung gợi ý.

### Luồng đề xuất

```text
Tải tài liệu
    ↓
Trích xuất văn bản và metadata
    ↓
Làm sạch, loại trùng, chia đoạn
    ↓
AI phân tích chủ đề và độ khó
    ↓
Đề xuất cấu trúc khóa học
    ↓
Chương → bài → mục tiêu → tóm tắt → câu hỏi gợi ý
    ↓
Huỳnh Anh/giảng viên kiểm duyệt
    ↓
Đẩy bản nháp vào Admin
```

### Backlog của Anh Văn

| Giai đoạn | Công việc | Trạng thái | Đầu ra |
|---|---|---|---|
| AI-01 | Chốt định dạng đầu vào: PDF, DOCX, PPTX, URL, text | ⬜ | Danh sách format và giới hạn dung lượng |
| AI-02 | Trích xuất và chuẩn hóa văn bản | ⬜ | JSON văn bản sạch kèm nguồn/trang |
| AI-03 | Chia đoạn và phát hiện chủ đề | ⬜ | Danh sách topic có thứ tự |
| AI-04 | Sinh outline chương/bài | ⬜ | JSON theo schema course/section/lesson |
| AI-05 | Sinh mục tiêu và tóm tắt bài | ⬜ | Learning outcomes và lesson summary |
| AI-06 | Gợi ý quiz/assignment | ⬜ | Câu hỏi nháp, đáp án và giải thích |
| AI-07 | Chấm confidence và cảnh báo thiếu nguồn | ⬜ | Điểm tin cậy, citation và cảnh báo |
| AI-08 | API/worker tích hợp Backend | ⬜ | Job bất đồng bộ có progress/retry |
| AI-09 | Màn hình review trong Admin | ⬜ | Duyệt/sửa/từ chối trước khi import |
| AI-10 | Pilot với một khóa học thật | ⬜ | Báo cáo chất lượng và thời gian tiết kiệm |

### Tiêu chí nghiệm thu AI

- Không tự động publish nội dung do AI tạo.
- Mỗi chương/bài phải truy ngược được về nguồn đầu vào.
- JSON đầu ra phải khớp schema Backend đã thống nhất với Giao.
- Cho phép sửa tên chương, thứ tự, nội dung và loại bỏ phần AI đề xuất.
- File lỗi hoặc nội dung thiếu phải báo rõ, không tạo khóa học rỗng.
- Có log trạng thái job và cơ chế retry.

## 6. Điều phối và soạn khóa học — Huỳnh Anh

### Trách nhiệm điều phối

- Tạo backlog tuần và xác định P0/P1/P2.
- Giao việc, theo dõi blocker và cập nhật tiến độ.
- Tổ chức buổi review cố định giữa Giao, Anh Văn và người biên soạn.
- Chốt schema đầu ra AI cùng Giao và Anh Văn.
- Quản lý danh sách khóa học dự kiến phát hành.
- Quyết định khóa học đủ điều kiện publish sau kiểm duyệt.

### Quy trình soạn một khóa học

| Bước | Người thực hiện | Đầu ra |
|---|---|---|
| 1. Chốt chủ đề và học viên mục tiêu | Huỳnh Anh | Course brief |
| 2. Thu thập tài liệu nguồn | Huỳnh Anh | Bộ tài liệu có quyền sử dụng |
| 3. AI phân tích và chia chương | Anh Văn | Outline nháp |
| 4. Kiểm duyệt outline | Huỳnh Anh + giảng viên | Outline đã duyệt |
| 5. Import vào Admin | Giao + Anh Văn | Course draft trong hệ thống |
| 6. Viết/quay nội dung | Huỳnh Anh + giảng viên | Lesson content/video |
| 7. Tạo quiz/assignment | Huỳnh Anh + giảng viên | Bộ đánh giá |
| 8. QA kỹ thuật | Giao | Player, progress, quyền truy cập hoạt động |
| 9. QA nội dung | Huỳnh Anh | Chính tả, logic, nguồn và bản quyền đạt |
| 10. Publish và theo dõi | Huỳnh Anh + Giao | Khóa published và có analytics |

### Definition of Done cho một khóa học

- [ ] Có mô tả, thumbnail, giảng viên và đối tượng học viên.
- [ ] Có mục tiêu học tập đo lường được.
- [ ] Chương/bài có thứ tự hợp lý và không trùng lặp.
- [ ] Video/tài liệu mở được trên Web và Mobile.
- [ ] Có quiz hoặc assignment tại các mốc cần thiết.
- [ ] Tiến độ, hoàn thành và chứng chỉ hoạt động.
- [ ] Nhóm chat khóa học hoạt động với học viên và mentor.
- [ ] Nội dung AI đã được con người kiểm duyệt.
- [ ] Nguồn và quyền sử dụng nội dung được xác nhận.
- [ ] Admin preview và UAT bằng tài khoản học viên đạt.

## 7. Kế hoạch triển khai đề xuất trong 4 tuần

| Tuần | Giao | Anh Văn | Huỳnh Anh | Mốc bàn giao |
|---|---|---|---|---|
| Tuần 1 | Ổn định phân quyền instructor, migration staging, Google production | Chốt format, schema AI và prototype extraction | Chốt course brief, tài liệu nguồn, backlog | Schema và staging sẵn sàng |
| Tuần 2 | E2E Web/Admin/BE và bổ sung API job AI | Topic segmentation và outline chương/bài | Duyệt outline, bắt đầu soạn nội dung | Course draft đầu tiên |
| Tuần 3 | Mobile device UAT, signing, đồng bộ progress/chat; Gamification Core: XP + streak từ Backend | Sinh mục tiêu, quiz và citation/confidence | Hoàn thiện video/bài/quiz, chốt bảng XP và QA nội dung | Pilot đủ nội dung + XP/streak thật |
| Tuần 4 | Quest/badge Mobile, hardening, observability, CI và release candidate | Tích hợp review/retry, đánh giá pilot | UAT cuối, đánh giá gamification, duyệt publish và kế hoạch vận hành | Release candidate |

## 8. Bảng theo dõi tiến độ hằng tuần

| Mã | Hạng mục | Owner | Ưu tiên | Trạng thái | Hạn dự kiến | Bằng chứng/Link | Blocker |
|---|---|---|---|---|---|---|---|
| TECH-WEB-01 | E2E mua → học trên Web | Giao | P0 | ⬜ | Chưa chốt |  |  |
| TECH-BE-01 | Migration rehearsal staging | Giao | P0 | ⬜ | Chưa chốt |  |  |
| TECH-MOB-01 | OAuth + signing thiết bị thật | Giao | P0 | ⬜ | Chưa chốt |  |  |
| GAME-01 | XP + streak dùng dữ liệu Backend | Giao | P0 | ⬜ | Chưa chốt |  |  |
| GAME-02 | Quest + badge Mobile | Giao + Huỳnh Anh | P1 | ⬜ | Chưa chốt |  |  |
| COURSE-SCOPE-01 | Tách public catalog và management API | Giao | P0 | ✅ | 23/07/2026 | BE/Web/Admin build pass; scope tests pass |  |
| COURSE-SCOPE-02 | UAT Web thấy tất cả, Admin chỉ thấy khóa được giao | Giao | P0 | 🟡 | Chưa chốt | Source + automated tests done | Cần hai tài khoản và dữ liệu staging |
| AI-01 | Chốt input và schema output | Anh Văn | P0 | ⬜ | Chưa chốt |  |  |
| AI-02 | Prototype chia chương/bài | Anh Văn | P0 | ⬜ | Chưa chốt |  |  |
| CONTENT-01 | Course brief và tài liệu nguồn | Huỳnh Anh | P0 | ⬜ | Chưa chốt |  |  |
| CONTENT-02 | Duyệt outline khóa pilot | Huỳnh Anh | P0 | ⬜ | Chưa chốt |  |  |

## 9. Nhịp điều hành

- **Đầu tuần:** Huỳnh Anh chốt backlog, owner và hạn dự kiến.
- **Mỗi ngày:** cập nhật ngắn `Đã làm / Sẽ làm / Blocker`.
- **Giữa tuần:** demo phần chạy được, không chỉ báo cáo bằng lời.
- **Cuối tuần:** nghiệm thu theo tiêu chí, cập nhật tỷ lệ và chuyển việc chưa đạt sang tuần sau có lý do.
- **Khi có blocker quá 1 ngày:** báo ngay cho Huỳnh Anh để điều phối, không chờ đến cuối tuần.

## 10. Điều kiện được phép phát hành

- [ ] Backend production build và required tests pass.
- [ ] Web/Admin production build pass.
- [ ] Mobile có bản release được ký và test trên thiết bị thật.
- [ ] Gamification Mobile dùng dữ liệu Backend; không còn XP/streak/quest mock trong release.
- [ ] Migration staging, backup và rollback/forward-fix đã diễn tập.
- [ ] Google OAuth hoạt động trên domain và thiết bị production.
- [ ] Luồng mua → paid → enrollment → học → hoàn thành chạy end-to-end.
- [ ] Instructor chỉ thao tác được trên khóa của mình.
- [ ] Khóa học pilot hoàn thành Definition of Done.
- [ ] Nội dung do AI hỗ trợ đã được Huỳnh Anh/giảng viên kiểm duyệt.
- [ ] Secrets, CORS, webhook, log và monitoring đạt checklist production.

## 11. Tài liệu liên quan

- [Đánh giá mức độ sẵn sàng nền tảng](./platform-readiness-audit.md)
- [Hướng dẫn vận hành hằng ngày](./huong-dan-van-hanh-ngay.md)
- [Hướng dẫn Docker build](./docker-build.md)
