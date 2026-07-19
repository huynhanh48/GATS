# GATS ACADEMY

## 📌 Bảng tổng hợp các cổng (Ports) đang chạy

| Dịch vụ | Môi trường / Thư mục | Port | Ghi chú |
| --- | --- | --- | --- |
| **Backend API** | `BE` | `3000` | Cung cấp API chính cho toàn hệ thống |
| **Video Worker** | `BE` | `N/A` | Chạy ngầm (`npm run dev:worker`) xử lý video |
| **Web App** | `web-app` | `3005` | Giao diện học viên & người truy cập |
| **Admin Dashboard**| `admin-dashboard` | `9000` | Trang quản trị hệ thống |
| **PostgreSQL** | Docker (`BE`) | `5432` | Cơ sở dữ liệu chính |
| **Redis** | Docker (`BE`) | `6379` | Quản lý hàng đợi (Queue) & Cache |
| **MinIO** | Docker (`BE`) | `9010` | Lưu trữ file (S3 compatible) |

---
Dự án này bao gồm 3 phân hệ chính: Backend (BE), Web App, và Admin Dashboard.
Để chạy hệ thống một cách trơn tru ở môi trường phát triển (Development) cũng như giả lập môi trường chuẩn (Production), bạn cần khởi động lần lượt cả 3 phân hệ này.

Lưu ý: Bạn hãy mở 3 terminal riêng biệt để chạy từng lệnh dưới đây.

## 1. Backend (BE)
Backend cung cấp API và quản lý database. Chạy trên cổng `3000`.

```bash
cd BE
npm run dev
```
*Nếu báo lỗi kẹt cổng 3000, chạy lệnh sau để diệt tiến trình cũ (Windows PowerShell):*
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

## 2. Web App (Giao diện người dùng)
Giao diện dành cho học viên và người truy cập. Chạy trên cổng `3005`.

```bash
cd web-app
npm run dev
```
*Nếu báo lỗi kẹt cổng 3005, chạy lệnh sau để diệt tiến trình cũ (Windows PowerShell):*
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3005).OwningProcess -Force
```

## 3. Admin Dashboard (Trang quản trị)
Giao diện dành cho ban quản trị quản lý hệ thống. Chạy trên cổng `9000`.

```bash
cd admin-dashboard
npm run dev
```
*Nếu báo lỗi kẹt cổng 9000, chạy lệnh sau để diệt tiến trình cũ (Windows PowerShell):*
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 9000).OwningProcess -Force
```

---

**Lưu ý về CORS (Cross-Origin Resource Sharing):**
Hệ thống Backend đã được cấu hình chuẩn bảo mật CORS chỉ chấp nhận các kết nối đến từ các URL đã được định nghĩa trong `FRONTEND_URL` ở file `BE/.env.development`.
Nếu bạn gặp lỗi `Network Error` trên trình duyệt, hãy đảm bảo rằng bạn đang truy cập Web App bằng địa chỉ chuẩn `http://localhost:3005` (thay vì IP mạng LAN) để khớp với cấu hình được cấp phép.
