# Hướng dẫn vận hành ngay — GATS Academy

> Cập nhật: 22/07/2026  
> Đối tượng: người triển khai / tech lead  
> Liên quan: [`platform-readiness-audit.md`](./platform-readiness-audit.md) §13  
> Mục tiêu: làm **cụ thể từng bước** các việc còn lại trước staging/public sale (không thay UAT thiết bị thật).
> Phạm vi hiện tại: **không triển khai refund/refund request**. Refund chỉ được mở lại khi có quyết định sản phẩm riêng.

Máy làm việc mặc định trong hướng dẫn này: **Windows + PowerShell**, repo root:

```text
c:\Users\admin\Documents\CODE\GATS-ACADEMY
```

Các lệnh dưới đây chạy từ repo root trừ khi ghi rõ `cd BE` / `cd mobile-app`.

---

## Checklist nhanh

| # | Việc | Ai làm | Done khi |
|---|---|---|---|
| 1 | Rotate secrets + kiểm tra Git history | Ops / BE | Secret mới trên VPS + local; env không còn trên remote track |
| 2 | Rehearsal migration DB | BE | Empty DB + upgrade DB chạy được; smoke API OK |
| 3 | Staging purchase → learn → certificate | BE + Web | 1 đơn SePay thật / sandbox → enrollment → cert |
| 4 | Android signing keystore | Mobile | `key.properties` local; AAB ký release |
| 5 | Google OAuth SHA + client Android/iOS | Mobile | Login Google trên máy thật thành công |
| 6 | UAT Mobile checkout / coupon / progress | Mobile + BE | Checklist §6 tick hết |
| 7 | Admin bank account / reconciliation | Admin | Có UI hoặc quy trình thủ công ghi nhận |
| 8 | Dọn mock/template production | Web/Admin/Mobile | Không lộ demo route / mock learner |
| 12 | Admin UAT staging (commerce + instructor) | Admin + Ops | Checklist [`admin-uat-checklist.md`](./admin-uat-checklist.md) tick hết |
| 9 | Security gate: CORS/origin/webhook | BE + Ops | Chỉ allowlist domain thật; webhook chống replay/dedup |
| 10 | CI/release/rollback gate | Tech lead + Ops | Build/check/test pass; có image tag, backup và rollback đã thử |
| 11 | Legal/store readiness | Product + Mobile | Privacy, terms, account deletion, Data Safety/TestFlight hoàn tất |

---

## 1. Rotate secrets và xử lý env đã lộ

### 1.1. Vì sao phải làm

- File `BE/.env.development` **từng được Git track**. Source đã `git rm --cached` + gitignore, nhưng nếu từng `push` remote thì secret trong **history** vẫn lộ.
- Coi các giá trị cũ là **compromised** và đổi hết.

### 1.2. Danh sách secret cần đổi

| Biến | Ở đâu dùng | Cách tạo mới |
|---|---|---|
| `JWT_SECRET` | BE auth cookie/Bearer | Chuỗi ≥ 32 ký tự random |
| `EMAIL_PASSWORD` | Gmail/app password gửi mail verify | Google Account → App passwords |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Video storage | Panel LongVan / MinIO |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Media files | MinIO / panel |
| `SEPAY_API_KEY` | Webhook/poll bank transfer | Dashboard SePay |
| `VNP_HASH_SECRET` / `VNP_TMN_CODE` | Nếu còn VNPay | Dashboard VNPay |
| `ADMIN_DEFAULT_PASSWORD` | Seed admin lần đầu | Đổi mạnh; không dùng `admin12345` trên prod |
| `POSTGRES_PASSWORD` | DB Compose/VPS | Random; cập nhật `DATABASE_URL` |
| `GOOGLE_CLIENT_ID` | BE verify `idToken` | Google Cloud Console (Web client) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Web GIS button | **Phải trùng** Web client ID với BE |

Template tham chiếu (không chứa secret vào Git):

- `BE/config/.env.example`
- `.env.vps.example` (nếu dùng Compose/VPS)

