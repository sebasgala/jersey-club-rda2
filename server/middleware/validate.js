/**
 * =====================================================
 * MIDDLEWARE: Validation
 * =====================================================
 * Middleware de validación de datos
 */

/**
 * Validar campo requerido
 */
const required = (field, message) => {
  return (req, res, next) => {
    if (!req.body[field] || req.body[field].toString().trim() === '') {
      return res.status(400).json({
        success: false,
        message: message || `El campo ${field} es requerido`,
        field
      });
    }
    next();
  };
};

/**
 * Validar formato de email
 */
const email = (field) => {
  return (req, res, next) => {
    const emailValue = req.body[field];
    if (emailValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        return res.status(400).json({
          success: false,
          message: 'El formato del email es inválido',
          field
        });
      }
    }
    next();
  };
};

/**
 * Validar longitud mínima
 */
const minLength = (field, min, message) => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value && value.length < min) {
      return res.status(400).json({
        success: false,
        message: message || `El campo ${field} debe tener al menos ${min} caracteres`,
        field
      });
    }
    next();
  };
};

/**
 * Validar longitud máxima
 */
const maxLength = (field, max, message) => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value && value.length > max) {
      return res.status(400).json({
        success: false,
        message: message || `El campo ${field} no puede tener más de ${max} caracteres`,
        field
      });
    }
    next();
  };
};

/**
 * Validar que sea un número
 */
const isNumber = (field, message) => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value !== undefined && isNaN(Number(value))) {
      return res.status(400).json({
        success: false,
        message: message || `El campo ${field} debe ser un número`,
        field
      });
    }
    next();
  };
};

/**
 * Validar valor mínimo
 */
const min = (field, minValue, message) => {
  return (req, res, next) => {
    const value = Number(req.body[field]);
    if (!isNaN(value) && value < minValue) {
      return res.status(400).json({
        success: false,
        message: message || `El campo ${field} debe ser mayor o igual a ${minValue}`,
        field
      });
    }
    next();
  };
};

/**
 * Validar que esté en una lista de valores
 */
const isIn = (field, values, message) => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value && !values.includes(value)) {
      return res.status(400).json({
        success: false,
        message: message || `El campo ${field} debe ser uno de: ${values.join(', ')}`,
        field
      });
    }
    next();
  };
};

/**
 * Sanitizar campos (trim)
 */
const sanitize = (...fields) => {
  return (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    });
    next();
  };
};

module.exports = {
  required,
  email,
  minLength,
  maxLength,
  isNumber,
  min,
  isIn,
  sanitize
};

export default {
  required,
  email,
};
