# Phạm vi và quy tắc chức năng — TaskFlow V2.5

Tài liệu này giải thích hành vi để người dùng và người chấm có thể kiểm tra một kết quả cụ thể. Các dữ liệu demo được dùng để minh họa giao diện, không thay thế số liệu sử dụng thật.

**Lưu ý về xác minh:** mô tả dưới đây là phạm vi và quy tắc của mã nguồn. Kiểm thử backend, kiểm tra hàm dựng nội dung bằng Node.js và rà soát mã nguồn không thay thế việc kiểm tra bố cục hoặc thao tác trong trình duyệt thật. Phiên xem trước không khả dụng trong môi trường xây dựng; các phần cần nghiệm thu trực quan được liệt kê trong [TESTING.md](TESTING.md).

## 1. Mục tiêu và luồng sử dụng

Một vòng sử dụng thường gặp:

1. Ghi lại việc cần làm bằng biểu mẫu hoặc Thêm nhanh.
2. Xác định hạn chót, thời lượng và nhóm công việc.
3. Chọn ngày thực hiện, đặt giờ nếu cần, rồi chọn tối đa 3 ưu tiên của ngày.
4. Theo dõi tiến độ trên danh sách, Kanban hoặc ma trận ưu tiên.
5. Chạy một phiên tập trung cho task đang làm.
6. Hoàn thành task và xem lại thống kê.

Các màn hình là những góc nhìn trên cùng tập task. Tên task, trạng thái, checklist và lịch không được lưu riêng cho từng màn hình.

## 2. Trường dữ liệu task

| Trường | Ý nghĩa và giới hạn |
| --- | --- |
| Tiêu đề | Bắt buộc; tối đa 160 ký tự. |
| Mô tả | Tối đa 2.000 ký tự. |
| Nhóm | Học tập, Công việc hoặc Cá nhân. |
| Mức ưu tiên | Cao, Vừa hoặc Thấp. |
| Trạng thái | Cần làm, Đang làm hoặc Hoàn thành. |
| Hạn chót | Ngày cần hoàn thành, có thể để trống. |
| Ngày dự định làm | Ngày đưa task vào kế hoạch, độc lập với hạn chót. |
| Giờ bắt đầu | Không bắt buộc; khi đặt giờ phải có ngày dự định làm. |
| Thời lượng dự kiến | Số nguyên từ 5 đến 480 phút. |
| Quan trọng | Giá trị có/không, dùng trong ma trận; độc lập với mức ưu tiên. |
| Top 3 | Gắn task với một ngày cụ thể; tối đa 3 task trong ngày đó. |
| Nhãn | Tối đa 8 nhãn, mỗi nhãn tối đa 32 ký tự. |
| Checklist | Tối đa 30 mục nhỏ, mỗi mục tối đa 160 ký tự. |
| Chu kỳ lặp | Không lặp, hàng ngày, ngày trong tuần, hàng tuần hoặc hàng tháng. |

Server kiểm tra các giá trị này khi nhận yêu cầu. Ngày phải tồn tại trên lịch; ví dụ một ngày không có thật không được chấp nhận chỉ vì có dạng `YYYY-MM-DD`.

## 3. Quản lý và tìm kiếm

### Tạo và cập nhật

Task chỉ được lưu sau khi dữ liệu hợp lệ. Sửa một vài trường không nên xóa những thông tin còn lại. Khi một thao tác bị từ chối, giao diện thông báo để người dùng chỉnh lại.

### Hoàn thành, mở lại và checklist

Hoàn thành task ghi nhận thời điểm hoàn thành. Mở lại task bỏ trạng thái hoàn thành hiện tại. Đánh dấu các mục checklist không tự hoàn thành task cha; hoàn thành task cha cũng không giả định mọi bước nhỏ đã được đánh dấu.

### Xóa và khôi phục

Thao tác xóa đưa task ra khỏi danh sách đang sử dụng và các tổng số task hoạt động. Dữ liệu được giữ để khôi phục. Khi khôi phục, các ràng buộc về lịch và Top 3 vẫn cần được bảo đảm.

### Tìm kiếm và bộ lọc

Tìm kiếm giúp thu hẹp danh sách theo nội dung. Kết hợp bộ lọc để xem đúng nhóm, mức ưu tiên và trạng thái. Xóa điều kiện tìm kiếm/lọc để quay lại toàn bộ danh sách; màn hình không có kết quả cần có cách bỏ lọc rõ ràng.

## 4. Hôm nay và Top 3

**Ngày hiện tại** được xác định theo Việt Nam, không lấy tùy ý theo múi giờ của máy chủ. Mục quá hạn giúp nhận diện task chưa hoàn thành có hạn chót trước ngày hiện tại.

Top 3 là lựa chọn có chủ đích: người dùng chọn tối đa 3 task cho ngày đó. Task đã hoàn thành vẫn thuộc Top 3 của ngày và thể hiện kết quả đã đạt. Đây không phải danh sách tự động gồm mọi task có mức ưu tiên cao.

