# GATS Academy — Platform Readiness Audit

> Cập nhật: 21/07/2026  
> Phạm vi: `BE`, `web-app`, `admin-dashboard`, `mobile-app`  
> Phương pháp: đọc source, routes, schema, service, UI wiring và chạy static analysis/type-check. Audit này chưa thay thế UAT với database staging, SePay thật, S3, email, video transcoding hoặc kiểm thử bảo mật độc lập.

## 1. Quy ước trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| **Đạt** | Source đã có và luồng chính hợp lý; vẫn cần regression test khi phát hành |
| **Code done, chờ UAT** | Đã nối UI/API nhưng chưa xác nhận end-to-end trên staging |
| **Partial/MVP** | Có phần nền nhưng thiếu nghiệp vụ, UI vận hành hoặc edge case |
| **API only** | BE đã có nhưng Web/Admin/Mobile chưa khai thác đầy đủ |
| **Mock/local only** | Dữ liệu hoặc trạng thái chỉ nằm local/mock, không phải source of truth server |
| **Todo** | Chưa thấy implementation đủ dùng trong source |
| **Blocked** | Không vượt qua kiểm tra build/type/migration/security cần thiết |

## 2. Kết luận điều hành

| Surface | Mức sẵn sàng ước lượng | Kết luận |
|---|---:|---|
| Backend API | 65–70% | Domain khá rộng nhưng type-check fail, migration thiếu và refund chưa atomic |
| Web bán khóa học | 80–85% | Browse/cart/SePay/lead/profile cơ bản đã có; coupon/certificate/extras chưa nối đủ |
| Web học tập | 70–75% | Hub/player/progress/resume/quiz/assignment đã có; Q&A/note/bookmark/certificate UI còn thiếu |
| Admin | 70–75% | Authoring và learning operations tiến bộ rõ; dashboard, moderation, reconciliation còn thiếu |
| Mobile | 40–50% | Có auth/course/order API nhưng progress, wishlist, gamification, chat, AI coach và một số role screen còn mock/local |
| Toàn nền tảng | 60–65% | Đã thành MVP tích hợp, chưa đạt production-ready do P0 security/migration/build/payment |

### Quyết định phát hành hiện tại

**Chưa nên mở bán rộng hoặc gọi là production-ready.** Bốn blocker lớn nhất:

1. `BE/.env.development` đang được Git track và chứa credential thật: phải loại khỏi Git history phù hợp và rotate toàn bộ secrets liên quan.
2. Source có nhiều schema mới nhưng không có migration SQL tương ứng trong `BE/drizzle`.
3. BE và Web chưa đạt type-check sạch.
4. Refund cập nhật order, transaction và enrollment bằng nhiều lệnh rời, chưa nằm trong một database transaction.

## 3. Kết quả kiểm tra kỹ thuật

| Surface | Lệnh | Kết quả | Ghi chú |
|---|---|---|---|
| BE | `npm run type-check` | **FAIL** | Lỗi seed scripts, legacy `IUser`/default export, Zod cast, PostService input, test fixture thiếu `linkedPostId`, Vitest typing |
| Web | `npm exec tsc -- --noEmit` | **FAIL** | `e2e/purchase-to-learn.spec.ts` import `@playwright/test` nhưng package chưa được cài/khai báo |
| Admin | `npm run typecheck` | **PASS** | Tiptap đã đồng bộ lên `3.28.0`; blocker Tiptap trong audit cũ đã được giải quyết |
| Mobile | `flutter analyze` / `dart analyze lib` | **Không kết luận** | Analyzer không trả kết quả trong cửa sổ audit; cần chạy lại trong CI với timeout/log rõ ràng |

Lưu ý:

- Chưa xác nhận production build của ba client.
- Web hiện dùng CSS font stack nên không còn phụ thuộc Google Fonts khi build.
- Admin vẫn import font Satoshi local; không còn kết luận cũ về lỗi tải Inter.

## 4. Đối chiếu Phase 1 đã chốt

