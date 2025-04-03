const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

exports.verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }
    req.usuarioId = decoded.id;
    req.rol = decoded.rol;
    next();
  });
};

exports.esAdmin = (req, res, next) => {
  if (req.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }
  next();
};