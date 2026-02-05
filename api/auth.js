const crypto = require('crypto');

const TOKEN_TTL_MS = 15 * 60 * 1000;

// 🔹 Generar secret
function getSecret() {
  return process.env.AUTH_TOKEN_SECRET || 'dev-token-secret-change-me';
}

// 🔹 Firmar payload
function sign(payloadBase64) {
  return crypto.createHmac('sha256', getSecret())
    .update(payloadBase64)
    .digest('base64url');
}

// 🔹 Crear token
function createToken() {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payloadBase64 = Buffer.from(JSON.stringify({ expiresAt }), 'utf-8').toString('base64url');
  return {
    token: `${payloadBase64}.${sign(payloadBase64)}`,
    expiresAt
  };
}

// 🔹 Validar token
function isValidToken(token) {
  if (!token || !token.includes('.')) return false;
  const [payloadBase64, signature] = token.split('.');
  if (signature !== sign(payloadBase64)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    return Number(payload.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

// 🔹 Wrapper para endpoints que requieren autenticación
function requireAuth(handler) {
  return async (req, res) => {
    // Leer token de Authorization
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token || !isValidToken(token)) {
      return res.status(401).json({ error: 'Token inválido o faltante' });
    }

    // Adjuntar info del usuario al request
    req.user = { sub: 'user' }; // opcionalmente podrías decodificar info real del token

    return handler(req, res);
  };
}

// 🔹 Función helper para errores JSON
function sendError(res, status = 500, code = 'SERVER_ERROR', message = 'Error interno') {
  return res.status(status).json({ error: { code, message } });
}

module.exports = {
  createToken,
  isValidToken,
  signToken: createToken,
  requireAuth,
  sendError
};
