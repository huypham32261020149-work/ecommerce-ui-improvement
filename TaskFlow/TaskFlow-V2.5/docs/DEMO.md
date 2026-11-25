# Kịch bản trình bày TaskFlow V2.5 — khoảng 12 phút

Mục tiêu là cho thấy app giải quyết được một vòng quản lý công việc hoàn chỉnh, đồng thời giải thích những kiến thức JavaScript/Node.js đã sử dụng. Có thể dành thêm 2–3 phút cho câu hỏi của thầy.

## Chuẩn bị trước buổi trình bày

- Chạy thử `node server.js` và mở app trên trình duyệt.
- Nếu trình bày SQLite, bật chế độ đó trước và kiểm tra `/api/health`.
- Xuất một bản dữ liệu để dự phòng trước khi thao tác thử.
- Chuẩn bị một task chưa hoàn thành, một task gần/quá hạn và một task có checklist.
- Dùng dữ liệu mẫu có ghi rõ “demo”; không gọi lịch sử mẫu là hoạt động cá nhân đã thực hiện.
- Đặt cửa sổ trình duyệt ở kích thước dễ đọc. Mở sẵn VS Code tại `server.js`, tệp logic nghiệp vụ và tệp JavaScript giao diện.
- Chạy `npm test` trước; chỉ nói các ca đã kiểm tra thành công theo kết quả thực tế trên máy.

## Tổng thời lượng

| Thời gian | Phần trình bày | Thao tác màn hình |
| --- | --- | --- |
| 0:00–1:00 | Vấn đề, đối tượng sử dụng và mục tiêu | Mở Hôm nay. |
| 1:00–3:00 | CRUD, tìm kiếm, lọc và checklist | Tạo/sửa một task, đánh dấu bước nhỏ. |
| 3:00–4:30 | Kế hoạch ngày và Top 3 | Chọn việc quan trọng, phân biệt ngày dự định với hạn chót. |
| 4:30–6:00 | Lịch tuần và gợi ý theo quy tắc | Đặt giờ; xem đề xuất và xử lý trùng lịch. |
| 6:00–7:15 | Kanban và ma trận | Chuyển trạng thái, giải thích vì sao task thuộc một ô. |
| 7:15–8:30 | Tập trung và task lặp | Start/pause/resume/finish; hoàn thành task lặp. |
| 8:30–10:00 | Thống kê | Giải thích các chỉ số và phạm vi dữ liệu. |
| 10:00–11:15 | Node.js, API và dữ liệu | Mở code server, API và lưu trữ. |
| 11:15–12:00 | Tổng kết và hướng phát triển | Minh họa responsive, giới hạn và kết luận. |

## 1. Giới thiệu — 1 phút

**Gợi ý lời nói:**

“Em xây dựng TaskFlow để quản lý công việc cá nhân theo ba bước: chọn việc hôm nay, dành thời gian thực hiện và xem lại kết quả. Từ các yêu cầu thêm/sửa/xóa và thống kê của bài tập, em mở rộng thêm Top 3, lịch tuần, checklist và tập trung. Các màn hình cùng sử dụng một tập dữ liệu, nên em có thể theo dõi một task từ lúc tạo đến khi hoàn thành.”

Chỉ vào thanh điều hướng và chọn 3–4 màn hình sẽ demo. Tránh đọc hết danh sách tính năng.

**Keyword:** task lifecycle, CRUD, giao diện responsive, dữ liệu dùng chung.

## 2. Tạo task và thao tác cơ bản — 2 phút

1. Chọn Thêm nhanh và nhập một câu như:

   `Hoàn thiện báo cáo JavaScript ngày mai !1 #học 30p @09:00`

2. Mở phần xem trước. Nói rằng ứng dụng nhận diện một số cú pháp cố định và người dùng vẫn kiểm tra trước khi lưu.
3. Thêm 2 mục checklist: “Kiểm tra chức năng” và “Viết phần nhận xét”.
4. Lưu, tìm task bằng một phần tiêu đề, sau đó lọc theo nhóm Học tập.
5. Sửa mô tả hoặc thời lượng, rồi đánh dấu một bước checklist.

**Gợi ý lời nói:**

