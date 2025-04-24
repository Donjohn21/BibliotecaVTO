const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { check } = require('express-validator');
const { verifyToken } = require('../middleware/auth');  // Importación corregida
const { checkRole } = require('../middleware/role');    // Importación corregida

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get(
  '/',
  [verifyToken, checkRole(['admin'])],  // Uso directo de las funciones
  userController.getAllUsers
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin, Librarian)
router.get(
  '/:id',
  [verifyToken, checkRole(['admin', 'librarian'])],
  userController.getUserById
);

// @route   POST /api/users
// @desc    Create a user (Admin only)
// @access  Private (Admin)
router.post(
  '/',
  [
    verifyToken,
    checkRole(['admin']),
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('roleId', 'Role ID is required').not().isEmpty()
  ],
  userController.createUser
);

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private (Admin)
router.put(
  '/:id',
  [
    verifyToken,
    checkRole(['admin']),
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  userController.updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete(
  '/:id',
  [verifyToken, checkRole(['admin'])],
  userController.deleteUser
);

// @route   GET /api/users/:id/loans
// @desc    Get user loans
// @access  Private (Admin, Librarian, Owner)
router.get(
  '/:id/loans',
  [
    verifyToken,
    checkRole(['admin', 'librarian']),
    async (req, res, next) => {
      if (req.params.id !== req.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    }
  ],
  userController.getUserLoans
);

// @route   GET /api/users/:id/reservations
// @desc    Get user reservations
// @access  Private (Admin, Librarian, Owner)
router.get(
  '/:id/reservations',
  [
    verifyToken,
    checkRole(['admin', 'librarian']),
    async (req, res, next) => {
      if (req.params.id !== req.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    }
  ],
  userController.getUserReservations
);

module.exports = router;