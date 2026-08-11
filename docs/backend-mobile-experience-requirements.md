# Backend cần đáp ứng gì để Mobile mang lại trải nghiệm tối ưu

> Cập nhật: 28/07/2026 — đánh giá lại sau khi bổ sung nền tảng Mobile Experience  
> Phạm vi: Backend API, dữ liệu và vận hành phục vụ `mobile-app`  
> Mục tiêu: xác định những năng lực backend cần có để ứng dụng nhanh, ổn định, cá nhân hóa, học liên tục trên nhiều thiết bị và đủ an toàn để phát hành production.
>
> Trạng thái deploy VPS và checklist go/no-go xem tại
> [`vps-deploy-readiness-2026-07-28.md`](./vps-deploy-readiness-2026-07-28.md).

## 1. Kết luận điều hành

Mobile không chỉ cần “có API để hiển thị dữ liệu”. Một trải nghiệm tốt yêu cầu backend đồng thời đáp ứng năm đặc tính:

1. **Nhanh:** màn hình đầu có dữ liệu trong khoảng 1–2 giây trên mạng di động bình thường.
2. **Ổn định:** request có thể retry mà không tạo đơn hàng, enrollment hay progress trùng.
3. **Liên tục:** người dùng đổi thiết bị hoặc chuyển Web ↔ Mobile vẫn thấy đúng tiến độ.
4. **Cá nhân hóa:** onboarding, lịch sử học và hành vi được dùng để tạo lộ trình phù hợp.
5. **Có thể vận hành:** lỗi, độ trễ, tỷ lệ hoàn thành và funnel đều đo được.

Backend hiện đã có nền tảng tương đối rộng cho auth, catalog, enrollment, progress, video, quiz, assignment, learning extras, chat, cart, order, payment và certificate. Sau đợt bổ sung Mobile Experience, source cũng đã có refresh-token rotation, device session, bootstrap, idempotency middleware, progress event sync, device/push schema, XP/streak và flashcard schema/service.

Khoảng trống chính không còn là “chưa có code nền tảng”, mà là **chưa hoàn tất wiring, độ bền giao dịch và UAT production**:

- Mobile chưa sử dụng `/api/mobile/bootstrap`; một số dữ liệu bootstrap còn placeholder (`cart.total`, `completedMinutes`, min version và feature flags).
- Progress outbox mobile mới queue event `completed`; chưa queue started/heartbeat/position và chưa pull delta changes.
- Push outbox hiện chỉ đánh dấu `sent`; chưa gửi FCM/APNs thật và mobile chưa đăng ký push token vào API device.
- Flashcard/XP/streak đã có nền tảng backend nhưng nhiều màn mobile vẫn đọc mock/local.
- Idempotency đã phủ các mutation quan trọng, nhưng middleware chưa khóa request đang xử lý nên vẫn có race khi hai request cùng key đến đồng thời.
- Cursor progress chỉ dựa vào timestamp, có nguy cơ bỏ sót khi nhiều row trùng thời gian biên.
- Onboarding recommendation vẫn rule-based; metadata khóa học và conversion analytics cần được vận hành, không chỉ có schema.
- Thiếu integration test, mobile telemetry, crash correlation và SLO đã được đo trên staging.

### 1.1. Đánh giá lại theo bốn mức hoàn thành

| Mức | Ý nghĩa |
|---|---|
| Schema | Có migration/table nhưng chưa chứng minh service chạy |
| Code | Có route/service/client source |
| Wired | Mobile production path thực sự gọi và xử lý |
| Verified | Đã migration rehearsal, integration test và UAT thiết bị thật |

Không nên báo một hạng mục “hoàn thành” chỉ vì đạt mức Schema hoặc Code.

## 2. Trải nghiệm mục tiêu

### 2.1. Lần mở app đầu tiên

Người dùng phải có thể:

- Chọn ngôn ngữ và hoàn thành onboarding khi chưa đăng nhập.
- Nhận 2–3 khóa học thật, đang published, phù hợp với câu trả lời.
- Đăng ký/đăng nhập mà không mất câu trả lời onboarding.
- Quay lại đúng kết quả recommendation sau khi xác thực.
- Không bị màn hình trắng nếu API recommendation lỗi; mobile được phép dùng fallback đã cache.

### 2.2. Mở app hằng ngày

