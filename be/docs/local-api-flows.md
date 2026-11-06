# BE — Docker Compose local & API flows

Hướng dẫn chạy hạ tầng local bằng Docker Compose và test các luồng API chính của GATS Academy backend.

**Base URL:** `http://localhost:3000`  
**API prefix:** `/api`  
**Nguồn path:** `src/common/paths/*.ts` · mount: `src/server.ts`

### Port map (local)

| App | Port host | Ghi chú |
|-----|-----------|---------|
| **BE API** | `3000` | `npm run dev:basic` — admin proxy tới đây |
| **admin** | `3001` | `npm run dev` (Docker + host) |
| **fe (learner web)** | `3002` | `npm run dev` (Vite) |
| Postgres | `5432` | docker |
| Redis | `6379` | docker |
| MinIO API | `9010` | docker (`9010→9000` trong container) |
| MinIO Console | `9001` | docker |

Admin `.env.local` phải có `BE_API_URL=http://localhost:3000`.  
BE `FRONTEND_URL` phải gồm `http://localhost:3001` (admin) và `http://localhost:3002` (fe).

---

## 1. Docker Compose (infra only)

`docker-compose.yml` **không** chạy Node API — chỉ Postgres, Redis, MinIO.

| Service | Image | Port host (default) | Dùng cho |
|---------|--------|---------------------|----------|
| `db` | `postgres:16-alpine` | `5432` | Drizzle / API |
| `redis` | `redis:7-alpine` | `6379` | BullMQ video worker, cache |
| `minio` | `minio/minio` | API `9010`, Console `9001` | Thumbnail / file media |

### 1.1 Chuẩn bị env

```bash
cd BE
cp config/.env.example config/.env.development
# Điền JWT_SECRET, ADMIN_DEFAULT_*, MINIO_*, DATABASE_URL, v.v.
```

`DATABASE_URL` gợi ý:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=http://localhost:9010
PORT=3000
FRONTEND_URL=http://localhost:3001,http://127.0.0.1:3001,http://localhost:3002,http://127.0.0.1:3002
APP_URL=http://localhost:3000
```

### 1.2 Khởi động & seed

```bash
# 1) Infra
npm run docker:dev
# hoặc: docker compose up -d

# 2) Schema
npm run db:push
# hoặc: npm run db:migrate

# 3) Roles + permissions
npm run db:seed
npm run db:seed:permissions

# 4) API (host)
npm run dev:basic
# hoặc hot reload: npm run dev:watch

# 5) Video worker (khi test upload/transcode)
npm run dev:worker
```

Dừng infra: `npm run docker:down`.

### 1.3 Healthcheck nhanh

| Check | Cách |
|-------|------|
| Postgres | `docker compose exec db pg_isready -U postgres` |
| Redis | `docker compose exec redis redis-cli ping` → `PONG` |
| MinIO console | http://localhost:9001 |
| API | `GET http://localhost:3000/api/categories/` |

---

## 2. Auth & request conventions

| Cơ chế | Chi tiết |
|--------|----------|
| Cookie | `access_token` (httpOnly) — set khi `POST /api/user/login` |
| Body | Login cũng trả `token` (JWT) — mobile dùng `Authorization: Bearer` |
| Header | `Authorization: Bearer <jwt>` được chấp nhận |
| CORS | `credentials: true`; origin trong `FRONTEND_URL` (gồm `http://localhost:3001` admin, `http://localhost:3002` fe) |
| CSRF (`originGuard`) | Prod: mutating method cần Origin allowlist. Dev: tool không Origin vẫn OK. Webhook Sepay được exempt. |

**Gợi ý curl local:** cookie (web) hoặc Bearer (mobile).

```bash
# Login → lưu cookie + xem token trong body
curl -s -c cookies.txt -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"<ADMIN_DEFAULT_PASSWORD>"}'

# Gọi API có auth (cookie)
curl -s -b cookies.txt http://localhost:3000/api/user/me

# Hoặc Bearer (mobile)
# curl -s http://localhost:3000/api/user/me -H "Authorization: Bearer <token>"
```

Admin mặc định lấy từ `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` (bootstrap khi API start nếu được cấu hình).

---

## 3. Luồng nghiệp vụ chính (test theo thứ tự)

