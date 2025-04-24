const db = require('../models');
const Rol = db.rol;

// Configuración JWT
const jwtConfig = {
  jwtSecret: process.env.JWT_SECRET || "mi_clave_secreta_muy_larga_y_compleja_123!",
  jwtExpire: process.env.JWT_EXPIRE || "24h"
};

// Función para iniciar roles
async function iniciarRoles() {
  try {
    // Verificar si ya hay roles creados
    const count = await Rol.count();
    
    if (count === 0) {
      // Crear roles por defecto
      await Rol.bulkCreate([
        { nombre: "usuario" },
        { nombre: "bibliotecario" },
        { nombre: "admin" }
      ]);
      console.log("Roles predeterminados creados correctamente");
    } else {
      console.log("Los roles ya existen en la base de datos");
    }
  } catch (err) {
    console.error("Error al crear roles:", err);
  }
}

// Exportar ambas cosas
module.exports = {
  iniciarRoles,
  ...jwtConfig
};