import { createFirebaseService } from './firebase.js';

const SESSION_KEY = 'salchipapas_session';
const AI_API_URL = 'https://salchipapas-ai.vercel.app/api/ai-recipes';

export function createApiService() {
  const firebase = createFirebaseService();
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

  const normalize = (value) => String(value || '').trim();

  const resolveAiApiUrl = () => {
    const configured = normalize(window.SALCHIPAPAS_AI_API_URL || '');
    return configured || AI_API_URL;
  };

  return {
    hasValidSession() {
      const current = readSession();
      return Boolean(current?.username);
    },
    clearSession() {
      writeSession(null);
    },
    async login({ username, password }) {
      const credentials = await firebase.loadCredentials();

      const inputUsername = normalize(username);
      const inputPassword = normalize(password);
      const configuredUsername = normalize(credentials.username);
      const configuredPassword = normalize(credentials.password);
      const legacyAccessCode = normalize(credentials.accessCode);

      if (configuredUsername && configuredPassword) {
        if (
          inputUsername.toLowerCase() !== configuredUsername.toLowerCase() ||
          inputPassword !== configuredPassword
        ) {
          throw new Error('Credenciales inválidas.');
        }

        writeSession({ username: configuredUsername });
        return { ok: true, authMode: 'userpass' };
      }

      if (legacyAccessCode) {
        if (inputPassword !== legacyAccessCode) {
          throw new Error('Credenciales inválidas.');
        }

        writeSession({ username: inputUsername || 'usuario' });
        return { ok: true, authMode: 'legacy-access-code' };
      }

      throw new Error('Configura authUsername/authPassword o accessCode en Firebase.');
    },
    async loadCalendar() {
      const calendar = await firebase.loadCalendar();
      return { calendar };
    },
    async saveCalendar(calendar) {
      await firebase.saveCalendar(calendar);
      return { ok: true };
    },
    async loadPantry() {
      const pantry = await firebase.loadPantry();
      return { pantry };
    },
    async savePantry(pantry) {
      await firebase.savePantry(pantry);
      return { ok: true };
    },
    async generateAiRecipes(ingredients = []) {
      const apiUrl = resolveAiApiUrl();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (_error) {
        payload = {};
      }

      if (!response.ok || payload?.ok === false) {
        const errorMessage = payload?.error?.message || payload?.error || 'Error al generar menú IA.';
        throw new Error(errorMessage);
      }

      const data = payload?.data || payload;
      if (!Array.isArray(data?.comidas) || !Array.isArray(data?.cenas)) {
        throw new Error('Respuesta IA inválida.');
      }

      return data;
    }
  };
}