“Ở thao tác này, trình duyệt nhận sự kiện submit, lấy dữ liệu từ form và gửi JSON bằng `fetch`. Server kiểm tra dữ liệu trước khi lưu. Checklist là các bước con, nên hoàn thành một bước không tự kết thúc task chính.”

**Keyword:** DOM, event listener, form validation, `fetch`, JSON, REST API.

## 3. Kế hoạch hôm nay và Top 3 — 1 phút 30 giây

1. Mở task vừa tạo và chuyển **ngày dự định làm** về hôm nay, giữ **hạn chót** là ngày mai.
2. Nếu đã có giờ 09:00 trùng lịch, chọn một khung giờ trống hoặc bỏ giờ trước khi lưu.
3. Chuyển sang Hôm nay, chọn task vào Top 3.
4. Chỉ ra phần việc quá hạn và thông tin thời lượng.

**Gợi ý lời nói:**

“Hạn chót cho biết khi nào công việc phải xong; ngày dự định làm cho biết em muốn làm vào ngày nào. Nhờ tách hai trường này, em có thể chủ động làm sớm. Top 3 thể hiện lựa chọn cho ngày hôm nay, không đồng nghĩa với mức ưu tiên Cao.”

**Keyword:** business rule, planned date, due date, date/timezone.

## 4. Lịch tuần và gợi ý — 1 phút 30 giây

1. Mở Lịch tuần và chỉ vị trí của task vừa lên kế hoạch.
2. Đặt giờ cho một task hoặc sửa giờ hiện có.
3. Thử một khung giờ chồng với task khác để minh họa thông báo kiểm tra, rồi sửa thành giờ hợp lệ.
4. Mở gợi ý cho một ngày còn khoảng trống. Đọc một lý do đề xuất và áp dụng một task.

**Gợi ý lời nói:**

“Gợi ý này dựa trên quy tắc về hạn, ưu tiên, thời lượng và khoảng giờ trống. Nó chưa tự lưu; em xem rồi áp dụng. Khi áp dụng, server kiểm tra lại để tránh xếp trùng nếu dữ liệu vừa thay đổi.”

Nếu đã quá giờ làm việc của ngày hiện tại, demo đề xuất cho một ngày tương lai còn chỗ. Không cần thay đổi đồng hồ máy để tạo kết quả.

**Keyword:** time blocking, conflict validation, rule-based scheduling, dữ liệu mới nhất.

## 5. Kanban và ma trận — 1 phút 15 giây

1. Sang Kanban, chuyển task từ Cần làm sang Đang làm.
2. Quay lại một góc nhìn khác để cho thấy trạng thái đã thay đổi.
3. Sang ma trận, bật/tắt cờ Quan trọng của một task rồi chỉ sự thay đổi vị trí.

**Gợi ý lời nói:**

“Kanban giúp theo dõi trạng thái thực hiện. Ma trận giúp nhìn một khía cạnh khác: quan trọng và khẩn cấp. Trong bản này, khẩn cấp được xác định từ hạn chót đến ngày mai hoặc đã quá hạn; còn quan trọng do người dùng lựa chọn.”

**Keyword:** state, drag and drop, phân loại dữ liệu, render.

## 6. Tập trung và lặp — 1 phút 15 giây

1. Chọn một task chưa xong và bắt đầu một phiên tập trung.
2. Tạm dừng, tiếp tục rồi kết thúc sớm. Không cần đợi 25 phút trong buổi demo.
3. Giải thích rằng phiên chỉ ghi thời gian thực tế; task chưa tự đổi thành Hoàn thành.
4. Với một task khác có chu kỳ lặp, đánh dấu hoàn thành và cho thấy lần kế tiếp xuất hiện.

**Gợi ý lời nói:**

“Đồng hồ dùng mốc thời gian đã lưu để khôi phục khi tải lại trang. Một phiên kết thúc sớm không được tính đủ thời lượng mục tiêu. Task lặp tạo lần tiếp theo khi hoàn thành, và hệ thống tránh tạo trùng nếu em mở lại rồi hoàn thành cùng một lần.”

**Keyword:** timestamp, persistence, timer, idempotence, recurring task.

## 7. Thống kê — 1 phút 30 giây

