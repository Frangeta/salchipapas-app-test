import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function createAi(app) {
    const splitIngredients = (raw = '') => String(raw)
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

    return {
        async generateMenu(btn = null) {
            if (btn) { btn.disabled = true; btn.innerText = 'Pensando menú...'; }
            app.ui.setLoading(true, 'Generando menú semanal...');

            try {
                const source = document.getElementById('plannerSource')?.value || 'pantry';
                const customIngredients = splitIngredients(document.getElementById('plannerIngredients')?.value || '');
                const pantryIngredients = (app.state.shopping || []).map((item) => item.name).slice(0, 30);
                const ingredients = source === 'custom' ? customIngredients : pantryIngredients;

                if (!ingredients.length) {
                    throw new Error(source === 'custom'
                        ? 'Añade ingredientes manuales para generar el menú.'
                        : 'Tu despensa está vacía. Añade ingredientes en Compra.');
                }

                const data = await app.api.generateAiRecipes(ingredients);

                let start = new Date();
                start.setDate(start.getDate() + (1 + 7 - start.getDay()) % 7);

                const meals = data.comidas || [];
                const dinners = data.cenas || [];
                const plan = Array.from({ length: 7 }, (_, i) => {
                    const currentDate = new Date(start);
                    currentDate.setDate(start.getDate() + i);
                    return {
                        date: currentDate.toISOString().split('T')[0],
                        c: meals[i]?.plato || '',
                        d: dinners[i]?.plato || ''
                    };
                });

                this.renderAiResults(plan);
            } catch (e) {
                app.ui.toast('Error IA: ' + e.message, { type: 'error' });
            } finally {
                app.ui.setLoading(false);
                if (btn) { btn.disabled = false; btn.innerText = '✨ Generar Menú Semanal'; }
            }
        },

        renderAiResults(plan) {
            const res = document.getElementById('plannerResults');
            if (!res) return;
            const escapeAttr = (value) => String(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            res.innerHTML = plan.map(d => `
                <div class="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
                    <h4 class="font-bold mb-3 text-xs text-primary uppercase">${d.date}</h4>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-2xl text-xs"><span>☀️ ${d.c}</span><button data-action="ai-accept" data-date="${d.date}" data-type="c" data-value="${escapeAttr(d.c)}" class="bg-white size-8 rounded-xl border flex items-center justify-center">✓</button></div>
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-2xl text-xs"><span>🌙 ${d.d}</span><button data-action="ai-accept" data-date="${d.date}" data-type="d" data-value="${escapeAttr(d.d)}" class="bg-white size-8 rounded-xl border flex items-center justify-center">✓</button></div>
                    </div>
                </div>`).join('');
        },

        async accept(date, type, val, btn) {
            if (!app.state.menu[date]) app.state.menu[date] = { c: '', d: '' };
            app.state.menu[date][type] = val;
            await app.api.saveCalendar(app.state.menu);
            btn.innerHTML = '✓'; btn.classList.add('bg-success', 'text-white');
        },

        async proposeRecipe(dishName) {
            if (!dishName) return;
            const config = app.state.config || DEFAULT_CONFIG;
            app.ui.toast(`La receta IA para "${dishName}" se migrará al backend en próxima fase.`, { type: 'info' });
            return config;
        },

        cleanText(val) {
            if (!val) return '';
            if (typeof val === 'string') return val;
            if (Array.isArray(val)) return val.join('\n');
            return String(val);
        }
    };
}
