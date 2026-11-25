'use strict';

const { randomUUID } = require('node:crypto');
const { dateKey, addDays, daysBetween, nextDate, validDate } = require('./dates');
const { AppError, requireObject, integer, taskDraft, validateSettings, assertTaskInvariants, importTask, importSession, TASK_FIELDS } = require('./validation');
const { suggestions, quickAdd } = require('./planning');

function elapsedFocus(active, now) {
  const ticking = active.status === 'running' && active.anchorAt ? Math.max(0, Math.floor((now.getTime() - Date.parse(active.anchorAt)) / 1000)) : 0;
  return Math.min(active.plannedMinutes * 60, active.elapsedSeconds + ticking);
}
function makeSuccessor(task, now) {
  const today = dateKey(now);
  const base = task.dueDate || task.plannedDate || today;
  const anchorDay = task.recurrenceAnchorDay || Number(base.slice(-2));
  const next = nextDate(base, task.repeat, today, anchorDay);
  if (!validDate(next)) throw new AppError('Ngày lặp tiếp theo vượt phạm vi được hỗ trợ.');
  const shift = daysBetween(base, next);
  const iso = now.toISOString();
  const draft = Object.fromEntries(TASK_FIELDS.map(k => [k, structuredClone(task[k])]));
  const successor = { ...draft, id: randomUUID(), status: 'todo', dueDate: task.dueDate ? addDays(task.dueDate, shift) : null,
    plannedDate: task.plannedDate ? addDays(task.plannedDate, shift) : (!task.dueDate ? next : null),
    scheduledTime: null, topDate: null, subtasks: task.subtasks.map(s => ({ ...s, id: randomUUID(), done: false })),
    recurrenceRootId: task.recurrenceRootId || task.id, nextOccurrenceId: null, recurrenceAnchorDay: anchorDay,
    createdAt: iso, updatedAt: iso, completedAt: null, deletedAt: null };
  taskDraft(successor, undefined, { imported: true });
  return successor;
}
function findTask(state, id, includeDeleted = false) {
  const task = state.tasks.find(t => t.id === id && (includeDeleted || !t.deletedAt));
  if (!task) throw new AppError('Không tìm thấy công việc.', 404);
  return task;
}

function statistics(state, days, now) {
  if (![7, 30].includes(days)) throw new AppError('Chỉ hỗ trợ thống kê 7 hoặc 30 ngày.');
  const today = dateKey(now);
  const tasks = state.tasks.filter(t => !t.deletedAt);
  const done = tasks.filter(t => t.status === 'done');
  const eligible = done.filter(t => t.dueDate && t.completedAt);
  const onTime = eligible.filter(t => dateKey(t.completedAt) <= t.dueDate);
  const series = Array.from({ length: days }, (_, i) => ({ date: addDays(today, i - days + 1), completed: 0, focusMinutes: 0, planned: 0 }));
  const byDate = new Map(series.map(x => [x.date, x]));
  for (const t of tasks) {
    if (byDate.has(t.plannedDate)) byDate.get(t.plannedDate).planned++;
    if (t.status === 'done' && t.completedAt && byDate.has(dateKey(t.completedAt))) byDate.get(dateKey(t.completedAt)).completed++;
  }
  let focusSeconds = 0, focusSessions = 0;
  for (const s of state.focusSessions) {
    const key = dateKey(s.finishedAt);
    if (s.elapsedSeconds > 0 && byDate.has(key)) {
      focusSeconds += s.elapsedSeconds; focusSessions++;
      byDate.get(key).focusMinutes += s.elapsedSeconds / 60;
    }
  }
  series.forEach(x => { x.focusMinutes = Math.round(x.focusMinutes * 10) / 10; });
  const categories = Object.entries({ study: 'Học tập', work: 'Công việc', personal: 'Cá nhân' }).map(([key, label]) => ({ key, label, total: tasks.filter(t => t.category === key).length, completed: done.filter(t => t.category === key).length }));
  const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today).length;
  const completedPeriod = series.reduce((s, x) => s + x.completed, 0);
  const best = [...series].sort((a, b) => b.completed - a.completed || b.date.localeCompare(a.date))[0];
  const insights = [completedPeriod ? `Bạn hoàn thành ${completedPeriod} công việc trong ${days} ngày gần đây.` : `Chưa có công việc hoàn thành trong ${days} ngày gần đây. Một việc nhỏ là điểm bắt đầu tốt.`,
    overdue ? `${overdue} công việc đang quá hạn. Hãy kiểm tra lại mức ưu tiên và ngày dự định.` : 'Không có công việc quá hạn tại thời điểm này.',
    focusSeconds ? `Bạn đã ghi nhận ${Math.round(focusSeconds / 60)} phút tập trung thực tế qua ${focusSessions} phiên.` : 'Bắt đầu một phiên tập trung để theo dõi thời gian bạn thực sự dành cho công việc.'];
  if (best.completed) insights.push(`Ngày ${best.date} có ${best.completed} việc hoàn thành, cao nhất trong khoảng đã chọn.`);
  return { days, today, total: tasks.length, completed: done.length, pending: tasks.length - done.length, overdue,
    completionRate: tasks.length ? Math.round(done.length / tasks.length * 100) : 0,
    onTimeRate: eligible.length ? Math.round(onTime.length / eligible.length * 100) : null, onTimeEligible: eligible.length, onTimeCompleted: onTime.length,
    focusMinutes: Math.round(focusSeconds / 6) / 10, focusSessions, series, categories, insights };
}

