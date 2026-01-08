/**
 * =====================================================
 * ROUTES: Auth
 * =====================================================
 * Rutas de autenticación
 */

import express from 'express';
import { authController } from '../controllers/index.js';
import authenticate from '../middleware/authenticate.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// Validaciones
const registerValidation = [
  validate.required('email', 'El email es requerido'),
  validate.email('email'),
  validate.required('password', 'La contraseña es requerida'),
  validate.minLength('password', 8, 'La contraseña debe tener al menos 8 caracteres'),
  validate.required('name', 'El nombre es requerido')
];

const loginValidation = [
  validate.required('email', 'El email es requerido'),
  validate.email('email'),
  validate.required('password', 'La contraseña es requerida')
];

// ==================== RUTAS PÚBLICAS ====================

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

// ==================== RUTAS PROTEGIDAS ====================

/**
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario actual
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil
 * @access  Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put('/password', authenticate, authController.changePassword);

export default router;
