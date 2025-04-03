document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }
        
        // Guardar token y datos de usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirigir según el rol
        switch(data.user.role_name) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'librarian':
                window.location.href = 'librarian-dashboard.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    } catch (err) {
        alert(err.message);
        console.error('Error:', err);
    }
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const newUsername = document.getElementById('new-username').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!newUsername || !newPassword || !email) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username: newUsername, 
                password: newPassword, 
                email 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar');
        }
        
        alert('Registro exitoso, ahora puedes iniciar sesión');
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
    } catch (err) {
        alert(err.message);
        console.error('Error:', err);
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