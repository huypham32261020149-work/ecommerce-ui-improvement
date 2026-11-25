'use strict';

const { randomUUID } = require('node:crypto');
const { validDate, validTime, timeMinutes } = require('./dates');
const { DEFAULT_SETTINGS } = require('./seed');

class AppError extends Error {
  constructor(message, status = 400) { super(message); this.name = 'AppError'; this.status = status; }
}
function requireObject(value) { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AppError('Dữ liệu phải là một đối tượng JSON.'); }
function stringField(value, name, max, empty = true) {
  if (typeof value !== 'string') throw new AppError(`${name} phải là chuỗi ký tự.`);
  value = value.trim();
  if ((!empty && !value) || value.length > max) throw new AppError(`${name} ${empty ? 'không được quá' : `cần từ 1 đến`} ${max} ký tự.`);
  return value;
}
function choice(value, allowed, name) { if (!allowed.includes(value)) throw new AppError(`${name} không hợp lệ.`); return value; }
function integer(value, min, max, name) { if (!Number.isInteger(value) || value < min || value > max) throw new AppError(`${name} phải là số nguyên từ ${min} đến ${max}.`); return value; }
function nullableDate(value, name) { if (value === null || value === '') return null; if (!validDate(value)) throw new AppError(`${name} phải là ngày có thật theo định dạng YYYY-MM-DD (1900–2199).`); return value; }
function nullableTime(value) { if (value === null || value === '') return null; if (!validTime(value)) throw new AppError('Giờ bắt đầu phải theo định dạng HH:MM.'); return value; }
function boolean(value, name) { if (typeof value !== 'boolean') throw new AppError(`${name} phải là true hoặc false.`); return value; }
function identifier(value, name = 'Mã') { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) throw new AppError(`${name} không hợp lệ.`); return value; }
function timestamp(value, name, nullable = false) {
  if (value === null && nullable) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !validDate(value.slice(0, 10)) || !Number.isFinite(Date.parse(value))) throw new AppError(`${name} không hợp lệ.`);
  const time = value.slice(11, 19).split(':').map(Number);
  if (time[0] > 23 || time[1] > 59 || time[2] > 59) throw new AppError(`${name} không hợp lệ.`);
  return new Date(value).toISOString();
}

const TASK_FIELDS = ['title', 'description', 'category', 'priority', 'status', 'dueDate', 'plannedDate', 'scheduledTime', 'estimateMinutes', 'important', 'topDate', 'tags', 'subtasks', 'repeat'];
const TASK_DEFAULTS = { title: '', description: '', category: 'study', priority: 'medium', status: 'todo', dueDate: null, plannedDate: null, scheduledTime: null, estimateMinutes: 25, important: false, topDate: null, tags: [], subtasks: [], repeat: 'none' };
function taskDraft(input, previous = TASK_DEFAULTS, { imported = false } = {}) {
  requireObject(input);
  if (!imported) for (const k of Object.keys(input)) if (!TASK_FIELDS.includes(k)) throw new AppError(`Trường ${k} không được phép chỉnh sửa.`);
  const raw = { ...TASK_DEFAULTS, ...previous, ...Object.fromEntries(TASK_FIELDS.filter(k => Object.hasOwn(input, k)).map(k => [k, input[k]])) };
  const value = {
    title: stringField(raw.title, 'Tên công việc', 160, false),
    description: stringField(raw.description, 'Mô tả', 2000),
    category: choice(raw.category, ['study', 'work', 'personal'], 'Danh mục'),
    priority: choice(raw.priority, ['low', 'medium', 'high'], 'Độ ưu tiên'),
    status: choice(raw.status, ['todo', 'in_progress', 'done'], 'Trạng thái'),
    dueDate: nullableDate(raw.dueDate, 'Hạn chót'), plannedDate: nullableDate(raw.plannedDate, 'Ngày dự định'),
    scheduledTime: nullableTime(raw.scheduledTime), estimateMinutes: integer(raw.estimateMinutes, 5, 480, 'Thời lượng dự kiến'),
    important: boolean(raw.important, 'Mức độ quan trọng'), topDate: nullableDate(raw.topDate, 'Ngày Top 3'),
    repeat: choice(raw.repeat, ['none', 'daily', 'weekdays', 'weekly', 'monthly'], 'Chu kỳ lặp'),
  };
  if (value.scheduledTime && !value.plannedDate) throw new AppError('Hãy chọn ngày dự định trước khi đặt giờ bắt đầu.');
  if (value.scheduledTime && timeMinutes(value.scheduledTime) + value.estimateMinutes > 1440) throw new AppError('Khối thời gian không được kéo dài qua nửa đêm.');
  if (!Array.isArray(raw.tags) || raw.tags.length > 8) throw new AppError('Tối đa 8 nhãn cho mỗi công việc.');
  value.tags = [...new Set(raw.tags.map(x => stringField(x, 'Nhãn', 32, false)))];
  if (!Array.isArray(raw.subtasks) || raw.subtasks.length > 30) throw new AppError('Tối đa 30 công việc con.');
  const seen = new Set();
  value.subtasks = raw.subtasks.map(x => {
    requireObject(x);
    const id = x.id === undefined ? randomUUID() : identifier(x.id, 'Mã công việc con');
    if (seen.has(id)) throw new AppError('Mã công việc con bị trùng.');
    seen.add(id);
    return { id, title: stringField(x.title, 'Tên công việc con', 160, false), done: boolean(x.done ?? false, 'Trạng thái công việc con') };
  });
  return value;
}

