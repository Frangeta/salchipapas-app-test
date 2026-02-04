import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';
import { set } from '../services/firebase.js';

export function createActions(app, { aiKeyRef }) {
    return {
        addItem(inputId, manualValue = null, btn = null) {
            const el = document.getElementById(inputId);
            const val = manualValue || (el ? el.value.trim() : '');
            if (!val) return;

            const shopCats = app.state.config.categories.shop || DEFAULT_CONFIG.categories.shop;

            let foundCatId = null;
            for (const [catName, words] of Object.entries(app.state.dictionary)) {
                if (words.some(w => val.toLowerCase().includes(w))) {
                    const catObj = shopCats.find(c => c.name === catName);
                    if (catObj) foundCatId = catObj.name;
                    break;
                }
            }

            if (!app.state.shopping) app.state.shopping = [];
            app.state.shopping.push({ id: Date.now().toString(), name: val, checked: false, category: foundCatId || 'Otros' });

            if (manualValue && btn) { btn.innerText = 'done'; btn.classList.add('bg-success', 'text-white'); }
            if (!manualValue && el) el.value = '';
            app.save();
        },

        toggleShop(id) {
            const item = app.state.shopping.find(i => i.id == id);
            if (item) { item.checked = !item.checked; app.save(); }
        },
        learnCategory(itemId, newCatName) {
            const item = app.state.shopping.find(i => i.id == itemId);
            if (!item) return;
            item.category = newCatName;

            if (!app.state.dictionary[newCatName]) app.state.dictionary[newCatName] = [];
            const word = item.name.toLowerCase();
            if (!app.state.dictionary[newCatName].includes(word)) app.state.dictionary[newCatName].push(word);

            app.save(); app.ui.closeModal();
        },
        clearDone() {
            if (confirm("¿Borrar comprados?")) { app.state.shopping = app.state.shopping.filter(i => !i.checked); app.save(); }
        },

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

        saveConfig() {
            const adults = document.getElementById('cfgAdults').value;
            const kids = document.getElementById('cfgKids').value;
            const notes = document.getElementById('cfgNotes').value;
            const promptMenu = document.getElementById('cfgPromptMenu').value;
            const promptRecipe = document.getElementById('cfgPromptRecipe').value;
            const apiKey = document.getElementById('cfgApiKey').value;

            app.state.config.family = { adults, kids, notes };
            app.state.config.prompts = { menu: promptMenu, recipe: promptRecipe };

            if (apiKey && apiKey !== app.aiKey) {
                set(aiKeyRef, apiKey);
                app.aiKey = apiKey;
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
