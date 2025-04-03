module.exports = function(requiredRole) {
    return async (req, res, next) => {
      try {
        if (req.user.role_name !== requiredRole) {
          return res.status(403).json({ 
            message: `Acceso denegado. Se requiere rol de ${requiredRole}` 
          });
        }
        next();
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al verificar roles', error: err.message });
      }
    };
  };