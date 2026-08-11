# Kế hoạch tổng thể GATS Academy

> Phiên bản dành cho người quản lý và người không chuyên kỹ thuật  
> Ngày cập nhật: 03/08/2026  
> Phạm vi: Website học viên, hệ thống máy chủ và ứng dụng Mobile dành riêng cho học viên.

## 1. Mục tiêu của tài liệu

Tài liệu này trả lời bốn câu hỏi chính:

1. GATS Academy hiện đang làm tốt điều gì?
2. Những điểm yếu nào có thể ảnh hưởng đến học viên hoặc doanh thu?
3. Việc nào cần làm trước, việc nào có thể làm sau?
4. Khi nào sản phẩm đủ an toàn để mở rộng người dùng?

Tài liệu không đi sâu vào thuật ngữ lập trình. Các công việc được mô tả theo tác động đến học viên, hoạt động kinh doanh và vận hành.

## 2. Kết luận ngắn gọn

GATS Academy đã có đủ nền tảng để trở thành một hệ thống học trực tuyến thực tế, không còn chỉ là bản trình diễn. Website đã có các bước từ xem khóa học, đăng nhập, thanh toán đến học tập. Hệ thống máy chủ đã quản lý khóa học, học viên, đơn hàng, tiến độ, bài kiểm tra và chứng chỉ. Mobile đã có nhiều màn hình đẹp và trải nghiệm học tập phong phú.

Tuy nhiên, ba phần chưa đồng đều:

- Hệ thống máy chủ là phần hoàn thiện nhất.
- Website có nhiều chức năng thật nhưng cần kiểm tra kỹ hơn để tránh lỗi khi sửa giao diện.
- Mobile có giao diện tốt nhưng một số khu vực vẫn đang dùng dữ liệu mẫu hoặc chức năng minh họa.

Trong 2–3 tháng tới, ưu tiên nên là **làm cho các chức năng cốt lõi chạy ổn định và dùng dữ liệu thật**, thay vì tiếp tục thêm nhiều tính năng mới.

## 3. Phạm vi sản phẩm đã chốt

### Website

Website phục vụ:

- Khách chưa đăng nhập.
- Học viên.
- Người muốn tìm hiểu và mua khóa học.

Các chức năng chính:

- Xem và tìm kiếm khóa học.
- Đăng ký, đăng nhập và đăng nhập bằng Google.
- Mua khóa học và theo dõi thanh toán.
- Vào khu vực học tập cá nhân.
- Xem bài học, video, làm bài kiểm tra và theo dõi tiến độ.
- Quản lý hồ sơ, đơn hàng và chứng chỉ.

### Mobile

Ứng dụng Mobile **chỉ dành cho học viên**.

Mobile không dùng để quản trị hệ thống, tạo khóa học hoặc quản lý giảng viên. Những màn hình dành cho admin và mentor hiện có trong mã nguồn sẽ không xuất hiện trong bản phát hành chính thức.

Mobile tập trung vào:

- Đăng nhập và quản lý tài khoản học viên.
- Xem các khóa học đã mua.
- Tiếp tục học trên điện thoại.
- Xem video, bài học và tài liệu.
- Làm quiz, bài tập và flashcard.
- Theo dõi tiến độ và nhận chứng chỉ.
- Nhận thông báo học tập.
- Xem và mua khóa học nếu trải nghiệm thanh toán đã được kiểm tra đầy đủ.

### Hệ thống máy chủ

Đây là phần đứng phía sau Website và Mobile, có nhiệm vụ:

- Lưu tài khoản và bảo vệ quyền truy cập.
- Quản lý khóa học, bài học và giảng viên.
- Quản lý đơn hàng, thanh toán và quyền học.
- Lưu tiến độ học tập thống nhất giữa Website và Mobile.
- Quản lý quiz, bài tập, flashcard và chứng chỉ.
- Gửi thông báo và xử lý video.

Hệ thống máy chủ phải là nguồn dữ liệu chính. Website và Mobile không được tự tạo ra dữ liệu khác nhau.

## 4. Bức tranh hiện tại