### 3.1 Auth — đăng ký / đăng nhập / me

```mermaid
sequenceDiagram
  participant C as Client
  participant API as BE /api
  C->>API: POST /user/register
  API-->>C: user created (+ email verify nếu mail OK)
  C->>API: GET/POST /user/verify-email?token=...
  C->>API: POST /user/login
  API-->>C: Set-Cookie access_token + JSON token
  C->>API: GET /user/me
```

| Step | Method | Path | Auth | Body / note |
|------|--------|------|------|-------------|
| 1 | POST | `/api/user/register` | no | `{ "user_name", "email", "password", "type": "default" }` |
| 2 | GET | `/api/user/verify-email?token=` | no | HTML result page |
| 2b | POST | `/api/user/verify-email` | no | `{ "token" }` JSON |
| 3 | POST | `/api/user/login` | no | `{ "email" }` hoặc `{ "identifier" }` + `password` → `{ message, token, expiresAt }` + cookie |
| 4 | GET | `/api/user/me` | yes | Current user + roles |
| 5 | POST | `/api/user/logout` | yes | Clear cookie |

---

### 3.2 Catalog — category / tag / course (read → admin write)

**Public / optional auth**

| Method | Path | Mục đích |
|--------|------|----------|
| GET | `/api/categories/` | List categories |
| GET | `/api/tags/` | List tags |
| GET | `/api/courses/` | List courses |
| GET | `/api/courses/slug/:slug` | Course by slug |
| GET | `/api/courses/:id` | Course by id |
| GET | `/api/courses/:courseId/curriculum` | Curriculum tree |

**Admin / permission** (cần login + quyền COURSE / category write)

| Method | Path | Mục đích |
|--------|------|----------|
| POST | `/api/courses/` | Tạo course |
| PATCH | `/api/courses/:id` | Cập nhật |
| POST | `/api/courses/:id/publish` | Publish |
| POST | `/api/courses/:courseId/sections` | Thêm section |
| POST | `/api/courses/:courseId/sections/:sectionId/lessons` | Thêm lesson |
| POST | `/api/courses/:courseId/lessons/:lessonId/attachments/upload` | Upload file đính kèm (`multipart`, field `file`) |

---

### 3.3 Cart → Order → Payment → Enrollment

Luồng mua khóa học end-to-end:

```mermaid
sequenceDiagram
  participant U as User
  participant API as BE
  participant Sepay as Sepay / Gateway
  U->>API: POST /cart (courseId)
  U->>API: POST /orders (fromCart + paymentMethod)
  alt bank_transfer
    API-->>U: txnRef + qrUrl
    Sepay->>API: POST /payment/sepay/webhook
    U->>API: GET /payment/sepay/check?txnRef=
  else vnpay / momo
    API-->>U: redirect / pay URL
    U->>API: GET /payment/vnpay/return hoặc /momo/return
  else wallet
    API-->>U: paid (nếu đủ điều kiện)
  end
  Note over API: Order paid → enrollment được cấp
  U->>API: GET /me/enrollments/
```

| Step | Method | Path | Auth | Body / note |
|------|--------|------|------|-------------|
| 1 | POST | `/api/cart/` | yes | `{ "courseId": "<uuid>", "quantity": 1 }` |
| 2 | GET | `/api/cart/` | yes | Xem giỏ |
| 3 | POST | `/api/orders/` | yes | `{ "fromCart": true, "paymentMethod": "bank_transfer" }` |
| 4a | — | Response order | — | `bank_transfer` → `txnRef`, `qrUrl`, transfer content |
| 4b | GET | `/api/payment/sepay/check?txnRef=` | yes | Poll trạng thái |
| 4c | POST | `/api/payment/sepay/webhook` | API key | Header `Authorization: Apikey …` / `x-api-key` = `SEPAY_API_KEY` |
| 5 | GET | `/api/orders/` | yes | Danh sách order |
| 6 | GET | `/api/me/enrollments/` | yes | Khóa đã enroll sau khi paid |

`paymentMethod` hợp lệ: `vnpay` | `bank_transfer` | `momo` | `wallet`.

Checkout trực tiếp (không qua cart):

```json
{
  "fromCart": false,
  "items": [{ "courseId": "<uuid>", "quantity": 1 }],
  "paymentMethod": "bank_transfer"
}
```

