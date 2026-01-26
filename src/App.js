import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

// ==================== IMPORTACIONES MVC ====================
// Models - Lógica de datos y estado
import { CartProvider } from "./models";

// Views - Componentes UI y páginas
import {
  Navbar,
  CategoriesMenu,
  ProtectedRoute,
  Home,
  Cart,
  Auth,
  Formula1,
  Futbol,
  Invoice,
  MenuCategorias,
  Ofertas,
  Payment,
  Product,
  Register,
  JerseyClubBrand
} from "./views";

// Página de administración CRUD
import AdminProductos from "./pages/AdminProductos";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminOrdenes from "./pages/AdminOrdenes";
import AdminOrdenesCompra from "./pages/AdminOrdenesCompra";
import AdminOrdenesVenta from "./pages/AdminOrdenesVenta";
import POS from "./pages/POS";

// Estilos
import "./styles/main.css";

function App() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  return (
    <CartProvider>
      <Navbar onOpenCategories={() => setIsCategoriesOpen(true)} />
      <CategoriesMenu
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
      />

      {/* Aquí cambian las pantallas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/formula1" element={<Formula1 />} />
        <Route path="/futbol" element={<Futbol />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/menu-categorias" element={<MenuCategorias />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/jersey-club-brand" element={<JerseyClubBrand />} />
        {/* Ruta protegida: requiere autenticación */}
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        {/* Ruta de producto con ID dinámico */}
        <Route path="/product/:id" element={<Product />} />

        {/* Ruta de administración de productos (CRUD) */}
        <Route path="/admin/pos" element={
          <ProtectedRoute requireAdmin>
            <React.Suspense fallback={<div>Cargando POS...</div>}>
              {/* Lazy load POS if needed or direct import, here we use direct import but need to add it to imports */}
              <POS />
            </React.Suspense>
          </ProtectedRoute>
        } />

        <Route path="/admin/productos" element={
          <ProtectedRoute requireAdmin>
            <AdminProductos />
          </ProtectedRoute>
        } />

        {/* Ruta de administración de usuarios (CRUD) */}
        <Route path="/admin/usuarios" element={
          <ProtectedRoute requireAdmin>
            <AdminUsuarios />
          </ProtectedRoute>
        } />

        {/* Ruta de administración de órdenes (CRUD) */}
        <Route path="/admin/ordenes" element={
          <ProtectedRoute requireAdmin>
            <AdminOrdenes />
          </ProtectedRoute>
        } />

        {/* Ruta de administración de órdenes de compra (CRUD) */}
        <Route path="/admin/ordenes-compra" element={
          <ProtectedRoute requireAdmin>
            <AdminOrdenesCompra />
          </ProtectedRoute>
        } />

        {/* Ruta de administración de órdenes de venta (CRUD) */}
        <Route path="/admin/ordenes-venta" element={
          <ProtectedRoute requireAdmin>
            <AdminOrdenesVenta />
          </ProtectedRoute>
        } />

        {/* opcional: 404 */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </CartProvider>
  );
}

export default App;
