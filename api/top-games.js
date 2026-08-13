module.exports = async (req, res) => {
  const apiUrl = process.env.ANALYTICS_API_URL;
  if (!apiUrl) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.status(200).json({ games: [] });
  }

  try {
    const upstream = await fetch(`${apiUrl.replace(/\/$/, '')}/api/public/top-games?period=30d`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (!upstream.ok) throw new Error('upstream_unavailable');
    const payload = await upstream.json();
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
    return res.status(200).json({ games: [] });
  }
};