Một lần bootstrap nên trả đủ:

- User và trạng thái phiên.
- Khóa đang học, bài tiếp theo và phần trăm tiến độ.
- Daily goal/streak.
- Số thông báo chưa đọc.
- Giỏ hàng tóm tắt.
- Feature flags và cấu hình tối thiểu.

Không nên yêu cầu mobile gọi tuần tự 6–10 endpoint trước khi dựng được Home.

### 2.3. Trong lúc học

- Video bắt đầu nhanh, resume đúng vị trí.
- Mark progress không bị mất khi mạng chập chờn.
- Quiz/assignment không submit hai lần khi người dùng bấm lại.
- Notes/bookmarks/Q&A hiển thị optimistic nhưng cuối cùng phải đồng bộ về server.
- Khi token hết hạn, app refresh âm thầm thay vì đẩy người dùng ra màn login.

### 2.4. Sau khi học

- Web và Mobile thấy cùng tiến độ.
- Backend cập nhật streak, XP, achievement và certificate đúng một lần.
- Push reminder dựa trên timezone và lịch người dùng đã chọn.
- Recommendation tiếp theo thay đổi theo hành vi học thật, không chỉ theo onboarding ban đầu.

## 3. Hiện trạng theo năng lực

| Năng lực | Hiện trạng | Đánh giá cho Mobile |
|---|---|---|
| Email/password, Google, `/me` | Có refresh rotation + device session; mobile có auto refresh | **Code/Wired**, cần migration + reuse/concurrency UAT |
| Catalog/course detail | Đã có | Cần payload mobile, cache và pagination nhất quán |
| Onboarding recommendation | Endpoint rule-based + event analytics | **Code**, cần metadata governance và conversion dashboard |
| Enrollment | Có idempotency middleware | **Code**, cần concurrency/integration test và entitlement UAT |
| Progress | Batch sync, dedupe event, delta endpoint; mobile có outbox complete | **Partial Wired**, thiếu position/heartbeat, delta pull và test conflict |
| Video playback | Đã có | Cần resume position, signed URL TTL và QoE telemetry |
| Quiz/assignment | Có idempotency middleware | Cần mobile gửi key nhất quán, autosave và submission status |
| Note/bookmark/Q&A | Đã có | Cần delta sync, timestamps và optimistic reconciliation |
| Chat khóa học | Polling | Dùng được MVP; nên nâng WebSocket/push event |
| Cart/order/SePay | Order create có idempotency | Cần payment/entitlement concurrency UAT |
| Certificate | Đã có | Cần verify/share deep link |
| Mobile bootstrap | Backend route/service đã có | **Code only**; mobile chưa dùng, payload còn placeholder |
| Notifications | Device/preferences/outbox đã có; delivery là stub | Chưa có FCM/APNs thật và mobile device registration |
| XP/streak/daily check-in | Có schema/service backend | Chưa thay toàn bộ mock mobile; cần timezone UAT |
| Badge/achievement/leaderboard | Chưa thấy read model hoàn chỉnh | Vẫn thiếu server source of truth đầy đủ |
| Flashcard | Có schema và API due/review/stats | Mobile vẫn dùng mock, cần wiring và seed/content ops |
| Analytics mobile | Chưa đầy đủ | Không đo được funnel và chất lượng trải nghiệm |

## 4. Các yêu cầu backend bắt buộc

### 4.1. Auth và phiên đăng nhập

### Backend cần có

- Access token sống ngắn, ví dụ 15–30 phút.
- Refresh token rotation, lưu hash refresh token thay vì plaintext.
- Mỗi thiết bị là một session riêng, có:
  - `sessionId`
  - `userId`
  - `deviceId`
  - platform/app version
  - thời gian tạo, lần sử dụng gần nhất, thời gian hết hạn
  - trạng thái revoke
- Endpoint refresh và quản lý thiết bị:

```http
POST /api/user/refresh
GET  /api/user/sessions
DELETE /api/user/sessions/:sessionId
DELETE /api/user/sessions/others
```

- Logout một thiết bị không làm đăng xuất tất cả thiết bị, trừ khi người dùng chọn.
- Sau đổi mật khẩu hoặc thay đổi quyền quan trọng, backend có khả năng revoke toàn bộ session.
- Google/Apple token phải được verify ở backend; không tin profile do client gửi lên.

