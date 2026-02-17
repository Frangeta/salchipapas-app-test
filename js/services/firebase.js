import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { databaseURL: "https://familyhub-f33f9-default-rtdb.europe-west1.firebasedatabase.app/" };

export function createFirebaseService() {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const rootRef = ref(db, 'family_v9');
    const calendarRef = ref(db, 'family_v9/calendar');
    const pantryRef = ref(db, 'family_v9/pantry');
    const authUsernameRef = ref(db, 'family_v9/config/authUsername');
    const authPasswordRef = ref(db, 'family_v9/config/authPassword');

    const readValue = async (valueRef, fallback = null) => {
        const snapshot = await get(valueRef);
        return snapshot.exists() ? snapshot.val() : fallback;
    };

    return {
        async loadRoot() {
            return readValue(rootRef, {});
        },
        async loadCalendar() {
            return readValue(calendarRef, {});
        },
        async saveCalendar(calendar) {
            await set(calendarRef, calendar || {});
        },
        async loadPantry() {
            return readValue(pantryRef, []);
        },
        async savePantry(pantry) {
            await set(pantryRef, pantry || []);
        },
        async loadCredentials() {
            const [username, password] = await Promise.all([
                readValue(authUsernameRef, ''),
                readValue(authPasswordRef, '')
            ]);
            return { username, password };
        }
    };
}
