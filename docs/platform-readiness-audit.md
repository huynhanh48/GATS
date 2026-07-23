# GATS Academy — Đánh giá tổng thể nền tảng

> Cập nhật: 22/07/2026<br>
> Phạm vi: `BE`, `web-app`, `admin-dashboard`, `mobile-app`, Docker/deploy<br>
> Phương pháp: đọc source/routes/schema/service/UI wiring, rà mock/local data, migration và chạy production build/static analysis. Kết quả chưa thay thế UAT trên staging với PostgreSQL, Redis, SePay, email, S3/MinIO và thiết bị mobile thật.
> Quyết định hiện tại: **tạm hoãn toàn bộ refund/refund request**. Các mục refund được giữ trong phần deferred để truy vết, không nằm trong P0/P1 hay thứ tự triển khai hiện tại.

## 1. Kết luận điều hành

| Surface | Sẵn sàng ước lượng | Kết luận |
|---|---:|---|
| Backend API | 70–75% | Domain rộng; production build đã pass sau cookie fix; migration additive đã bổ sung (cần rehearsal DB) |
| Web bán khóa học | 85–90% | Catalog/cart/SePay/coupon/lead/profile đã nối; cần E2E và invoice |
| Web học tập | 80–85% | Player/progress/quiz/assignment/Q&A/note/bookmark/certificate đã có; còn thiếu một số UX học tập và certificate verify page |
| Admin | 80–85% | Đã có metrics, analytics, moderation, payment exceptions và learning operations; còn thiếu reconciliation/bank account UI và dọn demo |
| Mobile | 70–80% | Learning + Google/checkout/coupon/orders/account đã nối source; package ID + cleartext release đã chỉnh; còn OAuth/device UAT, signing thật, loại mock |
| Docker/Operations | 55–60% | `app` override `NODE_ENV=production`; còn secrets/health/observability và không dùng password fallback prod |
| Toàn nền tảng | 68–72% | Wave 0 stabilize đang tiến; chưa production-ready đa nền tảng |

### Quyết định phát hành

**Chưa nên mở bán rộng trên production với source hiện tại.** Các blocker P0 còn lại:

1. ~~BE production build fail cookie Google~~ — **đã sửa** (`getCookieOptions(req?)`); `npm run build` pass.
2. ~~`app` kế thừa `NODE_ENV=development`~~ — **đã override** `NODE_ENV=production` trong Compose.
3. `BE/.env.development` đã **untrack + gitignore**; **vẫn phải rotate** JWT/email/S3/SePay nếu từng push remote (lịch sử Git).
4. Migration additive `20260722120000_phase1_ops_learning_extras` đã thêm; **chưa** rehearsal empty/upgrade/rollback trên staging.
5. Mobile: package ID `com.gat.academy`, cleartext tắt trên release; còn **signing keystore thật**, OAuth SHA/iOS schemes, device UAT Google/checkout/progress. Apple chưa có BE.

## 2. Kết quả kiểm tra kỹ thuật ngày 22/07/2026

| Surface | Lệnh | Kết quả | Chi tiết |
|---|---|---|---|
| BE production | `npm run build` | **PASS** (sau fix cookie 22/07) | `getCookieOptions(req?: Request)` khớp caller; Secure theo prod/`x-forwarded-proto` |
| BE toàn project | `npm run type-check` | **FAIL** | Production auth đã sạch; còn seed Drizzle cũ, legacy `IUser`/default exports, fixtures thiếu `linkedPostId` và Vitest config |
| Web production | `npm run build` | **PASS** | Next.js compile, TypeScript và 20 routes hoàn tất |
| Admin | `npm run typecheck` | **PASS** | TypeScript sạch tại thời điểm audit |
| Mobile | `flutter test test/progress_and_auth_wave2_test.dart` | **Chưa xác nhận** | Lệnh tiếp tục bị treo/không trả output trong cửa sổ audit; không ghi PASS khi chưa có exit code. Cần chạy lại qua script CI/local Flutter ổn định |

### Working tree đang thay đổi

Tại thời điểm audit, working tree còn nhiều thay đổi chưa commit trên cả BE, Web, Mobile, Docker và docs. Các nhóm đáng chú ý:

