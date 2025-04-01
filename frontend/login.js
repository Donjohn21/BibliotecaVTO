
document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = storedUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('username', username);
        window.location.href = 'index.html';
    } else {
        alert('Credenciales incorrectas');
    }
});

// Alternar entre Login y Registro
document.getElementById('register-link').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
});

document.getElementById('back-to-login').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
});

// Registro
document.getElementById('register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const newUsername = document.getElementById('new-username').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!newUsername || !newPassword || !email) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.username === newUsername)) {
        alert('El nombre de usuario ya está registrado.');
        return;
    }
    
    users.push({ username: newUsername, password: newPassword, email });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registro exitoso, ahora puedes iniciar sesión');
    
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
});
