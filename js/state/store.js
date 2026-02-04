const initialState = {
    menu: {},
    shopping: [],
    dictionary: {},
    library: [],
    config: null
};

let state = { ...initialState };

export function getState() {
    return state;
}

export function setState(patch) {
    if (patch && typeof patch === 'object') {
        Object.assign(state, patch);
    }
    return state;
}
