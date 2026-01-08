/**
 * =====================================================
 * MODEL: Order
 * =====================================================
 * Capa de acceso a datos para órdenes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generar número de orden único
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `JC-${timestamp}-${random}`;
};

/**
 * Crear orden desde carrito
 */
const createFromCart = async (userId, shippingData, paymentMethod) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: String(userId) },
    include: { product: true }
  });

  if (cartItems.length === 0) {
    throw new Error('El carrito está vacío');
  }

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: String(userId),
        shippingData,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total
      }
    });

    await tx.cartItem.deleteMany({ where: { userId: String(userId) } });

    return newOrder;
  });

  return order;
};

/**
 * Buscar orden por ID
 */
const findById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  if (!order) return null;

  // Parsear campos JSON de productos
  return {
    ...order,
    orderItems: order.orderItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        sizes: JSON.parse(item.product.sizes || '[]'),
        images: JSON.parse(item.product.images || '[]')
      }
    }))
  };
};

/**
 * Buscar orden por número
 */
const findByOrderNumber = async (orderNumber) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });

  if (!order) return null;

  return {
    ...order,
    orderItems: order.orderItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        sizes: JSON.parse(item.product.sizes || '[]'),
        images: JSON.parse(item.product.images || '[]')
      }
    }))
  };
};

/**
 * Obtener órdenes de un usuario
 */
const findByUser = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count({ where: { userId } })
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Actualizar estado de orden
 */
const updateStatus = async (id, status) => {
  return prisma.order.update({
    where: { id },
    data: { status }
  });
};

/**
 * Obtener todas las órdenes (admin)
 */
const findAll = async (filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        orderItems: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export default {
  createFromCart,
  findById,
  findByOrderNumber,
  findByUser,
  updateStatus,
  findAll,
  generateOrderNumber
};
