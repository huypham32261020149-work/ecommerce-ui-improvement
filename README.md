# JavaScript Labs | Phạm Quang Huy

Bài thực hành cá nhân học phần **Phát triển ứng dụng Thương mại điện tử** - TS. Nguyễn Mạnh Tuấn.

Repository tổng hợp mã nguồn và kết quả thực hành của **Lab 08, Lab 09 và Lab 10**. Trang `index.html` đóng vai trò portfolio cá nhân và trang điều hướng, giúp giảng viên mở từng Lab và kiểm tra các Exercise trực tiếp trên trình duyệt.

## 1. Thông tin sinh viên

| Thông tin | Chi tiết |
|---|---|
| Họ và tên | **Phạm Quang Huy** |
| Mã số sinh viên | **32261020149** |
| Lớp học phần | **[Bổ sung tên lớp học phần]** |
| Học phần | Phát triển ứng dụng Thương mại điện tử |
| Giảng viên | TS. Nguyễn Mạnh Tuấn |
| GitHub cá nhân | [huypham32261020149-work](https://github.com/huypham32261020149-work) |
| Repository | [ecommerce-ui-improvement](https://github.com/huypham32261020149-work/ecommerce-ui-improvement) |

## 2. Mục tiêu thực hiện ba bài Lab

Ba bài Lab giúp em chuyển từ việc hiểu cú pháp JavaScript sang xây dựng các tương tác thực tế trên website. Cụ thể, em thực hành viết và tổ chức mã JavaScript, thay đổi nội dung HTML qua DOM, xử lý các sự kiện người dùng, kiểm tra biểu mẫu và sử dụng jQuery để tạo hiệu ứng hoặc lấy dữ liệu.

Các kỹ năng này có thể áp dụng vào website thương mại điện tử, chẳng hạn kiểm tra thông tin đăng ký, cập nhật nội dung sản phẩm, phản hồi thao tác thêm vào giỏ hàng và hiển thị dữ liệu mà không cần tải lại toàn bộ trang.

## 3. Cấu trúc thư mục

```text
JavaScript-Labs/
├── index.html                  # Trang portfolio tổng hợp ba Lab
├── README.md                   # Hướng dẫn và mô tả bài thực hành
├── assets/
│   └── profile.jpg             # Ảnh đại diện (cần bổ sung)
├── Lab08/
│   ├── index.html              # Mục lục Lab 08
│   ├── lab08-walkthrough*.html
│   ├── js/                     # Mã JavaScript Lab 08
│   ├── css/                    # CSS Lab 08
│   ├── flags/                  # Quốc kỳ trong Exercise 8.11
│   └── images/
├── Lab09/
│   ├── index.html              # Mục lục Lab 09
│   ├── lab09-walkthrough*.html
│   ├── js/                     # Mã JavaScript Lab 09
│   ├── css/                    # CSS Lab 09
│   └── images/
└── Lab10/
    ├── index.html              # Mục lục Lab 10
    ├── lab10-walkthrough*.html
    ├── js/                     # Mã JavaScript và thư viện jQuery
    ├── css/                    # CSS và hiệu ứng Lab 10
    ├── images/
    └── cities.json             # Chỉ có nếu dùng dữ liệu GET mẫu cục bộ
```

## 4. Nội dung từng Lab

| Bài Lab | Nội dung chính | Kết quả thực hành tiêu biểu |
|---|---|---|
| **Lab 08 - JavaScript 1: Language Foundations** | Cú pháp JavaScript, biến, String, Date, Array, Function, Object và Browser Console | Tạo lịch 30 ngày, tính tiền đơn hàng, hiển thị danh sách quốc gia và quốc kỳ |
| **Lab 09 - JavaScript 2: DOM and Events** | DOM Selectors, thêm/xóa phần tử, sự kiện click và chuột, biểu mẫu, Validation, Debugger | Thay đổi giao diện, ẩn/hiện nội dung, làm nổi bật trường nhập và kiểm tra dữ liệu đăng ký |
| **Lab 10 - JavaScript 3: jQuery** | jQuery Selectors, Events, DOM, Fade/Slide, Animation, GET Request và jqXHR | Tạo hiệu ứng ảnh, xem trước ảnh khi rê chuột, animation và hiển thị dữ liệu JSON |

### Lab 08 - JavaScript 1: Language Foundations

Lab này giúp em làm quen với việc nhúng JavaScript vào HTML, sử dụng các kiểu dữ liệu và xây dựng hàm để giải quyết bài toán đơn giản. Phần em vận dụng rõ nhất là dùng Array và vòng lặp để tạo lịch, cũng như Object để tổ chức thông tin đơn hàng.

- Số Exercise theo tài liệu: **8.1-8.11**.
- [Mở mục lục Lab 08](./Lab08/)
- [Xem Exercise 8.7 - Arrays](./Lab08/lab08-walkthrough07.html)

### Lab 09 - JavaScript 2: DOM and Events

Lab này tập trung vào việc kết nối JavaScript với giao diện: chọn và cập nhật phần tử HTML, thêm hoặc xóa nội dung, xử lý các tương tác và kiểm tra dữ liệu người dùng nhập vào form. Đây là nền tảng để xây dựng biểu mẫu và các chức năng tương tác trên website TMĐT.

- Số Exercise theo tài liệu: **9.1-9.8**.
- [Mở mục lục Lab 09](./Lab09/)
- [Xem Exercise 9.8 - Form Validation](./Lab09/lab09-walkthrough08.html)

### Lab 10 - JavaScript 3: jQuery

Lab này giúp em làm quen với thư viện jQuery để rút gọn thao tác DOM, đăng ký sự kiện, tạo hiệu ứng chuyển động và gửi GET Request. Qua các bài, em hiểu cách thay đổi giao diện dựa trên hành vi người dùng và xử lý kết quả trả về từ nguồn dữ liệu.

- Số Exercise theo tài liệu: **10.1-10.10**.
- [Mở mục lục Lab 10](./Lab10/)
- [Xem Exercise 10.6 - jQuery Animation](./Lab10/lab10-walkthrough06.html)

## 5. Đường dẫn GitHub Pages

Các đường dẫn dưới đây được xây dựng theo cấu trúc repository. **Chúng hoạt động sau khi toàn bộ file được push lên nhánh xuất bản và GitHub Pages triển khai thành công.**

| Trang | Đường dẫn |
|---|---|
| **Portfolio tổng** | [JavaScript Learning Portfolio](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/JavaScript-Labs/) |
| **Lab 08** | [JavaScript 1: Language Foundations](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/JavaScript-Labs/Lab08/) |
| **Lab 09** | [JavaScript 2: DOM and Events](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/JavaScript-Labs/Lab09/) |
| **Lab 10** | [JavaScript 3: jQuery](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/JavaScript-Labs/Lab10/) |

## 6. Hướng dẫn truy cập và kiểm tra bài thực hành

1. Mở [trang portfolio trên GitHub Pages](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/JavaScript-Labs/).
2. Chọn **Lab 08**, **Lab 09** hoặc **Lab 10** tại khu vực danh sách bài Lab.
3. Trong trang mục lục của Lab đã chọn, nhấp vào Exercise muốn kiểm tra. Mỗi liên kết sẽ mở file HTML tương ứng.
4. Thực hiện tương tác theo nội dung bài: nhấn nút, rê chuột, nhập dữ liệu vào form hoặc xem kết quả JavaScript hiển thị.
5. Với các bài về Console, Debugger hoặc GET Request, mở **Developer Tools (F12)** và kiểm tra các tab **Console**, **Sources** hoặc **Network**.

**Xem mã nguồn:** Truy cập [repository GitHub](https://github.com/huypham32261020149-work/ecommerce-ui-improvement) → mở thư mục `JavaScript-Labs/` → chọn thư mục Lab và file `.html` hoặc `.js` cần xem.

### Một số lưu ý khi kiểm tra

- **Lab 08:** Exercise 8.1 là thao tác bật/tắt JavaScript trên trình duyệt, có thể đối chiếu bằng ảnh trong báo cáo. Các Exercise 8.2-8.5 dùng chung `lab08-walkthrough02.html` qua các giai đoạn chỉnh sửa.
- **Lab 09:** Exercise 9.5-9.6 dùng chung `lab09-walkthrough05.html`. Các bước liên quan breakpoint và Console cần thao tác trong Developer Tools.
- **Lab 10:** Exercise 10.1-10.2 dùng chung `lab10-walkthrough01.html`. Để chạy trên GitHub Pages qua HTTPS, thư viện jQuery cần được tải bằng HTTPS hoặc file cục bộ.
---

**Người thực hiện:** Phạm Quang Huy - **MSSV:** 32261020149  
**Học phần:** Phát triển ứng dụng Thương mại điện tử