VNPay / MoMo return (browser callback, không cần user JWT):

- `GET /api/payment/vnpay/return?...`
- `GET /api/payment/momo/return?...`

Hủy order: `POST /api/orders/:orderId/cancel`.

---

### 3.4 Learning — progress / quiz / assignment

**Progress** (cần enroll hoặc quyền tương ứng)

| Method | Path |
|--------|------|
| PUT | `/api/courses/:courseId/lessons/:lessonId/progress` |
| GET | `/api/courses/:courseId/lessons/:lessonId/progress` |
| GET | `/api/courses/:courseId/progress` |

**Quiz**

| Step | Method | Path | Ghi chú |
|------|--------|------|---------|
| Admin tạo | POST | `/api/courses/:courseId/lessons/:lessonId/quiz` | Cần quyền update COURSE |
| Member lấy | GET | `/api/courses/:courseId/lessons/:lessonId/quiz` | |
| Take | GET | `/api/quizzes/:quizId/take` | |
| Attempt | POST | `/api/quizzes/:quizId/attempts` | |
| Save answer | PUT | `/api/quiz-attempts/:attemptId/answers/:questionId` | |
| Submit | POST | `/api/quiz-attempts/:attemptId/submit` | |
| Result | GET | `/api/quiz-attempts/:attemptId/result` | |
| One-shot | POST | `/api/quizzes/:quizId/submit` | Submit trực tiếp |
| Grade essay | PATCH | `/api/quiz-answers/:answerId/grade` | Admin |

**Assignment**

> **Lưu ý mount:** `Assignment._ = "/assignments"` **chưa** được `apiRouter.use` — các path update/submit đang gắn trực tiếp dưới `/api/:assignmentId...` (không có prefix `/assignments`). Lesson create/get vẫn đúng: `/api/courses/.../assignment`.

| Method | Path thực tế | Mục đích |
|--------|--------------|----------|
| POST | `/api/courses/:courseId/lessons/:lessonId/assignment` | Tạo |
| GET | `/api/courses/:courseId/lessons/:lessonId/assignment` | Member get |
| PATCH | `/api/:assignmentId` | Update |
| POST | `/api/:assignmentId/submissions/init-upload` | Init upload |
| POST | `/api/:assignmentId/submissions` | Submit |
| POST | `/api/assignment-submissions/:submissionId/attachments/complete` | Complete upload |
| PATCH | `/api/assignment-submissions/:submissionId/grade` | Grade |

---

