'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createService } = require('../lib/service');
const { emptyState } = require('../lib/storage');
const { dateKey, validDate, nextDate } = require('../lib/dates');

function fixture(iso = '2026-11-25T02:00:00.000Z') {
  let state = emptyState(), now = new Date(iso);
  const storage = { kind: 'memory', read: () => structuredClone(state), transaction(fn) { const copy = structuredClone(state); const result = fn(copy); state = copy; return structuredClone(result); } };
  return { service: createService(storage, { clock: () => now }), advance: seconds => { now = new Date(now.getTime() + seconds * 1000); }, setTime: iso => { now = new Date(iso); } };
}
function create(s, changes = {}) { return s.createTask({ title: 'Công việc kiểm thử', ...changes }).task; }

test('import rejects missing and cyclic repeat links atomically', () => {
  const { service: s } = fixture();
  assert.throws(() => s.importData({ data: [{ id: 'broken', title: 'Lặp hằng ngày', repeat: 'daily', nextOccurrenceId: 'missing' }] }), /thiếu lần lặp/);
  assert.throws(() => s.importData({ data: [{ id: 'self', title: 'Lặp', repeat: 'daily', nextOccurrenceId: 'self' }] }), /vòng lặp/);
  assert.throws(() => s.importData({ data: [{ id: 'a', title: 'A', repeat: 'daily', nextOccurrenceId: 'b' }, { id: 'b', title: 'B', repeat: 'daily', nextOccurrenceId: 'a' }] }), /vòng lặp/);
  assert.equal(s.snapshot().tasks.length, 0);
});

test('Vietnam midnight and real calendar dates are exact', () => {
  assert.equal(dateKey('2026-11-24T16:59:59Z'), '2026-11-24');
  assert.equal(dateKey('2026-11-24T17:00:00Z'), '2026-11-25');
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2028-02-29'), true);
  assert.equal(validDate('2026-04-31'), false);
});

test('monthly recurrence keeps original day across February; weekdays and future dates', () => {
  assert.equal(nextDate('2026-01-31', 'monthly', '2026-01-31', 31), '2026-02-28');
  assert.equal(nextDate('2026-02-28', 'monthly', '2026-02-28', 31), '2026-03-31');
  assert.equal(nextDate('2026-11-27', 'weekdays', '2026-11-27'), '2026-11-30');
  assert.equal(nextDate('2026-12-01', 'daily', '2026-11-25'), '2026-12-02');
  assert.equal(nextDate('2026-11-01', 'daily', '2026-11-25'), '2026-11-26');
});

test('repeat completion creates one successor and preserves relative planned date', () => {
  const { service: s } = fixture('2026-01-31T02:00:00Z');
  const t = create(s, { dueDate: '2026-01-31', plannedDate: '2026-01-30', repeat: 'monthly', subtasks: [{ title: 'Một bước', done: true }] });
  const first = s.updateTask(t.id, { status: 'done' });
  assert.equal(first.generatedTask.dueDate, '2026-02-28');
  assert.equal(first.generatedTask.plannedDate, '2026-02-27');
  assert.equal(first.generatedTask.subtasks[0].done, false);
  s.updateTask(t.id, { status: 'todo' });
  assert.equal(s.snapshot().tasks.find(x => x.id === t.id).completedAt, null);
  s.updateTask(t.id, { status: 'done' });
  assert.equal(s.snapshot().tasks.length, 2);
  const second = s.updateTask(first.generatedTask.id, { status: 'done' });
  assert.equal(second.generatedTask.dueDate, '2026-03-31');
  assert.equal(second.generatedTask.recurrenceAnchorDay, 31);
});

test('Top3 limit counts completed tasks and restore is atomic', () => {
  const { service: s } = fixture();
  const first = create(s, { topDate: '2026-11-25' });
  create(s, { topDate: '2026-11-25', status: 'done' });
  create(s, { topDate: '2026-11-25' });
  assert.throws(() => create(s, { topDate: '2026-11-25' }), /3 việc/);
  s.deleteTask(first.id);
  create(s, { topDate: '2026-11-25' });
  assert.throws(() => s.restoreTask(first.id), /3 việc/);
  assert.ok(s.snapshot().tasks.find(x => x.id === first.id).deletedAt);
});

