import { createFirebaseService } from './firebase.js';

const SESSION_KEY = 'salchipapas_session';

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

      if (!credentials.username || !credentials.password) {
        throw new Error('Configura authUsername y authPassword en Firebase.');
      }

      if (username !== credentials.username || password !== credentials.password) {
        throw new Error('Credenciales inválidas.');
      }

      writeSession({ username });
      return { ok: true };
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
    async generateAiRecipes() {
      throw new Error('La IA por API fue desactivada (sin Vercel).');
    }
  };
}
