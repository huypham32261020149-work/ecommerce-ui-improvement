'use strict';

const { createHash } = require('node:crypto');
const { dateKey, addDays, timeMinutes, minuteTime, localMinute, validDate } = require('./dates');
const { AppError } = require('./validation');

function suggestions(state, date, now = new Date()) {
  if (!validDate(date)) throw new AppError('Ngày lập kế hoạch không hợp lệ.');
  const today = dateKey(now);
  const active = state.tasks.filter(t => !t.deletedAt);
  const committed = active.filter(t => t.plannedDate === date);
  const committedMinutes = committed.reduce((sum, t) => sum + t.estimateMinutes, 0);
  const capacityMinutes = state.settings.dailyCapacityMinutes;
  let remaining = Math.max(0, capacityMinutes - committedMinutes);
  const occupied = committed.filter(t => t.scheduledTime).map(t => ({ start: timeMinutes(t.scheduledTime), end: timeMinutes(t.scheduledTime) + t.estimateMinutes }));
  const start = Math.max(timeMinutes(state.settings.dayStart), date === today ? Math.ceil((localMinute(now) + 1) / 5) * 5 : 0);
  const end = timeMinutes(state.settings.dayEnd);
  const candidates = active.filter(t => t.status !== 'done' && (!t.plannedDate || t.plannedDate === date) && !t.scheduledTime).map(t => {
    let score = { high: 100, medium: 50, low: 10 }[t.priority];
    const reasons = [];
    if (t.dueDate && t.dueDate < date) { score += 150; reasons.push('đã quá hạn'); }
    else if (t.dueDate === date) { score += 100; reasons.push('đến hạn trong ngày đã chọn'); }
    else if (t.dueDate && t.dueDate <= addDays(date, 1)) { score += 60; reasons.push('sắp đến hạn'); }
    if (t.important) { score += 60; reasons.push('quan trọng'); }
    if (t.topDate === date) { score += 100; reasons.push('đã chọn Top 3'); }
    if (t.priority === 'high') reasons.push('ưu tiên cao');
    if (t.plannedDate === date) { score += 20; reasons.push('đã dự định trong ngày'); }
    if (!reasons.length) reasons.push('còn chỗ trong lịch');
    return { task: t, score, reason: reasons.join(' · ') };
  }).sort((a, b) => b.score - a.score || (a.task.dueDate || '9999').localeCompare(b.task.dueDate || '9999') || a.task.createdAt.localeCompare(b.task.createdAt));
  const items = [];
  if (date >= today) for (const c of candidates) {
    const t = c.task;
    const cost = t.plannedDate === date ? 0 : t.estimateMinutes;
    if (cost > remaining) continue;
    let slot = null;
    for (let minute = start; minute + t.estimateMinutes <= end; minute += 5) {
      if (!occupied.some(b => minute < b.end && minute + t.estimateMinutes > b.start)) { slot = minute; break; }
    }
    if (slot === null) continue;
    items.push({ taskId: t.id, reason: c.reason, score: c.score, scheduledTime: minuteTime(slot), estimateMinutes: t.estimateMinutes });
    occupied.push({ start: slot, end: slot + t.estimateMinutes });
    remaining -= cost;
  }
  const result = { date, capacityMinutes, committedMinutes, remainingMinutes: Math.max(0, capacityMinutes - committedMinutes), overloaded: committedMinutes > capacityMinutes, items, unscheduledCount: candidates.length - items.length };
  result.token = createHash('sha256').update(JSON.stringify(result)).digest('hex');
  return result;
}

function quickAdd(text, now = new Date()) {
  if (typeof text !== 'string' || !text.trim() || text.length > 500) throw new AppError('Nhập một dòng công việc từ 1 đến 500 ký tự.');
  let title = text.trim();
  const task = {};
  const tokens = [], warnings = [];
  const consume = (pattern, handler) => { title = title.replace(pattern, (match, ...args) => { const accepted = handler(match, ...args); if (accepted === false) return match; tokens.push(match.trim()); return ' '; }); };
  let dateSeen = false;
  consume(/(?:hôm nay|today|ngày mai|tomorrow|\d{4}-\d{2}-\d{2})/giu, match => {
    const lower = match.toLowerCase();
    const date = ['hôm nay', 'today'].includes(lower) ? dateKey(now) : ['ngày mai', 'tomorrow'].includes(lower) ? addDays(dateKey(now), 1) : match;
    if (!validDate(date)) { warnings.push(`Không nhận diện ngày “${match}”.`); return false; }
    if (dateSeen) warnings.push('Có nhiều ngày: sử dụng ngày xuất hiện cuối cùng.');
    task.dueDate = date; task.plannedDate = date; dateSeen = true;
  });
  consume(/(?:^|\s)!([123])(?=\s|$)/g, (_m, p) => { task.priority = { 1: 'high', 2: 'medium', 3: 'low' }[p]; });
  consume(/(?:^|\s)#([^\s#]+)/gu, (_m, tag) => {
    const key = tag.toLocaleLowerCase('vi');
    const cats = { học: 'study', hoc: 'study', study: 'study', work: 'work', 'công-việc': 'work', 'ca-nhan': 'personal', 'cá-nhân': 'personal', personal: 'personal' };
    if (cats[key]) task.category = cats[key]; else (task.tags ||= []).push(tag);
  });
  consume(/(?:^|\s)(\d+)(p|m|h)(?=\s|$)/gi, (_m, n, unit) => {
    const minutes = Number(n) * (unit.toLowerCase() === 'h' ? 60 : 1);
    if (minutes < 5 || minutes > 480) { warnings.push('Thời lượng cần trong khoảng 5–480 phút.'); return false; }
    task.estimateMinutes = minutes;
  });
  consume(/(?:^|\s)@(\d{2}:\d{2})(?=\s|$)/g, (_m, time) => {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) { warnings.push('Giờ bắt đầu không hợp lệ.'); return false; }
    task.scheduledTime = time;
  });
  consume(/(?:^|\s)lặp:(hàng-ngày|hàng-tuần)(?=\s|$)/giu, (_m, repeat) => { task.repeat = repeat.toLowerCase() === 'hàng-ngày' ? 'daily' : 'weekly'; });
  if (task.scheduledTime && !task.plannedDate) { task.plannedDate = dateKey(now); warnings.push('Chưa có ngày: giờ bắt đầu được gán cho hôm nay.'); }
  task.title = title.replace(/\s+/g, ' ').trim();
  if (!task.title) warnings.push('Bạn cần bổ sung tên công việc trước khi lưu.');
  if (task.tags?.length > 8) warnings.push('Chỉ lưu được tối đa 8 nhãn.');
  return { task, tokens, warnings };
}

module.exports = { suggestions, quickAdd };
