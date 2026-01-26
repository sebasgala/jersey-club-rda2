import { body, validationResult } from 'express-validator';

/**
 * Middleware para manejar los errores de validación
 */
export const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Esquemas de validación
 */
export const validators = {
    // Validación para registro
    register: [
        body('email')
            .trim()
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Debe ser un email válido')
            .normalizeEmail(),
        body('password')
            .trim()
            .notEmpty().withMessage('La contraseña es requerida')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
            .escape(), // OWASP: Sanitización básica XSS
        validateResult
    ],

    // Validación para login
    login: [
        body('email')
            .trim()
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Email inválido'),
        body('password')
            .notEmpty().withMessage('La contraseña es requerida'),
        validateResult
    ],

    // Validación para creación de cliente (POS)
    createClient: [
        body('nombre')
            .trim()
            .notEmpty().withMessage('El nombre es requerido')
            .escape(),
        body('apellido')
            .trim()
            .notEmpty().withMessage('El apellido es requerido')
            .escape(),
        body('cedula')
            .optional()
            .trim()
            .isLength({ min: 10, max: 13 }).withMessage('Cédula/RUC inválido')
            .escape(),
        body('email')
            .optional()
            .trim()
            .isEmail().withMessage('Email inválido'),
        validateResult
    ]
};