function createService(storage, options = {}) {
  const clock = options.clock || (() => new Date());
  const snapshot = () => {
    const s = storage.read(), now = clock();
    return { version: '2.5.0', today: dateKey(now), now: now.toISOString(), storage: storage.kind, demoData: s.demoData === true, tasks: s.tasks, settings: s.settings, focus: { active: s.activeFocus, sessions: s.focusSessions } };
  };
  function createTask(body) {
    const draft = taskDraft(body), now = clock(), iso = now.toISOString();
    return storage.transaction(s => {
      const task = { ...draft, id: randomUUID(), recurrenceRootId: null, nextOccurrenceId: null, createdAt: iso, updatedAt: iso, completedAt: draft.status === 'done' ? iso : null, deletedAt: null };
      s.tasks.push(task);
      let generatedTask;
      if (task.status === 'done' && task.repeat !== 'none') { generatedTask = makeSuccessor(task, now); task.nextOccurrenceId = generatedTask.id; s.tasks.push(generatedTask); }
      assertTaskInvariants(s.tasks);
      return { task, ...(generatedTask ? { generatedTask } : {}) };
    });
  }
  function updateTask(id, body) {
    requireObject(body);
    const now = clock(), iso = now.toISOString();
    return storage.transaction(s => {
      const task = findTask(s, id);
      const prior = task.status;
      const priorBaseDate = task.dueDate || task.plannedDate;
      const draft = taskDraft(body, task);
      Object.assign(task, draft, { updatedAt: iso });
      const newBaseDate = task.dueDate || task.plannedDate;
      if (newBaseDate && newBaseDate !== priorBaseDate) task.recurrenceAnchorDay = Number(newBaseDate.slice(-2));
      if (draft.status !== 'done') task.completedAt = null;
      else if (prior !== 'done') task.completedAt = iso;
      let generatedTask;
      if (prior !== 'done' && task.status === 'done' && task.repeat !== 'none' && !task.nextOccurrenceId) {
        generatedTask = makeSuccessor(task, now); task.nextOccurrenceId = generatedTask.id; s.tasks.push(generatedTask);
      }
      assertTaskInvariants(s.tasks);
      return { task, ...(generatedTask ? { generatedTask } : {}) };
    });
  }
  function deleteTask(id) {
    return storage.transaction(s => { const task = findTask(s, id); task.deletedAt = clock().toISOString(); task.updatedAt = task.deletedAt; return { task }; });
  }
  function restoreTask(id) {
    return storage.transaction(s => { const task = findTask(s, id, true); task.deletedAt = null; task.updatedAt = clock().toISOString(); assertTaskInvariants(s.tasks); return { task }; });
  }
  function updateSettings(body) { return storage.transaction(s => { s.settings = validateSettings(body, s.settings); return { settings: s.settings }; }); }
  function getSuggestions(date) { return suggestions(storage.read(), date || dateKey(clock()), clock()); }
  function applySuggestions(body) {
    requireObject(body);
    if (!validDate(body.date) || !Array.isArray(body.taskIds) || !body.taskIds.length || body.taskIds.length > 200 || new Set(body.taskIds).size !== body.taskIds.length || body.taskIds.some(x => typeof x !== 'string') || typeof body.token !== 'string') throw new AppError('Chọn ngày, công việc và tải bản gợi ý mới nhất để áp dụng.');
    return storage.transaction(s => {
      const plan = suggestions(s, body.date, clock());
      if (body.token !== plan.token) throw new AppError('Gợi ý đã thay đổi. Hãy tải lại để xem đúng khung giờ trước khi áp dụng.', 409);
      const picked = body.taskIds.map(id => plan.items.find(item => item.taskId === id));
      if (picked.some(x => !x)) throw new AppError('Gợi ý đã thay đổi hoặc không còn đủ thời gian. Hãy tải lại gợi ý trước khi áp dụng.', 409);
      const tasks = picked.map(item => {
        const task = findTask(s, item.taskId);
        Object.assign(task, { plannedDate: body.date, scheduledTime: item.scheduledTime, updatedAt: clock().toISOString() });
        return task;
      });
      assertTaskInvariants(s.tasks);
      return { tasks, appliedCount: tasks.length };
    });
  }
  function startFocus(body) {
    requireObject(body);
    return storage.transaction(s => {
      if (s.activeFocus) throw new AppError('Một phiên tập trung đang hoạt động. Hãy kết thúc hoặc hủy phiên đó trước.', 409);
      const minutes = integer(body.minutes ?? s.settings.focusMinutes, 1, 120, 'Thời lượng tập trung');
      const task = body.taskId == null ? null : findTask(s, body.taskId);
      if (task?.status === 'done') throw new AppError('Công việc đã hoàn thành. Hãy mở lại trước khi tập trung.', 409);
      const now = clock().toISOString();
      s.activeFocus = { id: randomUUID(), taskId: task?.id || null, taskTitle: task?.title || 'Tập trung tự do', plannedMinutes: minutes, elapsedSeconds: 0, status: 'running', startedAt: now, finishedAt: null, anchorAt: now };
      return { active: s.activeFocus };
    });
  }
  function focusAction(id, action) {
    return storage.transaction(s => {
      if (action === 'finish') { const old = s.focusSessions.find(x => x.id === id); if (old) return { session: old }; }
      const f = s.activeFocus;
      if (!f || f.id !== id) throw new AppError('Phiên tập trung không còn hoạt động. Hãy tải lại trạng thái.', 404);
      const now = clock();
      if (action === 'pause') {
        if (f.status === 'running') {
          const elapsed = elapsedFocus(f, now);
          if (elapsed >= f.plannedMinutes * 60) f.reachedAt = new Date(Date.parse(f.anchorAt) + (f.plannedMinutes * 60 - f.elapsedSeconds) * 1000).toISOString();
          f.elapsedSeconds = elapsed; f.anchorAt = null; f.status = 'paused';
        }
        return { active: f };
      }
      if (action === 'resume') {
        if (f.status === 'paused') { f.status = 'running'; f.anchorAt = now.toISOString(); }
        return { active: f };
      }
      if (action === 'cancel') { s.activeFocus = null; return { cancelled: true }; }
      if (action !== 'finish') throw new AppError('Thao tác tập trung không hợp lệ.');
      const elapsedSeconds = elapsedFocus(f, now);
      const completed = elapsedSeconds >= f.plannedMinutes * 60;
      const finishedAt = completed && f.reachedAt ? f.reachedAt : completed && f.status === 'running' && f.anchorAt ? new Date(Math.min(now.getTime(), Date.parse(f.anchorAt) + (f.plannedMinutes * 60 - f.elapsedSeconds) * 1000)).toISOString() : now.toISOString();
      const session = { ...f, elapsedSeconds, status: completed ? 'completed' : 'stopped', finishedAt, anchorAt: null };
      delete session.reachedAt;
      s.focusSessions.push(session); s.activeFocus = null;
      return { session };
    });
  }
  function exportData() {
    const s = storage.read();
    return { schemaVersion: 2, version: '2.5.0', demoData: s.demoData === true, exportedAt: clock().toISOString(), tasks: s.tasks, settings: s.settings, focusSessions: s.focusSessions };
  }
  function importData(body) {
    requireObject(body);
    const raw = Array.isArray(body.data) ? { tasks: body.data } : body.data;
    requireObject(raw);
    if (raw.schemaVersion !== undefined && raw.schemaVersion !== 2) throw new AppError('Phiên bản bản sao lưu chưa được hỗ trợ.');
    if (raw.demoData !== undefined && typeof raw.demoData !== 'boolean') throw new AppError('Cờ nguồn dữ liệu mẫu phải là true hoặc false.');
    if (!Array.isArray(raw.tasks) || raw.tasks.length > 10000 || (raw.focusSessions !== undefined && (!Array.isArray(raw.focusSessions) || raw.focusSessions.length > 10000))) throw new AppError('Bản sao lưu phải có mảng tasks, tối đa 10.000 mục mỗi loại.');
    const now = clock();
    const incoming = raw.tasks.map(x => importTask(x, now));
    const sessions = (raw.focusSessions || []).map(importSession);
    return storage.transaction(s => {
      if (s.activeFocus && sessions.some(x => x.id === s.activeFocus.id)) throw new AppError('Bản sao lưu có mã trùng với phiên tập trung đang chạy. Hãy kết thúc phiên rồi nhập lại.', 409);
      const taskIds = new Set(s.tasks.map(t => t.id)), sessionIds = new Set(s.focusSessions.map(f => f.id));
      let importedCount = 0, skippedCount = 0, importedSessions = 0;
      for (const task of incoming) {
        if (taskIds.has(task.id)) skippedCount++; else { taskIds.add(task.id); s.tasks.push(task); importedCount++; }
      }
      for (const session of sessions) if (!sessionIds.has(session.id)) { sessionIds.add(session.id); s.focusSessions.push(session); importedSessions++; }
      assertTaskInvariants(s.tasks);
      s.demoData = s.demoData === true || raw.demoData === true;
      return { importedCount, skippedCount, importedSessions };
    });
  }
  return { snapshot, createTask, updateTask, deleteTask, restoreTask, updateSettings, getSuggestions, applySuggestions, startFocus, focusAction, exportData, importData,
    getStats: days => statistics(storage.read(), days ?? 7, clock()), quickAdd: body => { requireObject(body); return quickAdd(body.text, clock()); } };
}

module.exports = { createService, statistics, elapsedFocus, makeSuccessor };