| Phần sản phẩm | Tình trạng hiện tại | Đánh giá |
|---|---|---|
| Website | Đã có gần đủ hành trình từ xem khóa học đến học tập | Khá tốt, cần tăng kiểm tra tự động |
| Hệ thống máy chủ | Có nhiều chức năng quản lý học tập và thanh toán | Mạnh nhất, cần củng cố vận hành |
| Mobile học viên | Giao diện và trải nghiệm phong phú | Có tiềm năng, nhưng cần loại dữ liệu mẫu |
| Triển khai máy chủ | Đã có Docker, tên miền và hướng dẫn vận hành | Có nền tảng, cần diễn tập sao lưu và phục hồi |
| Kiểm tra chất lượng | Máy chủ có khá nhiều bài kiểm tra; Website và Mobile còn ít | Chưa cân bằng |
| Theo dõi sự cố | Đã có kiểm tra tình trạng cơ bản | Chưa đủ cảnh báo cho thanh toán, video và lỗi người dùng |

## 5. Đánh giá Website

### Điểm mạnh

- Hành trình của học viên tương đối đầy đủ.
- Giao diện đã có nhận diện thương hiệu EduGats.
- Có thể dùng trên máy tính và điện thoại.
- Có khu vực tìm khóa học, giỏ hàng, thanh toán và học tập.
- Đã hỗ trợ đăng nhập Google, video, bài kiểm tra và chứng chỉ.
- Có các trang điều khoản, quyền riêng tư, thanh toán và hoàn tiền.

### Điểm yếu và ảnh hưởng

| Điểm yếu | Ảnh hưởng có thể xảy ra |
|---|---|
| Một số màn hình chứa quá nhiều chức năng trong cùng một nơi | Sửa một phần có thể làm lỗi phần khác |
| Kiểm tra tự động còn ít | Lỗi có thể chỉ được phát hiện sau khi đưa lên website thật |
| Cách Website và máy chủ hiểu dữ liệu đôi lúc chưa thống nhất hoàn toàn | Có thể hiển thị sai giá, tiến độ hoặc trạng thái đơn hàng |
| Một số danh sách trước đây dùng dữ liệu hoặc số lượng mẫu | Làm người dùng mất niềm tin nếu thông tin không đúng |
| Phương thức thanh toán chưa đa dạng, hiện chủ yếu phụ thuộc vào chuyển khoản/QR | Học viên không có phương thức phù hợp có thể bỏ dở đơn hàng |
| Chưa theo dõi đầy đủ tốc độ tải trang trên điện thoại | Website có thể chậm ở thiết bị hoặc mạng yếu |

### Việc cần làm cho Website

1. Kiểm tra tự động toàn bộ hành trình đăng nhập, mua và học.
2. Chia các màn hình lớn thành những phần nhỏ, dễ sửa và ít gây lỗi dây chuyền.
3. Bảo đảm mọi danh mục, giảng viên, giá và số lượng đều lấy từ dữ liệu thật.
4. Thống nhất cách Website nhận dữ liệu từ hệ thống máy chủ.
5. Đo tốc độ tải trang trên điện thoại và tối ưu ảnh, font chữ, video.
6. Hiển thị rõ khi đang tải, không có dữ liệu hoặc có lỗi.
7. Hiển thị các phương thức thanh toán rõ ràng và chuẩn bị giao diện để bổ sung thẻ ngân hàng, ví điện tử hoặc cổng thanh toán khác.

## 6. Đánh giá hệ thống máy chủ

### Điểm mạnh

- Đã quản lý được hầu hết nghiệp vụ quan trọng của một nền tảng học trực tuyến.
- Có phân quyền cho học viên, giảng viên và quản trị viên.
- Có cơ chế bảo vệ đăng nhập và hạn chế truy cập trái phép.
- Có khả năng xử lý thanh toán, video, thông báo và các công việc chạy nền.
- Có lưu tiến độ học tập, quiz, bài tập, flashcard và chứng chỉ.
- Có công cụ kiểm tra hệ thống còn hoạt động hay không.
- Có quy trình cập nhật cấu trúc dữ liệu và hướng dẫn triển khai.

### Điểm yếu và ảnh hưởng

