import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://familyhub-f33f9-default-rtdb.europe-west1.firebasedatabase.app/" };

export function createFirebaseService() {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const cloudRef = ref(db, 'family_v9');
    const pinRef = ref(db, 'family_v9/config/accessPin');
    const aiKeyRef = ref(db, 'family_v9/config/aiApiKey');

    const loadInitial = async () => {
        const [pinSnap, keySnap] = await Promise.all([get(pinRef), get(aiKeyRef)]);
        return {
            pin: pinSnap.exists() ? pinSnap.val() : null,
            aiKey: keySnap.exists() ? keySnap.val() : null
        };
    };

    const subscribe = (callback) => onValue(cloudRef, callback);
    const saveState = (state) => set(cloudRef, state);
    const savePin = (pin) => set(pinRef, pin);
    const saveAiKey = (key) => set(aiKeyRef, key);

    return {
        loadInitial,
        subscribe,
        saveState,
        savePin,
        saveAiKey
    };
}
