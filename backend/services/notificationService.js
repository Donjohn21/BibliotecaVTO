const nodemailer = require('nodemailer');
const config = require('../config/auth');

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPass
  }
});

exports.sendReservationAvailableNotification = async (user, book) => {
  try {
    const mailOptions = {
      from: `"Biblioteca" <${config.emailUser}>`,
      to: user.email,
      subject: `Libro reservado disponible: ${book.title}`,
      text: `Hola ${user.name},\n\nEl libro "${book.title}" que tenías reservado está ahora disponible para préstamo. Tienes 48 horas para venir a recogerlo antes de que la reserva expire.\n\n¡Gracias por usar nuestra biblioteca!`,
      html: `
        <p>Hola ${user.name},</p>
        <p>El libro <strong>"${book.title}"</strong> que tenías reservado está ahora disponible para préstamo.</p>
        <p>Tienes 48 horas para venir a recogerlo antes de que la reserva expire.</p>
        <p>¡Gracias por usar nuestra biblioteca!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};