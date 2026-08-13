const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream');

const PORT = Number(process.env.PORT || 10000);
const STATIC_ROOT = path.resolve(__dirname, '..');
const ALLOWED_TYPES = new Set(['site_view', 'game_open']);
const GAME_SLUG = /^[A-Za-z0-9_-]{1,160}$/;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.swf': 'application/x-shockwave-flash',
  '.unityweb': 'application/octet-stream',
  '.data': 'application/octet-stream',
  '.pck': 'application/octet-stream'
};

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16 * 1024) throw new Error('payload_too_large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function forwardAnalytics(req, res) {
  const apiUrl = process.env.ANALYTICS_API_URL;
  const ingestKey = process.env.ANALYTICS_INGEST_KEY;
  if (!apiUrl || !ingestKey) return res.writeHead(204).end();

  try {
    const { eventType, gameSlug, sessionId } = await readJson(req);
    if (!ALLOWED_TYPES.has(eventType) || typeof sessionId !== 'string' || sessionId.length < 16 || sessionId.length > 128) {
      return sendJson(res, 422, { error: 'invalid_event' });
    }
    if (eventType === 'game_open' && !GAME_SLUG.test(gameSlug || '')) {
      return sendJson(res, 422, { error: 'invalid_game_slug' });
    }

    const upstream = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-ingest-key': ingestKey },
      body: JSON.stringify({ eventType, gameSlug, sessionId }),
      signal: AbortSignal.timeout(3500)
    });
    return res.writeHead(upstream.status === 202 ? 202 : 502).end();
  } catch (error) {
    return res.writeHead(502).end();
  }
}

async function forwardTopGames(res) {
  const apiUrl = process.env.ANALYTICS_API_URL;
  if (!apiUrl) return sendJson(res, 200, { games: [] }, { 'cache-control': 'public, max-age=60, s-maxage=300' });

  try {
    const upstream = await fetch(`${apiUrl.replace(/\/$/, '')}/api/public/top-games?period=30d`, {
      headers: { accept: 'application/json' }, signal: AbortSignal.timeout(3500)
    });
    if (!upstream.ok) throw new Error('upstream_unavailable');
    const payload = await upstream.json();
    return sendJson(res, 200, payload, { 'cache-control': 'public, max-age=60, s-maxage=300' });
  } catch (error) {
    return sendJson(res, 200, { games: [] }, { 'cache-control': 'public, max-age=30, s-maxage=60' });
  }
}

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const target = path.resolve(STATIC_ROOT, `.${decoded}`);
  if (!target.startsWith(`${STATIC_ROOT}${path.sep}`) && target !== STATIC_ROOT) return null;
  if (target.startsWith(path.resolve(STATIC_ROOT, 'render-server'))) return null;
  return target;
}

async function serveStatic(req, res, pathname) {
  let filePath = safePath(pathname);
  if (!filePath) return res.writeHead(403).end('Forbidden');

  try {
    let info = await fsp.stat(filePath);
    if (info.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      info = await fsp.stat(filePath);
    }
    if (!info.isFile()) return res.writeHead(404).end('Not Found');

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    const headers = {
      'content-type': contentType,
      'accept-ranges': 'bytes',
      'cache-control': path.extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600'
    };

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) return res.writeHead(416, { 'content-range': `bytes */${info.size}` }).end();
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (start > end || start >= info.size) return res.writeHead(416, { 'content-range': `bytes */${info.size}` }).end();
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${info.size}`, 'content-length': end - start + 1 });
      return pipeline(fs.createReadStream(filePath, { start, end }), res, () => {});
    }

    res.writeHead(200, { ...headers, 'content-length': info.size });
    return pipeline(fs.createReadStream(filePath), res, () => {});
  } catch (error) {
    return res.writeHead(error.code === 'ENOENT' ? 404 : 500).end(error.code === 'ENOENT' ? 'Not Found' : 'Server Error');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return sendJson(res, 200, { status: 'ok', service: 'GameHub Render proxy' });
  if (url.pathname === '/api/analytics') return req.method === 'POST' ? forwardAnalytics(req, res) : res.writeHead(405, { allow: 'POST' }).end();
  if (url.pathname === '/api/top-games') return req.method === 'GET' ? forwardTopGames(res) : res.writeHead(405, { allow: 'GET' }).end();
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405, { allow: 'GET, HEAD' }).end();
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => console.log(`GameHub Render proxy listening on ${PORT}`));
