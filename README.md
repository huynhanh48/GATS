# GATS ACADEMY

Monorepo GATS Academy: backend API, web học viên, admin dashboard.

## 1. Cấu trúc

```
GATS/
├── be/                    # Backend API — Express 5 + TypeScript + Drizzle (cổng 3000)
├── admin/                 # Admin dashboard — Next.js (cổng 3001)
├── fe/                    # Web học viên — Vite + React SPA, build ra fe/dist (cổng 3002)
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

| Dịch vụ           | Cổng (host) | URL                                                                        |
| ------------------- | ------------ | -------------------------------------------------------------------------- |
| be (API)            | `3000`     | [http://localhost:3000](http://localhost:3000) — health: `/health/ready` |
| admin (dashboard)   | `3001`     | [http://localhost:3001](http://localhost:3001)                              |
| fe (web học viên) | `3002`     | [http://localhost:3002](http://localhost:3002)                              |

Postgres (`5432`), Redis (`6379`) và S3 (`9010`) nằm **trong cùng container dev**, không mở cổng ra ngoài.

Tài khoản admin do be tạo khi khởi động: **`admin@gmail.com` / `admin12345`**.

## 3. Chạy development

Cần: **Docker** đang chạy (không cần cài Node trên máy).

> Máy dùng colima: cần cấp ít nhất **8GB RAM / 4 CPU** cho VM, vì container này chạy cả Postgres + Redis + S3 + 3 app:
>
> ```bash
> colima stop && colima start --cpu 4 --memory 8
> ```
>
> (Docker Desktop thì vào Settings → Resources, đặt Memory ≥ 8GB.)

```bash
cd ~/GATS

# Lần đầu (và sau khi clone repo mới): tạo env backend cho container dev.
cp be/config/.env.example be/config/.env.development

docker compose up -d --build      # lần đầu: build image (vài phút)
docker compose logs -f            # xem log
```

> Thiếu `be/config/.env.development` thì container dev sẽ báo
> `Error: DATABASE_URL is required` rồi restart liên tục.

Mở [http://localhost:3002](http://localhost:3002) (web) và [http://localhost:3001](http://localhost:3001) (admin).

Lần đầu container sẽ tự: khởi tạo Postgres → chạy migration → seed role/quyền → tạo bucket S3 → chạy `be`, `be-worker`, `admin`, `fe` bằng pm2.

**Sửa code trên máy → app tự reload** (source được mount vào container). Không cần build lại.

### Lệnh thường dùng

| Việc                                  | Lệnh                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| Dừng                                  | `docker compose down`                                                                |
| Dừng + xoá dữ liệu (DB, S3, Redis) | `docker compose down -v`                                                             |
| Vào shell trong container             | `docker compose exec gats bash`                                                      |
| Xem log 1 app                          | `docker compose exec gats pm2 logs be`                                               |
| Restart 1 app                          | `docker compose exec gats pm2 restart fe`                                            |
| Vào Postgres                          | `docker compose exec gats psql -U postgres -d postgres`                              |
| Vào Redis                             | `docker compose exec gats redis-cli`                                                 |
| Cài thêm package cho be              | `docker compose exec gats sh -c "cd be && npm install <pkg>"` (fe/admin tương tự) |
| Chạy lại migration/seed              | `docker compose exec gats sh -c "cd be && npm run db:migrate:versioned"`             |

> Đổi `package.json` hoặc `Dockerfile.dev` thì cần `docker compose up -d --build` lại.
> Sau `docker compose down -v`, lần chạy sau migration + seed sẽ tự chạy lại từ đầu.

## 4. Env cần điền

| File                                    | Dùng khi                     | Cần điền                                                                                                                                                                            |
| --------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `be/config/.env.development`          | BẮT BUỘC cho Docker dev (mount vào container) | Tạo bằng `cp be/config/.env.example be/config/.env.development` rồi điền. Bản mặc định đã trỏ DB/Redis/S3 vào `localhost` (đúng cho container dev lẫn chạy be trên máy) |
| `.env` (copy từ `.env.example`)    | Tuỳ chọn, cho Docker dev    | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_ID` nếu test Google Login                                                                                                         |
| `be/config/.env.test`                 | BẮT BUỘC để chạy `npm test` (BE) | `vitest.config.mts` trỏ `DOTENV_CONFIG_PATH=config/.env.test`. Tạo bằng `cp be/config/.env.example be/config/.env.test` (giá trị test, DB/Redis đều được mock) |
| `admin/.env.local`                     | Tuỳ chọn (chạy admin trên máy) | Không cần cho Docker dev (mặc định `BE_API_URL=http://localhost:3000` đã đúng). Copy từ `admin/.env.example` khi chạy `npm run dev` trên host                          |
| `fe/.env.local`                        | Tuỳ chọn (chạy fe trên máy) | Không cần cho Docker dev (compose truyền `PUBLIC_API_URL`). Copy từ `fe/.env.example` khi chạy `npm run dev` trên host                                                  |
| `.env.prod.example` → `.env`       | Deploy VPS (chi tiết ở mục 5) | File mẫu ghi rõ từng biến `[BẮT BUỘC]` / `[NÊN ĐIỀN]` / `[TÙY CHỌN]` + lấy ở đâu. Bắt buộc: `POSTGRES_PASSWORD`, `JWT_SECRET`, `EMAIL_USER`/`EMAIL_PASSWORD`, `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`, `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`, `ADMIN_DEFAULT_EMAIL`/`ADMIN_DEFAULT_PASSWORD`, `SEPAY_API_KEY` |

