# Kế Hoạch Thiết Kế Website GATS Academy
*(Chuyển Khối CTASection Sang Full-Bleed Background Image Con Người & Robot Tương Tác)*

---

## 🎨 1. Định Hướng Chuyển Đổi CTASection (`CTASection.tsx`)

- **Full-Bleed Background Image:** Chuyển khối CTA Cuối Trang từ phông nền cam phẳng sang **Ảnh Phông Nền Phủ Kín Toàn Phần (`bg-cover bg-center absolute inset-0`)** với hình ảnh con người đang làm việc thực tế kết hợp tương tác với AI công nghệ cao.
- **Gradient Overlay Cam/Dark Đẳng Cấp:** Phủ lớp mờ `from-[#0B0F17]/95 via-[#FF6B00]/85 to-[#0B0F17]/90` (hoặc `from-[#0B0F17]/95 via-[#0B0F17]/80 to-[#FF6B00]/40`), giữ cho hình ảnh làm việc & tương tác AI chìm nghệ thuật, chữ trắng & vàng amber rực rỡ nổi bật 100%.

---

## 🏗️ 2. Cấu Trúc Khối CTASection Mới (Full Background Layout)

1. **Khung Phông Nền Phủ Kín Toàn Phần (Full-Bleed):**
   - Ảnh nền: Con người làm việc nhóm & tương tác công nghệ AI (`https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&auto=format&fit=crop&q=80`).
   - Lớp phủ mờ tối & cam mượt mà.
2. **Nội Dung Nổi Phía Trên (Overlay Content):**
   - **Tagline:** `GATS ACADEMY` (Màu Cam Vibrant `#FF6B00` font-mono).
   - **Headline:** `Bắt đầu ứng dụng AI Agent vào công việc` (Chữ Trắng lớn & nổi bật).
   - **Subtitle Paragraph:** Đoạn mô tả hướng dẫn đăng ký tư vấn.
   - **CTA Buttons Bar:** Nút `Khám phá khóa học` (Cam `#FF6B00`) & Nút `Đăng ký tư vấn` (Nền thủy tinh mờ).
   - **Sub-note:** `Tư vấn miễn phí · Không cam kết · Phản hồi trong 24 giờ`.
