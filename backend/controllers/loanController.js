const { Loan, Book, User } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const moment = require('moment');
const penaltyService = require('../services/penaltyService');

// Configuración de préstamos
const LOAN_DURATION_DAYS = 14;
const MAX_LOANS_PER_USER = 5;

exports.getAllLoans = async (req, res) => {
  try {
    const { status, userId, bookId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (bookId) where.bookId = bookId;

    const loans = await Loan.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author'] }
      ],
      order: [['loanDate', 'DESC']]
    });

    res.json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author'] }
      ]
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createLoan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookId, userId } = req.body;

    // Verificar si el usuario existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificar si el libro existe y está disponible
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No available copies of this book' });
    }

    // Verificar si el usuario ya tiene este libro prestado
    const existingLoan = await Loan.findOne({
      where: {
        userId,
        bookId,
        status: 'active'
      }
    });

    if (existingLoan) {
      return res.status(400).json({
        message: 'User already has this book on loan'
      });
    }

    // Verificar si el usuario tiene préstamos vencidos
    const overdueLoans = await Loan.count({
      where: {
        userId,
        status: 'overdue'
      }
    });

    if (overdueLoans > 0) {
      return res.status(400).json({
        message: 'User has overdue loans and cannot borrow more books'
      });
    }

    // Verificar el límite de préstamos por usuario
    const activeLoansCount = await Loan.count({
      where: {
        userId,
        status: 'active'
      }
    });

    if (activeLoansCount >= MAX_LOANS_PER_USER) {
      return res.status(400).json({
        message: `User has reached the maximum limit of ${MAX_LOANS_PER_USER} loans`
      });
    }

    // Verificar penalizaciones
    if (user.penaltyCount > 0) {
      const lastPenaltyDate = moment(user.lastPenaltyDate);
      const penaltyDuration = 7; // 7 días de penalización
      const penaltyEndDate = lastPenaltyDate.add(penaltyDuration, 'days');

      if (moment().isBefore(penaltyEndDate)) {
        return res.status(400).json({
          message: `User is under penalty until ${penaltyEndDate.format('YYYY-MM-DD')}`
        });
      }
    }

    // Crear el préstamo
    const loanDate = new Date();
    const dueDate = moment(loanDate).add(LOAN_DURATION_DAYS, 'days').toDate();

    const loan = await Loan.create({
      userId,
      bookId,
      loanDate,
      dueDate,
      status: 'active'
    });

    // Actualizar copias disponibles del libro
    await book.decrement('availableCopies');

    res.status(201).json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.returnLoan = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, {
      include: [
        { model: Book, as: 'book' },
        { model: User, as: 'user' }
      ]
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Loan already returned' });
    }

    // Verificar si hay multa por devolución tardía
    const returnDate = new Date();
    let penaltyAmount = 0;
    let penaltyApplied = false;

    if (moment(returnDate).isAfter(loan.dueDate)) {
      penaltyAmount = penaltyService.calculatePenalty(loan.dueDate, returnDate);
      penaltyApplied = true;
    }

    // Actualizar el préstamo
    await loan.update({
      returnDate,
      status: 'returned',
      penaltyAmount,
      penaltyPaid: penaltyAmount === 0
    });

    // Actualizar copias disponibles del libro
    await loan.book.increment('availableCopies');

    // Si se aplicó una multa, actualizar el contador de penalizaciones del usuario
    if (penaltyApplied) {
      await loan.user.update({
        penaltyCount: loan.user.penaltyCount + 1,
        lastPenaltyDate: returnDate
      });
    }

    res.json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.payPenalty = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.penaltyPaid) {
      return res.status(400).json({ message: 'Penalty already paid' });
    }

    if (loan.penaltyAmount <= 0) {
      return res.status(400).json({ message: 'No penalty to pay' });
    }

    await loan.update({ penaltyPaid: true });
    res.json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkOverdueLoans = async (req, res) => {
  try {
    const now = new Date();
    const overdueLoans = await Loan.findAll({
      where: {
        status: 'active',
        dueDate: { [Op.lt]: now }
      }
    });

    // Actualizar préstamos vencidos
    await Loan.update(
      { status: 'overdue' },
      {
        where: {
          id: { [Op.in]: overdueLoans.map(loan => loan.id) }
        }
      }
    );

    res.json({
      message: `Found and updated ${overdueLoans.length} overdue loans`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};