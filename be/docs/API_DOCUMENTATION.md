# TÀI LIỆU TOÀN BỘ API BACKEND GATS ACADEMY

> **GATS ACADEMY API REFERENCE**
> - Phiên bản hệ thống: `Node.js (Express 5 + TypeScript + Drizzle ORM + PostgreSQL + Redis)`
> - Cập nhật ngày: 2026-09-09
> - Tổng số API Endpoint: **301 endpoints** trên **33 phân hệ nghiệp vụ**

---

## 1. THÔNG TIN KẾT NỐI & QUY CHUẨN KỸ THUẬT

### 1.1. Base URL
- **Môi trường cục bộ (Local / Dev)**: `http://localhost:3000` (hoặc qua IP LAN cho Mobile testing: `http://<LAN_IP>:3000`)
- **Môi trường Production (VPS)**: `https://api.gats.vn`

### 1.2. Headers chuẩn
```http
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN>
x-timezone: Asia/Ho_Chi_Minh
```

### 1.3. Cấu trúc phản hồi (Response Envelope)
Mọi response từ backend đều tuân theo cấu trúc chuẩn đồng nhất:
```json
{
  "data": { ... },
  "message": "Thành công",
  "meta": {
    "requestId": "req_c7a1f9e2...",
    "serverTime": "2026-09-09T08:00:00.000Z"
  }
}
```
Khi xảy ra lỗi (Error Envelope):
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | ...",
    "message": "Chi tiết lỗi mô tả bằng tiếng Việt",
    "details": { ... },
    "retryable": false
  },
  "meta": { "requestId": "...", "serverTime": "..." }
}
```

### 1.4. Bảng ký hiệu phân quyền
- 🌐 **Công khai (Public)**: Không cần đăng nhập.
- ⚪ **Tùy chọn (Public / User)**: Có thể gửi hoặc không gửi token; có token sẽ nhận thêm ngữ cảnh cá nhân.
- 🟢 **Đăng nhập (User JWT)**: Bắt buộc gửi Bearer Token qua Header `Authorization: Bearer <token>`.
- 🟡 **Giảng viên / Creator**: Tài khoản có vai trò `instructor` hoặc quyền tạo/sửa khóa học.
- 🟠 **Staff / Quản trị**: Tài khoản nhân sự, kiểm duyệt, vận hành.
- 🔴 **Admin Only**: Quyền tối cao ban quản trị hệ thống.
- 🟣 **RBAC Permission**: Kiểm tra quyền chi tiết theo bảng phân quyền động (Permissions table).

---

## 2. MỤC LỤC DANH MỤC CÁC PHÂN HỆ API

1. [ADMIN-METRICS (1 APIs)](#admin-metrics)
2. [ADMIN-USER (9 APIs)](#admin-user)
3. [AI-COACH (7 APIs)](#ai-coach)
4. [AI-TOOL-CONFIG (8 APIs)](#ai-tool-config)
5. [ANALYTICS (2 APIs)](#analytics)
6. [ASSIGNMENT (10 APIs)](#assignment)
7. [BANK-ACCOUNT (7 APIs)](#bank-account)
8. [BANNED-WORD (4 APIs)](#banned-word)
9. [CART (5 APIs)](#cart)
10. [CATEGORY (5 APIs)](#category)
11. [CERTIFICATE (6 APIs)](#certificate)
12. [COUPON (6 APIs)](#coupon)
13. [COURSE-CHAT (4 APIs)](#course-chat)
14. [COURSE-MENU (8 APIs)](#course-menu)
15. [COURSE (36 APIs)](#course)
16. [ENROLLMENT (9 APIs)](#enrollment)
17. [FLASHCARD (9 APIs)](#flashcard)
18. [HEALTH (2 APIs)](#health)
19. [LEAD (5 APIs)](#lead)
20. [LEARN-EXTRAS (14 APIs)](#learn-extras)
21. [MEDIA (6 APIs)](#media)
22. [MEMBERSHIP (8 APIs)](#membership)
23. [MOBILE (6 APIs)](#mobile)
24. [MODERATION (2 APIs)](#moderation)
25. [NOTIFICATION (5 APIs)](#notification)
26. [ORDER (14 APIs)](#order)
27. [PAYMENT (5 APIs)](#payment)
28. [POST (24 APIs)](#post)
29. [PROGRESS (5 APIs)](#progress)
30. [QUIZ (22 APIs)](#quiz)
31. [TAG (5 APIs)](#tag)
32. [USER (28 APIs)](#user)
33. [VIDEO (14 APIs)](#video)

---

## 3. CHI TIẾT CÁC PHÂN HỆ ENDPOINT

<a id='admin-metrics'></a>
### 28. Phân hệ Chỉ số Tổng quan Hệ thống (Admin Metrics Dashboard)
- **Tệp định nghĩa**: `BE/src/routes/admin-metrics/adminMetricsApi.ts`
- **Số lượng Endpoint**: **1**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/admin/metrics` | 🟠 Staff / Ban quản trị | [Admin] Dashboard chỉ số tổng thể (Doanh thu ngày/tháng, User mới, Đơn hàng, Tỷ lệ active) | None |

---

<a id='admin-user'></a>
### 25. Phân hệ Quản trị Người dùng & Phân vai trò (Admin Users & Mentors)
- **Tệp định nghĩa**: `BE/src/routes/admin-user/adminUserApi.ts`
- **Số lượng Endpoint**: **9**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/admin/users` | 🔴 Admin Only | [Admin] Quản lý danh sách toàn bộ người dùng, tìm kiếm, phân quyền | Query: `?page=&limit=&search=&role=&isLocked=` |
| **`GET`** | `/api/admin/users/:id` | 🔴 Admin Only | [Admin] Chi tiết tài khoản người dùng, vai trò và khóa học đã mua | Param: `:id` |
| **`POST`** | `/api/admin/users/:id/resend-verification` | 🔴 Admin Only | [Admin] Gửi lại email xác thực tài khoản cho user | Param: `:id` |
| **`POST`** | `/api/admin/users/:id/send-password-reset` | 🔴 Admin Only | [Admin] Gửi email hướng dẫn đặt lại mật khẩu cho user | Param: `:id` |
| **`POST`** | `/api/admin/users/:id/revoke-sessions` | 🔴 Admin Only | [Admin] Cưỡng chế đăng xuất tất cả phiên làm việc của user | Param: `:id` |
| **`PATCH`** | `/api/admin/users/:id/lock` | 🔴 Admin Only | [Admin] Khóa tài khoản người dùng vi phạm | Param: `:id`, Body: `{ reason? }` |
| **`PATCH`** | `/api/admin/users/:id/unlock` | 🔴 Admin Only | [Admin] Mở khóa tài khoản người dùng | Param: `:id` |
| **`PATCH`** | `/api/admin/users/:id/role` | 🔴 Admin Only | [Admin] Gán vai trò (admin, instructor, student, staff...) | Param: `:id`, Body: `{ roles: [...] }` |
| **`PATCH`** | `/api/admin/users/:id/mentor-course` | 🔴 Admin Only | [Admin] Phân công người dùng làm giảng viên/mentor phụ trách khóa học | Param: `:id`, Body: `{ courseId }` |

---

<a id='ai-coach'></a>
### 20. Phân hệ Trợ lý Gia sư AI Coach (Chatbot, Sessions & Context)
- **Tệp định nghĩa**: `BE/src/routes/ai-coach/aiCoachApi.ts`
- **Số lượng Endpoint**: **7**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/ai-coach/chat` | 🟢 Đăng nhập (User JWT) | Chat trực tiếp với AI Coach kèm streaming / ngữ cảnh bài học hiện tại | Body: `{ message, courseId?, lessonId?, sessionId? }` |
| **`GET`** | `/api/ai-coach` | 🟢 Đăng nhập (User JWT) | Lấy danh sách các phiên trò chuyện (Sessions) trước đây với AI Coach | None |
| **`POST`** | `/api/ai-coach` | 🟢 Đăng nhập (User JWT) | Tạo mới một phiên trò chuyện với AI Coach | Body: `{ title?, courseId?, lessonId? }` |
| **`GET`** | `/api/ai-coach/:id` | 🟢 Đăng nhập (User JWT) | Lấy toàn bộ lịch sử tin nhắn trong một phiên trò chuyện | Param: `:id` |
| **`PUT`** | `/api/ai-coach/:id` | 🟢 Đăng nhập (User JWT) | Đổi tên phiên trò chuyện | Param: `:id`, Body: `{ title }` |
| **`DELETE`** | `/api/ai-coach/:id` | 🟢 Đăng nhập (User JWT) | Xóa phiên trò chuyện | Param: `:id` |
| **`POST`** | `/api/ai-coach/:id/messages` | 🟢 Đăng nhập (User JWT) | Gửi tin nhắn bổ sung vào phiên trò chuyện cụ thể | Param: `:id`, Body: `{ message }` |

---

<a id='ai-tool-config'></a>
### 21. Phân hệ Cấu hình Công cụ & Mô hình AI (AI Tool Configs & Prompts)

