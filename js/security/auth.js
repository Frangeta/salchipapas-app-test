const UNLOCK_STORAGE_KEY = 'unlocked';

async function hashAccessCode(value) {
    const input = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', input);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function createAuth(app, { firebase }) {
    return {
        async init() {
            const lockMsg = document.getElementById('lockMsg');
            if (lockMsg) {
                lockMsg.textContent = app.accessCodeHash
                    ? 'Ingresa tu clave para acceder'
                    : 'Primera vez: crea una clave para proteger el acceso';
            }

            if (sessionStorage.getItem(UNLOCK_STORAGE_KEY) === 'true') {
                this.unlock();
            }
        },

        async requestToken() {
            const accessCodeEl = document.getElementById('accessCodeInput');
            const accessCode = accessCodeEl?.value?.trim();

            if (!accessCode) {
                alert('Introduce tu clave de acceso.');
                return;
            }

            const inputHash = await hashAccessCode(accessCode);

            if (!app.accessCodeHash) {
                await firebase.saveAccessCodeHash(inputHash);
                app.accessCodeHash = inputHash;
                sessionStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
                this.unlock();
                alert('Clave creada y guardada en Firebase.');
                return;
            }

            if (inputHash !== app.accessCodeHash) {
                alert('Clave inválida');
                return;
            }

            sessionStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
            this.unlock();
        },

        unlock() {
            const lock = document.getElementById('lock-screen');
            const appContent = document.getElementById('app-content');
            if (lock) lock.style.display = 'none';
            if (appContent) appContent.style.display = 'block';
            app.render();
        },

        logout({ reload = true } = {}) {
            sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
            if (reload) {
                location.reload();
            }
        },

        hashAccessCode
    };
}