Ngân sách thời gian trong ngày được đặt trong cài đặt. Cảnh báo vượt ngân sách phản ánh tổng thời lượng dự kiến của kế hoạch; số này không có nghĩa người dùng đã làm từng đó phút. Thời gian tập trung thực tế được ghi nhận riêng.

## 5. Chu kỳ công việc

| Chu kỳ | Hành vi |
| --- | --- |
| Hàng ngày | Tìm lần phù hợp tiếp theo sau ngày hiện tại hoặc mốc đang áp dụng. |
| Ngày trong tuần | Bỏ qua thứ Bảy và Chủ nhật. |
| Hàng tuần | Giữ khoảng cách theo tuần từ mốc của task. |
| Hàng tháng | Giữ ngày gốc khi có thể; điều chỉnh về ngày cuối tháng ngắn hơn. |

Lần tiếp theo được tạo khi task được hoàn thành, không phải bằng một tiến trình chạy nền tạo toàn bộ lịch tương lai. Checklist của lần mới được bỏ đánh dấu, Top 3 và giờ bắt đầu không được mang nguyên sang. Ngày kế hoạch và hạn chót được dịch chuyển tương ứng khi cả hai cùng có.

Ví dụ với ngày 31: tháng có 30 ngày sử dụng ngày 30; chu kỳ sau tiếp tục dựa vào ngày gốc 31 khi tháng đó có ngày này. Mở lại rồi hoàn thành lại cùng một lần không tạo thêm một bản sao của lần kế tiếp.

Muốn dừng lặp, sửa chu kỳ của task đang là lần tiếp theo thành **Không lặp**. Việc sửa một task không phải là chỉnh đồng loạt mọi task đã được tạo trong chuỗi.

## 6. Lịch tuần và gợi ý lịch

### Lập lịch thủ công

Một khối thời gian được xác định bởi ngày, giờ bắt đầu và thời lượng dự kiến. Hai khối không được chồng lấn. Khối mới cũng không được kéo dài qua hết ngày. Người dùng có thể đặt lịch thủ công ngoài giờ làm việc mặc định, miễn vẫn hợp lệ.

Lịch tuần không phải đồng bộ lịch Google hay Outlook. Các thay đổi được lưu trong TaskFlow.

### Gợi ý theo quy tắc

Hệ thống có thể xét:

- Task đang quá hạn hoặc gần hạn.
- Mức ưu tiên và cờ quan trọng.
- Thời lượng của task.
- Ngày đã được người dùng lựa chọn.
- Những khung giờ đã có và khoảng giờ làm việc trong cài đặt.
- Ngân sách thời gian còn lại của ngày.

Task đã được chủ động lên kế hoạch cho một ngày khác không tự bị chuyển về ngày đang xem. Task hoàn thành hoặc đã xóa không được đưa vào đề xuất. Với ngày hiện tại, đề xuất không đặt một phiên mới vào giờ đã qua.

**Xem đề xuất chưa làm thay đổi dữ liệu.** Khi nhấn áp dụng, server kiểm tra lại với dữ liệu mới nhất. Nếu không còn phù hợp, người dùng cần lấy đề xuất mới. Việc gợi ý không bảo đảm một lịch làm việc tối ưu và không đo được mức độ mệt mỏi hoặc khả năng thực tế của người dùng.

## 7. Kanban và ma trận Eisenhower

### Kanban

Ba cột tương ứng với ba trạng thái. Chuyển task sang cột Hoàn thành có cùng tác dụng nghiệp vụ với đánh dấu hoàn thành trong danh sách, bao gồm ghi nhận thời gian và xử lý lặp nếu có. Người dùng vẫn có thể đổi trạng thái bằng biểu mẫu khi không thuận tiện kéo thả.

### Ma trận

| Vị trí | Cách xác định |
| --- | --- |
| Quan trọng, khẩn cấp | Có cờ quan trọng và hạn chót không muộn hơn ngày mai. |
| Quan trọng, chưa khẩn cấp | Có cờ quan trọng; chưa có hạn hoặc hạn sau ngày mai. |
| Ít quan trọng, khẩn cấp | Chưa bật quan trọng; hạn chót không muộn hơn ngày mai. |
| Ít quan trọng, chưa khẩn cấp | Chưa bật quan trọng; chưa có hạn hoặc hạn sau ngày mai. |

Task quá hạn vẫn thuộc phía khẩn cấp. Ma trận dùng những quy tắc này để giải thích vì sao task nằm trong một ô, không tự quyết định thay người dùng rằng task nào nên bị xóa hay giao cho người khác.

## 8. Pomodoro và lịch sử tập trung

Mỗi thời điểm chỉ có một phiên tập trung hoạt động. Có thể gắn với task chưa hoàn thành hoặc chạy tự do. Phiên đang chạy được lưu tại server để có thể khôi phục khi tải lại trang.

