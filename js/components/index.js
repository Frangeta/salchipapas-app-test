import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function createComponents(app) {
    return {
        menu() {
            app.calendarUi.renderMenuTab();
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
                        <h3 class="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">🔐 Sistema</h3>
                        <p class="text-[10px] text-gray-500 mb-4">La autenticación y claves IA viven en el backend. Este frontend no almacena secretos.</p>
                        <button data-action="save-config" class="w-full bg-[#101618] text-white py-4 rounded-xl font-bold uppercase text-xs">💾 Guardar Configuración</button>
                    </div>
                </div>
            `;
            document.getElementById('config').innerHTML = html;
        }
    };
}
