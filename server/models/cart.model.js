/**
 * =====================================================
 * MODEL: Cart
 * =====================================================
 * Capa de acceso a datos para el carrito (JSON-based)
 * Estructura MVC siguiendo el patrón del PDF
 */

import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cartPath = path.join(__dirname, "data", "cart.json");
const productosPath = path.join(__dirname, "data", "productos.json");

// ==================== HELPERS ====================

const load = () => {
  try {
    if (!fs.existsSync(cartPath)) return [];
    const data = fs.readFileSync(cartPath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    throw new Error("Error reading cart.json: " + error.message);
  }
};

const save = (cart) => {
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

// ==================== FUNCIONES EXPORTADAS ====================

/**
 * Obtener carrito de un usuario
 */
const getCart = async (userId) => {
  const cart = load();
  const productos = loadProductos();
  
  const userCart = cart.filter((item) => String(item.userId) === String(userId));
  
  // Agregar información del producto a cada item
  return userCart.map((item) => {
    const product = productos.find((p) => p.id === item.productId) || null;
    return { ...item, product };
  });
};

/**
 * Agregar item al carrito
 */
const addItem = async (userId, productId, quantity, size, color = null) => {
  const cart = load();
  
  // Verificar si ya existe el item con la misma talla
  const existingIndex = cart.findIndex(
    (item) =>
      String(item.userId) === String(userId) &&
      item.productId === productId &&
      item.size === size
  );

  if (existingIndex !== -1) {
    // Actualizar cantidad
    cart[existingIndex].quantity += quantity;
    save(cart);
    return cart[existingIndex];
  }

  // Crear nuevo item
  const maxId = cart.reduce((max, item) => Math.max(max, item.id || 0), 0);
  const newItem = {
    id: maxId + 1,
    userId: String(userId),
    productId,
    quantity,
    size,
    color,
    createdAt: new Date().toISOString(),
  };

  cart.push(newItem);
  save(cart);

  // Retornar con producto
  const productos = loadProductos();
  const product = productos.find((p) => p.id === productId) || null;
  return { ...newItem, product };
};

/**
 * Actualizar cantidad de un item
 */
const updateQuantity = async (itemId, userId, quantity) => {
  const cart = load();
  const index = cart.findIndex(
    (item) => item.id === parseInt(itemId) && String(item.userId) === String(userId)
  );

  if (index === -1) {
    throw new Error("Item no encontrado en el carrito");
  }

  cart[index].quantity = quantity;
  save(cart);

  const productos = loadProductos();
  const product = productos.find((p) => p.id === cart[index].productId) || null;
  return { ...cart[index], product };
};

/**
 * Eliminar item del carrito
 */
const removeItem = async (itemId, userId) => {
  const cart = load();
  const index = cart.findIndex(
    (item) => item.id === parseInt(itemId) && String(item.userId) === String(userId)
  );

  if (index === -1) {
    throw new Error("Item no encontrado en el carrito");
  }

  const [deletedItem] = cart.splice(index, 1);
  save(cart);
  return deletedItem;
};

/**
 * Limpiar carrito de un usuario
 */
const clearCart = async (userId) => {
  const cart = load();
  const filteredCart = cart.filter((item) => String(item.userId) !== String(userId));
  save(filteredCart);
  return { count: cart.length - filteredCart.length };
};

/**
 * Obtener total del carrito
 */
const getCartTotal = async (userId) => {
  const items = await getCart(userId);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || item.product?.precio || 0;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount,
    shipping: subtotal >= 100 ? 0 : 9.99,
    tax: Math.round(subtotal * 0.12 * 100) / 100, // IVA Ecuador
    total: Math.round((subtotal + (subtotal >= 100 ? 0 : 9.99) + subtotal * 0.12) * 100) / 100,
  };
};

export default {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  getCartTotal,
};
