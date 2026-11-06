# Lưu ý khi tích hợp ứng dụng khác với `api.gats.vn`

> Cập nhật theo source BE ngày 26/07/2026. Tài liệu này là checklist tích hợp,
> không thay thế API schema. Khi có khác biệt, source trong
> `src/common/paths`, `src/routes` và `src/models` là nguồn sự thật.

## 1. Base URL và quy ước chung

```text
Production API base: https://api.gats.vn/api
Health check:        https://api.gats.vn/health/live
Readiness check:     https://api.gats.vn/health/ready
```

- Hầu hết endpoint nằm dưới `/api`. Không nối thành `/api/api/...`.
- Health check là ngoại lệ, nằm dưới `/health`, không có prefix `/api`.
- Gửi JSON với `Content-Type: application/json`, trừ các API upload được ghi
  rõ là `multipart/form-data` hoặc presigned upload.
- ID của phần lớn resource nghiệp vụ như course, lesson, media, video là UUID.
  ID user và một số bảng quản trị là số nguyên. Không ép tất cả ID về cùng một
  kiểu.
- Thời gian trong JSON là chuỗi ISO-8601. Client nên parse theo timezone thay vì
  cắt chuỗi để hiển thị.
- Có thể gửi `X-Request-Id` (tối đa 128 ký tự). BE luôn trả lại
  `X-Request-Id`; nên log giá trị này để đối soát lỗi.

Ví dụ:

```bash
curl 'https://api.gats.vn/api/courses?page=1&limit=20' \
  -H 'Accept: application/json' \
  -H 'X-Request-Id: mobile-01HXYZ'
```

## 2. Authentication: web khác mobile/server

### Mobile, desktop hoặc server-to-server

Đăng nhập:

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "..."
}
```

Response login chứa:

```json
{
  "message": "Logged in.",
  "token": "<jwt>",
  "expiresAt": "<thời điểm hết hạn>"
}
```

Lưu `token` an toàn và gửi ở các request cần đăng nhập:

```http
Authorization: Bearer <jwt>
```

Prefix phải đúng chữ hoa/thường và có dấu cách: `Bearer `. BE hiện không có
refresh-token endpoint. Khi JWT hết hạn, app phải đưa người dùng đăng nhập lại.

### Web chạy trong browser

Login cũng set cookie `access_token` với các thuộc tính:

- `HttpOnly`
- `Secure` ở production
- `SameSite=Lax`
- `Path=/`
- hạn 7 ngày
- có thể dùng domain cha `.gats.vn` để SSO giữa các subdomain

Client JavaScript không đọc được cookie này. Browser app gọi trực tiếp API phải
bật credential:

```ts
fetch('https://api.gats.vn/api/user/me', {
  credentials: 'include',
});
```

```ts
axios.create({
  baseURL: 'https://api.gats.vn/api',
  withCredentials: true,
});
```

Nếu app web không nằm trên domain được BE allowlist, cookie có thể vẫn tồn tại
nhưng CORS/Origin guard sẽ chặn request. Cần thêm **origin chính xác** của app
vào cấu hình `FRONTEND_URL` trên BE, ví dụ
`https://partner.gats.vn`; không truyền path và không dùng wildcard.

Các mutation từ browser (`POST`, `PUT`, `PATCH`, `DELETE`) có `Origin` không
hợp lệ trả `403 Request origin is not allowed`. Mobile/native và
server-to-server thường không gửi `Origin`, nên không bị kiểm tra theo nhánh
này. Không giả lập hoặc tự thêm header `Origin` ở native app.

### Thứ tự token và session

- Nếu request có cả cookie và Bearer token, BE ưu tiên cookie.
- BE cho phép đăng nhập đồng thời trên nhiều thiết bị.
- `POST /api/user/logout` xóa cookie/session hiện tại nhưng JWT đã phát vẫn được
  xác thực bằng chữ ký và hạn dùng. Không coi logout là cơ chế thu hồi ngay mọi
  Bearer token.
- `POST /api/user/change-password` và reset password xóa session lưu trong DB,
  nhưng theo cách xác thực hiện tại JWT đã phát vẫn có thể còn dùng đến khi hết
  hạn. App nhạy cảm cần lưu ý giới hạn này.

Các endpoint auth quan trọng:

| Method | Path | Auth | Ghi chú |
| --- | --- | --- | --- |
| `POST` | `/api/user/register` | Public | Đăng ký |
| `POST` | `/api/user/login` | Public | Trả JWT và set cookie |
| `POST` | `/api/user/auth/google` | Public | Body có `idToken` |
| `GET` | `/api/user/me` | Required | Lấy hồ sơ hiện tại |
| `PUT` | `/api/user/me` | Required | Cập nhật hồ sơ |
| `POST` | `/api/user/logout` | Required | Web cần `credentials: include` |
| `POST` | `/api/user/forgot-password` | Public | Rate limit 8 request/15 phút |
| `POST` | `/api/user/reset-password` | Public | Reset bằng token |
| `POST` | `/api/user/change-password` | Required | Đổi mật khẩu |