Phân hệ hỗ trợ `skill`, `mcp`, `api_provider` và `tool`. Giao diện quản lý chỉ có trong Admin Dashboard; API GET công khai chỉ trả bản ghi có `isPublic=true`.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/ai-tools-config?type=skill|mcp|api_provider|tool&q=&pricingType=free|paid&provider=&category=&page=1&take=20` | Public | Danh sách công khai có tìm kiếm, lọc và phân trang |
| `GET` | `/api/ai-tools-config/:type/:itemKey` | Public | Chi tiết một tài nguyên đang hiển thị |
| `GET` | `/api/ai-tools-config/api/:itemKey/models` | Public | Danh sách model dạng `{ id, isActive }` cho dropdown |
| `POST` | `/api/ai-tools-config/skill` | Staff/Admin | Tạo hoặc cập nhật Skill theo `itemKey` |
| `POST` | `/api/ai-tools-config/mcp` | Staff/Admin | Tạo hoặc cập nhật MCP; `providerType`: `gemini`, `openai`, `claude`, `custom` |
| `POST` | `/api/ai-tools-config/api` | Staff/Admin | Tạo hoặc cập nhật API Provider cùng `payload.models[]` |
| `POST` | `/api/ai-tools-config/api-provider/bulk-delete` | Staff/Admin | Xóa hàng loạt API Provider |
| `POST` | `/api/ai-tools-config/api-model/upsert` | Staff/Admin | Thêm hoặc cập nhật API Model trong provider |
| `POST` | `/api/ai-tools-config/api-model/bulk-delete` | Staff/Admin | Xóa hàng loạt API Model khỏi provider |
| `POST` | `/api/ai-tools-config/bulk-delete` | Staff/Admin | Xóa hàng loạt Prompt, Skill, MCP hoặc Tool; body: `{ "type": "skill", "itemKeys": ["key-1", "key-2"] }` |
| `POST` | `/api/ai-tools-config/tool` | Staff/Admin | Tạo hoặc cập nhật Tool theo `itemKey` |

Hình thức giá chỉ gồm `free` và `paid`. Chi tiết payload và response mẫu xem `docs/get_post_mcp_skills_api_tools.md`.

API Provider được lưu thành một bản ghi chứa `payload.models[]`. Ví dụ `GET /api/ai-tools-config/api_provider/openrouter` trả OpenRouter cùng toàn bộ model; `GET /api/ai-tools-config/api/openrouter/models` chỉ trả danh sách `{ id, isActive }`. Không còn bản ghi riêng dạng `openrouter-*`.
- **Tệp định nghĩa**: `BE/src/routes/ai-tool-config/aiToolConfigApi.ts`
- **Số lượng Endpoint**: **10**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/Paths.AiTools._` | ⚪ Tùy chọn (Public / User) | Xử lý tác vụ GET tại /api/Paths.AiTools._ | Xem route controller |
| **`GET`** | `/api/Paths.AiTools._/admin` | 🟠 Staff / Ban quản trị | Xử lý tác vụ GET tại /api/Paths.AiTools._/admin | Xem route controller |
| **`POST`** | `/api/Paths.AiTools._/prompt` | 🟠 Staff / Ban quản trị | Xử lý tác vụ POST tại /api/Paths.AiTools._/prompt | Xem route controller |
| **`POST`** | `/api/Paths.AiTools._/api-model` | 🟠 Staff / Ban quản trị | Xử lý tác vụ POST tại /api/Paths.AiTools._/api-model | Xem route controller |
| **`POST`** | `/api/Paths.AiTools._/api-model/sync-free` | 🟠 Staff / Ban quản trị | Xử lý tác vụ POST tại /api/Paths.AiTools._/api-model/sync-free | Xem route controller |
| **`POST`** | `/api/Paths.AiTools._/skill` | 🟠 Staff / Ban quản trị | Xử lý tác vụ POST tại /api/Paths.AiTools._/skill | Xem route controller |
| **`PATCH`** | `/api/Paths.AiTools._/Paths.AiTools.Update` | 🟠 Staff / Ban quản trị | Xử lý tác vụ PATCH tại /api/Paths.AiTools._/Paths.AiTools.Update | Xem route controller |
| **`DELETE`** | `/api/Paths.AiTools._/Paths.AiTools.Update` | 🟠 Staff / Ban quản trị | Xử lý tác vụ DELETE tại /api/Paths.AiTools._/Paths.AiTools.Update | Xem route controller |

---

<a id='analytics'></a>
### 29. Phân hệ Báo cáo Thống kê & Phân tích (Analytics & Reports)
- **Tệp định nghĩa**: `BE/src/routes/analytics/analyticsApi.ts`
- **Số lượng Endpoint**: **2**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/analytics/overview` | 🟠 Staff / Ban quản trị | [Admin] Phân tích biểu đồ doanh thu, số học viên theo thời gian | Query: `?period=30d/7d/1y` |
| **`GET`** | `/api/analytics/export.csv` | 🟠 Staff / Ban quản trị | [Admin] Xuất dữ liệu thống kê phân tích ra CSV | None |

---

<a id='assignment'></a>
### 14. Phân hệ Bài tập về nhà & Chấm điểm (Assignments & Submissions)
- **Tệp định nghĩa**: `BE/src/routes/assignment/assignmentApi.ts`
- **Số lượng Endpoint**: **10**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/courses/:courseId/lessons/:lessonId/assignment` | 🟡 Giảng viên / Creator | Tạo / Gán bài tập vào bài học | Params: `:courseId`, `:lessonId`, Body: `{ title, instruction, maxScore? }` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/assignment` | 🟢 Đăng nhập (User JWT) | Lấy đề bài tập được gắn trong bài học | Params: `:courseId`, `:lessonId` |
| **`PATCH`** | `/api/assignments/:assignmentId` | 🟣 RBAC Permission | Cập nhật đề bài tập về nhà (hạn nộp, thang điểm, hướng dẫn) | Param: `:assignmentId` |
| **`DELETE`** | `/api/assignments/:assignmentId` | 🟣 RBAC Permission | Xóa bài tập về nhà | Param: `:assignmentId` |
| **`GET`** | `/api/assignments/:assignmentId/submissions` | 🟣 RBAC Permission | [Giảng viên] Danh sách toàn bộ bài nộp của học viên | Param: `:assignmentId` |
| **`POST`** | `/api/assignments/:assignmentId/submissions` | 🟢 Đăng nhập (User JWT) | Học viên nộp bài làm (text, links, tệp đính kèm) | Param: `:assignmentId`, Body: `{ content?, attachments? }` |
| **`GET`** | `/api/assignments/:assignmentId/submissions/mine` | 🟢 Đăng nhập (User JWT) | Xem bài nộp và nhận xét chấm điểm của chính mình | Param: `:assignmentId` |
| **`POST`** | `/api/assignments/:assignmentId/submissions/init-upload` | 🟢 Đăng nhập (User JWT) | Khởi tạo URL upload file đính kèm bài nộp | Param: `:assignmentId`, Body: `{ filename, size, mimeType }` |
| **`PATCH`** | `/api/assignment-submissions/:submissionId/grade` | 🟣 RBAC Permission | Xử lý tác vụ PATCH tại /api/assignment-submissions/:submissionId/grade | Xem route controller |
| **`POST`** | `/api/AssignmentPaths.Submission.CompleteUpload` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/AssignmentPaths.Submission.CompleteUpload | Xem route controller |

---

<a id='bank-account'></a>
### 10. Phân hệ Tài khoản Ngân hàng nhận thanh toán (Bank Accounts & VietQR)
- **Tệp định nghĩa**: `BE/src/routes/bank-account/bankAccountApi.ts`
- **Số lượng Endpoint**: **7**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/bank-accounts` | 🟣 RBAC Permission | Danh sách tài khoản ngân hàng nhận thanh toán hiển thị cho khách quét VietQR | None |
| **`GET`** | `/api/bank-accounts/export.csv` | 🟣 RBAC Permission | [Admin] Xuất danh sách tài khoản ngân hàng ra CSV | None |
| **`GET`** | `/api/bank-accounts/:bankAccountId` | 🟣 RBAC Permission | Chi tiết thông tin tài khoản ngân hàng | Param: `:bankAccountId` |
| **`POST`** | `/api/bank-accounts` | 🟣 RBAC Permission | [Admin] Thêm tài khoản ngân hàng nhận tiền mới | Body: `{ bankName, accountNumber, accountHolder, bin, isDefault? }` |
| **`PATCH`** | `/api/bank-accounts/:bankAccountId` | 🟣 RBAC Permission | [Admin] Cập nhật thông tin tài khoản ngân hàng | Param: `:bankAccountId` |
| **`POST`** | `/api/bank-accounts/:bankAccountId/default` | 🟣 RBAC Permission | [Admin] Đặt làm tài khoản ngân hàng mặc định nhận thanh toán | Param: `:bankAccountId` |
| **`DELETE`** | `/api/bank-accounts/:bankAccountId` | 🟣 RBAC Permission | [Admin] Xóa tài khoản ngân hàng | Param: `:bankAccountId` |

---

<a id='banned-word'></a>
### 27. Phân hệ Danh sách Từ cấm (Banned Words Blacklist)
- **Tệp định nghĩa**: `BE/src/routes/banned-word/bannedWordApi.ts`
- **Số lượng Endpoint**: **4**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/banned-words` | 🟠 Staff / Ban quản trị | [Admin] Danh sách các từ cấm / nhạy cảm tự động chặn trong hệ thống | None |
| **`POST`** | `/api/banned-words` | 🟠 Staff / Ban quản trị | [Admin] Thêm từ cấm mới vào danh sách đen | Body: `{ word, severity? }` |
| **`PATCH`** | `/api/banned-words/:id` | 🟠 Staff / Ban quản trị | [Admin] Cập nhật từ cấm | Param: `:id` |
| **`DELETE`** | `/api/banned-words/:id` | 🟠 Staff / Ban quản trị | [Admin] Xóa từ cấm khỏi danh sách | Param: `:id` |

---

<a id='cart'></a>
### 7. Phân hệ Giỏ hàng (Cart)
- **Tệp định nghĩa**: `BE/src/routes/cart/cartApi.ts`
- **Số lượng Endpoint**: **5**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/cart` | 🟢 Đăng nhập (User JWT) | Lấy giỏ hàng hiện tại kèm giá gốc, giá khuyến mãi, tổng tiền | None |
| **`POST`** | `/api/cart` | 🟢 Đăng nhập (User JWT) | Thêm khóa học vào giỏ hàng | Body: `{ courseId }` |
| **`PUT`** | `/api/cart/items/:itemId` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ PUT tại /api/cart/items/:itemId | Xem route controller |
| **`DELETE`** | `/api/cart/items/:itemId` | 🟢 Đăng nhập (User JWT) | Xóa một mục khóa học khỏi giỏ hàng | Param: `:itemId` |
| **`DELETE`** | `/api/cart` | 🟢 Đăng nhập (User JWT) | Xóa sạch toàn bộ giỏ hàng | None |

