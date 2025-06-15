export default async function handler(req, res) {
  // Habilita CORS para o seu front
  const ORIGIN = 'https://pluggyai-quickstart-html.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pre-flight
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST')
    return res.status(405).json({ error: 'method_not_allowed' });

  try {
    // 1) API Key (2 h)
    const authResp = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET
      })
    });
    const { apiKey } = await authResp.json();

    // 2) Connect Token (30 min)
    const tokenResp = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({})   // pode passar options aqui se quiser filtrar banco/país
    });
    const { accessToken: connectToken } = await tokenResp.json();

    return res.status(200).json({ connectToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'pluggy_error' });
  }
}
