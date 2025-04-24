const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { check } = require('express-validator');
const { verifyToken } = require('../middleware/auth');  // Importación destructurada
const { checkRole } = require('../middleware/role');    // Importación destructurada

// @route   GET /api/loans
// @desc    Get all loans
// @access  Private (Admin, Librarian)
router.get(
  '/',
  [verifyToken, checkRole(['admin', 'librarian'])],  // Uso directo de las funciones
  loanController.getAllLoans
);

// @route   GET /api/loans/:id
// @desc    Get loan by ID
// @access  Private (Admin, Librarian)
router.get(
  '/:id',
  [verifyToken, checkRole(['admin', 'librarian'])],
  loanController.getLoanById
);

// @route   POST /api/loans
// @desc    Create a loan
// @access  Private (Admin, Librarian)
router.post(
  '/',
  [
    verifyToken,
    checkRole(['admin', 'librarian']),
    check('bookId', 'Book ID is required').not().isEmpty(),
    check('userId', 'User ID is required').not().isEmpty()
  ],
  loanController.createLoan
);

// @route   PUT /api/loans/:id/return
// @desc    Return a loan
// @access  Private (Admin, Librarian)
router.put(
  '/:id/return',
  [verifyToken, checkRole(['admin', 'librarian'])],
  loanController.returnLoan
);

// @route   PUT /api/loans/:id/pay-penalty
// @desc    Pay loan penalty
// @access  Private (Admin, Librarian)
router.put(
  '/:id/pay-penalty',
  [verifyToken, checkRole(['admin', 'librarian'])],
  loanController.payPenalty
);

// @route   GET /api/loans/check-overdue
// @desc    Check for overdue loans
// @access  Private (Admin, Librarian)
router.get(
  '/check-overdue',
  [verifyToken, checkRole(['admin', 'librarian'])],
  loanController.checkOverdueLoans
);

module.exports = router;