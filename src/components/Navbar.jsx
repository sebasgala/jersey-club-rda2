import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

function Navbar({ onOpenCategories }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const navigate = useNavigate();

  // Obtener información del usuario logueado
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };
  
  const user = getUserFromStorage();
  const isAdmin = user?.rol === 'admin';
  const isClient = user?.rol === 'cliente';

  // Cerrar menú admin al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Obtener contador del carrito
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Ejecutar búsqueda global - navega a /ofertas con query param
  const executeSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery === "") return;
    
    // Navegar a la página de ofertas con el parámetro de búsqueda
    navigate(`/ofertas?search=${encodeURIComponent(trimmedQuery)}`);
    
    // Limpiar el input después de buscar
    setSearchQuery("");
  };

  // Manejar tecla Enter en el input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      executeSearch();
    }
  };

  const handleCategoryNavigation = (category) => {
    const routes = {
      futbol: '/futbol?category=futbol',
      formula1: '/formula1?category=formula1',
      jerseyClub: '/jersey-club-brand?brand=jerseyclub',
      ofertas: '/offers?onSale=true',
    };

    if (routes[category]) {
      navigate(routes[category]);
    }
  };

  return (
    <>
      <header className="v1_3165" role="banner">
        <nav className="navbar-optimized" aria-label="Navegación principal">
          {/* Left Section: Hamburger + Categories + Logo */}
          <div className="navbar-left">
            <button 
              type="button" 
              className="navbar-toggle-menu" 
              aria-expanded="false" 
              aria-label="Abrir menú"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>

            <button
              type="button"
              className="categories-btn"
              aria-expanded="false"
              aria-label="Abrir categorías"
              onClick={onOpenCategories}
            >
              <i className="fa fa-list" aria-hidden="true"></i>
              <span>Categorías</span>
            </button>

            <Link to="/" className="brand-logo-image" title="Jersey Club EC">
              <img src="/assets/images/letras-en-tira.webp" alt="Jersey Club EC" />
            </Link>
          </div>

          {/* Center Section: Search */}
          <div className="navbar-center">
            <div className="search__container">
              <input 
                className="search__input" 
                type="text" 
                placeholder="BUSCAR" 
                autoComplete="off" 
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Right Section: User + Cart + Admin */}
          <div className="navbar-right">
            {/* Menú de administración - solo visible para admin */}
            {isAdmin && (
              <div className="admin-menu-container" ref={adminMenuRef}>
                <button 
                  className="icon-btn admin-btn" 
                  aria-label="Menú de administración" 
                  title="Admin"
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                >
                  <i className="fa fa-cog"></i>
                </button>
                {isAdminMenuOpen && (
                  <div className="admin-dropdown-menu">
                    <Link 
                      to="/admin/productos" 
                      className="admin-dropdown-item"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      <i className="fa fa-box"></i>
                      <span>Productos</span>
                    </Link>
                    <Link 
                      to="/admin/usuarios" 
                      className="admin-dropdown-item"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      <i className="fa fa-users"></i>
                      <span>Usuarios</span>
                    </Link>
                    <Link 
                      to="/admin/ordenes-venta" 
                      className="admin-dropdown-item"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      <i className="fa fa-shopping-cart"></i>
                      <span>Órdenes de Venta</span>
                    </Link>
                    <Link 
                      to="/admin/ordenes-compra" 
                      className="admin-dropdown-item"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      <i className="fa fa-truck"></i>
                      <span>Órdenes de Compra</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
            <Link to="/auth" className="icon-btn user-btn" aria-label="Iniciar sesión" title="Perfil">
              <i className="fa fa-user"></i>
            </Link>
            <button 
              onClick={() => setIsCartDrawerOpen(true)} 
              className="icon-btn cart-btn" 
              aria-label="Abrir carrito" 
              title="Carrito"
            >
              <i className="fa fa-shopping-cart"></i>
              <span className="badge cart-count">{cartCount > 99 ? '99+' : cartCount}</span>
            </button>
          </div>
        </nav>
      </header>
      
      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
      />
    </>
  );
}

export default Navbar;
