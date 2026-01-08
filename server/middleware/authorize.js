/**
 * =====================================================
 * MIDDLEWARE: Authorization
 * =====================================================
 * Middleware de autorización por roles
 */

/**
 * Middleware de autorización por rol
 * @param {...string} roles - Roles permitidos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    // Verificar que el usuario tenga el rol requerido
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar propiedad del recurso
 * @param {Function} getResourceUserId - Función para obtener el userId del recurso
 */
const ownsResource = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);

      // Admin puede acceder a cualquier recurso
      if (req.user.role === 'admin') {
        return next();
      }

      // Verificar que el recurso pertenece al usuario
      if (resourceUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este recurso'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

module.exports = {
  authorize,
  ownsResource
};
