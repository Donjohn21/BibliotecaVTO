const { User, Role, Loan, Reservation } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Role, as: 'role' },
        {
          model: Loan,
          as: 'loans',
          include: [{ model: Book, as: 'book' }]
        },
        {
          model: Reservation,
          as: 'reservations',
          include: [{ model: Book, as: 'book' }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, roleId } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verificar si el rol existe
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Role not found' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId
    });

    // Excluir password de la respuesta
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password, roleId, status } = req.body;

    // Verificar si el nuevo rol existe
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Role not found' });
      }
    }

    // Actualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (status) user.status = status;
    if (roleId) user.roleId = roleId;

    // Actualizar contraseña si se proporciona
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Excluir password de la respuesta
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificar si el usuario tiene préstamos activos
    const activeLoans = await Loan.count({
      where: { userId: user.id, status: 'active' }
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        message: 'Cannot delete user with active loans'
      });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      where: { userId: req.params.id },
      include: [{ model: Book, as: 'book' }],
      order: [['loanDate', 'DESC']]
    });
    res.json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { userId: req.params.id },
      include: [{ model: Book, as: 'book' }],
      order: [['reservationDate', 'DESC']]
    });
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};