---

<a id='category'></a>
### 2. Phân hệ Danh mục (Categories)
- **Tệp định nghĩa**: `BE/src/routes/category/categoryApi.ts`
- **Số lượng Endpoint**: **5**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/categories` | ⚪ Tùy chọn (Public / User) | Lấy danh mục cùng tags và levels; mặc định `type=course` | Query: `?type=course|post&status=active|inactive&q=...` |
| **`POST`** | `/api/categories` | 🟢 Đăng nhập (User JWT) | Tạo danh mục mới | Body: `{ name, slug?, type, description?, thumbnail?, icon?, tagIds? }` |
| **`PUT`** | `/api/categories/reorder` | 🟢 Đăng nhập (User JWT) | Sắp xếp lại thứ tự hiển thị danh mục | Body: `{ ids: [...] }` |
| **`PATCH`** | `/api/categories/:categoryId` | 🟢 Đăng nhập (User JWT) | Cập nhật danh mục theo ID | Param: `:categoryId`, Body: `{ name?, slug?, description?, status?, thumbnail?, icon?, tagIds? }` |
| **`DELETE`** | `/api/categories/:categoryId` | 🟢 Đăng nhập (User JWT) | Xóa danh mục theo ID | Param: `:categoryId` |

Ví dụ `GET /api/categories?q=coworking` trả category khớp theo tên hoặc slug. Với category khóa học, mỗi phần tử có `tags[].levels[]` chứa metadata level và `courseCount` của từng cặp tag–level; `levels[]` ở cấp category chứa tổng số khóa học theo level.

---

<a id='certificate'></a>
### 31. Phân hệ Chứng chỉ & Tra cứu Chứng chỉ (Certificates & Verification)
- **Tệp định nghĩa**: `BE/src/routes/certificate/certificateApi.ts`
- **Số lượng Endpoint**: **6**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/certificates/verify/:certificateNumber` | 🌐 Công khai (Public) | Tra cứu / Xác thực độ thật của chứng chỉ qua mã số công khai (Public Verify) | Param: `:certificateNumber` |
| **`GET`** | `/api/certificates/mine` | 🟢 Đăng nhập (User JWT) | Học viên lấy danh sách chứng chỉ hoàn thành khóa học đã nhận | None |
| **`GET`** | `/api/certificates/admin` | 🟠 Staff / Ban quản trị | [Admin] Danh sách toàn bộ chứng chỉ đã cấp trên hệ thống | None |
| **`POST`** | `/api/certificates/admin/issue` | 🟠 Staff / Ban quản trị | [Admin] Cấp chứng chỉ thủ công cho học viên hoàn thành khóa học | Body: `{ userId, courseId }` |
| **`POST`** | `/api/certificates/admin/:id/revoke` | 🟠 Staff / Ban quản trị | [Admin] Thu hồi chứng chỉ đã cấp (do gian lận hoặc vi phạm) | Param: `:id` |
| **`POST`** | `/api/certificates/admin/:id/reissue` | 🟠 Staff / Ban quản trị | [Admin] Cấp lại chứng chỉ khi thông tin học viên bị sai | Param: `:id` |

---

<a id='coupon'></a>
### 30. Phân hệ Mã giảm giá & Khuyến mãi (Coupons & Discounts)
- **Tệp định nghĩa**: `BE/src/routes/coupon/couponApi.ts`
- **Số lượng Endpoint**: **6**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/coupons/preview` | 🟢 Đăng nhập (User JWT) | Kiểm tra và tính trước số tiền được giảm khi áp mã coupon vào giỏ | Body: `{ code, courseIds: [...] }` |
| **`GET`** | `/api/coupons` | 🔴 Admin Only | [Admin] Danh sách mã giảm giá, hạn dùng, số lần đã sử dụng | None |
| **`POST`** | `/api/coupons` | 🔴 Admin Only | [Admin] Tạo mã giảm giá mới (theo % hoặc số tiền cố định, giới hạn khóa học) | Body: `{ code, discountPercent?, discountAmount?, maxUsage?, expiresAt? }` |
| **`GET`** | `/api/coupons/:id` | 🔴 Admin Only | [Admin] Chi tiết mã giảm giá | Param: `:id` |
| **`PATCH`** | `/api/coupons/:id` | 🔴 Admin Only | [Admin] Cập nhật mã giảm giá | Param: `:id` |
| **`DELETE`** | `/api/coupons/:id` | 🔴 Admin Only | [Admin] Xóa / Hủy kích hoạt mã giảm giá | Param: `:id` |

---

<a id='course-chat'></a>
### 22. Phân hệ Chat Phòng học Trực tuyến (Course Realtime Chat)
- **Tệp định nghĩa**: `BE/src/routes/course-chat/courseChatApi.ts`
- **Số lượng Endpoint**: **4**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/courses/:courseId/chat` | 🟢 Đăng nhập (User JWT) | Lấy lịch sử tin nhắn trong phòng chat thảo luận của khóa học | Param: `:courseId`, Query: `?limit=&before=` |
| **`POST`** | `/api/courses/:courseId/chat` | 🟢 Đăng nhập (User JWT) | Gửi tin nhắn vào phòng chat của khóa học (phát realtime Socket.io) | Param: `:courseId`, Body: `{ content, replyToId? }` |
| **`PATCH`** | `/api/courses/:courseId/chat/:messageId/pin` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ PATCH tại /api/courses/:courseId/chat/:messageId/pin | Xem route controller |
| **`DELETE`** | `/api/courses/:courseId/chat/:messageId` | 🟢 Đăng nhập (User JWT) | Xóa tin nhắn phòng chat | Params: `:courseId`, `:messageId` |

---