### 1.3. Tạo JWT mới (PowerShell)

```powershell
# 48 bytes → Base64 (~64 ký tự)
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Dán vào `JWT_SECRET=` trong:

- Local: `BE/.env.development` và/hoặc `BE/config/.env.development`
- VPS: file env production / secrets manager (không commit)

### 1.4. Cập nhật env local (không commit)

```powershell
cd BE
# Mở file local (đã gitignore) và điền secret MỚI
notepad .env.development
# hoặc
notepad config\.env.development
```

Kiểm tra file **không** còn staged:

```powershell
cd ..
git status --short BE/.env.development
# Kỳ vọng: có thể hiện D trong index ở lần untrack đầu tiên.
# Quan trọng: lệnh sau phải KHÔNG trả về đường dẫn sau khi commit thay đổi untrack:
git ls-files BE/.env.development

# Xác nhận Git đang ignore file local:
git check-ignore -v BE/.env.development
```

### 1.5. Cập nhật VPS / Compose

1. SSH vào VPS.
2. Sửa file env thật (ví dụ `.env` cạnh `docker-compose.yml`).
3. Đảm bảo service `app` có `NODE_ENV=production` (đã có override trong `docker-compose.yml`).
4. Restart:

```bash
docker compose -p gats-academy up -d --build --force-recreate app
```

5. Đăng nhập lại mọi client (JWT cũ sẽ invalid sau khi đổi `JWT_SECRET`).

### 1.6. Rà Git history (nếu từng push env)

Kiểm tra file còn trong history:

```powershell
git log --all --full-history -- BE/.env.development
```

Nếu có commit chứa file:

1. **Ngay**: rotate hết secret (bước trên) — quan trọng nhất.
2. **Tuỳ chọn nặng**: rewrite history (`git filter-repo`) rồi force-push — chỉ khi team đồng ý; backup remote trước.
3. Báo provider (Google, SePay, S3) nếu key đã public lâu.

Không bắt buộc rewrite history nếu secret đã rotate và không còn dùng key cũ.

---

## 2. Rehearsal migration database

### 2.1. Migration vừa thêm

Thư mục:

```text
BE/drizzle/20260722120000_phase1_ops_learning_extras/migration.sql
```

Nội dung chính: `leads`, `payment_exceptions`, `coupons` / `coupon_redemptions`, `certificates`, lesson Q&A / notes / bookmarks, `notifications`, `audit_logs`, cột `lessons.linked_post_id`, cột coupon trên `orders`.

SQL dùng `IF NOT EXISTS` / guarded `ADD COLUMN` — an toàn hơn khi DB đã push schema một phần.

### 2.2. Chuẩn bị Postgres

**Cách A — Docker (khuyến nghị):**

```powershell
# Bật Docker Desktop trước
docker compose -p gats-academy up -d db
# Đợi healthy
docker compose -p gats-academy ps
```

Connection mặc định Compose:

```text
postgresql://postgres:postgres@localhost:5432/postgres
```

**Cách B — Postgres cài sẵn:** chỉnh `DATABASE_URL` trong env BE cho khớp.

### 2.3. Kịch bản A — DB rỗng (empty install)

1. Tạo DB mới (ví dụ `gats_empty`):

```powershell
docker exec -it gats-academy-db-1 psql -U postgres -c "CREATE DATABASE gats_empty;"
# Tên container có thể khác — xem: docker ps
```

2. Chạy **toàn bộ** migration theo thứ tự thư mục trong `BE/drizzle/` (từ cũ → mới), hoặc dùng toolchain Drizzle nếu journal đã đồng bộ.

Vì một số folder migration cũ thiếu `meta/_journal.json` đầy đủ, cách chắc trên staging hiện tại:

```powershell
cd BE
# Áp dụng lần lượt từng migration.sql bằng psql (empty DB)
$dbContainer = docker compose -f ..\docker-compose.yml -p gats-academy ps -q db
if (-not $dbContainer) { throw "DB container chưa chạy" }