Các file `.env*` đều đã bị gitignore (trừ `*.example`).

## 5. Docker

### Development (1 container, 3 cổng)

```bash
docker compose up -d --build
docker compose logs -f
```

Trong container: `postgres` + `redis` + `rustfs` (S3) + `be` + `be-worker` + `admin` + `fe`.

### Production (VPS)

Kiến trúc: **1 container `app`** chạy `be` + `be-worker` + `admin` + `fe` bằng pm2; Postgres, Redis, S3 (RustFS) là container riêng trong cùng compose. Chỉ `app` mở 3000/3001/3002; S3 API mở trên loopback (`127.0.0.1:9010`) để nginx phục vụ ảnh. Không mount source — mọi thứ nằm trong image.

#### 1. Chuẩn bị VPS

```bash
curl -fsSL https://get.docker.com | sh      # Docker + plugin compose
docker compose version
```

- Mở 80/443 cho nginx. **Không** mở 3000/3001/3002 ra Internet (chỉ nginx gọi).
- RAM ≥ 4GB: ffmpeg (transcode video) + Next.js + Postgres + Redis + RustFS trên cùng máy.

#### 2. Lấy code

```bash
git clone <repo-url> ~/GATS
cd ~/GATS
```

#### 3. Tạo `.env` và điền

```bash
cp .env.prod.example .env
$EDITOR .env
```

`.env.prod.example` là hướng dẫn đầy đủ: mỗi biến ghi rõ `[BẮT BUỘC]` / `[NÊN ĐIỀN]` / `[TÙY CHỌN]`, lấy ở đâu, lệnh sinh giá trị. Bảy nhóm phải tự điền:

| Nhóm | Biến | Lấy ở đâu |
| --- | --- | --- |
| Mật khẩu DB | `POSTGRES_PASSWORD` | `openssl rand -base64 24` |
| Khoá ký JWT | `JWT_SECRET` | `openssl rand -hex 32` (≥ 32 ký tự) |
| Email gửi đi | `EMAIL_USER`, `EMAIL_PASSWORD` | Gmail + App Password 16 ký tự (bật 2FA) |
| S3 nội bộ (ảnh/file) | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` | tự đặt |
| Video | `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | LongVan, hoặc dùng lại `MINIO_ROOT_*` nếu để video trên S3 nội bộ |
| Admin đầu tiên | `ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD` | tự đặt — seed tạo tài khoản này ở lần deploy đầu |
| Thanh toán | `SEPAY_API_KEY` | my.sepay.vn → API token |

