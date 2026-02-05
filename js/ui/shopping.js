import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';
import { getState } from '../state/store.js';

export function createShoppingUi(app) {
    const escapeAttr = (value) => String(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const getShoppingState = () => getState();

    const addItem = async (inputId, manualValue = null, btn = null) => {
        const el = inputId ? document.getElementById(inputId) : null;
        const val = manualValue || (el ? el.value.trim() : '');
        if (!val) return;

        const state = getShoppingState();
        const shopCats = state.config.categories.shop || DEFAULT_CONFIG.categories.shop;

        let foundCatId = null;
        for (const [catName, words] of Object.entries(state.dictionary)) {
            if (words.some(w => val.toLowerCase().includes(w))) {
                const catObj = shopCats.find(c => c.name === catName);
                if (catObj) foundCatId = catObj.name;
                break;
            }
        }

        if (!state.shopping) state.shopping = [];
        state.shopping.push({ id: Date.now().toString(), name: val, checked: false, category: foundCatId || 'Otros' });

        if (manualValue && btn) { btn.innerText = 'done'; btn.classList.add('bg-success', 'text-white'); }
        if (!manualValue && el) el.value = '';
        await app.api.savePantry(state.shopping);
    };

    const toggleShop = async (id) => {
        const state = getShoppingState();
        const item = state.shopping.find(i => i.id == id);
        if (item) { item.checked = !item.checked; await app.api.savePantry(state.shopping); }
    };

    const learnCategory = async (itemId, newCatName) => {
        const state = getShoppingState();
        const item = state.shopping.find(i => i.id == itemId);
        if (!item) return;
        item.category = newCatName;

        if (!state.dictionary[newCatName]) state.dictionary[newCatName] = [];
        const word = item.name.toLowerCase();
        if (!state.dictionary[newCatName].includes(word)) state.dictionary[newCatName].push(word);

        await app.api.savePantry(state.shopping);
        app.ui.closeModal();
    };

    const clearDone = async () => {
        const state = getShoppingState();
        if (confirm("¿Borrar comprados?")) { state.shopping = state.shopping.filter(i => !i.checked); await app.api.savePantry(state.shopping); }
    };

    const renderList = () => {
        const state = getShoppingState();
        const items = state.shopping || [];
        const pending = items.filter(i => !i.checked);
        const done = items.filter(i => i.checked);

        const catsConfig = state.config.categories.shop || DEFAULT_CONFIG.categories.shop;
        const grouped = {};

        catsConfig.forEach(c => grouped[c.name] = { meta: c, items: [] });
        grouped['Otros'] = { meta: {name:'Otros', icon:'package_2'}, items: [] };

        pending.forEach(i => {
            const cName = i.category || 'Otros';
            if (grouped[cName]) grouped[cName].items.push(i);
            else grouped['Otros'].items.push(i);
        });

        let html = `<h2 class="text-2xl font-bold mb-6">Compra</h2><div class="flex gap-2 mb-8"><input type="text" id="shopMain" placeholder="Añadir..." class="flex-grow rounded-2xl border-none shadow-sm p-4 text-sm bg-white"><button data-action="add-item" data-input-id="shopMain" class="bg-primary text-white rounded-2xl w-14 flex items-center justify-center material-symbols-outlined">add</button></div>`;

        Object.values(grouped).forEach(g => {
            if (g.items.length > 0) {
                html += `<div class="mb-6"><h3 class="text-[10px] font-black uppercase text-primary mb-3 ml-2 flex items-center gap-2"><span class="material-symbols-outlined text-sm">${g.meta.icon}</span> ${g.meta.name}</h3><div class="space-y-2">`;
                html += g.items.map(i => `<div class="bg-white p-3 rounded-2xl flex items-center justify-between border shadow-sm">
                    <div data-action="toggle-shop" data-id="${i.id}" class="flex items-center gap-3 flex-grow"><span class="material-symbols-outlined text-gray-200">circle</span><span class="text-sm text-gray-700">${i.name}</span></div>
                    <button data-action="open-category-modal" data-id="${i.id}" data-name="${escapeAttr(i.name)}" class="text-gray-300 material-symbols-outlined text-lg">label</button>
                </div>`).join('');
                html += `</div></div>`;
            }
        });

        if (done.length > 0) {
            html += `<div class="mt-10 pt-6 border-t opacity-50"><button data-action="clear-done" class="text-[10px] text-red-400 font-bold mb-4">LIMPIAR COMPRADOS</button>${done.map(i => `<div data-action="toggle-shop" data-id="${i.id}" class="flex items-center gap-3 p-2 text-sm line-through text-gray-400"><span class="material-symbols-outlined text-success">check_circle</span>${i.name}</div>`).join('')}</div>`;
        }
        const container = document.getElementById('compra');
        if (container) container.innerHTML = html;
    };

    const handleAction = (actionEl) => {
        const action = actionEl.dataset.action;
        if (action === 'add-item') {
            const inputId = actionEl.dataset.inputId;
            const isManual = actionEl.dataset.manual === 'true';
            if (isManual) {
                const value = inputId ? document.getElementById(inputId)?.value : '';
                addItem(null, value?.trim(), actionEl);
            } else {
                addItem(inputId);
            }
            return true;
        }
        if (action === 'toggle-shop') {
            toggleShop(actionEl.dataset.id);
            return true;
        }
        if (action === 'open-category-modal') {
            app.ui.openCategoryModal(actionEl.dataset.id, actionEl.dataset.name);
            return true;
        }
        if (action === 'learn-category') {
            learnCategory(actionEl.dataset.itemId, actionEl.dataset.category);
            return true;
        }
        if (action === 'clear-done') {
            clearDone();
            return true;
        }
        return false;
    };

    return {
        render: renderList,
        handleAction
    };
}
