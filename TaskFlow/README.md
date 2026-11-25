# TaskFlow V2.5

**Một không gian để chọn việc quan trọng, sắp xếp ngày làm việc và nhìn lại tiến độ.**

TaskFlow là ứng dụng quản lý công việc cá nhân cho bài thực hành JavaScript và Node.js. Ứng dụng mở rộng từ mô hình HTTP server cơ bản của môn học: trình duyệt gửi yêu cầu đến `http.createServer()`, server xử lý dữ liệu và trả về giao diện hoặc JSON.

V2.5 tập trung vào ba câu hỏi: **Hôm nay làm gì? Sắp xếp khi nào? Kết quả ra sao?** Giao diện sử dụng danh sách, đường phân cách và bố cục sổ kế hoạch, kèm phản hồi khi thao tác, thay vì dàn nhiều khối thông tin giống nhau.

## 1. Thông tin sinh viên

| Nội dung | Thông tin |
| --- | --- |
| Họ và tên | Phạm Quang Huy |
| Mã số sinh viên | 32261020149 |
| Lớp học phần | 26C1INF50902701 |
| Trường | Đại học Kinh tế TP. Hồ Chí Minh — UEH |
| Học phần | Phát triển ứng dụng thương mại điện tử |
| Giảng viên | TS. Nguyễn Mạnh Tuấn |
| GitHub cá nhân | [huypham32261020149-work](https://github.com/huypham32261020149-work) |

## 2. Chạy ứng dụng

### Yêu cầu

- Cài [Node.js](https://nodejs.org/en/download). Khuyến nghị **Node.js 24**; cần **Node.js từ 22.13 trở lên** để sử dụng SQLite theo hướng dẫn này.
- Một trình duyệt hiện đại, ví dụ Chrome, Edge hoặc Firefox.
- Không cần cài thư viện npm, tài khoản dịch vụ hay API key để chạy các tính năng của ứng dụng.

### Cách nhanh nhất

1. Giải nén bộ mã nguồn.
2. Mở thư mục chứa `server.js` bằng Visual Studio Code.
3. Chọn **Terminal → New Terminal**.
4. Kiểm tra phiên bản Node.js rồi chạy server:

```bash
node --version
node server.js
```

5. Giữ cửa sổ Terminal đang chạy và mở **[http://localhost:8080](http://localhost:8080)**.

Mặc định ứng dụng lưu dữ liệu bằng JSON tại `data/taskflow.json`. Lần đầu chạy sẽ có dữ liệu mẫu để thử các màn hình. Các công việc mẫu được đặt ngày tương đối theo ngày khởi tạo; chúng không tự thay đổi ngày mỗi lần mở app.

**Dừng server:** quay lại Terminal và nhấn `Ctrl + C`. Dữ liệu đã lưu vẫn nằm trong thư mục `data/` khi bạn chạy lại trên cùng máy.

### Bật SQLite để trình bày phần cơ sở dữ liệu

Trước hết dừng server đang chạy. Trên **Windows PowerShell**:

```powershell
$env:STORAGE = "sqlite"
node server.js
```

Trên **macOS/Linux**:

```bash
STORAGE=sqlite node server.js
```

Kiểm tra nhãn lưu trữ trong giao diện hoặc mở [http://localhost:8080/api/health](http://localhost:8080/api/health). Chế độ SQLite lưu dữ liệu tại `data/taskflow.sqlite`; SQLite có thể tạo thêm tệp hỗ trợ khi server đang chạy.

JSON và SQLite là **hai kho dữ liệu riêng**. Việc đổi biến `STORAGE` không phải là đồng bộ tự động. Để chuyển các task và lịch sử tập trung, hãy xuất JSON ở chế độ cũ, đổi chế độ lưu trữ, rồi nhập bản đã xuất trong phần cài đặt.

Để quay lại JSON trong PowerShell:

```powershell
$env:STORAGE = "json"
node server.js
```

### Nếu cổng 8080 đang được sử dụng

Trên PowerShell:

```powershell
$env:PORT = "8081"
node server.js
```

Trên macOS/Linux:

```bash
PORT=8081 node server.js
```

Sau đó mở `http://localhost:8081`. Chỉ đổi địa chỉ trình duyệt sẽ không đổi cổng của server.

## 3. Các chức năng chính

| Khu vực | Bạn có thể làm gì? |
| --- | --- |
| **Hôm nay** | Xem kế hoạch trong ngày, nhận diện việc quá hạn, chọn tối đa 3 ưu tiên trong ngày và theo dõi khối lượng dự kiến. |
| **Tất cả công việc** | Thêm, xem, sửa, hoàn thành, mở lại, xóa và khôi phục; tìm kiếm, lọc trạng thái, mức ưu tiên và nhóm công việc. |
| **Thêm nhanh** | Nhập một dòng có từ khóa ngày, mức ưu tiên, nhóm, thời lượng hoặc giờ; xem lại các thông tin đã nhận diện trước khi lưu. |
| **Checklist** | Chia một task thành nhiều bước nhỏ, đánh dấu riêng từng bước và xem tiến độ. |
| **Công việc lặp** | Lặp theo ngày, ngày trong tuần, tuần hoặc tháng; khi hoàn thành một lần, tạo lần tiếp theo. |
| **Lịch tuần** | Phân bổ task theo ngày, đặt giờ bắt đầu và thời lượng; kiểm tra trùng lịch. |
| **Gợi ý lịch** | Đề xuất các task và khung giờ phù hợp theo quy tắc; chỉ thay đổi kế hoạch khi người dùng áp dụng. |
| **Kanban** | Quan sát và chuyển task giữa Cần làm, Đang làm và Hoàn thành. |
| **Ma trận ưu tiên** | Nhìn task theo hai tiêu chí: quan trọng và khẩn cấp. |
| **Tập trung** | Chạy Pomodoro cho một task hoặc một phiên tự do; tạm dừng, tiếp tục, kết thúc và xem lịch sử. |
| **Nhìn lại tiến độ / Thống kê** | Theo dõi tình trạng công việc, tỷ lệ đúng hạn, các nhóm công việc và thời gian tập trung trong 7 hoặc 30 ngày. |
| **Thiết lập** | Điều chỉnh tên hiển thị, ngân sách thời gian, giờ làm việc và bộ đếm; xuất/nhập dữ liệu JSON trong mục Dữ liệu của bạn. |

Chi tiết quy tắc nghiệp vụ: [docs/FEATURES.md](docs/FEATURES.md).

## 4. Những điểm cần hiểu khi sử dụng

### Ngày dự định làm khác với hạn chót

Ví dụ, một báo cáo cần nộp vào thứ Sáu nhưng bạn muốn viết vào thứ Tư:

- **Ngày dự định làm:** thứ Tư, để task xuất hiện trong kế hoạch ngày đó.
- **Hạn chót:** thứ Sáu, để đánh giá task còn hạn hay quá hạn.
- **Giờ bắt đầu:** tùy chọn; dùng khi bạn muốn dành một khung giờ cụ thể.
- **Thời lượng dự kiến:** số phút dành cho task, phục vụ lập lịch và cảnh báo khối lượng.

Toàn bộ quy tắc về ngày dùng múi giờ **Asia/Ho_Chi_Minh**. Task chưa hoàn thành chỉ bị xem là quá hạn khi ngày hiện tại đã qua hạn chót.

### Top 3 không giống mức ưu tiên

Mức ưu tiên Cao/Vừa/Thấp thể hiện tính ưu tiên của task. Top 3 là lựa chọn của bạn cho **một ngày cụ thể**. Một task có mức ưu tiên cao không tự động trở thành Top 3. Hoàn thành một mục Top 3 vẫn giữ mục đó trong thành quả của ngày; bạn có thể bỏ chọn nếu muốn thay bằng việc khác.

### Công việc lặp không tạo vô hạn các task

TaskFlow tạo lần tiếp theo khi bạn hoàn thành lần hiện tại. Việc hoàn thành lại cùng một lần sau khi mở lại không tạo thêm bản sao. Các lần đã bỏ lỡ không được đổ hàng loạt vào danh sách; hệ thống tìm lần tiếp theo sau ngày hiện tại. Đối với chu kỳ tháng, ngày cuối tháng được điều chỉnh theo số ngày của từng tháng.

### Gợi ý lịch là tính toán theo quy tắc

Ứng dụng xét hạn chót, mức ưu tiên, độ quan trọng, thời lượng, ngân sách trong ngày và những khung giờ đã có. Bạn xem trước rồi quyết định áp dụng. Đây là bộ quy tắc chạy trong ứng dụng, không sử dụng mô hình AI hay gửi task đến dịch vụ AI bên ngoài.

### Phiên tập trung ghi nhận thời gian thực tế

Chọn 25 phút nhưng kết thúc sớm không đồng nghĩa đã làm đủ 25 phút. Thống kê lấy thời gian thực tế của phiên được kết thúc, bỏ qua thời gian tạm dừng và giới hạn ở thời lượng của phiên. Hoàn tất phiên tập trung cũng không tự đánh dấu task là xong.

## 5. Thêm nhanh: cú pháp hỗ trợ

Ví dụ:

```text
Ôn JavaScript ngày mai !1 #học 30p @09:00
```

| Cú pháp | Ý nghĩa |
| --- | --- |
| `hôm nay`, `today` | Nhận diện ngày hiện tại. |
| `ngày mai`, `tomorrow` | Nhận diện ngày kế tiếp. |
| `2026-12-02` | Một ngày cụ thể theo `YYYY-MM-DD`. |
| `!1`, `!2`, `!3` | Ưu tiên cao, vừa, thấp. |
| `#học`, `#work`, `#cá-nhân` | Nhóm học tập, công việc, cá nhân. |
| `#JavaScript` | Nhãn cho task nếu không phải từ khóa nhóm. |
| `30p`, `30m`, `1h` | Thời lượng dự kiến. |
| `@09:00` | Giờ bắt đầu theo định dạng 24 giờ. |
| `lặp:hàng-ngày`, `lặp:hàng-tuần` | Thiết lập chu kỳ được nhận diện. |

Khả năng nhận diện được giới hạn ở các quy tắc trên, không phải hiểu mọi câu tiếng Việt. Luôn xem lại biểu mẫu xem trước, đặc biệt khi nhập nhiều ngày hoặc giờ. Bạn cũng có thể bỏ qua cú pháp và nhập đầy đủ bằng biểu mẫu Thêm công việc.

## 6. Dữ liệu, sao lưu và chuyển từ bản cũ

### Hai hình thức sao lưu

**Xuất JSON trong giao diện:** phù hợp để chuyển task và lịch sử tập trung sang một bản chạy khác. Phiên tập trung đang chạy không nằm trong bản xuất. Khi nhập, ứng dụng gộp dữ liệu, bỏ qua ID đã tồn tại và giữ cài đặt hiện tại. Đây không phải thao tác thay thế toàn bộ dữ liệu hoặc khôi phục cài đặt.

**Sao chép thư mục `data/`:** phù hợp khi muốn giữ nguyên toàn bộ trạng thái ở chế độ lưu trữ đang dùng. Dừng server trước khi sao chép để tránh lấy bản dữ liệu đang được ghi. Đối với SQLite, sao chép đầy đủ thư mục dữ liệu, không chỉ một tệp khi server còn đang mở.

### Nhập dữ liệu TaskFlow V1

1. Giữ lại thư mục bản cũ để dự phòng.
2. Lấy tệp JSON task của bản cũ, ví dụ `tasks.json`.
3. Chạy V2.5 và mở **Thiết lập → Dữ liệu của bạn**.
4. Chọn nhập tệp JSON. Định dạng được hỗ trợ là mảng task, đối tượng có trường `tasks`, hoặc bản xuất V2.5.
5. Kiểm tra số lượng được nhập/bỏ qua rồi xem lại danh sách, ngày và lịch tuần.

Với task cũ chưa có ngày dự định làm, hệ thống dùng hạn chót cũ làm ngày dự định. Các trường mới như checklist, lặp và thời lượng được bổ sung giá trị mặc định. Nếu dữ liệu không hợp lệ, đợt nhập bị từ chối thay vì chỉ ghi một phần. Nhập không xóa các task có sẵn.

Ngoài nhập bằng giao diện, bản này có luồng chuyển dữ liệu khi khởi tạo kho mới: JSON đọc `data/tasks.json` của V1 nếu chưa có `data/taskflow.json`; SQLite đọc `data/tasks.sqlite` theo cấu trúc V1 được hỗ trợ nếu chưa có dữ liệu V2.5. Tệp cũ được giữ lại. Hãy sao lưu trước, dùng đúng chế độ và kiểm tra dữ liệu sau chuyển đổi. Luồng này không tự nhập lại bản cũ mỗi lần khởi động.

Không đổi đuôi tệp `.sqlite` thành `.json`. Nếu cơ sở dữ liệu cũ có cấu trúc khác với V1 được hỗ trợ, hãy giữ nguyên bản sao và chuyển dữ liệu thành JSON đúng định dạng trước khi nhập.

### Dữ liệu mẫu

Dữ liệu đi kèm là **dữ liệu minh họa**, không phải thống kê hoạt động thật của sinh viên. Kho có dữ liệu mẫu được gắn thông tin nguồn demo để bạn nhận biết khi xem các con số. Bạn có thể sửa hoặc xóa task mẫu bằng giao diện. Để trình bày kết quả sử dụng cá nhân, nên bắt đầu một kho trống rồi dùng task và các phiên tập trung bạn thực sự thực hiện.

### Bắt đầu một kho trống, giữ nguyên dữ liệu đang có

Dừng server. Chọn **một thư mục dữ liệu mới chưa sử dụng**, ví dụ `data-clean`, và tắt việc tạo mẫu khi khởi tạo kho:

Windows PowerShell:

```powershell
$env:DATA_DIR = "./data-clean"
$env:SEED_DEMO = "false"
$env:STORAGE = "json"
node server.js
```

macOS/Linux:

```bash
DATA_DIR=./data-clean SEED_DEMO=false STORAGE=json node server.js
```

Đổi `json` thành `sqlite` nếu muốn kho trống sử dụng cơ sở dữ liệu. `SEED_DEMO=false` chỉ tác động khi khởi tạo **kho mới**; không xóa task hoặc lịch sử của kho đã có. Mỗi thư mục là một không gian dữ liệu riêng, vì vậy đây là cách bắt đầu sạch mà không cần xóa bản đang dùng.

Trong PowerShell, các biến vừa đặt còn hiệu lực trong Terminal hiện tại. Để dùng lại thư mục `data/` mặc định, dừng server rồi chạy:

```powershell
Remove-Item Env:DATA_DIR
Remove-Item Env:SEED_DEMO
node server.js
```

Lệnh macOS/Linux ở trên chỉ đặt các biến cho lần chạy đó; chạy lại `node server.js` sẽ trở về cấu hình mặc định nếu bạn không đặt biến ở nơi khác. Không đưa thư mục kho riêng như `data-clean/` lên GitHub.

## 7. Công nghệ và cách tổ chức

| Thành phần | Vai trò |
| --- | --- |
| HTML, CSS | Cấu trúc, bố cục responsive và hiệu ứng tương tác. |
| JavaScript phía trình duyệt | DOM, sự kiện, điều hướng, biểu mẫu và giao tiếp API bằng `fetch`. |
| Node.js `http` | HTTP server, định tuyến API và phục vụ tệp tĩnh. |
| JSON | Chế độ lưu trữ không dùng hệ quản trị cơ sở dữ liệu. |
| `node:sqlite` | Chế độ cơ sở dữ liệu SQLite. |
| `node:test` | Kiểm thử logic và API. |

```text
TaskFlow-V2.5/
├── server.js             # Điểm chạy HTTP server
├── package.json          # Lệnh chạy và kiểm thử
├── public/               # HTML, CSS, JavaScript và favicon
├── lib/                  # Logic nghiệp vụ, dữ liệu và lưu trữ
├── data/                 # Tệp dữ liệu phát sinh khi chạy
├── scripts/
│   └── check.js          # Kiểm tra cú pháp các tệp JavaScript
├── tests/                # Kiểm thử tự động
├── docs/
│   ├── FEATURES.md       # Phạm vi và quy tắc tính năng
│   ├── DEMO.md           # Kịch bản trình bày khoảng 12 phút
│   └── TESTING.md        # Phạm vi đã kiểm tra và phần cần tự nghiệm thu
├── README.md
└── PROMPTS.md            # Cách sử dụng AI và prompt mẫu
```

Tệp dữ liệu cá nhân không nên được commit lên GitHub. Mã nguồn được tổ chức tách giao diện, nghiệp vụ và lưu trữ để có thể trình bày rõ từng phần, nhưng vẫn giữ `http.createServer()` làm điểm khởi đầu từ bài học.

### Cơ sở dữ liệu SQLite

| Bảng | Nội dung |
| --- | --- |
| `tasks` | Task với mã, tiêu đề, trạng thái, nhóm, ngày; cột JSON lưu đầy đủ thông tin như checklist và nhãn. |
| `focus_sessions` | Phiên tập trung đã kết thúc, task liên quan, số giây thực tế và thời điểm kết thúc. |
| `app_metadata` | Phiên bản dữ liệu, cài đặt và phiên tập trung đang chạy. |

Việc ghi được thực hiện trong transaction. Các phép tính lịch và thống kê nằm trong JavaScript để dễ theo dõi trong bài học. Thiết kế này phục vụ quy mô cá nhân; chưa tối ưu cho lượng dữ liệu lớn hoặc nhiều tiến trình server cùng ghi vào một kho.

## 8. API tiêu biểu

| Phương thức và đường dẫn | Mục đích |
| --- | --- |
| `GET /api/state` | Tải trạng thái ứng dụng, task, cài đặt và phiên tập trung. |
| `POST /api/tasks` | Tạo task. |
| `PATCH /api/tasks/:id` | Sửa các trường task hoặc cập nhật trạng thái. |
| `DELETE /api/tasks/:id` | Đưa task vào trạng thái đã xóa. |
| `POST /api/tasks/:id/restore` | Khôi phục task đã xóa. |
| `POST /api/quick-add/preview` | Phân tích một dòng nhập nhanh, chưa lưu. |
| `GET /api/suggestions?date=YYYY-MM-DD` | Xem đề xuất lịch. |
| `POST /api/suggestions/apply` | Áp dụng các đề xuất còn hợp lệ. |
| `POST /api/focus/start` | Bắt đầu phiên tập trung. |
| `GET /api/stats?days=7` | Đọc thống kê và chuỗi dữ liệu theo ngày. |
| `GET /api/export` | Xuất dữ liệu JSON. |
| `POST /api/import` | Gộp dữ liệu đã kiểm tra hợp lệ. |

Các thao tác ghi dữ liệu được kiểm tra tại server. Khi lịch đã thay đổi hoặc dữ liệu không còn phù hợp, API trả lỗi để người dùng xem lại thay vì ghi đè âm thầm.

## 9. Kiểm thử

Chạy từ thư mục dự án:

```bash
npm test
```

Bộ kiểm thử dùng dữ liệu tạm, không cần dùng dữ liệu cá nhân đang có. Các nhóm kiểm tra quan trọng gồm chuyển ngày, task lặp, ghi nhận hoàn thành, xung đột lịch, nhập dữ liệu, phiên tập trung và lưu trữ. Kết quả của lần chạy trên máy bạn được hiển thị trực tiếp trong Terminal.

**Phạm vi xác minh:** lần chạy kiểm thử cuối trong quá trình xây dựng có **35/35 ca thành công**, gồm 21 ca nghiệp vụ, 8 ca API/lưu trữ và 6 ca kiểm tra hàm dựng nội dung giao diện. Nhóm giao diện chạy trong Node.js, không phải phiên trình duyệt hay kiểm thử tích hợp DOM. Môi trường xây dựng chưa cung cấp được phiên xem trước trình duyệt, nên chưa xác minh trực quan bố cục, kéo thả, bàn phím hoặc tương tác responsive trong trình duyệt thật. Không có ảnh chụp được dùng làm bằng chứng cho những phần chưa kiểm tra này. Xem [docs/TESTING.md](docs/TESTING.md) để biết phạm vi và cách tự nghiệm thu.

Khi tự nghiệm thu giao diện, nên thử ít nhất: tạo task, sửa hạn chót, hoàn thành/mở lại, tìm kiếm, đổi bộ lọc, đặt giờ trùng lịch, kéo task trên Kanban, tải lại trang khi timer đang chạy, xuất/nhập dữ liệu và mở app ở chiều rộng điện thoại.

## 10. Đưa mã nguồn lên GitHub và trình bày

Đưa toàn bộ thư mục mã nguồn lên repository, gồm `README.md`, `PROMPTS.md`, `public/`, `lib/`, `tests/` và `docs/`. Không đưa dữ liệu cá nhân hoặc tệp cơ sở dữ liệu đang dùng lên repository.

**GitHub Pages chỉ phục vụ website tĩnh, nên không trực tiếp chạy HTTP server Node.js và SQLite của bản này.** Để thầy kiểm tra toàn bộ tính năng, có thể clone/tải mã nguồn rồi chạy `node server.js`, hoặc dùng một máy chủ hỗ trợ Node.js và ổ lưu trữ bền vững. Bộ mã nguồn này không tự tạo một dịch vụ đang hoạt động trên Internet.

Tài liệu chính thức: [GitHub Pages là gì?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) và [Node.js SQLite](https://nodejs.org/api/sqlite.html).

Kịch bản thao tác khi trình bày: [docs/DEMO.md](docs/DEMO.md).

## 11. Phạm vi của bản V2.5

TaskFlow phù hợp cho một người sử dụng và cho mục đích thực hành. Server mặc định chỉ lắng nghe trên máy cục bộ. Chỉ chạy **một tiến trình server cho mỗi thư mục dữ liệu**. Bản này chưa có tài khoản đăng nhập, phân quyền, đồng bộ nhiều thiết bị, thông báo nền khi trình duyệt đóng, cộng tác nhóm hoặc kết nối Google Calendar. Không nên đưa nguyên trạng một server chứa dữ liệu cá nhân ra Internet như một dịch vụ nhiều người dùng.

Các giới hạn và cách tính số liệu được trình bày trong [docs/FEATURES.md](docs/FEATURES.md), để người kiểm tra có thể phân biệt rõ chức năng đang có và hướng phát triển tiếp theo.
