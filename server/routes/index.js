/**
 * =====================================================
 * ROUTES INDEX
 * =====================================================
 * Configuración central de rutas
 */

import express from 'express';

const router = express.Router();

import authRoutes from './auth.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import productosRoutes from './productos.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import pedidosRoutes from './pedidos.routes.js';

// Montar rutas
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/productos', productosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Jersey Club API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
