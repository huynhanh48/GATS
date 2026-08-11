# VPS Deployment Readiness — GATS Academy

> Audit: 28/07/2026 — kiểm tra lại lúc 15:00 sau các bản sửa release gate  
> Phạm vi: source hiện tại trong working tree, Backend, Web, Admin, Mobile contract, Docker Compose, migration, Nginx và runtime environment.  
> Kết luận hiện tại: **CONDITIONAL GO cho staging/VPS**, **chưa GO production traffic** cho đến khi commit/push, điền env thật và rehearsal migration trên bản sao DB.

## 1. Kết quả kiểm tra thực tế

| Kiểm tra | Kết quả | Kết luận |
|---|---|---|
| Backend `npm run build` | PASS | TypeScript production compile được |
| Web `npm run build` | PASS khi có Internet | Build cần tải Google Fonts |
| Admin `npm run build` | PASS | Có warning cấu hình `eslint` Next.js, không chặn build |
| Backend test mới idempotency/cursor | 6/6 PASS | Hai thay đổi Mobile P0 có test |
| Backend full test | **159/159 PASS** | Release gate source đã đạt |
| Mobile `dart analyze lib` | **0 error, 0 warning**, 38 info | Không còn lỗi compile/analyzer; exit 1 chỉ do telemetry ngoài workspace |
| Compose production `config -q` | PASS với bộ env giả đầy đủ | Cấu trúc YAML/interpolation hợp lệ |
| Compose với `.env` hiện tại | FAIL | `.env` root hiện chỉ có URL public, thiếu production secrets |
| Working tree | Nhiều file modified/untracked | `git pull` trên VPS chưa thể lấy các thay đổi chưa commit/push |

Lần build Web đầu thất bại vì sandbox không truy cập Google Fonts. Build lại với network đã PASS. Điều này không phải lỗi source trực tiếp, nhưng Docker build trên VPS sẽ phụ thuộc `fonts.googleapis.com`; nên self-host font nếu muốn build tái lập và không phụ thuộc mạng ngoài.

## 2. Blocker bắt buộc xử lý trước deploy

### BLOCKER 1 — Source Mobile Experience chưa commit/push

Working tree hiện có nhiều thay đổi và file mới, bao gồm:

- Migration `20260728150000_idempotency_status`.
- `FcmPushService`.
- Test idempotency/cursor.
- Mobile bootstrap/device registration/flashcard/daily API.
- Các sửa đổi auth refresh, progress outbox và idempotency.

Nếu VPS chỉ chạy `git pull`, các file này sẽ **không xuất hiện**.

Yêu cầu:

1. Review diff, loại secret và file tạm.
2. Commit toàn bộ source/migration cần deploy.
3. Push đúng branch.
4. Ghi lại commit SHA dùng để deploy.
5. Trên VPS xác nhận:

```bash
git rev-parse HEAD
git status --short
```

`git status --short` trên VPS phải rỗng trước khi build.

### RESOLVED — Full Backend test

Kết quả kiểm tra lại:

- 22/22 test files pass.
- 159/159 tests pass.
- Course detail fixture/contract và structured error assertions đã được đồng bộ.

Release gate:

```bash
cd BE
npx vitest run
```

Phải PASS toàn bộ hoặc từng failure phải có quyết định chấp nhận rủi ro được ghi rõ.

### RESOLVED — Mobile analyzer không còn error

`dart analyze lib` hiện không còn error hoặc warning. Còn 38 lint mức info; chúng không chặn VPS backend nhưng các cảnh báo `BuildContext across async gap` nên được xử lý trước mobile store release.

`flutter test` trong máy audit tiếp tục treo không output do Flutter tool/daemon của môi trường. Vì vậy vẫn phải chạy CI hoặc máy sạch trước khi phát hành AAB.

Release gate:

```bash
cd mobile-app
flutter analyze
flutter test
flutter build appbundle --release
```

### BLOCKER 4 — Production env chưa hoàn chỉnh

Root `.env` hiện chỉ thấy các key:

- `APP_URL`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

Compose production yêu cầu nhiều giá trị khác và hiện fail interpolation ở `POSTGRES_USER`.

Trên VPS phải:

```bash
cp .env.vps.example .env
chmod 600 .env
```

