import { setAuth, logout, isAuthenticated } from '../utils/auth';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getOrdenes,
  createOrden,
  updateOrden,
  deleteOrden,
  getProducts,
  createProduct,
  deleteProduct,
  getProductsByCategory,
  getProductById,
} from '../models/httpClient';
import { getUsuarioById } from './usuarios.controller';

/**
 * CONTROLLERS - Capa de Controladores (MVC)
 * 
 * Esta capa contiene:
 * - Control de eventos
 * - Navegación
 * - Flujos de negocio
 * - Lógica de interacción usuario
 */

// ==================== CONTROLADORES DE NAVEGACIÓN ====================

/**
 * Navega a una página específica
 * @param {Function} navigate - Función de navegación de React Router
 * @param {string} path - Ruta destino
 * @param {Object} options - Opciones adicionales (state, replace, etc.)
 */
export const navigateTo = (navigate, path, options = {}) => {
  navigate(path, options);
};

/**
 * Navega al carrito
 */
export const goToCart = (navigate) => {
  navigate('/cart');
};

/**
 * Navega al checkout/pago
 */
export const goToPayment = (navigate) => {
  navigate('/payment');
};

/**
 * Navega al login con redirección posterior
 */
export const goToLogin = (navigate, redirectTo = '/') => {
  navigate(`/login?redirect=${redirectTo}`);
};

/**
 * Navega al detalle de producto
 */
export const goToProduct = (navigate, productId) => {
  navigate(`/product/${productId}`);
};

// ==================== CONTROLADORES DE CARRITO ====================

/**
 * Agrega un producto al carrito
 * @param {Function} addToCart - Función del contexto de carrito
 * @param {Object} product - Producto a agregar
 * @param {number} quantity - Cantidad
 * @param {string} size - Talla seleccionada
 */
export const handleAddToCart = (addToCart, product, quantity = 1, size = 'M') => {
  addToCart({
    ...product,
    quantity,
    size
  });
};

/**
 * Elimina un producto del carrito
 * @param {Function} removeFromCart - Función del contexto
 * @param {string} productId - ID del producto
 */
export const handleRemoveFromCart = (removeFromCart, productId) => {
  removeFromCart(productId);
};

/**
 * Actualiza la cantidad de un producto
 * @param {Function} updateQuantity - Función del contexto
 * @param {string} productId - ID del producto
 * @param {number} newQuantity - Nueva cantidad
 */
export const handleUpdateQuantity = (updateQuantity, productId, newQuantity) => {
  if (newQuantity < 1) return;
  updateQuantity(productId, newQuantity);
};

/**
 * Limpia todo el carrito
 * @param {Function} clearCart - Función del contexto
 */
export const handleClearCart = (clearCart) => {
  clearCart();
};

// ==================== CONTROLADORES DE AUTENTICACIÓN ====================

/**
 * Maneja el proceso de login
 * @param {Object} credentials - {email, password}
 * @param {Function} navigate - Función de navegación
 * @param {string} redirectTo - Ruta de redirección post-login
 */
export const handleLogin = async (credentials, navigate, redirectTo = '/') => {
  try {
    // Simular validación (reemplazar con llamada real a API)
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Guardar autenticación
    setAuth(true, {
      email: credentials.email,
      name: credentials.email.split('@')[0],
      token: 'simulated-token-' + Date.now()
    });

    // Navegar a destino
    navigate(redirectTo, { replace: true });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Maneja el proceso de logout
 * @param {Function} navigate - Función de navegación
 */
export const handleLogout = (navigate) => {
  logout();
  navigate('/', { replace: true });
};

/**
 * Verifica si el usuario puede acceder a una ruta protegida
 * @param {string} redirectPath - Ruta a redirigir si no está autenticado
 */
export const checkAuthAccess = (navigate, redirectPath = '/auth') => {
  if (!isAuthenticated()) {
    navigate(redirectPath);
    return false;
  }
  return true;
};

// ==================== CONTROLADORES DE FORMULARIOS ====================

/**
 * Valida un email
 * @param {string} email 
 * @returns {string} Mensaje de error o vacío si es válido
 */
export const validateEmail = (email) => {
  if (!email) return 'El email es requerido';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email inválido';
  return '';
};

/**
 * Valida una contraseña
 * @param {string} password 
 * @returns {string} Mensaje de error o vacío si es válido
 */
export const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe incluir una mayúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir un número';
  return '';
};

/**
 * Valida un formulario de envío
 * @param {Object} shippingData 
 * @returns {Object} {isValid, errors}
 */
export const validateShippingForm = (shippingData) => {
  const errors = {};

  if (!shippingData.fullName?.trim()) {
    errors.fullName = 'El nombre es requerido';
  }

  if (!shippingData.address?.trim()) {
    errors.address = 'La dirección es requerida';
  }

  if (!shippingData.city?.trim()) {
    errors.city = 'La ciudad es requerida';
  }

  if (!shippingData.phone?.trim()) {
    errors.phone = 'El teléfono es requerido';
  } else if (!/^\d{9,10}$/.test(shippingData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Teléfono inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ==================== CONTROLADORES DE PAGO ====================

/**
 * Procesa un pago
 * @param {Object} paymentData - Datos del pago
 * @param {Object} cartData - Datos del carrito
 */
export const processPayment = async (paymentData, cartData) => {
  try {
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generar número de orden
    const orderNumber = `JC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      success: true,
      orderNumber,
      message: 'Pago procesado exitosamente'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Error al procesar el pago'
    };
  }
};

// ==================== CONTROLADORES DE PRODUCTOS ====================

/**
 * Obtiene la lista de productos
 */
export const fetchProducts = async () => {
  try {
    const res = await getProducts();
    return res;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un producto
 */
export const fetchProductDetails = async (productId) => {
  try {
    const res = await getProductById(productId);
    return res;
  } catch (error) {
    console.error("Error al obtener detalles del producto:", error);
    throw error;
  }
};

// ==================== CONTROLADORES DE PEDIDOS ====================

/**
 * Crea un nuevo pedido
 */
export const createOrder = async (orderData) => {
  try {
    const res = await createOrden(orderData);
    return res;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
};

/**
 * Obtiene los pedidos del usuario autenticado
 */
export const fetchUserOrders = async () => {
  try {
    const res = await getOrdenes();
    return res;
  } catch (error) {
    console.error("Error al obtener pedidos del usuario:", error);
    throw error;
  }
};

/**
 * Obtiene todos los pedidos (solo para administradores)
 */
export const fetchAllOrders = async () => {
  try {
    const res = await getOrdenes();
    return res;
  } catch (error) {
    console.error("Error al obtener todos los pedidos:", error);
    throw error;
  }
};

// Si usas exports nombrados:
export { getUsuarioById };
