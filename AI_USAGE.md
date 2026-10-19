# AI Usage Log

## 1. Công cụ AI

- Tên công cụ: ChatGPT (OpenAI).
- Vai trò: Hỗ trợ đọc đề bài, phân tích website tham khảo, đề xuất cải tiến giao diện, giải thích HTML/CSS, rà soát và chỉnh sửa mã nguồn.
- Phạm vi: Bài tập cá nhân Chương 1 - Phát triển ứng dụng WEB/TMĐT; website tham khảo là [Tiki](https://tiki.vn), giao diện minh họa mang tên ShopDemo.

## 2. Mục đích sử dụng

- Hỗ trợ lập bảng khảo sát 5 khu vực của Tiki: trang chủ, danh mục sản phẩm, chi tiết sản phẩm, tìm kiếm và giỏ hàng.
- Gợi ý các vấn đề trải nghiệm người dùng (UX), đồng thời phân biệt thông tin quan sát được với giả thuyết/đề xuất của AI.
- Lựa chọn hướng cải tiến giao diện khi tìm kiếm không có kết quả phù hợp.
- Đề xuất bố cục, nội dung và mã giao diện mẫu bằng HTML5/CSS3, không cần JavaScript, backend hay cơ sở dữ liệu.
- Hỗ trợ kiểm tra giao diện theo kích thước màn hình, rà soát liên kết, giải thích và chỉnh sửa HTML/CSS.
- Hỗ trợ trình bày README và nhật ký sử dụng AI theo yêu cầu bài tập.

## 3. Prompt đã sử dụng

Dưới đây là một số prompt chính đã gửi trong quá trình thực hiện bài tập:

Prompt 1 - Khảo sát Tiki:

> Tôi chọn Tiki (https://tiki.vn) làm website tham khảo. Hãy hướng dẫn tôi bắt đầu Nhiệm vụ 1: khảo sát đủ 5 khu vực. Hướng dẫn từng bước, chỉ ghi nhận những điều đã kiểm chứng và giúp tôi tự hoàn thiện bảng khảo sát.

Prompt 2 - Lập tiêu chí khảo sát:

> Hãy giúp tôi liệt kê các thông tin cho, cụ thể là các tiêu chí cho bảng khảo sát nhé Bước 2. Khảo sát giao diện và chức năng với các bảng và các tiêu chí để tôi có thể khảo sát tốt hơn nhé

Prompt 3 - Đề xuất
> Tôi đang thực hiện bài tập phát triển giao diện website thương mại điện tử bằng HTML5 và CSS3. Tôi muốn cải tiến khu vực...Hãy đề xuất: 1. Bố cục giao diện. 2. Các thành phần HTML cần sử dụng. 3. Cách tổ chức CSS. 4. Cách hiển thị trên máy tính và điện thoại. 5. Những điểm cần kiểm tra về khả năng sử dụng.

Prompt 4 - Tạo giao diện 

> Dựa trên phương án đã thống nhất, hãy tạo một trang giao diện thương mại điện tử bằng HTML5 và CSS3... Giải thích cách chạy trang web và những phần tôi cần kiểm tra.

## 4. Kết quả AI đề xuất

- Phương án UX: Thay trạng thái “không tìm thấy kết quả” bằng thông báo dễ nhận biết, hướng dẫn sửa từ khóa, tùy chọn tìm lại và khu vực gợi ý sản phẩm.
- Bố cục giao diện: Chia thành các nhóm nội dung gồm (1) thông báo và mẹo tìm kiếm, (2) từ khóa gợi ý, (3) sản phẩm gợi ý. Phân biệt rõ sản phẩm minh họa với kết quả tìm kiếm thực tế.
- Trang mẫu ShopDemo: Có từ khóa mẫu “súng nước”, 6 từ khóa gợi ý và 8 thẻ sản phẩm minh họa với ảnh SVG, tên, giá, lý do gợi ý và nút thao tác.
- Công nghệ: HTML5, CSS3, Flexbox, CSS Grid và Media Queries; không sử dụng backend hay cơ sở dữ liệu.
- Responsive: Lưới hiển thị 2 cột trên điện thoại, 3 cột từ độ rộng 640px và 4 cột từ 1024px.
- Gợi ý chỉnh sửa sau kiểm tra: Thay các liên kết `href="#"` chưa hoạt động bằng liên kết tìm kiếm thực tế trên Tiki; làm rõ chức năng liên kết và cải thiện trạng thái focus.

## 5. Kiểm tra và điều chỉnh

### Kết quả kiểm tra

- Bộ mã nguồn đã được dựng bằng Chromium ở các độ rộng 320, 360, 375, 768, 1024 và 1280px; tại 360px, 768px và 1280px lần lượt quan sát được lưới 2, 3 và 4 cột.
- Trong lượt kiểm tra đã báo cáo, không phát hiện nội dung tràn ngang ở những kích thước trên.
- Kiểm tra tải ảnh khi cuộn trang: 8/8 ảnh SVG được hiển thị.
- Kiểm tra nội dung: có thông báo không tìm thấy kết quả, mẹo tìm kiếm, bộ lọc minh họa, 6 từ khóa gợi ý và 8 sản phẩm mẫu.

### Vấn đề phát hiện trong mã nguồn ban đầu

- Sáu từ khóa gợi ý dùng `href="#"` nên chưa dẫn đến kết quả tìm kiếm mới.
- Biểu mẫu tìm kiếm dùng `action="#"`, không có địa chỉ đích tìm kiếm cụ thể.
- Nút “Xóa bộ lọc” chỉ là nút mô phỏng, không có xử lý khi nhấn.

### Chỉnh sửa đã áp dụng trong phiên bản mới

1. Đổi liên kết từ khóa gợi ý thành URL dạng `https://tiki.vn/search?q=...` với từ khóa tương ứng.
2. Sửa biểu mẫu thành `<form action="https://tiki.vn/search" method="get">`, sử dụng ô nhập `name="q"` để gửi từ khóa.
3. Đổi nút không hoạt động thành liên kết “Tìm lại không lọc”; liên kết này chỉ mở trang tìm kiếm khác, không xóa trực tiếp các nhãn bộ lọc trên trang mẫu.
4. Thêm `text-decoration: none` vào `.btn` để liên kết được trình bày như nút bấm.
5. Bổ sung `.chip:focus-visible` nhằm làm nổi bật liên kết khi thao tác bằng bàn phím.
6. Chỉnh nội dung ghi chú để người xem biết các sản phẩm và nút “Thêm vào giỏ” chỉ mang tính minh họa.

### Phần chưa kiểm chứng hoặc không triển khai

- Không triển khai: Giỏ hàng thực, xử lý xóa bộ lọc ngay trên trang, công cụ tìm kiếm nội bộ, thanh toán và lưu trữ dữ liệu; đây là bản mẫu HTML/CSS tĩnh theo giới hạn đề bài.

## 6. Phần tôi hiểu và có thể giải thích

- `index.html`: Tạo cấu trúc trang; `<header>` là đầu trang, `<main>` là nội dung chính, `<section>` chia các khu vực và `<article>` chứa từng sản phẩm gợi ý.
- `<h1>`, `<h2>`: Phân cấp tiêu đề để người đọc dễ theo dõi và hỗ trợ cấu trúc nội dung.
- `<form method="get">`, `<input name="q">`: Khi tìm kiếm, trình duyệt gửi từ khóa trong tham số truy vấn `q` đến địa chỉ khai báo tại `action`.
- `<a href="...">`: Tạo liên kết đến trang tìm kiếm Tiki; khác với `<button>`, liên kết thích hợp cho thao tác điều hướng đến một địa chỉ khác.
- `<img src="..." alt="..." loading="lazy">`: Hiển thị ảnh; `alt` cung cấp mô tả thay thế và `loading="lazy"` cho phép trì hoãn tải ảnh ngoài vùng nhìn.
- `style.css` và biến `:root`: Quản lý màu, khoảng cách và các giá trị dùng lại để giao diện nhất quán.
- `.empty-state`: Định dạng khu vực thông báo không tìm thấy sản phẩm; `.chip` định dạng các từ khóa gợi ý; `.btn` định dạng hành động nổi bật.
- `text-decoration: none`: Bỏ gạch chân mặc định của liên kết dạng nút; đây là một trong các thay đổi được bổ sung sau khi kiểm tra.
- `:focus-visible`: Hiển thị trạng thái nổi bật khi điều hướng bằng bàn phím; đã bổ sung cụ thể cho `.chip`.
- `.product-grid` và `grid-template-columns`: Sắp xếp các thẻ sản phẩm thành nhiều cột; `@media (min-width: 640px)` và `@media (min-width: 1024px)` thay đổi số cột theo kích thước màn hình.