Get-ChildItem .\drizzle -Directory | Sort-Object Name | ForEach-Object {
  $sql = Join-Path $_.FullName "migration.sql"
  if (Test-Path $sql) {
    Write-Host ">>> Applying $($_.Name)"
    Get-Content $sql -Raw | docker exec -i $dbContainer psql -v ON_ERROR_STOP=1 -U postgres -d gats_empty
    if ($LASTEXITCODE -ne 0) { throw "Migration fail: $sql" }
  }
}
```

3. Smoke:

```powershell
# Liệt kê bảng mới
docker exec -it $dbContainer psql -U postgres -d gats_empty -c "\dt"
# Kỳ vọng có: leads, coupons, certificates, lesson_questions, notifications, ...
```

### 2.4. Kịch bản B — Upgrade DB đang chạy (staging)

1. **Backup trước:**

```powershell
$stamp = Get-Date -Format yyyyMMdd_HHmm
$backupPath = "backup_staging_$stamp.dump"
$dbContainer = docker compose -f ..\docker-compose.yml -p gats-academy ps -q db
docker exec $dbContainer pg_dump -U postgres -Fc postgres -f /tmp/gats_staging.dump
docker cp "${dbContainer}:/tmp/gats_staging.dump" $backupPath
if (-not (Test-Path $backupPath)) { throw "Không tạo được backup" }
```

2. Chỉ chạy migration mới nếu các migration cũ đã apply:

```powershell
Get-Content .\drizzle\20260722120000_phase1_ops_learning_extras\migration.sql -Raw |
  docker exec -i $dbContainer psql -v ON_ERROR_STOP=1 -U postgres -d postgres
if ($LASTEXITCODE -ne 0) { throw "Upgrade migration thất bại — dừng deploy" }
```

3. Nếu có lỗi: **dừng deploy**, lưu log và so sánh schema. Không bỏ qua thủ công chỉ vì thấy chữ duplicate; phải xác nhận constraint/index/cột thực tế đúng kiểu và đúng FK.

4. Smoke API (BE đang trỏ đúng DB):

```powershell
cd BE
npm run build
npm run start
# hoặc npm run dev
```

Gọi nhanh (đổi token/URL cho đúng):

| API | Kỳ vọng |
|---|---|
| `GET /api/user/me` (có Bearer) | 200 + user |
| `POST /api/coupons/preview` | 200 hoặc 4xx business, không 500 schema |
| `GET /api/orders` | 200 list |
| `GET /api/certificates/mine` | 200 |

### 2.5. Ghi nhận kết quả

Điền vào bảng nội bộ / ticket:

| Kiểm tra | Empty DB | Upgrade staging |
|---|---|---|
| Migration apply không lỗi fatal | ☐ | ☐ |
| Bảng mới tồn tại | ☐ | ☐ |
| BE boot + smoke API | ☐ | ☐ |
| Backup trước upgrade | — | ☐ |

### 2.6. Rollback/forward-fix

Migration này chủ yếu additive nhưng không nên tự động `DROP` khi rollback vì có thể mất lead/coupon/certificate đã phát sinh.

1. Trước migration: lưu custom-format backup (`.dump`) và ghi image/commit đang chạy.
2. Nếu migration fail trước khi app mới lên: giữ app cũ, sửa SQL rồi chạy lại trên bản clone của staging.
3. Nếu app mới đã lên nhưng lỗi: rollback image/app về tag cũ; database ưu tiên **forward-fix**.
4. Chỉ restore toàn DB khi có sự cố nghiêm trọng và đã chấp nhận mất dữ liệu phát sinh sau thời điểm backup.

---

## 3. Staging E2E: mua → học → chứng chỉ

Làm trên **staging** (HTTPS, SePay + bank thật hoặc tài khoản test SePay).

### 3.1. Điều kiện trước

- [ ] BE `NODE_ENV=production` trên staging
- [ ] Migration §2 đã apply
- [ ] `SEPAY_API_KEY`, `BANK_*` đúng
- [ ] Web `NEXT_PUBLIC_API_URL` trỏ staging API
- [ ] Có user learner test + 1 khóa có giá > 0 + (tuỳ chọn) coupon test

### 3.2. Luồng Web

1. Đăng ký / login email (hoặc Google sau khi OAuth OK).
2. Thêm khóa vào giỏ → checkout.
3. Áp mã giảm giá (nếu có) → tạo đơn **bank transfer**.
4. Quét QR / chuyển khoản đúng `txnRef` + số tiền.
5. Chờ poll/webhook → đơn `paid` → enrollment xuất hiện.
6. Vào `/learning` → xem video → mark complete / quiz / assignment tối thiểu.
7. Hoàn thành khóa → kiểm tra certificate trong profile + Admin certificates.

### 3.3. Luồng Mobile (song song hoặc sau)

1. Login cùng account.
2. Thấy khóa đã mua trong học tập.
3. Progress khớp Web (lesson đã complete).
4. Checkout một khóa khác bằng QR; coupon; xem **Đơn hàng của tôi**.

### 3.4. Ghi lỗi thường gặp

| Triệu chứng | Kiểm tra |
|---|---|
| QR tạo được nhưng không paid | SePay API key, webhook URL public, amount mismatch → Admin payment exceptions |
| Paid nhưng không vào học | Enrollment service / order status; Admin repair enrollment |
| Coupon 500 | Migration `coupons` / cột `orders.coupon_code` |
| Cert không ra | Rule auto-issue khi complete course; Admin issue tay |

---

## 4. Android release signing

### 4.1. Tạo keystore (một lần, giữ bản backup)

Trong PowerShell (cần JDK/`keytool` trong PATH):

```powershell
cd mobile-app\android
keytool -genkey -v `
  -keystore gats-upload.jks `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -alias gats-upload
