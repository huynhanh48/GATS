# GATS ACADEMY

## Ports

| Dịch vụ | Port | Ghi chú |
| --- | --- | --- |
| Backend API | `3000` | |
| Web App | `3005` | |
| Admin Dashboard | `9000` (local) / `9100` (Docker) | |
| PostgreSQL | `5432` | Docker |
| Redis | `6379` | Docker |
| MinIO S3 | `9010` | Docker |
| MinIO Console | `9011` | `minioadmin` / `minioadmin` |
| Video Worker | — | Docker (profile `dev`) hoặc `npm run dev:worker` |

Admin mặc định (Docker seed): `admin@gmail.com` / `admin12345`

---

## Cách chạy nhanh (khuyến nghị)

### 1. Hạ tầng + video worker (Docker)

Từ thư mục gốc repo:

```powershell
docker compose -p gats-academy --profile dev up -d db redis minio minio-init worker
```

Lần đầu (hoặc sau khi đổi code worker):

```powershell
docker compose -p gats-academy --profile dev up -d --build worker
```

Tắt worker / stack:

```powershell
docker compose -p gats-academy --profile dev stop worker
docker compose -p gats-academy down
```

### 2. API + frontend (máy local)

Mở **3 terminal** riêng:

```powershell
cd BE
npm run dev
```

```powershell
cd web-app
npm run dev
```

```powershell
cd admin-dashboard
npm run dev
```

Không cần `npm run dev:worker` — worker đã chạy trong Docker.

### URL

- Web: http://localhost:3005  
- Admin: http://localhost:9000  
- API: http://localhost:3000  
- MinIO: http://localhost:9011  

---

## Full stack trong Docker (API + worker + web + admin)

```powershell
docker compose -p gats-academy up --build -d
```

- Web: http://localhost:3005  
- Admin: http://localhost:9100  
- API: http://localhost:3000  

**Không** chạy cùng lúc service `worker` (profile `dev`) và container `app` — sẽ trùng 2 worker.

---

## Deploy VPS (`gats.vn` / `api.gats.vn` / `admin.gats.vn`)

Trong file `.env` **trên VPS** (không dùng `localhost` cho API public):

```env
NEXT_PUBLIC_API_URL=https://api.gats.vn
APP_URL=https://api.gats.vn
FRONTEND_URL=https://gats.vn,https://www.gats.vn,https://admin.gats.vn,http://localhost:3005,http://localhost:9100
```

Rồi rebuild (bắt buộc — `NEXT_PUBLIC_*` chỉ có hiệu lực lúc build):

```bash
docker compose -p gats-academy up --build -d
```

Kiểm tra nhanh: mở DevTools trên https://gats.vn → Network → request API phải tới `https://api.gats.vn`, không phải IP `:3000`.

---

## Lỗi cổng đang bị chiếm (Windows)

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3005).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 9000).OwningProcess -Force
```

---

## CORS

Truy cập Web App bằng `http://localhost:3005` (không dùng IP LAN) để khớp `FRONTEND_URL` trong `BE/config/.env.development`.
