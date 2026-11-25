'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createServer } = require('../server');
const tempRoot = process.env.TASKFLOW_TEST_TMP || path.join(__dirname, '.tmp');
fs.mkdirSync(tempRoot, { recursive: true });

async function start(mode, dataDir, options = {}) {
  const app = createServer({ mode, dataDir, seed: false, ...options });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${app.server.address().port}`;
  const call = async (route, method = 'GET', data) => {
    const response = await fetch(origin + route, { method, headers: data === undefined ? {} : { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) });
    return { status: response.status, body: await response.json() };
  };
  return { ...app, origin, call, close: () => new Promise(resolve => app.server.close(resolve)) };
}

for (const mode of ['json', 'sqlite']) {
  test(`${mode}: real HTTP CRUD, focus, soft delete and durable restart`, async () => {
    const dir = fs.mkdtempSync(path.join(tempRoot, 'taskflow-test-'));
    let app;
    try {
      app = await start(mode, dir);
      assert.equal((await app.call('/api/health')).body.storage, mode === 'json' ? 'JSON' : 'SQLite');
      const created = await app.call('/api/tasks', 'POST', { title: 'API task', subtasks: [{ title: 'Step' }] });
      assert.equal(created.status, 201);
      const id = created.body.task.id;
      assert.equal((await app.call(`/api/tasks/${id}`, 'PATCH', { status: 'in_progress' })).body.task.status, 'in_progress');
      const active = await app.call('/api/focus/start', 'POST', { taskId: id, minutes: 1 });
      assert.equal(active.status, 201);
      await app.close(); app = await start(mode, dir);
      const state = (await app.call('/api/state')).body;
      assert.equal(state.tasks.length, 1);
      assert.equal(state.focus.active.id, active.body.active.id);
      await app.call(`/api/focus/${active.body.active.id}/finish`, 'POST', {});
      await app.call(`/api/tasks/${id}`, 'DELETE');
      assert.equal((await app.call('/api/tasks')).body.tasks.length, 0);
      await app.close(); app = await start(mode, dir);
      assert.equal((await app.call('/api/tasks')).body.tasks.length, 0);
      assert.equal((await app.call('/api/state')).body.focus.sessions.length, 1);
      assert.equal((await app.call(`/api/tasks/${id}/restore`, 'POST', {})).status, 200);
      assert.equal((await app.call('/api/tasks')).body.tasks.length, 1);
      await app.call(`/api/tasks/${id}`, 'PATCH', { status: 'done' });
      assert.equal((await app.call('/api/stats')).body.completed, 1);
    } finally { if (app) await app.close(); fs.rmSync(dir, { recursive: true, force: true }); }
  });
}

test('HTTP rejects malformed bodies and cross-origin mutation; static assets bounded', async () => {
  const dir = fs.mkdtempSync(path.join(tempRoot, 'taskflow-test-'));
  const app = await start('json', dir);
  try {
    const malformed = await fetch(app.origin + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400);
    assert.equal((await app.call('/api/tasks', 'POST', { title: '<script>alert(1)</script>' })).status, 201);
    const cross = await fetch(app.origin + '/api/tasks', { method: 'POST', headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Cross' }) });
    assert.equal(cross.status, 403);
    assert.equal((await app.call('/api/stats?days=999')).status, 400);
    assert.equal((await fetch(app.origin + '/server.js')).status, 404);
    assert.equal((await fetch(app.origin + '/%2e%2e%2flib%2fstorage.js')).status, 404);
    assert.equal((await fetch(app.origin + '/favicon.svg')).status, 200);
  } finally { await app.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('concurrent slow JSON requests do not overwrite each other', async () => {
  const dir = fs.mkdtempSync(path.join(tempRoot, 'taskflow-test-'));
  const app = await start('json', dir);
  try {
    let release;
    const first = new Promise((resolve, reject) => {
      const req = http.request(app.origin + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => { let body = ''; res.on('data', c => { body += c; }); res.on('end', () => resolve(JSON.parse(body))); });
      req.on('error', reject);
      req.write('{"title":');
      release = () => req.end('"Slow"}');
    });
    assert.equal((await app.call('/api/tasks', 'POST', { title: 'Fast' })).status, 201);
    release(); await first;
    assert.deepEqual((await app.call('/api/tasks')).body.tasks.map(x => x.title).sort(), ['Fast', 'Slow']);
  } finally { await app.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('V1 JSON auto-migration retains original and does not reseed empty data', async () => {
  const dir = fs.mkdtempSync(path.join(tempRoot, 'taskflow-test-'));
  fs.writeFileSync(path.join(dir, 'tasks.json'), JSON.stringify([{ id: 'v1-task', title: 'V1', dueDate: '2026-11-26', status: 'todo' }]));
  let app;
  try {
    app = await start('json', dir);
    const task = (await app.call('/api/tasks')).body.tasks[0];
    assert.equal(task.id, 'v1-task');
    assert.equal(task.plannedDate, '2026-11-26');
    assert.ok(fs.existsSync(path.join(dir, 'tasks.json')));
    assert.ok(fs.existsSync(path.join(dir, 'taskflow.json')));
    await app.close(); app = null;
    const data = JSON.parse(fs.readFileSync(path.join(dir, 'taskflow.json'), 'utf8')); data.tasks = [];
    fs.writeFileSync(path.join(dir, 'taskflow.json'), JSON.stringify(data));
    app = await start('json', dir, { seed: true });
    assert.equal((await app.call('/api/tasks')).body.tasks.length, 0);
  } finally { if (app) await app.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});

test('V1 SQLite auto-migration retains original database and task metadata', async () => {
  const { DatabaseSync } = require('node:sqlite');
  const dir = fs.mkdtempSync(path.join(tempRoot, 'taskflow-test-'));
  const oldPath = path.join(dir, 'tasks.sqlite');
  const db = new DatabaseSync(oldPath);
  db.exec('CREATE TABLE tasks (id TEXT PRIMARY KEY,title TEXT,description TEXT,category TEXT,priority TEXT,due_date TEXT,status TEXT,created_at TEXT,updated_at TEXT,completed_at TEXT)');
  db.prepare('INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?,?)').run('old-db-1', 'Task cũ', '', 'study', 'high', '2026-11-20', 'done', '2026-11-18T01:00:00Z', '2026-11-20T01:00:00Z', '2026-11-20T01:00:00Z');
  db.close();
  let app;
  try {
    app = await start('sqlite', dir);
    const task = (await app.call('/api/tasks')).body.tasks[0];
    assert.equal(task.id, 'old-db-1');
    assert.equal(task.plannedDate, '2026-11-20');
    assert.equal(task.completedAt, '2026-11-20T01:00:00.000Z');
    assert.ok(fs.existsSync(path.join(dir, 'taskflow.sqlite')));
    const old = new DatabaseSync(oldPath, { readOnly: true });
    assert.equal(old.prepare('SELECT COUNT(*) AS n FROM tasks').get().n, 1);
    old.close();
  } finally { if (app) await app.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});

for (const mode of ['json', 'sqlite']) {
  test(`${mode}: SEED_DEMO=false starts fresh empty and never resets an existing store`, () => {
    const { makeStorage } = require('../lib/storage');
    const prior = process.env.SEED_DEMO;
    const base = fs.mkdtempSync(path.join(tempRoot, 'taskflow-demo-'));
    let storage;
    try {
      delete process.env.SEED_DEMO;
      storage = makeStorage({ mode, dataDir: path.join(base, 'existing') });
      const count = storage.read().tasks.length;
      assert.ok(count > 0);
      assert.equal(storage.read().demoData, true);
      storage.close(); storage = null;
      process.env.SEED_DEMO = 'false';
      storage = makeStorage({ mode, dataDir: path.join(base, 'existing') });
      assert.equal(storage.read().tasks.length, count);
      assert.equal(storage.read().demoData, true);
      storage.close(); storage = null;
      storage = makeStorage({ mode, dataDir: path.join(base, 'fresh') });
      assert.equal(storage.read().tasks.length, 0);
      assert.equal(storage.read().demoData, false);
      storage.close(); storage = null;
      process.env.SEED_DEMO = 'true';
      storage = makeStorage({ mode, dataDir: path.join(base, 'fresh') });
      assert.equal(storage.read().tasks.length, 0);
      assert.equal(storage.read().demoData, false);
    } finally {
      if (storage) storage.close();
      if (prior === undefined) delete process.env.SEED_DEMO; else process.env.SEED_DEMO = prior;
      fs.rmSync(base, { recursive: true, force: true });
    }
  });
}