- **Tạm dừng:** ngừng tính thêm thời gian.
- **Tiếp tục:** tính tiếp từ phần đã tích lũy.
- **Kết thúc sớm:** lưu số giây thực sự đã chạy, giới hạn ở thời lượng mục tiêu.
- **Hoàn thành đủ thời lượng:** lưu phiên hoàn thành.
- **Hủy:** không ghi phiên đó vào lịch sử tập trung.

Task và phiên tập trung độc lập: kết thúc phiên không tự hoàn thành task. Nếu task sau đó bị xóa, lịch sử phiên đã ghi vẫn có tên tại thời điểm thực hiện. Các thao tác lặp lại từ nhiều tab không được cộng hai lần cùng một phiên.

Không có cam kết gửi thông báo khi ứng dụng đã đóng. Nếu trình duyệt trì hoãn bộ đếm trong tab nền, đồng hồ hiển thị được tính lại theo mốc thời gian khi app tiếp tục hoạt động, thay vì cộng từng lần chạy `setInterval`.

## 9. Cách đọc thống kê

| Chỉ số | Cách tính/phạm vi |
| --- | --- |
| Tổng task | Các task chưa bị xóa. |
| Đã hoàn thành | Các task hiện có trạng thái Hoàn thành. |
| Tỷ lệ hoàn thành | Số task đã hoàn thành chia tổng số task; phạm vi toàn bộ dữ liệu hiện tại. |
| Quá hạn | Task chưa hoàn thành có hạn chót trước hôm nay. |
| Tỷ lệ đúng hạn | Trong số task đã hoàn thành và có hạn chót, tỷ lệ có ngày hoàn thành không sau hạn chót. |
| Phút tập trung | Tổng thời gian thực tế của những phiên được kết thúc trong khoảng 7/30 ngày đang chọn. |
| Số phiên | Các phiên đã được kết thúc và có thời gian thực tế trong khoảng đang chọn. |
| Đường/biểu đồ theo ngày | Số task được hoàn thành và thời gian tập trung theo ngày thực tế. |
| Phân bổ nhóm | Tổng và số hoàn thành theo Học tập/Công việc/Cá nhân trong toàn bộ tập task. |

Với số mẫu nhỏ, phần trăm thay đổi mạnh là bình thường. Nếu chưa có task hoàn thành với hạn chót, tỷ lệ đúng hạn chưa đủ cơ sở để đánh giá hiệu quả. Mở lại task hoặc xóa task có thể làm thay đổi các tổng số hiện tại; đây không phải sổ kiểm toán bất biến.

Các nhận xét tuần là câu mô tả rút ra từ dữ liệu và quy tắc, không phải đánh giá năng lực của sinh viên.

Kho được khởi tạo với dữ liệu demo có thông tin nguồn minh họa. Nếu thêm task thật vào cùng kho, các con số vẫn có thể chứa dữ liệu mẫu. Muốn xem kết quả sử dụng hoàn toàn cá nhân, khởi tạo một thư mục mới bằng `DATA_DIR` và `SEED_DEMO=false` như hướng dẫn trong README.

## 10. Nhập/xuất và tính toàn vẹn

Nhập dữ liệu là **gộp thêm**, không xóa toàn bộ dữ liệu hiện tại. ID trùng được bỏ qua để tránh nhân bản. Toàn bộ đợt nhập được kiểm tra trước khi ghi; dữ liệu không hợp lệ làm đợt nhập thất bại để người dùng sửa lại.

TaskFlow V1 được nhận diện từ mảng task hoặc trường `tasks`. V2.5 bổ sung các trường mới bằng giá trị mặc định phù hợp. Các mốc hoàn thành cũ hợp lệ được giữ để có thể thống kê.

Bản xuất gồm task, cài đặt và lịch sử tập trung, nhưng **quá trình nhập giữ cài đặt hiện tại**. Phiên đang chạy không thuộc bản xuất. Muốn sao lưu toàn bộ kho dữ liệu, dừng server rồi sao chép thư mục `data/`.

## 11. Giới hạn được xác định

| Chủ đề | Phạm vi V2.5 |
| --- | --- |
| Người dùng | Một không gian dữ liệu cá nhân; chưa có tài khoản hoặc phân quyền. |
| Lưu trữ | Tại máy đang chạy server, JSON hoặc SQLite; không tự đồng bộ hai chế độ. |
| Lịch ngoài | Chưa có kết nối Google/Outlook Calendar. |
| Gợi ý | Quy tắc nội bộ, không dùng mô hình AI bên ngoài. |
| Thông báo | Phản hồi trong giao diện; không có dịch vụ thông báo nền/email/SMS. |
| Cộng tác | Chưa giao việc, chia sẻ nhóm hoặc bình luận. |
| Múi giờ | Quy tắc lịch dùng Việt Nam, không có lựa chọn nhiều múi giờ. |
| Triển khai | Cần Node.js cho server; GitHub Pages không chạy phần server này. |

Các mục trên là hướng mở rộng có thể thực hiện sau, không phải chức năng được mô phỏng bằng nút không hoạt động trong giao diện.
