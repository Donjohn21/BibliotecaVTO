const Libro = require('../models/Libro.js');

// Obtener todos los libros
exports.obtenerLibros = async (req, res) => {
  try {
    const libros = await Libro.find({});
    res.status(200).json(libros);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener un libro por ID
exports.obtenerLibro = async (req, res) => {
  try {
    const libro = await Libro.findById(req.params.id);
    if (!libro) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json(libro);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Crear un nuevo libro
exports.crearLibro = async (req, res) => {
  try {
    const nuevoLibro = new Libro(req.body);
    const libroGuardado = await nuevoLibro.save();
    res.status(201).json(libroGuardado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Actualizar un libro
exports.actualizarLibro = async (req, res) => {
  try {
    const libroActualizado = await Libro.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!libroActualizado) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json(libroActualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Eliminar un libro
exports.eliminarLibro = async (req, res) => {
  try {
    const libroEliminado = await Libro.findByIdAndDelete(req.params.id);
    if (!libroEliminado) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json({ mensaje: 'Libro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Búsqueda por título, autor o género
exports.buscarLibros = async (req, res) => {
    try {
      const { termino } = req.query;
      const libros = await Libro.find({
        $or: [
          { titulo: { $regex: termino, $options: 'i' } },
          { autor: { $regex: termino, $options: 'i' } },
          { genero: { $regex: termino, $options: 'i' } }
        ]
      });
      res.status(200).json(libros);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };
  
  // Búsqueda avanzada con filtros
  exports.filtrarLibros = async (req, res) => {
    try {
      const { genero, añoDesde, añoHasta, disponible } = req.query;
      const filtro = {};
      
      if (genero) filtro.genero = genero;
      if (añoDesde || añoHasta) {
        filtro.añoPublicacion = {};
        if (añoDesde) filtro.añoPublicacion.$gte = añoDesde;
        if (añoHasta) filtro.añoPublicacion.$lte = añoHasta;
      }
      if (disponible) filtro.disponible = disponible === 'true';
  
      const libros = await Libro.find(filtro);
      res.status(200).json(libros);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
  };