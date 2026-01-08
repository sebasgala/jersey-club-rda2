import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

/**
 * =====================================================
 * COMPONENTE DE RUTA PROTEGIDA
 * =====================================================
 * 
 * Protege rutas que requieren autenticación.
 * Si el usuario no está logueado, redirige a /auth
 * guardando la ruta original para volver después del login.
 * 
 * Props:
 * - children: Contenido a renderizar si pasa la verificación
 * - requireAdmin: Si es true, solo admins pueden acceder
 * 
 * Uso:
 * <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
 * <Route path="/admin/productos" element={<ProtectedRoute requireAdmin><AdminProductos /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const user = getCurrentUser();
  
  // Verificar autenticación
  if (!isAuthenticated()) {
    // Redirigir a auth, guardando la ruta actual para volver después
    return (
      <Navigate 
        to="/auth" 
        replace 
        state={{ from: location.pathname }} 
      />
    );
  }
  
  // Si se requiere admin, verificar rol
  if (requireAdmin) {
    const userRol = user?.rol || user?.role;
    if (userRol !== 'admin') {
      // Usuario no es admin, redirigir a home con mensaje
      return (
        <Navigate 
          to="/" 
          replace 
          state={{ error: 'No tienes permisos para acceder a esta página' }} 
        />
      );
    }
  }
  
  // Usuario autenticado (y admin si se requiere), renderizar el contenido
  return children;
}
