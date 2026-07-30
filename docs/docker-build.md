# Build & deploy Docker (Web + API + Admin)

> Cập nhật: 22/07/2026  
> Image gốc: `Dockerfile` (multi-stage) + `docker-compose.yml` service `app`  
> Chi tiết secrets/OAuth: [`huong-dan-van-hanh-ngay.md`](./huong-dan-van-hanh-ngay.md), mẫu env: [`.env.vps.example`](../.env.vps.example)

## Ports sau khi lên

| Service | Trong container | Host (compose) |
|---|---|---|
| BE API | 3000 | 3000 |
| Web | 3005 | 3005 |
| Admin | 9000 | 9100 |
| Viava (FastAPI) | 8000 | (internal; nginx → `api.gats.vn/course/*`) |

## Trước khi build (bắt buộc)

1. Docker Desktop **đang chạy**.
2. Ở **repo root** tạo file `.env` (không commit) từ `.env.vps.example`:

```powershell
cd c:\Users\admin\Documents\CODE\GATS-ACADEMY
copy .env.vps.example .env
notepad .env
```

Điền tối thiểu:

| Biến | Ý nghĩa |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Web client ID — **bake vào JS lúc build** |
| `GOOGLE_CLIENT_ID` | Cùng giá trị — BE verify `idToken` |
| `NEXT_PUBLIC_API_URL` | URL API mà **trình duyệt** gọi (vd `https://api.gats.vn`) |
| `APP_URL` / `FRONTEND_URL` | Link email + CORS |
| `JWT_SECRET`, `SEPAY_API_KEY`, S3… | Production secrets (không để mặc định compose) |
| `AZURE_OPENAI_*` (+ transcribe) | **Bắt buộc** cho `viava-api` — thiếu → pm2 restart loop |
| `VIAVA_COURSE_GEN_URL` | Default trong container: `http://127.0.0.1:8000` |

> Đổi `NEXT_PUBLIC_*` → phải **build lại** image (`--build`). Chỉ restart container không đủ.
>
> Thêm/sửa `viava/` hoặc Python deps → **rebuild** image (pip chạy lúc build).

## Build & chạy full stack

```powershell
cd c:\Users\admin\Documents\CODE\GATS-ACADEMY

# Build lại app (web + BE + admin) + hạ tầng
docker compose -p gats-academy -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Xem log
docker compose -p gats-academy -f docker-compose.yml -f docker-compose.prod.yml logs -f app
```

Chỉ rebuild service `app` (nhanh hơn khi chỉ đổi code):

```powershell
docker compose -p gats-academy build --no-cache app
docker compose -p gats-academy up -d app
```

## Kiểm tra sau build

```powershell
# Web
curl http://127.0.0.1:3005/

# API (có thể 401 — quan trọng là không connection refused)
curl -i http://127.0.0.1:3000/api/user/me

# Admin (host 9100 → container 9000)
curl -i http://127.0.0.1:9100/
```

Trong log `app` kỳ vọng:

- `[entrypoint] Applying versioned database migrations...` rồi `Schema is current`; nếu migration fail, container dừng để tránh chạy app với schema lệch
- pm2: `gats-academy-api`, `gats-academy-worker`, `web-app`, `admin-dashboard`, `viava-api` online

### Smoke Viava + Admin AI (sau deploy)

Thứ tự bắt buộc:

```powershell
# 1) pm2 — viava-api phải online (không restart loop)
docker exec gats-academy pm2 list

# 2) Health nội bộ (cần curl trong image)
docker exec gats-academy curl -sf http://127.0.0.1:8000/health

# 3) Public qua reverse proxy (nếu expose /course)
curl -sf https://api.gats.vn/course/info

# 4) Env trong container — Azure STT + VIAVA bắt buộc cho FLAC transcribe
docker exec gats-academy printenv VIAVA_COURSE_GEN_URL
# kỳ vọng: http://127.0.0.1:8000
# Azure Speech / OpenAI keys phải có (copy từ viava/.env vào root .env Compose)
```

