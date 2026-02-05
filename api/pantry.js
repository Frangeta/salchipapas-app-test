module.exports = async (req, res) => {
  // 🔹 Headers de CORS siempre, antes de cualquier cosa
  res.setHeader('Access-Control-Allow-Origin', 'https://frangeta.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 🔹 Responder preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 🔹 Lógica principal
  } catch (err) {
    console.error('ERROR INTERNO:', err);
    // 🔹 Asegurarse que siempre se envíe un JSON con CORS
    res.status(500).json({ error: 'Error interno' });
  }
};

const { requireAuth, sendError } = require('../lib/auth');
const { getPantry, setPantry } = require('../lib/db');

module.exports = requireAuth((req, res) => {
  try {
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

  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'SERVER_ERROR', 'Error interno');
  }
});