```

Nhập mật khẩu store/key và thông tin tổ chức. **Backup file `.jks` + mật khẩu** ra chỗ an toàn (không commit).

### 4.2. Tạo `key.properties`

```powershell
cd mobile-app\android
copy key.properties.example key.properties
notepad key.properties
```

Ví dụ nội dung:

```properties
storePassword=MAT_KHAU_STORE
keyPassword=MAT_KHAU_KEY
keyAlias=gats-upload
storeFile=gats-upload.jks
```

`storeFile` là đường dẫn relative tới thư mục `android/app/` **hoặc** absolute. Nếu đặt `.jks` cạnh `android/`:

```properties
storeFile=../gats-upload.jks
```

File này đã nằm trong `.gitignore` — **không** `git add`.

### 4.3. Build AAB / APK release

```powershell
cd mobile-app
flutter pub get
flutter build appbundle --release
# hoặc
flutter build apk --release
```

Artifact:

- AAB: `build/app/outputs/bundle/release/app-release.aab`
- APK: `build/app/outputs/flutter-apk/app-release.apk`

Nếu thiếu `key.properties`, Gradle **fallback debug key** (chỉ smoke local — **không** lên Play Store).

### 4.4. Package ID hiện tại

- `applicationId` / namespace: **`com.gat.academy`**
- Đổi từ `com.gat.academy.test` → mọi OAuth / Firebase / Play listing phải dùng ID mới.

---

## 5. Google OAuth (Android / iOS) + hydrate `/me`

### 5.1. Contract BE (đã đúng source)

| | Giá trị |
|---|---|
| Path | `POST /api/user/auth/google` |
| Body | `{ "idToken": "<google_id_token>" }` |
| Sau login | Mobile gọi `GET /api/user/me` để lấy user |

BE cần `GOOGLE_CLIENT_ID` = **Web client ID** (audience của `idToken` từ Google Sign-In thường là Web client).

### 5.2. Google Cloud Console

1. Mở [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Giữ / tạo **OAuth 2.0 Client ID → Web application** → copy Client ID vào:
   - BE: `GOOGLE_CLIENT_ID`
   - Web: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Mobile: `assets/config/google_oauth.json` → `client_id` (dùng làm `serverClientId`)
3. **Bắt buộc cho Android** — tạo thêm client **Android** (thiếu bước này → log `[16] Account reauth failed` / CredMan cancel):
   - Package name: **`com.gat.academy`**
   - SHA-1 **debug** (máy hiện tại):

```text
CA:DE:23:1B:47:E9:9B:8E:F2:02:F1:F0:22:3D:04:31:9F:0C:10:D4
```

   - SHA-256 debug (nên thêm):

```text
C9:E2:B3:8F:EB:66:CF:29:17:39:0D:B9:80:A2:CD:15:4C:66:4C:D5:03:F7:3A:31:62:80:C7:6A:07:72:0B:B4
```

4. Sau khi lưu client Android, đợi 5–15 phút, **gỡ app** rồi `flutter run` lại (Google cache config theo package).
5. Lấy SHA-1 debug trên máy khác:

```powershell
keytool -list -v -alias androiddebugkey `
  -keystore "$env:USERPROFILE\.android\debug.keystore" `
  -storepass android -keypass android
