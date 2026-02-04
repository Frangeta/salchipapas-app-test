import { DEFAULT_CONFIG } from '../constants/defaultConfig.js';

export function ensureConfigIntegrity(state) {
    if (!state.config) {
        state.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    } else {
        if (!state.config.family) state.config.family = DEFAULT_CONFIG.family;
        if (!state.config.prompts) state.config.prompts = DEFAULT_CONFIG.prompts;
        if (!state.config.categories) state.config.categories = DEFAULT_CONFIG.categories;
        if (!state.config.categories.shop) state.config.categories.shop = DEFAULT_CONFIG.categories.shop;
        if (!state.config.categories.recipe) state.config.categories.recipe = DEFAULT_CONFIG.categories.recipe;
    }

    if (!state.library) state.library = [];
    if (!state.shopping) state.shopping = [];
    if (!state.dictionary) state.dictionary = {};
}
