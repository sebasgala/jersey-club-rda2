/**
 * =====================================================
 * ROUTES: Orders
 * =====================================================
 * Rutas de órdenes
 */

import express from 'express';
import { orderController } from '../controllers/index.js';
import { authenticate, requireAdmin } from '../middleware/index.js';

const router = express.Router();

// Todas las rutas de órdenes requieren autenticación
router.use(authenticate);

// ==================== RUTAS DE USUARIO ====================

/**
 * @route   POST /api/orders
 * @desc    Crear nueva orden desde el carrito
 * @access  Private
 */
router.post('/', orderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Obtener órdenes del usuario
 * @access  Private
 */
router.get('/', orderController.getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener orden por ID
 * @access  Private
 */
router.get('/:id', orderController.getOrderById);

/**
 * @route   GET /api/orders/number/:orderNumber
 * @desc    Obtener orden por número
 * @access  Private
 */
router.get('/number/:orderNumber', orderController.getOrderByNumber);

// ==================== RUTAS DE ADMIN ====================

/**
 * @route   GET /api/orders/admin/all
 * @desc    Obtener todas las órdenes
 * @access  Admin
 */
router.get('/admin/all', requireAdmin, orderController.getAllOrders);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Actualizar estado de orden
 * @access  Admin
 */
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

export default router;
