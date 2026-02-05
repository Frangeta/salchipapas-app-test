module.exports = async (req, res) => {
  // 🔹 Headers CORS obligatorios
  res.setHeader('Access-Control-Allow-Origin', '*'); // o tu dominio específico
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 🔹 Responder siempre a OPTIONS para preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Tu lógica normal aquí (POST/GET)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Solo POST');
  }

  try {
    const { username, password } = req.body || {};
    const validUser = process.env.AUTH_USERNAME;
    const validPassword = process.env.AUTH_PASSWORD;

    if (!validUser || !validPassword) {
      return sendError(res, 500, 'SERVER_ERROR', 'Credenciales no configuradas');
    }

    if (!username || !password) {
      return sendError(res, 403, 'FORBIDDEN', 'Credenciales incompletas');
    }

    if (username !== validUser || password !== validPassword) {
      return sendError(res, 403, 'FORBIDDEN', 'Credenciales inválidas');
    }

    const token = signToken({ sub: username });
    return res.status(200).json({ ok: true, data: { token } });

  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'SERVER_ERROR', 'Error interno');
  }
};
