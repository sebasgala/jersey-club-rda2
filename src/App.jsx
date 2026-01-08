import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminOrdenes from './pages/AdminOrdenes';
import AdminProductos from './pages/AdminProductos';
// import Footer from './components/Footer'; // si no está importado

function PrivateRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pt-24 pb-12">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/ordenes"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminOrdenes />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminProductos />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<h1>Página de Inicio</h1>} />
          </Routes>
        </main>
        {/* Asegúrate de renderizar el Footer aquí */}
        {/* <Footer /> */}
        {/* ...si ya se renderiza en otro sitio, mantén una sola instancia al final... */}
      </div>
    </Router>
  );
}
