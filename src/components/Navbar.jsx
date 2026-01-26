import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import { searchProducts } from '../utils/allProductsUnified';

function Navbar({ onOpenCategories }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { user, isAdmin: checkIsAdmin, isAuthenticated } = useAuth();
  const isAdmin = checkIsAdmin();


  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Admin menu
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
      // Search results
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de búsqueda en vivo (debounce)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setLiveResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchProducts(searchQuery);
        setLiveResults(results.slice(0, 8)); // Mostrar top 8
        setShowDropdown(true);
      } catch (error) {
        console.error("Error en búsqueda en vivo:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

    // Limpiar el input y cerrar
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Manejar tecla Enter en el input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      executeSearch();
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
              <img src="https://storage.googleapis.com/imagenesjerseyclub/letras-en-tira.webp" alt="Jersey Club EC" />
            </Link>
          </div>

          {/* Center Section: Search */}
          <div className="navbar-center" ref={searchRef}>
            <div className="search__container">
              <input
                className="search__input"
                type="text"
                placeholder="BUSCAR PRODUCTOS..."
                autoComplete="off"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
              />

              {/* DROPDOWN DE RESULTADOS */}
              {showDropdown && (
                <div className="search-results-dropdown">
                  {isSearching ? (
                    <div className="search-loading-indicator">
                      <i className="fa fa-spinner fa-spin"></i>
                      <span>Buscando...</span>
                    </div>
                  ) : liveResults.length > 0 ? (
                    <>
                      {liveResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="search-result-item"
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                          }}
                        >
                          <img
                            src={product.image || product.imagen}
                            alt={product.title}
                            className="search-result-image"
                            onError={(e) => { e.target.src = 'https://storage.googleapis.com/imagenesjerseyclub/default.webp'; }}
                          />
                          <div className="search-result-info">
                            <span className="search-result-name">{product.title || product.nombre}</span>
                            <span className="search-result-category">{product.brand || product.category}</span>
                          </div>
                          <div className="search-result-price-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <div className="search-result-price" style={{ fontWeight: 'bold', color: '#B12704' }}>
                              {(() => {
                                // Prioridad: precio (número del backend) > price (string formateado)
                                const precioNum = product.precio;
                                const priceStr = product.price;

                                let numeric = 0;
                                if (typeof precioNum === 'number') {
                                  numeric = precioNum;
                                } else if (priceStr !== undefined && priceStr !== null) {
                                  numeric = typeof priceStr === 'number' ? priceStr : parseFloat(String(priceStr).replace('$', '').replace(',', '')) || 0;
                                }

                                return `$${numeric.toFixed(2)}`;
                              })()}
                            </div>
                            {(product.isOnSale || product.onSale) && (
                              <span className="search-result-discount" style={{ fontSize: '10px', color: '#CC0C39', fontWeight: 'bold', background: '#FFF0F0', padding: '1px 4px', borderRadius: '3px' }}>
                                -{product.descuento || product.discount || 20}%
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                      <div
                        className="search-view-all"
                        onClick={executeSearch}
                        style={{ padding: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#495A72', cursor: 'pointer', borderTop: '1px solid #eee' }}
                      >
                        Ver todos los resultados
                      </div>
                    </>
                  ) : (
                    <div className="search-no-results">No se encontraron productos</div>
                  )}
                </div>
              )}
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
                      to="/admin/pos"
                      className="admin-dropdown-item"
                      onClick={() => setIsAdminMenuOpen(false)}
                      style={{ borderBottom: '1px solid #eee', marginBottom: '5px', paddingBottom: '12px' }}
                    >
                      <i className="fa fa-cash-register" style={{ color: '#2563eb' }}></i>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>PUNTO DE VENTA</span>
                    </Link>
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
            <div className="navbar-user-section">
              {isAuthenticated && (
                <div className="user-greeting">
                  <span className="greeting-text">Hola,</span>
                  <span className="user-name-label">{user?.name || user?.nombre || user?.email?.split('@')[0]}</span>
                </div>
              )}
              <Link to="/auth" className="icon-btn user-btn" aria-label="Iniciar sesión" title="Perfil">
                <i className="fa fa-user"></i>
              </Link>
            </div>
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
