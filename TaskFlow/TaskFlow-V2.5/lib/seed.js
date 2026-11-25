'use strict';

const { randomUUID } = require('node:crypto');
const { dateKey, addDays } = require('./dates');

const DEFAULT_SETTINGS = { name: 'Huy', dailyCapacityMinutes: 240, dayStart: '08:00', dayEnd: '18:00', focusMinutes: 25, breakMinutes: 5 };

function seedState(now = new Date()) {
  const today = dateKey(now);
  const iso = now.toISOString();
  const before = day => `${day}T09:00:00.000Z`;
  const rows = [
    ['Hoàn thiện giao diện TaskFlow', 'Tinh chỉnh danh sách, khoảng cách và trạng thái hover. Kiểm tra lại ở màn hình điện thoại.', 'study', 'high', 60, 0, 0, 'in_progress', true, true, ['Thiết kế lại danh sách công việc', 'Kiểm tra bố cục mobile', 'Rà soát trạng thái rỗng']],
    ['Ôn JavaScript: DOM và sự kiện', 'Thực hành event delegation bằng những thao tác ngay trong app.', 'study', 'medium', 30, 0, 0, 'todo', true, true, ['Ôn querySelector', 'Thực hành addEventListener']],
    ['Chuẩn bị demo với thầy', 'Chọn một luồng xuyên suốt: tạo task → lên lịch → tập trung → xem thống kê.', 'study', 'high', 45, 1, 0, 'todo', true, false, ['Chạy thử CRUD', 'Chuẩn bị dữ liệu minh họa']],
    ['Đọc 10 trang sách', 'Dành một khoảng thời gian ngắn cho việc đọc.', 'personal', 'low', 20, 0, 0, 'todo', false, false, []],
    ['Rà soát README trên GitHub', 'Bổ sung hướng dẫn chạy Node.js và mô tả chức năng.', 'study', 'medium', 25, 0, 0, 'done', true, false, []],
    ['Kiểm tra biểu mẫu đăng ký', 'Thử email không hợp lệ, trường bỏ trống và thông báo lỗi.', 'work', 'high', 30, -1, -1, 'todo', true, false, []],
    ['Sắp xếp tài liệu môn học', 'Đổi tên các bài Lab để giảng viên dễ kiểm tra.', 'study', 'low', 20, 2, null, 'todo', false, false, []],
    ['Lên ý tưởng trang sản phẩm', 'Bố cục ảnh, thông tin, nút thêm vào giỏ hàng và trạng thái hết hàng.', 'work', 'medium', 45, 3, 2, 'todo', true, false, []],
    ['Mua đồ dùng học tập', '', 'personal', 'low', 30, 4, null, 'todo', false, false, []],
    ['Tổng kết tuần học', 'Viết lại những gì đã hiểu và chỗ cần hỏi thêm.', 'study', 'medium', 25, 5, 5, 'todo', true, false, []],
    ['Thực hành CSS Grid', 'Xây dựng bố cục danh mục sản phẩm responsive.', 'study', 'medium', 40, -1, -1, 'done', true, false, []],
    ['Gửi bản nháp báo cáo nhóm', 'Bản mẫu cho bài thực hành thống kê, chưa gửi thông điệp nào.', 'work', 'high', 30, -3, -2, 'done', true, false, []],
    ['Tìm hiểu HTTP trong Node.js', 'Phân biệt request, response, phương thức và mã trạng thái.', 'study', 'medium', 45, -3, -3, 'done', true, false, []],
    ['Cập nhật danh sách sản phẩm', 'Kiểm tra nội dung minh họa và mô tả sản phẩm.', 'work', 'medium', 35, -4, -4, 'done', false, false, []],
    ['Đi bộ buổi chiều', '', 'personal', 'low', 25, -5, -5, 'done', false, false, []],
    ['Ôn tập Array và Object', 'Lọc, ánh xạ và nhóm dữ liệu task bằng JavaScript.', 'study', 'medium', 30, -6, -6, 'done', true, false, []],
    ['Tìm ý tưởng cho bài thuyết trình', 'Ghi chú ý tưởng trước, chưa cần lên lịch.', 'study', 'low', 25, null, null, 'todo', false, false, []],
  ];
  const tasks = rows.map((r, i) => {
    const [title, description, category, priority, estimateMinutes, dueOffset, planOffset, status, important, top, sub] = r;
    const plannedDate = planOffset === null ? null : addDays(today, planOffset);
    return { id: randomUUID(), title, description, category, priority, status,
      dueDate: dueOffset === null ? null : addDays(today, dueOffset), plannedDate,
      scheduledTime: i === 7 ? '09:00' : i === 9 ? '16:00' : null,
      estimateMinutes, important, topDate: top ? today : null, tags: category === 'study' ? ['ueh'] : [],
      subtasks: sub.map((title, j) => ({ id: randomUUID(), title, done: i === 0 && j === 0 })),
      repeat: i === 3 ? 'daily' : 'none', recurrenceRootId: null, nextOccurrenceId: null,
      createdAt: before(addDays(today, -7)), updatedAt: status === 'done' ? before(plannedDate) : iso,
      completedAt: status === 'done' ? before(plannedDate) : null, deletedAt: null,
    };
  });
  const focusSessions = [1, 2, 3, 4, 6].flatMap((offset, i) => {
    const day = addDays(today, -offset);
    const task = tasks[10 + (i % 6)];
    return [{ id: randomUUID(), taskId: task.id, taskTitle: task.title, plannedMinutes: 25,
      elapsedSeconds: 1500, status: 'completed', startedAt: `${day}T02:00:00.000Z`, finishedAt: `${day}T02:25:00.000Z`, anchorAt: null }];
  });
  return { schemaVersion: 2, demoData: true, tasks, settings: { ...DEFAULT_SETTINGS }, focusSessions, activeFocus: null };
}
module.exports = { seedState, DEFAULT_SETTINGS };