### Tiêu chí nghiệm thu

- Token hết hạn giữa lúc học không làm mất thao tác.
- Refresh token bị reuse phải bị phát hiện và revoke token family.
- Không log access token, refresh token hoặc authorization header.

### 4.2. Mobile bootstrap API

Nên bổ sung:

```http
GET /api/mobile/bootstrap
```

Response đề xuất:

```json
{
  "serverTime": "2026-07-28T04:00:00Z",
  "user": {},
  "continueLearning": {
    "courseId": "uuid",
    "lessonId": "uuid",
    "progress": 0.42,
    "resumePositionSeconds": 318
  },
  "daily": {
    "goalMinutes": 10,
    "completedMinutes": 4,
    "streak": 7
  },
  "notifications": {
    "unreadCount": 3
  },
  "cart": {
    "itemCount": 1,
    "total": 499000
  },
  "featureFlags": {},
  "minSupportedVersion": {
    "android": "1.2.0",
    "ios": "1.2.0"
  }
}
```

Yêu cầu:

- Các phần độc lập được query song song ở backend.
- Cho phép trả partial response nếu một domain phụ bị lỗi.
- Có `serverTime` để mobile hiệu chỉnh streak, deadline và countdown.
- Payload mục tiêu dưới 100 KB sau gzip.
- P95 dưới 500 ms khi cache ấm.

### 4.3. Catalog và recommendation

### Metadata khóa học bắt buộc

Mỗi khóa published cần có dữ liệu có cấu trúc:

- `level`
- category slug
- nhiều tag chuẩn hóa
- language
- estimated duration
- lesson count
- learning outcomes
- target profiles
- supported purposes
- skills/interests
- rating statistics
- enrollment count
- thumbnail variants

Không nên suy luận recommendation chủ yếu từ title/description tự do.

### Recommendation

Endpoint hiện tại:

```http
POST /api/courses/recommendations
```

Cần phát triển thêm:

- Version thuật toán trong response.
- Lưu recommendation impression/click/enroll để đánh giá chất lượng.
- Loại course đã sở hữu hoặc đã hoàn thành khỏi nhóm acquisition.
- Có lý do giải thích cho người dùng.
- Có fallback course được cấu hình trên backend thay vì hard-code mobile.
- Cho phép cập nhật onboarding sau này:

```http
GET /api/user/onboarding
PUT /api/user/onboarding
```

### Chỉ số cần đo

- Recommendation impression → course detail.
- Detail → enroll/purchase.
- Tỷ lệ bắt đầu bài đầu tiên.
- Tỷ lệ hoàn thành tuần đầu.
- Tỷ lệ không có recommendation.

### 4.4. Progress và offline sync

Đây là năng lực quan trọng nhất của ứng dụng học tập.

### Hợp đồng dữ liệu

Mỗi progress event cần:

- `eventId` UUID do client tạo.
- `deviceId`.
- `courseId`, `lessonId`.
- loại event: started, heartbeat, position, completed.
- `occurredAt` theo thời gian client.
- `clientSequence`.
- `positionSeconds` nếu là video.
- `contentVersion` hoặc lesson revision.

Endpoint batch đề xuất:

```http
POST /api/progress/sync
```

```json
{
  "deviceId": "device-uuid",
  "events": [
    {
      "eventId": "event-uuid",
      "lessonId": "lesson-uuid",
      "type": "position",
      "positionSeconds": 318,
      "occurredAt": "2026-07-28T03:59:00Z",
      "clientSequence": 24
    }
  ]
}
```

Backend phải:

- Deduplicate theo `eventId`.
- Xử lý batch transactionally hoặc trả kết quả từng item.
- Không giảm progress completed thành incomplete.
- Dùng quy tắc conflict rõ ràng, không chỉ “last write wins” mù quáng.
- Trả checkpoint mới để mobile xóa outbox local an toàn.
- Cho phép delta pull:

```http
GET /api/progress/changes?cursor=<opaque-cursor>
```

### Video resume

- Lưu resume position có throttle, ví dụ tối đa mỗi 10–15 giây.
- Không đánh dấu complete chỉ dựa vào một heartbeat cuối.
- Có quy tắc completion theo nội dung: phần trăm xem, quiz pass hoặc thao tác hoàn tất.