- Security/deploy: `.gitignore`, xóa tracking `BE/.env.development`, `.env.vps.example`, `docker-compose.yml`, cookie Google.
- Database: migration mới `BE/drizzle/20260722120000_phase1_ops_learning_extras/` đang untracked.
- Mobile Wave 2/store: nhiều API/UI mới, Android package/signing/network config và logo GATS SVG còn uncommitted/untracked.
- Web: auth modal và light-theme/Hero/Feature thay đổi chưa commit.

Phải review, test và commit theo nhóm; tránh deploy trực tiếp một working tree gần 50 file thay đổi mà chưa có commit/release tag.

Các kết luận build ở trên phản ánh đúng working tree này, không chỉ commit gần nhất.

## 3. Đối chiếu Phase 1

| Hạng mục | Hiện trạng | Kết luận |
|---|---|---|
| Lead DB + email admin | BE API/schema/service/rate limit; Web modal; Admin pipeline/note | **Code done, chờ mail/runtime UAT** |
| Bank transfer + SePay | Create order, QR, poll/manual check, webhook, expiry, mismatch exception | **Code done, chờ staging E2E/concurrency** |
| Media URL/cart/QR | Web normalize URL và fallback; BE/Admin có media/video manager | **MVP đạt** |
| Lesson gắn một post | Schema/service/Admin selector/Web course + learn workspace + migration `linked_post_id` | **Code + SQL done; chờ migration rehearsal/UAT** |
| Quiz builder/CTA | Admin builder/readiness/attempts; Web take/submit; không còn true/false sai contract | **Đạt về source** |

## 4. Backend

### 4.1. Domain đã có

- Auth/session: email/password, verify/reset/change password, Google token, session revoke, role/permission. Admin đã có UI + API đổi role tài khoản `user | admin`; chỉ admin được thao tác, chặn tự hạ quyền/chặn xóa admin cuối cùng và thu hồi session sau khi đổi. Mentor/instructor được phân công riêng theo khóa học: admin phải chọn khóa, hệ thống cập nhật `course.instructorId`, gắn role scope `course` và gỡ quyền scope của mentor cũ khi thay người.
  - Web-app hiển thị “Giảng dạy” cho tài khoản có role `instructor/admin`, dẫn sang khu vực quản lý khóa học. Admin-dashboard hỗ trợ Google Sign-In bằng cùng Web Client ID và từ chối/đăng xuất ngay tài khoản không có quyền staff.
- Catalog/content: course, section, lesson, category, tag, post, comment, review.
- Commerce: cart, order, transaction, bank account, coupon, SePay poll/webhook.
- Learning: enrollment, lesson progress, video/HLS, quiz attempt, assignment submission/attachment.
- Learning extras: lesson question/answer, notes, bookmarks.
- Operations: leads, notifications, moderation, audit logs, admin metrics, analytics.
- Credentials: certificate issue/list/revoke/verify và auto-issue khi hoàn thành khóa.
- Media/video: S3-compatible storage, multipart upload, rendition/transcoding worker.

### 4.2. Điểm tốt

- Payment không coi create-order là paid; chỉ cấp enrollment khi BE xác nhận.
- Có TTL pending order, cancel/expire và polling/webhook.
- Có payment exception cho amount mismatch/not-found và Admin đã có màn hình xử lý.
- Payment success có idempotency guard; bank account là entity riêng.
- Coupon đã đi xuyên BE → Web checkout → Admin manager.
- Course learning loop đã có progress, quiz, assignment, certificate và learning extras.
- Lead endpoint có rate limit nhẹ và pipeline Admin.
- Nhiều route vận hành dùng staff/permission middleware và audit log.

### 4.3. P0 — Build regression từ Google cookie — **DONE**

Contract đã chốt:

- `getCookieOptions(req?: Request): CookieOptions` — `secure` khi `NODE_ENV=production` hoặc `req.secure` / `x-forwarded-proto=https`.
- `getClearCookieOptions(req?)` dùng cùng options.
- `npm run build` **PASS**.

Còn lại: integration test cookie sau reverse proxy HTTPS (`trust proxy`, SameSite) trước public launch.

### 4.4. P0 — Migration drift — **SQL đã bổ sung, chờ rehearsal**

