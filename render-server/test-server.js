const http = require('http');
const assert = require('assert/strict');
const { spawn } = require('child_process');

const mockEvents = [];
const mock = http.createServer(async (req, res) => {
  if (req.url === '/api/public/top-games?period=30d') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ period: '30d', games: [{ rank: 1, gameSlug: 'Balatro', plays: 2, uniquePlayers: 2 }] }));
  }
  if (req.url === '/api/v1/events' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    mockEvents.push({ key: req.headers['x-ingest-key'], body: JSON.parse(body) });
    res.writeHead(202, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ accepted: true }));
  }
  res.writeHead(404).end();
});

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Render proxy não iniciou a tempo')), 10000);
    child.stdout.on('data', (data) => { if (data.toString().includes('listening')) { clearTimeout(timeout); resolve(); } });
    child.stderr.on('data', (data) => process.stderr.write(data));
    child.on('exit', (code) => reject(new Error(`Render proxy encerrou com ${code}`)));
  });
}

(async () => {
  await new Promise((resolve) => mock.listen(4301, '127.0.0.1', resolve));
  const child = spawn(process.execPath, ['render-server/server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '4300', ANALYTICS_API_URL: 'http://127.0.0.1:4301', ANALYTICS_INGEST_KEY: 'test-key' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer(child);
    const root = await fetch('http://127.0.0.1:4300/');
    assert.equal(root.status, 200);
    assert.match(await root.text(), /GAMEHUB/i);

    const ranged = await fetch('http://127.0.0.1:4300/Balatro/love.min.js', { headers: { range: 'bytes=0-99' } });
    assert.equal(ranged.status, 206);
    assert.equal((await ranged.arrayBuffer()).byteLength, 100);
    assert.match(ranged.headers.get('content-range'), /^bytes 0-99\//);

    const top = await fetch('http://127.0.0.1:4300/api/top-games');
    assert.equal(top.status, 200);
    assert.equal((await top.json()).games[0].gameSlug, 'Balatro');

    const event = await fetch('http://127.0.0.1:4300/api/analytics', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'game_open', gameSlug: 'Balatro', sessionId: 'render-proxy-test-0001' })
    });
    assert.equal(event.status, 202);
    assert.equal(mockEvents[0].key, 'test-key');
    assert.equal(mockEvents[0].body.gameSlug, 'Balatro');

    const protectedFile = await fetch('http://127.0.0.1:4300/render-server/server.js');
    assert.equal(protectedFile.status, 403);
    console.log(JSON.stringify({ status: 'pass', routes: ['static', 'range', 'top-games', 'analytics-proxy', 'protected-source'] }));
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => mock.close(resolve));
  }
})().catch((error) => { console.error(error); process.exit(1); });
