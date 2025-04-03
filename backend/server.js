const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('./middleware/auth');
const roleMiddleware = require('./middleware/roles');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'YMt123@!',
  database: 'biblioteca',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Validación básica
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    // Verificar si el usuario ya existe
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'El usuario o email ya está registrado' });
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario (por defecto como 'user')
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, role_id) VALUES (?, ?, ?, (SELECT id FROM roles WHERE name = ?))',
      [username, hashedPassword, email, 'user']
    );
    
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el usuario', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario
    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE username = ?`, 
      [username]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    
    const user = users[0];
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role_name }, 
      'mi_clave_secreta', 
      { expiresIn: '1h' }
    );
    
    // No devolver la contraseña
    delete user.password;
    
    res.status(200).json({ 
      message: 'Inicio de sesión exitoso', 
      token,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});

// Ruta protegida de ejemplo
app.get('/api/books', authMiddleware, async (req, res) => {
  try {
    const [books] = await pool.query('SELECT * FROM books');
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener libros', error: err.message });
  }
});

// Ruta solo para administradores
app.post('/api/books', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { title, author, isbn, quantity } = req.body;
    const [result] = await pool.query(
      'INSERT INTO books (title, author, isbn, quantity, available) VALUES (?, ?, ?, ?, ?)',
      [title, author, isbn, quantity, quantity]
    );
    res.status(201).json({ message: 'Libro agregado con éxito', bookId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al agregar libro', error: err.message });
  }
});

// Más rutas para préstamos, usuarios, etc...

app.listen(port, () => {
  console.log(`Servidor en el puerto ${port}`);
});