const SESSION_KEY = 'salchipapas_session';

function getConfiguredBaseUrl() {
  return window.SALCHIPAPAS_API_URL || 'http://localhost:3000';
}

export function createApiService(app) {
  let session = null;

  const readSession = () => {
    if (session) return session;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      session = JSON.parse(raw);
      return session;
    } catch (_error) {
      return null;
    }
  };

  const writeSession = (nextSession) => {
    session = nextSession;
    if (nextSession) sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    else sessionStorage.removeItem(SESSION_KEY);
  };

  const request = async (path, { method = 'GET', body, auth = true } = {}) => {
    const current = readSession();
    const headers = { 'Content-Type': 'application/json' };

    if (auth && current?.token) headers.Authorization = `Bearer ${current.token}`;

    const response = await fetch(`${getConfiguredBaseUrl()}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload?.error?.message || payload?.error || 'Error de API');
      error.status = response.status;
      throw error;
    }

    return payload.data;
  };

  return {
    hasValidSession() {
      const current = readSession();
      return Boolean(current?.token);
    },
    clearSession() {
      writeSession(null);
    },
    async login(credentials) {
      const data = await request('/api/login', { method: 'POST', body: credentials, auth: false });
      writeSession({ token: data.token });
      return data;
    },
    async loadCalendar() {
      return request('/api/calendar');
    },
    async saveCalendar(calendar) {
      return request('/api/calendar', { method: 'POST', body: { calendar } });
    },
    async loadPantry() {
      return request('/api/pantry');
    },
    async savePantry(pantry) {
      return request('/api/pantry', { method: 'POST', body: { pantry } });
    },
    async generateAiRecipes(ingredients) {
      return request('/api/ai-recipes', { method: 'POST', body: { ingredients } });
    }
  };
}
