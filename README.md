# E-commerce UI Improvement

## 1. Giới thiệu

Dự án được thực hiện trong khuôn khổ bài tập cá nhân Chương 1 của môn Phát triển ứng dụng Thương mại điện tử.

Em lựa chọn cải tiến giao diện tìm kiếm khi không tìm thấy sản phẩm phù hợp trên website thương mại điện tử, tham khảo từ Tiki.

Mục tiêu của dự án là giúp người dùng dễ dàng nhận biết thông báo không có kết quả, tìm kiếm lại bằng từ khóa gợi ý và khám phá những sản phẩm liên quan.

Giao diện mẫu sử dụng tên ShopDemo, được xây dựng bằng HTML và CSS.

## 2. Website tham khảo

- Tên website: Tiki
- URL: https://tiki.vn
- Khu vực đã khảo sát:
  - Trang chủ.
  - Danh mục sản phẩm.
  - Chi tiết sản phẩm.
  - Tìm kiếm.
  - Giỏ hàng.
- Khu vực lựa chọn cải tiến: Giao diện thông báo và gợi ý khi tìm kiếm không có kết quả phù hợp.

## 3. Chức năng

- Hiển thị thông báo rõ ràng khi không tìm thấy sản phẩm phù hợp với từ khóa.
- Hiển thị các mẹo tìm kiếm và từ khóa gợi ý để người dùng tiếp tục tìm kiếm.
- Cung cấp liên kết tìm kiếm lại trên Tiki bằng từ khóa được chọn.
- Hiển thị danh sách 8 sản phẩm minh họa có liên quan.
- Hiển thị hình ảnh, tên, giá bán và nút thao tác trên từng thẻ sản phẩm.
- Hiển thị lý do gợi ý cho từng sản phẩm.
- Hỗ trợ giao diện responsive trên máy tính, máy tính bảng và điện thoại.

Lưu ý: Đây là trang giao diện mẫu. Các nút "Thêm vào giỏ" chưa có chức năng xử lý thực tế. Hình ảnh và thông tin sản phẩm chỉ mang tính minh họa.

## 4. Công nghệ

- HTML5: Xây dựng cấu trúc nội dung và các thành phần giao diện.
- CSS3: Thiết kế màu sắc, bố cục, nút bấm và hiệu ứng hiển thị.
- CSS Flexbox và Grid: Sắp xếp các thành phần và danh sách sản phẩm.
- Media Queries: Điều chỉnh bố cục phù hợp với các kích thước màn hình khác nhau.

Dự án không sử dụng backend, cơ sở dữ liệu hoặc JavaScript.

## 5. Cách chạy

1. Tải và giải nén thư mục dự án.
2. Đảm bảo các tệp `index.html`, `style.css` và thư mục `images/` được giữ đúng vị trí.
3. Mở tệp `index.html` bằng trình duyệt Chrome, Edge hoặc Firefox.
4. Quan sát giao diện và các chức năng minh họa.
5. Nhấn `F12`, bật chế độ thiết bị di động để kiểm tra giao diện ở các kích thước khác nhau.

Trang web có thể hiển thị giao diện khi không có Internet. Tuy nhiên, các liên kết tìm kiếm đến Tiki cần kết nối mạng.

## 6. Cải tiến đã thực hiện

Vấn đề ban đầu:

Khi không tìm thấy kết quả phù hợp, người dùng có thể gặp khó khăn trong việc lựa chọn từ khóa khác hoặc tiếp tục tìm kiếm. Việc hiển thị những sản phẩm gợi ý không liên quan cũng có thể gây nhầm lẫn.

Các cải tiến giao diện:

- Thiết kế thông báo không tìm thấy kết quả nổi bật, dễ đọc.
- Bổ sung hướng dẫn tìm kiếm và các từ khóa gợi ý.
- Tạo khu vực hiển thị sản phẩm liên quan, kèm lý do gợi ý.
- Phân biệt rõ sản phẩm gợi ý với kết quả tìm kiếm thực tế.
- Thiết kế bố cục responsive với 2 cột sản phẩm trên điện thoại, 3 cột trên máy tính bảng và 4 cột trên máy tính.

Kiểm tra và điều chỉnh mã nguồn:

Qua quá trình rà soát phiên bản ban đầu, phát hiện các từ khóa gợi ý sử dụng `href="#"`, chưa dẫn đến trang tìm kiếm tương ứng.

Những điều chỉnh đã được thực hiện:

- Thay đổi thuộc tính `href` để liên kết đến trang tìm kiếm Tiki với từ khóa tương ứng.
- Thay nút "Xóa bộ lọc" chưa hoạt động bằng liên kết "Tìm lại không lọc".
- Bổ sung CSS cho trạng thái `:focus-visible`, giúp người dùng dễ nhận biết phần tử đang được chọn bằng bàn phím.
- Điều chỉnh cách hiển thị liên kết dạng nút bằng thuộc tính `text-decoration: none`.

Bản mẫu đã được kiểm tra bằng Chromium ở các kích thước 360px, 768px và 1280px. Kết quả cho thấy bố cục không bị tràn ngang và các hình ảnh minh họa hiển thị đầy đủ.

## 7. Hỗ trợ từ AI

Trong quá trình thực hiện bài tập, tôi sử dụng ChatGPT để hỗ trợ:

- Phân tích giao diện và các chức năng của website Tiki.
- Đề xuất phương án cải tiến khu vực tìm kiếm không có kết quả.
- Hỗ trợ xây dựng mã nguồn HTML5 và CSS3.
- Giải thích cấu trúc mã nguồn và cách tổ chức giao diện responsive.
- Hỗ trợ kiểm tra bố cục, phát hiện hạn chế và đề xuất chỉnh sửa mã nguồn.

Kiểm tra và điều chỉnh:

- Đối chiếu các nhận xét của AI với những thông tin đã khảo sát trên website.
- Kiểm tra cách hiển thị giao diện ở các kích thước màn hình khác nhau.
- Rà soát và điều chỉnh các liên kết tìm kiếm chưa hoạt động trong mã nguồn ban đầu.
- Phân biệt các chức năng đã hoạt động với những thành phần chỉ mang tính minh họa.