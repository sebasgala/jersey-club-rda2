/**
 * =====================================================
 * ROUTES: Cart
 * =====================================================
 * Rutas del carrito de compras
 */

import express from 'express';
import { cartController } from '../controllers/index.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// Todas las rutas del carrito requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/cart
 * @desc    Obtener carrito del usuario
 * @access  Private
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Agregar producto al carrito
 * @access  Private
 */
router.post('/', cartController.addToCart);

/**
 * @route   PUT /api/cart/:itemId
 * @desc    Actualizar cantidad de un item
 * @access  Private
 */
router.put('/:itemId', cartController.updateQuantity);

/**
 * @route   DELETE /api/cart/:itemId
 * @desc    Eliminar item del carrito
 * @access  Private
 */
router.delete('/:itemId', cartController.removeItem);

/**
 * @route   DELETE /api/cart
 * @desc    Vaciar carrito
 * @access  Private
 */
router.delete('/', cartController.clearCart);

export default router;
