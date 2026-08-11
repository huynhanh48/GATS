# Prompt tạo ảnh kiến trúc GATS Academy

```text
Use case: infographic-diagram
Asset type: polished Vietnamese system architecture infographic for a formal technical Word document.
Input image: the supplied diagram is the EDIT TARGET and immutable source of truth.

Restyle only. Do not reinterpret the architecture. Keep every component, group, label, arrow direction, solid line and dotted integration line exactly as in the input image. Do not add, remove, merge, duplicate or rename anything.

LOCKED CONNECTIONS:
- Quản trị viên -> Admin Dashboard
- Giảng viên -> Admin Dashboard
- Học viên -> Web học tập
- Học viên -> Mobile học viên
- Admin Dashboard -> NGINX
- Mobile học viên -> NGINX
- Web học tập -> NGINX
- NGINX -> API Core
- NGINX -> Viana AI
- API Core -> Người dùng
- API Core -> Khóa học và Học tập
- API Core -> Thương mại
- API Core -> Nội dung và Media
- API Core -> Thông báo
- API Core -> Viana AI
- API Core -> PostgreSQL
- API Core -> Redis / BullMQ
- Nội dung và Media -> MinIO
- Nội dung và Media -> Video Object Storage
- Nội dung và Media -> Redis / BullMQ
- Redis / BullMQ -> Video Worker
- Video Worker -> Video Object Storage
- API Core -.-> Google OAuth
- Thương mại -.-> SePay
- Thông báo -.-> FCM / SMTP
- Viana AI -.-> Azure OpenAI · Tavily · Qdrant

CENTERED LAYOUT:
- Portrait canvas with equal left and right margins and one strong vertical center axis.
- Actors centered in one row at the top.
- KÊNH TRUY CẬP centered below, with its three cards in one row.
- CỔNG TRUY CẬP and NGINX centered directly below.
- NGHIỆP VỤ LÕI centered below NGINX.
- Inside BACKEND EXPRESS :3000, API Core centered above five evenly spaced business modules; Viana AI centered below them.
- DỊCH VỤ BÊN NGOÀI and XỬ LÝ NỀN are balanced sibling panels below the core.
- DỮ LIỆU VÀ HẠ TẦNG centered across the bottom.
- Use tidy orthogonal connectors routed around cards with minimal crossings.

STYLE:
Bright white and pale-blue background, navy text, subtle blue borders, soft shadows, consistent rounded cards and professional line icons. Orange accent only for NGINX. Large, crisp and readable Vietnamese typography.

EXACT HEADINGS:
"KÊNH TRUY CẬP"
"CỔNG TRUY CẬP"
"NGHIỆP VỤ LÕI"
"BACKEND EXPRESS :3000"
"DỊCH VỤ BÊN NGOÀI"
"XỬ LÝ NỀN"
"DỮ LIỆU VÀ HẠ TẦNG"

Critical spelling: write exactly "NGHIỆP VỤ LÕI". LÕI means core. Never write "NGHIỆP VỤ LỖI".

Change only spacing, alignment, typography, icons, colors, card styling and connector routing. Preserve the topology exactly.

Avoid: invented services, removed nodes, merged nodes, duplicated nodes, changed arrow direction, changed solid/dotted semantics, diagonal overall composition, excessive whitespace, dark background, unreadable text, cropped content, watermark.
```

> Lưu ý: mô hình tạo ảnh vẫn có thể vẽ sai chữ hoặc đường nối dù prompt đã khóa. SVG/Mermaid phải là nguồn kiểm chứng kỹ thuật cuối cùng.