Đã thêm migration thủ công (drizzle-kit generate bị kẹt rename/create hints vì snapshot journal không đầy đủ):

- `BE/drizzle/20260722120000_phase1_ops_learning_extras/migration.sql`
- Gồm: leads, payment_exceptions, coupons/redemptions, certificates, lesson Q&A/notes/bookmarks, notifications, audit_logs, `lessons.linked_post_id`, orders `coupon_*` / `discount_amount`.
- Idempotent (`IF NOT EXISTS` / guarded `ADD COLUMN`).

Vẫn phải test:

1. Dựng database rỗng hoàn toàn bằng migration.
2. Upgrade từ snapshot production/staging.
3. Rollback hoặc forward-fix rehearsal.
4. Chạy smoke test API sau migration.
5. (Tuỳ chọn) regenerate snapshot/`--hints` để `db:generate` hoạt động lại.

### 4.5. Deferred — Payment/refund consistency

- Refund hiện update order thành `refunded`, update transaction metadata, lặp qua enrollment để revoke rồi ghi audit.
- Các thao tác không nằm trong một database transaction chung.
- Nếu lỗi giữa chừng, order có thể refunded nhưng learner vẫn còn một phần quyền học.
- Đây là refund trạng thái nội bộ, chưa phải hoàn tiền tự động tại ngân hàng/gateway.

Khi mở lại phạm vi refund, cần một repository transaction atomic và idempotency key cho admin refund. **Hiện chưa triển khai mục này theo quyết định tạm hoãn refund.**

### 4.6. P0 — Security và cấu hình

- `BE/.env.development`: **đã `git rm --cached` + gitignore** (file local giữ lại). Nếu từng push remote → coi secret đã lộ và **rotate** JWT, email, S3/MinIO, SePay; rà Git history.
- CORS đang reflect mọi origin (`origin: true`) và `originGuard` hiện cho qua tất cả request; với credentialed cookie đây là policy quá rộng.
- Rate limit in-memory không hoạt động đồng nhất khi scale nhiều instance.
- Cần kiểm tra webhook authentication, replay/dedup và log không lộ payload nhạy cảm.

### 4.7. Build/test debt

`npm run type-check` còn lỗi ngoài production source:

- Seed scripts dùng Drizzle API/schema cũ (`displayName`, `authorId`, filter callback cũ).
- `MockOrm`, `UserService`, tests còn dùng `IUser` và default exports đã bị xóa.
- Course fixtures chưa có `linkedPostId`.
- Vitest config/dependency typing chưa đồng bộ.

Production build phải pass trước, sau đó dọn toàn project type-check để CI kiểm được seed và tests.

### 4.8. Thiếu cho production operations

- Health/readiness cho DB, Redis, storage và worker.
- Structured logging, request ID, metrics, tracing và alerting.
- Queue retry/dead-letter/visibility cho video và email.
- Reconciliation job bank transaction ↔ order.
- Backup/restore drill, retention và PII export/delete.
- Load/concurrency test payment, coupon max-use và enrollment idempotency.

## 5. Docker và deploy

### 5.1. Đã có

- Một production image build Web, BE, Admin rồi chạy API/Web/Admin/worker qua PM2.
- PostgreSQL, Redis, MinIO và bucket init trong Compose.
- Build args cho `NEXT_PUBLIC_API_URL` và Google Client ID.
- Worker dev profile tách riêng; app production đã chạy worker bên trong.
- Host ports: API `3000`, Web `3005`, Admin `9100`, MinIO `9010/9011`.

### 5.2. Blocker

- Anchor `x-backend-env` vẫn `NODE_ENV: development` cho **worker/dev**.
- Service **`app` đã override `NODE_ENV: production`** (DEP-01).
- Worker/dev profile giữ development; không dùng fallback mật khẩu Postgres/MinIO/admin trên production thật.
- Google Client ID là build-time với Web nhưng runtime với BE; hai giá trị phải khớp và rebuild Web khi đổi.
- Compose hiện có fallback `GOOGLE_CLIENT_ID` → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, hợp lý nhưng cần validation fail-fast khi rỗng.

### 5.3. Cần bổ sung

