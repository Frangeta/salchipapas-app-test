const { setJsonHeaders, sendError, signToken } = require('../lib/auth');

module.exports = (req, res) => {
  const corsOk = setJsonHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return corsOk
      ? res.status(200).end()
      : sendError(res, 403, 'FORBIDDEN', 'Origen no permitido por CORS');
  }
  if (!corsOk) return sendError(res, 403, 'FORBIDDEN', 'Origen no permitido por CORS');
  if (req.method !== 'POST') return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Solo POST');

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
  } catch (_error) {
    return sendError(res, 500, 'SERVER_ERROR', 'Error interno');
  }
};
