import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://familyhub-f33f9-default-rtdb.europe-west1.firebasedatabase.app/" };

export function initFirebase() {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const cloudRef = ref(db, 'family_v9');
    const pinRef = ref(db, 'family_v9/config/accessPin');
    const aiKeyRef = ref(db, 'family_v9/config/aiApiKey');

    return { db, cloudRef, pinRef, aiKeyRef };
}

export { onValue, set, get };
