const jwt = require('jsonwebtoken');
const pool = require('../db');

module.exports = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, 'mi_clave_secreta');
    
    // Obtener usuario de la base de datos
    const [users] = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`, 
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Token no válido - usuario no encontrado' });
    }
    
    req.user = users[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token no válido', error: err.message });
  }
};