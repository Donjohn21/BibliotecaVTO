const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  // Obtener el token del header
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Agregar usuario a la solicitud
    req.user = { id: decoded.id };
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};