import { initFirebase, onValue, get, set } from './services/firebase.js';
import { ensureConfigIntegrity } from './state/config.js';
import { createSecurity } from './security/index.js';
import { createAi } from './services/ai.js';
import { createActions } from './actions/index.js';
import { createComponents } from './components/index.js';
import { createUi } from './ui/index.js';
import { getState, setState } from './state/store.js';

const { cloudRef, pinRef, aiKeyRef } = initFirebase();

const FamilyApp = {
    state: getState(),
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
                    setState(data);
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

const tabRouter = createTabRouter(FamilyApp);

window.FamilyApp = FamilyApp;

function handleActionClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const { action, tab } = actionEl.dataset;

    if (action === 'reload') {
        location.reload();
        return;
    }
    if (action === 'check-pin') {
        FamilyApp.security.checkPin();
        return;
    }
    if (action === 'logout') {
        FamilyApp.security.logout();
        return;
    }
    if (action === 'switch-tab' && tab) {
        tabRouter.go(tab);
        return;
    }
    if (action === 'close-modal') {
        FamilyApp.ui.closeModal();
        return;
    }
    if (action === 'ai-generate-menu') {
        FamilyApp.ai.generateMenu(actionEl);
        return;
    }
    if (action === 'ai-propose-recipe') {
        const sourceId = actionEl.dataset.sourceId;
        const name = sourceId ? document.getElementById(sourceId)?.value : actionEl.dataset.recipeName;
        FamilyApp.ai.proposeRecipe(name?.trim());
        return;
    }
    if (action === 'delete-recipe') {
        FamilyApp.actions.deleteRecipe(actionEl.dataset.id);
        return;
    }
    if (action === 'save-recipe-manual') {
        FamilyApp.actions.saveRecipeManual();
        return;
    }
    if (action === 'open-recipe-modal') {
        FamilyApp.ui.openRecipeModal(actionEl.dataset.id || null);
        return;
    }
    if (action === 'add-item') {
        const inputId = actionEl.dataset.inputId;
        const isManual = actionEl.dataset.manual === 'true';
        if (isManual) {
            const value = inputId ? document.getElementById(inputId)?.value : '';
            FamilyApp.actions.addItem(null, value?.trim(), actionEl);
        } else {
            FamilyApp.actions.addItem(inputId);
        }
        return;
    }
    if (action === 'update-menu') {
        const date = actionEl.dataset.date;
        FamilyApp.state.menu[date] = {
            c: document.getElementById('mC')?.value || '',
            d: document.getElementById('mD')?.value || ''
        };
        FamilyApp.save();
        FamilyApp.ui.closeModal();
        return;
    }
    if (action === 'learn-category') {
        FamilyApp.actions.learnCategory(actionEl.dataset.itemId, actionEl.dataset.category);
        return;
    }
    if (action === 'open-menu-modal') {
        FamilyApp.ui.openMenuModal(actionEl.dataset.date);
        return;
    }
    if (action === 'save-icon') {
        FamilyApp.actions.saveIcon(actionEl.dataset.type, actionEl.dataset.id, actionEl.dataset.icon);
        return;
    }
    if (action === 'ai-accept') {
        FamilyApp.ai.accept(actionEl.dataset.date, actionEl.dataset.type, actionEl.dataset.value, actionEl);
        return;
    }
    if (action === 'confirm-save-ai-recipe') {
        FamilyApp.actions.confirmSaveAiRecipe(actionEl.dataset.name);
        return;
    }
    if (action === 'toggle-shop') {
        FamilyApp.actions.toggleShop(actionEl.dataset.id);
        return;
    }
    if (action === 'open-category-modal') {
        FamilyApp.ui.openCategoryModal(actionEl.dataset.id, actionEl.dataset.name);
        return;
    }
    if (action === 'clear-done') {
        FamilyApp.actions.clearDone();
        return;
    }
    if (action === 'edit-category-icon') {
        FamilyApp.actions.editCategoryIcon(actionEl.dataset.type, actionEl.dataset.id);
        return;
    }
    if (action === 'delete-category') {
        FamilyApp.actions.deleteCategory(actionEl.dataset.type, actionEl.dataset.id);
        return;
    }
    if (action === 'add-category') {
        FamilyApp.actions.addCategory(actionEl.dataset.type);
        return;
    }
    if (action === 'save-config') {
        FamilyApp.actions.saveConfig();
    }
}

function handleActionInput(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    if (actionEl.dataset.action === 'search-library') {
        FamilyApp.render();
    }
}

function createTabRouter(app) {
    const getDefaultTab = () => document.querySelector('.nav-item.active')?.dataset.tab || 'menu';
    const hasTab = (tabId) => document.getElementById(tabId);

    const go = (tabId, { updateHash = true } = {}) => {
        if (!tabId || !hasTab(tabId)) return;
        if (updateHash) {
            const hash = `#${tabId}`;
            if (location.hash !== hash) {
                history.replaceState(null, '', hash);
            }
        }
        app.ui.switchTab(tabId);
    };

    const syncFromHash = () => {
        const tabId = location.hash.replace('#', '');
        if (tabId) {
            go(tabId, { updateHash: false });
        } else {
            go(getDefaultTab(), { updateHash: true });
        }
    };

    const start = () => {
        window.addEventListener('hashchange', syncFromHash);
        syncFromHash();
    };

    return { start, go };
}

window.addEventListener('load', () => {
    tabRouter.start();
    FamilyApp.init();
});

document.addEventListener('click', handleActionClick);
document.addEventListener('input', handleActionInput);
