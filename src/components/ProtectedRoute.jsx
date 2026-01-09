import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * =====================================================
 * COMPONENTE DE RUTA PROTEGIDA
 * =====================================================
 * 
 * Protege rutas que requieren autenticación.
 * Si el usuario no está logueado, redirige a /auth
 * guardando la ruta original para volver después del login.
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const { isAuthenticated, user, isAdmin: checkIsAdmin, loading } = useAuth();

  // Mientras carga el estado inicial, podemos mostrar un spinner o nada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Verificar autenticación
  if (!isAuthenticated) {
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
  if (requireAdmin && !checkIsAdmin()) {
    // Usuario no es admin, redirigir a home con mensaje
    return (
      <Navigate
        to="/"
        replace
        state={{ error: 'No tienes permisos para acceder a esta página' }}
      />
    );
  }

  // Usuario autenticado (y admin si se requiere), renderizar el contenido
  return children;
}
