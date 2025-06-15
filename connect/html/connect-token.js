// api/connect-token.js

export default async function handler(req, res) {
  // 1) Permitir preflight CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://pluggyai-quickstart-html.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // 2) Cabeçalhos CORS para a resposta POST
  res.setHeader('Access-Control-Allow-Origin', 'https://pluggyai-quickstart-html.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 3) Autentica junto à Pluggy e pega o API Key
    const authResp = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET
      })
    });
    const { apiKey } = await authResp.json();

    // 4) Cria um Connect Token válido por 30min
    const tokenResp = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        // opcional: clientUserId, itemId, connectorTypes, countries...
        // Exemplo:
        // options: { clientUserId: req.body.options.clientUserId }
      })
    });
    const { accessToken: connectToken } = await tokenResp.json();

    // 5) Retorna o token para o front-end
    return res.status(200).json({ connectToken });
  } catch (err) {
    console.error('Erro no connect-token:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