<a id='course-menu'></a>
### 5. Phân hệ Menu Điều hướng Khóa học (Course Menu Navigation)
- **Tệp định nghĩa**: `BE/src/routes/course-menu/courseMenuApi.ts`
- **Số lượng Endpoint**: **8**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/course-menu` | 🌐 Công khai (Public) | Lấy cấu trúc cây Menu khóa học phân cấp đa tầng cho Header Web/App | None |
| **`GET`** | `/api/admin/course-menu` | 🔴 Admin Only | [Admin] Lấy toàn bộ cây menu phục vụ quản trị | None |
| **`GET`** | `/api/admin/course-menu/tag-counts` | 🔴 Admin Only | [Admin] Thống kê số lượng khóa học theo từng tag trong menu | None |
| **`POST`** | `/api/admin/course-menu/seed-default` | 🔴 Admin Only | [Admin] Khởi tạo dữ liệu menu mặc định | None |
| **`PUT`** | `/api/admin/course-menu/reorder` | 🔴 Admin Only | [Admin] Cập nhật thứ tự sắp xếp các mục trong menu | Body: `{ items: [...] }` |
| **`POST`** | `/api/admin/course-menu` | 🔴 Admin Only | [Admin] Tạo mục menu mới | Body: `{ title, parentId?, url?, icon?, orderIndex? }` |
| **`PATCH`** | `/api/admin/course-menu/:id` | 🔴 Admin Only | [Admin] Cập nhật mục menu | Param: `:id` |
| **`DELETE`** | `/api/admin/course-menu/:id` | 🔴 Admin Only | [Admin] Xóa mục menu | Param: `:id` |

---

<a id='course'></a>
### 4. Phân hệ Khóa học & Giáo trình (Courses & Curriculum)
- **Tệp định nghĩa**: `BE/src/routes/course/courseApi.ts`
- **Số lượng Endpoint**: **36**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/courses` | ⚪ Tùy chọn (Public / User) | Danh sách khóa học (tìm kiếm, phân trang, lọc danh mục, tags, giá) | Query: `?page=1&limit=10&search=&category=&tag=&level=&sort=` |
| **`POST`** | `/api/courses/recommendations` | ⚪ Tùy chọn (Public / User) | Gợi ý khóa học cá nhân hóa dựa trên Onboarding & lịch sử học | Body: `{ limit?, preferences? }` |
| **`POST`** | `/api/courses/recommendations/events` | ⚪ Tùy chọn (Public / User) | Ghi nhận sự kiện click / tương tác với gợi ý để tối ưu thuật toán | Body: `{ eventType, courseId }` |
| **`GET`** | `/api/courses/categories` | ⚪ Tùy chọn (Public / User) | Lấy danh mục khóa học kèm số lượng khóa học | None |
| **`POST`** | `/api/courses/categories` | 🟣 RBAC Permission | Tạo danh mục khóa học | Body: `{ name, slug? }` |
| **`PATCH`** | `/api/courses/categories/:categoryId` | 🟣 RBAC Permission | Sửa danh mục khóa học | Param: `:categoryId` |
| **`DELETE`** | `/api/courses/categories/:categoryId` | 🟣 RBAC Permission | Xóa danh mục khóa học | Param: `:categoryId` |
| **`GET`** | `/api/courses/slug/:slug` | ⚪ Tùy chọn (Public / User) | Chi tiết khóa học công khai theo đường dẫn tĩnh (Slug) | Param: `:slug` |
| **`GET`** | `/api/courses/:courseId/curriculum` | ⚪ Tùy chọn (Public / User) | Lấy toàn bộ cây đề cương giáo trình (Sections -> Lessons -> Resources) | Param: `:courseId` |
| **`GET`** | `/api/courses/:courseId/review` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/courses/:courseId/review | Xem route controller |
| **`PUT`** | `/api/courses/:courseId/review` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ PUT tại /api/courses/:courseId/review | Xem route controller |
| **`POST`** | `/api/courses/:courseId/review-checkpoint` | 🟢 Đăng nhập (User JWT) | Ghi nhận mốc điểm hỏi đánh giá học viên trong quá trình học | Param: `:courseId`, Body: `{ milestone }` |
| **`GET`** | `/api/courses/:courseId/sections` | 🟢 Đăng nhập (User JWT) | Lấy danh sách các chương (Sections) của khóa học | Param: `:courseId` |
| **`POST`** | `/api/courses/:courseId/sections` | 🟡 Giảng viên / Creator | Tạo chương mới trong khóa học | Param: `:courseId`, Body: `{ title, orderIndex? }` |
| **`PATCH`** | `/api/courses/:courseId/sections/:sectionId` | 🟡 Giảng viên / Creator | Cập nhật tiêu đề, thứ tự của chương | Params: `:courseId`, `:sectionId` |
| **`DELETE`** | `/api/courses/:courseId/sections/:sectionId` | 🟡 Giảng viên / Creator | Xóa chương và bài học bên trong | Params: `:courseId`, `:sectionId` |
| **`POST`** | `/api/courses/:courseId/sections/:sectionId/lessons` | 🟡 Giảng viên / Creator | Tạo bài học mới trong chương | Params: `:courseId`, `:sectionId`, Body: `{ title, type, isTrial? }` |
| **`PATCH`** | `/api/courses/:courseId/lessons/:lessonId` | 🟡 Giảng viên / Creator | Cập nhật bài học (nội dung text, videoId, thời lượng, xem thử...) | Params: `:courseId`, `:lessonId` |
| **`DELETE`** | `/api/courses/:courseId/lessons/:lessonId` | 🟡 Giảng viên / Creator | Xóa bài học | Params: `:courseId`, `:lessonId` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/attachments` | 🟢 Đăng nhập (User JWT) | Lấy danh sách tệp đính kèm / tài liệu của bài học | Params: `:courseId`, `:lessonId` |
| **`POST`** | `/api/courses/:courseId/lessons/:lessonId/attachments` | 🟡 Giảng viên / Creator | Gán tệp tài liệu / media đã có vào bài học | Body: `{ mediaId, title? }` |
| **`POST`** | `/api/courses/:courseId/lessons/:lessonId/attachments/upload` | 🟡 Giảng viên / Creator | Upload tệp đính kèm cho bài học | Form-data: `file` |
| **`DELETE`** | `/api/courses/CoursePaths.Course.Lessons.AttachmentDelete` | 🟡 Giảng viên / Creator | Xóa khóa học (Soft delete) | Param: `:id` |
| **`GET`** | `/api/courses/:id` | ⚪ Tùy chọn (Public / User) | Lấy toàn bộ chi tiết khóa học, chương trình học, giảng viên, review | Param: `:id` (UUID) |
| **`POST`** | `/api/courses` | 🟡 Giảng viên / Creator | Tạo khóa học mới (Bản nháp) | Body: `{ title, slug?, summary?, price?, categoryId? }` |
| **`PATCH`** | `/api/courses/:id` | 🟣 RBAC Permission | Cập nhật thông tin khóa học (tiêu đề, giá, mô tả, media, mục tiêu...) | Param: `:id`, Body: `{ title?, price?, description?, ... }` |
| **`POST`** | `/api/courses/:id/publish` | 🟣 RBAC Permission | Xuất bản khóa học hoặc chuyển về bản nháp | Param: `:id`, Body: `{ isPublished: boolean }` |
| **`GET`** | `/api/courses/:id/publish-readiness` | 🟢 Đăng nhập (User JWT) | Kiểm tra checklist điều kiện xuất bản khóa học (video, quiz, bài học) | Param: `:id` |
| **`POST`** | `/api/courses/:id/restore` | 🟣 RBAC Permission | Khôi phục khóa học đã bị xóa | Param: `:id` |
| **`DELETE`** | `/api/courses/:id` | 🟣 RBAC Permission | Xóa khóa học (Soft delete) | Param: `:id` |
| **`GET`** | `/api/course-management/courses` | 🟠 Staff / Ban quản trị | [Staff] Danh sách khóa học quản lý nội bộ kèm số liệu thống kê | Query: `?search=&status=&instructorId=` |
| **`GET`** | `/api/course-management/courses/:id` | 🟠 Staff / Ban quản trị | [Staff] Chi tiết quản lý khóa học, số học viên, doanh thu | Param: `:id` |
| **`GET`** | `/api/course-management/courses/:courseId/ai-quiz-sources` | 🟠 Staff / Ban quản trị | [Staff] Nguồn tài liệu để sinh đề thi AI từ khóa học | Param: `:courseId` |
| **`GET`** | `/api/course-management/courses/:courseId/ai-quiz-targets` | 🟠 Staff / Ban quản trị | [Staff] Mục tiêu vị trí chèn câu hỏi AI trong khóa học | Param: `:courseId` |
| **`GET`** | `/api/course-management/courses/:courseId/flashcard-decks` | 🟠 Staff / Ban quản trị | [Staff] Danh sách bộ flashcard gắn với khóa học | Param: `:courseId` |
| **`POST`** | `/api/course-management/courses/:courseId/flashcard-decks` | 🟠 Staff / Ban quản trị | Xử lý tác vụ POST tại /api/course-management/courses/:courseId/flashcard-decks | Xem route controller |

---

<a id='enrollment'></a>
### 6. Phân hệ Ghi danh & Học viên (Enrollments & Learners)
- **Tệp định nghĩa**: `BE/src/routes/enrollment/enrollmentApi.ts`
- **Số lượng Endpoint**: **9**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/courses/:courseId/enrollments` | 🟢 Đăng nhập (User JWT) | Ghi danh học viên vào khóa học (hệ thống/admin hoặc sau thanh toán) | Param: `:courseId`, Body: `{ userId, role? }` |
| **`GET`** | `/api/courses/:courseId/enrollments` | 🟢 Đăng nhập (User JWT) | Lấy danh sách học viên ghi danh trong khóa học | Param: `:courseId` |
| **`GET`** | `/api/courses/:courseId/enrollments/learners/export.csv` | 🟢 Đăng nhập (User JWT) | Xuất danh sách học viên khóa học ra tệp CSV | Param: `:courseId` |
| **`GET`** | `/api/courses/:courseId/enrollments/learners` | 🟢 Đăng nhập (User JWT) | Tra cứu danh sách học viên chi tiết, tiến độ, thời lượng học | Param: `:courseId` |
| **`GET`** | `/api/courses/:courseId/enrollments/learners/:userId/exercise-history` | 🟢 Đăng nhập (User JWT) | Lịch sử nộp bài tập & làm quiz của học viên trong khóa | Params: `:courseId`, `:userId` |
| **`POST`** | `/api/courses/:courseId/enrollments/learners/:userId/ai-coach` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/courses/:courseId/enrollments/learners/:userId/ai-coach | Xem route controller |
| **`DELETE`** | `/api/courses/:courseId/enrollments/:userId` | 🟢 Đăng nhập (User JWT) | Hủy / Thu hồi quyền học của học viên trong khóa | Params: `:courseId`, `:userId` |
| **`PATCH`** | `/api/courses/:courseId/enrollments/:userId` | 🟢 Đăng nhập (User JWT) | Cập nhật trạng thái ghi danh (gia hạn, tạm dừng, kích hoạt) | Params: `:courseId`, `:userId` |
| **`GET`** | `/api/me/enrollments` | 🟢 Đăng nhập (User JWT) | Lấy danh sách các khóa học mà học viên hiện tại đã đăng ký và đang học | Query: `?status=active` |

---

