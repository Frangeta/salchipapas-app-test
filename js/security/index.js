export function createSecurity(app, pinRef, { set }) {
    return {
        checkPin() {
            const val = document.getElementById('pinInput').value;
            if (!app.remotePin && val) {
                set(pinRef, val);
                app.remotePin = val;
            }
            if (val === app.remotePin) {
                sessionStorage.setItem('unlocked', 'true');
                this.unlock();
            } else {
                alert("PIN Incorrecto");
            }
        },
        unlock() {
            document.getElementById('lock-screen').style.display = 'none';
            document.getElementById('app-content').style.display = 'block';
            app.render();
        },
        logout() {
            sessionStorage.removeItem('unlocked');
            location.reload();
        }
    };
}
