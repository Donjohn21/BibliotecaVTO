// app.js
const express = require('express');
const cors = require('cors');
const db = require('./models'); // Importa todos los modelos

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
// ... otras rutas

// Sincronización de la base de datos
async function initializeDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');
    
    // Sincronizar modelos
    await db.sequelize.sync({ force: false });
    console.log('Database synchronized');
    
    // Crear roles iniciales
    await db.Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { description: 'Administrator with full access' }
    });
    
    await db.Role.findOrCreate({
      where: { name: 'librarian' },
      defaults: { description: 'Librarian with limited admin access' }
    });
    
    await db.Role.findOrCreate({
      where: { name: 'user' },
      defaults: { description: 'Regular library user' }
    });
    
    console.log('Default roles created/verified');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

initializeDatabase();