test('overlapping blocks reject updates and adjacent blocks work', () => {
  const { service: s } = fixture();
  create(s, { title: 'A', plannedDate: '2026-11-26', scheduledTime: '09:00', estimateMinutes: 30 });
  const b = create(s, { title: 'B', plannedDate: '2026-11-26', scheduledTime: '09:30', estimateMinutes: 30 });
  assert.throws(() => s.updateTask(b.id, { scheduledTime: '09:15' }), /trùng/);
  assert.equal(s.snapshot().tasks.find(x => x.id === b.id).scheduledTime, '09:30');
  assert.throws(() => create(s, { plannedDate: '2026-11-26', scheduledTime: '23:50', estimateMinutes: 20 }), /nửa đêm/);
});

test('suggestions respect capacity, existing blocks and planned untimed cost', () => {
  const { service: s } = fixture();
  s.updateSettings({ dailyCapacityMinutes: 60, dayStart: '08:00', dayEnd: '10:00' });
  create(s, { plannedDate: '2026-11-26', scheduledTime: '08:00', estimateMinutes: 30 });
  const own = create(s, { plannedDate: '2026-11-26', estimateMinutes: 30 });
  const extra = create(s, { estimateMinutes: 30, priority: 'high' });
  const suggestion = s.getSuggestions('2026-11-26');
  assert.equal(suggestion.committedMinutes, 60);
  assert.equal(suggestion.remainingMinutes, 0);
  assert.equal(suggestion.items.length, 1);
  assert.equal(suggestion.items[0].taskId, own.id);
  assert.equal(suggestion.items[0].scheduledTime, '08:30');
  assert.ok(!suggestion.items.some(x => x.taskId === extra.id));
  assert.equal(s.getSuggestions('2026-11-24').items.length, 0);
});

test('suggestion apply rechecks current data and never partially writes', () => {
  const { service: s } = fixture();
  s.updateSettings({ dailyCapacityMinutes: 60 });
  const a = create(s, { estimateMinutes: 30 }), b = create(s, { estimateMinutes: 30 });
  const plan = s.getSuggestions('2026-11-26');
  assert.equal(plan.items.length, 2);
  create(s, { plannedDate: '2026-11-26', estimateMinutes: 60 });
  assert.throws(() => s.applySuggestions({ date: '2026-11-26', taskIds: [a.id, b.id], token: plan.token }), /Gợi ý đã thay đổi/);
  assert.equal(s.snapshot().tasks.find(t => t.id === a.id).plannedDate, null);
  assert.equal(s.snapshot().tasks.find(t => t.id === b.id).plannedDate, null);
});

test('today suggestions never place a block in elapsed time', () => {
  const { service: s } = fixture('2026-11-25T03:02:00Z');
  create(s, { estimateMinutes: 30 });
  assert.equal(s.getSuggestions('2026-11-25').items[0].scheduledTime, '10:05');
});

test('Quick Add parses explicit Vietnamese rules without writing', () => {
  const { service: s } = fixture();
  const p = s.quickAdd({ text: 'Ôn DOM ngày mai !1 #học #javascript 1h @09:30 lặp:hàng-tuần' });
  assert.equal(p.task.title, 'Ôn DOM');
  assert.equal(p.task.dueDate, '2026-11-26');
  assert.equal(p.task.plannedDate, '2026-11-26');
  assert.equal(p.task.priority, 'high');
  assert.equal(p.task.category, 'study');
  assert.deepEqual(p.task.tags, ['javascript']);
  assert.equal(p.task.estimateMinutes, 60);
  assert.equal(p.task.scheduledTime, '09:30');
  assert.equal(p.task.repeat, 'weekly');
  assert.equal(s.snapshot().tasks.length, 0);
  assert.ok(s.quickAdd({ text: 'Test 2026-02-31' }).warnings.length);
});

