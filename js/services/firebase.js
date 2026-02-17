import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = { databaseURL: "https://familyhub-f33f9-default-rtdb.europe-west1.firebasedatabase.app/" };

export function createFirebaseService() {
    // En algunos navegadores quedan stores de IndexedDB corruptos de versiones previas
    // (p.ej. firebase-heartbeat-store). Desactivamos automaticDataCollection para evitar
    // escrituras de heartbeat y reducimos estos errores de runtime (app/idb-set).
    const app = getApps().length
        ? getApp()
        : initializeApp(firebaseConfig, { automaticDataCollectionEnabled: false });
    const db = getDatabase(app);

    const rootRef = ref(db, 'family_v9');
    const calendarRef = ref(db, 'family_v9/calendar');
    const pantryRef = ref(db, 'family_v9/pantry');
    const authUsernameRef = ref(db, 'family_v9/config/authUsername');
    const authPasswordRef = ref(db, 'family_v9/config/authPassword');
    const legacyAccessCodeRef = ref(db, 'family_v9/config/accessCode');
    const legacyAuthAccessCodeRef = ref(db, 'family_v9/config/authAccessCode');

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
            const [username, password, legacyAccessCode, legacyAuthAccessCode] = await Promise.all([
                readValue(authUsernameRef, ''),
                readValue(authPasswordRef, ''),
                readValue(legacyAccessCodeRef, ''),
                readValue(legacyAuthAccessCodeRef, '')
            ]);

            const accessCode = legacyAccessCode || legacyAuthAccessCode;
            return { username, password, accessCode };
        }
    };
}
