# Phạm vi kiểm tra — TaskFlow V2.5

## 1. Kết quả và giới hạn

Trong phiên xây dựng ngày **25/11/2026**, lần chạy kiểm thử cuối đã thành công **35/35 ca**: **21 ca logic nghiệp vụ**, **8 ca API/lưu trữ** và **6 ca kiểm tra hàm dựng nội dung giao diện**. Nhóm API gọi HTTP server thật với server tạm và sử dụng thư mục dữ liệu riêng, gồm JSON, SQLite và chuyển dữ liệu V1.

Nhóm kiểm tra giao diện thực thi các hàm dựng nội dung trong Node.js VM, kiểm tra bảy màn hình, trạng thái rỗng, nội dung đã escape, bản nháp cấu hình tập trung, ngân sách ngày và các ID trong khung HTML. Đây **không phải trình duyệt hoặc kiểm thử tích hợp DOM**.

Mã giao diện cũng được rà soát về cấu trúc, liên kết giữa màn hình, xử lý dữ liệu và các điều khiển hỗ trợ bàn phím. Phiên xem trước trình duyệt không khả dụng trong môi trường xây dựng, vì vậy **chưa có kết quả xác minh bằng trình duyệt thật** cho giao diện, hover, kéo thả và responsive. Không nên hiểu các ca tự động đã qua là toàn bộ trải nghiệm giao diện đã được nghiệm thu.

| Phạm vi | Bằng chứng/cách kiểm tra |
| --- | --- |
| Nghiệp vụ | Các ca tự động trong `tests/domain.test.js`. |
| HTTP API, lưu trữ và chuyển V1 | Các ca tự động trong `tests/api.test.js`. |
| Hàm dựng nội dung giao diện | Các ca Node.js VM trong `tests/views.test.js`, cùng rà soát mã nguồn; chưa thay thế kiểm tra trình duyệt. |
| Bố cục desktop/mobile và hiệu ứng | Cần mở trên trình duyệt thật để nghiệm thu. |
| Triển khai công khai | Chưa triển khai một server trực tuyến trong bộ bàn giao này. |

Nếu bộ kiểm thử được bổ sung sau bản ghi này, số ca hiện hành được xác định bằng kết quả `npm test` trên bộ mã nguồn thực tế. Không dùng số ca trong tài liệu để thay thế log chạy mới.

## 2. Chạy lại kiểm thử tự động

Mở Terminal tại thư mục có `package.json`:

```bash
npm test
```

Không cần mở trước server ở cổng 8080. Bộ kiểm thử tự tạo server và dữ liệu tạm. Dùng Node.js hỗ trợ `node:sqlite` nếu muốn kiểm tra đầy đủ cả chế độ SQLite.

Lệnh kiểm tra cú pháp:

```bash
npm run check
```

Kiểm tra cú pháp không chứng minh một tính năng hoạt động đúng, nhưng giúp phát hiện lỗi khiến tệp không thể được thực thi.

## 3. Những rủi ro đã được đưa vào kiểm tra tự động

- Lịch dùng múi giờ Việt Nam, bao gồm ranh giới ngày.
- Ngày không có thật bị từ chối.
- Chu kỳ tháng giữ được ngày gốc và điều chỉnh theo tháng ngắn.
- Hoàn thành lại cùng một task lặp không tạo lần kế tiếp trùng.
- Nhập chuỗi lặp có tham chiếu lần kế tiếp bị thiếu, tự trỏ vào chính nó hoặc tạo vòng bị từ chối trước khi ghi.
- Mở lại task loại bỏ trạng thái hoàn thành hiện tại.
- Top 3 và các khối giờ không được vượt ràng buộc sau sửa/khôi phục/nhập dữ liệu.
- Gợi ý không tính hai lần thời lượng của task đã dự định trong ngày.
- Gợi ý đã thay đổi cần được xem lại trước khi áp dụng.
- Phiên tập trung chỉ ghi thời gian thực tế; tạm dừng không làm tăng thời gian.
- Kết thúc lại cùng một phiên không cộng trùng lịch sử.
- Thời điểm tự hết thời lượng được giữ khi thao tác kết thúc xảy ra muộn.
- Nhập dữ liệu lỗi không ghi một phần vào kho hiện tại.
- Đọc lại dữ liệu sau khi đóng/mở kho JSON hoặc SQLite.
- Đọc dữ liệu V1 theo cấu trúc tương thích và giữ tệp gốc.
- Thông tin nguồn demo được giữ khi xuất/nhập; `SEED_DEMO=false` chỉ tạo kho mới trống, không xóa kho đang có.

Tên và các kỳ vọng chính xác của từng ca nằm trong tệp kiểm thử. Không phải mọi cách kết hợp dữ liệu đều đã được liệt kê hoặc tự động kiểm tra.

## 4. Checklist nghiệm thu giao diện trên máy cá nhân

