# Admin UAT checklist — staging

> Mục tiêu: chứng minh Admin đủ để vận hành vòng commerce → học → chứng chỉ trước mở bán.
> Chạy trên **staging** (không production). Tick từng dòng khi pass.

## A. Commerce + học + chứng chỉ

| # | Bước | Tài khoản | Pass? | Ghi chú |
|---|------|-----------|-------|--------|
| A1 | Admin tạo khóa draft đủ readiness (thumbnail, mô tả, outcomes, ≥1 chương/bài, video ready hoặc quiz/assignment) | Admin | ☐ | |
| A2 | Publish khóa — nút Publish và đổi status đều bị chặn nếu thiếu readiness | Admin | ☐ | Expect 400 từ API nếu bypass UI |
| A3 | Web/Mobile mua khóa bằng QR SePay (sandbox hoặc số nhỏ) | Learner | ☐ | |
| A4 | Đơn chuyển `paid` → enrollment active | Admin Orders | ☐ | |
| A5 | Học viên vào học, hoàn thành quiz/assignment tối thiểu 1 bài | Learner | ☐ | |
| A6 | Hoàn thành khóa → certificate xuất hiện (profile + Admin Certificates) | Both | ☐ | |
| A7 | Admin issue tay 1 cert nếu auto-issue fail | Admin | ☐ | |

## B. Payment exceptions + enrollment repair

| # | Bước | Pass? | Ghi chú |
|---|------|-------|--------|
| B1 | Tạo/giả lập amount mismatch hoặc order not-found → xuất hiện ở **Ngoại lệ thanh toán** | ☐ | |
| B2 | Resolve exception + ghi audit | ☐ | |
| B3 | Repair enrollment từ chi tiết đơn (nếu paid nhưng chưa vào học) | ☐ | |

## C. Instructor scope

| # | Bước | Pass? | Ghi chú |
|---|------|-------|--------|
| C1 | Admin gán instructor cho 1 khóa (Users → role + course scope) | ☐ | |
| C2 | Instructor chỉ thấy/sửa khóa được gán; không transfer ownership | ☐ | |
| C3 | Instructor tạo/sửa curriculum, quiz, assignment trên khóa đó | ☐ | |
| C4 | Instructor không truy cập Orders/Analytics (adminOnly) | ☐ | |

## D. Leads + bank recon (quy trình tay)

| # | Bước | Pass? | Ghi chú |
|---|------|-------|--------|
| D1 | Submit form tư vấn Web → lead ở **Danh sách tư vấn** + notification | ☐ | |
| D2 | Gán assignee, đổi status, ghi note | ☐ | |
| D3 | Export CSV leads | ☐ | |
| D4 | Đối chiếu 1 ngày: SePay ↔ Orders theo [quy trình bank](./huong-dan-van-hanh-ngay.md) §7 | ☐ | |
| D5 | Bank accounts Admin (nếu có UI) hoặc xác nhận `bank_accounts` / env đúng | ☐ | |

## E. Hygiene

| # | Bước | Pass? |
|---|------|-------|
| E1 | `/charts`, `/forms`, `/tables`, `/calendar`, `/ui-elements/*` trả 404 | ☐ |
| E2 | Sidebar không còn mục demo | ☐ |

## Kết luận

- Ngày UAT: ________  
- Người thực hiện: ________  
- Blocking bugs: ________  
- **Go / No-go** mở bán: ________  