| Hạng mục | BE | Web | Admin | Kết luận |
|---|---|---|---|---|
| Lead tư vấn DB + email | Có schema/service/API, rate limit 8/15 phút | Modal/form/API có | Có list, status, note | **Code done, chờ mail/DB UAT** |
| Chỉ bank transfer + SePay | Order/payment API có polling/webhook | UI chỉ bank transfer, QR/fallback/poll | Order operations có | **Code done, chờ E2E SePay** |
| Media URL/QR/cart image | Media resolver/API có | Đã normalize thumbnail và QR fallback | Có media/video manager | **MVP đạt** |
| Lesson gắn một post | `linkedPostId`, published summary, delete set null trong schema | Course detail và learn render linked post | Selector post đã publish | **Code done; thiếu migration/UAT draft-delete** |
| Quiz CTA + bỏ true/false | BE chỉ hỗ trợ các type hiện hành | Learner quiz có | Builder/CTA/readiness có | **Đạt về source** |

## 5. Backend — hiện trạng và khoảng trống

### 5.1. Domain/API đã có

- Auth: register/login/logout, email verification, forgot/reset/change password, Google/social token, session revoke.
- Catalog: course, section, lesson, category, tag, post, comment, review-related schema.
- Commerce: cart, order, transaction, bank account, SePay check/webhook, coupon.
- Learning: enrollment, lesson progress, HLS/video, quiz attempt, assignment submission/attachment.
- Learning extras: lesson Q&A, notes, bookmarks.
- Operations: lead, notification, admin users, audit logs, moderation, admin metrics, analytics.
- Credentials: certificate issue/list/revoke/verify và auto-issue khi course đạt 100%.
- Media/video: S3-compatible upload, rendition/transcoding-related schema và worker support.

### 5.2. Điểm tốt

- SePay kiểm tra transaction reference và amount; có payment exception logging cho mismatch/not-found.
- Payment success có idempotency guard và cấp enrollment.
- Pending order có cửa sổ thanh toán 30 phút và trạng thái expired.
- Lead public endpoint có rate limit nhẹ.
- Cookie web dùng `httpOnly`, `secure` ở production và `sameSite=lax`; mobile có Bearer token.
- Permission/staff middleware được dùng cho nhiều route admin.
- Bank account có entity riêng, hỗ trợ default/active thay vì chỉ env fallback.

### 5.3. Blocker và rủi ro

#### P0 — Security

- `BE/.env.development` đang được Git track và chứa secrets/credentials thật.
- Hành động bắt buộc: rotate JWT, email app password, S3 credential, SePay key và các secret khác; bỏ file thật khỏi tracking; chỉ giữ `.env.example`; rà Git history/remote exposure.
- CORS cấu hình `origin: true` rồi mới dùng `originGuard`; cần integration/security test để chứng minh origin không nằm allowlist bị chặn đúng trên mọi request credentialed.
- Rate limiter hiện là in-memory; khi chạy nhiều instance sẽ không chia sẻ quota.

#### P0 — Migration drift

Source export schema cho:

- `lead`, `payment-exception`, `coupon`, `certificate`.
- `lesson-question`, `lesson-answer`, `lesson-note`, `lesson-bookmark`.
- `linked_post_id` và các domain mới khác.

Nhưng không tìm thấy migration SQL tương ứng trong `BE/drizzle`. Cần generate/review migration từ schema hiện tại, test trên database rỗng và database snapshot production trước deploy.

#### P0 — Payment/refund consistency

- Confirm payment có idempotency nhưng vẫn cần concurrency test webhook + polling đồng thời.
- Refund đang lần lượt update order, transaction, từng enrollment và audit log; không bọc trong một transaction DB duy nhất.
- Nếu một bước giữa chừng lỗi, order có thể `refunded` nhưng quyền học chưa thu hồi hết.
- Chưa có tích hợp hoàn tiền thật với gateway/ngân hàng; đây mới là trạng thái vận hành nội bộ.

#### P0 — Build/type health

