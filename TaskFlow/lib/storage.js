'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { seedState, DEFAULT_SETTINGS } = require('./seed');
const { importTask, importSession, validateSettings, assertTaskInvariants } = require('./validation');

function emptyState() { return { schemaVersion: 2, demoData: false, tasks: [], settings: { ...DEFAULT_SETTINGS }, focusSessions: [], activeFocus: null }; }
function migrateState(value, now = new Date()) {
  const raw = Array.isArray(value) ? { tasks: value } : value;
  if (!raw || !Array.isArray(raw.tasks)) throw new Error('Tệp dữ liệu không có danh sách tasks hợp lệ.');
  const state = { schemaVersion: 2, demoData: raw.demoData === true, tasks: raw.tasks.map(x => importTask(x, now)), settings: validateSettings(raw.settings || {}), focusSessions: (raw.focusSessions || []).map(importSession), activeFocus: raw.activeFocus || null };
  assertTaskInvariants(state.tasks);
  if (state.activeFocus && (!['running', 'paused'].includes(state.activeFocus.status) || !Number.isFinite(Date.parse(state.activeFocus.startedAt)) || !Number.isInteger(state.activeFocus.elapsedSeconds) || state.activeFocus.elapsedSeconds < 0 || (state.activeFocus.status === 'running' && !Number.isFinite(Date.parse(state.activeFocus.anchorAt))))) throw new Error('Phiên tập trung đang chạy không hợp lệ trong tệp dữ liệu.');
  return state;
}

function makeStorage(options = {}) {
  const mode = (options.mode || process.env.STORAGE || 'json').toLowerCase();
  if (!['json', 'sqlite'].includes(mode)) throw new Error('STORAGE chỉ nhận json hoặc sqlite.');
  const dataDir = path.resolve(options.dataDir || process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
  fs.mkdirSync(dataDir, { recursive: true });
  const shouldSeed = options.seed === undefined ? String(process.env.SEED_DEMO ?? 'true').toLowerCase() !== 'false' : Boolean(options.seed);
  const initial = () => shouldSeed ? seedState(options.now || new Date()) : emptyState();
  let state, save, close = () => {};
  if (mode === 'json') {
    const filename = path.join(dataDir, 'taskflow.json');
    const oldFilename = path.join(dataDir, 'tasks.json');
    save = value => {
      const temporary = `${filename}.tmp-${process.pid}`;
      fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
      fs.renameSync(temporary, filename);
    };
    const input = fs.existsSync(filename) ? filename : fs.existsSync(oldFilename) ? oldFilename : null;
    if (input) {
      try { state = migrateState(JSON.parse(fs.readFileSync(input, 'utf8')), options.now); }
      catch (error) { throw new Error(`Không thể đọc ${path.basename(input)}: ${error.message} Dữ liệu cũ được giữ nguyên; hãy kiểm tra tệp hoặc dùng bản sao lưu.`); }
      if (input !== filename) save(state);
    } else { state = initial(); save(state); }
  } else {
    let DatabaseSync;
    try { ({ DatabaseSync } = require('node:sqlite')); }
    catch { throw new Error('SQLite cần Node.js 22.13 trở lên. Hãy dùng Node.js 24 hoặc chạy STORAGE=json.'); }
    const filename = path.join(dataDir, 'taskflow.sqlite');
    const existed = fs.existsSync(filename);
    const db = new DatabaseSync(filename);
    db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;
      CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT NOT NULL, category TEXT NOT NULL, due_date TEXT, planned_date TEXT, record_json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS focus_sessions (id TEXT PRIMARY KEY, task_id TEXT, elapsed_seconds INTEGER NOT NULL, finished_at TEXT NOT NULL, record_json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_tasks_planned ON tasks(planned_date);
      CREATE INDEX IF NOT EXISTS idx_focus_finished ON focus_sessions(finished_at);`);
    save = value => {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec('DELETE FROM tasks; DELETE FROM focus_sessions; DELETE FROM app_metadata;');
        const taskStmt = db.prepare('INSERT INTO tasks(id,title,status,category,due_date,planned_date,record_json) VALUES (?,?,?,?,?,?,?)');
        for (const t of value.tasks) taskStmt.run(t.id, t.title, t.status, t.category, t.dueDate, t.plannedDate, JSON.stringify(t));
        const focusStmt = db.prepare('INSERT INTO focus_sessions(id,task_id,elapsed_seconds,finished_at,record_json) VALUES (?,?,?,?,?)');
        for (const f of value.focusSessions) focusStmt.run(f.id, f.taskId, f.elapsedSeconds, f.finishedAt, JSON.stringify(f));
        const metaStmt = db.prepare('INSERT INTO app_metadata(key,value) VALUES (?,?)');
        for (const k of ['schemaVersion', 'demoData', 'settings', 'activeFocus']) metaStmt.run(k, JSON.stringify(value[k]));
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    };
    if (existed && db.prepare("SELECT value FROM app_metadata WHERE key='schemaVersion'").get()) {
      const meta = Object.fromEntries(db.prepare('SELECT key,value FROM app_metadata').all().map(x => [x.key, JSON.parse(x.value)]));
      state = migrateState({ ...meta, tasks: db.prepare('SELECT record_json FROM tasks').all().map(x => JSON.parse(x.record_json)), focusSessions: db.prepare('SELECT record_json FROM focus_sessions').all().map(x => JSON.parse(x.record_json)) }, options.now);
    } else {
      const oldSqlite = path.join(dataDir, 'tasks.sqlite');
      const oldJson = path.join(dataDir, 'tasks.json');
      if (fs.existsSync(oldSqlite)) {
        const legacy = new DatabaseSync(oldSqlite, { readOnly: true });
        try {
          const tasks = legacy.prepare('SELECT id,title,description,category,priority,due_date AS dueDate,status,created_at AS createdAt,updated_at AS updatedAt,completed_at AS completedAt FROM tasks').all();
          state = migrateState(tasks, options.now);
        } finally { legacy.close(); }
      } else if (fs.existsSync(oldJson)) state = migrateState(JSON.parse(fs.readFileSync(oldJson, 'utf8')), options.now);
      else state = initial();
      save(state);
    }
    close = () => db.close();
  }
  return {
    kind: mode === 'json' ? 'JSON' : 'SQLite', dataDir,
    read: () => structuredClone(state),
    transaction(fn) {
      const next = structuredClone(state);
      const result = fn(next);
      save(next);
      state = next;
      return structuredClone(result);
    },
    close,
  };
}
module.exports = { makeStorage, emptyState, migrateState };
