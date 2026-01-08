/**
 * =====================================================
 * UTILIDADES DE AUTENTICACIÓN
 * =====================================================
 * 
 * Manejo centralizado del estado de autenticación.
 * Usa localStorage para persistencia entre sesiones.
 * 
 * Para conectar con backend:
 * - Modificar setAuth para guardar token JWT
 * - Modificar getAuthState para validar token
 * - Agregar refreshToken si es necesario
 */

const AUTH_STORAGE_KEY = 'jersey-club-auth';

/**
 * Obtener estado de autenticación actual
 * @returns {{ isAuthenticated: boolean, user: object | null }}
 */
export const getAuthState = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Verificar que tenga estructura válida
      if (parsed && typeof parsed.isAuthenticated === 'boolean') {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error leyendo estado de auth:', error);
  }
  return { isAuthenticated: false, user: null };
};

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return getAuthState().isAuthenticated;
};

/**
 * Obtener datos del usuario actual
 * @returns {object | null}
 */
export const getCurrentUser = () => {
  return getAuthState().user;
};

/**
 * Establecer estado de autenticación
 * @param {boolean} authenticated 
 * @param {object | null} user 
 */
export const setAuth = (authenticated, user = null) => {
  try {
    const authState = {
      isAuthenticated: authenticated,
      user: user,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  } catch (error) {
    console.warn('Error guardando estado de auth:', error);
  }
};

/**
 * Iniciar sesión (simulado)
 * @param {{ email: string, password: string }} credentials 
 * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
 */
export const login = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el inicio de sesión');
    }

    const data = await response.json();
    setAuth(true, data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cerrar sesión
 */
export const logout = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.warn('Error al cerrar sesión:', error);
  }
};

export default {
  getAuthState,
  isAuthenticated,
  getCurrentUser,
  setAuth,
  login,
  logout
};
