# Kế Hoạch Thiết Kế Website GATS Academy
*(Phóng To Banner Hero & Thay Ảnh Doanh Nhân + Mecha Robot Chuẩn Mẫu Eduma)*

---

## 🎨 1. Các Thay Đổi Trong Hero Section (`Hero.tsx`)

- **Loại bỏ Hoạt ảnh Hover:** Bỏ thuộc tính `group-hover:scale-102` khi di chuột vào ảnh theo đúng yêu cầu.
- **Phóng To Kích Thước Banner:**
  - Mở rộng container lên `max-w-6xl` / `max-w-7xl`.
  - Tăng chiều cao banner lên `h-[480px] sm:h-[600px] lg:h-[680px]` cho khung hình lớn, bao quát và ấn tượng.
- **Thay Ảnh Chuẩn Mẫu Eduma Screenshot:**
  - Hình ảnh: Doanh nhân mặc suit ngồi bên trái thao tác laptop đối diện với robot mecha cyborg hiện đại bên phải trong bối cảnh toàn cảnh thành phố về đêm lung linh.
  - Sử dụng hình ảnh AI nét cao kết hợp đường dẫn CDN HTTPS fallback an toàn.
