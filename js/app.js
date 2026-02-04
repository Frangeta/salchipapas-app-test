import { initFirebase, onValue, get, set } from './services/firebase.js';
import { ensureConfigIntegrity } from './state/config.js';
import { createSecurity } from './security/index.js';
import { createAi } from './services/ai.js';
import { createActions } from './actions/index.js';
import { createComponents } from './components/index.js';
import { createUi } from './ui/index.js';
import { createCalendarUi } from './ui/calendar.js';
import { createShoppingUi } from './ui/shopping.js';
import { createRecipesUi } from './ui/recipes.js';
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
        if (active === 'compra') this.shoppingUi.render();
        if (active === 'biblioteca') this.recipesUi.render();
        if (active === 'config') this.components.config();
    }
};

FamilyApp.security = createSecurity(FamilyApp, pinRef, { set });
FamilyApp.ai = createAi(FamilyApp);
FamilyApp.actions = createActions(FamilyApp, { aiKeyRef });
FamilyApp.components = createComponents(FamilyApp);
FamilyApp.ui = createUi(FamilyApp);
FamilyApp.calendarUi = createCalendarUi(FamilyApp);
FamilyApp.shoppingUi = createShoppingUi(FamilyApp);
FamilyApp.recipesUi = createRecipesUi(FamilyApp);

const tabRouter = createTabRouter(FamilyApp);

window.FamilyApp = FamilyApp;

function handleActionClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const { action, tab } = actionEl.dataset;

    if (FamilyApp.shoppingUi?.handleAction(actionEl)) {
        return;
    }
    if (FamilyApp.calendarUi?.handleAction(actionEl)) {
        return;
    }
    if (FamilyApp.recipesUi?.handleAction(actionEl)) {
        return;
    }
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

    if (FamilyApp.recipesUi?.handleInput(actionEl)) {
        return;
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