- Seed scripts dùng API/schema Drizzle cũ (`displayName`, `authorId`, relational filter callback).
- `MockOrm`, `UserService` và tests còn phụ thuộc `IUser`/default exports đã bị xóa.
- `PostService` đọc `input.status` nhưng create input type không có field này.
- Test curriculum chưa cập nhật `linkedPostId`.
- Vitest config/type không tương thích dependency hiện tại.

### 5.4. Thiếu cho vận hành production

- Migration/rollback/backup restore drill.
- Queue observability, retry/dead-letter cho video và email.
- Health/readiness endpoint bao quát DB, Redis, S3 và worker.
- Structured logs, request ID, metrics, alerting và error tracking.
- Reconciliation job cho bank transaction ↔ order.
- Webhook replay protection/dedup dựa trên provider transaction ID cần test rõ.
- Data retention, PII export/delete và audit retention policy.

## 6. Web-app — hiện trạng và khoảng trống

### 6.1. Routes đã có

- Public: `/`, `/about`, `/courses`, `/courses/[slug]`, `/posts`, `/posts/[slug]`, `/contact`.
- Commerce: `/cart`, `/checkout`, `/checkout/result`.
- Account: auth modal, `/forgot-password`, `/reset-password`, `/profile`.
- Learning: `/learning`, `/learn/[slug]`, `/learn/[slug]/[lessonId]`.
- Legal: `/terms`, `/privacy`, `/refund`.
- Tool/demo: `/promptcowboy`, `/simple`.

### 6.2. Commerce và lead

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Lead modal + validation | **Đạt** | DB/email/rate limit cần runtime UAT |
| Cart API | **Đạt/MVP** | Có client/server cart paths |
| Media resolver | **Đạt** | Relative URL và internal host mapping |
| Bank transfer/QR | **Đạt/MVP** | Có fallback thông tin chuyển khoản |
| SePay poll/manual check | **Code done, chờ UAT** | Không coi create order là paid |
| Pending restore/TTL/cancel | **Code done, chờ UAT** | Cần test nhiều tab và reload |
| Coupon | **Todo trên Web** | BE/Admin có nhưng `PathApi` và checkout chưa dùng |
| Invoice/VAT | **Todo** | Chưa có domain/UI rõ ràng |
| Refund request | **Todo** | Trang refund mới là policy, chưa phải workflow |
| Wishlist server | **Todo** | Chưa có domain Web |

### 6.3. Learning

Đã có:

- Learning hub lấy enrollment/progress thật.
- HLS player, deep link lesson, previous/next, mark complete.
- Resume theo watched seconds và lưu progress.
- Quiz take/submit và assignment text/URL.
- Linked post trong course detail, modal và learning workspace.
- Light/dark mode trong learning workspace.

Chưa hoàn chỉnh:

- BE có Q&A, notes, bookmarks nhưng Web chưa có `PathApi`/UI tương ứng.
- Assignment file upload chưa được learner UI hỗ trợ đầy đủ.
- Certificate tab trong profile luôn hiển thị empty state; chưa gọi certificate API.
- Chưa có certificate download/share/verification page.
- Subtitle, transcript, playback quality selector và tốc độ/keyboard UX cần UAT với Vidstack.
- Chưa có learning analytics/event tracking đáng tin cậy.

### 6.4. Content/community

- Post list/detail/comment/like đã nối API.
- `constants/mockPosts.ts` vẫn tồn tại nhưng không thấy được dùng trong route chính.
- Post detail còn comment “Mock” và phần tag/video đặc thù cần dọn để tránh code demo sót.
- BE có moderation nhưng Web chưa có report-abuse flow rõ ràng.

### 6.5. Account/legal

- Profile có update username, change password, order/enrollment history cơ bản.
- Certificate chưa nối thật.
- Avatar upload, active devices/session list và notification preferences chưa hoàn chỉnh.
- Legal pages chưa có versioning/consent record.

### 6.6. Build/test

