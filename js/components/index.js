import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function createComponents(app) {
    return {
        menu() {
            app.calendarUi.renderMenuTab();
        },
        biblioteca() {
            const query = (document.getElementById('libSearch')?.value || '').toLowerCase();
            const recipes = (app.state.library || []).filter(r => r.name.toLowerCase().includes(query));

            const catsConfig = app.state.config.categories.recipe || DEFAULT_CONFIG.categories.recipe;
            const grouped = {};
            catsConfig.forEach(c => grouped[c.name] = { meta: c, items: [] });
            grouped['Sin Sección'] = { meta: {name:'Sin Sección', icon:'menu_book'}, items: [] };

            recipes.forEach(r => {
                const sec = r.section || 'Sin Sección';
                if (grouped[sec]) grouped[sec].items.push(r);
                else grouped['Sin Sección'].items.push(r);
            });

            let html = `<div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold">Libro</h2><button data-action="open-recipe-modal" class="bg-primary text-white size-10 rounded-full flex items-center justify-center material-symbols-outlined shadow-lg">add</button></div>
            <div class="mb-6 relative"><input type="text" id="libSearch" value="${query}" data-action="search-library" placeholder="Buscar..." class="w-full rounded-2xl border-none p-4 pl-12 text-sm bg-white shadow-sm"><span class="material-symbols-outlined absolute left-4 top-4 text-gray-300">search</span></div>`;

            Object.values(grouped).forEach(g => {
                if (g.items.length > 0) {
                    html += `<div class="mb-4"><h3 class="text-[10px] font-bold uppercase text-primary mb-2 ml-2 flex items-center gap-2"><span class="material-symbols-outlined text-sm">${g.meta.icon}</span> ${g.meta.name}</h3><div class="space-y-2">`;
                    html += g.items.map(r => `<div data-action="open-recipe-modal" data-id="${r.id}" class="bg-white p-4 rounded-3xl border shadow-sm flex justify-between items-center cursor-pointer"><div><p class="font-bold text-sm">${r.name}</p></div><span class="material-symbols-outlined text-gray-200">chevron_right</span></div>`).join('');
                    html += `</div></div>`;
                }
            });
            document.getElementById('biblioteca').innerHTML = html;
        },
        config() {
            const c = app.state.config || DEFAULT_CONFIG;

            const renderCatList = (type, list) => list.map(cat => `
                <div class="flex items-center justify-between bg-white p-3 rounded-xl border mb-2 text-xs">
                    <div class="flex items-center gap-3">
                        <button data-action="edit-category-icon" data-type="${type}" data-id="${cat.id}" class="size-8 bg-gray-50 rounded-full flex items-center justify-center border"><span class="material-symbols-outlined text-sm text-primary">${cat.icon}</span></button>
                        <span class="font-bold">${cat.name}</span>
                    </div>
                    <button data-action="delete-category" data-type="${type}" data-id="${cat.id}" class="text-red-300 material-symbols-outlined text-base">delete</button>
                </div>
            `).join('');

            const html = `
                <h2 class="text-2xl font-bold mb-6">Configuración</h2>

                <div class="space-y-6 pb-20">
                    <div class="bg-white p-5 rounded-[2rem] border shadow-sm">
                        <h3 class="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">👤 Perfil Familiar</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div><label class="text-[9px] font-bold">ADULTOS</label><input type="number" id="cfgAdults" value="${c.family.adults}" class="w-full rounded-xl bg-gray-50 border-none mt-1"></div>
                            <div><label class="text-[9px] font-bold">NIÑOS (Edades)</label><input type="text" id="cfgKids" value="${c.family.kids}" class="w-full rounded-xl bg-gray-50 border-none mt-1"></div>
                        </div>
                        <div><label class="text-[9px] font-bold">NOTAS / ALERGIAS</label><input type="text" id="cfgNotes" value="${c.family.notes}" class="w-full rounded-xl bg-gray-50 border-none mt-1 text-xs"></div>
                    </div>

                    <div class="bg-white p-5 rounded-[2rem] border shadow-sm">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xs font-bold uppercase text-gray-400 tracking-widest">🛒 Categorías Compra</h3>
                            <button data-action="add-category" data-type="shop" class="text-primary text-xs font-bold">+ AÑADIR</button>
                        </div>
                        <div class="max-h-48 overflow-y-auto">${renderCatList('shop', c.categories.shop)}</div>
                    </div>

                    <div class="bg-white p-5 rounded-[2rem] border shadow-sm">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xs font-bold uppercase text-gray-400 tracking-widest">📖 Categorías Libro</h3>
                            <button data-action="add-category" data-type="recipe" class="text-primary text-xs font-bold">+ AÑADIR</button>
                        </div>
                        <div class="max-h-48 overflow-y-auto">${renderCatList('recipe', c.categories.recipe)}</div>
                    </div>

                    <div class="bg-white p-5 rounded-[2rem] border shadow-sm">
                        <h3 class="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">🤖 Personalización IA</h3>
                        <div class="mb-4">
                            <label class="text-[9px] font-bold">PROMPT MENÚ</label>
                            <textarea id="cfgPromptMenu" class="w-full rounded-xl bg-gray-50 border-none mt-1 text-[10px] h-20">${c.prompts.menu}</textarea>
                        </div>
                        <div>
                            <label class="text-[9px] font-bold">PROMPT RECETA</label>
                            <textarea id="cfgPromptRecipe" class="w-full rounded-xl bg-gray-50 border-none mt-1 text-[10px] h-20">${c.prompts.recipe}</textarea>
                        </div>
                    </div>

                     <div class="bg-white p-5 rounded-[2rem] border shadow-sm">
                        <h3 class="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">🔐 Sistema</h3>
                        <label class="text-[9px] font-bold">API KEY (Groq)</label>
                        <input type="password" id="cfgApiKey" value="${app.aiKey || ''}" class="w-full rounded-xl bg-gray-50 border-none mt-1 text-xs mb-4">
                        <button data-action="save-config" class="w-full bg-[#101618] text-white py-4 rounded-xl font-bold uppercase text-xs">💾 Guardar Configuración</button>
                    </div>
                </div>
            `;
            document.getElementById('config').innerHTML = html;
        }
    };
}
