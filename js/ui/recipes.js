import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function createRecipesUi(app) {
    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const getQuery = () => document.getElementById('libSearch')?.value || '';

    const render = () => {
        const query = getQuery();
        const queryLower = query.toLowerCase();
        const recipes = (app.state.library || []).filter(r => r.name.toLowerCase().includes(queryLower));

        const catsConfig = app.state.config.categories.recipe || DEFAULT_CONFIG.categories.recipe;
        const grouped = {};
        catsConfig.forEach(c => grouped[c.name] = { meta: c, items: [] });
        grouped['Sin Sección'] = { meta: { name: 'Sin Sección', icon: 'menu_book' }, items: [] };

        recipes.forEach(r => {
            const sec = r.section || 'Sin Sección';
            if (grouped[sec]) grouped[sec].items.push(r);
            else grouped['Sin Sección'].items.push(r);
        });

        let html = `<div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold">Libro</h2><button data-action="open-recipe-modal" class="bg-primary text-white size-10 rounded-full flex items-center justify-center material-symbols-outlined shadow-lg">add</button></div>
            <div class="mb-6 relative"><input type="text" id="libSearch" value="${escapeHtml(query)}" data-action="search-library" placeholder="Buscar..." class="w-full rounded-2xl border-none p-4 pl-12 text-sm bg-white shadow-sm"><span class="material-symbols-outlined absolute left-4 top-4 text-gray-300">search</span></div>`;

        Object.values(grouped).forEach(g => {
            if (g.items.length > 0) {
                html += `<div class="mb-4"><h3 class="text-[10px] font-bold uppercase text-primary mb-2 ml-2 flex items-center gap-2"><span class="material-symbols-outlined text-sm">${escapeHtml(g.meta.icon)}</span> ${escapeHtml(g.meta.name)}</h3><div class="space-y-2">`;
                html += g.items.map(r => `<div data-action="open-recipe-modal" data-id="${escapeHtml(r.id)}" class="bg-white p-4 rounded-3xl border shadow-sm flex justify-between items-center cursor-pointer"><div><p class="font-bold text-sm">${escapeHtml(r.name)}</p></div><span class="material-symbols-outlined text-gray-200">chevron_right</span></div>`).join('');
                html += `</div></div>`;
            }
        });

        const container = document.getElementById('biblioteca');
        if (container) container.innerHTML = html;
    };

    const openRecipeModal = (id = null) => {
        const r = id ? app.state.library.find(x => x.id == id) : null;
        const recipe = r || { name: '', section: 'Sin Sección', ing: '', steps: '' };

        const cats = app.state.config.categories.recipe || DEFAULT_CONFIG.categories.recipe;
        const catOptions = cats.map(c =>
            `<option value="${escapeHtml(c.name)}" ${recipe.section === c.name ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
        ).join('');

        app.ui.openModal(`
            <div class="flex justify-between items-center mb-6"><h3 class="font-bold text-primary text-[10px] uppercase">${id ? 'Editar' : 'Nueva'}</h3><div class="flex gap-4">
            <button data-action="ai-propose-recipe" data-source-id="libName" class="material-symbols-outlined text-primary">auto_awesome</button>
            ${id ? `<button data-action="delete-recipe" data-id="${escapeHtml(id)}" class="material-symbols-outlined text-red-400">delete</button>` : ''}</div></div>
            <input type="hidden" id="libId" value="${escapeHtml(id || '')}">
            <div class="space-y-4">
                <input type="text" id="libName" value="${escapeHtml(recipe.name || '')}" placeholder="Nombre" class="w-full rounded-2xl border-none bg-gray-50 p-4 font-bold text-sm">
                <select id="libSec" class="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs">
                    ${catOptions}
                    <option value="Sin Sección">Sin Sección</option>
                </select>
                <textarea id="libIng" placeholder="Ingredientes" class="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs h-32 leading-relaxed">${escapeHtml(app.ai.cleanText(recipe.ing))}</textarea>
                <textarea id="libSteps" placeholder="Preparación" class="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs h-32 leading-relaxed">${escapeHtml(app.ai.cleanText(recipe.steps))}</textarea>
            </div>
            <button data-action="save-recipe-manual" class="w-full bg-[#101618] text-white py-4 rounded-2xl font-bold uppercase text-[10px] mt-6">Guardar Libro</button>
        `);
    };

    const handleAction = (actionEl) => {
        const action = actionEl.dataset.action;
        if (action === 'open-recipe-modal') {
            openRecipeModal(actionEl.dataset.id || null);
            return true;
        }
        return false;
    };

    const handleInput = (actionEl) => {
        if (actionEl.dataset.action === 'search-library') {
            render();
            return true;
        }
        return false;
    };

    return {
        render,
        handleAction,
        handleInput,
        openRecipeModal
    };
}
