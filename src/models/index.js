/**
 * MODELS - Capa de Modelos (MVC)
 * 
 * Esta capa contiene:
 * - Lógica de datos del lado del cliente
 * - Consumo de API
 * - Estado del carrito
 * - Datos de productos
 * - Utilidades de autenticación y formato
 */

// ==================== DATOS DE PRODUCTOS ====================
export { default as footballProducts } from '../data/footballProducts';
export { default as formula1Products } from '../data/formula1Products';
export { default as jerseyClubProducts } from '../data/jerseyClubProducts';
export { 
  jerseyClubGeneratedProducts, 
  findJerseyClubProductById 
} from '../data/jerseyClubGeneratedProducts';

// ==================== CONTEXTO (ESTADO GLOBAL) ====================
export { CartProvider, useCart } from '../context/CartContext';

// ==================== UTILIDADES ====================
export { 
  isAuthenticated, 
  getCurrentUser, 
  setAuth, 
  logout,
  login,
  getAuthState
} from '../utils/auth';

export { formatCurrency, parsePrice, formatNumber } from '../utils/money';
export { toSlug } from '../utils/toSlug';
export { default as allProductsUnified } from '../utils/allProductsUnified';
