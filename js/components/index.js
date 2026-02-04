import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function createComponents(app) {
    const escapeAttr = (value) => String(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    return {
        menu() {
            let curr = new Date();
            let first = curr.getDate() - (curr.getDay() === 0 ? 6 : curr.getDay() - 1);
            let weekHtml = '';
            for (let i = 0; i < 7; i++) {
                let d = new Date(new Date().setDate(first + i));
                let ds = d.toISOString().split('T')[0];
                let m = app.state.menu[ds] || {c:'', d:''};
                weekHtml += `<div class="bg-white p-4 rounded-3xl border border-gray-100 mb-3 shadow-sm flex items-center gap-4">
                    <div class="w-10 text-center text-primary"><p class="text-[9px] font-bold uppercase">${new Intl.DateTimeFormat('es',{weekday:'short'}).format(d)}</p><p class="text-lg font-bold">${d.getDate()}</p></div>
                    <div class="flex-grow text-xs border-l pl-4 space-y-1">
                        <div class="truncate ${m.c ? 'text-gray-900 font-bold' : 'text-gray-300'}">☀️ ${m.c || '---'}</div>
                        <div class="truncate ${m.d ? 'text-gray-900 font-bold' : 'text-gray-300'}">🌙 ${m.d || '---'}</div>
                    </div>
                    <button data-action="open-menu-modal" data-date="${ds}" class="text-gray-300 material-symbols-outlined">edit_square</button>
                </div>`;
            }
            document.getElementById('menu').innerHTML = `<h2 class="text-2xl font-bold mb-6">Menú Semanal</h2>${weekHtml}<div class="bg-white rounded-[2.5rem] p-6 mt-8 border"><div class="calendar-grid" id="gridMenu"></div></div>`;
            app.ui.drawCalendar('gridMenu');
        },
        compra() {
            const items = app.state.shopping || [];
            const pending = items.filter(i => !i.checked);
            const done = items.filter(i => i.checked);

            const catsConfig = app.state.config.categories.shop || DEFAULT_CONFIG.categories.shop;
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
            document.getElementById('compra').innerHTML = html;
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