| Điểm yếu | Ảnh hưởng có thể xảy ra |
|---|---|
| Một số phần xử lý đơn hàng, thanh toán và dữ liệu khởi tạo quá lớn | Khó sửa, khó kiểm tra và dễ phát sinh lỗi liên quan |
| Quy trình cập nhật dữ liệu lịch sử nằm ở nhiều nơi | Có nguy cơ cập nhật thiếu hoặc sai khi triển khai |
| Chưa diễn tập thường xuyên việc phục hồi từ bản sao lưu | Có thể mất nhiều thời gian nếu máy chủ hoặc dữ liệu gặp sự cố |
| Chưa có bảng theo dõi đầy đủ cho thanh toán, video và hàng đợi công việc | Đội vận hành có thể biết sự cố quá muộn |
| Nhiều dịch vụ bên ngoài cần cấu hình chính xác | Sai một thông số có thể làm lỗi Google, email, lưu trữ hoặc thanh toán |
| Hệ thống thanh toán chưa có nhiều lựa chọn cho học viên | Phụ thuộc vào một phương thức chính và có nguy cơ mất đơn hàng khi phương thức đó không thuận tiện hoặc gặp sự cố |

### Việc cần làm cho hệ thống máy chủ

1. Chứng minh thanh toán không cấp thiếu hoặc cấp trùng khóa học khi có yêu cầu gửi lại.
2. Kiểm tra quy trình từ thanh toán thành công đến khi học viên được vào học.
3. Diễn tập sao lưu, cập nhật dữ liệu và phục hồi trên một bản sao an toàn.
4. Tạo cảnh báo khi máy chủ lỗi, thanh toán lỗi, video lỗi hoặc công việc bị ùn.
5. Chia những phần xử lý quá lớn thành các phần nhỏ theo từng nghiệp vụ.
6. Tạo một bộ mô tả dữ liệu chung để Website và Mobile dùng đúng cùng một cách.
7. Ghi lại lịch sử các thao tác quan trọng để dễ kiểm tra khi có tranh chấp.
8. Thiết kế phần thanh toán theo hướng có thể bổ sung nhiều nhà cung cấp mà không phải sửa lại toàn bộ quy trình đơn hàng.

## 7. Đánh giá Mobile dành cho học viên

### Điểm mạnh

- Giao diện hiện đại và có bản sắc riêng.
- Có hành trình chào mừng và lựa chọn mục tiêu học tập.
- Có khu vực khóa học của tôi, bài học, video và tiến độ.
- Có quiz, bài tập, flashcard và nhắc nhở học tập.
- Có thông báo, hỗ trợ tiếng Việt và tiếng Anh.
- Có nền tảng để đăng nhập Google, Apple và nhận thông báo trên điện thoại.
- Có khả năng ghi nhớ tiến độ tạm thời khi mạng không ổn định.

### Điểm yếu và ảnh hưởng

| Điểm yếu | Ảnh hưởng có thể xảy ra |
|---|---|
| Một số màn hình vẫn dùng dữ liệu mẫu | Học viên có thể thấy nội dung không thuộc tài khoản của mình |
| Một số chức năng chỉ là minh họa, như điểm thưởng hoặc AI Coach | Người dùng có thể hiểu nhầm đây là chức năng thật |
| Có cả mã dành cho admin và mentor trong ứng dụng | Làm ứng dụng phức tạp và tăng nguy cơ lỗi dù học viên không dùng |
| Kiểm tra tự động còn ít | Khó bảo đảm hoạt động ổn định trên nhiều loại điện thoại |
| Chưa xác nhận đầy đủ trên thiết bị thật | Đăng nhập, thông báo, video hoặc thanh toán có thể khác máy phát triển |

### Việc cần làm cho Mobile

1. Loại toàn bộ đường dẫn đến màn hình admin và mentor khỏi bản phát hành.
2. Thay dữ liệu mẫu bằng dữ liệu thật cho đăng nhập, khóa học, tiến độ, thông báo và thanh toán.
3. Nếu máy chủ gặp lỗi, hiển thị lỗi và nút thử lại; không tự chuyển sang dữ liệu mẫu.
4. Đánh dấu rõ hoặc tạm ẩn AI Coach, điểm thưởng và xếp hạng nếu chưa dùng dữ liệu thật.
5. Kiểm tra trên điện thoại Android và iPhone thật.
6. Kiểm tra đăng nhập Google/Apple, thông báo, video và mở liên kết từ thông báo.
7. Bảo đảm học trên Website rồi mở Mobile vẫn thấy đúng tiến độ, và ngược lại.
8. Tạo bản phát hành chỉ có vai trò học viên để giảm kích thước và rủi ro.

