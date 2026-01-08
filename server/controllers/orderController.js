/**
 * =====================================================
 * CONTROLLER: Orders
 * =====================================================
 * Controlador HTTP para órdenes
 */

import { prisma } from '../prisma/client.js';

/**
 * POST /api/orders
 * Crear nueva orden desde el carrito
 */
const createOrder = async (req, res, next) => {
  try {
    const { shippingData, paymentMethod } = req.body;

    // Validar datos de envío
    if (!shippingData?.fullName || !shippingData?.address || 
        !shippingData?.city || !shippingData?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Datos de envío incompletos'
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        shippingData,
        paymentMethod,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Obtener órdenes del usuario
 */
const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await prisma.order.findMany({
      where: { userId: req.user.id },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Obtener orden por ID
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Verificar que la orden pertenece al usuario (o es admin)
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta orden',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/number/:orderNumber
 * Obtener orden por número de orden
 */
const getOrderByNumber = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({ where: { orderNumber: req.params.orderNumber } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Verificar acceso
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta orden',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/admin/all (Admin)
 * Obtener todas las órdenes
 */
const getAllOrders = async (req, res, next) => {
  try {
    const result = await prisma.order.findMany();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status (Admin)
 * Actualizar estado de orden
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser: ${validStatuses.join(', ')}`,
      });
    }

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json({
      success: true,
      message: 'Estado actualizado',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  getAllOrders,
  updateOrderStatus
};
