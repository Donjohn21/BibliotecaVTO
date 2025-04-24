document.addEventListener('DOMContentLoaded', () => {
    const availableBooks = [
        { id: 1, title: "Cien años de soledad", genre: "Realismo mágico", author: "Gabriel García Márquez" },
        { id: 2, title: "El principito", genre: "Fábula", author: "Antoine de Saint-Exupéry" },
        { id: 3, title: "Don Quijote de la Mancha", genre: "Novela", author: "Miguel de Cervantes" }
    ];

    const MAX_RESERVATIONS = 3;
    const MAX_LOANS = 3;

    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const history = JSON.parse(localStorage.getItem('loanHistory')) || [];

    const getEl = id => document.getElementById(id);
    const availableBooksList = getEl('available-books');
    const reservedBooksList = getEl('reserved-books');
    const notificationsList = getEl('notifications');
    const loanedBooksList = getEl('loaned-books');
    const recommendationList = getEl('recommendation-list');
    const searchInput = getEl('search-book');
    const searchBtn = getEl('search-btn');
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebarBtn = getEl('toggle-sidebar-btn');
    const sections = document.querySelectorAll('.section');
    const sidebarLinks = document.querySelectorAll('.sidebar a');

    // Navegación
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-closed');
    });

    sidebarLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const sectionId = e.target.dataset.section;
            sections.forEach(sec => sec.classList.add('hidden'));
            getEl(sectionId).classList.remove('hidden');
        });
    });

    // Render Functions
    function renderBooks(filter = "") {
        availableBooksList.innerHTML = "";
        const filtered = availableBooks.filter(book =>
            !reservations.some(res => res.id === book.id) &&
            !loans.some(loan => loan.id === book.id) &&
            book.title.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            availableBooksList.innerHTML = "<li>No hay libros disponibles.</li>";
            return;
        }

        filtered.forEach(book => {
            const li = document.createElement('li');
            li.innerHTML = `${book.title} <button class="reserve-btn" data-id="${book.id}">Reservar</button>`;
            availableBooksList.appendChild(li);
        });
    }

    function renderReservations() {
        reservedBooksList.innerHTML = "";
        reservations.forEach(book => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${book.title}
                <button class="cancel-btn" data-id="${book.id}">Cancelar</button>
                <button class="loan-btn" data-id="${book.id}">Prestar</button>`;
            reservedBooksList.appendChild(li);
        });
    }

    function renderLoans() {
        loanedBooksList.innerHTML = "";
        loans.forEach(book => {
            const li = document.createElement('li');
            li.innerHTML = `${book.title} <button class="return-btn" data-id="${book.id}">Devolver</button>`;
            loanedBooksList.appendChild(li);
        });
    }

    function renderNotifications() {
        notificationsList.innerHTML = "";
        notifications.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note;
            notificationsList.appendChild(li);
        });
    }

    function renderRecommendations() {
        recommendationList.innerHTML = "";
        const userGenres = history.map(h => h.genre);
        const uniqueGenres = [...new Set(userGenres)];
        const suggested = availableBooks.filter(book =>
            uniqueGenres.includes(book.genre) && !history.some(h => h.id === book.id)
        );

        if (suggested.length === 0) {
            recommendationList.innerHTML = "<li>No hay sugerencias por ahora.</li>";
            return;
        }

        suggested.forEach(book => {
            const li = document.createElement('li');
            li.textContent = `${book.title} (${book.genre})`;
            recommendationList.appendChild(li);
        });
    }

    // Acciones
    availableBooksList.addEventListener('click', e => {
        if (!e.target.classList.contains('reserve-btn')) return;
        const bookId = parseInt(e.target.dataset.id);
        const book = availableBooks.find(b => b.id === bookId);

        if (reservations.length >= MAX_RESERVATIONS) {
            alert(`Máximo de reservas alcanzado (${MAX_RESERVATIONS}).`);
            return;
        }

        reservations.push(book);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        renderBooks();
        renderReservations();
    });

    reservedBooksList.addEventListener('click', e => {
        const bookId = parseInt(e.target.dataset.id);
        const book = reservations.find(b => b.id === bookId);

        if (e.target.classList.contains('cancel-btn')) {
            reservations.splice(reservations.indexOf(book), 1);
            notifications.push(`El libro "${book.title}" ha sido liberado.`);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            localStorage.setItem('notifications', JSON.stringify(notifications));
        } else if (e.target.classList.contains('loan-btn')) {
            if (loans.length >= MAX_LOANS) {
                alert(`Máximo de préstamos alcanzado (${MAX_LOANS}).`);
                return;
            }

            loans.push(book);
            history.push(book);
            reservations.splice(reservations.indexOf(book), 1);
            localStorage.setItem('loans', JSON.stringify(loans));
            localStorage.setItem('reservations', JSON.stringify(reservations));
            localStorage.setItem('loanHistory', JSON.stringify(history));
        }

        renderBooks();
        renderReservations();
        renderLoans();
        renderNotifications();
        renderRecommendations();
    });

    loanedBooksList.addEventListener('click', e => {
        if (!e.target.classList.contains('return-btn')) return;
        const bookId = parseInt(e.target.dataset.id);
        const index = loans.findIndex(b => b.id === bookId);
        loans.splice(index, 1);
        localStorage.setItem('loans', JSON.stringify(loans));
        renderBooks();
        renderLoans();
    });

    searchBtn.addEventListener('click', () => {
        const filter = searchInput.value.trim();
        renderBooks(filter);
    });

    // Inicialización
    renderBooks();
    renderReservations();
    renderNotifications();
    renderLoans();
    renderRecommendations();
});

function toggleDarkMode() {
    const body = document.body;
    const toggleBtn = document.querySelector('.toggle-mode');

    // Alternar clase de modo oscuro
    body.classList.toggle('dark-mode');

    // Cambiar el ícono dependiendo del modo
    if (body.classList.contains('dark-mode')) {
        toggleBtn.textContent = '☀️'; // modo oscuro activo -> mostrar ícono de sol
    } else {
        toggleBtn.textContent = '🌙'; // modo claro activo -> mostrar ícono de luna
    }
}


