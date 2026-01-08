/**
 * =====================================================
 * MODEL: Order
 * =====================================================
 * Capa de acceso a datos para órdenes (JSON-based)
 * Estructura MVC siguiendo el patrón del PDF
 */

import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ordersPath = path.join(__dirname, "data", "orders.json");
const cartPath = path.join(__dirname, "data", "cart.json");
const productosPath = path.join(__dirname, "data", "productos.json");

// ==================== HELPERS ====================

const load = () => {
  try {
    if (!fs.existsSync(ordersPath)) return [];
    const data = fs.readFileSync(ordersPath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    throw new Error("Error reading orders.json: " + error.message);
  }
};

const save = (orders) => {
  try {
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
  } catch (error) {
    throw new Error("Error writing orders.json: " + error.message);
  }
};

const loadCart = () => {
  try {
    if (!fs.existsSync(cartPath)) return [];
    const data = fs.readFileSync(cartPath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

const saveCart = (cart) => {
  try {
    fs.writeFileSync(cartPath, JSON.stringify(cart, null, 2));
  } catch (error) {
    throw new Error("Error writing cart.json: " + error.message);
  }
};

const loadProductos = () => {
  try {
    if (!fs.existsSync(productosPath)) return [];
    const data = fs.readFileSync(productosPath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Generar número de orden único
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `JC-${timestamp}-${random}`;
};

// ==================== FUNCIONES EXPORTADAS ====================

/**
 * Crear orden desde carrito
 */
const createFromCart = async (userId, shippingData, paymentMethod) => {
  const cart = loadCart();
  const productos = loadProductos();

  // Obtener items del carrito del usuario
  const cartItems = cart.filter((item) => String(item.userId) === String(userId));

  if (cartItems.length === 0) {
    throw new Error("El carrito está vacío");
  }

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => {
    const product = productos.find((p) => p.id === item.productId);
    const price = product?.price || product?.precio || 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  // Crear orden
  const orders = load();
  const maxId = orders.reduce((max, order) => Math.max(max, order.id || 0), 0);

  const orderItems = cartItems.map((item) => {
    const product = productos.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: product?.price || product?.precio || 0,
      productName: product?.name || product?.nombre || "Producto",
    };
  });

  const newOrder = {
    id: maxId + 1,
    orderNumber: generateOrderNumber(),
    userId: String(userId),
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    paymentMethod,
    shippingName: shippingData.fullName,
    shippingAddress: shippingData.address,
    shippingCity: shippingData.city,
    shippingPhone: shippingData.phone,
    notes: shippingData.notes || null,
    status: "pending",
    orderItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  save(orders);

  // Limpiar carrito del usuario
  const updatedCart = cart.filter((item) => String(item.userId) !== String(userId));
  saveCart(updatedCart);

  return newOrder;
};

/**
 * Buscar orden por ID
 */
const findById = async (id) => {
  const orders = load();
  return orders.find((order) => order.id === parseInt(id)) || null;
};

/**
 * Buscar orden por número
 */
const findByOrderNumber = async (orderNumber) => {
  const orders = load();
  return orders.find((order) => order.orderNumber === orderNumber) || null;
};

/**
 * Obtener órdenes de un usuario
 */
const findByUser = async (userId, page = 1, limit = 10) => {
  const orders = load();
  const userOrders = orders.filter((order) => String(order.userId) === String(userId));

  // Ordenar por fecha de creación (más reciente primero)
  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Paginación
  const start = (page - 1) * limit;
  const paginatedOrders = userOrders.slice(start, start + limit);

  return {
    orders: paginatedOrders,
    pagination: {
      page,
      limit,
      total: userOrders.length,
      pages: Math.ceil(userOrders.length / limit),
    },
  };
};

/**
 * Obtener todas las órdenes (admin)
 */
const findAll = async (page = 1, limit = 10, status = null) => {
  let orders = load();

  // Filtrar por estado si se especifica
  if (status) {
    orders = orders.filter((order) => order.status === status);
  }

  // Ordenar por fecha de creación (más reciente primero)
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Paginación
  const start = (page - 1) * limit;
  const paginatedOrders = orders.slice(start, start + limit);

  return {
    orders: paginatedOrders,
    pagination: {
      page,
      limit,
      total: orders.length,
      pages: Math.ceil(orders.length / limit),
    },
  };
};

/**
 * Actualizar estado de una orden
 */
const updateStatus = async (id, status) => {
  const orders = load();
  const index = orders.findIndex((order) => order.id === parseInt(id));

  if (index === -1) {
    return null;
  }

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  save(orders);

  return orders[index];
};

export default {
  createFromCart,
  findById,
  findByOrderNumber,
  findByUser,
  findAll,
  updateStatus,
};