### 4.5. Idempotency cho các thao tác quan trọng

Các endpoint sau phải nhận header:

```http
Idempotency-Key: <uuid>
```

Áp dụng tối thiểu cho:

- Tạo order.
- Submit quiz.
- Submit assignment.
- Enroll course.
- Apply coupon nếu tạo reservation.
- Mark lesson complete.
- Tạo comment/message trong trường hợp mobile retry.

Backend lưu key, request fingerprint, response và expiry. Cùng key/cùng payload trả lại response cũ; cùng key/khác payload trả `409`.

### 4.6. Notification và nhắc học

### Data model cần có

`user_devices`:

- device UUID
- user ID
- FCM/APNs token
- platform
- app version
- locale
- timezone
- push permission/status
- last seen
- token invalidated time

`notification_preferences`:

- daily reminder enabled/time
- marketing opt-in
- learning updates
- course/chat activity
- quiet hours

### Endpoint

```http
POST   /api/user/devices
PATCH  /api/user/devices/:deviceId
DELETE /api/user/devices/:deviceId
GET    /api/notifications
POST   /api/notifications/:id/read
POST   /api/notifications/read-all
```

### Pipeline

- Queue riêng cho push delivery.
- Retry có backoff.
- Xóa/disable FCM token không hợp lệ.
- Deep link payload dùng route được allowlist.
- Deduplicate notification theo business event.
- Gửi theo timezone của người dùng.
- Theo dõi sent, delivered, opened và conversion.

### 4.7. Gamification và daily learning

Nếu XP/streak/badge chỉ nằm local, người dùng có thể mất dữ liệu hoặc thấy khác nhau giữa thiết bị.

Backend cần là source of truth cho:

- XP ledger bất biến.
- Daily goal và số phút học.
- Streak theo timezone.
- Badge/achievement rule và unlock event.
- Leaderboard theo kỳ.
- Daily tasks.

Nên dùng ledger:

```text
xp_events(id, user_id, source_type, source_id, points, occurred_at)
```

Ràng buộc unique theo `(user_id, source_type, source_id)` để không cộng XP hai lần.

Leaderboard nên là read model/cache; không tính lại toàn bộ từ transaction trong mỗi request.

### 4.8. Flashcard và ôn tập

Backend cần lưu:

- Deck/card version.
- Trạng thái card theo user.
- Lần ôn gần nhất.
- Lần ôn tiếp theo.
- Ease/difficulty, interval, lapse count.
- Event review có `eventId` để sync offline.

API cần hỗ trợ:

```http
GET  /api/flashcards/due?limit=20
POST /api/flashcards/reviews/sync
GET  /api/flashcards/stats
```

Mobile có thể tính UI tức thời, nhưng lịch ôn cuối cùng phải được server xác nhận.

### 4.9. Thanh toán và entitlement

- Tạo order phải idempotent.
- Giá, coupon và tổng tiền luôn do backend tính.
- Mobile không được quyết định “đã thanh toán”.
- Payment polling trả trạng thái chuẩn:
  - pending
  - paid
  - expired
  - cancelled
- Sau payment success, enrollment/entitlement phải được tạo trong cùng workflow có khả năng retry.
- Có endpoint tổng hợp:

```http
GET /api/orders/:id/status
```

Response nên trả cả payment và entitlement để mobile biết lúc nào mở khóa nội dung.

- Webhook SePay phải verify, deduplicate và lưu raw event phục vụ đối soát.

### 4.10. Media và video

- Signed playback URL có TTL đủ dài cho một phiên xem.
- Endpoint playback trả expiry để mobile chủ động refresh.
- Có nhiều rendition/bitrate để thích ứng mạng.
- Hỗ trợ HTTP range.
- Thumbnail có nhiều kích thước để tránh tải ảnh lớn trên list.
- Trả duration và kích thước media trong metadata.
- Ghi nhận QoE:
  - startup time
  - buffering count/duration
  - playback error
  - rendition/connection type

### 4.11. Chat và realtime

Polling 5 giây phù hợp MVP nhưng tốn pin và dữ liệu.

Mục tiêu tiếp theo:

- WebSocket authenticated.
- Resume bằng cursor/event ID sau khi mất mạng.
- Push notification khi app background.
- Message creation idempotent bằng client message ID.
- Pagination dạng cursor theo thời gian + ID.
- Server moderation, rate limit và banned-word policy.
- Không trả toàn bộ lịch sử trong mỗi lần reconnect.

