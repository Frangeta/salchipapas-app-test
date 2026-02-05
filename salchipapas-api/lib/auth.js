const jwt = require('jsonwebtoken');

function getAllowedOrigins() {
  return (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolveCorsOrigin(req) {
  const requestOrigin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (!requestOrigin) return '*';
  if (!allowedOrigins.length) return requestOrigin;
  if (allowedOrigins.includes(requestOrigin)) return requestOrigin;
  return null;
}

function setJsonHeaders(req, res) {
  const corsOrigin = resolveCorsOrigin(req);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (corsOrigin) {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  }

  return Boolean(corsOrigin);
}

function sendError(res, status, code, message) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no configurado');
  }
  return secret;
}

function signToken(payload) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function requireAuth(handler) {
  return (req, res) => {
    const corsOk = setJsonHeaders(req, res);

    if (req.method === 'OPTIONS') {
      return corsOk
        ? res.status(200).end()
        : sendError(res, 403, 'FORBIDDEN', 'Origen no permitido por CORS');
    }

    if (!corsOk) {
      return sendError(res, 403, 'FORBIDDEN', 'Origen no permitido por CORS');
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Falta token de autorización');
    }

    try {
      req.user = verifyToken(token);
      return handler(req, res);
    } catch (_error) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Token inválido o expirado');
    }
  };
}

module.exports = {
  setJsonHeaders,
  sendError,
  signToken,
  requireAuth
};
