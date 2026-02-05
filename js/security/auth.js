const UNLOCK_STORAGE_KEY = 'unlocked';

export function createAuth(app) {
  return {
    async init() {
      const lockMsg = document.getElementById('lockMsg');
      if (lockMsg) {
        lockMsg.textContent = 'Inicia sesión para acceder';
      }

      if (sessionStorage.getItem(UNLOCK_STORAGE_KEY) === 'true' && app.api.hasValidSession()) {
        await this.unlock();
      }
    },

    async requestToken() {
      const username = document.getElementById('usernameInput')?.value?.trim();
      const password = document.getElementById('accessCodeInput')?.value?.trim();

      if (!username || !password) {
        app.ui.setLockError('Introduce usuario y contraseña.');
        return;
      }

      app.ui.setLockError('');
      try {
        await app.api.login({ username, password });
        sessionStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
        await this.unlock();
        app.ui.toast('Acceso concedido', { type: 'success' });
      } catch (error) {
        app.ui.setLockError(error.message || 'Login inválido');
        app.ui.toast('Credenciales inválidas', { type: 'error' });
      }
    },

    async unlock() {
      const lock = document.getElementById('lock-screen');
      const appContent = document.getElementById('app-content');
      if (lock) lock.style.display = 'none';
      if (appContent) appContent.style.display = 'block';
      await app.bootstrapData();
      app.render();
    },

    logout({ reload = true } = {}) {
      sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
      app.api.clearSession();
      if (reload) location.reload();
    }
  };
}