test('focus pause excludes paused time, completion caps time, finish is idempotent', () => {
  const f = fixture(), s = f.service;
  const t = create(s);
  const active = s.startFocus({ taskId: t.id, minutes: 1 }).active;
  assert.throws(() => s.startFocus({ minutes: 1 }), /đang hoạt động/);
  f.advance(20); s.focusAction(active.id, 'pause'); f.advance(100);
  assert.equal(s.snapshot().focus.active.elapsedSeconds, 20);
  s.focusAction(active.id, 'resume'); f.advance(50);
  const done = s.focusAction(active.id, 'finish').session;
  assert.equal(done.elapsedSeconds, 60);
  assert.equal(done.status, 'completed');
  assert.equal(done.finishedAt, '2026-11-25T02:02:40.000Z');
  assert.equal(s.snapshot().tasks[0].status, 'todo');
  assert.deepEqual(s.focusAction(active.id, 'finish').session, done);
  assert.equal(s.snapshot().focus.sessions.length, 1);
});

test('early focus completion records only elapsed seconds and survives task deletion', () => {
  const f = fixture(), s = f.service;
  const t = create(s);
  const active = s.startFocus({ taskId: t.id, minutes: 25 }).active;
  f.advance(75); s.deleteTask(t.id);
  const session = s.focusAction(active.id, 'finish').session;
  assert.equal(session.elapsedSeconds, 75);
  assert.equal(session.status, 'stopped');
  assert.equal(session.taskTitle, t.title);
  assert.equal(s.getStats(7).focusMinutes, 1.3);
  assert.equal(s.getStats(7).total, 0);
});

test('statistics use completed date, due-based denominator and chosen period', () => {
  const f = fixture(), s = f.service;
  const late = create(s, { dueDate: '2026-11-24' });
  const ontime = create(s, { dueDate: '2026-11-25' });
  s.updateTask(late.id, { status: 'done' }); s.updateTask(ontime.id, { status: 'done' });
  create(s, { status: 'done' });
  const stats = s.getStats(7);
  assert.equal(stats.onTimeEligible, 2);
  assert.equal(stats.onTimeRate, 50);
  assert.equal(stats.series.at(-1).completed, 3);
  assert.equal(stats.series.at(-2).completed, 0);
  assert.equal(stats.completionRate, 100);
});

test('import V1 keeps IDs/dates, merges duplicates, and atomically rejects bad data', () => {
  const { service: s } = fixture();
  const raw = { id: 'legacy-1', title: 'Cũ', dueDate: '2026-11-26', createdAt: '2026-11-20T00:00:00.000Z', status: 'todo' };
  assert.equal(s.importData({ data: [raw] }).importedCount, 1);
  assert.equal(s.snapshot().tasks[0].plannedDate, '2026-11-26');
  assert.equal(s.importData({ data: [raw] }).skippedCount, 1);
  assert.throws(() => s.importData({ data: [{ title: 'Hợp lệ' }, { title: 'Không hợp lệ', dueDate: '2026-02-31' }] }), /ngày có thật/);
  assert.equal(s.snapshot().tasks.length, 1);
  assert.throws(() => s.importData({ data: { schemaVersion: 999, tasks: [] } }), /Phiên bản/);
});

test('import and restore validate time conflicts; recurring anchor survives export', () => {
  const { service: s } = fixture();
  const t = create(s, { plannedDate: '2026-11-26', scheduledTime: '09:00', estimateMinutes: 30 });
  const count = s.snapshot().tasks.length;
  assert.throws(() => s.importData({ data: [{ title: 'Trùng lịch', plannedDate: '2026-11-26', scheduledTime: '09:15', estimateMinutes: 30 }] }), /trùng/);
  assert.equal(s.snapshot().tasks.length, count);
  s.deleteTask(t.id);
  create(s, { plannedDate: '2026-11-26', scheduledTime: '09:00', estimateMinutes: 30 });
  assert.throws(() => s.restoreTask(t.id), /trùng/);
  const r = create(s, { dueDate: '2026-12-31', repeat: 'monthly' });
  s.updateTask(r.id, { status: 'done' });
  const backup = s.exportData();
  const target = fixture().service;
  target.importData({ data: backup });
  assert.equal(target.snapshot().tasks.find(x => x.recurrenceRootId === r.id).recurrenceAnchorDay, 31);
  assert.equal(target.snapshot().settings.name, 'Huy');
});

