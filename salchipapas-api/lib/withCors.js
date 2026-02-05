function withCors(handler) {
  return async (req, res) => {
    // 🔹 Headers CORS obligatorios
    res.setHeader('Access-Control-Allow-Origin', 'https://frangeta.github.io'); // o '*' para pruebas
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 🔹 Responder OPTIONS/preflight inmediatamente
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
      return await handler(req, res);
    } catch (err) {
      console.error('ERROR EN API:', err);
      return res.status(500).json({ error: 'Error interno' });
    }
  };
}

module.exports = withCors;
