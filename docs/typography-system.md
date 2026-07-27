# GATS Academy Typography System

## Font families

- **Inter**: font mặc định cho Web, Admin và Mobile. Dùng cho nội dung, điều
  hướng, biểu mẫu, bảng, nút, giao diện học tập và toàn bộ màn hình nghiệp vụ.
- **Outfit**: chỉ dùng cho tiêu đề thương hiệu hoặc marketing cần tạo điểm
  nhấn. Không dùng cho đoạn văn dài, bảng hoặc biểu mẫu.
- **Monospace**: chỉ dùng cho code, ID, mã đơn hàng, mã giao dịch và dữ liệu
  kỹ thuật cần canh đều ký tự.

## Font weights

| Mục đích | Weight |
| --- | --- |
| Nội dung thường | 400 |
| Label, navigation | 500 |
| Tiêu đề nhỏ, nút nhấn mạnh | 600 |
| Tiêu đề trang, heading thương hiệu | 700 |

Không dùng weight 800–900 cho nội dung chức năng. Heading hero có thể dùng
800 khi cần giữ đúng nhận diện marketing.

## Line height

- Heading: 1.2–1.3
- Body và nội dung học tập: 1.5–1.6
- Label, navigation và button: 1.3–1.4

## Platform mapping

- Web: `font-sans` → Inter, `font-heading` → Outfit.
- Admin: `font-sans` → Inter; Outfit chỉ được dùng rõ ràng bằng
  `font-heading`.
- Mobile: `AppTypography.style()` → Inter,
  `AppTypography.headingStyle()` → Outfit.

Các component phải kế thừa font từ theme. Không hard-code Satoshi, DM Sans,
Helvetica Neue, Arial hoặc Roboto trừ khi chúng nằm trong fallback.
