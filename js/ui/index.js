import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function createUi(app) {
    return {
        switchTab(id) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active', 'text-primary'));
            document.getElementById(id).classList.add('active');
            document.querySelector(`[data-tab="${id}"]`).classList.add('active', 'text-primary');
            if (id === 'planner') {
                document.getElementById('planner').innerHTML = `<h2 class="text-2xl font-bold mb-6">IA Planner</h2><button id="btnAiGen" onclick="FamilyApp.ai.generateMenu()" class="bg-primary text-white w-full py-4 rounded-3xl font-bold shadow-lg">✨ Generar Menú Semanal</button><div id="plannerResults" class="mt-8 pb-20"></div>`;
            }
            app.render();
        },
        openRecipeModal(id = null) {
            const r = id ? app.state.library.find(x => x.id == id) : {name:'', section:'Sin Sección', ing:'', steps:''};

            const cats = app.state.config.categories.recipe || DEFAULT_CONFIG.categories.recipe;
            const catOptions = cats.map(c =>
                `<option ${r.section === c.name ? 'selected' : ''}>${c.name}</option>`
            ).join('');

            app.ui.openModal(`
                <div class="flex justify-between items-center mb-6"><h3 class="font-bold text-primary text-[10px] uppercase">${id ? 'Editar' : 'Nueva'}</h3><div class="flex gap-4">
                <button onclick="FamilyApp.ai.proposeRecipe(document.getElementById('libName').value)" class="material-symbols-outlined text-primary">auto_awesome</button>
                ${id ? `<button onclick="FamilyApp.actions.deleteRecipe('${id}')" class="material-symbols-outlined text-red-400">delete</button>` : ''}</div></div>
                <input type="hidden" id="libId" value="${id || ''}">
                <div class="space-y-4">
                    <input type="text" id="libName" value="${r.name || ''}" placeholder="Nombre" class="w-full rounded-2xl border-none bg-gray-50 p-4 font-bold text-sm">
                    <select id="libSec" class="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs">
                        ${catOptions}
                        <option>Sin Sección</option>
                    </select>
                    <textarea id="libIng" placeholder="Ingredientes" class="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs h-32 leading-relaxed">${app.ai.cleanText(r.ing)}</textarea>
                    <textarea id="libSteps" placeholder="Preparación" class="w-full rounded-2xl border-none bg-gray-50 p-4 text-xs h-32 leading-relaxed">${app.ai.cleanText(r.steps)}</textarea>
                </div>
                <button onclick="FamilyApp.actions.saveRecipeManual()" class="w-full bg-[#101618] text-white py-4 rounded-2xl font-bold uppercase text-[10px] mt-6">Guardar Libro</button>
            `);
        },
        openMenuModal(ds) {
            const m = app.state.menu[ds] || {c:'', d:''};
            const getR = (name) => name ? app.state.library.find(r => r.name.toLowerCase() === name.toLowerCase()) : null;
            const drawLink = (name) => {
                const r = getR(name);
                if (r) return `<div class="mt-2 p-3 bg-amber-50 rounded-xl text-[10px] border border-amber-100 cursor-pointer" onclick="FamilyApp.ui.openRecipeModal('${r.id}')"><p class="font-bold text-amber-800">📖 Ver Receta Familiar</p></div>`;
                if (name) return `<button onclick="FamilyApp.ai.proposeRecipe('${name.replace(/'/g, "")}')" class="text-[10px] text-primary mt-2 font-bold uppercase">✨ Generar Receta</button>`;
                return '';
            };
            app.ui.openModal(`
                <h3 class="font-bold text-center text-primary mb-6 text-[10px] uppercase">${ds}</h3>
                <div class="space-y-6">
                    <div><label class="text-[9px] font-bold text-gray-400 ml-2 uppercase">Comida</label><div class="flex gap-2"><input type="text" id="mC" value="${m.c}" class="flex-grow rounded-2xl bg-gray-50 p-4 text-sm"><button onclick="FamilyApp.actions.addItem(null, document.getElementById('mC').value, this)" class="bg-primary/10 text-primary p-3 rounded-xl material-symbols-outlined">shopping_cart</button></div>${drawLink(m.c)}</div>
                    <div><label class="text-[9px] font-bold text-gray-400 ml-2 uppercase">Cena</label><div class="flex gap-2"><input type="text" id="mD" value="${m.d}" class="flex-grow rounded-2xl bg-gray-50 p-4 text-sm"><button onclick="FamilyApp.actions.addItem(null, document.getElementById('mD').value, this)" class="bg-primary/10 text-primary p-3 rounded-xl material-symbols-outlined">shopping_cart</button></div>${drawLink(m.d)}</div>
                </div>
                <button onclick="FamilyApp.state.menu['${ds}']={c:document.getElementById('mC').value, d:document.getElementById('mD').value}; FamilyApp.save(); FamilyApp.ui.closeModal()" class="w-full bg-[#101618] text-white py-4 rounded-2xl font-bold mt-8 uppercase text-[10px]">Actualizar Menú</button>
            `);
        },
        openCategoryModal(id, name) {
            const catsList = app.state.config.categories.shop || DEFAULT_CONFIG.categories.shop;
            const cats = catsList.map(c => c.name);
            app.ui.openModal(`<h3 class="text-center mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pasillo para "${name}"</h3><div class="grid grid-cols-2 gap-2">${cats.map(c => `<button onclick="FamilyApp.actions.learnCategory('${id}', '${c}')" class="p-3 bg-gray-50 rounded-xl text-xs font-bold text-left border border-gray-100">${c}</button>`).join('')}</div>`);
        },
        drawCalendar(tid) {
            const g = document.getElementById(tid); if (!g) return;
            g.innerHTML = '';
            const y = app.currentMonth.getFullYear(), m = app.currentMonth.getMonth();
            const first = (new Date(y, m, 1).getDay() + 6) % 7;
            for (let i = 0; i < first; i++) g.innerHTML += '<div></div>';
            for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) {
                const ds = `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const hasMenu = app.state.menu[ds] && (app.state.menu[ds].c || app.state.menu[ds].d);
                const c = document.createElement('div'); c.className = 'day-cell bg-white';
                c.innerHTML = `<span>${d}</span>${hasMenu ? '<div class="dot-menu"></div>' : ''}`;
                c.onclick = () => app.ui.openMenuModal(ds); g.appendChild(c);
            }
        },
        openModal(h) {
            document.getElementById('modalContent').innerHTML = h;
            document.getElementById('modalOverlay').classList.remove('hidden');
        },
        closeModal() {
            document.getElementById('modalOverlay').classList.add('hidden');
        }
    };
}
