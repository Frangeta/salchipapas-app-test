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

const OpenAI = require('openai');
const { requireAuth, sendError } = require('../lib/auth');

const SYSTEM_PROMPT = 'Devuelve SOLO JSON válido con esta forma: {"comidas":[{"dia":"Lunes","plato":"..."}],"cenas":[{"dia":"Lunes","plato":"..."}]}. Deben ser exactamente 7 comidas y 7 cenas.';

module.exports = requireAuth(async (req, res) => {
  // Solo POST
  if (req.method !== 'POST') {
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Solo POST');
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return sendError(res, 500, 'SERVER_ERROR', 'OPENAI_API_KEY no configurada');
    }

    const { ingredients } = req.body || {};
    if (!Array.isArray(ingredients)) {
      return sendError(res, 403, 'FORBIDDEN', 'ingredients debe ser un array');
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.5,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Ingredientes disponibles: ${ingredients.join(', ') || 'sin ingredientes definidos'}` }
      ]
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed.comidas) || !Array.isArray(parsed.cenas) || parsed.comidas.length !== 7 || parsed.cenas.length !== 7) {
      return sendError(res, 500, 'SERVER_ERROR', 'Respuesta IA inválida');
    }

    // Respuesta JSON limpia
    return res.status(200).json({ ok: true, data: parsed });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'SERVER_ERROR', 'Error interno');
  }
});
