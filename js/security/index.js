export function createSecurity(app, firebase) {
    return {
        checkPin() {
            const val = document.getElementById('pinInput').value;
            if (!app.remotePin && val) {
                firebase.savePin(val);
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
