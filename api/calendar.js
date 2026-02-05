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
const { getCalendar, setCalendar } = require('../lib/db');

module.exports = requireAuth((req, res) => {
  try {
    const userId = req.user.sub;

    if (req.method === 'GET') {
      // Devuelve el calendario
      return res.status(200).json({ ok: true, data: { calendar: getCalendar(userId) } });
    }

    if (req.method === 'POST') {
      const { calendar } = req.body || {};
      if (!calendar || typeof calendar !== 'object' || Array.isArray(calendar)) {
        return sendError(res, 403, 'FORBIDDEN', 'Formato de calendario inválido');
      }
      return res.status(200).json({ ok: true, data: { calendar: setCalendar(userId, calendar) } });
    }

    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Método no permitido');

  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'SERVER_ERROR', 'Error interno');
  }
});
