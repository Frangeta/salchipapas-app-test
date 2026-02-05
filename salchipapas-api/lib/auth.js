const jwt = require('jsonwebtoken');

function setJsonHeaders(res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    setJsonHeaders(res);
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
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
