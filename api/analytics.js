const ALLOWED_TYPES = new Set(['site_view', 'game_open']);
const GAME_SLUG = /^[A-Za-z0-9_-]{1,160}$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const apiUrl = process.env.ANALYTICS_API_URL;
  const ingestKey = process.env.ANALYTICS_INGEST_KEY;
  if (!apiUrl || !ingestKey) {
    return res.status(204).end();
  }

  const { eventType, gameSlug, sessionId } = req.body || {};
  if (!ALLOWED_TYPES.has(eventType) || typeof sessionId !== 'string' || sessionId.length < 16 || sessionId.length > 128) {
    return res.status(422).json({ error: 'invalid_event' });
  }
  if (eventType === 'game_open' && !GAME_SLUG.test(gameSlug || '')) {
    return res.status(422).json({ error: 'invalid_game_slug' });
  }

  try {
    const upstream = await fetch(`${apiUrl.replace(/\/$/, '')}/api/v1/events`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-ingest-key': ingestKey
      },
      body: JSON.stringify({ eventType, gameSlug, sessionId }),
      signal: AbortSignal.timeout(3500)
    });

    return res.status(upstream.status === 202 ? 202 : 502).end();
  } catch (error) {
    return res.status(502).end();
  }
};
