const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { check } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// @route   GET /api/reservations
// @desc    Get all reservations
// @access  Private (Admin, Librarian)
router.get(
  '/',
  [verifyToken, checkRole(['admin', 'librarian'])],
  reservationController.getAllReservations
);

// @route   GET /api/reservations/:id
// @desc    Get reservation by ID
// @access  Private (Admin, Librarian)
router.get(
  '/:id',
  [verifyToken, checkRole(['admin', 'librarian'])],
  reservationController.getReservationById
);

// @route   POST /api/reservations
// @desc    Create a reservation
// @access  Private
router.post(
  '/',
  [
    verifyToken,
    check('bookId', 'Book ID is required').not().isEmpty()
  ],
  reservationController.createReservation
);

// @route   PUT /api/reservations/:id/cancel
// @desc    Cancel a reservation
// @access  Private
router.put(
  '/:id/cancel',
  verifyToken,
  reservationController.cancelReservation
);

// @route   GET /api/reservations/check-expired
// @desc    Check for expired reservations
// @access  Private (Admin, Librarian)
router.get(
  '/check-expired',
  [verifyToken, checkRole(['admin', 'librarian'])],
  reservationController.checkExpiredReservations
);

// @route   GET /api/reservations/check-available
// @desc    Check for available reservations
// @access  Private (Admin, Librarian)
router.get(
  '/check-available',
  [verifyToken, checkRole(['admin', 'librarian'])],
  reservationController.checkAvailableReservations
);

module.exports = router;