- Tách `compose.dev.yml` và `compose.prod.yml` hoặc profile/config rõ ràng.
- Không để mật khẩu mặc định Postgres/MinIO/admin trong production fallback.
- Image healthcheck, startup migration lock và rollback strategy.
- Pin MinIO image thay vì `latest`.
- Resource limits, log rotation và volume backup.

## 6. Web-app

### 6.1. Commerce và account

| Hạng mục | Trạng thái |
|---|---|
| Catalog/course detail/post | **Đạt/MVP** |
| Cart server | **Đạt/MVP** |
| Bank transfer + QR + fallback | **Đạt/MVP** |
| SePay poll/manual check/restore | **Code done, chờ E2E** |
| Coupon preview/apply | **Đã nối BE** |
| Lead consultation | **Đã nối BE** |
| Order history | **Có** |
| Google login | **Đang sửa/UAT** |
| Refund request workflow | **Tạm hoãn, ngoài phạm vi hiện tại** |
| Invoice/VAT | **Chưa có** |
| Wishlist server | **Chưa có** |

### 6.2. Learning

Đã có:

- `/learning`, course workspace và deep link lesson.
- Video/HLS, resume watched seconds, previous/next, mark complete.
- Quiz take/submit và assignment text/URL.
- Linked post trong course detail và learning workspace.
- Q&A, notes và bookmarks qua `LearnExtrasPanel`.
- Certificate API hiển thị trong profile.
- Light/dark mode và responsive learning layout.

Còn thiếu/chưa đủ:

- Assignment file upload cần UAT end-to-end.
- Certificate download/share và public verify page hoàn chỉnh.
- Transcript/subtitle/search, playback quality/speed/keyboard UAT.
- Notification center/preferences cho learner.
- Learning event analytics đáng tin cậy.
- Accessibility test cho player, modal, focus và keyboard.

### 6.3. Build và code health

- Production build hiện **PASS**.
- Google button working tree hiện render nút GIS trực tiếp trong ô 64×48; cần visual/UAT trên Chrome, Edge, Safari và mobile browser.
- Web package chưa có script `typecheck`/`test:e2e` chuẩn hóa.
- Cần Playwright chạy auth, purchase-to-learn, coupon và learning resume trong CI.
- Vẫn còn route/demo như `/promptcowboy`, `/simple` và mock content file cần feature-flag hoặc loại khỏi production.

## 7. Admin dashboard

### 7.1. Đã có

- Dashboard GATS dùng metrics thật và status breakdown.
- Analytics overview/revenue.
- Course CRUD/trash, curriculum, lesson, linked post, attachment, video.
- Quiz builder/readiness/attempts và assignment submissions/grading.
- Course learner/progress và preview.
- Post/category/trash.
- Orders, lifecycle, expiration, enrollment repair.
- Payment exception list/resolve.
- Users/security actions.
- Leads pipeline/detail/note.
- Coupons và certificates manager.
- Moderation comments.
- Notification inbox và composer.
- Admin TypeScript hiện **PASS**.

### 7.2. Partial hoặc thiếu

| Hạng mục | Khoảng trống |
|---|---|
| Dashboard/analytics | Cần date range, export, comparison và định nghĩa metric thống nhất |
| Payment exceptions | Có xử lý thủ công, thiếu reconciliation job/bank import/export |
| Bank accounts | BE có entity nhưng chưa thấy workspace Admin đầy đủ |
| Refund | **Tạm hoãn**; khi mở lại cần atomic BE, reason bắt buộc, audit và policy approval |
| Publish readiness | Cần enforce server-side, không chỉ cảnh báo UI |
| Learners | Thiếu cohort/filter/export và lesson drill-down sâu |
| Assignment grading | Cần rubric, notification learner và attachment UAT |
| Leads | Assignee + activity timeline đã có; còn dedup và export |
| Notifications | Composer cơ bản; thiếu audience thật, schedule, delivery log/retry |
| Moderation | Mới tập trung comments; thiếu report queue/appeal/anti-spam |

### 7.3. Dọn production navigation

Vẫn còn nhiều page mẫu NextAdmin như charts, forms, tables, UI elements và calendar. Cần xóa hoặc ẩn khỏi production navigation để Admin không trông như template và giảm attack surface.