## 8. Hành trình quan trọng nhất cần bảo vệ

Hành trình tạo ra giá trị chính của GATS Academy là:

```text
Tìm khóa học
    ↓
Xem thông tin và giá
    ↓
Đăng nhập
    ↓
Thanh toán hoặc đăng ký khóa miễn phí
    ↓
Được cấp quyền học
    ↓
Học trên Website hoặc Mobile
    ↓
Tiến độ được lưu thống nhất
    ↓
Hoàn thành và nhận chứng chỉ
```

Nếu một bước trong hành trình này lỗi, doanh thu hoặc trải nghiệm học viên đều bị ảnh hưởng. Vì vậy, hành trình này phải được kiểm tra trước mỗi lần phát hành.

## 9. Thứ tự ưu tiên

### Mức P0 — Bắt buộc trước khi mở rộng người dùng

- Đăng nhập Google và đăng nhập bằng email hoạt động trên Website và thiết bị thật.
- Thanh toán thành công phải cấp đúng một quyền học.
- Khóa học miễn phí phải đăng ký và vào học được.
- Tiến độ học phải giống nhau giữa Website và Mobile.
- Mobile không còn dữ liệu mẫu trong hành trình chính của học viên.
- Không có màn hình admin hoặc mentor trong bản Mobile chính thức.
- Có bản sao lưu và đã thử phục hồi thành công.
- Có cảnh báo khi thanh toán, video hoặc máy chủ gặp lỗi.
- Các bước kiểm tra bắt buộc phải đạt trước khi triển khai.

### Mức P1 — Làm ngay sau khi hệ thống ổn định

- Thống nhất hoàn toàn dữ liệu dùng chung giữa Website, Mobile và máy chủ.
- Chia nhỏ các màn hình và phần xử lý quá lớn.
- Tăng số lượng bài kiểm tra tự động.
- Có bảng đối soát đơn hàng, thanh toán và quyền học.
- Đánh giá và bổ sung phương thức thanh toán phù hợp như thẻ ngân hàng, ví điện tử hoặc cổng thanh toán phổ biến, dựa trên nhu cầu thực tế của học viên.
- Có báo cáo rõ người dùng bị dừng ở bước nào trong hành trình mua và học.
- Loại các tên gọi và cấu trúc “Mock” khỏi phần sản phẩm thật.

### Mức P2 — Tối ưu và phát triển thêm

- Cải thiện tốc độ Website và Mobile.
- Hỗ trợ học khi mạng yếu tốt hơn.
- Phát triển AI Coach bằng dữ liệu thật.
- Phát triển điểm thưởng, bảng xếp hạng và cộng đồng.
- Mở rộng hạ tầng khi số người dùng thực tế yêu cầu.

## 10. Kế hoạch 12 tuần

### Tuần 1: Chốt tình trạng thật

- Lập danh sách chức năng: đã thật, còn mẫu, chưa hoàn chỉnh.
- Tạo môi trường thử nghiệm giống máy chủ thật.
- Chốt người chịu trách nhiệm cho Website, máy chủ, Mobile và kiểm tra chất lượng.
- Ghi lại phiên bản dùng làm mốc.

**Kết quả cần đạt:** mọi người cùng hiểu sản phẩm đang ở đâu và việc nào đang chặn phát hành.

### Tuần 2–4: Làm chắc hành trình mua và học

- Kiểm tra đăng nhập trên Website và Mobile.
- Kiểm tra thanh toán, cấp quyền và trường hợp hệ thống nhận lại thông báo thanh toán.
- Đồng bộ tiến độ Website–Mobile.
- Loại dữ liệu mẫu khỏi Mobile học viên.
- Ẩn hoặc gỡ phần admin và mentor khỏi Mobile.
- Thử sao lưu và phục hồi dữ liệu.

**Kết quả cần đạt:** hành trình mua đến học chạy thành công ít nhất ba lần liên tiếp trên môi trường thử nghiệm, không cấp trùng quyền học.

### Tuần 5–8: Làm hệ thống dễ bảo trì

- Thống nhất cách ba phần trao đổi dữ liệu.
- Chia nhỏ các màn hình và phần xử lý lớn nhất.
- Gom việc lấy dữ liệu vào những nơi quản lý chung.
- Chốt một quy trình cập nhật dữ liệu duy nhất.
- Thêm cảnh báo và bảng theo dõi sự cố.