```

6. SHA-1 **release** (`gats-upload.jks`) — thêm vào cùng Android client hoặc client riêng:

```powershell
keytool -list -v -alias gats-upload -keystore mobile-app\android\gats-upload.jks
```

7. Tạo **iOS** client (khi build iOS):
   - Bundle ID khớp Xcode
   - Thêm URL scheme = reversed client ID vào `Info.plist`

> Lưu ý: `google_oauth.json` chỉ chứa **Web client ID** (đúng cho `serverClientId`). Android client **không** bỏ vào file đó — Google tự nhận diện qua package + SHA.

Lưu ý phân loại client:

- Web `Authorized JavaScript origins`: `https://gats.vn` và domain thực sự người dùng truy cập. Chỉ thêm `https://www.gats.vn` nếu DNS/reverse proxy thật sự phục vụ hostname này.
- `https://api.gats.vn` không phải browser origin của nút GIS, trừ khi chính trang đăng nhập được render tại domain API.
- Luồng hiện tại nhận Google ID token rồi POST về BE, không phải OAuth authorization-code callback; không tự thêm domain gốc vào `Authorized redirect URIs` nếu source không có callback route tương ứng.
- Android/iOS OAuth clients dùng package/bundle + SHA/URL scheme; không thay thế Web client ID mà BE dùng làm audience.

### 5.3. Kiểm thử trên máy thật

```powershell
cd mobile-app
flutter run --release
# hoặc debug với cleartext local: flutter run
```

Checklist:

- [ ] Bấm Google → không 400/422 path cũ `/api/user/login`
- [ ] Nhận token → profile hiện tên/email từ `/me`
- [ ] Kill app → mở lại vẫn session (secure storage)
- [ ] Sign out → gọi logout BE + xoá local

Apple: **giữ ẩn production** đến khi BE có `/auth/apple`.

---

## 6. UAT Mobile commerce + progress

### 6.1. Checkout Phase 1

- [ ] Màn thanh toán **chỉ** hiện QR ngân hàng / SePay (không MoMo/VNPay/Visa trên release)
- [ ] Tạo đơn → hiện QR + `txnRef`
- [ ] Poll ~3s → khi paid → enrollment
- [ ] Áp coupon → số tiền giảm → đơn có `couponCode`
- [ ] **Đơn hàng của tôi** list + hủy đơn `pending`

### 6.2. Progress Web ↔ Mobile

- [ ] Complete lesson trên Web → Mobile thấy đã học (và ngược lại)
- [ ] Offline: tắt mạng → mở lesson đã cache prefs không crash; bật mạng → sync lại
- [ ] Đổi máy / reinstall → login lại → progress từ BE (không mất hết)

### 6.3. Learning parity tối thiểu

- [ ] Quiz submit
- [ ] Assignment text/URL
- [ ] Q&A / note / bookmark trong lesson
- [ ] Hub certificates từ API (không chỉ mock XP)