<a id='flashcard'></a>
### 17. Phân hệ Thẻ ghi nhớ Flashcards Quản trị (Flashcards Admin & AI Generation)
- **Tệp định nghĩa**: `BE/src/routes/flashcard/flashcardAdminApi.ts`
- **Số lượng Endpoint**: **9**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`PATCH`** | `/api/flashcard-decks/:deckId` | 🟠 Staff / Ban quản trị | [Admin] Cập nhật thông tin bộ thẻ ghi nhớ | Param: `:deckId` |
| **`DELETE`** | `/api/flashcard-decks/:deckId` | 🟠 Staff / Ban quản trị | [Admin] Xóa bộ thẻ ghi nhớ | Param: `:deckId` |
| **`GET`** | `/api/flashcard-decks/:deckId/cards` | 🟠 Staff / Ban quản trị | [Admin] Danh sách các thẻ flashcard mặt trước/mặt sau trong bộ | Param: `:deckId` |
| **`POST`** | `/api/flashcard-decks/:deckId/cards` | 🟠 Staff / Ban quản trị | [Admin] Thêm thẻ flashcard thủ công vào bộ | Param: `:deckId`, Body: `{ front, back, hint? }` |
| **`POST`** | `/api/flashcard-decks/:deckId/cards/import` | 🟠 Staff / Ban quản trị | [Admin] Nhập thẻ flashcard hàng loạt qua CSV / JSON | Param: `:deckId`, Body: `{ cards: [...] }` |
| **`GET`** | `/api/flashcard-decks/:deckId/ai-sources` | 🟠 Staff / Ban quản trị | [Admin] Nguồn nội dung bài học phục vụ sinh thẻ AI | Param: `:deckId` |
| **`POST`** | `/api/flashcard-decks/:deckId/cards/ai-generate` | 🟠 Staff / Ban quản trị | [Admin] Dùng AI tự động sinh bộ flashcards từ nội dung bài học | Param: `:deckId`, Body: `{ lessonId?, count? }` |
| **`PATCH`** | `/api/flashcards/:cardId` | 🟠 Staff / Ban quản trị | [Admin] Cập nhật nội dung thẻ flashcard | Param: `:cardId` |
| **`DELETE`** | `/api/flashcards/:cardId` | 🟠 Staff / Ban quản trị | [Admin] Xóa một thẻ flashcard | Param: `:cardId` |

---

<a id='health'></a>
### 33. Phân hệ Kiểm tra Sức khỏe Hệ thống (Health Check Liveness & Readiness)
- **Tệp định nghĩa**: `BE/src/routes/health/healthApi.ts`
- **Số lượng Endpoint**: **2**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/health/live` | 🌐 Công khai (Public) | Liveness check: Kiểm tra tiến trình backend NodeJS đang chạy (k8s / docker) | None |
| **`GET`** | `/health/ready` | 🌐 Công khai (Public) | Readiness check: Kiểm tra kết nối Database PostgreSQL và Redis sẵn sàng | None |

---

<a id='lead'></a>
### 23. Phân hệ Khách hàng Tiềm năng & Tư vấn (Leads & CRM Export)
- **Tệp định nghĩa**: `BE/src/routes/lead/leadApi.ts`
- **Số lượng Endpoint**: **5**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/leads` | 🟢 Đăng nhập (User JWT) | [Admin] Danh sách khách hàng tiềm năng cần liên hệ | Query: `?status=&search=&page=` |
| **`GET`** | `/api/leads/admin/export.csv` | 🔴 Admin Only | [Admin] Xuất danh sách Lead ra tệp CSV cho đội Sale/Tư vấn | None |
| **`GET`** | `/api/leads/:id` | 🟢 Đăng nhập (User JWT) | [Admin] Chi tiết một Lead | Param: `:id` |
| **`PATCH`** | `/api/leads/:id` | 🔴 Admin Only | [Admin] Cập nhật trạng thái chăm sóc Lead (MỚI, ĐÃ LIÊN HỆ, ĐÃ CHỐT...) | Param: `:id`, Body: `{ status?, note? }` |
| **`POST`** | `/api/leads` | 🌐 Công khai (Public) | Khách vãng lai gửi thông tin đăng ký tư vấn khóa học | Body: `{ fullName, email, phone, courseInterest?, note? }` |

---

<a id='learn-extras'></a>
### 19. Phân hệ Tiện ích Học tập (Ghi chú, Đánh dấu, Hỏi đáp theo bài giảng)
- **Tệp định nghĩa**: `BE/src/routes/learn-extras/learnExtrasApi.ts`
- **Số lượng Endpoint**: **14**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/questions` | 🟢 Đăng nhập (User JWT) | Danh sách các câu hỏi thảo luận Q&A của bài học | Params: `:courseId`, `:lessonId` |
| **`POST`** | `/api/courses/:courseId/lessons/:lessonId/questions` | 🟢 Đăng nhập (User JWT) | Đặt câu hỏi mới về nội dung bài học | Params: `:courseId`, `:lessonId`, Body: `{ content, title? }` |
| **`POST`** | `/api/questions/:questionId/answers` | 🟢 Đăng nhập (User JWT) | Trả lời câu hỏi thảo luận của học viên khác hoặc giảng viên | Param: `:questionId`, Body: `{ content }` |
| **`PATCH`** | `/api/questions/:questionId/resolve` | 🟢 Đăng nhập (User JWT) | Đánh dấu câu hỏi đã được giải đáp thỏa đáng | Param: `:questionId` |
| **`DELETE`** | `/api/questions/:questionId` | 🟢 Đăng nhập (User JWT) | Xóa câu hỏi thảo luận | Param: `:questionId` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/notes` | 🟢 Đăng nhập (User JWT) | Lấy danh sách ghi chú cá nhân tại bài học này (kèm timestamp video) | Params: `:courseId`, `:lessonId` |
| **`POST`** | `/api/courses/:courseId/lessons/:lessonId/notes` | 🟢 Đăng nhập (User JWT) | Tạo ghi chú mới tại mốc thời gian video bài học | Params: `:courseId`, `:lessonId`, Body: `{ content, videoSecond? }` |
| **`GET`** | `/api/courses/:courseId/notes` | 🟢 Đăng nhập (User JWT) | Lấy toàn bộ ghi chú của học viên trong cả khóa học | Param: `:courseId` |
| **`PATCH`** | `/api/notes/:noteId` | 🟢 Đăng nhập (User JWT) | Chỉnh sửa nội dung ghi chú | Param: `:noteId` |
| **`DELETE`** | `/api/notes/:noteId` | 🟢 Đăng nhập (User JWT) | Xóa ghi chú | Param: `:noteId` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/bookmarks` | 🟢 Đăng nhập (User JWT) | Kiểm tra trạng thái đánh dấu bài học yêu thích | Params: `:courseId`, `:lessonId` |
| **`POST`** | `/api/courses/:courseId/lessons/:lessonId/bookmarks` | 🟢 Đăng nhập (User JWT) | Đánh dấu bài học để xem lại sau | Params: `:courseId`, `:lessonId` |
| **`GET`** | `/api/courses/:courseId/bookmarks` | 🟢 Đăng nhập (User JWT) | Danh sách tất cả bài học đã đánh dấu trong khóa học | Param: `:courseId` |
| **`DELETE`** | `/api/bookmarks/:bookmarkId` | 🟢 Đăng nhập (User JWT) | Bỏ đánh dấu bài học | Param: `:bookmarkId` |

---

<a id='media'></a>
### 16. Phân hệ Quản lý Tệp tin & Media Thư viện (Media & Asset Storage)
- **Tệp định nghĩa**: `BE/src/routes/media/mediaApi.ts`
- **Số lượng Endpoint**: **6**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/media/thumbnails` | 🟣 RBAC Permission | Upload thumbnail JPEG, PNG, WebP, GIF hoặc SVG; tối đa 30 MiB | Form-data: `file` |
| **`POST`** | `/api/media/files` | 🟣 RBAC Permission | Upload tài liệu chung (PDF, DOCX, ZIP...) | Form-data: `file` |
| **`GET`** | `/api/media` | 🟣 RBAC Permission | Danh sách media đã tải lên thư viện tài nguyên | Query: `?page=&type=` |
| **`GET`** | `/api/media/:mediaId` | 🟣 RBAC Permission | Chi tiết tệp tin media | Param: `:mediaId` |
| **`GET`** | `/api/media/:mediaId/link` | 🟣 RBAC Permission | Lấy liên kết tải xuống an toàn của media | Param: `:mediaId` |
| **`DELETE`** | `/api/media/:mediaId` | 🟣 RBAC Permission | Xóa tệp tin media | Param: `:mediaId` |

---

