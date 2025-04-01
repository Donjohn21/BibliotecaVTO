const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());  // Para poder leer datos JSON en las solicitudes

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/mi_biblioteca')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log('Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);



app.listen(port, () => {
    console.log(`Servidor en el puerto ${port}`);
});
