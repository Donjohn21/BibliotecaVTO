const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  autor: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  genero: {
    type: String,
    required: true,
    trim: true
  },
  añoPublicacion: {
    type: Number,
    required: true
  },
  editorial: {
    type: String,
    required: true,
    trim: true
  },
  disponible: {
    type: Boolean,
    default: true
  },
  imagenPortada: {
    type: String,
    default: ''
  },
  descripcion: {
    type: String,
    trim: true
  },
  palabrasClave: {
    type: [String],
    default: []
  },
  calificacion: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  fechaIngreso: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Libro = mongoose.model('Libro', libroSchema);

module.exports = Libro;