- Có `e2e/purchase-to-learn.spec.ts`, nhưng thiếu `@playwright/test` trong dependencies/devDependencies nên type-check fail.
- Chưa thấy script `typecheck` hoặc `test:e2e` chuẩn hóa trong `package.json`.
- Cần tách `e2e` khỏi app tsconfig hoặc cài/config Playwright đúng cách.

## 7. Admin dashboard — hiện trạng và khoảng trống

### 7.1. Đã có

- Course CRUD/trash, section/lesson authoring, attachment và video manager.
- Linked-post selector.
- Quiz builder, validation/readiness, attempts page và row actions.
- Assignment builder và submission/grading page.
- Course learners/progress page.
- Preview as learner ở mức curriculum/content.
- Publish readiness panel.
- Post/category/trash management.
- Orders detail/status, expiration, enrollment status và repair.
- Users detail/security actions.
- Lead pipeline/list/detail note.
- Coupons manager.
- Certificates manager.
- Notifications inbox.
- Admin type-check đã pass.

### 7.2. Partial hoặc chưa đủ

| Hạng mục | Trạng thái | Khoảng trống |
|---|---|---|
| Course learners | **MVP** | Thiếu filter/export/cohort và lesson drill-down sâu |
| Quiz attempts | **MVP** | Cần permission/audit/UAT reset hoặc extra attempt |
| Assignment grading | **MVP** | Cần notification learner, rubric và file UAT |
| Preview learner | **Partial** | Không chạy đầy đủ video/quiz/assignment như learner thật |
| Publish readiness | **MVP** | Cần enforce server-side trước publish, không chỉ UI |
| Coupons | **MVP** | Chưa nối checkout Web; cần concurrency/max-use test |
| Certificates | **MVP** | Web learner chưa hiển thị; cần verify/download workflow |
| Leads | **Partial** | Chưa có assignee selector, activity timeline, dedup/export |
| Notifications | **Inbox only** | Chưa có composer, audience, schedule, delivery log |
| Moderation | **API only** | Proxy allowlist có nhưng không thấy route UI quản trị |
| Bank accounts | **API only** | Không thấy trang Admin để quản lý account/default |
| Payment exceptions | **API/schema only** | Chưa có workspace xử lý mismatch/not-found |
| Reconciliation/export | **Todo** | Chưa có CSV và đối soát |

### 7.3. Dashboard/navigation

- Trang `/` vẫn là template NextAdmin: payments/devices/channels/region/chats và fake delay/data.
- BE đã có `/admin/metrics` và `/analytics/overview` nhưng dashboard chưa sử dụng.
- Route demo vẫn còn: charts, forms, tables, UI elements, calendar.
- Cần ẩn/xóa demo khỏi production navigation và thay dashboard bằng dữ liệu GATS thật.

### 7.4. Admin error handling và action nhạy cảm

- Cần rà lại toàn bộ server action để không biến lỗi fetch thành list rỗng.
- Confirm/cancel/refund/repair/lock/revoke nên có dialog accessible, reason bắt buộc và audit.
- UI permission không thay cho middleware permission ở BE.

## 8. Mobile app — hiện trạng và khoảng trống

### 8.1. Phần đã nối API

- Email/password auth, verify email và session restore.
- Google/Apple social auth wiring.
- Course published list/detail/curriculum và enrollment list.
- Free enrollment.
- Post API và comments qua một store mang tên `MockPostStore` nhưng có sync API.
- Order create và SePay payment check.
- Video API/player cơ bản.

### 8.2. Phần còn mock/local

- MoMo login là mock và bỏ qua API.
- Course repository vẫn dùng model nằm trong `data/mock/models`.
- Progress được lưu bằng `SharedPreferences`, chưa lấy/lưu thống nhất với BE progress.
- Wishlist nằm trong `CartController` local memory.
- Hub XP/badge/leaderboard/achievement dùng `MockData`.
- Group chat dùng `MockGroupChatStore`.
- AI coach có mock reply.
- Admin/mentor shell còn dựa trên mock accounts/course data.
- Reviews trên course store có dữ liệu hard-coded.
- Một số localization vẫn ghi rõ “mock payment”/“mock auth”.

