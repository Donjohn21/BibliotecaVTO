const User = require('../models/user');
const jwt = require('jsonwebtoken');  // Para crear tokens JWT

// Registrar un nuevo usuario
exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const user = new User({ username, password, email });
        await user.save();
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar el usuario', error: err });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Crear un JWT
        const token = jwt.sign({ userId: user._id }, 'mi_clave_secreta', { expiresIn: '1h' });
        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (err) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: err });
    }
};