test('server-owned task fields and invalid settings are rejected without changes', () => {
  const { service: s } = fixture();
  const t = create(s);
  assert.throws(() => s.updateTask(t.id, { completedAt: '2020-01-01T00:00:00Z' }), /không được phép/);
  assert.throws(() => s.updateSettings({ name: 'New', dayStart: '18:00', dayEnd: '08:00' }), /kết thúc ngày/);
  assert.equal(s.snapshot().settings.name, 'Huy');
  assert.throws(() => create(s, { important: 'false' }), /true hoặc false/);
});

test('same candidate moved by a new block requires a fresh preview token', () => {
  const { service: s } = fixture();
  const t = create(s, { estimateMinutes: 30 });
  const prior = s.getSuggestions('2026-11-26');
  assert.equal(prior.items[0].scheduledTime, '08:00');
  create(s, { plannedDate: '2026-11-26', scheduledTime: '08:00', estimateMinutes: 30 });
  const current = s.getSuggestions('2026-11-26');
  assert.equal(current.items[0].taskId, t.id);
  assert.equal(current.items[0].scheduledTime, '08:30');
  assert.throws(() => s.applySuggestions({ date: prior.date, taskIds: [t.id], token: prior.token }), /Gợi ý đã thay đổi/);
  assert.equal(s.applySuggestions({ date: current.date, taskIds: [t.id], token: current.token }).appliedCount, 1);
  assert.equal(s.snapshot().tasks.find(x => x.id === t.id).scheduledTime, '08:30');
});

test('expired focus preserves natural finish date through pause and delayed finish', () => {
  const f = fixture('2026-11-24T16:59:30Z'), s = f.service;
  const active = s.startFocus({ minutes: 1 }).active;
  f.advance(90); s.focusAction(active.id, 'pause');
  f.advance(86400);
  const session = s.focusAction(active.id, 'finish').session;
  assert.equal(session.finishedAt, '2026-11-24T17:00:30.000Z');
  assert.equal(s.getStats(7).series.find(x => x.date === '2026-11-25').focusMinutes, 1);
  assert.equal(s.getStats(7).series.find(x => x.date === '2026-11-26').focusMinutes, 0);
});

test('editing monthly date intentionally resets anchor for following occurrence', () => {
  const { service: s } = fixture('2026-01-31T02:00:00Z');
  const t = create(s, { dueDate: '2026-01-31', repeat: 'monthly' });
  const child = s.updateTask(t.id, { status: 'done' }).generatedTask;
  s.updateTask(child.id, { dueDate: '2026-02-15' });
  assert.equal(s.updateTask(child.id, { status: 'done' }).generatedTask.dueDate, '2026-03-15');
});

test('recurrence cannot create an out-of-range planned date', () => {
  const { service: s } = fixture('2199-12-20T02:00:00Z');
  const t = create(s, { dueDate: '2199-12-30', plannedDate: '2199-12-31', repeat: 'daily' });
  assert.throws(() => s.updateTask(t.id, { status: 'done' }), /ngày có thật/);
  assert.equal(s.snapshot().tasks[0].status, 'todo');
  assert.equal(s.snapshot().tasks.length, 1);
});

test('demo origin survives exported backup merge without marking legacy data as demo', () => {
  const { service: s } = fixture();
  assert.equal(s.snapshot().demoData, false);
  s.importData({ data: [{ title: 'Task cá nhân cũ' }] });
  assert.equal(s.snapshot().demoData, false);
  s.importData({ data: { schemaVersion: 2, demoData: true, tasks: [{ title: 'Ví dụ minh họa' }] } });
  assert.equal(s.snapshot().demoData, true);
  const backup = s.exportData();
  assert.equal(backup.demoData, true);
  const target = fixture().service;
  target.importData({ data: backup });
  assert.equal(target.snapshot().demoData, true);
  target.importData({ data: [{ title: 'Thêm task cá nhân' }] });
  assert.equal(target.snapshot().demoData, true);
});