Các giá trị còn lại đã điền sẵn, chỉ sửa khi đổi tên miền / số tài khoản: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_API_URL`, `APP_URL`, `FRONTEND_URL`, `AUTH_COOKIE_DOMAIN`, `MINIO_BUCKET_NAME`, `BANK_*`.

> Thiếu biến `[BẮT BUỘC]` → `docker compose` dừng ngay (`XXX is required`), không build.
> Còn secret mặc định của dev → be từ chối khởi động (`Unsafe production configuration (...)` trong log `app`).

#### 4. Build và chạy

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f app
```

Lần chạy đầu, container `app` tự làm theo thứ tự:

1. chờ Postgres / Redis / S3 healthy;
2. chạy migration trong `be/migrations` (`db:migrate:versioned`);
3. seed lõi: roles, permissions, admin `ADMIN_DEFAULT_*`, 6 nhóm khoá học chính (`db:seed:core`, idempotent — chạy lại không ghi đè);
4. start `gats-be`, `gats-be-worker`, `gats-admin`, `gats-fe` bằng pm2.

Bước 2/3 lỗi → container thoát, **không** phục vụ traffic. Sửa nguyên nhân rồi `up -d` lại.
Build lần đầu mất vài phút (`npm ci` × 3 + Next.js build + Vite build).

#### 5. Kiểm tra sau khi chạy

```bash
curl -s localhost:3000/health/ready   # {"status":"ready","checks":{"database":true,"redis":true}}
curl -sI localhost:3001 | head -1     # 307 -> /auth/sign-in (admin sống)
curl -sI localhost:3002 | head -1     # 200 (fe sống)
docker compose -f docker-compose.prod.yml exec app pm2 list   # 4 app phải "online"
```

Đăng nhập `http://<IP>:3001` bằng `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD`, rồi **đổi mật khẩu ngay**.

#### 6. nginx (TLS + tên miền)

`/etc/nginx/sites-available/gats.conf` (HTTP trước, certbot tự thêm khối 443):

```nginx
map $http_upgrade $connection_upgrade { default upgrade; '' close; }

server {                              # fe
  listen 80;
  server_name gats.vn www.gats.vn;
  location / { proxy_pass http://127.0.0.1:3002; proxy_set_header Host $host; }
}

server {                              # admin dashboard
  listen 80;
  server_name admin.gats.vn;
  client_max_body_size 512M;          # upload ảnh/video qua admin
  location / { proxy_pass http://127.0.0.1:3001; proxy_set_header Host $host; }
}

server {                              # be API + Socket.IO + media
  listen 80;
  server_name api.gats.vn;
  client_max_body_size 512M;

  # Ảnh/media trong S3 nội bộ (bucket public-read) — port 9010 trong compose
  location /files-gats/ {
    proxy_pass http://127.0.0.1:9010/;
    proxy_set_header Host $host;
    expires 30d;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;        # Socket.IO (thông báo realtime)
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 3600s;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gats.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d gats.vn -d www.gats.vn -d admin.gats.vn -d api.gats.vn
```

Cổng trong nginx phải khớp `.env`: fe `3002`, admin `3001`, be `3000`, và `MINIO_PUBLIC_BASE_URL=https://api.gats.vn/files-gats`.

#### 7. Google Console + SePay

- **Google Cloud Console** → APIs & Services → Credentials → OAuth client (Web): Authorized JavaScript origins phải chứa đúng `https://gats.vn`, `https://www.gats.vn`, `https://admin.gats.vn`; redirect URI `https://gats.vn`. Cùng Client ID cho `NEXT_PUBLIC_GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_ID`.
- **SePay** → Integrations → Webhooks: `https://api.gats.vn/api/payment/sepay/webhook`, API Key = `SEPAY_API_KEY`, loại GD "Tiền vào", JSON, bật retry.

#### 8. Cập nhật phiên bản mới

```bash
cd ~/GATS
git pull
docker compose -f docker-compose.prod.yml up -d --build   # migration chạy tự động khi start
docker compose -f docker-compose.prod.yml logs -f app
```

