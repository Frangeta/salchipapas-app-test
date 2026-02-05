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

const crypto = require('crypto');

const TOKEN_TTL_MS = 15 * 60 * 1000;

function getSecret() {
    return process.env.AUTH_TOKEN_SECRET || 'dev-token-secret-change-me';
}

function sign(payloadBase64) {
    return crypto.createHmac('sha256', getSecret())
        .update(payloadBase64)
        .digest('base64url');
}

function createToken() {
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const payloadBase64 = Buffer
        .from(JSON.stringify({ expiresAt }), 'utf-8')
        .toString('base64url');

    return {
        token: `${payloadBase64}.${sign(payloadBase64)}`,
        expiresAt
    };
}

function isValidToken(token) {
    if (!token || !token.includes('.')) return false;

    const [payloadBase64, signature] = token.split('.');
    if (signature !== sign(payloadBase64)) return false;

    try {
        const payload = JSON.parse(
            Buffer.from(payloadBase64, 'base64url').toString('utf-8')
        );
        return Number(payload.expiresAt) > Date.now();
    } catch {
        return false;
    }
}

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const body = typeof req.body === 'object' && req.body !== null
            ? req.body
            : {};

        const { action, accessCode, token } = body;

        if (action === 'issue') {
            if (!process.env.AUTH_ACCESS_CODE) {
                return res.status(500).json({ error: 'AUTH_ACCESS_CODE no configurado' });
            }

            if (accessCode !== process.env.AUTH_ACCESS_CODE) {
                return res.status(401).json({ error: 'Clave inválida' });
            }

            return res.status(200).json(createToken());
        }

        if (action === 'validate') {
            return res.status(200).json({ valid: isValidToken(token) });
        }

        return res.status(400).json({ error: 'Acción no soportada' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno' });
    }
};