<a id='membership'></a>
### 32. Phân hệ Gói Hội viên VIP / Pro (Memberships & Subscriptions)
- **Tệp định nghĩa**: `BE/src/routes/membership/membershipApi.ts`
- **Số lượng Endpoint**: **8**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/memberships/plans` | 🌐 Công khai (Public) | Lấy danh sách các gói hội viên VIP / Pro công khai kèm giá và quyền lợi | None |
| **`GET`** | `/api/admin/memberships/plans` | 🔴 Admin Only | [Admin] Quản lý cấu hình các gói hội viên | None |
| **`POST`** | `/api/admin/memberships/plans` | 🔴 Admin Only | [Admin] Tạo gói hội viên mới | Body: `{ name, price, durationDays, features: [...] }` |
| **`PATCH`** | `/api/admin/memberships/plans/:id` | 🔴 Admin Only | [Admin] Cập nhật gói hội viên | Param: `:id` |
| **`GET`** | `/api/admin/memberships/members` | 🔴 Admin Only | [Admin] Danh sách các thành viên đang có gói hội viên hoạt động | None |
| **`POST`** | `/api/admin/memberships/grant` | 🔴 Admin Only | [Admin] Cấp gói hội viên cho user thủ công | Body: `{ userId, planId, durationDays? }` |
| **`PATCH`** | `/api/admin/memberships/:id/extend` | 🔴 Admin Only | [Admin] Gia hạn thêm thời hạn hội viên cho user | Param: `:id`, Body: `{ extraDays }` |
| **`POST`** | `/api/admin/memberships/:id/revoke` | 🔴 Admin Only | [Admin] Thu hồi gói hội viên của user | Param: `:id` |

---

<a id='mobile'></a>
### 18. Phân hệ Trải nghiệm Mobile App (Bootstrap, Spaced Repetition SM-2)
- **Tệp định nghĩa**: `BE/src/routes/mobile/mobileApi.ts`
- **Số lượng Endpoint**: **6**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/'x-timezone') ?? undefined;
  const result = await MobileBootstrapService.bootstrap(
    req.authUser!.id` | 🌐 Công khai (Public) | Xử lý tác vụ GET tại /api/'x-timezone') ?? undefined;
  const result = await MobileBootstrapService.bootstrap(
    req.authUser!.id | Xem route controller |
| **`GET`** | `/api/mobile/bootstrap` | 🟢 Đăng nhập (User JWT) | [Mobile] Khởi tạo dữ liệu app: hồ sơ user, cài đặt, chuỗi ngày học, thẻ cần ôn | Headers: `x-timezone` |
| **`GET`** | `/api/flashcards/due` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/flashcards/due | Xem route controller |
| **`POST`** | `/api/flashcards/reviews/sync` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/flashcards/reviews/sync | Xem route controller |
| **`GET`** | `/api/flashcards/stats` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/flashcards/stats | Xem route controller |
| **`GET`** | `/api/courses/:courseId/flashcard-decks` | 🟢 Đăng nhập (User JWT) | [Mobile/Web] Lấy danh sách các bộ thẻ flashcard thuộc khóa học | Param: `:courseId` |

---

<a id='moderation'></a>
### 26. Phân hệ Kiểm duyệt Nội dung & Bình luận (Moderation Queue)
- **Tệp định nghĩa**: `BE/src/routes/moderation/moderationApi.ts`
- **Số lượng Endpoint**: **2**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/moderation/comments` | 🟠 Staff / Ban quản trị | [Admin] Hàng đợi các bình luận nghi vấn cần kiểm duyệt trước khi hiển thị | Query: `?status=&page=` |
| **`PATCH`** | `/api/moderation/comments/:id/status` | 🟠 Staff / Ban quản trị | [Admin] Duyệt hiển thị hoặc từ chối/ẩn bình luận vi phạm | Param: `:id`, Body: `{ status: APPROVED/REJECTED }` |

---

<a id='notification'></a>
### 24. Phân hệ Thông báo & Push Notification (Notifications & Broadcast)
- **Tệp định nghĩa**: `BE/src/routes/notification/notificationApi.ts`
- **Số lượng Endpoint**: **5**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/notifications` | 🟢 Đăng nhập (User JWT) | Lấy danh sách thông báo của người dùng (phân loại, trạng thái đã đọc) | Query: `?page=1&limit=20&filter=all/unread` |
| **`POST`** | `/api/notifications/read-all` | 🟢 Đăng nhập (User JWT) | Đánh dấu tất cả thông báo của người dùng là đã đọc | None |
| **`POST`** | `/api/notifications/read` | 🟢 Đăng nhập (User JWT) | Đánh dấu danh sách các thông báo đã được đọc | Body: `{ ids: [...] }` |
| **`POST`** | `/api/notifications/:id/read` | 🟢 Đăng nhập (User JWT) | Đánh dấu một thông báo cụ thể là đã đọc | Param: `:id` |
| **`POST`** | `/api/notifications/compose` | 🔴 Admin Only | [Admin] Soạn và gửi thông báo chung (Broadcast) hoặc cá nhân | Body: `{ title, body, type, targetUserId?, deepLink? }` |

---

<a id='order'></a>
### 8. Phân hệ Đơn hàng & Xử lý ngoại lệ (Orders & Admin Resolution)
- **Tệp định nghĩa**: `BE/src/routes/order/orderApi.ts`
- **Số lượng Endpoint**: **14**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/orders` | 🟢 Đăng nhập (User JWT) | Tạo đơn hàng mua khóa học mới, sinh mã thanh toán VietQR / SePay | Body: `{ courseIds: [...], couponCode?, paymentMethod? }` |
| **`GET`** | `/api/orders` | 🟢 Đăng nhập (User JWT) | Danh sách lịch sử đơn hàng của học viên | Query: `?page=1&limit=10&status=` |
| **`GET`** | `/api/orders/admin` | 🔴 Admin Only | [Admin] Tra cứu toàn bộ đơn hàng trên hệ thống kèm bộ lọc | Query: `?status=&search=&from=&to=&page=` |
| **`POST`** | `/api/orders/admin/expire-stale` | 🔴 Admin Only | [Admin] Hủy các đơn hàng treo quá hạn thanh toán | None |
| **`GET`** | `/api/orders/admin/export.csv` | 🔴 Admin Only | [Admin] Xuất báo cáo danh sách đơn hàng ra file CSV | Query: `?filters` |
| **`GET`** | `/api/orders/admin/exceptions` | 🔴 Admin Only | [Admin] Danh sách đơn hàng gặp ngoại lệ (chuyển thiếu tiền, sai nội dung) | None |
| **`POST`** | `/api/orders/admin/exceptions/:exceptionId/resolve` | 🔴 Admin Only | [Admin] Xử lý ngoại lệ đơn hàng (kích hoạt thủ công / hoàn tiền) | Param: `:exceptionId` |
| **`GET`** | `/api/orders/admin/:orderId` | 🔴 Admin Only | [Admin] Chi tiết đơn hàng nội bộ | Param: `:orderId` |
| **`GET`** | `/api/orders/admin/:orderId/receipt` | 🔴 Admin Only | [Admin] Xem biên lai hóa đơn điện tử của đơn hàng | Param: `:orderId` |
| **`PATCH`** | `/api/orders/admin/:orderId/status` | 🔴 Admin Only | [Admin] Cập nhật trạng thái đơn hàng (PAID, CANCELLED...) | Param: `:orderId` |
| **`POST`** | `/api/orders/admin/:orderId/repair-enrollment` | 🔴 Admin Only | [Admin] Kích hoạt lại quyền học viên khi đơn đã thanh toán nhưng lỗi gán khóa | Param: `:orderId` |
| **`GET`** | `/api/orders/:orderId` | 🟢 Đăng nhập (User JWT) | Lấy chi tiết đơn hàng, thông tin thanh toán VietQR và trạng thái | Param: `:orderId` |
| **`GET`** | `/api/orders/:orderId/receipt` | 🟢 Đăng nhập (User JWT) | Học viên tải / xem hóa đơn biên nhận điện tử | Param: `:orderId` |
| **`POST`** | `/api/orders/:orderId/cancel` | 🟢 Đăng nhập (User JWT) | Hủy đơn hàng chưa thanh toán | Param: `:orderId` |

---

<a id='payment'></a>
### 9. Phân hệ Cổng thanh toán & Webhook (Payment: SePay, VNPay, MoMo)
- **Tệp định nghĩa**: `BE/src/routes/payment/paymentApi.ts`
- **Số lượng Endpoint**: **5**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/payment/sepay/webhook` | 🌐 Công khai (Public) | Webhook nhận thông báo giao dịch chuyển khoản ngân hàng tự động từ SePay | Headers: `Authorization: Apikey ...` |
| **`POST`** | `/api/payment/sepay/ipn` | 🌐 Công khai (Public) | IPN SePay bảo mật với Secret Key xác thực đơn thanh toán tức thời | Headers: `X-Secret-Key: ...` |
| **`GET`** | `/api/payment/sepay/check` | 🟢 Đăng nhập (User JWT) | Kiểm tra trạng thái thanh toán đơn hàng (polling khi khách đang quét QR) | Query: `?orderId=...` |
| **`GET`** | `/api/payment/vnpay/return` | 🌐 Công khai (Public) | Xử lý URL trả về sau khi khách thanh toán qua cổng VNPay | Query: VNPay query params |
| **`GET`** | `/api/payment/momo/return` | 🌐 Công khai (Public) | Xử lý URL trả về sau khi khách thanh toán qua cổng MoMo | Query: MoMo query params |

---

<a id='post'></a>
### 12. Phân hệ Bài viết Cộng đồng & Bình luận (Community Posts & Comments)
- **Tệp định nghĩa**: `BE/src/routes/post/postApi.ts`
- **Số lượng Endpoint**: **24**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/posts` | ⚪ Tùy chọn (Public / User) | Lấy danh sách bài viết cộng đồng (lọc tag, tác giả, tìm kiếm, phân trang) | Query: `?page=&limit=&tag=&search=&status=` |
| **`GET`** | `/api/posts/tags` | ⚪ Tùy chọn (Public / User) | Danh sách thẻ gắn trong bài viết | None |
| **`POST`** | `/api/posts/tags` | 🟣 RBAC Permission | Tạo thẻ bài viết mới | Body: `{ name }` |
| **`PATCH`** | `/api/posts/tags/:tagId` | 🟣 RBAC Permission | Sửa thẻ bài viết | Param: `:tagId` |
| **`DELETE`** | `/api/posts/tags/:tagId` | 🟣 RBAC Permission | Xóa thẻ bài viết | Param: `:tagId` |
| **`GET`** | `/api/posts/slug/:slug` | ⚪ Tùy chọn (Public / User) | Chi tiết bài viết theo Slug | Param: `:slug` |
| **`GET`** | `/api/posts/:postId` | ⚪ Tùy chọn (Public / User) | Chi tiết bài viết theo ID | Param: `:postId` |
| **`POST`** | `/api/posts` | 🟣 RBAC Permission | Tạo bài viết mới trong cộng đồng | Body: `{ title, content, coverImage?, tags?, summary? }` |
| **`PATCH`** | `/api/posts/:postId/publish` | 🟣 RBAC Permission | Xử lý tác vụ PATCH tại /api/posts/:postId/publish | Xem route controller |
| **`PATCH`** | `/api/posts/:postId/unpublish` | 🟣 RBAC Permission | Xử lý tác vụ PATCH tại /api/posts/:postId/unpublish | Xem route controller |
| **`PATCH`** | `/api/posts/:postId/archive` | 🟣 RBAC Permission | Xử lý tác vụ PATCH tại /api/posts/:postId/archive | Xem route controller |
| **`POST`** | `/api/posts/:postId/like` | 🟢 Đăng nhập (User JWT) | Thả tim / Bỏ thả tim bài viết | Param: `:postId` |
| **`DELETE`** | `/api/posts/:postId/like` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ DELETE tại /api/posts/:postId/like | Xem route controller |
| **`GET`** | `/api/posts/:postId/comments` | ⚪ Tùy chọn (Public / User) | Danh sách bình luận trong bài viết kèm replies | Param: `:postId` |
| **`POST`** | `/api/posts/:postId/comments` | 🟢 Đăng nhập (User JWT) | Gửi bình luận vào bài viết | Param: `:postId`, Body: `{ content, parentId? }` |
| **`GET`** | `/api/posts/:postId/comments/:commentId/replies` | ⚪ Tùy chọn (Public / User) | Danh sách câu trả lời cho một bình luận | Params: `:postId`, `:commentId` |
| **`POST`** | `/api/posts/:postId/comments/:commentId/replies` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/posts/:postId/comments/:commentId/replies | Xem route controller |
| **`PATCH`** | `/api/posts/:postId/comments/:commentId` | 🟢 Đăng nhập (User JWT) | Sửa bình luận | Params: `:postId`, `:commentId` |
| **`DELETE`** | `/api/posts/:postId/comments/:commentId` | 🟢 Đăng nhập (User JWT) | Xóa bình luận | Params: `:postId`, `:commentId` |
| **`POST`** | `/api/posts/:postId/comments/:commentId/like` | 🟢 Đăng nhập (User JWT) | Like bình luận | Params: `:postId`, `:commentId` |
| **`DELETE`** | `/api/posts/:postId/comments/:commentId/like` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ DELETE tại /api/posts/:postId/comments/:commentId/like | Xem route controller |
| **`PATCH`** | `/api/posts/:postId` | 🟣 RBAC Permission | Chỉnh sửa bài viết | Param: `:postId` |
| **`POST`** | `/api/posts/:postId/restore` | 🟣 RBAC Permission | Khôi phục bài viết đã xóa | Param: `:postId` |
| **`DELETE`** | `/api/posts/:postId` | 🟣 RBAC Permission | Xóa bài viết | Param: `:postId` |

---

<a id='progress'></a>
### 11. Phân hệ Tiến độ Học tập & Đồng bộ Đa thiết bị (Progress & Sync)
- **Tệp định nghĩa**: `BE/src/routes/progress/progressApi.ts`
- **Số lượng Endpoint**: **5**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`PUT`** | `/api/courses/:courseId/lessons/:lessonId/progress` | 🟢 Đăng nhập (User JWT) | Cập nhật tiến độ hoàn thành bài học (thời lượng video đã xem, done) | Params: `:courseId`, `:lessonId`, Body: `{ watchedSeconds?, isCompleted? }` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/progress` | 🟢 Đăng nhập (User JWT) | Lấy tiến độ chi tiết của bài học hiện tại | Params: `:courseId`, `:lessonId` |
| **`GET`** | `/api/courses/:courseId/progress` | 🟢 Đăng nhập (User JWT) | Lấy tổng quan tiến độ cả khóa học (% hoàn thành, số bài xong, bài kế tiếp) | Param: `:courseId` |
| **`POST`** | `/api/progress/sync` | 🟢 Đăng nhập (User JWT) | Đồng bộ tiến độ học tập hàng loạt từ thiết bị offline/mobile lên server | Body: `{ items: [...] }` |
| **`GET`** | `/api/progress/changes` | 🟢 Đăng nhập (User JWT) | Lấy danh sách các bài học có thay đổi tiến độ kể từ mốc thời gian (Delta Sync) | Query: `?since=ISO_TIMESTAMP` |

---

<a id='quiz'></a>
### 13. Phân hệ Đề thi, Trắc nghiệm & AI Quiz (Quiz, AI Generation & Attempts)
- **Tệp định nghĩa**: `BE/src/routes/quiz/quizApi.ts`
- **Số lượng Endpoint**: **22**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/courses/:courseId/lessons/:lessonId/quiz` | 🟡 Giảng viên / Creator | Gán bài kiểm tra vào bài học | Params: `:courseId`, `:lessonId`, Body: `{ quizId }` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/quiz` | 🟢 Đăng nhập (User JWT) | Lấy bài kiểm tra gắn kèm bài học | Params: `:courseId`, `:lessonId` |
| **`GET`** | `/api/quizzes/:quizId` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/quizzes/:quizId | Xem route controller |
| **`PATCH`** | `/api/quizzes/:quizId` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ PATCH tại /api/quizzes/:quizId | Xem route controller |
| **`POST`** | `/api/quizzes/:quizId/questions` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/quizzes/:quizId/questions | Xem route controller |
| **`POST`** | `/api/quizzes/:quizId/ai-generate` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/quizzes/:quizId/ai-generate | Xem route controller |
| **`GET`** | `/api/quizzes/:quizId/ai-generate/jobs/:jobId` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/quizzes/:quizId/ai-generate/jobs/:jobId | Xem route controller |
| **`GET`** | `/api/quizzes/:quizId/questions` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/quizzes/:quizId/questions | Xem route controller |
| **`PATCH`** | `/api/quizzes/:quizId/questions/reorder` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ PATCH tại /api/quizzes/:quizId/questions/reorder | Xem route controller |
| **`GET`** | `/api/quiz-questions/:questionId` | 🟣 RBAC Permission | Xử lý tác vụ GET tại /api/quiz-questions/:questionId | Xem route controller |
| **`PUT`** | `/api/quiz-questions/:questionId` | 🟣 RBAC Permission | Xử lý tác vụ PUT tại /api/quiz-questions/:questionId | Xem route controller |
| **`PATCH`** | `/api/quiz-questions/:questionId` | 🟣 RBAC Permission | Xử lý tác vụ PATCH tại /api/quiz-questions/:questionId | Xem route controller |
| **`DELETE`** | `/api/quiz-questions/:questionId` | 🟣 RBAC Permission | Xử lý tác vụ DELETE tại /api/quiz-questions/:questionId | Xem route controller |
| **`GET`** | `/api/quizzes/:quizId/take` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/quizzes/:quizId/take | Xem route controller |
| **`POST`** | `/api/quizzes/:quizId/submit` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/quizzes/:quizId/submit | Xem route controller |
| **`PATCH`** | `/api/quiz-answers/:answerId/grade` | 🟣 RBAC Permission | Xử lý tác vụ PATCH tại /api/quiz-answers/:answerId/grade | Xem route controller |
| **`POST`** | `/api/quizzes/:quizId/attempts` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/quizzes/:quizId/attempts | Xem route controller |
| **`GET`** | `/api/quizzes/:quizId/attempts` | 🟣 RBAC Permission | Xử lý tác vụ GET tại /api/quizzes/:quizId/attempts | Xem route controller |
| **`POST`** | `/api/quizzes/:quizId/attempts/:userId/reset` | 🟣 RBAC Permission | Xử lý tác vụ POST tại /api/quizzes/:quizId/attempts/:userId/reset | Xem route controller |
| **`PUT`** | `/api/quiz-attempts/:attemptId/answers/:questionId` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ PUT tại /api/quiz-attempts/:attemptId/answers/:questionId | Xem route controller |
| **`POST`** | `/api/quiz-attempts/:attemptId/submit` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ POST tại /api/quiz-attempts/:attemptId/submit | Xem route controller |
| **`GET`** | `/api/quiz-attempts/:attemptId/result` | 🟢 Đăng nhập (User JWT) | Xử lý tác vụ GET tại /api/quiz-attempts/:attemptId/result | Xem route controller |

---

<a id='tag'></a>
### 3. Phân hệ Thẻ (Tags)
- **Tệp định nghĩa**: `BE/src/routes/tag/tagApi.ts`
- **Số lượng Endpoint**: **5**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/tags` | ⚪ Tùy chọn (Public / User) | Lấy danh sách thẻ, gồm mô tả và level | Query: `?type=course|post|global&status=active|inactive` |
| **`POST`** | `/api/tags` | 🟢 Đăng nhập (User JWT) | Tạo thẻ mới | Body: `{ name, slug?, type, description?, level?, sortOrder? }` |
| **`PUT`** | `/api/tags/reorder` | 🟢 Đăng nhập (User JWT) | Sắp xếp thứ tự các thẻ | Body: `{ ids: [...] }` |
| **`PATCH`** | `/api/tags/:tagId` | 🟣 RBAC Permission | Cập nhật thông tin thẻ | Body: `{ name?, slug?, description?, level?, status?, sortOrder? }` |
| **`DELETE`** | `/api/tags/:tagId` | 🟣 RBAC Permission | Xóa thẻ | Param: `:tagId` |

### 4. Phân hệ Cấp độ khóa học (Levels)

Level vẫn được khóa học tham chiếu bằng các mã cố định `beginner`, `intermediate`, `advanced`. Bảng `levels` lưu metadata để quản trị tên hiển thị và mô tả mà không làm thay đổi dữ liệu khóa học hiện có.

| Method | Endpoint | Auth | Mô tả | Payload |
|---|---|---|---|---|
| **`GET`** | `/api/levels` | ⚪ Tùy chọn (Public / User) | Danh sách level theo thứ tự hiển thị | None |
| **`PATCH`** | `/api/levels/:code` | 🟣 Quyền cập nhật khóa học | Sửa metadata level | `{ name?, description?, status?, sortOrder? }` |

Response level gồm `{ code, name, description, sortOrder, status }`. Không hỗ trợ tạo hoặc xóa level để bảo toàn enum `courses.level`.

---

<a id='user'></a>
### 1. Phân hệ Xác thực & Quản lý Tài khoản (Authentication & User Profile)
- **Tệp định nghĩa**: `BE/src/routes/user/authApi.ts`
- **Số lượng Endpoint**: **28**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`POST`** | `/api/user/register` | 🌐 Công khai (Public) | Đăng ký tài khoản học viên mới bằng email/mật khẩu | Body: `{ email, password, fullName, phone? }` |
| **`POST`** | `/api/user/login` | 🌐 Công khai (Public) | Đăng nhập bằng email và mật khẩu, cấp JWT Access/Refresh tokens | Body: `{ email, password }` |
| **`POST`** | `/api/user/auth/google` | 🌐 Công khai (Public) | Đăng nhập / Đăng ký nhanh bằng Google OAuth ID token | Body: `{ idToken }` |
| **`POST`** | `/api/user/auth/apple` | 🌐 Công khai (Public) | Đăng nhập / Đăng ký nhanh bằng Apple ID token | Body: `{ identityToken, user? }` |
| **`POST`** | `/api/user/refresh` | 🌐 Công khai (Public) | Làm mới Access Token khi token hết hạn qua Refresh Token | Body: `{ refreshToken? }` hoặc cookie |
| **`POST`** | `/api/user/verify-email` | 🌐 Công khai (Public) | Xác thực email bằng mã kích hoạt OTP | Body: `{ code }` |
| **`GET`** | `/api/user/verify-email` | 🌐 Công khai (Public) | Xác thực email qua đường link chứa token trong email | Query: `?token=...` |
| **`POST`** | `/api/user/forgot-password` | 🌐 Công khai (Public) | Yêu cầu gửi email đặt lại mật khẩu | Body: `{ email }` |
| **`POST`** | `/api/user/reset-password` | 🌐 Công khai (Public) | Đặt lại mật khẩu mới bằng reset token | Body: `{ token, newPassword }` |
| **`POST`** | `/api/user/logout` | 🟢 Đăng nhập (User JWT) | Đăng xuất, thu hồi phiên làm việc hiện tại | None |
| **`GET`** | `/api/user/me` | 🟢 Đăng nhập (User JWT) | Lấy thông tin tài khoản hiện tại, vai trò, quyền và trạng thái hội viên | None |
| **`PUT`** | `/api/user/me` | 🟢 Đăng nhập (User JWT) | Cập nhật thông tin cá nhân (họ tên, bio, headline, sđt, ngày sinh...) | Body: `{ fullName?, bio?, headline?, phone?, birthday? }` |
| **`POST`** | `/api/user/me/avatar` | 🟢 Đăng nhập (User JWT) | Upload ảnh đại diện cá nhân (hỗ trợ multipart/form-data) | Form-data: `file` (ảnh) |
| **`POST`** | `/api/user/me/cover` | 🟢 Đăng nhập (User JWT) | Upload ảnh bìa trang cá nhân (hỗ trợ multipart/form-data) | Form-data: `file` (ảnh) |
| **`POST`** | `/api/user/change-password` | 🟢 Đăng nhập (User JWT) | Đổi mật khẩu người dùng | Body: `{ currentPassword, newPassword }` |
| **`GET`** | `/api/user/sessions` | 🟢 Đăng nhập (User JWT) | Danh sách các phiên đăng nhập (thiết bị, IP, thời gian) | None |
| **`DELETE`** | `/api/user/sessions/others` | 🟢 Đăng nhập (User JWT) | Đăng xuất khỏi tất cả các thiết bị khác ngoại trừ thiết bị hiện tại | None |
| **`DELETE`** | `/api/user/sessions/:sessionId` | 🟢 Đăng nhập (User JWT) | Thu hồi một phiên đăng nhập cụ thể theo ID | Param: `:sessionId` |
| **`POST`** | `/api/user/devices` | 🟢 Đăng nhập (User JWT) | Đăng ký thiết bị nhận thông báo đẩy FCM (Mobile / Web) | Body: `{ token, platform, deviceName? }` |
| **`PATCH`** | `/api/user/devices/:deviceId` | 🟢 Đăng nhập (User JWT) | Cập nhật trạng thái thiết bị nhận thông báo | Param: `:deviceId` |
| **`DELETE`** | `/api/user/devices/:deviceId` | 🟢 Đăng nhập (User JWT) | Xóa / Hủy đăng ký thiết bị nhận push notification | Param: `:deviceId` |
| **`GET`** | `/api/user/notification-preferences` | 🟢 Đăng nhập (User JWT) | Lấy cài đặt cấu hình nhận thông báo (email, push, nhắc học...) | None |
| **`PUT`** | `/api/user/notification-preferences` | 🟢 Đăng nhập (User JWT) | Cập nhật cài đặt nhận thông báo | Body: `{ email?, push?, studyReminder?, studyReminderTime? }` |
| **`GET`** | `/api/user/daily-checkin` | 🟢 Đăng nhập (User JWT) | Lấy thông tin chuỗi ngày điểm danh học tập (Streak, Freeze, Lịch sử) | None |
| **`POST`** | `/api/user/daily-checkin` | 🟢 Đăng nhập (User JWT) | Điểm danh ngày học hôm nay, cập nhật Streak chuỗi ngày học | None |
| **`GET`** | `/api/user/learning-charts` | 🟢 Đăng nhập (User JWT) | Dữ liệu biểu đồ học tập (thời lượng học, bài học hoàn thành 7-30 ngày) | Query: `?days=7` hoặc `?days=30` |
| **`GET`** | `/api/user/onboarding` | 🟢 Đăng nhập (User JWT) | Lấy câu trả lời khảo sát Onboarding định hướng học tập của user | None |
| **`PUT`** | `/api/user/onboarding` | 🟢 Đăng nhập (User JWT) | Cập nhật câu trả lời khảo sát Onboarding (mục tiêu, trình độ, thời gian) | Body: `{ answers: [...] }` |

---

<a id='video'></a>
### 15. Phân hệ Video & Streaming HLS (Multipart Upload, S3/MinIO & Playback)
- **Tệp định nghĩa**: `BE/src/routes/video/videoApi.ts`
- **Số lượng Endpoint**: **14**

| Method | URL Endpoint | Quyền hạn | Mô tả chức năng | Tham số / Body |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/admin/videos/test-multipart-upload-page` | 🌐 Công khai (Public) | Trang web HTML giao diện test upload video phân đoạn lớn | None |
| **`POST`** | `/api/admin/videos/init-multipart-upload` | 🟣 RBAC Permission | Khởi tạo upload video dung lượng lớn qua S3/MinIO Multipart Upload | Body: `{ title, filename, size, totalParts }` |
| **`POST`** | `/api/admin/videos/init-upload` | 🟣 RBAC Permission | Khởi tạo tải lên video đơn thông thường | Body: `{ title, size, filename }` |
| **`POST`** | `/api/admin/videos/link` | 🟣 RBAC Permission | Liên kết video từ nguồn ngoài (YouTube / Vimeo / Cloudflare) | Body: `{ title, url, duration? }` |
| **`POST`** | `/api/admin/videos/:videoId/upload` | 🟢 Đăng nhập (User JWT) | Upload trực tiếp file video lên server | Param: `:videoId`, Form-data: `video` |
| **`POST`** | `/api/admin/videos/:videoId/complete-upload` | 🟢 Đăng nhập (User JWT) | Báo hoàn thành upload video đơn để chuyển sang hàng đợi nén HLS | Param: `:videoId` |
| **`POST`** | `/api/admin/videos/:videoId/multipart/part-url` | 🟢 Đăng nhập (User JWT) | Lấy presigned URL để client upload trực tiếp từng part lên S3/MinIO | Param: `:videoId`, Body: `{ partNumber }` |
| **`POST`** | `/api/admin/videos/:videoId/multipart/complete` | 🟢 Đăng nhập (User JWT) | Báo hoàn tất tất cả parts của video và kích hoạt worker xử lý HLS | Param: `:videoId`, Body: `{ parts: [...] }` |
| **`POST`** | `/api/admin/videos/:videoId/multipart/abort` | 🟢 Đăng nhập (User JWT) | Hủy phiên upload multipart video dang dở để giải phóng dung lượng | Param: `:videoId` |
| **`GET`** | `/api/admin/videos/:videoId/status` | 🟢 Đăng nhập (User JWT) | Tra cứu trạng thái xử lý video (QUEUED, PROCESSING, READY, FAILED) | Param: `:videoId` |
| **`DELETE`** | `/api/admin/videos/:videoId` | 🟢 Đăng nhập (User JWT) | Xóa video khỏi hệ thống và lưu trữ S3/MinIO | Param: `:videoId` |
| **`GET`** | `/api/courses/:courseId/videos/:videoId/playback` | ⚪ Tùy chọn (Public / User) | Lấy link phát video HLS/M3U8 kèm Signed Cookie / Token bảo mật | Params: `:courseId`, `:videoId` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/video` | ⚪ Tùy chọn (Public / User) | Lấy metadata video được gắn trong bài học | Params: `:courseId`, `:lessonId` |
| **`GET`** | `/api/courses/:courseId/lessons/:lessonId/playback` | ⚪ Tùy chọn (Public / User) | Lấy link phát video trực tiếp cho bài học học viên đang mở | Params: `:courseId`, `:lessonId` |

---