Sau khi chạy `node server.js`, mở `http://localhost:8080`. Các ô dưới đây được để trống để sinh viên ghi lại kết quả thực sự trên máy của mình.

### Quản lý công việc

- [ ] Tạo task có tên, mô tả, nhóm, hạn chót và ngày dự định; task xuất hiện đúng màn hình.
- [ ] Sửa một trường rồi tải lại trang; thay đổi được giữ, các trường khác không mất.
- [ ] Tìm bằng tiêu đề, ghi chú hoặc nhãn; tìm không dấu vẫn cho kết quả phù hợp.
- [ ] Kết hợp các bộ lọc rồi xóa điều kiện lọc.
- [ ] Thêm checklist, đánh dấu một mục, lưu và mở lại; tiến độ được giữ.
- [ ] Hoàn thành task rồi mở lại; trạng thái và thống kê đổi tương ứng.
- [ ] Xóa task rồi khôi phục từ Thùng rác.
- [ ] Thử tiêu đề trống hoặc một dữ liệu không hợp lệ; có thông báo rõ ràng.

### Kế hoạch, ưu tiên và task lặp

- [ ] Chọn 3 task vào Top 3; thử mục thứ tư và kiểm tra thông báo.
- [ ] Task có ngày dự định hôm nay nhưng hạn ngày khác hiển thị đúng.
- [ ] Thêm một task vào lịch tuần; đặt giờ và sửa thời lượng.
- [ ] Thử hai khối giờ chồng nhau; lần thay đổi bị từ chối mà dữ liệu cũ vẫn giữ.
- [ ] Xem gợi ý cho một ngày tương lai, bỏ chọn một phần rồi áp dụng phần còn lại.
- [ ] Mở hai tab: lấy gợi ý ở tab thứ nhất, thay đổi lịch ở tab thứ hai, quay lại áp dụng; app yêu cầu xem lại khi đề xuất đã thay đổi.
- [ ] Kéo một task giữa các cột Kanban; thử đổi bằng ô chọn trạng thái khi không dùng kéo thả.
- [ ] Bật/tắt Quan trọng; task đổi nhóm trong ma trận đúng hạn chót.
- [ ] Hoàn thành một task lặp; có một lần kế tiếp. Mở lại và hoàn thành lần cũ; không sinh thêm bản trùng.

### Tập trung, thống kê và dữ liệu

- [ ] Chọn task và thời lượng, bắt đầu timer; tải lại trang và kiểm tra số thời gian còn lại.
- [ ] Tạm dừng rồi tiếp tục; thời gian nghỉ không cộng vào thời gian tập trung.
- [ ] Kết thúc sớm; lịch sử phản ánh thời gian thực tế, task không tự hoàn thành.
- [ ] Thử phiên ngắn 1 phút đến hết thời lượng; kiểm tra việc ghi lịch sử một lần.
- [ ] Đổi thống kê 7/30 ngày; kiểm tra bảng số liệu tương ứng với biểu đồ.
- [ ] Xuất JSON, nhập lại cùng tệp; ID trùng được bỏ qua.
- [ ] Nhập tệp JSON không hợp lệ; dữ liệu đang có không bị mất.
- [ ] Đổi tên/cài đặt, khởi động lại server; cài đặt vẫn được giữ.

### Thiết bị, bàn phím và hiệu ứng

- [ ] Mở ở khoảng rộng 1440 px, 1024 px và 390 px; chữ và nút không bị che.
- [ ] Kiểm tra menu trên điện thoại; đóng menu xong không còn focus vào liên kết đang ẩn.
- [ ] Dùng `Tab`, `Shift+Tab`, `Enter`, `Space`, `Esc` với các nút và hộp thoại.
- [ ] Dùng liên kết Đi đến nội dung chính; vẫn ở đúng màn hình đang xem.
- [ ] Hover vào task, nút và vùng kéo thả; hiệu ứng rõ nhưng không cản thao tác.
- [ ] Bật thiết lập giảm chuyển động của hệ điều hành và kiểm tra hiệu ứng được giảm.
- [ ] Mở DevTools → Console trong quá trình thao tác; ghi lại lỗi nếu có.

## 5. Cách ghi nhận một lỗi

Khi cần sửa một lỗi, ghi ngắn gọn:

1. Màn hình, trình duyệt và chế độ lưu trữ đang dùng.
2. Các bước để tạo lại lỗi.
3. Kết quả bạn mong muốn.
4. Kết quả thực tế.
5. Thông báo trong giao diện/Console/Terminal, đã loại dữ liệu cá nhân nếu chia sẻ.

Ví dụ: “Ở Lịch tuần, tôi tạo A lúc 09:00 trong 30 phút, rồi B lúc 09:15 trong 30 phút. Mong muốn B bị từ chối và A giữ nguyên. Thực tế …”. Cách mô tả này giúp xác định một hành vi cụ thể để sửa và kiểm tra lại.
