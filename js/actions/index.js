export function createActions(app, { firebase }) {
    return {
        confirmSaveAiRecipe(name) {
            const recipe = window._currentAiRecipe;
            if (!recipe) return;
            const defCat = app.state.config.categories.recipe[0]?.name || 'Sin Sección';

            const exists = app.state.library.find(x => x.name.toLowerCase() === name.toLowerCase());
            if (exists) { if (confirm("¿Sobreescribir?")) Object.assign(exists, recipe); else return; }
            else { app.state.library.push({ id: Date.now().toString(), name, section: defCat, ...recipe }); }
            app.save(); app.ui.closeModal(); delete window._currentAiRecipe;
        },
        saveRecipeManual() {
            const id = document.getElementById('libId')?.value || Date.now().toString();
            const name = document.getElementById('libName').value;
            const recipe = {
                id, name,
                section: document.getElementById('libSec').value,
                ing: document.getElementById('libIng').value,
                steps: document.getElementById('libSteps').value,
                tip: ''
            };
            const idx = app.state.library.findIndex(r => r.id == id);
            if (idx > -1) app.state.library[idx] = recipe;
            else app.state.library.push(recipe);
            app.save(); app.ui.closeModal();
        },
        deleteRecipe(id) {
            if (confirm("¿Borrar?")) {
                app.state.library = app.state.library.filter(r => r.id != id);
                app.save();
                app.ui.closeModal();
            }
        },

        async saveConfig() {
            const adults = document.getElementById('cfgAdults').value;
            const kids = document.getElementById('cfgKids').value;
            const notes = document.getElementById('cfgNotes').value;
            const apiKey = document.getElementById('cfgApiKey').value;
            const accessCode = document.getElementById('cfgAccessCode')?.value?.trim();

            app.state.config.family = { adults, kids, notes };

            if (apiKey && apiKey !== app.aiKey) {
                firebase.saveAiKey(apiKey);
                app.aiKey = apiKey;
            }

            if (accessCode) {
                const accessCodeHash = await app.auth.hashAccessCode(accessCode);
                await firebase.saveAccessCodeHash(accessCodeHash);
                app.accessCodeHash = accessCodeHash;
            }

            app.save();
            alert("Configuración guardada");
        },
        addCategory(type) {
            const name = prompt("Nombre de la nueva categoría:");
            if (!name) return;
            const icon = prompt("Nombre del icono Material Symbol (ej: restaurant, home, pets):", "circle");
            const newCat = { id: Date.now().toString(), name, icon: icon || 'circle' };

            if (type === 'shop') app.state.config.categories.shop.push(newCat);
            if (type === 'recipe') app.state.config.categories.recipe.push(newCat);

            app.save();
        },
        deleteCategory(type, id) {
            if (!confirm("¿Borrar categoría? Los elementos asociados no se borrarán, pero perderán su icono.")) return;
            if (type === 'shop') app.state.config.categories.shop = app.state.config.categories.shop.filter(c => c.id !== id);
            if (type === 'recipe') app.state.config.categories.recipe = app.state.config.categories.recipe.filter(c => c.id !== id);
            app.save();
        },
        editCategoryIcon(type, id) {
            const catList = type === 'shop' ? app.state.config.categories.shop : app.state.config.categories.recipe;
            const cat = catList.find(c => c.id === id);
            if (!cat) return;

            const icons = [
                'shopping_cart', 'restaurant', 'local_cafe', 'bakery_dining', 'set_meal',
                'egg', 'kebab_dining', 'soup_kitchen', 'water_drop', 'celebration',
                'cleaning_services', 'pets', 'medical_services', 'inventory_2', 'icecream',
                'spa', 'checkroom', 'local_florist', 'kitchen', 'nutrition'
            ];

            let html = `<h3 class="font-bold text-center mb-4">Selecciona Icono para "${cat.name}"</h3><div class="icon-grid">`;
            html += icons.map(ic => `<div class="icon-option" data-action="save-icon" data-type="${type}" data-id="${id}" data-icon="${ic}"><span class="material-symbols-outlined">${ic}</span></div>`).join('');
            html += `</div>`;
            app.ui.openModal(html);
        },
        saveIcon(type, id, icon) {
            const catList = type === 'shop' ? app.state.config.categories.shop : app.state.config.categories.recipe;
            const cat = catList.find(c => c.id === id);
            if (cat) cat.icon = icon;
            app.save();
            app.ui.closeModal();
            app.components.config();
        }
    };
}