### 8.3. Rủi ro phát hành mobile

- Không được phát hành learner app khi progress source of truth vẫn local; user đổi máy sẽ mất hoặc lệch tiến độ Web.
- Cần loại/feature-flag role Admin/Mentor khỏi production mobile nếu chưa nối permission/API thật.
- Token storage đang dựa vào preferences; cần đánh giá chuyển sang secure storage cho access/refresh token.
- Cần deep link verify/reset/payment result, offline/error/retry và app lifecycle video tests.
- Cần Android/iOS signing, privacy manifest, notification permission và store checklist.

## 9. Ma trận đồng bộ đa nền tảng

| Domain | BE | Web | Admin | Mobile | Kết luận |
|---|---|---|---|---|---|
| Auth/session | Có | Có | Có | Có, MoMo mock | **MVP** |
| Course catalog | Có | Có | Authoring có | Có | **MVP** |
| Cart/order | Có | Có | Operations có | Có một phần | **MVP, cần E2E** |
| SePay | Có | Có | Quan sát đơn | Có | **Code done, chờ UAT** |
| Coupon | Có | Chưa dùng | Có manager | Chưa thấy | **Chưa đồng bộ** |
| Enrollment | Có | Có | Learner/repair có | Có | **MVP** |
| Progress | Có | Có | Report có | Local prefs | **Mobile lệch source of truth** |
| Quiz | Có | Take có | Builder/attempts có | Chủ yếu model/mock flow | **Web/Admin tốt hơn Mobile** |
| Assignment | Có | Text/URL | Builder/grading | Chưa đủ | **Partial** |
| Linked post | Có | Có | Có | Chưa xác nhận | **Web/Admin đạt** |
| Q&A/note/bookmark | Có | Chưa có UI | Chưa có ops rõ | Local/mock UI | **API only** |
| Certificate | Có | Empty state | Manager có | Mock XP/cert exam | **Chưa đồng bộ learner** |
| Lead | Có | Có | CRM MVP | Không cần thiết | **MVP** |
| Moderation | Có | Thiếu report flow | Thiếu UI | Chưa đủ | **API only** |
| Notification | Có | Chưa có center/preferences | Inbox event | Local notification/mock data | **Chưa đồng bộ** |
| Analytics | Có endpoint | Chưa event plan | Dashboard chưa dùng | Mock stats | **Chưa vận hành** |

## 10. Backlog ưu tiên mới

### P0 — trước staging/public sale

| ID | Hạng mục | Trạng thái |
|---|---|---|
| SEC-01 | Rotate secrets và bỏ `BE/.env.development` khỏi Git tracking/history phù hợp | **Blocked/security** |
| DB-01 | Generate/review migration cho toàn schema mới | **Blocked/deploy** |
| DB-02 | Test migrate database rỗng + upgrade snapshot production + rollback | **Todo** |
| BE-01 | Làm `npm run type-check` pass | **Blocked build** |
| WEB-01 | Cài/config Playwright hoặc tách E2E khỏi tsconfig để Web type-check pass | **Blocked build** |
| PAY-01 | Bọc refund + transaction update + revoke enrollment + audit trong DB transaction | **Blocked consistency** |
| PAY-02 | E2E webhook/poll concurrency, amount mismatch, expiry, duplicate | **Todo** |
| QA-01 | E2E purchase → paid → enrollment → learn | **Có spec nhưng chưa chạy được** |
| MOB-01 | Đồng bộ progress Mobile với BE | **Blocked cross-device** |
| OPS-01 | Staging observability/health/backup checklist | **Todo** |

### P1 — hoàn thiện vận hành

