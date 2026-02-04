import { initFirebase, onValue, get, set } from './services/firebase.js';
import { ensureConfigIntegrity } from './state/config.js';
import { createSecurity } from './security/index.js';
import { createAi } from './services/ai.js';
import { createActions } from './actions/index.js';
import { createComponents } from './components/index.js';
import { createUi } from './ui/index.js';

const { cloudRef, pinRef, aiKeyRef } = initFirebase();

const FamilyApp = {
    state: { menu: {}, shopping: [], dictionary: {}, library: [], config: null },
    currentMonth: new Date(),
    remotePin: null,
    aiKey: null,

    async init() {
        try {
            const snapPin = await get(pinRef);
            const snapKey = await get(aiKeyRef);
            if (snapPin.exists()) this.remotePin = snapPin.val();
            if (snapKey.exists()) this.aiKey = snapKey.val();

            const elMsg = document.getElementById('lockMsg');
            const elPin = document.getElementById('pinInput');
            const elBtn = document.getElementById('btnLock');
            if (elMsg) elMsg.innerText = this.remotePin ? "PIN requerido" : "Crea un PIN";
            if (elPin) elPin.disabled = false;
            if (elBtn) { elBtn.disabled = false; elBtn.classList.remove('opacity-50'); }

            if (sessionStorage.getItem('unlocked') === 'true') this.security.unlock();

            onValue(cloudRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    this.state = { ...this.state, ...data };
                }

                ensureConfigIntegrity(this.state);

                if (!data) {
                    this.save();
                }

                this.render();
            });
        } catch (e) { console.error("Error Init:", e); }
    },

    save() { set(cloudRef, this.state); },
    render() {
        const active = document.querySelector('.tab-content.active')?.id;
        if (active === 'menu') this.components.menu();
        if (active === 'compra') this.components.compra();
        if (active === 'biblioteca') this.components.biblioteca();
        if (active === 'config') this.components.config();
    }
};

FamilyApp.security = createSecurity(FamilyApp, pinRef, { set });
FamilyApp.ai = createAi(FamilyApp);
FamilyApp.actions = createActions(FamilyApp, { aiKeyRef });
FamilyApp.components = createComponents(FamilyApp);
FamilyApp.ui = createUi(FamilyApp);

window.FamilyApp = FamilyApp;

function handleActionClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const { action, tab } = actionEl.dataset;

    if (action === 'reload') {
        location.reload();
    }
    if (action === 'check-pin') {
        FamilyApp.security.checkPin();
    }
    if (action === 'logout') {
        FamilyApp.security.logout();
    }
    if (action === 'switch-tab' && tab) {
        FamilyApp.ui.switchTab(tab);
    }
    if (action === 'close-modal') {
        FamilyApp.ui.closeModal();
    }
}

window.addEventListener('load', () => FamilyApp.init());
document.addEventListener('click', handleActionClick);
