require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const libroRoutes = require('./routes/libroRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/libros', libroRoutes);
app.use('/api/libros', libroRoutes);
app.use('/api/auth', authRoutes);

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    // Iniciar servidor
    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('Error conectando a MongoDB:', err));

module.exports = app;