function validateSettings(input, previous = DEFAULT_SETTINGS) {
  requireObject(input);
  for (const k of Object.keys(input)) if (!Object.hasOwn(DEFAULT_SETTINGS, k)) throw new AppError(`Thiết lập ${k} không được hỗ trợ.`);
  const r = { ...previous, ...input };
  const v = { name: stringField(r.name, 'Tên hiển thị', 60, false), dailyCapacityMinutes: integer(r.dailyCapacityMinutes, 30, 720, 'Thời lượng mỗi ngày'), dayStart: nullableTime(r.dayStart), dayEnd: nullableTime(r.dayEnd), focusMinutes: integer(r.focusMinutes, 1, 120, 'Phiên tập trung'), breakMinutes: integer(r.breakMinutes, 1, 30, 'Thời gian nghỉ') };
  if (!v.dayStart || !v.dayEnd || timeMinutes(v.dayEnd) <= timeMinutes(v.dayStart)) throw new AppError('Giờ kết thúc ngày cần sau giờ bắt đầu.');
  return v;
}

function assertTaskInvariants(tasks) {
  const tops = new Map();
  const blocks = new Map();
  const ids = new Set();
  const records = new Map(tasks.map(t => [t.id, t]));
  const resolved = new Set();
  // Imported repeat metadata must not silently disable future occurrences.
  // Keep references to soft-deleted occurrences: they still exist in backups.
  for (const task of tasks) {
    if (resolved.has(task.id)) continue;
    let current = task;
    const chain = new Set();
    while (current && !resolved.has(current.id)) {
      if (chain.has(current.id)) throw new AppError('Chuỗi công việc lặp trong bản sao bị vòng lặp.', 409);
      chain.add(current.id);
      if (current.nextOccurrenceId && !records.has(current.nextOccurrenceId)) throw new AppError('Bản sao thiếu lần lặp tiếp theo. Hãy nhập bản xuất đầy đủ của TaskFlow.', 409);
      current = current.nextOccurrenceId ? records.get(current.nextOccurrenceId) : null;
    }
    for (const id of chain) resolved.add(id);
  }
  for (const t of tasks) {
    if (ids.has(t.id)) throw new AppError('Mã công việc bị trùng.', 409);
    ids.add(t.id);
    if (t.deletedAt) continue;
    if (t.topDate) { const n = (tops.get(t.topDate) || 0) + 1; if (n > 3) throw new AppError(`Ngày ${t.topDate} đã có đủ 3 việc trọng tâm. Hãy bỏ ghim một việc trước.`, 409); tops.set(t.topDate, n); }
    if (t.plannedDate && t.scheduledTime) {
      const list = blocks.get(t.plannedDate) || [];
      const start = timeMinutes(t.scheduledTime), end = start + t.estimateMinutes;
      const conflict = list.find(x => start < x.end && end > x.start);
      if (conflict) throw new AppError(`Lịch ${t.plannedDate} bị trùng giữa “${conflict.title}” và “${t.title}”. Hãy chọn giờ khác.`, 409);
      list.push({ start, end, title: t.title }); blocks.set(t.plannedDate, list);
    }
  }
}

