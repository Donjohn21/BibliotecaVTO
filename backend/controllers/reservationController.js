const { Reservation, Book, User, Loan } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const moment = require('moment');
const notificationService = require('../services/notificationService');

// Configuración de reservas
const RESERVATION_DURATION_DAYS = 7;
const MAX_RESERVATIONS_PER_USER = 3;

exports.getAllReservations = async (req, res) => {
  try {
    const { status, userId, bookId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (bookId) where.bookId = bookId;

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author'] }
      ],
      order: [['reservationDate', 'DESC']]
    });

    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author'] }
      ]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createReservation = async (req, res) => {
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

    // Verificar si el libro existe
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
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

    // Verificar si el usuario ya tiene una reserva pendiente para este libro
    const existingReservation = await Reservation.findOne({
      where: {
        userId,
        bookId,
        status: 'pending'
      }
    });

    if (existingReservation) {
      return res.status(400).json({
        message: 'User already has a pending reservation for this book'
      });
    }

    // Verificar el límite de reservas por usuario
    const activeReservationsCount = await Reservation.count({
      where: {
        userId,
        status: 'pending'
      }
    });

    if (activeReservationsCount >= MAX_RESERVATIONS_PER_USER) {
      return res.status(400).json({
        message: `User has reached the maximum limit of ${MAX_RESERVATIONS_PER_USER} reservations`
      });
    }

    // Verificar si hay copias disponibles (no se puede reservar si hay copias disponibles)
    if (book.availableCopies > 0) {
      return res.status(400).json({
        message: 'Book is available for loan, no need to reserve'
      });
    }

    // Crear la reserva
    const reservationDate = new Date();
    const expirationDate = moment(reservationDate)
      .add(RESERVATION_DURATION_DAYS, 'days')
      .toDate();

    const reservation = await Reservation.create({
      userId,
      bookId,
      reservationDate,
      expirationDate,
      status: 'pending'
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending reservations can be cancelled'
      });
    }

    await reservation.update({ status: 'cancelled' });
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkExpiredReservations = async (req, res) => {
  try {
    const now = new Date();
    const expiredReservations = await Reservation.findAll({
      where: {
        status: 'pending',
        expirationDate: { [Op.lt]: now }
      }
    });

    // Actualizar reservas expiradas
    await Reservation.update(
      { status: 'expired' },
      {
        where: {
          id: { [Op.in]: expiredReservations.map(res => res.id) }
        }
      }
    );

    res.json({
      message: `Found and updated ${expiredReservations.length} expired reservations`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.checkAvailableReservations = async (req, res) => {
  try {
    // Buscar libros que ahora tienen copias disponibles
    const availableBooks = await Book.findAll({
      where: {
        availableCopies: { [Op.gt]: 0 }
      }
    });

    if (availableBooks.length === 0) {
      return res.json({
        message: 'No books with available copies found'
      });
    }

    const bookIds = availableBooks.map(book => book.id);

    // Buscar reservas pendientes para estos libros
    const reservations = await Reservation.findAll({
      where: {
        bookId: { [Op.in]: bookIds },
        status: 'pending'
      },
      include: [
        { model: User, as: 'user' },
        { model: Book, as: 'book' }
      ],
      order: [
        ['bookId', 'ASC'],
        ['reservationDate', 'ASC']
      ]
    });

    if (reservations.length === 0) {
      return res.json({
        message: 'No pending reservations for available books found'
      });
    }

    // Agrupar reservas por libro
    const reservationsByBook = {};
    reservations.forEach(reservation => {
      if (!reservationsByBook[reservation.bookId]) {
        reservationsByBook[reservation.bookId] = [];
      }
      reservationsByBook[reservation.bookId].push(reservation);
    });

    // Procesar cada libro
    let notificationsSent = 0;
    const results = [];

    for (const bookId in reservationsByBook) {
      const bookReservations = reservationsByBook[bookId];
      const book = availableBooks.find(b => b.id === parseInt(bookId));
      const availableCopies = book.availableCopies;

      // Tomar las primeras N reservas (donde N es el número de copias disponibles)
      const reservationsToFulfill = bookReservations.slice(0, availableCopies);

      for (const reservation of reservationsToFulfill) {
        try {
          // Enviar notificación
          await notificationService.sendReservationAvailableNotification(
            reservation.user,
            reservation.book
          );

          // Actualizar reserva
          await reservation.update({
            status: 'fulfilled',
            notificationSent: true
          });

          notificationsSent++;
          results.push({
            reservationId: reservation.id,
            userId: reservation.userId,
            bookId: reservation.bookId,
            status: 'notification_sent'
          });
        } catch (error) {
          console.error(
            `Error processing reservation ${reservation.id}:`,
            error
          );
          results.push({
            reservationId: reservation.id,
            userId: reservation.userId,
            bookId: reservation.bookId,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    res.json({
      message: `Sent ${notificationsSent} notifications for available books`,
      details: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};