**Kết quả cần đạt:** sửa một chức năng ít ảnh hưởng dây chuyền; sai khác dữ liệu được phát hiện trước khi triển khai.

### Tuần 9–10: Kiểm tra tải và thiết bị thật

- Thử khi có nhiều người cùng xem khóa học, đăng nhập hoặc cập nhật tiến độ.
- Đo tốc độ Website trên điện thoại.
- Đo độ mượt và mức sử dụng bộ nhớ của Mobile.
- Thử mạng chậm, mất mạng và dịch vụ bên ngoài phản hồi chậm.
- Kiểm tra khả năng sử dụng cho người lớn tuổi hoặc người có hạn chế thị lực.

**Kết quả cần đạt:** hệ thống có giới hạn vận hành rõ ràng và không mất dữ liệu khi kết nối không ổn định.

### Tuần 11–12: Phát hành thử có kiểm soát

- Mời một nhóm học viên thật sử dụng.
- Theo dõi lỗi và hành trình của học viên.
- Kiểm tra điều khoản, quyền riêng tư và yêu cầu xóa dữ liệu.
- Diễn tập xử lý sự cố và quay về phiên bản cũ.
- Quyết định mở rộng dựa trên số liệu.

**Kết quả cần đạt:** bảy ngày dùng thử không có lỗi nghiêm trọng; đơn hàng và quyền học khớp; tỷ lệ lỗi nằm trong mục tiêu.

## 11. Việc cần làm ngay trong 10 ngày làm việc

1. Sửa công cụ kiểm tra chất lượng của Website để chạy ổn định.
2. Lập danh sách toàn bộ vị trí Mobile đang dùng dữ liệu mẫu.
3. Gỡ Mobile admin và mentor khỏi luồng phát hành.
4. Kiểm tra tự động đăng nhập, khóa miễn phí, thanh toán và tiếp tục học trên Website.
5. Kiểm tra đăng nhập và lưu tiến độ trên Mobile.
6. Thử thanh toán gửi thông báo lặp lại để chắc chắn không cấp trùng khóa học.
7. Thử sao lưu và phục hồi dữ liệu trên bản sao.
8. Tạo cảnh báo cho lỗi máy chủ, thanh toán, video và công việc tồn đọng.
9. Bảo đảm danh mục, giảng viên, giá và số lượng trên Website đều là dữ liệu thật.
10. Tổ chức buổi đánh giá được phép phát hành hay chưa dựa trên checklist.

## 12. Chỉ số dành cho người quản lý

### Độ ổn định

- Website và hệ thống hoạt động ít nhất 99,9% thời gian mỗi tháng.
- Tỷ lệ lỗi máy chủ dưới 0,5% lượt yêu cầu.
- Tỷ lệ phiên Mobile không bị văng ứng dụng trên 99,5% khi thử nghiệm.
- Không có trường hợp thanh toán thành công nhưng không được học quá thời gian xử lý đã cam kết.
- Không có trường hợp một thanh toán cấp nhiều quyền học trùng nhau.

### Tốc độ và trải nghiệm

- Trang chính và trang khóa học tải nội dung quan trọng trong khoảng 2,5 giây trên phần lớn điện thoại.
- Video bắt đầu phát ổn định trong điều kiện mạng thông thường.
- Tiến độ học xuất hiện trên thiết bị còn lại trong thời gian ngắn.
- Người dùng luôn thấy thông báo rõ ràng khi có lỗi và biết cách thử lại.

### Kinh doanh và học tập

- Tỷ lệ đăng nhập thành công theo từng phương thức.
- Tỷ lệ từ xem khóa học đến bắt đầu thanh toán.
- Tỷ lệ từ bắt đầu thanh toán đến thanh toán thành công.
- Tỷ lệ bỏ dở theo từng phương thức thanh toán và nhu cầu sử dụng phương thức chưa được hỗ trợ.
- Tỷ lệ học viên mở bài đầu tiên sau khi mua.
- Tỷ lệ hoàn thành bài học, khóa học và nhận chứng chỉ.
- Tỷ lệ học viên quay lại sau 1 ngày và 7 ngày.

## 13. Khi nào một chức năng được xem là hoàn thành?