### 3.5 Community — posts / comments / likes

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/posts/` | optional |
| GET | `/api/posts/slug/:slug` | optional |
| POST | `/api/posts/` | yes (+ create POST) |
| PATCH | `/api/posts/:postId/publish` | yes |
| POST | `/api/posts/:postId/like` | yes |
| GET | `/api/posts/:postId/comments` | optional |
| POST | `/api/posts/:postId/comments` | yes |
| POST | `/api/posts/:postId/comments/:commentId/replies` | yes |
| POST | `/api/posts/:postId/comments/:commentId/like` | yes |

---

### 3.6 Media (MinIO) & Video (S3 + Redis worker)

**Media** — cần MinIO đang chạy (`9010`):

| Method | Path | Note |
|--------|------|------|
| POST | `/api/media/thumbnails` | `multipart` field `file` |
| POST | `/api/media/files` | `multipart` field `file` |
| GET | `/api/media/` | List |
| GET | `/api/media/:mediaId/link` | Signed / public link |
| DELETE | `/api/media/:mediaId` | |

**Video** — cần Redis + `npm run dev:worker` + S3 credentials trong env:

| Step | Method | Path |
|------|--------|------|
| 1 Init | POST | `/api/admin/videos/init-upload` hoặc `.../init-multipart-upload` |
| 2 Upload | POST | `/api/admin/videos/:videoId/upload` (`file`) hoặc multipart part-url flow |
| 3 Complete | POST | `/api/admin/videos/:videoId/complete-upload` hoặc `.../multipart/complete` |
| 4 Poll | GET | `/api/admin/videos/:videoId/status` |
| 5 Playback | GET | `/api/courses/:courseId/videos/:videoId/playback` |
| Lesson | GET | `/api/courses/:courseId/lessons/:lessonId/video` |

DEV test page (HTML): `GET /api/admin/videos/test-multipart-upload-page`

Script CLI (không qua HTTP): `npx ts-node scripts/test-video-upload-flow.ts`.

---

### 3.7 Enrollment trực tiếp (admin / grant)

| Method | Path |
|--------|------|
| POST | `/api/courses/:courseId/enrollments/` |
| GET | `/api/courses/:courseId/enrollments/` |
| PATCH | `/api/courses/:courseId/enrollments/:userId` |
| DELETE | `/api/courses/:courseId/enrollments/:userId` |
| GET | `/api/me/enrollments/` |

---

### 3.8 Bank accounts (admin COURSE update)

| Method | Path |
|--------|------|
| GET/POST | `/api/bank-accounts/` |
| GET/PATCH/DELETE | `/api/bank-accounts/:bankAccountId` |
| POST | `/api/bank-accounts/:bankAccountId/default` |

Dùng khi test QR Sepay (`BANK_*` / bank account mặc định trong DB).

---

## 4. Bảng endpoint nhanh theo domain

Auth column: **no** / **yes** / **optional** / **api-key**.

### Auth `/api/user`

| Method | Path | Auth |
|--------|------|------|
| POST | `/register` | no |
| POST | `/login` | no |
| POST/GET | `/verify-email` | no |
| POST | `/logout` | yes |
| GET | `/me` | yes |

### Category `/api/categories` · Tag `/api/tags`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | optional |
| POST | `/` | yes |
| PATCH/DELETE | `/:id` | yes |

### Course `/api/courses` (rút gọn — xem §3.2)

List/get/slug/curriculum: optional · Create/update/publish/sections/lessons/attachments: yes (+ permission).

### Cart `/api/cart` · Orders `/api/orders`

Tất cả **yes**. Cart: GET/POST/DELETE `/`, PUT/DELETE `/items/:itemId`. Orders: POST/GET `/`, GET `/:orderId`, POST `/:orderId/cancel`.

### Payment `/api/payment`

| Method | Path | Auth |
|--------|------|------|
| POST | `/sepay/webhook` | api-key |
| GET | `/sepay/check` | yes |
| GET | `/vnpay/return` | no |
| GET | `/momo/return` | no |

### Progress · Quiz · Assignment · Post · Media · Video

Xem §3.4–3.6.

---

## 5. Checklist smoke test local

1. [ ] `docker compose up -d` → db / redis / minio healthy  
2. [ ] `db:push` + `db:seed` + `db:seed:permissions`  
3. [ ] `npm run dev:basic` → `GET /api/categories/` 200  
4. [ ] Login admin → `GET /api/user/me` có role  
5. [ ] Tạo / list course → publish  
6. [ ] User: add cart → create order `bank_transfer` → nhận `qrUrl`  
7. [ ] (Optional) giả lập webhook Sepay hoặc poll `sepay/check`  
8. [ ] `GET /me/enrollments` sau khi paid  
9. [ ] PUT lesson progress  
10. [ ] Upload media thumbnail lên MinIO  
11. [ ] (Optional) `dev:worker` + video init/upload/status  

---

## 6. Troubleshooting

| Triệu chứng | Kiểm tra |
|-------------|----------|
| `ECONNREFUSED 5432` | `docker compose ps` — service `db` |
| Redis / queue lỗi | Redis up + `REDIS_URL` |
| Media upload fail | MinIO `9010`, bucket `MINIO_BUCKET_NAME`, key/secret |
| Video stuck `processing` | `npm run dev:worker`, S3 env, Redis |
| CORS / cookie không gửi | Origin trong `FRONTEND_URL`; curl dùng `-c/-b` |
| 403 permission | Seed permissions; user có role admin |
| Assignment 404 trên `/api/assignments/...` | Dùng path thực tế `/api/:assignmentId...` (xem §3.4) |

---

## 7. Không có trong API hiện tại

- `src/common/paths/permissions.ts` (`/api/permissions`, `/api/roles`) — **chưa mount** router.  
- Legacy `Paths.Users` trong `constants/Paths.ts` — không dùng cho API hiện tại.

---

*Cập nhật theo code trong `BE/src/routes/*` và `BE/src/common/paths/*`. Khi thêm domain mới, bổ sung mục tương ứng vào doc này.*