| ID | Hạng mục |
|---|---|
| ADM-01 | Dashboard GATS dùng admin metrics/analytics thật |
| ADM-02 | Payment exception + reconciliation workspace |
| ADM-03 | Bank account management UI |
| ADM-04 | Moderation queue UI |
| ADM-05 | Lead assignee/activity/dedup/export |
| ADM-06 | Enforce publish readiness server-side |
| WEB-02 | Q&A, notes, bookmarks trong learning workspace |
| WEB-03 | Certificate list/download/verify UI |
| WEB-04 | Coupon checkout UI và validation |
| MOB-02 | Loại mock auth/payment/course/review khỏi learner production path |
| MOB-03 | Secure token storage và cross-device session tests |

### P2 — tăng trưởng và scale

- Notification composer, audience, schedule, delivery logs và preferences.
- Invoice/VAT workflow.
- Wishlist server dùng chung Web/Mobile.
- Cohort/live session/calendar thật.
- Transcript/subtitle/search trong bài học.
- Recommendation/learning analytics dựa trên event thật.
- Community/report/anti-spam nâng cao.

## 11. Roadmap đề xuất

### Wave 0 — Stabilize foundation

1. Rotate secrets và xử lý file env tracked.
2. Chốt migrations và test database lifecycle.
3. Fix BE/Web type-check; giữ Admin pass; đưa Mobile analyze vào CI.
4. Làm refund atomic/idempotent.
5. Chạy payment và purchase-to-learn E2E trên staging.

### Wave 1 — Close learner operations loop

1. Mobile progress dùng BE.
2. Web certificate thật.
3. Learning Q&A/notes/bookmarks.
4. Admin payment exceptions/reconciliation.
5. Enforce publish readiness ở BE.

### Wave 2 — Replace mock/ops gaps

1. Dashboard GATS thật.
2. Moderation và notification operations.
3. Bank account/coupon end-to-end UI.
4. Loại mock khỏi mobile production path.
5. Lead CRM nâng cao.

### Wave 3 — Growth

1. Wishlist/coupon/invoice đa nền tảng.
2. Community và engagement thật.
3. Learning analytics/recommendation.
4. Cohort/live learning và certificate sharing/verification.

## 12. Definition of Done production-ready

Chỉ đánh dấu nền tảng production-ready khi:

- Không còn secret thật trong tracked files/history có thể truy cập; secrets đã rotate.
- Database mới có thể dựng hoàn toàn bằng migration; upgrade/rollback đã rehearsal.
- BE, Web, Admin và Mobile static analysis/build pass trong CI.
- Payment chỉ paid khi BE xác nhận; webhook/poll đồng thời không cấp enrollment trùng.
- Refund là atomic và idempotent, luôn thu hồi đúng quyền học.
- Paid order luôn truy ra transaction và enrollment; repair có permission/reason/audit.
- Progress Web/Mobile dùng cùng server source of truth.
- Course publish bị chặn khi thiếu video/content/quiz readiness hoặc linked draft post ngoài ý muốn.
- Quiz attempt và assignment submission từ learner xuất hiện đúng trong Admin.
- Certificate tự cấp, hiển thị, tải và verify được end-to-end.
- Admin phân biệt lỗi tải dữ liệu với empty state.
- Có logging, metrics, alerting, backup/restore và queue retry/dead-letter.
- Các flow trọng yếu đạt keyboard/focus/accessibility và responsive UAT.
- Có E2E tối thiểu cho auth, lead, purchase-to-learn, refund/revoke, quiz, assignment và certificate.

## 13. Thứ tự hành động ngay

1. Rotate secrets và xử lý `BE/.env.development` trong Git.
2. Generate migration cho schema mới; test migrate từ database rỗng.
3. Fix BE type-check.
4. Fix Web Playwright/type-check.
5. Refactor refund thành transaction atomic.
6. Chạy staging E2E SePay và purchase-to-learn.
7. Đồng bộ Mobile progress với BE.
8. Nối Web certificate/Q&A/notes/bookmarks.
9. Thay dashboard Admin template bằng metrics thật.
10. Xây payment exceptions/reconciliation và dọn toàn bộ mock production path.
