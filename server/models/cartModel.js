/**
 * =====================================================
 * MODEL: Cart
 * =====================================================
 * Capa de acceso a datos para el carrito
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener carrito de un usuario
 */
const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: String(userId) },
    include: {
      product: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Parsear campos JSON de productos
  return items.map(item => ({
    ...item,
    product: {
      ...item.product,
      sizes: JSON.parse(item.product.sizes || '[]'),
      colors: item.product.colors ? JSON.parse(item.product.colors) : [],
      images: JSON.parse(item.product.images || '[]')
    }
  }));
};

/**
 * Agregar item al carrito
 */
const addItem = async (userId, productId, quantity, size, color = null) => {
  // Verificar si ya existe el item con la misma talla
  const existingItem = await prisma.cartItem.findFirst({
    where: { userId: String(userId), productId, size }
  });

  if (existingItem) {
    // Actualizar cantidad
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { product: true }
    });
  }

  // Crear nuevo item
  return prisma.cartItem.create({
    data: {
      userId: String(userId),
      productId,
      quantity,
      size,
      color
    },
    include: { product: true }
  });
};

/**
 * Actualizar cantidad de un item
 */
const updateQuantity = async (itemId, userId, quantity) => {
  return prisma.cartItem.update({
    where: { 
      id: itemId,
      userId // Asegurar que el item pertenece al usuario
    },
    data: { quantity },
    include: { product: true }
  });
};

/**
 * Eliminar item del carrito
 */
const removeItem = async (itemId, userId) => {
  return prisma.cartItem.delete({
    where: { 
      id: itemId,
      userId
    }
  });
};

/**
 * Limpiar carrito de un usuario
 */
const clearCart = async (userId) => {
  return prisma.cartItem.deleteMany({
    where: { userId }
  });
};

/**
 * Obtener total del carrito
 */
const getCartTotal = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    itemCount,
    shipping: subtotal >= 100 ? 0 : 9.99,
    tax: subtotal * 0.12, // IVA Ecuador
    total: subtotal + (subtotal >= 100 ? 0 : 9.99) + (subtotal * 0.12)
  };
};

export default {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  getCartTotal
};