## 8. Mobile app

> Wave 2 đã đẩy learner loop lên gần Web về API. Google contract và checkout QR-only đã sửa; package ID và cleartext release cũng đã hoàn tất ở source. Blocker phát hành còn tập trung vào **OAuth/device UAT**, **release signing thật/iOS config**, và **mock engagement** trong production path.

### 8.1. Đã nối API (Wave 2 + commerce trước đó)

| Hạng mục | Trạng thái |
|---|---|
| Email/password, verify email, session restore | **Có** |
| Catalog / curriculum / enroll / free enroll | **Có** |
| Progress course/lesson | **BE source of truth**; preferences chỉ còn cache offline / fallback |
| Access token | **`flutter_secure_storage`** (Keychain/Keystore); có migration xóa token plaintext cũ khỏi SharedPreferences |
| Video player | **Thật** qua BE playback + Chewie/`video_player` |
| Quiz take/submit | **Có** (curriculum lesson + UI) |
| Assignment submit | **Có** (text/URL tối thiểu) |
| Q&A / notes / bookmarks | **Có** trong lesson UI |
| Certificate | **`GET /certificates/mine`** trong Hub (không còn mock XP card cho chứng chỉ) |
| Cart / QR bank transfer / SePay polling | **Có** (poll ~3s) |
| Coupon preview/apply | **Có** (`/api/coupons/preview` + `couponCode` trên create order) |
| Order history / cancel pending | **Có** |
| Account profile / change+forgot+reset password | **Có** |
| Post/comments | Sync API (store vẫn mang tên legacy `MockPostStore`) |
| MoMo login mock | Chặn restore `mock_session:`; UI MoMo chỉ `kDebugMode` — vẫn nên loại khỏi release binary nếu không dùng |

### 8.2. Auth / checkout / store

#### Google Mobile — source đã sửa, chờ integration/UAT

| | Mobile hiện tại | BE hiện tại |
|---|---|---|
| Path | `/api/user/auth/google` | `/api/user/auth/google` |
| Body | gửi **`idToken`** | yêu cầu **`idToken`** (camelCase) |
| Session | hydrate user thật qua `/api/user/me` | trả token và hỗ trợ `/me` |

Contract source đã đồng bộ. Việc còn lại là integration test Mobile ↔ BE với OAuth client Android/iOS thật, SHA/URL scheme đúng và thiết bị thật.

#### Apple

- Mobile đã có Apple SDK (identity token / authorization code).
- **BE chưa có** Apple authentication route/service.
- Production phải **ẩn Apple** cho đến khi BE verify token, link account và xử lý private relay email.

#### Checkout Phase 1 — source đã thu hẹp

- `checkoutDefaults`/`vietnamDefaults` hiện chỉ chứa **QR ngân hàng / SePay**.
- MoMo, VNPay, Visa/credit và Apple Pay còn trong `allGateways`/code dự phòng nhưng không nằm trong danh sách checkout production mặc định.
- Cần widget/integration test khóa điều kiện này để tránh vô tình bật gateway giả trong release sau này.

#### Android / iOS store config

- Android `applicationId` / namespace → **`com.gat.academy`** (đổi từ `.test`); **phải đăng ký lại OAuth SHA**.
- Android release: đọc `android/key.properties` nếu có; **không có file → vẫn fallback debug** (chỉ local smoke). Có `key.properties.example`.
- Release: **`usesCleartextTraffic=false`** + `network_security_config`; debug overlay vẫn cho HTTP local.
- iOS chưa thấy cấu hình URL scheme Google (reversed client ID) và Apple entitlement đầy đủ.
- `google_oauth.json` chứa Web client ID; Android cần OAuth Android client + SHA; iOS cần iOS client ID.

### 8.3. Phần còn local / mock (P2 / ngoài Wave 2 learning)