### 6.4. Cleartext

- Release: HTTP cleartext **tắt** (`network_security_config` main).
- Debug: vẫn cho local `10.0.2.2` / localhost.
- Staging/production API phải **HTTPS**.

---

## 7. Admin — bank account & reconciliation (P1)

Hiện BE có entity `bank_accounts` + Admin UI tại `/bank-accounts` (CRUD + đặt mặc định + export CSV).

### Quy trình tay hàng ngày (đủ trước launch nếu UI chưa dùng)

1. Xác nhận tài khoản nhận tiền: Admin **Thanh toán → Tài khoản ngân hàng**, hoặc env `BANK_*` / seed `BankAccountService.seedFromEnvIfEmpty`.
2. Mỗi ngày: xuất giao dịch SePay (dashboard) và đối chiếu với Admin **Đơn hàng** (filter paid theo ngày) hoặc CSV orders.
3. Mismatch amount / not-found → **Ngoại lệ thanh toán** → Resolve + audit.
4. Ghi chú ngày đối chiếu (sheet nội bộ hoặc ticket).

Khi cần thêm: export CSV bank accounts từ Admin; không cần import bank statement tự động trước public.

UAT đầy đủ: [`admin-uat-checklist.md`](./admin-uat-checklist.md) mục D.

---

## 8. Dọn mock / template khỏi production path

| Surface | Việc |
|---|---|
| Web | Ẩn/xoá route demo (`/promptcowboy`, `/simple`, …) hoặc feature-flag |
| Admin | Ẩn/xoá route demo (`/charts`, `/forms`, `/tables`, `/calendar`, `/ui-elements`) — đã gỡ khỏi app |
| Mobile | Feature-flag hoặc bỏ Hub XP/badge/leaderboard mock, AI coach mock, group chat mock, Admin/Mentor shell khỏi **release** build (`kReleaseMode`) |

Ưu tiên: learner path release không còn phụ thuộc `MockData` cho chứng chỉ/commerce (đã chuyển API).

---

## 9. CI & observability (trước public)

### 9.1. CI tối thiểu

| Job | Lệnh |
|---|---|
| BE build | `cd BE && npm run build` |
| BE toàn project | `cd BE && npm run type-check` — **hiện đang FAIL**, phải sửa seed/legacy tests/Vitest trước khi bật required gate |
| Web build | `cd web-app && npm run build` |
| Admin typecheck | `cd admin-dashboard && npm run typecheck` |
| Mobile | `cd mobile-app && .\scripts\ci_smoke.ps1` |
| Diff hygiene | `git diff --check` |

Không đánh dấu CI xanh bằng cách bỏ `BE/scripts`, test hoặc Vitest khỏi type-check. Có thể tách job production build và legacy-test debt, nhưng cả hai phải hiển thị rõ trạng thái; trước public launch, required jobs đều phải pass.

### 9.2. Observability checklist

- [ ] Health endpoint (DB/Redis)
- [ ] Log có request id; không log Bearer/token
- [ ] Alert fail webhook SePay / queue video
- [ ] Backup Postgres lịch + thử restore 1 lần

### 9.3. Security gate còn thiếu trong source

- [ ] Thay CORS `origin: true` bằng allowlist từ env (`gats.vn`, `admin.gats.vn`, các origin staging được duyệt).
- [ ] `originGuard` không còn pass-through toàn bộ request nhạy cảm.
- [ ] Xác nhận Express `trust proxy` đúng số hop; cookie `Secure` hoạt động sau HTTPS reverse proxy.
- [ ] SePay webhook có xác thực phù hợp, chống replay/dedup và không log secret/raw payload nhạy cảm.
- [ ] Rate limit dùng shared store (Redis) nếu chạy nhiều instance.
- [ ] Kiểm tra không có secret trong image, build log, `.env` tracked hoặc client-side `NEXT_PUBLIC_*` ngoài dữ liệu public.

### 9.4. Release và rollback gate

Trước mỗi lần deploy production:

