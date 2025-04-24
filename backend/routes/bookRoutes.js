const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { check } = require('express-validator');
const { verifyToken } = require('../middleware/auth');  // Cambiado de '../middleware' a '../middlewares'
const { checkRole } = require('../middleware/role');    // Cambiado de '../middleware' a '../middlewares'

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', bookController.getAllBooks);

// @route   GET /api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', bookController.getBookById);

// @route   POST /api/books
// @desc    Create a book
// @access  Private (Admin, Librarian)
router.post(
  '/',
  [
    verifyToken,  // Cambiado de auth.verifyToken
    checkRole(['admin', 'librarian']),  // Cambiado de role.checkRole
    check('title', 'Title is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty(),
    check('isbn', 'ISBN is required').not().isEmpty(),
    check('totalCopies', 'Total copies must be a positive number').isInt({ min: 1 })
  ],
  bookController.createBook
);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private (Admin, Librarian)
router.put(
  '/:id',
  [
    verifyToken,
    checkRole(['admin', 'librarian']),
    check('title', 'Title is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty()
  ],
  bookController.updateBook
);

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private (Admin, Librarian)
router.delete(
  '/:id',
  [verifyToken, checkRole(['admin', 'librarian'])],
  bookController.deleteBook
);

module.exports = router;