Điền tối thiểu:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `JWT_SECRET`
- `EMAIL_USER`, `EMAIL_PASSWORD`
- `APP_URL`, `FRONTEND_URL`
- `SEPAY_API_KEY`
- `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
- `MINIO_BUCKET_NAME`, `MINIO_PUBLIC_BASE_URL`
- `ADMIN_DEFAULT_EMAIL`, `ADMIN_DEFAULT_PASSWORD`
- Google OAuth IDs
- Bank/SePay configuration

Không dùng giá trị mặc định:

- `admin12345`
- `minioadmin`
- `changeme`
- JWT dev secret

Backend production có fail-fast và sẽ không start nếu thiếu/insecure các secret trọng yếu.

### RESOLVED IN SOURCE — Biến Mobile/FCM đã được truyền vào container

Backend đã đọc:

- `FCM_SERVICE_ACCOUNT_JSON`
- `FCM_PROJECT_ID`
- `MOBILE_FEATURE_FLAGS`
- `MOBILE_MIN_ANDROID_VERSION`
- `MOBILE_MIN_IOS_VERSION`
- `APPLE_CLIENT_ID`

Các biến đã được thêm vào cả Compose base, Compose production và `.env.vps.example`:

```yaml
FCM_SERVICE_ACCOUNT_JSON: ${FCM_SERVICE_ACCOUNT_JSON:-}
FCM_PROJECT_ID: ${FCM_PROJECT_ID:-}
MOBILE_FEATURE_FLAGS: ${MOBILE_FEATURE_FLAGS:-}
MOBILE_MIN_ANDROID_VERSION: ${MOBILE_MIN_ANDROID_VERSION:-1.0.0}
MOBILE_MIN_IOS_VERSION: ${MOBILE_MIN_IOS_VERSION:-1.0.0}
APPLE_CLIENT_ID: ${APPLE_CLIENT_ID:-}
```

Phần source/config mapping đã hoàn tất. Việc còn lại là cung cấp service account thật trên VPS và UAT delivery. Lưu ý: nếu không cấu hình FCM, outbox vẫn có nhánh đánh dấu `sent`; không nên bật `pushNotifications=true` trên production trước khi FCM được xác minh.

### BLOCKER 6 — Migration phải được rehearsal trên bản sao DB VPS

Ba migration mới:

1. `20260728130000_user_onboarding`
2. `20260728140000_mobile_experience`
3. `20260728150000_idempotency_status`

Entrypoint sẽ tự chạy migration trước PM2. Nếu migration lỗi, container `app` dừng — đây là hành vi đúng.

Không deploy trực tiếp vào DB duy nhất. Trước deploy:

```bash
pg_dump -Fc "$DATABASE_URL" -f gats-before-mobile-experience.dump
```

Restore dump vào DB tạm, chạy:

```bash
cd BE
DATABASE_URL='postgresql://.../gats_rehearsal' \
NODE_ENV=production \
node scripts/migrate-versioned.js
```

Sau đó smoke các endpoint auth, course, progress, bootstrap, order và notification.

Nếu DB live đã tồn tại nhưng chưa có `gats_schema_migrations`, không được chọn `MIGRATION_BASELINE_THROUGH` theo phỏng đoán. Phải xác định migration cuối cùng mà schema live thực sự đã có. Baseline sai có thể:

- Chạy lại migration đã được áp dụng thủ công.
- Bỏ qua migration mà DB chưa có.
- Làm source và schema lệch nhau.

Sau deploy baseline đầu tiên thành công, xóa `MIGRATION_BASELINE_THROUGH` khỏi `.env`.

## 3. Việc cần hoàn tất trước khi bật production traffic

### 3.1. DNS và TLS

Xác nhận A record:

- `gats.vn`
- `api.gats.vn`
- `admin.gats.vn`

Nếu VPS chưa có certificate, Nginx sẽ không start với config HTTPS hiện tại. Phải lấy certificate lần đầu trước:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm \
  --service-ports --entrypoint certbot certbot certonly --standalone \
  --agree-tos --no-eff-email -m ops@gats.vn \
  -d gats.vn -d api.gats.vn -d admin.gats.vn
```

Mở firewall:

- TCP 22 theo IP quản trị nếu có thể.
- TCP 80.
- TCP 443.

Không public Postgres, Redis và MinIO console. Compose production đã gỡ host ports của ba service này.

### 3.2. External providers

Google:

- Web origin `https://gats.vn`.
- Admin origin `https://admin.gats.vn`.
- Android OAuth client đúng package/SHA release.
- iOS URL scheme/client ID nếu phát hành iOS.

SePay:

- Webhook: `https://api.gats.vn/api/payment/sepay/webhook`.
- API key trên SePay trùng `SEPAY_API_KEY`.
- Chỉ nhận giao dịch tiền vào.
- Bật retry webhook.

Storage:

- Presigned upload URL phải là HTTPS.
- `S3_PUBLIC_ENDPOINT`/`S3_PUBLIC_BASE_URL` truy cập được từ browser/device.
- `MINIO_PUBLIC_BASE_URL=https://api.gats.vn/files-gats`.
- Test upload thumbnail, PDF và video thật.

Email:

- SMTP login được từ IP VPS.
- Verify-email/reset-password link dùng `https://api.gats.vn`.
- Kiểm tra SPF/DKIM/DMARC nếu gửi email production.

FCM:

- Service account chỉ lưu ở secret/env của VPS, không commit.
- `FCM_SERVICE_ACCOUNT_JSON` phải là JSON một dòng hoặc được escape đúng.
- Gửi thử đến một thiết bị thật.
- Invalid token phải được đánh dấu và không retry vô hạn.

### 3.3. Image build và dependency mạng

