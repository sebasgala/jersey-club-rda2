/**
 * =====================================================
 * ROUTES: Products
 * =====================================================
 * Rutas de productos
 */

import express from 'express';
import { productController } from '../controllers/index.js';
import { authenticate, requireAdmin } from '../middleware/index.js';

const router = express.Router();

// ==================== RUTAS PÚBLICAS ====================

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos con filtros
 * @access  Public
 */
router.get('/', productController.getAll);

/**
 * @route   GET /api/products/featured
 * @desc    Obtener productos destacados
 * @access  Public
 */
router.get('/featured', productController.getFeatured);

/**
 * @route   GET /api/products/new
 * @desc    Obtener productos nuevos
 * @access  Public
 */
router.get('/new', productController.getNew);

/**
 * @route   GET /api/products/on-sale
 * @desc    Obtener productos en oferta
 * @access  Public
 */
router.get('/on-sale', productController.getOnSale);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener producto por ID
 * @access  Public
 */
router.get('/:id', productController.getById);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Obtener producto por slug
 * @access  Public
 */
router.get('/slug/:slug', productController.getBySlug);

/**
 * @route   GET /api/products/low-stock
 * @desc    Obtener productos con stock bajo
 * @access  Public
 */
router.get('/low-stock', productController.getLowStockProducts);

// ==================== RUTAS DE ADMIN ====================

/**
 * @route   POST /api/products
 * @desc    Crear nuevo producto
 * @access  Admin
 */
router.post('/', authenticate, requireAdmin, productController.create);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar producto
 * @access  Admin
 */
router.put('/:id', authenticate, requireAdmin, productController.update);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar producto
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, productController.remove);

export default router;