- Hub **XP, badge, leaderboard, achievements** — `MockData`.
- **AI coach** — mock reply.
- ~~**Group chat** — `MockGroupChatStore`.~~ **Đã chuyển sang BE SoT**: mỗi khóa có một nhóm chung ngầm định theo `courseId`; học viên có enrollment active, mentor của khóa và admin mới truy cập được. Web + Mobile dùng chung API, poll 5 giây; mentor ghim, người gửi/mentor xóa. Cần apply migration và UAT nhiều tài khoản trên staging.
  - Vòng đời đã khóa rõ: soft-delete giữ lịch sử nhưng API chat trả `410` và client dừng polling; restore mở lại cùng nhóm; khóa mới dùng UUID/nhóm mới; hard-delete cascade chat nhưng bị chặn `409` nếu khóa đã phát sinh đơn hàng. Restore trả `409` rõ ràng nếu slug đã được khóa khác sử dụng.
- **Admin / Mentor** mobile shell — mock.
- **Reviews** — hard-coded/mock.
- **Wishlist** — local trong `CartController`, không server SoT.
- Flashcard / daily / routine — nhiều state local, chưa đồng bộ account.

### 8.4. Security session

- JWT đã vào secure storage; profile không nhạy cảm có thể giữ preferences.
- Khi secure storage lỗi → memory fallback (không ghi lại JWT plaintext) — hướng đúng.
- Chưa có refresh-token rotation; app phụ thuộc access token dài hạn.
- Không log Bearer; cần deep-link allowlist và cân nhắc pinning theo mô hình vận hành.

### 8.5. Kiểm tra Dart (22/07/2026)

- **Không có** compile error hoặc warning analyzer trên source.
- Có **~40 lint mức info** (import thừa, `BuildContext` qua async gap, Radio deprecated, style…).
- **Exit code 1** của analyze trong môi trường audit xuất phát từ **quyền ghi telemetry**, không phải source.
- **`flutter test` có thể bị treo** trong cửa sổ audit → chưa luôn xác nhận test pass tại đây.
- Coverage còn mỏng: DTO progress + nhận diện `mock_session`; thiếu integration auth/payment/player/offline.
- Có script smoke: `mobile-app/scripts/ci_smoke.ps1` / `ci_smoke.sh` (`analyze` + unit test; APK debug tùy chọn).

### 8.6. Ưu tiên Mobile làm ngay

1. **Integration/UAT Google** với OAuth Android/iOS thật và `/me`.
2. ~~Đổi package ID sang `com.gat.academy`~~ — **source done**; đăng ký lại OAuth/package trên store.
3. ~~Tắt cleartext HTTP cho release~~ — **source done**; debug vẫn cho HTTP local đúng mục đích.
4. Tạo **release keystore thật** và không cho Play Store build fallback debug signing.
5. **UAT checkout QR/SePay** và test bảo đảm gateway chưa hỗ trợ không xuất hiện production.
6. **UAT progress** Web ↔ Mobile, offline/retry và đổi thiết bị.
7. **Loại mock** khỏi production learner path (engagement/role shell feature-flag hoặc bỏ).

### 8.7. Blocker checklist trước phát hành learner app

1. Google source contract đã đúng; còn OAuth platform config + integration test `/me`.
2. Ẩn Apple đến khi BE sẵn sàng.
3. Checkout production đã giới hạn bank transfer/SePay ở source; còn widget/device UAT.
4. UAT progress cross-device + offline cache/retry/conflict.
5. Feature-flag/loại mock learner, Admin, Mentor khỏi release.
6. Package ID + cleartext policy đã sửa source; còn release signing thật và OAuth platform (Android SHA / iOS schemes).
7. CI ổn định: analyze / test / build Android+iOS (không phụ thuộc telemetry sandbox).
8. Video HLS, background/resume, payment lifecycle, deep link trên thiết bị thật.

### 8.8. Store readiness còn thiếu

- Android signing/AAB; iOS certificates/provisioning/TestFlight.
- Privacy manifest / data safety; account deletion; support URL.
- Notification permission UX.
- Crash reporting, analytics consent, release channel.
- Accessibility, low-end device, network throttling, tablet.

## 9. Ma trận đồng bộ đa nền tảng

