# Sử dụng AI trong quá trình xây dựng TaskFlow V2.5

Tài liệu này ghi rõ mục đích sử dụng AI và cung cấp các prompt có thể dùng để giải thích hoặc tiếp tục cải thiện bài thực hành. Những mục mang nhãn **Prompt mẫu** là cách diễn đạt lại yêu cầu để tham khảo, không phải bản chép nguyên văn toàn bộ lịch sử trò chuyện.

## 1. Yêu cầu thực tế của sinh viên

Đề bài trong lớp yêu cầu xây dựng TODO App quản lý task cá nhân: hiển thị task hôm nay, tìm kiếm/lọc, thêm/sửa/xóa và trang thống kê; đưa mã nguồn lên GitHub cùng README mô tả chức năng.

Sinh viên cung cấp một đoạn Node.js khởi đầu sử dụng `require('http')`, `http.createServer()` và `server.listen(8080)`, rồi yêu cầu phát triển ứng dụng dựa trên cách tổ chức này.

Yêu cầu bổ sung cho V2.5:

> Hãy suy nghĩ và phát triển V2.5 giúp tôi nhé với các phần thông tin, tính năng đầy đủ và trọn vẹn. Đồng thời đảm bảo giao diện không bị quá AI với các ô vuông bo tròn mà hãy cải tiến thêm, có thể bổ sung các hiệu ứng effect khi trỏ chuột và nhiều hơn nhé để app được hoàn thiện nhất có thể.

Trước khi triển khai V2.5, sinh viên cũng yêu cầu tìm hiểu các app quản lý task tương tự, so sánh tính năng và chọn lọc các chức năng có thể áp dụng cho bài tập. Quyết định triển khai tập trung vào quản lý cá nhân, lịch tuần, tập trung và thống kê.

## 2. AI hỗ trợ ở những phần nào?

- Chuyển yêu cầu học phần thành luồng thao tác, dữ liệu task và API.
- Đề xuất cách kết hợp Hôm nay, Top 3, checklist, task lặp, lịch tuần, Kanban và ma trận ưu tiên.
- Soạn mã nguồn HTML/CSS/JavaScript và server Node.js.
- Xây dựng quy tắc kiểm tra dữ liệu, xử lý xung đột lịch và lưu trữ JSON/SQLite.
- Đề xuất và viết kiểm thử cho các logic có rủi ro sai lệch.
- Soạn README, tài liệu chức năng và kịch bản trình bày.

AI hỗ trợ tạo mã không đồng nghĩa ứng dụng có tính năng AI. Chức năng Thêm nhanh và Gợi ý lịch của TaskFlow dùng quy tắc xác định trước trong mã nguồn; không gọi một dịch vụ mô hình ngôn ngữ bên ngoài.

## 3. Prompt mẫu: đặc tả chức năng

```text
Xây dựng TaskFlow V2.5, một ứng dụng TODO cá nhân bằng HTML, CSS,
JavaScript thuần và Node.js http. Giữ cấu trúc http.createServer()
để tôi có thể liên hệ với đoạn code được học trên lớp.

App cần có task hôm nay, CRUD, search/filter, Top 3 theo ngày,
checklist, thời lượng dự kiến, task lặp, lịch tuần, Kanban,
ma trận Eisenhower, Pomodoro và thống kê 7/30 ngày.

Phân biệt ngày dự định làm với hạn chót. Dữ liệu phải được lưu
qua các lần mở lại. Hỗ trợ JSON và chế độ SQLite. Các màn hình
dùng chung dữ liệu; không tạo các nút hoặc biểu đồ chỉ để minh họa.

Hãy nêu rõ những quy tắc nghiệp vụ và giới hạn của bản triển khai.
```

## 4. Prompt mẫu: thiết kế giao diện

```text
Thiết kế giao diện như một sổ kế hoạch làm việc cá nhân, phù hợp
với sinh viên. Ưu tiên danh sách rõ ràng, đường phân cách nhẹ,
thanh công cụ ngắn và thứ bậc chữ thay cho quá nhiều ô vuông bo tròn.

Phối xanh rừng, nền giấy sáng và một ít màu nhấn. Dùng hover,
focus, chuyển trạng thái, tiến độ và phản hồi hoàn thành có mục đích.
Không dùng hiệu ứng chuyển động làm người dùng khó đọc hoặc khó bấm.

Phải dùng được trên điện thoại và bằng bàn phím; có nhãn cho input,
trạng thái focus dễ thấy và hỗ trợ reduced motion.
```

## 5. Prompt mẫu: kiểm tra nghiệp vụ

```text
Kiểm tra các trường hợp dễ làm sai trong app:
- Mở lại một task lặp rồi hoàn thành lần nữa có tạo trùng không?
- Chu kỳ tháng xử lý ngày 31 và tháng ngắn ra sao?
- Một task đã có lịch có bị tính hai lần vào ngân sách ngày không?
- Đề xuất lịch còn dùng được nếu người dùng vừa sửa task không?
- Timer đang chạy có khôi phục sau khi tải lại trang không?
- Kết thúc timer sớm có bị cộng đủ thời gian dự kiến không?
- Nhập JSON sai có làm mất hoặc chỉ ghi một phần dữ liệu không?
- Các số liệu dùng ngày hoàn thành thực tế hay hạn chót?

Viết kiểm thử có giá trị cho những hành vi trên và báo rõ giới hạn.
```

## 6. Phần sinh viên cần tự kiểm tra và giải thích

Trước khi nộp, sinh viên nên chạy app trên máy của mình, sử dụng thử dữ liệu riêng và đọc các phần sau:

| Thành phần | Câu hỏi cần giải thích được |
| --- | --- |
| Server | Vì sao dùng `http.createServer()`? Server phân biệt đường dẫn API và tệp giao diện như thế nào? |
| `fetch` | Khi thêm task, trình duyệt gửi dữ liệu nào và nhận phản hồi gì? |
| DOM và sự kiện | Bấm hoàn thành hoặc đổi bộ lọc dẫn đến những cập nhật nào trên giao diện? |
| Lưu trữ | JSON khác SQLite ở điểm nào? Dữ liệu còn lại sau khi tắt server nhờ đâu? |
| Kiểm tra đầu vào | Vì sao chỉ kiểm tra ở biểu mẫu chưa đủ? |
| Lịch tuần | Ngày dự định, hạn chót và giờ bắt đầu khác nhau như thế nào? |
| Gợi ý lịch | Những tiêu chí nào được dùng, và vì sao đây là quy tắc chứ không phải AI? |
| Thống kê | Tỷ lệ hoàn thành, đúng hạn và phút tập trung được tính từ trường dữ liệu nào? |
| Kiểm thử | Một lỗi cụ thể sẽ được phát hiện bằng ca kiểm tra nào? |

Không ghi rằng đã tự kiểm thử hay tự viết toàn bộ chức năng nếu chưa thực hiện. Có thể bổ sung cuối tài liệu những chỉnh sửa và kết quả kiểm tra do chính sinh viên hoàn thành.