Web dùng `next/font/google`; Docker build phải truy cập Google Fonts. Build đã PASS khi có network.

Khuyến nghị:

- Ngắn hạn: xác nhận VPS/Docker truy cập được `fonts.googleapis.com` và `fonts.gstatic.com`.
- Bền vững: self-host các font cần thiết trong repo để image build tái lập.

Admin có warning:

```text
Unrecognized next.config.mjs option: eslint
```

Không chặn deploy hiện tại, nhưng nên xóa option legacy để log build sạch.

## 4. Checklist deploy an toàn

### Trước deploy

- [ ] Working tree đã review, commit và push.
- [ ] Ghi lại commit SHA release.
- [ ] Backend build PASS.
- [ ] Web build PASS.
- [ ] Admin build PASS.
- [ ] Full Backend test PASS hoặc có waiver rõ ràng.
- [ ] Mobile analyze không còn error.
- [ ] Mobile release build PASS nếu phát hành app cùng đợt.
- [ ] Compose đã mapping các biến FCM/Mobile/Apple.
- [ ] `.env` VPS đầy đủ và `chmod 600`.
- [ ] `docker compose ... config -q` PASS.
- [ ] DB backup `pg_dump -Fc` đã hoàn thành.
- [ ] Migration rehearsal trên DB restore PASS.
- [ ] DNS đúng IP VPS.
- [ ] Certificate đã tồn tại.

### Deploy

```bash
cd ~/GATS-ACADEMY
git fetch --all --prune
git pull --ff-only
git rev-parse HEAD

docker compose -p gats-academy \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  config -q

docker compose -p gats-academy \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up --build -d
```

Không chạy:

```bash
docker compose down -v
```

Lệnh này xóa volumes DB/Redis/MinIO.

### Ngay sau deploy

```bash
docker compose -p gats-academy \
  -f docker-compose.yml \
  -f docker-compose.prod.yml ps

docker compose -p gats-academy \
  -f docker-compose.yml \
  -f docker-compose.prod.yml logs --tail=300 app
```

Xác nhận:

- [ ] `app` healthy.
- [ ] DB/Redis/MinIO running.
- [ ] Migration log báo schema current.
- [ ] PM2 có API, worker, Web và Admin online.
- [ ] `https://api.gats.vn/health/live` trả 200.
- [ ] `https://api.gats.vn/health/ready` trả database/redis true.
- [ ] `https://gats.vn` mở được.
- [ ] `https://admin.gats.vn` mở được.
- [ ] Không có loop restart hoặc `unhandled_error`.

Chạy:

```powershell
powershell -File deploy/verify-production.ps1
```

### Smoke test bắt buộc

- [ ] Register/login email.
- [ ] Google login qua Web.
- [ ] Mobile login + silent refresh.
- [ ] `/api/mobile/bootstrap`.
- [ ] Onboarding recommendation và lưu answers.
- [ ] Enroll free với request retry.
- [ ] Mở video/preview.
- [ ] Progress sync và đổi thiết bị.
- [ ] Quiz/assignment submit với `Idempotency-Key`.
- [ ] Cart → tạo order → QR.
- [ ] SePay webhook → paid → enrollment.
- [ ] Notification list/read.
- [ ] Device registration + FCM push thật.
- [ ] Flashcard due/review/stats.
- [ ] Certificate sau khi hoàn thành course.

## 5. Rollback

Không rollback schema bằng cách sửa/xóa migration đã apply.

Nếu app mới lỗi nhưng migration tương thích ngược:

1. Deploy lại image/commit cũ.
2. Giữ DB hiện tại.
3. Xác nhận health và smoke.

Nếu migration làm hỏng dữ liệu/contract:

1. Dừng `app`.
2. Restore dump vào database mới.
3. Đổi `DATABASE_URL` sang DB restore.
4. Deploy commit cũ.
5. Giữ DB lỗi để phân tích, không overwrite backup.

## 6. Quyết định hiện tại

### Có thể làm ngay

- Dựng staging bằng source hiện tại sau khi commit/push và bổ sung env mapping.
- Rehearsal migration.
- Chạy smoke API/mobile trên thiết bị thật.

### Chưa nên làm

- Chưa nên mở traffic/payment production rộng.
- Chưa nên phát hành mobile build hiện tại vì còn compile error.
- Chưa nên bật push production trước khi Compose truyền FCM config và xác nhận delivery thật.
- Chưa nên bỏ qua 12 lỗi course-detail test khi chưa biết đó là fixture drift hay regression API.

### Điều kiện chuyển sang GO

1. Commit/push toàn bộ source và migration; VPS checkout đúng SHA.
2. Production `.env`, TLS, DNS và external provider được xác minh.
3. Migration rehearsal + backup/restore được xác nhận.
4. Staging smoke purchase-to-learn và cross-device progress pass.
5. Mobile test/AAB build chạy pass trên CI hoặc máy Flutter sạch nếu phát hành app cùng đợt.
