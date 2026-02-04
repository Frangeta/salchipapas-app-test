export const DEFAULT_CONFIG = {
    family: { adults: 2, kids: "9 y 13", notes: "Comida equilibrada" },
    prompts: {
        menu: "Crea menú de 7 días equilibrado. Responde SOLO un array JSON: [{\"date\":\"YYYY-MM-DD\",\"c\":\"Comida\",\"d\":\"Cena\"}]",
        recipe: "Genera una receta completa. Responde SOLO un objeto JSON: {\"ing\": \"...\", \"steps\": \"...\", \"tip\": \"...\"}. Usa \\n para saltos de línea."
    },
    categories: {
        shop: [
            {id: 'cat_s1', name: 'Frutería', icon: 'nutrition'},
            {id: 'cat_s2', name: 'Carnicería', icon: 'skillet'},
            {id: 'cat_s3', name: 'Pescadería', icon: 'set_meal'},
            {id: 'cat_s4', name: 'Lácteos', icon: 'egg'},
            {id: 'cat_s5', name: 'Panadería', icon: 'bakery_dining'},
            {id: 'cat_s6', name: 'Limpieza', icon: 'cleaning_services'},
            {id: 'cat_s7', name: 'Bebidas', icon: 'water_drop'},
            {id: 'cat_s8', name: 'Otros', icon: 'package_2'}
        ],
        recipe: [
            {id: 'cat_r1', name: 'Entrantes', icon: 'tapas'},
            {id: 'cat_r2', name: 'Pasta', icon: 'ramen_dining'},
            {id: 'cat_r3', name: 'Carnes', icon: 'kebab_dining'},
            {id: 'cat_r4', name: 'Pescados', icon: 'sailing'},
            {id: 'cat_r5', name: 'Postres', icon: 'icecream'},
            {id: 'cat_r6', name: 'Sin Sección', icon: 'menu_book'}
        ]
    }
};
