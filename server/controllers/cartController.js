/**
 * =====================================================
 * CONTROLLER: Cart
 * =====================================================
 * Controlador HTTP para el carrito de compras
 */

import { cartModel } from '../models/index.js';

/**
 * GET /api/cart
 * Obtener carrito del usuario
 */
const getCart = async (req, res, next) => {
  try {
    const items = await cartModel.getCart(req.user.id);
    const totals = await cartModel.getCartTotal(req.user.id);

    res.json({
      success: true,
      data: {
        items,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart
 * Agregar producto al carrito
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: 'productId y size son requeridos'
      });
    }

    const item = await cartModel.addItem(
      req.user.id,
      productId,
      quantity,
      size,
      color
    );

    const totals = await cartModel.getCartTotal(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Producto agregado al carrito',
      data: {
        item,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cart/:itemId
 * Actualizar cantidad de un item
 */
const updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    const item = await cartModel.updateQuantity(
      req.params.itemId,
      req.user.id,
      quantity
    );

    const totals = await cartModel.getCartTotal(req.user.id);

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: {
        item,
        ...totals
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/:itemId
 * Eliminar item del carrito
 */
const removeItem = async (req, res, next) => {
  try {
    await cartModel.removeItem(req.params.itemId, req.user.id);

    const totals = await cartModel.getCartTotal(req.user.id);

    res.json({
      success: true,
      message: 'Producto eliminado del carrito',
      data: totals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart
 * Vaciar carrito
 */
const clearCart = async (req, res, next) => {
  try {
    await cartModel.clearCart(req.user.id);

    res.json({
      success: true,
      message: 'Carrito vaciado'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart
};
