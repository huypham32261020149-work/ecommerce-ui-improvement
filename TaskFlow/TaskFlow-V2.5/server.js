'use strict';

// Bắt đầu từ ví dụ trên lớp: http.createServer(request, response).
// Router dưới đây phục vụ cả giao diện và JSON API, không dùng Express.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { makeStorage } = require('./lib/storage');
const { createService } = require('./lib/service');
const { AppError } = require('./lib/validation');

const MAX_BODY = 1024 * 1024;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8' };

function json(response, status, value, extra = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  response.end(JSON.stringify(value));
}
async function readBody(request) {
  if (Number(request.headers['content-length'] || 0) > MAX_BODY) throw new AppError('Dữ liệu gửi lên quá lớn (tối đa 1 MiB).', 413);
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > MAX_BODY) throw new AppError('Dữ liệu gửi lên quá lớn (tối đa 1 MiB).', 413); chunks.push(chunk); }
  if (!size) return {};
  if (!(request.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new AppError('Hãy gửi dữ liệu với Content-Type: application/json.', 415);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AppError('Nội dung JSON không hợp lệ.'); }
}

function createApp(options = {}) {
  const storage = options.storage || makeStorage(options);
  const service = createService(storage, { clock: options.clock });
  const publicDir = options.publicDir || path.join(__dirname, 'public');
  const handler = async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (pathname.startsWith('/api/')) {
        const method = request.method;
        if (!['GET', 'HEAD'].includes(method) && request.headers.origin) {
          let origin;
          try { origin = new URL(request.headers.origin); } catch { throw new AppError('Nguồn yêu cầu không hợp lệ.', 403); }
          if (origin.host !== request.headers.host || !['http:', 'https:'].includes(origin.protocol)) throw new AppError('Yêu cầu thay đổi dữ liệu phải đến từ chính ứng dụng.', 403);
        }
        // Await the complete body first. The synchronous service transaction then
        // reads the latest state, preventing concurrent request lost updates.
        const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(request) : null;
        if (method === 'GET' && pathname === '/api/health') return json(response, 200, { ok: true, version: '2.5.0', storage: storage.kind });
        if (method === 'GET' && pathname === '/api/state') return json(response, 200, service.snapshot());
        if (method === 'GET' && pathname === '/api/tasks') return json(response, 200, { tasks: service.snapshot().tasks.filter(t => !t.deletedAt) });
        if (method === 'POST' && pathname === '/api/tasks') return json(response, 201, service.createTask(body));
        const taskMatch = pathname.match(/^\/api\/tasks\/([a-zA-Z0-9_-]+)(\/restore)?$/);
        if (taskMatch) {
          if (taskMatch[2] && method === 'POST') return json(response, 200, service.restoreTask(taskMatch[1]));
          if (!taskMatch[2] && ['PATCH', 'PUT'].includes(method)) return json(response, 200, service.updateTask(taskMatch[1], body));
          if (!taskMatch[2] && method === 'DELETE') return json(response, 200, service.deleteTask(taskMatch[1]));
        }
        if (method === 'PATCH' && pathname === '/api/settings') return json(response, 200, service.updateSettings(body));
        if (method === 'GET' && pathname === '/api/stats') return json(response, 200, service.getStats(url.searchParams.has('days') ? Number(url.searchParams.get('days')) : 7));
        if (method === 'GET' && pathname === '/api/suggestions') return json(response, 200, service.getSuggestions(url.searchParams.get('date') || undefined));
        if (method === 'POST' && pathname === '/api/suggestions/apply') return json(response, 200, service.applySuggestions(body));
        if (method === 'POST' && pathname === '/api/quick-add/preview') return json(response, 200, service.quickAdd(body));
        if (method === 'POST' && pathname === '/api/focus/start') return json(response, 201, service.startFocus(body));
        const focusMatch = pathname.match(/^\/api\/focus\/([a-zA-Z0-9_-]+)\/(pause|resume|finish|cancel)$/);
        if (focusMatch && method === 'POST') return json(response, 200, service.focusAction(focusMatch[1], focusMatch[2]));
        if (method === 'GET' && pathname === '/api/export') return json(response, 200, service.exportData(), { 'Content-Disposition': `attachment; filename="taskflow-backup-${service.snapshot().today}.json"` });
        if (method === 'POST' && pathname === '/api/import') return json(response, 200, service.importData(body));
        throw new AppError('Không tìm thấy API hoặc phương thức này.', 404);
      }
      if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); throw new AppError('Phương thức không được hỗ trợ.', 405); }
      if (pathname === '/statistics.html') { response.writeHead(302, { Location: '/#stats' }); return response.end(); }
      const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const filename = path.resolve(publicDir, relative);
      const inside = path.relative(publicDir, filename);
      if (inside.startsWith('..') || path.isAbsolute(inside) || !Object.hasOwn(MIME, path.extname(filename))) throw new AppError('Không tìm thấy trang.', 404);
      let bytes;
      try { const stat = fs.statSync(filename); if (!stat.isFile()) throw new Error(); bytes = fs.readFileSync(filename); }
      catch { throw new AppError('Không tìm thấy trang.', 404); }
      response.writeHead(200, { 'Content-Type': MIME[path.extname(filename)], 'Content-Length': bytes.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      if (response.headersSent || response.destroyed) return;
      const status = error instanceof URIError ? 400 : error.status || 500;
      if (status === 500) console.error('TaskFlow:', error.message);
      json(response, status, { error: status === 500 ? 'Không thể lưu hoặc xử lý dữ liệu. Kiểm tra terminal rồi thử lại.' : error.message });
    }
  };
  return { handler, storage, service };
}

function createServer(options = {}) {
  const app = createApp(options);
  const server = http.createServer(app.handler);
  server.on('close', () => app.storage.close());
  server.requestTimeout = 30000;
  server.headersTimeout = 10000;
  return { server, ...app };
}

if (require.main === module) {
  try {
    const port = Number(process.env.PORT || 8080);
    const host = process.env.HOST || '127.0.0.1';
    const { server, storage } = createServer();
    server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Cổng ${port} đang được sử dụng. Hãy đóng tiến trình cũ hoặc đặt PORT khác.` : error.message); process.exitCode = 1; storage.close(); });
    server.listen(port, host, () => console.log(`TaskFlow V2.5 đang chạy tại http://${host}:${port}\nLưu trữ: ${storage.kind}\nNhấn Ctrl+C để dừng.`));
    process.once('SIGINT', () => server.close());
    process.once('SIGTERM', () => server.close());
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { createApp, createServer, readBody };