1. Chọn **Nhìn lại tiến độ** trên thanh bên để mở Thống kê, rồi đổi khoảng 7/30 ngày.
2. Giải thích ba chỉ số thay vì đọc mọi con số: hoàn thành, đúng hạn và phút tập trung.
3. Chỉ rõ tổng số task là dữ liệu hiện tại, còn biểu đồ và thời gian tập trung theo khoảng ngày đang chọn.
4. Nhắc lại các task và phiên được tạo sẵn là dữ liệu demo.

**Gợi ý lời nói:**

“Tỷ lệ hoàn thành lấy số task đang hoàn thành chia tổng task chưa xóa. Tỷ lệ đúng hạn chỉ tính các task đã xong và có hạn chót. Phút tập trung lấy thời gian thực tế của phiên được kết thúc trong khoảng đã chọn. Vì vậy một task dự kiến 60 phút không tự làm thống kê tăng thêm 60 phút.”

**Keyword:** aggregation, filter/map/reduce, date range, denominator.

## 8. Giải thích code và lưu trữ — 1 phút 15 giây

1. Mở `server.js`, tìm `http.createServer()` để nối trực tiếp với code được học.
2. Chỉ cách định tuyến đến API và phục vụ `public/`.
3. Chỉ một yêu cầu tạo/sửa task trong JavaScript phía trình duyệt.
4. Mở `/api/health` để chứng minh chế độ JSON hoặc SQLite đang dùng.
5. Nếu đủ thời gian, tải lại trang để cho thấy dữ liệu vừa tạo vẫn tồn tại.

**Gợi ý lời nói:**

“Phần khởi đầu vẫn là HTTP server Node.js. Em tách logic nghiệp vụ và lưu trữ để dễ đọc. JSON đáp ứng bản không dùng cơ sở dữ liệu; SQLite là lựa chọn có cơ sở dữ liệu. Đổi chế độ là đổi kho dữ liệu, nên muốn chuyển dữ liệu em dùng xuất/nhập JSON.”

**Keyword:** HTTP, request/response, routing, separation of concerns, SQLite.

## 9. Tổng kết — 45 giây

Thu nhỏ cửa sổ để thể hiện bố cục điện thoại, rồi kết thúc:

“Qua bài này, em nối được kiến thức JavaScript về DOM và sự kiện với HTTP server và lưu trữ dữ liệu. Em chú ý những trường hợp thực tế như xếp trùng lịch, hoàn thành task lặp nhiều lần và ghi thời gian tập trung. Bản hiện tại dành cho một người dùng trên máy chạy server; các bước tiếp theo có thể là đăng nhập, đồng bộ thiết bị và kết nối lịch bên ngoài.”

Nếu được hỏi về AI: giải thích cách dùng AI để hỗ trợ thiết kế, viết và rà soát code, đồng thời chỉ vào [PROMPTS.md](../PROMPTS.md). Không gọi bộ gợi ý nội bộ là một mô hình AI.

## Câu hỏi thầy có thể đặt ra

| Câu hỏi | Ý chính để trả lời |
| --- | --- |
| Tại sao không chỉ dùng localStorage? | Bài làm cần thực hành Node.js/API và lựa chọn cơ sở dữ liệu; server là nơi kiểm tra và lưu trạng thái chung của ứng dụng. |
| Vì sao không lên GitHub Pages là chạy hết? | GitHub Pages phục vụ tệp tĩnh; phần HTTP server và SQLite cần môi trường chạy Node.js. |
| Có phải AI tự xếp lịch không? | Không; quy tắc xét ưu tiên, hạn, thời lượng, khung giờ trống và ngân sách. |
| Task có hạn ngày mai sao xuất hiện hôm nay? | Ngày dự định và hạn chót là hai trường khác nhau. |
| Xong Pomodoro thì task có xong luôn không? | Không; hoàn thành phiên và hoàn thành task là hai quyết định khác nhau. |
| Tắt rồi bật server có mất dữ liệu không? | Dữ liệu đã lưu vẫn còn trong thư mục dữ liệu; cần dùng đúng kho JSON hoặc SQLite. |
| Mở nhiều người cùng dùng được không? | Bản này là không gian cá nhân, chưa có tài khoản/phân quyền; không trình bày nó như dịch vụ cộng tác nhiều người. |