| Domain | BE | Web | Admin | Mobile | Kết luận |
|---|---|---|---|---|---|
| Auth/session | Có | Có, Google đang UAT | Có | Email OK; Google source đã đúng `/auth/google` + `idToken` + `/me`; Apple thiếu BE; MoMo chỉ debug | **Chờ OAuth config/device UAT** |
| Course catalog | Có | Có | Authoring có | Có | **MVP** |
| Cart/order | Có | Có | Operations có | Checkout mặc định chỉ QR/SePay; gateway khác còn code dự phòng | **Source đạt Phase 1, chờ UAT** |
| SePay | Có | Có | Exception ops có | QR + poll có | **Code done, chờ UAT** |
| Coupon | Có | Checkout có | Manager có | Preview + apply checkout | **Code done, cần UAT** |
| Enrollment | Có | Có | Learner/repair có | Có | **MVP** |
| Progress | Có | Có | Report có | BE SoT + offline cache prefs | **Code done, cần cross-device UAT** |
| Quiz | Có | Take có | Builder/attempts | Take/submit API + UI | **Code done, cần UAT** |
| Assignment | Có | Text/URL | Builder/grading | Text/URL submit API + UI | **MVP, cần file/status UAT** |
| Linked post | Có | Có | Có | Chưa xác nhận | **Web/Admin đạt** |
| Q&A/note/bookmark | Có | Có | Chưa có ops sâu | API + lesson UI | **Web/Mobile code done** |
| Nhóm chat khóa học | API + DB + enrollment ACL | Panel trong `/learn`, light/dark | Có quyền mentor/admin qua course ACL; chưa có màn moderation riêng | Panel cũ đã nối API thật | **MVP code done; cần migration + multi-user UAT, realtime hiện poll 5s** |
| Certificate | Có | Profile có | Manager có | Hub `certificates/mine`; XP/badge vẫn mock | **Certificate code done; gamification mock** |
| Leads | Có | Có | CRM MVP | Không bắt buộc | **MVP** |
| Moderation | Có | Thiếu report flow | Comment moderation có | Chưa đủ | **Partial** |
| Notification | Có | Thiếu center/preferences | Inbox/composer cơ bản | Local notification | **Chưa đồng bộ** |
| Analytics | Có | Event plan thiếu | Dashboard/analytics có | Mock stats / Hub mock | **Admin có, learner telemetry thiếu** |

## 10. Backlog ưu tiên

### P0 — trước production/public sale

| ID | Hạng mục |
|---|---|
| BE-01 | ~~Sửa contract cookie Google để BE production build pass~~ **DONE** |
| DEP-01 | ~~Chạy service `app` với `NODE_ENV=production`~~ **DONE** |
| SEC-01 | Untrack/gitignore env **DONE**; **rotate secrets + rà Git history** còn lại |
| DB-01 | Migration additive ops/learning extras **đã thêm SQL**; review/snapshot chain còn |
| DB-02 | Test database empty/upgrade/rollback |
| PAY-02 | Staging E2E webhook + polling concurrency/mismatch/duplicate/expiry |
| QA-01 | E2E purchase → paid → enrollment → learn → certificate |
| MOB-01 | Integration/UAT Google Mobile với OAuth Android/iOS thật; contract source đã sửa |
| MOB-02 | Widget/device UAT xác nhận production chỉ có QR bank transfer/SePay |
| MOB-03 | Package ID + cleartext release **DONE**; signing keystore thật + OAuth SHA/iOS còn |
| OPS-01 | Health/logging/alert/backup checklist |

### P1 — hoàn thiện vận hành

| ID | Hạng mục |
|---|---|
| ADM-01 | Bank account management và reconciliation/export |
| ADM-02 | Enforce publish readiness server-side |
| ADM-03 | Lead assignee/activity **DONE**; còn dedup/export |
| ADM-04 | Notification audience/schedule/delivery log |
| WEB-01 | Certificate download/share/public verify |
| WEB-02 | Invoice/VAT workflow |
| WEB-03 | Learner notification center/preferences |
| MOB-04 | UAT progress Web ↔ Mobile (offline/retry/đổi thiết bị); loại mock engagement/Admin/Mentor khỏi release learner |
| QA-02 | Accessibility/responsive/browser/device regression suite |

### P2 — tăng trưởng

- Wishlist server dùng chung Web/Mobile.
- Cohort/live session/calendar thật.
- Transcript/subtitle/search trong lesson.
- Community/report/anti-spam nâng cao.
- Recommendation và learning analytics từ event thật.
- Gamification/leaderboard có rule, anti-cheat và server source of truth.