- Chỉ đổi biến runtime trong `.env`: `docker compose -f docker-compose.prod.yml up -d` (không cần build).
- Đổi `NEXT_PUBLIC_*` / `BANK_*` (nhúng vào bundle lúc build): phải `up -d --build`.
- Rollback code: `git checkout <tag-cũ>` rồi `up -d --build`. Migration đã apply **không** tự lùi — backup DB trước khi nâng cấp.

#### 9. Backup và vận hành

```bash
# Backup DB (giữ tên user/db theo .env)
docker compose -f docker-compose.prod.yml exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > backup-$(date +%F).sql.gz
# Log / restart 1 app
docker compose -f docker-compose.prod.yml exec app pm2 logs gats-be
docker compose -f docker-compose.prod.yml exec app pm2 restart gats-fe
```

Volume dữ liệu: `postgres_data`, `redis_data`, `s3_data`. `docker compose ... down` giữ nguyên dữ liệu; `down -v` **xoá sạch** DB + file.

#### 10. Lỗi thường gặp

| Hiện tượng | Nguyên nhân / cách sửa |
| --- | --- |
| `docker compose up` báo `XXX is required` | Thiếu biến `[BẮT BUỘC]` trong `.env` |
| Log `app`: `Unsafe production configuration (...)` | Còn secret mặc định của dev (`JWT_SECRET`, `ADMIN_DEFAULT_PASSWORD`, `MINIO_*`…) |
| Log `app`: `Existing schema has no migration history` | DB đã có bảng nhưng chưa có `gats_schema_migrations` → đặt `MIGRATION_BASELINE_THROUGH` = migration cuối cùng đã có trong DB |
| Nút Google lỗi trên máy khác | Origin chưa khai trong Google Console (đúng scheme + host, kể cả `www`) |
| Upload video báo "Failed to fetch" | Presigned URL không phải HTTPS → kiểm `S3_PUBLIC_ENDPOINT` / `S3_PUBLIC_BASE_URL` |
| Ảnh upload không hiện | `MINIO_PUBLIC_BASE_URL` sai, hoặc nginx thiếu `location /files-gats/` → `127.0.0.1:9010` |
| fe/admin gọi sai API | `NEXT_PUBLIC_API_URL` là biến nhúng lúc build — sửa rồi `up -d --build` |
| Giờ hiển thị lệch 7 tiếng | Session Postgres không phải UTC (service `db` phải có `TZ=UTC`) |

#### Build image thủ công (không qua compose)

```bash
docker build -t gats-academy .        # dùng giá trị mặc định localhost
```

> Biến nhúng lúc build (đổi phải build lại): `NEXT_PUBLIC_*` cho admin (Next.js), `PUBLIC_*` + `BANK_*` cho fe (Vite).

### Đổi fe / đổi dependency thì chạy lại thế nào

Source được mount vào container dev, nên **sửa code** thì không cần build lại. Nhưng **đổi `package.json`, đổi framework hay đổi biến nhúng lúc build** thì phải build lại:

```bash
cd ~/GATS
docker compose down
docker compose up -d --build      # build lại image dev rồi chạy
docker compose logs -f            # theo dõi tới khi fe/admin/be online
```

`node_modules` của be/admin/fe nằm trong volume nên rebuild image **không** cập nhật nó; `docker/dev-entrypoint.sh` tự so `package-lock.json` và chạy `npm ci` khi danh sách package đổi. Muốn cài lại sạch từ đầu thì xoá volume tương ứng:

```bash
docker compose down
docker volume rm gats_fe_node_modules     # hoặc gats_be_node_modules / gats_admin_node_modules
docker compose up -d --build
```

