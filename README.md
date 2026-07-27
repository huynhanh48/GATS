# GATS ACADEMY

## Ports & Services

| Dịch vụ | Port (Host) | Ghi chú |
| --- | --- | --- |
| Backend API | `3000` | Node.js Express API |
| Web App | `3005` | Next.js Frontend |
| Admin Dashboard | `9000` (Local) / `9100` (Docker) | Next.js Admin Panel |
| PostgreSQL | `5432` | Docker (Database) |
| Redis | `6379` | Docker (Queue & Cache) |
| MinIO S3 API | `9010` | Docker (File/Video Storage) |
| MinIO Console | `9011` | `minioadmin` / `minioadmin` |
| Nginx Reverse Proxy | `80` / `443` | Docker Production Overlay |
| Video Worker | — | Docker (profile `dev`) hoặc PM2 |

> **Admin mặc định (Docker seed)**: `admin@gmail.com` / `admin12345`

---

## Các Lệnh Docker Compose Chi Tiết

### 1. Môi Trường Local Dev (Khuyên Dùng)

Chạy hạ tầng (Postgres, Redis, MinIO) + Video Worker trong Docker; chạy BE, Web, Admin trên máy local để dev nhanh.

**Khởi tạo hạ tầng & worker:**
```powershell
docker compose -p gats-academy --profile dev up -d db redis minio minio-init worker
```

**Build lại Video Worker khi sửa code BE:**
```powershell
docker compose -p gats-academy --profile dev up -d --build worker
```

**Xem log của Video Worker:**
```powershell
docker compose -p gats-academy --profile dev logs -f worker
```

**Tắt stack hạ tầng dev:**
```powershell
docker compose -p gats-academy --profile dev down
```

---

### 2. Chạy ứng dụng Local (BE + Frontend trên host)

Mở **3 terminal** riêng tại thư mục gốc dự án:

```powershell
# Terminal 1: Backend API
cd BE
npm run dev
```

```powershell
# Terminal 2: Web App Frontend
cd web-app
npm run dev
```

```powershell
# Terminal 3: Admin Dashboard
cd admin-dashboard
npm run dev
```

> **URL truy cập local:**
> - Web App: http://localhost:3005
> - Admin Dashboard: http://localhost:9000
> - Backend API: http://localhost:3000
> - MinIO Console: http://localhost:9011

---

### 3. Full Stack trong Docker Local (API + Worker + Web + Admin)

Dùng khi muốn kiểm thử toàn bộ ứng dụng trong container mà không cần chạy `npm run dev` thủ công.

**Khởi chạy toàn bộ stack:**
```powershell
docker compose -p gats-academy up --build -d
```

**Xem log toàn bộ ứng dụng hoặc service chỉ định:**
```powershell
docker compose -p gats-academy logs -f
docker compose -p gats-academy logs -f app
```

**Tắt Full Stack:**
```powershell
docker compose -p gats-academy down
```

> ⚠️ **Lưu ý**: Không chạy đồng thời service `worker` (profile `dev`) và container `app` cùng lúc để tránh trùng lặp 2 worker xử lý video.

---

### 4. Deploy Production VPS (`gats.vn` / `api.gats.vn` / `admin.gats.vn`)

Trên VPS, copy file cấu hình mẫu `.env.vps.example` thành `.env` và cập nhật các biến bảo mật:

```bash
cp .env.vps.example .env
```

**Cấu hình biến môi trường chính trong `.env`:**
```env
NEXT_PUBLIC_API_URL=https://api.gats.vn
APP_URL=https://api.gats.vn
FRONTEND_URL=https://gats.vn,https://www.gats.vn,https://admin.gats.vn,http://localhost:3005,http://localhost:9100
```

**Khởi chạy Production với Nginx Overlay (`docker-compose.prod.yml`):**
```bash
docker compose -p gats-academy -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

**Tự động gia hạn SSL Let's Encrypt (Certbot):**
```bash
docker compose -p gats-academy -f docker-compose.yml -f docker-compose.prod.yml --profile cert-renew up -d certbot
```

**Dừng Production Stack:**
```bash
docker compose -p gats-academy -f docker-compose.yml -f docker-compose.prod.yml down
```

---

## Cheat Sheet Lệnh Docker Thông Dụng

| Tác vụ | Lệnh Docker Compose |
| --- | --- |
| Kiểm tra trạng thái các container | `docker compose -p gats-academy ps` |
| Rebuild duy nhất 1 service (ví dụ `app`) | `docker compose -p gats-academy up --build -d app` |
| Restart lại 1 service | `docker compose -p gats-academy restart app` |
| Xem 100 dòng log mới nhất | `docker compose -p gats-academy logs --tail=100 -f` |
| Xóa hoàn toàn container và volumes dữ liệu | `docker compose -p gats-academy down -v` |

---

## Xử Lý Lỗi Thường Gặp

### Lỗi Cổng Đang Bị Chiếm (Windows)
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3005).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 9000).OwningProcess -Force
```

### CORS Warning
Luôn truy cập Web App bằng `http://localhost:3005` (tránh dùng IP LAN) để khớp cấu hình `FRONTEND_URL` trong `BE/config/.env.development`.
