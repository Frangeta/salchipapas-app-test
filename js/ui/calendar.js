export function createCalendarUi(app) {
    const weekDayFormatter = new Intl.DateTimeFormat('es', { weekday: 'short' });

    const getMenuForDate = (dateStamp) => app.state.menu[dateStamp] || { c: '', d: '' };

    const getWeekDates = (currentDate = new Date()) => {
        const first = currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1);
        return Array.from({ length: 7 }, (_, i) => new Date(new Date().setDate(first + i)));
    };

    const renderWeekMenu = () => getWeekDates()
        .map((date) => {
            const dateStamp = date.toISOString().split('T')[0];
            const menu = getMenuForDate(dateStamp);
            return `<div class="bg-white p-4 rounded-3xl border border-gray-100 mb-3 shadow-sm flex items-center gap-4">
                <div class="w-10 text-center text-primary"><p class="text-[9px] font-bold uppercase">${weekDayFormatter.format(date)}</p><p class="text-lg font-bold">${date.getDate()}</p></div>
                <div class="flex-grow text-xs border-l pl-4 space-y-1">
                    <div class="truncate ${menu.c ? 'text-gray-900 font-bold' : 'text-gray-300'}">☀️ ${menu.c || '---'}</div>
                    <div class="truncate ${menu.d ? 'text-gray-900 font-bold' : 'text-gray-300'}">🌙 ${menu.d || '---'}</div>
                </div>
                <button data-action="open-menu-modal" data-date="${dateStamp}" class="text-gray-300 material-symbols-outlined">edit_square</button>
            </div>`;
        })
        .join('');

    const drawCalendar = (targetId) => {
        const grid = document.getElementById(targetId);
        if (!grid) return;
        grid.innerHTML = '';
        const year = app.currentMonth.getFullYear();
        const month = app.currentMonth.getMonth();
        const first = (new Date(year, month, 1).getDay() + 6) % 7;
        for (let i = 0; i < first; i++) grid.innerHTML += '<div></div>';
        for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
            const dateStamp = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasMenu = app.state.menu[dateStamp] && (app.state.menu[dateStamp].c || app.state.menu[dateStamp].d);
            const cell = document.createElement('div');
            cell.className = 'day-cell bg-white';
            cell.innerHTML = `<span>${day}</span>${hasMenu ? '<div class="dot-menu"></div>' : ''}`;
            cell.dataset.action = 'open-menu-modal';
            cell.dataset.date = dateStamp;
            grid.appendChild(cell);
        }
    };

    const renderMenuTab = () => {
        const weekHtml = renderWeekMenu();
        document.getElementById('menu').innerHTML = `<h2 class="text-2xl font-bold mb-6">Menú Semanal</h2>${weekHtml}<div class="bg-white rounded-[2.5rem] p-6 mt-8 border"><div class="calendar-grid" id="gridMenu"></div></div>`;
        drawCalendar('gridMenu');
    };

    const updateMenu = async (dateStamp) => {
        app.state.menu[dateStamp] = {
            c: document.getElementById('mC')?.value || '',
            d: document.getElementById('mD')?.value || ''
        };
        await app.api.saveCalendar(app.state.menu);
        app.ui.closeModal();
    };

    const handleAction = (actionEl) => {
        const action = actionEl.dataset.action;
        if (action === 'open-menu-modal') {
            app.ui.openMenuModal(actionEl.dataset.date);
            return true;
        }
        if (action === 'update-menu') {
            updateMenu(actionEl.dataset.date);
            return true;
        }
        return false;
    };

    return {
        renderMenuTab,
        handleAction
    };
}