## 5. Chuẩn API chung cho Mobile

### 5.1. Response envelope

Thống nhất:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "serverTime": "2026-07-28T04:00:00Z"
  }
}
```

Lỗi:

```json
{
  "error": {
    "code": "COURSE_NOT_AVAILABLE",
    "message": "Khóa học hiện không khả dụng",
    "details": {},
    "retryable": false
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

Mobile nên xử lý theo `code`, không parse nội dung `message`.

### 5.2. Pagination

- Dùng cursor cho feed, notification, chat và lịch sử thay đổi.
- Dùng page/limit cho catalog quản trị hoặc danh sách ít thay đổi.
- Cursor phải opaque.
- Response luôn có `hasMore` và `nextCursor`.

### 5.3. Cache

- Public catalog/media metadata có `ETag` hoặc `Last-Modified`.
- Hỗ trợ `If-None-Match` và trả `304`.
- Dữ liệu user nhạy cảm dùng `Cache-Control: private, no-store` khi phù hợp.
- Mobile bootstrap có version/hash từng section để hỗ trợ delta refresh.

### 5.4. Versioning và tương thích

- Không xóa/đổi nghĩa field mà không có giai đoạn deprecation.
- Field mới nên additive.
- Backend nhận header app metadata:

```http
X-App-Platform: android
X-App-Version: 1.4.0
X-Device-Id: <uuid>
X-Locale: vi-VN
X-Timezone: Asia/Ho_Chi_Minh
```

- Có remote config/minimum supported version, nhưng force update chỉ dùng khi thực sự cần.

### 5.5. Timeout và retry

Backend cần phân loại lỗi:

- `retryable=true`: timeout upstream, temporary unavailable.
- `retryable=false`: validation, unauthorized, forbidden.

Mobile chỉ tự retry GET/idempotent request và mutation có idempotency key. Backend nên trả `Retry-After` cho `429` và `503`.

## 6. Hiệu năng và SLO đề xuất

| Nhóm endpoint | P95 mục tiêu | Availability |
|---|---:|---:|
| Auth refresh / me | ≤ 300 ms | 99.95% |
| Mobile bootstrap | ≤ 500 ms | 99.9% |
| Catalog list/detail | ≤ 500 ms | 99.9% |
| Progress write/sync | ≤ 400 ms | 99.95% |
| Quiz/assignment submit | ≤ 800 ms | 99.9% |
| Cart/order status | ≤ 500 ms | 99.95% |
| Recommendation | ≤ 800 ms | 99.9% |
| Chat send | ≤ 300 ms | 99.9% |

Các mục tiêu trên đo tại API gateway, không tính thời gian truyền internet đến thiết bị.

## 7. Observability cần có

Mỗi request cần:

- `requestId`/trace ID trả về client.
- user ID đã hash hoặc internal ID; không log PII không cần thiết.
- route template, status code, duration.
- app version, platform và device class ở mức an toàn.
- upstream timing cho DB, Redis, S3/MinIO, email, SePay.

Dashboard tối thiểu:

- Error rate theo route và app version.
- P50/P95/P99 latency.
- Refresh failure và forced logout.
- Progress sync backlog/conflict.
- Video playback error.
- Order/payment mismatch.
- Push delivery/open rate.
- Onboarding funnel và recommendation conversion.

Crash report mobile phải gửi kèm `requestId` gần nhất để truy vết xuyên client–backend.

## 8. Bảo mật và quyền riêng tư

- TLS bắt buộc; Android release không cho cleartext.
- Rate limit theo IP, user và device tùy endpoint.
- Validate toàn bộ body/query bằng schema.
- Course access kiểm tra ở backend cho mọi video, attachment, quiz và assignment.
- Signed URL không cấp quyền vượt enrollment.
- Onboarding age range dùng cho cá nhân hóa, không dùng để tạo quyết định nhạy cảm.
- Có API export/delete dữ liệu người dùng.
- Push payload không chứa thông tin nhạy cảm.
- Secrets chỉ nằm ở secret manager/environment, không đóng gói trong mobile.
- Audit log cho thay đổi role, enrollment thủ công, payment và moderation.

## 9. Thứ tự triển khai đề xuất

### P0 — Trước khi phát hành rộng

1. Rehearsal migration `20260728140000_mobile_experience` trên DB rỗng và DB staging upgrade; kiểm tra rollback/recovery.
2. Sửa race idempotency bằng cơ chế reserve/in-progress hoặc transaction; test hai request đồng thời cho order, enrollment, quiz và assignment.
3. Hoàn tất progress sync mobile: position/heartbeat outbox, retry khi reconnect/app resume, delta pull và cursor `(processedAt, eventId)`.
4. Gắn `/api/mobile/bootstrap` vào Home; tính `cart.total` và `completedMinutes` thật, chuyển min version/feature flags sang config.
5. Tích hợp FCM/APNs thật; mobile đăng ký/refresh/xóa device token; outbox có retry/backoff và invalid-token handling.
6. Xác nhận refresh-token rotation/device session bằng integration test: concurrent refresh, token reuse, revoke một thiết bị và revoke toàn bộ.
7. UAT thật cho OAuth, payment, video và Web ↔ Mobile progress.

### P1 — Tăng retention và tốc độ

1. Thay mock XP/streak/daily trên mobile bằng API đã có.
2. Nối mobile flashcard vào API due/review/stats, bổ sung seed/content workflow.
3. Hoàn thiện badge/achievement/leaderboard server source of truth.
4. Cursor pagination và ETag/delta sync cho feed, notification và chat.
5. Recommendation analytics dashboard và metadata governance.
6. Mobile telemetry, request correlation và alert theo app version.

### P2 — Tối ưu quy mô

1. WebSocket chat/realtime event.
2. Recommendation dựa trên hành vi và cohort.
3. Adaptive video/QoE dashboard.
4. Remote config và experimentation/A-B testing.
5. Read model/cache chuyên biệt cho Home và leaderboard.

## 10. Definition of Done cho một API Mobile

Một endpoint chưa được xem là hoàn tất nếu mới chỉ “gọi được”. Mỗi API mobile cần:

- Có schema request/response và error code.
- Có auth/permission rõ ràng.
- Có timeout, rate limit và giới hạn payload.
- Có quy tắc retry/idempotency.
- Có pagination/cache nếu là list.
- Có migration và rollback/recovery plan nếu đổi DB.
- Có unit/integration test cho happy path và lỗi quan trọng.
- Có request ID, metrics và log an toàn.
- Có UAT trên mạng chậm, mất mạng, token hết hạn và thao tác lặp.
- Có kiểm tra tương thích với ít nhất phiên bản mobile đang production.

## 11. Checklist nghiệm thu trải nghiệm end-to-end

- [ ] Mở app trên 4G: Home có nội dung hữu ích trong tối đa 2 giây.
- [ ] Token hết hạn giữa phiên học: tự refresh, không mất màn hình hiện tại.
- [ ] Mất mạng khi mark complete: kết nối lại đồng bộ đúng một lần.
- [ ] Bấm tạo order hai lần: chỉ có một order.
- [ ] Đổi thiết bị: progress, bookmark, note và streak khớp.
- [ ] Payment thành công: khóa học mở mà không cần logout/login.
- [ ] Onboarding API lỗi: app vẫn có fallback và không crash.
- [ ] Push mở đúng deep link và không mở route ngoài allowlist.
- [ ] Course bị unpublish trong khi app đang cache: quyền truy cập được xử lý rõ ràng.
- [ ] Backend lỗi: mobile nhận error code có thể hiển thị/retry đúng.
- [ ] Có thể truy từ crash mobile sang request backend bằng request ID.

## 12. Kết quả mong đợi

Khi các mục P0 và P1 được hoàn thành, mobile sẽ chuyển từ mô hình “UI gọi nhiều API riêng lẻ” sang một ứng dụng học tập có trạng thái bền vững:

- Người dùng ít bị đăng xuất.
- Mở app nhanh hơn.
- Không mất tiến độ khi mạng yếu.
- Thanh toán và submit không bị trùng.
- Dữ liệu nhất quán giữa Web và Mobile.
- Notification và daily loop tạo retention thật.
- Recommendation được đo và cải thiện bằng dữ liệu.
- Đội vận hành có thể phát hiện lỗi trước khi người dùng phản ánh.