**Admin AI — thử nghiệm từ FLAC (ưu tiên):**

1. Video khóa học `ready` + có `audio_flac_key` (S3 public/presigned `.flac`).
2. Lesson của video **đã có quiz** (không auto-tạo).
3. Admin → `/ai-gen`:
   - **Course video FLAC** — chọn course → video có FLAC → Run (dùng `quizId` cùng lesson; `file_url` = FLAC).
   - **URL S3 FLAC** — dán `https://…/audio.flac` + **UUID quiz thật**.
   - **Text** — smoke nhanh + UUID quiz thật (không cần audio).
4. Kỳ vọng: `POST /api/quizzes/:quizId/ai-generate` → **200** + câu hỏi apply (FLAC có thể vài phút; client timeout 180s).
5. UUID giả / trống → **400**, không **500**.

**Quiz builder (trong course):** panel AI có mode **URL S3 FLAC** (`file_url`) cạnh text / upload file.

Swagger: `https://api.gats.vn/docs`

> **Pip note:** `viava/requirements.txt` dùng `psycopg2-binary` (wheel) — không cần `libpq-dev` / `pg_config` trong image. REST API không dùng Postgres driver lúc startup.

## Những gì Dockerfile làm

1. **web-builder** — `npm ci` + `next build` với `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_API_URL`
2. **be-builder** — `npm run build` (tsc) — cần pass sau fix cookie
3. **admin-builder** — `next build`
4. Image runtime (`node:22-bookworm-slim`) — copy artifact + Python venv (`viava/`) + versioned SQL + `docker-entrypoint.sh` → checksum migration runner rồi `pm2-runtime` (gồm `viava-api` uvicorn `:8000`)

## Đã chỉnh gần đây (tránh lỗi deploy)

| Vấn đề | Sửa |
|---|---|
| `ecosystem` ép API/worker `NODE_ENV=development` | → `production` |
| Next không bind ra ngoài container | → `HOSTNAME=0.0.0.0` cho web/admin |
| Thiếu `next.config` trong image | → copy `next.config.ts` / `next.config.mjs` |
| BE `start` cần `config/.env.production` | → tạo file placeholder trong image; secret lấy từ Compose env |
| Viava numpy/scipy trên Alpine | → runtime **bookworm-slim** + pip venv + `libgomp1` |
| Build fail `pg_config` / `psycopg2` | → `psycopg2-binary` trong `viava/requirements.txt` |
| BE gọi Viava v1 path | → v2 `/course/learning-path` + `/course/exercises/*` + `/course/chat` |

## Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| Google icon/login fail trên domain mới | Thêm origin đúng vào Google Console; set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` rồi **rebuild** |
| Web gọi API sai host | Sửa `NEXT_PUBLIC_API_URL` rồi rebuild |
| Build BE fail cookie | Đảm bảo `AuthService.getCookieOptions(req?)` đã merge trước khi build |
| Migration failed | Container chủ động dừng; không sửa migration đã apply, kiểm tra `DATABASE_URL`, checksum và backup trước khi retry |
| Port đã dùng | Đổi mapping trong `docker-compose.yml` hoặc tắt process host |
| `pg_config` / Failed to build `psycopg2` | Đã dùng `psycopg2-binary`; rebuild image |
| `viava-api` restart loop | Điền đủ `AZURE_OPENAI_*` (+ transcribe) vào root `.env` rồi `up` lại |
| `SyntaxError: Unexpected identifier 'uvicorn'` | PM2 đang chạy Python bằng Node — cần `interpreter: "none"` + `python -m uvicorn` trong `ecosystem.config.js`, rồi rebuild/restart `app` |
| Compose nginx fail port 80 | Có reverse proxy ngoài rồi thì **không cần** service `nginx` của compose; Admin AI chỉ cần `viava-api` online trong container (`127.0.0.1:8000`) |

## Chỉ chạy infra (dev BE trên máy)

```powershell
docker compose -p gats-academy --profile dev up -d db redis minio minio-init
# BE: cd BE; npm run dev
# Web: cd web-app; npm run dev
```
