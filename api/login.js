const { signToken } = require('../lib/auth');
const withCors = require('../lib/withCors');

module.exports = withCors(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  const { accessCode } = req.body || {};
  if (!accessCode || accessCode !== process.env.AUTH_ACCESS_CODE) {
    return res.status(401).json({ error: 'Clave inválida' });
  }

  const token = signToken({ sub: 'user' });
  return res.status(200).json({ token });
});