1. Gắn commit/tag hoặc image tag bất biến; không deploy chỉ bằng `latest` từ working tree chưa commit.
2. Chạy BE build + type-check, Web build, Admin typecheck, Mobile smoke và E2E staging.
3. Backup DB, ghi version migration và kiểm tra dung lượng backup.
4. Deploy app, chạy health/smoke, quan sát payment/auth/error logs ít nhất một chu kỳ giao dịch.
5. Nếu smoke fail: rollback image về tag trước; database dùng forward-fix theo §2.6.

### 9.5. Legal và mobile store gate

- [ ] Privacy Policy, Terms, support URL và thông tin pháp nhân hiển thị đúng production.
- [ ] Có luồng yêu cầu xóa tài khoản/dữ liệu và quy trình xử lý PII.
- [ ] Hoàn thiện Google Play Data Safety; iOS privacy manifest/App Privacy.
- [ ] Android AAB ký release, Play App Signing/track nội bộ; iOS certificates/provisioning/TestFlight.
- [ ] Crash reporting/analytics consent và notification permission UX.
- [ ] Accessibility, tablet, low-end device và mạng chậm đã UAT.

---

## 10. Thứ tự đề xuất trong 1–2 tuần

```text
Ngày 1–2   §1 Rotate secrets + cập nhật VPS
Ngày 2–3   §2 Migration empty + upgrade staging
Ngày 3–5   §3 E2E Web purchase→learn→cert (+ SePay)
Ngày 4–6   §4 Keystore + §5 OAuth SHA + Google trên máy thật
Ngày 6–8   §6 UAT Mobile checkout/coupon/progress
Ngày 8–10  §7–§8 Admin ops + dọn mock
Ngày 9–11  §9.3 Security gate + §9.5 legal/store
Ngày 10+   §9 CI/alert/release rollback; chỉ mở bán khi DoD trong audit §12 đạt
```

---

## Phụ lục A — Lệnh “sống còn” nhớ nhanh

```powershell
# Repo root
cd c:\Users\admin\Documents\CODE\GATS-ACADEMY

# BE production build
cd BE; npm run build

# BE full type-check (hiện còn debt — phải pass trước public)
npm run type-check

# Infra local
cd ..
docker compose -p gats-academy --profile dev up -d db redis minio minio-init worker
# Worker S3: cùng BE/config/.env.development (LongVan). API chạy host + worker Docker
# phải trỏ cùng bucket — không dùng MinIO in-cluster cho video transcode.

# Mobile smoke
cd mobile-app
.\scripts\ci_smoke.ps1

# SHA release
keytool -list -v -alias gats-upload -keystore android\gats-upload.jks
```

## Phụ lục B — Việc code đã xong (không làm lại)

- BE cookie `getCookieOptions(req?)` — build pass
- Compose `app` → `NODE_ENV=production`
- Untrack + gitignore `BE/.env.development`
- Migration SQL `20260722120000_phase1_ops_learning_extras`
- Mobile: Google `/auth/google` + `idToken` + `/me`
- Mobile: checkout mặc định chỉ QR/SePay; coupon; order history; account/password
- Mobile: `applicationId com.gat.academy`; cleartext tắt trên release

Refund/refund request: **deferred**, không nằm trong checklist vận hành hiện tại.

Chi tiết trạng thái: [`platform-readiness-audit.md`](./platform-readiness-audit.md).

## Phụ lục C — Liên hệ file quan trọng

| File | Vai trò |
|---|---|
| `docs/platform-readiness-audit.md` | Đánh giá + backlog P0/P1 |
| `docker-compose.yml` | Stack; `app` production env |
| `BE/drizzle/20260722120000_phase1_ops_learning_extras/migration.sql` | Schema extras |
| `BE/config/.env.example` | Template env BE |
| `mobile-app/android/key.properties.example` | Template signing |
| `mobile-app/android/app/build.gradle.kts` | applicationId + signing |
| `mobile-app/lib/core/config/social_auth_config.dart` | Google client config |
