const TOKEN_STORAGE_KEY = 'auth_token';
const TOKEN_EXPIRY_STORAGE_KEY = 'auth_token_expiry';

async function requestAuth(endpoint, payload) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo validar el acceso');
    }

    return response.json();
}

export function createAuth(app) {
    return {
        async init() {
            const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
            const expiresAt = Number(sessionStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY));

            if (!token || !expiresAt || Date.now() >= expiresAt) {
                this.logout({ reload: false });
                return;
            }

            try {
                const result = await requestAuth('/api/auth', { action: 'validate', token });
                if (result.valid) {
                    this.unlock();
                    return;
                }
            } catch (error) {
                console.error('Error validando token:', error);
            }

            this.logout({ reload: false });
        },

        async requestToken() {
            const accessCodeEl = document.getElementById('accessCodeInput');
            const accessCode = accessCodeEl?.value?.trim();

            if (!accessCode) {
                alert('Introduce tu clave de acceso.');
                return;
            }

            try {
                const { token, expiresAt } = await requestAuth('/api/auth', {
                    action: 'issue',
                    accessCode
                });

                sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
                sessionStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, String(expiresAt));
                this.unlock();
            } catch (error) {
                alert(error.message || 'Acceso denegado');
            }
        },

        unlock() {
            const lock = document.getElementById('lock-screen');
            const appContent = document.getElementById('app-content');
            if (lock) lock.style.display = 'none';
            if (appContent) appContent.style.display = 'block';
            app.render();
        },

        logout({ reload = true } = {}) {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
            sessionStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
            if (reload) {
                location.reload();
            }
        }
    };
}
