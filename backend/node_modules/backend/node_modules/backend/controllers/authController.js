const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // <-- ¡Esta línea es crucial!
const Usuario = require('../models/Usuario');
const { jwtSecret } = require('../config');

exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const usuarioExistente = await Usuario.findOne({ email });
    
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    const usuario = new Usuario({ nombre, email, password });
    await usuario.save();
    
    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    
    if (!esPasswordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};