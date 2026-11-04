# GATS ACADEMY

Monorepo GATS Academy: backend API, web học viên, admin dashboard.

## 1. Cấu trúc

```
GATS/
├── be/                    # Backend API — Express 5 + TypeScript + Drizzle (cổng 3000)
├── admin/                 # Admin dashboard — Next.js (cổng 3001)
├── fe/                    # Web học viên — Next.js (cổng 3002)
├── docker/
│   ├── dev-entrypoint.sh  # Khởi động postgres + redis + s3 rồi chạy 3 dev server
│   └── dev-s3-init.cjs    # Tạo bucket cho S3
├── Dockerfile.dev         # Image DEV: 1 container chạy hết
├── docker-compose.yml     # Chạy dev (1 service duy nhất)
├── Dockerfile             # Image PRODUCTION (be + admin + fe chạy bằng pm2)
├── docker-compose.prod.yml# Chạy production trên VPS
├── ecosystem.dev.config.js  # pm2 cho container dev
├── ecosystem.config.js      # pm2 cho container production
└── .env.example / .env.prod.example
```

## 2. Cổng

| Dịch vụ | Cổng (host) | URL |
| --- | --- | --- |
| be (API) | `3000` | <http://localhost:3000> — health: `/health/ready` |
| admin (dashboard) | `3001` | <http://localhost:3001> |
| fe (web học viên) | `3002` | <http://localhost:3002> |

Postgres (`5432`), Redis (`6379`) và S3 (`9010`) nằm **trong cùng container dev**, không mở cổng ra ngoài.

Tài khoản admin do be tạo khi khởi động: **`admin@gmail.com` / `admin12345`**.

## 3. Chạy development

Cần: **Docker** đang chạy (không cần cài Node trên máy).

> Máy dùng colima: cần cấp ít nhất **8GB RAM / 4 CPU** cho VM, vì container này chạy cả Postgres + Redis + S3 + 3 app:
> ```bash
> colima stop && colima start --cpu 4 --memory 8
> ```
> (Docker Desktop thì vào Settings → Resources, đặt Memory ≥ 8GB.)

```bash
cd ~/GATS
docker compose up -d --build      # lần đầu: build image (vài phút)
docker compose logs -f            # xem log
```

Mở <http://localhost:3002> (web) và <http://localhost:3001> (admin).

Lần đầu container sẽ tự: khởi tạo Postgres → chạy migration → seed role/quyền → tạo bucket S3 → chạy `be`, `be-worker`, `admin`, `fe` bằng pm2.

**Sửa code trên máy → app tự reload** (source được mount vào container). Không cần build lại.

### Lệnh thường dùng

| Việc | Lệnh |
| --- | --- |
| Dừng | `docker compose down` |
| Dừng + xoá dữ liệu (DB, S3, Redis) | `docker compose down -v` |
| Vào shell trong container | `docker compose exec gats bash` |
| Xem log 1 app | `docker compose exec gats pm2 logs be` |
| Restart 1 app | `docker compose exec gats pm2 restart fe` |
| Vào Postgres | `docker compose exec gats psql -U postgres -d postgres` |
| Vào Redis | `docker compose exec gats redis-cli` |
| Cài thêm package cho be | `docker compose exec gats sh -c "cd be && npm install <pkg>"` (fe/admin tương tự) |
| Chạy lại migration/seed | `docker compose exec gats sh -c "cd be && npm run db:migrate:versioned"` |

> Đổi `package.json` hoặc `Dockerfile.dev` thì cần `docker compose up -d --build` lại.
> Sau `docker compose down -v`, lần chạy sau migration + seed sẽ tự chạy lại từ đầu.

## 4. Env cần điền

| File | Dùng khi | Cần điền |
| --- | --- | --- |
| `.env` (copy từ `.env.example`) | Tuỳ chọn, cho Docker dev | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_ID` nếu test Google Login |
| `be/config/.env.development` | Container dev đọc qua mount | Đã điền sẵn cho hạ tầng trong container (DB/Redis/S3 localhost). Điền thêm `EMAIL_PASSWORD`, `SEPAY_API_KEY`, `VNP_*` khi cần |
| `fe/.env.local`, `admin/.env.local` | Container dev đọc qua mount | Đã điền sẵn |
| `.env.prod.example` → `.env` | Deploy VPS | `POSTGRES_PASSWORD`, `JWT_SECRET`, `EMAIL_PASSWORD`, `MINIO_ROOT_USER/PASSWORD`, `S3_ACCESS_KEY_ID/SECRET`, `ADMIN_DEFAULT_PASSWORD`, `SEPAY_API_KEY`, `NEXT_PUBLIC_*` |

Các file `.env*` đều đã bị gitignore (trừ `*.example`).

## 5. Docker

### Development (1 container, 3 cổng)

```bash
docker compose up -d --build
docker compose logs -f
```

Trong container: `postgres` + `redis` + `rustfs` (S3) + `be` + `be-worker` + `admin` + `fe`.

### Production (VPS)

```bash
cp .env.prod.example .env      # điền secret
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f app
```

Production tách riêng: Postgres + Redis + S3 là container riêng (không mở cổng), còn `app` là 1 container chạy be + admin + fe bằng pm2 (image build từ `Dockerfile`, không mount source).

Build image production thủ công:

```bash
docker build -t gats-academy .
```

> Đổi biến `NEXT_PUBLIC_*` thì **phải build lại** (giá trị được nhúng vào JS lúc build).

TLS/reverse proxy: đặt nginx (hoặc proxy khác) phía trước 3 cổng 3000/3001/3002.

## 6. Lưu ý

- **Ảnh/file upload**: file upload (avatar, media, video) lưu ở S3 **trong** container dev. Trình duyệt chỉ xem được nếu mở thêm cổng S3 — bỏ comment 2 dòng `9010:9010` / `9011:9011` trong `docker-compose.yml` rồi `docker compose up -d`. Ảnh có sẵn trong repo (`/images/...`) không bị ảnh hưởng.
- **S3 local dùng RustFS** (`rustfs/rustfs`): image MinIO community (`minio/minio`) đã bị gỡ khỏi Docker Hub. RustFS nói cùng S3 API nên code không đổi; production vẫn trỏ `S3_*`/`MINIO_*` vào LongVan hoặc S3-compatible bất kỳ.
- **Cổng cũ đã đổi**: admin `9000 → 3001`, fe `3005 → 3002` (be giữ `3000`). Đã cập nhật trong `package.json`, `ecosystem*.js`, Dockerfile, compose, `be/config/.env.development` (`FRONTEND_URL`).
- **Video worker** (`be-worker`) chạy sẵn trong container dev để xử lý upload/transcode video.
- Đã bỏ khỏi repo: `docs/`, `mobile-app/`, `scripts/`, `viava/`, `deploy/`.
- Các tính năng gọi AI course-gen (quiz AI, coach, flashcard) gọi sang `viava` — dịch vụ này đã bị xoá nên các endpoint đó sẽ lỗi.