Production (VPS):

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f app
```

Cổng của fe nằm trong `fe/vite.config.js` (`server.port` + `preview.port`) — phải khớp `3002:3002` trong compose và `FRONTEND_URL` của be.

## 6. Lưu ý

- **Ảnh/file upload**: file upload (avatar, media, video) lưu ở S3 **trong** container dev. Trình duyệt chỉ xem được nếu mở thêm cổng S3 — bỏ comment 2 dòng `9010:9010` / `9011:9011` trong `docker-compose.yml` rồi `docker compose up -d`. Ảnh có sẵn trong repo (`/images/...`) không bị ảnh hưởng.
- **S3 local dùng RustFS** (`rustfs/rustfs`): image MinIO community (`minio/minio`) đã bị gỡ khỏi Docker Hub. RustFS nói cùng S3 API nên code không đổi; production vẫn trỏ `S3_*`/`MINIO_*` vào LongVan hoặc S3-compatible bất kỳ.
- **Cổng**: be `3000`, admin `3001`, fe `3002`. Cổng fe khai báo ở `fe/vite.config.js`; đổi cổng thì phải sửa cả `docker-compose*.yml`, `ecosystem*.js`, `be/config/.env.development` (`FRONTEND_URL`) và origin trong Google Console.
- **fe là SPA tĩnh** (Vite): dev chạy `vite` (HMR), prod build ra `fe/dist` rồi phục vụ bằng `serve -s dist` trong `ecosystem.config.js`. API URL/Google Client ID của fe là biến `PUBLIC_*` — nhúng lúc build, không đọc lúc chạy.
- **Video worker** (`be-worker`) chạy sẵn trong container dev để xử lý upload/transcode video.
- **Múi giờ — toàn hệ thống hiển thị GIỜ VIỆT NAM (GMT+7).** Quy ước lưu trữ: mọi cột `timestamp` trong DB là **UTC**, vì Drizzle ORM luôn ghi/đọc `timestamp without time zone` theo UTC (`value.toISOString()` khi ghi, `+0000` khi đọc). Do đó:
  - Session Postgres bị ghim `timezone=UTC` (`be/src/db/index.ts`, `be/docker/dev-entrypoint.sh`, service `db` trong compose prod) → `now()`/`defaultNow()` cũng là UTC. **Đổi session DB sang giờ Việt Nam sẽ làm mọi timestamp do DB sinh ra lệch đúng 7 giờ.**
  - Container đặt `TZ=Asia/Ho_Chi_Minh` + `/etc/localtime` (cả `Dockerfile` và `Dockerfile.dev`) để log/SSR hiển thị giờ VN.
  - Admin format qua `admin/src/lib/datetime.ts` (`formatVnDate`/`formatVnDateTime`, có `timeZone: Asia/Ho_Chi_Minh`); fe format qua `fe/src/shared/utils/datetime.js`. API luôn trả ISO/UTC.
- **Quiz / bài tập**: 5 dạng câu hỏi — `single_choice` (1 đáp án), `multiple_choice` (checkbox, nhiều đáp án), `true_false` (Đúng/Sai), `fill_blank` (điền chỗ trống), `short_answer` (trả lời ngắn). Giảng viên tạo/sửa thủ công tại **Admin → Khoá học → (khoá) → bài học Quiz**; không dùng AI sinh quiz nữa.
- **Chặn khoá học**: học viên đã ghi danh phải hoàn thành bài trước mới mở bài sau. Bài học dạng Quiz **chỉ hoàn thành khi ĐẠT** `passingScore` (%) — API giáo trình trả `locked: true/false` cho từng bài và ẩn nội dung của bài bị khoá. Giảng viên/quản trị không bị chặn.
- **Migrations**: `be/migrations/` là nguồn duy nhất khi chạy (`npm run db:migrate:versioned`). Hai migration `20260817120000_ai_tool_configs` và `20260817130000_ai_tool_prompt_payload` được copy từ `be/drizzle/` (lịch sử cũ) vì chuỗi migration cần chúng để tạo enum `ai_tool_type` + bảng `ai_tool_configs`.
- Đã bỏ khỏi repo: `docs/`, `mobile-app/`, `scripts/`, `viava/`, `deploy/`.
- Các tính năng gọi AI course-gen (quiz AI, coach, flashcard) gọi sang `viava` — dịch vụ này đã bị xoá nên các endpoint đó sẽ lỗi.
