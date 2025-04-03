document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar si el usuario tiene permiso para esta página
    const allowedRoles = ['admin', 'librarian']; // Ajustar según la página
    
    if (!allowedRoles.includes(user.role_name)) {
        window.location.href = 'unauthorized.html';
    }
    
    // Mostrar información del usuario en la navbar
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        userInfoElement.textContent = `${user.username} (${user.role_name})`;
    }
    
    // Manejar logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
});