Một chức năng chỉ được xem là hoàn thành khi:

- Dùng dữ liệu thật trong bản phát hành chính thức.
- Đúng quyền: học viên chỉ thấy và làm được việc của học viên.
- Hoạt động trên Website hoặc Mobile theo đúng phạm vi đã chốt.
- Có trạng thái đang tải, không có dữ liệu, có lỗi và thử lại.
- Đã được kiểm tra tự động ở phần quan trọng.
- Đã được thử trên môi trường gần giống hệ thống thật.
- Có cách theo dõi nếu chức năng gặp lỗi.
- Không làm lộ mật khẩu, thông tin thanh toán hoặc dữ liệu cá nhân.
- Hướng dẫn vận hành đã được cập nhật.

## 14. Phân công trách nhiệm đề xuất

| Nhóm công việc | Người chịu trách nhiệm chính | Phối hợp |
|---|---|---|
| Tài khoản, thanh toán, dữ liệu và quyền học | Backend | Website, Mobile, vận hành |
| Trải nghiệm Website và kiểm tra hành trình Web | Website | Backend, kiểm tra chất lượng |
| Ứng dụng Mobile học viên và kiểm tra thiết bị thật | Mobile | Backend, kiểm tra chất lượng |
| Máy chủ, sao lưu, cảnh báo và triển khai | Vận hành/Backend | Tất cả nhóm |
| Kiểm tra hành trình mua đến học | Kiểm tra chất lượng/Sản phẩm | Website, Backend, Mobile |
| Điều khoản, quyền riêng tư và yêu cầu dữ liệu | Sản phẩm/Vận hành | Website, Backend, Mobile |

Mỗi việc cần đúng một người chịu trách nhiệm cuối cùng, kể cả khi một người đang giữ nhiều vai trò.

## 15. Những việc chưa nên ưu tiên lúc này

- Không mở rộng Mobile cho admin hoặc mentor.
- Không thêm nhiều cơ chế điểm thưởng khi tiến độ học thật chưa ổn định.
- Không quảng bá AI Coach là tính năng chính khi vẫn dùng phản hồi mẫu.
- Không mở rộng cộng đồng trước khi có kiểm duyệt và thông báo ổn định.
- Không thay đổi lớn giao diện checkout khi luồng thanh toán chưa có đủ kiểm tra tự động.
- Không mở rộng lượng người dùng trước khi hoàn tất sao lưu, cảnh báo và đối soát.

## 16. Các quyết định còn cần người quản lý chốt

- Mobile có cho phép mua khóa học trong ứng dụng ngay đợt đầu hay chỉ phục vụ học tập?
- Giai đoạn đầu cần hỗ trợ thêm phương thức thanh toán nào ngoài chuyển khoản/QR: thẻ ngân hàng, ví điện tử hay thanh toán qua kho ứng dụng?
- Chính sách hoàn tiền có nằm trong phạm vi vận hành ban đầu không?
- AI Coach sẽ tạm ẩn, ghi nhãn thử nghiệm hay phát triển thành tính năng thật?
- Có phát hành iPhone cùng lúc với Android không?
- Mục tiêu số học viên đồng thời trong 6 tháng đầu là bao nhiêu?
- Thời gian cam kết xử lý khi thanh toán thành công nhưng chưa được cấp quyền học là bao lâu?

## 17. Kết luận

GATS Academy có nền tảng tốt để phát triển thành sản phẩm thật. Hệ thống không thiếu ý tưởng hay màn hình; điều cần nhất hiện nay là sự tin cậy.

Thứ tự hành động phù hợp là:

1. Làm chắc hành trình đăng nhập, mua và học.
2. Đưa toàn bộ Mobile học viên sang dữ liệu thật.
3. Loại admin và mentor khỏi Mobile.
4. Đồng bộ Website và Mobile qua cùng một nguồn dữ liệu.
5. Tăng kiểm tra, cảnh báo và khả năng phục hồi.
6. Chỉ sau đó mới mở rộng AI, điểm thưởng và cộng đồng.

Nếu hoàn thành đúng thứ tự này, GATS Academy sẽ giảm đáng kể rủi ro mất doanh thu, sai tiến độ học và lỗi khi phát hành; đồng thời tạo nền tảng tốt hơn để mở rộng học viên trong tương lai.
