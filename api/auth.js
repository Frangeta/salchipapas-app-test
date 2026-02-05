const crypto = require('crypto');

const TOKEN_TTL_MS = 15 * 60 * 1000;

function getSecret() {
    return process.env.AUTH_TOKEN_SECRET || 'dev-token-secret-change-me';
}

function getAllowedOrigin() {
    return 'https://salchipapas-app-test.vercel.app';
}

function applyCors(res) {
    res.setHeader('Access-Control-Allow-Origin', getAllowedOrigin());
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sign(payloadBase64) {
    return crypto.createHmac('sha256', getSecret()).update(payloadBase64).digest('base64url');
}

function createToken() {
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const payloadBase64 = Buffer.from(JSON.stringify({ expiresAt }), 'utf-8').toString('base64url');
    const signature = sign(payloadBase64);
    return {
        token: `${payloadBase64}.${signature}`,
        expiresAt
    };
}

function isValidToken(token) {
    if (!token || !token.includes('.')) return false;

    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return false;

    const expectedSignature = sign(payloadBase64);
    if (signature !== expectedSignature) return false;

    try {
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
        return Number(payload.expiresAt) > Date.now();
    } catch (_error) {
        return false;
    }
}

module.exports = (req, res) => {
    applyCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, accessCode, token } = req.body || {};

    if (action === 'issue') {
        const expectedCode = process.env.AUTH_ACCESS_CODE;
        if (!expectedCode) {
            return res.status(500).json({ error: 'AUTH_ACCESS_CODE no configurado' });
        }

        if (accessCode !== expectedCode) {
            return res.status(401).json({ error: 'Clave inválida' });
        }

        return res.status(200).json(createToken());
    }

    if (action === 'validate') {
        return res.status(200).json({ valid: isValidToken(token) });
    }

    return res.status(400).json({ error: 'Acción no soportada' });
};