## 3. Public, optional-auth và protected API

Một số API đọc public dùng **optional auth**. Nên gửi token nếu đã đăng nhập vì
response/quyền truy cập có thể khác với khách:

- `GET /api/courses`
- `GET /api/courses/slug/:slug`
- `GET /api/courses/:id`
- `GET /api/courses/:courseId/curriculum`
- `GET /api/categories`
- `GET /api/courses/:courseId/videos/:videoId/playback`
- `GET /api/courses/:courseId/lessons/:lessonId/video`

Các API cart, order, enrollment, progress, quiz, assignment, note, bookmark,
notification, chat và certificate cá nhân đều cần đăng nhập. API quản trị còn
kiểm tra role/permission; có JWT hợp lệ chưa chắc đủ quyền và có thể nhận `403`.

## 4. Bản đồ nhóm endpoint

Đây là bản đồ để tìm đúng prefix. Method, body/query và response chi tiết xem
router/model tương ứng trong source.

| Nhóm | Prefix/path chính | Lưu ý |
| --- | --- | --- |
| Auth | `/api/user/*` | Cookie cho web, Bearer cho native/server |
| Course public | `/api/courses/*` | List/detail/curriculum có optional auth |
| Course management | `/api/course-management/courses/*` | Staff only |
| Category, tag | `/api/categories`, `/api/tags` | Read public/optional; write cần quyền |
| Enrollment | `/api/courses/:courseId/enrollments`, `/api/me/enrollments` | Learner và quản lý ghi danh |
| Cart | `/api/cart/*` | Auth required |
| Order | `/api/orders/*` | User order; `/admin/*` dành cho staff |
| Payment | `/api/payment/*` | Có webhook/IPN với secret riêng |
| Progress | `/api/courses/:courseId/progress`, `/lessons/:lessonId/progress` | Auth/enrollment dependent |
| Quiz | `/api/quizzes`, `/api/quiz-*` | Có attempt, autosave answer, submit, grade |
| Assignment | `/api/assignments`, `/api/assignment-submissions` | Nộp bài và chấm bài |
| Video | `/api/admin/videos`, `/api/courses/:courseId/.../video*` | Upload bất đồng bộ, playback có kiểm tra quyền |
| Media | `/api/media/*` | Upload/list/link; cần course permission |
| Post/blog | `/api/posts/*` | Slug, tag, comment, like, moderation |
| Learning extras | `/api/questions`, `/api/notes`, `/api/bookmarks` | Luôn cần auth |
| Course chat | `/api/courses/:courseId/chat/*` | REST, không phải WebSocket |
| Notification | `/api/notifications/*` | List, mark read, compose |
| Lead | `/api/leads/*` | Create public có rate limit; quản lý cần auth |
| Coupon | `/api/coupons/*` | Preview và CRUD hiện đều cần auth |
| Certificate | `/api/certificates/*` | Verify public; mine/admin cần auth |
| Admin | `/api/admin/users`, `/api/admin/metrics`, `/api/analytics` | Role/permission restricted |

Không dùng file `src/common/paths/permissions.ts` làm bằng chứng endpoint đang
hoạt động: hiện permissions/roles router không được mount trong `server.ts`.

## 5. Pagination, response và lỗi

### Pagination

Các list phổ biến dùng:

```text
?page=1&limit=20
```

`page` bắt đầu từ 1; đa số schema giới hạn `limit <= 100`. Tuy nhiên response
chưa dùng một envelope duy nhất: có endpoint trả `{ data, pagination }`, có
endpoint trả `{ data, total }`, `{ course }`, `{ cart }`, hoặc trả object service
trực tiếp. Không viết interceptor giả định mọi response đều nằm trong `data.data`.

Client nên khai báo type theo từng endpoint. Với course/post list, pagination có
thể không chứa `page`/`limit` nếu query không truyền hai tham số đó; nên luôn
truyền rõ `page` và `limit`.

### Error

Validation bằng Zod trả `422`:

```json
{
  "error": "Validation Error (field): mô tả",
  "issues": []
}
```

Lỗi nghiệp vụ thường có dạng:

```json
{
  "error": "mô tả"
}
```

Các status cần xử lý:

- `400`: request/parameter không hợp lệ ngoài schema
- `401`: thiếu, sai hoặc hết hạn token
- `403`: sai Origin, chưa ghi danh hoặc thiếu role/permission
- `404`: resource không tồn tại/không nhìn thấy
- `409`: xung đột trạng thái hoặc dữ liệu
- `413`: file vượt giới hạn
- `422`: body/query/param sai schema
- `429`: vượt rate limit
- `500`: lỗi BE; gửi `X-Request-Id` cho đội vận hành

