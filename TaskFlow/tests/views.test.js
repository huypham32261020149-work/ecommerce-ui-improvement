'use strict';

// Template/contract tests, not a replacement for browser interaction tests.
// This harness evaluates the real render functions without starting the app.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { seedState, DEFAULT_SETTINGS } = require('../lib/seed');
const { statistics } = require('../lib/service');
const { dateKey } = require('../lib/dates');
const root = path.join(__dirname, '..');

function renderer(data = seedState(new Date('2026-11-25T03:00:00Z'))) {
  const context = vm.createContext({ Intl, Date, console, structuredClone, crypto: require('node:crypto').webcrypto });
  const icons = fs.readFileSync(path.join(root, 'public/icons.js'), 'utf8').replace('export function icon', 'function icon');
  const app = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8').replace(/^import .*;\s*/m, '').replace(/\ninit\(\);\s*$/, '\n');
  vm.runInContext(icons + '\n' + app, context);
  context.snapshot = data;
  context.stats = statistics(data, 7, new Date('2026-11-25T03:00:00Z'));
  vm.runInContext(`Object.assign(state,{tasks:snapshot.tasks,settings:snapshot.settings,today:'2026-11-25',week:'2026-11-23',storage:'JSON',focus:{active:snapshot.activeFocus,sessions:snapshot.focusSessions},stats});`, context);
  return { context, run: code => vm.runInContext(code, context) };
}

test('all seven views render complete data without invalid placeholders', () => {
  const r = renderer();
  for (const name of ['Today', 'All', 'Planner', 'Board', 'Matrix', 'Focus', 'Stats']) {
    const html = r.run(`render${name}()`);
    assert.ok(html.includes('<h1>'), name + ' needs a heading');
    assert.ok(!/\b(?:undefined|NaN)\b/.test(html), name + ' has invalid template data');
    assert.ok(!html.includes('Infinity'), name + ' divides by zero');
  }
  assert.match(r.run('renderStats()'), /Xem dữ liệu biểu đồ dạng bảng/);
  assert.match(r.run('renderBoard()'), /data-task-status=/, 'keyboard alternative to dragging');
});

test('empty data renders every view and zero-denominator statistics', () => {
  const empty = { tasks: [], settings: { ...DEFAULT_SETTINGS }, focusSessions: [], activeFocus: null };
  const r = renderer(empty);
  for (const name of ['Today', 'All', 'Planner', 'Board', 'Matrix', 'Focus', 'Stats']) {
    const html = r.run(`render${name}()`);
    assert.ok(!/\b(?:undefined|NaN|Infinity)\b/.test(html), name);
  }
  assert.match(r.run('renderToday()'), /0 trên 0 việc/);
  assert.match(r.run('renderStats()'), /summary-value">—</);
});

test('user content stays text in views and edit/help/settings dialogs', () => {
  const data = seedState(new Date('2026-11-25T03:00:00Z'));
  const payload = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
  data.tasks[0].title = payload; data.tasks[0].description = payload; data.tasks[0].tags = [payload];
  data.settings.name = payload;
  const r = renderer(data);
  for (const name of ['Today', 'All', 'Planner', 'Board', 'Matrix', 'Focus']) {
    const html = r.run(`render${name}()`);
    assert.ok(!html.includes('<img src=x'), name);
    assert.ok(!html.includes('<script>alert'), name);
  }
  r.run('globalThis.captured=""; showDialog=(html)=>{captured=html;};');
  for (const code of ['openTaskForm(state.tasks[0].id)', 'settingsDialog()', 'trashDialog()', 'helpDialog()']) {
    r.run(code);
    assert.ok(!r.context.captured.includes('<img src=x'), code);
  }
  r.run('openTaskForm(state.tasks[0].id)');
  assert.ok(r.context.captured.includes('&lt;img'), 'task text must remain visible, escaped');
});

test('focus setup survives view re-render; timer math excludes paused time', () => {
  const r = renderer();
  r.run('state.focusDraft={taskId:state.tasks[1].id,minutes:50}');
  assert.match(r.run('renderFocus()'), /value="50" required aria-label="Số phút tập trung"/);
  assert.match(r.run('renderFocus()'), / selected>/);
  const f = { plannedMinutes: 25, elapsedSeconds: 120, status: 'paused', anchorAt: null };
  r.context.focusFixture = f;
  assert.equal(r.run('focusElapsed(focusFixture)'), 120);
  f.status = 'running'; f.anchorAt = new Date(Date.now() - 90_000).toISOString();
  assert.ok(Math.abs(r.run('focusElapsed(focusFixture)') - 210) < 1);
});

test('daily budget includes completed planned time and excludes unplanned deadlines', () => {
  const data = { tasks: [], settings: { ...DEFAULT_SETTINGS, dailyCapacityMinutes: 60 }, focusSessions: [], activeFocus: null };
  const sample = seedState(new Date('2026-11-25T03:00:00Z')).tasks[0];
  data.tasks.push({ ...sample, status: 'done', completedAt: '2026-11-25T03:00:00Z', estimateMinutes: 60, topDate: null });
  const r = renderer(data);
  const html = r.run('renderToday()');
  assert.match(html, /workload-label"><strong>1 giờ<\/strong>/);
  assert.match(html, /Còn 0 phút chưa được lên kế hoạch/);
});

test('HTML shell contains unique required app targets and local module entry', () => {
  const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate HTML id');
  for (const id of ['sidebar','nav','main','breadcrumb','headerDate','addTask','menuToggle','sidebarClose','mobileBackdrop','content','dialog','dialogBody','dialogClose','toast','profileName','storageLabel','globalSearch','settingsButton','helpButton']) assert.ok(ids.includes(id), id);
  assert.match(html, /<html lang="vi"/);
  assert.match(html, /type="module" src="\.\/app\.js"/);
});
