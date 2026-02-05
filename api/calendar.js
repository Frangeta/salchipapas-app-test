const { requireAuth, sendError } = require('../lib/auth');
const { getCalendar, setCalendar } = require('../lib/db');
const withCors = require('../lib/cors');

module.exports = withCors(requireAuth((req, res) => {
  const userId = req.user.sub;

  if (req.method === 'GET') {
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
}));
