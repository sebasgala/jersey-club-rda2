import express from 'express';
import { testDatabaseConnection, getLowStockProducts } from '../controllers/testController.js';

const router = express.Router();

// Ruta de prueba
router.get('/', testDatabaseConnection);

// Ruta para obtener productos con stock bajo
router.get('/low-stock', getLowStockProducts);

export default router;