### Deferred — chưa làm lúc này

- Refund request trên Web.
- Admin refund approval/workflow.
- Atomic/idempotent refund transaction và revoke enrollment.
- Refund policy/notification/reconciliation. Chỉ đưa lại vào backlog khi có quyết định mở phạm vi refund.

## 11. Roadmap đề xuất

### Wave 0 — Stabilize

1. ~~Fix BE Google cookie build regression.~~ **DONE**
2. ~~Chốt production Compose `NODE_ENV`.~~ **DONE** (`app` override)
3. Untrack env **DONE**; rotate secrets + Git history còn lại.
4. Migration SQL extras **đã thêm**; empty/upgrade rehearsal còn lại.
5. Đưa BE/Web/Admin/Mobile checks vào CI.

### Wave 1 — Prove commerce-to-learning

1. Staging SePay E2E và reconciliation.
2. Purchase → enrollment → progress → certificate.
3. Coupon concurrency/max-use.
4. Admin payment exception/reconciliation/audit UAT (không gồm refund).

### Wave 2 — Mobile parity (learning API đã tiến; auth/checkout/store còn P0)

1. ~~Progress BE SoT + secure token + quiz/assignment/extras/certificate API~~ (code done — cần UAT).
2. ~~Google path/body + hydrate `/me`; checkout mặc định chỉ QR/SePay~~ (source done — cần OAuth/device UAT).
3. ~~Coupon + order history + account/password~~ (source done — cần UAT).
4. Ẩn Apple đến khi BE sẵn sàng; test khóa gateway production.
5. UAT progress cross-device / offline / retry; loại mock learner production path.
6. ~~Package ID + cleartext off~~ **DONE**; signing keystore thật + OAuth SHA/iOS còn.

### Wave 3 — Operations and growth

1. Notifications, moderation và lead CRM nâng cao.
2. Invoice/wishlist (refund tiếp tục deferred).
3. Cohort/live/community.
4. Analytics/recommendation/gamification thật.

## 12. Definition of Done production-ready

- Không còn tracked secrets có giá trị; secrets đã rotate.
- Production Compose chạy `NODE_ENV=production`, không dùng mật khẩu fallback mặc định.
- Database dựng và upgrade hoàn toàn bằng migration đã rehearsal.
- BE/Web/Admin/Mobile build, type-check/analyze và tests pass trong CI.
- Payment chỉ paid khi BE xác nhận; webhook/poll không cấp trùng enrollment.
- Nếu refund được đưa lại vào phạm vi sau này: phải atomic/idempotent và thu hồi đúng quyền học.
- Web/Mobile dùng chung server progress source of truth.
- Course publish bị chặn server-side khi chưa đủ readiness.
- Quiz/assignment/certificate chạy end-to-end và quan sát được ở Admin.
- Có reconciliation, audit, logging, metrics, alerting, backup/restore và queue retry/dead-letter.
- Auth Google/email/session được test đa trình duyệt/thiết bị và qua reverse proxy HTTPS.
- Mock/demo không còn trên production learner/admin paths.
- Legal/privacy/account deletion và mobile store requirements hoàn tất.

## 13. Thứ tự hành động ngay

> **Hướng dẫn từng bước (lệnh PowerShell, checklist, OAuth, keystore, migration):**
>
> [`docs/huong-dan-van-hanh-ngay.md`](./huong-dan-van-hanh-ngay.md)

1. ~~Sửa lỗi compile cookie Google trong BE.~~ **DONE**
2. ~~Override production `NODE_ENV` trong Compose.~~ **DONE**
3. Rotate secrets (JWT/email/S3/SePay) và rà Git history sau khi untrack env.
4. Rehearsal migration `20260722120000_…` trên DB rỗng + upgrade staging; smoke API.
5. Chạy staging purchase-to-learn/certificate E2E.
6. Mobile: OAuth SHA + device UAT Google; signing keystore thật; UAT QR/SePay + coupon/orders; UAT progress Web↔Mobile; loại mock learner release; iOS schemes.
7. Hoàn thiện reconciliation/bank account Admin.
8. Dọn route/template/mock production.
9. Thiết lập CI và observability trước public launch.
