# CSS Field Notes - Lab 07: Advanced CSS · Layout

> **Một trang web tốt không chỉ hiển thị đẹp trên máy tính, mà còn cần giữ được bố cục hợp lý và trải nghiệm dễ sử dụng trên nhiều thiết bị.**
>
> Đây là nhật ký thực hành CSS nâng cao của mình: từ việc hiểu luồng hiển thị, định vị phần tử cho đến thiết kế responsive và xây dựng hiệu ứng cho giao diện web.

## 1. Thông tin sinh viên

| Thông tin | Chi tiết |
|---|---|
| **Họ và tên** | **Phạm Quang Huy** |
| **Mã số sinh viên** | `32261020149` |
| **Trường** | Đại học Kinh tế Thành phố Hồ Chí Minh (UEH) |
| **Học phần** | Phát triển ứng dụng Thương mại điện tử |
| **Mã lớp học phần** | `26C1INF50902701` |
| **Giảng viên** | TS. Nguyễn Mạnh Tuấn |
| **GitHub cá nhân** | [huypham32261020149-work](https://github.com/huypham32261020149-work) |
| **Repository học phần** | [ecommerce-ui-improvement](https://github.com/huypham32261020149-work/ecommerce-ui-improvement) |

## 2. Mục tiêu của Lab 07

Lab 07 - **Advanced CSS: Layout** thuộc nội dung thực hành CSS nâng cao, giúp mình hiểu cách trình duyệt sắp xếp các thành phần trên trang và cách chủ động xây dựng giao diện phù hợp với những ngữ cảnh hiển thị khác nhau.

Sau khi thực hành, các kiến thức trọng tâm gồm:

- **Tổ chức bố cục:** phân biệt phần tử inline/block, hiểu document flow; sử dụng `position`, `top`, `left`, `z-index` để kiểm soát vị trí và thứ tự chồng lớp.
- **Sắp xếp nội dung:** sử dụng `float`, `clear`, khoảng cách và vùng chứa để tạo bố cục hình ảnh, văn bản, hai cột và ba cột.
- **Thiết kế responsive:** kết hợp media queries và viewport để giao diện thay đổi theo chiều rộng của thiết bị.
- **Tạo tương tác trực quan:** thực hành `transform`, `transition`, `filter` và `@keyframes` để tạo hiệu ứng mà không cần viết JavaScript cho từng hiệu ứng đơn giản.
- **Làm quen với framework:** sử dụng hệ thống lưới và các thành phần của Bootstrap để tổ chức giao diện nhanh và nhất quán hơn.

Mục tiêu lớn hơn của mình là vận dụng các kỹ thuật này vào website thương mại điện tử: trang danh mục có sidebar, thẻ sản phẩm có nhãn và hiệu ứng hover, thanh điều hướng thích ứng với điện thoại và bố cục sản phẩm được hiển thị rõ ràng trên nhiều màn hình.

## 3. Cấu trúc thư mục

```text
CSS-NangCao/
├── index.html                       # Portfolio, giới thiệu và điều hướng 19 Exercise
├── README.md                        # Tài liệu giới thiệu
└── Lab07/
    ├── lab07-exercise01.html
    ├── lab07-exercise01.css
    ├── lab07-exercise02.html
    ├── lab07-exercise02.css
    ├── ...
    ├── lab07-exercise12.html        # Được dùng tiếp cho Exercise 7.13
    ├── lab07-exercise12.css
    ├── lab07-exercise12-desktop.css
    ├── lab07-exercise12-mobile.css
    ├── lab07-exercise14.html
    ├── ...
    ├── lab07-exercise19.html
    ├── bootstrap/                   # Thư viện Bootstrap của bài thực hành
    └── images/                      # Ảnh dùng trong các Exercise
```
## 4. Tổng quan 5 nhóm Exercise

| Nhóm | Exercise | Nội dung thực hành | Kiến thức trọng tâm |
|---|---|---|---|
| **01 · Flow & Position** | 7.1-7.4 | Document flow, relative/absolute positioning, thứ tự chồng lớp | `display`, `position`, `z-index` |
| **02 · Float & Clearing** | 7.5-7.9 | Sắp xếp hình ảnh và văn bản, xử lý phần tử float, lớp phủ trên ảnh | `float`, `clear`, `relative`, `absolute` |
| **03 · Layout & Responsive** | 7.10-7.13 | Bố cục hai/ba cột, desktop/mobile, menu tương thích | `margin`, `media`, `viewport` |
| **04 · Visual Effects** | 7.14-7.18 | Biến đổi, chuyển tiếp, bộ lọc hình ảnh và hoạt ảnh | `transform`, `transition`, `filter`, `@keyframes` |
| **05 · Bootstrap** | 7.19 | Grid, navbar, panel, list group, jumbotron, nested columns | `.container`, `.row`, `.col-md-*` |

### 4.1. Nhóm 01 - Hiểu phần tử được đặt ở đâu

Ở các Exercise 7.1-7.4, mình quan sát cách phần tử xuất hiện theo document flow, rồi thay đổi vị trí bằng `relative` và `absolute`. Bài `z-index` giúp mình hiểu rằng **phần tử có giá trị z-index lớn hơn không phải lúc nào cũng nổi lên trên mọi thành phần khác**, vì còn phụ thuộc vào stacking context và quan hệ cha/con.

### 4.2. Nhóm 02 - Kiểm soát hình ảnh, văn bản và lớp phủ

Các Exercise 7.5-7.9 minh họa cách `float` tạo bố cục hình ảnh đi cùng nội dung, còn `clear` giúp xử lý những phần tử xuất hiện sau vùng float. Bài 7.9 kết hợp định vị để đặt caption và banner trực tiếp trên ảnh - một cách làm có thể dùng cho nhãn **SALE** hoặc **NEW** trên thẻ sản phẩm.

### 4.3. Nhóm 03 - Một bố cục, nhiều kích thước màn hình

Ở các Exercise 7.10-7.13, mình thử thiết kế bố cục hai cột, ba cột và chuyển đổi kiểu hiển thị giữa desktop/mobile. Điểm quan trọng nhất là phân biệt: **media query chọn quy tắc CSS dựa trên viewport**, còn thẻ `<meta name="viewport">` giúp trình duyệt di động thiết lập viewport phù hợp với thiết bị.

### 4.4. Nhóm 04 - Làm giao diện sống động nhưng có kiểm soát

Các Exercise 7.14-7.18 giúp mình tạo hiệu ứng xoay, phóng to, đổi màu, lọc ảnh và animation tự chạy. Mình rút ra rằng hiệu ứng nên hỗ trợ người dùng nhận biết trạng thái tương tác, không nên chỉ dùng để trang trí. Với website TMĐT, các hiệu ứng hover tinh tế trên nút bấm hoặc thẻ sản phẩm thường hữu ích hơn những chuyển động liên tục gây mất tập trung.

### 4.5. Nhóm 05 - Xây dựng bố cục bằng Bootstrap

Exercise 7.19 giúp mình thực hành hệ thống lưới 12 cột và các thành phần Bootstrap có sẵn. Nhờ đó, mình có thể hình dung cách xây dựng một trang có thanh điều hướng, sidebar danh mục và khu vực hiển thị các thẻ sản phẩm trong nested columns.

## 5. Truy cập bài thực hành trên GitHub Pages

**Website portfolio:**  
[https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/)

**Mã nguồn trên GitHub:**  
[https://github.com/huypham32261020149-work/ecommerce-ui-improvement/tree/main/CSS-NangCao](https://github.com/huypham32261020149-work/ecommerce-ui-improvement/tree/main/CSS-NangCao)

### Mở nhanh từng Exercise

Các liên kết dưới đây trỏ **trực tiếp đến trang chạy trên GitHub Pages** theo cấu trúc thư mục của bài nộp:

| Exercise | Nội dung | Mở bài |
|---|---|---|
| **7.1** | Document Flow | [Mở Exercise 7.1](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise01.html) |
| **7.2** | Relative Positioning | [Mở Exercise 7.2](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise02.html) |
| **7.3** | Absolute Positioning | [Mở Exercise 7.3](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise03.html) |
| **7.4** | Stacking Using Z-Index | [Mở Exercise 7.4](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise04.html) |
| **7.5** | Floating Elements | [Mở Exercise 7.5](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise05.html) |
| **7.6** | Floating in a Container | [Mở Exercise 7.6](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise06.html) |
| **7.7** | Floating Multiple Items | [Mở Exercise 7.7](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise07.html) |
| **7.8** | Floating and Clearing | [Mở Exercise 7.8](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise08.html) |
| **7.9** | Using Positioning | [Mở Exercise 7.9](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise09.html) |
| **7.10** | Two-Column Layout | [Mở Exercise 7.10](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise10.html) |
| **7.11** | Three-Column Layout | [Mở Exercise 7.11](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise11.html) |
| **7.12** | Media Queries | [Mở Exercise 7.12](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise12.html) |
| **7.13** | Setting the Viewport *(dùng file 7.12)* | [Mở Exercise 7.12-7.13](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise12.html) |
| **7.14** | Transforms | [Mở Exercise 7.14](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise14.html) |
| **7.15** | Transitions | [Mở Exercise 7.15](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise15.html) |
| **7.16** | More Transitions | [Mở Exercise 7.16](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise16.html) |
| **7.17** | Filters | [Mở Exercise 7.17](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise17.html) |
| **7.18** | Animations | [Mở Exercise 7.18](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise18.html) |
| **7.19** | Using Bootstrap | [Mở Exercise 7.19](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/Lab07/lab07-exercise19.html) |

## 6. Một vài ghi chú học tập cá nhân

Trong quá trình làm Lab 07, mình nhận ra một số lỗi nhỏ lại giúp hiểu bài kỹ hơn:

- **Exercise 7.6 - sai đường dẫn CSS:** Trang không có nền và float như mong đợi vì HTML trỏ đến `lab05-exercise06.css` thay vì `lab07-exercise06.css`. Sau khi kiểm tra đường dẫn, mình hiểu rõ hơn tầm quan trọng của việc liên kết đúng tài nguyên.
- **Exercise 7.12 - media query và viewport:** Khi giả lập màn hình điện thoại, website vẫn có thể dùng layout viewport rộng nếu thiếu meta viewport. Điều này giúp mình hiểu rằng giá trị trên thanh Device Toolbar không phải lúc nào cũng là chiều rộng CSS mà media query đang đánh giá.
- **Exercise 7.18 - cú pháp animation:** Việc thiếu dấu chấm phẩy sau `animation-duration` khiến trình soạn thảo báo lỗi nhiều dòng kế tiếp. Mình rút ra rằng nên kiểm tra cú pháp trước khi cho rằng hiệu ứng CSS không hoạt động.

Ba tình huống này cũng nhắc mình một quy trình hữu ích: **kiểm tra đường dẫn → kiểm tra cú pháp → kiểm tra điều kiện hiển thị → thử lại trên trình duyệt**.

## 7. Công cụ và tài liệu

- **Công cụ:** Visual Studio Code, Live Server / Live Preview, Microsoft Edge Developer Tools, GitHub, GitHub Pages.
- **Tài liệu:** *Lab 07 - Advanced CSS: Layout*, thuộc bộ bài thực hành của *Fundamentals of Web Development* (2nd Edition), Randy Connolly và Ricardo Hoar.
- **Mã nguồn nền tảng:** [ch07-lab-start](https://github.com/funwebdev-2nd-ed/ch07-lab-start). Các file starter được sử dụng làm cơ sở để thực hiện và chỉnh sửa theo từng Exercise.

---

**Phạm Quang Huy** · `32261020149` · *Phát triển ứng dụng Thương mại điện tử*  
**Portfolio:** [CSS Field Notes](https://huypham32261020149-work.github.io/ecommerce-ui-improvement/CSS-NangCao/) · **Source:** [GitHub Repository](https://github.com/huypham32261020149-work/ecommerce-ui-improvement)