Không dựa vào chuỗi message để điều khiển toàn bộ logic nếu có thể dùng HTTP
status. Hiện BE chưa công bố error code ổn định.

## 6. Upload media, attachment và video

### Media/attachment nhỏ

`POST /api/media/thumbnails`, `POST /api/media/files` và lesson attachment
upload dùng `multipart/form-data`, field file bắt buộc tên là `file`. Không tự
set boundary; để HTTP client tạo:

```ts
const form = new FormData();
form.append('file', selectedFile);

await api.post('/media/thumbnails', form);
```

Giới hạn hiện tại:

- image: JPEG, PNG, WebP, GIF, SVG; tối đa 30 MiB
- document: PDF, DOCX, DOC, Markdown, plain text; tối đa 50 MiB

BE kiểm tra MIME type do client gửi, nên cần giữ đúng `Content-Type` của file.

### Video

Loại hỗ trợ: MP4, QuickTime/MOV, WebM; tối đa 50 GiB. Với file lớn, ưu tiên
multipart presigned flow:

1. `POST /api/admin/videos/init-multipart-upload`.
2. Với từng part, gọi
   `POST /api/admin/videos/:videoId/multipart/part-url`.
3. `PUT` part **trực tiếp** lên presigned S3 URL; không gửi Bearer/cookie GATS
   sang S3.
4. Lưu `ETag` của từng part (bucket CORS phải expose header `ETag`).
5. Gọi `POST /api/admin/videos/:videoId/multipart/complete` với danh sách
   `{ partNumber, etag }`.
6. Poll `GET /api/admin/videos/:videoId/status` vì transcode HLS chạy bất đồng
   bộ.
7. Nếu hủy upload, gọi
   `POST /api/admin/videos/:videoId/multipart/abort`.

Presigned URL có host riêng và thời hạn. Không thay host bằng `api.gats.vn`,
không cache URL lâu dài, và không thêm Authorization header khi PUT lên storage.
Playback URL cũng có thể là URL có hạn; lấy lại từ playback endpoint thay vì lưu
vĩnh viễn.

## 7. Payment và webhook

Các credential payment **không dùng chung JWT user**:

- `POST /api/payment/sepay/webhook`: chấp nhận API key qua
  `Authorization: Bearer <SEPAY_API_KEY>`,
  `Authorization: Apikey <SEPAY_API_KEY>` hoặc `X-Api-Key`.
- `POST /api/payment/sepay/ipn`: dùng
  `X-Secret-Key: <SEPAY_SECRET_KEY>`.
- `GET /api/payment/sepay/check?txnRef=...`: cần auth user.
- `/api/payment/vnpay/return` và `/api/payment/momo/return` là callback public.

Không nhúng SePay secret/API key vào mobile hoặc browser app. Webhook phải gọi
từ payment provider/backend tin cậy. Xử lý webhook có thể được gửi lặp; phía app
tích hợp không nên giả định callback chỉ đến một lần.

## 8. Checklist trước khi đưa app mới lên production

- [ ] Dùng base URL `https://api.gats.vn/api`, health dùng `/health/*`.
- [ ] Chọn rõ cookie auth (web) hoặc Bearer auth (native/server).
- [ ] Nếu là browser app, đã thêm origin chính xác vào `FRONTEND_URL`.
- [ ] Browser request cần cookie có `credentials: include`/`withCredentials`.
- [ ] Native/server không tự thêm `Origin`.
- [ ] Xử lý `401`, `403`, `422`, `429` riêng biệt.
- [ ] Log `X-Request-Id` ở cả request và response.
- [ ] Không giả định một response envelope chung.
- [ ] Luôn truyền `page` và `limit` cho list cần phân trang.
- [ ] Upload form dùng field `file`; video lớn dùng presigned multipart.
- [ ] Không gửi JWT GATS sang presigned S3 URL.
- [ ] Không để payment secret trong client.
- [ ] Test bằng tài khoản đúng role/enrollment, không chỉ test JWT hợp lệ.

## 9. Source cần đối chiếu khi API thay đổi

- Mount point: `src/server.ts`
- Path constants: `src/common/paths/*.ts`
- Method và middleware: `src/routes/**/*Api.ts`
- Request schema: `src/models/*.model.ts`
- Auth: `src/middleware/authMiddleware.ts`,
  `src/services/AuthService.ts`
- CORS/Origin: `src/common/utils/cors.ts`,
  `src/middleware/originGuard.ts`
- Upload: `src/middleware/mediaUploadMiddleware.ts`,
  `src/middleware/videoUploadMiddleware.ts`

