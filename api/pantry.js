const { requireAuth, sendError } = require('../lib/auth');
const { getPantry, setPantry } = require('../lib/db');
const withCors = require('../lib/cors');

module.exports = withCors(requireAuth((req, res) => {
  const userId = req.user.sub;

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, data: { pantry: getPantry(userId) } });
  }

  if (req.method === 'POST') {
    const { pantry } = req.body || {};
    if (!Array.isArray(pantry)) {
      return sendError(res, 403, 'FORBIDDEN', 'Formato de despensa inválido');
    }
    return res.status(200).json({ ok: true, data: { pantry: setPantry(userId, pantry) } });
  }

  return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Método no permitido');
}));
