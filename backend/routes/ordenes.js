const express = require('express');
const router = express.Router();
const {
  getOrdenes,
  getOrdenesCompra,
  getOrdenesVenta,
  createOrden,
  updateOrden,
  deleteOrden,
} = require('../controllers/ordenesController');

router.get('/', getOrdenes);
router.get('/compra', getOrdenesCompra);
router.get('/venta', getOrdenesVenta);
router.post('/', createOrden);
router.put('/:id', updateOrden);
router.delete('/:id', deleteOrden);

module.exports = router;