function importTask(raw, now) {
  requireObject(raw);
  const legacy = !Object.hasOwn(raw, 'plannedDate');
  const draft = taskDraft({ ...raw, ...(legacy ? { plannedDate: raw.dueDate ?? null } : {}) }, TASK_DEFAULTS, { imported: true });
  const iso = now.toISOString();
  const task = { ...draft,
    id: raw.id === undefined ? randomUUID() : identifier(raw.id, 'Mã công việc'),
    recurrenceRootId: raw.recurrenceRootId == null ? null : identifier(raw.recurrenceRootId),
    nextOccurrenceId: raw.nextOccurrenceId == null ? null : identifier(raw.nextOccurrenceId),
    createdAt: raw.createdAt === undefined ? iso : timestamp(raw.createdAt, 'Ngày tạo'),
    updatedAt: raw.updatedAt === undefined ? iso : timestamp(raw.updatedAt, 'Ngày cập nhật'),
    completedAt: raw.completedAt == null ? (draft.status === 'done' ? iso : null) : timestamp(raw.completedAt, 'Ngày hoàn thành'),
    deletedAt: raw.deletedAt == null ? null : timestamp(raw.deletedAt, 'Ngày xóa'),
  };
  if (draft.status !== 'done' && task.completedAt) throw new AppError('Task chưa hoàn thành không được có completedAt.');
  if (raw.recurrenceAnchorDay !== undefined) task.recurrenceAnchorDay = integer(raw.recurrenceAnchorDay, 1, 31, 'Ngày neo chu kỳ lặp');
  return task;
}

function importSession(raw) {
  requireObject(raw);
  const session = {
    id: identifier(raw.id, 'Mã phiên tập trung'), taskId: raw.taskId == null ? null : identifier(raw.taskId),
    taskTitle: stringField(raw.taskTitle, 'Tên phiên tập trung', 160, false),
    plannedMinutes: integer(raw.plannedMinutes, 1, 120, 'Thời lượng phiên'),
    elapsedSeconds: integer(raw.elapsedSeconds, 0, 7200, 'Thời gian thực tế'),
    status: choice(raw.status, ['completed', 'stopped'], 'Trạng thái phiên'),
    startedAt: timestamp(raw.startedAt, 'Giờ bắt đầu'), finishedAt: timestamp(raw.finishedAt, 'Giờ kết thúc'), anchorAt: null,
  };
  if (session.elapsedSeconds > session.plannedMinutes * 60 || Date.parse(session.finishedAt) < Date.parse(session.startedAt) || session.elapsedSeconds * 1000 > Date.parse(session.finishedAt) - Date.parse(session.startedAt) + 1000 || (session.status === 'completed' && session.elapsedSeconds < session.plannedMinutes * 60)) throw new AppError('Dữ liệu phiên tập trung không nhất quán.');
  return session;
}

module.exports = { AppError, requireObject, stringField, choice, integer, identifier, timestamp, nullableDate, taskDraft, validateSettings, assertTaskInvariants, importTask, importSession, TASK_DEFAULTS, TASK_FIELDS };
