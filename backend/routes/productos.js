const express = require('express');
const router = express.Router();
const { getProductos, createProducto } = require('../controllers/productosController');

// Rutas de productos
router.get('/', getProductos); // Obtener todos los productos
router.post('/', createProducto); // Crear un nuevo producto

module.exports = router;
