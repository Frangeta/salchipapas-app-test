import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function createAi(app) {
    return {
        cleanText(val) {
            if (!val) return "";
            if (typeof val === 'string') return val;
            if (Array.isArray(val)) return val.map(v => this.cleanText(v)).join('\n');
            if (typeof val === 'object') return Object.entries(val).map(([k, v]) => `${k}: ${this.cleanText(v)}`).join('\n');
            return String(val);
        },
        safeJsonParse(str) {
            try {
                const cleanStr = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                return JSON.parse(cleanStr);
            } catch (e) {
                const match = str.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (match) {
                    const fixed = match[0].replace(/\n/g, "\\n").replace(/\r/g, "\\n");
                    return JSON.parse(fixed);
                }
                throw e;
            }
        },

        async generateMenu(btn = null) {
            if (!app.aiKey) {
                app.ui.toast("Falta API Key", { type: "error" });
                return;
            }
            if (btn) { btn.disabled = true; btn.innerText = "Pensando menú..."; }
            app.ui.setLoading(true, "Generando menú semanal...");

            let start = new Date();
            start.setDate(start.getDate() + (1 + 7 - start.getDay()) % 7);

            const config = app.state.config || DEFAULT_CONFIG;
            const fam = config.family || DEFAULT_CONFIG.family;
            const promptBase = (config.prompts && config.prompts.menu) ? config.prompts.menu : DEFAULT_CONFIG.prompts.menu;

            const context = `Familia de ${fam.adults} adultos y niños (${fam.kids}). Notas dietéticas: ${fam.notes}. Fecha inicio: ${start.toISOString().split('T')[0]}.`;
            const fullPrompt = `Actúa como nutricionista. ${context} ${promptBase}`;

            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${app.aiKey}` },
                    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: fullPrompt }], temperature: 0.6 })
                });
                if (!response.ok) throw new Error('No se pudo generar el menú IA');
                const data = await response.json();
                const plan = this.safeJsonParse(data.choices[0].message.content.match(/\[.*\]/s)[0]);
                this.renderAiResults(plan);
            } catch (e) {
                app.ui.toast("Error IA: " + e.message, { type: "error" });
            } finally {
                app.ui.setLoading(false);
                if (btn) { btn.disabled = false; btn.innerText = "✨ Generar Menú Semanal"; }
            }
        },

        renderAiResults(plan) {
            const res = document.getElementById('plannerResults');
            if (!res) return;
            const escapeAttr = (value) => String(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            res.innerHTML = plan.map(d => `
                <div class="bg-white p-4 rounded-3xl border mb-4 shadow-sm">
                    <p class="text-[10px] font-bold text-primary mb-3 uppercase tracking-widest">${d.date}</p>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-2xl text-xs"><span>☀️ ${d.c}</span><button data-action="ai-accept" data-date="${d.date}" data-type="c" data-value="${escapeAttr(d.c)}" class="bg-white size-8 rounded-xl border flex items-center justify-center">✓</button></div>
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-2xl text-xs"><span>🌙 ${d.d}</span><button data-action="ai-accept" data-date="${d.date}" data-type="d" data-value="${escapeAttr(d.d)}" class="bg-white size-8 rounded-xl border flex items-center justify-center">✓</button></div>
                    </div>
                </div>`).join('');
        },

        accept(date, type, val, btn) {
            if (!app.state.menu[date]) app.state.menu[date] = {c:'', d:''};
            app.state.menu[date][type] = val;
            app.save();
            btn.innerHTML = '✓'; btn.classList.add('bg-success', 'text-white');
        },

        async proposeRecipe(dishName) {
            if (!dishName) return;
            app.ui.openModal(`<div class="text-center py-10"><p class="text-sm text-gray-400 animate-pulse">Generando receta familiar para ${dishName}...</p></div>`);
            app.ui.setLoading(true, "Generando receta...");

            const config = app.state.config || DEFAULT_CONFIG;
            const fam = config.family || DEFAULT_CONFIG.family;
            const promptBase = (config.prompts && config.prompts.recipe) ? config.prompts.recipe : DEFAULT_CONFIG.prompts.recipe;

            const context = `Receta para "${dishName}" (Familia: ${fam.adults} adultos, niños ${fam.kids}).`;
            const fullPrompt = `${context} ${promptBase}`;

            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${app.aiKey}` },
                    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: fullPrompt }], temperature: 0.3 })
                });
                if (!response.ok) throw new Error('No se pudo generar la receta IA');
                const data = await response.json();
                const rawR = this.safeJsonParse(data.choices[0].message.content.match(/\{.*\}/s)[0]);
                const r = { ing: this.cleanText(rawR.ing), steps: this.cleanText(rawR.steps), tip: this.cleanText(rawR.tip) };
                app.pendingAiRecipe = r;
                app.ui.setLoading(false);
                app.ui.openModal(`
                    <h3 class="font-bold text-primary text-sm mb-4 uppercase">Receta Familiar</h3>
                    <div class="space-y-4 text-left overflow-y-auto max-h-96">
                        <p class="text-sm font-bold border-b pb-2">${dishName}</p>
                        <p class="text-xs text-gray-700 whitespace-pre-line leading-relaxed"><b>🛒 Ingredientes:</b>\n${r.ing}</p>
                        <p class="text-xs text-gray-600 whitespace-pre-line leading-relaxed"><b>👨‍🍳 Pasos:</b>\n${r.steps}</p>
                        <p class="text-[10px] italic text-primary bg-primary/5 p-3 rounded-xl"><b>💡 Tip:</b> ${r.tip}</p>
                    </div>
                    <button data-action="confirm-save-ai-recipe" data-name="${dishName.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" class="w-full bg-success text-white py-4 rounded-2xl font-bold uppercase text-[10px] mt-6">✓ Guardar en Libro</button>
                `);
            } catch (e) {
                app.ui.setLoading(false);
                console.error(e);
                app.ui.toast("Error de formato en la respuesta de la IA.", { type: "error" });
                app.ui.closeModal();
            }
        }
    };
}
