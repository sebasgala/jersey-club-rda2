import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Función de login
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token); // Guardar el token en localStorage
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Eliminar el token al cerrar sesión
  };

  // Verificar si el usuario es admin
  const isAdmin = () => {
    return user?.role === 'admin' || user?.rol === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
