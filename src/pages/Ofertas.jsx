import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getProducts } from '../models/httpClient';
import { searchProducts } from "../utils/allProductsUnified";

const PAGE_SIZE = 12;

// ========================================
// FUENTE DINÁMICA DE PRODUCTOS (API)
// ========================================

// Generar datos adicionales para estilo Amazon (incluye ID único)


// Helper para normalizar datos de API a vista
const normalizeProduct = (p, index) => {
  // Datos normalizados desde el backend
  const discount = parseFloat(p.descuento || p.discount || 0);
  const price = parseFloat(p.precio || p.price || 0);
  const categoryName = p.categoria || p.category || '';

  // Calcular precio original basado en el descuento
  const originalPrice = discount > 0
    ? (price / (1 - (discount / 100))).toFixed(2)
    : null;

  // Determinar source real
  let source = 'fb'; // fútbol por defecto
  if (categoryName.toLowerCase().includes('fórmula') || categoryName.toLowerCase().includes('formula')) source = 'f1';
  if (categoryName.toLowerCase().includes('jersey club')) source = 'jcb';

  return {
    ...p,
    id: p.id || p.id_producto,
    title: p.nombre || p.title,
    price: `$${price.toFixed(2)}`,
    originalPrice: originalPrice ? `$${originalPrice}` : null,
    image: p.imagen || p.image || 'https://storage.googleapis.com/imagenesjerseyclub/default.webp',
    discount: discount,
    isOnSale: discount > 0,
    stock: p.stock || 0,
    rating: 4.5,
    reviews: 100,
    source: source
  };
};

// ========================================
// COMPONENTES UI (COPIADOS 1:1 DE FÚTBOL)
// ========================================

// Tarjeta de producto estilo Amazon - Con Link para navegar a página de producto
const ProductCard = ({ product }) => {
  // Guardar producto en localStorage al hacer click para fallback en Product.jsx
  const handleClick = () => {
    try {
      localStorage.setItem("lastSelectedProduct", JSON.stringify(product));
    } catch (e) {
      console.warn("Error guardando producto en localStorage:", e);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={handleClick}
      className="group bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Badges superiores */}
      <div className="relative">
        {product.isBestSeller && (
          <div className="absolute top-0 left-0 z-20 bg-[#E10600] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-tl-lg rounded-br-lg shadow-md">
            {product.isOnSale ? `¡Oferta! -${product.discount}%` : 'Best Seller'}
          </div>
        )}
        {product.isOnSale && !product.isBestSeller && (
          <div className="absolute top-0 left-0 z-20 bg-[#BF1919] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-tl-lg rounded-br-lg shadow-md">
            -{product.discount}%
          </div>
        )}

        {product.isOnSale && (
          <div className="absolute top-0 right-0 z-20 bg-[#BF1919] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-tr-lg rounded-bl-lg shadow-md animate-pulse">
            OFERTA
          </div>
        )}

        {/* Imagen */}
        <div className="block p-2 sm:p-4 pb-1 sm:pb-2 w-full">
          <figure className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-50">
            <img
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              src={product.image}
              alt={product.title}
              loading="lazy"
              onError={(e) => { e.target.src = 'https://storage.googleapis.com/imagenesjerseyclub/default.webp'; }}
            />
          </figure>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col">
        {/* Categoría/Fuente */}
        <span className="text-[10px] sm:text-xs text-[#495A72] font-medium uppercase tracking-wide">
          {product.source === 'fb' ? 'Fútbol' : product.source === 'f1' ? 'Fórmula 1' : 'Jersey Club'}
        </span>

        {/* Título */}
        <div className="block text-left mt-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
            {product.title}
          </h3>
        </div>

        {/* Precio */}
        <div className="mt-2 sm:mt-3">
          {product.isOnSale ? (
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold text-gray-900">
                  {`$${(parseFloat(String(product.price || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
                </span>
                <span className="text-[10px] sm:text-sm text-gray-500 line-through">
                  {product.originalPrice ? `$${(parseFloat(String(product.originalPrice).replace('$', '').replace(',', '')) || 0).toFixed(2)}` : ''}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#E10600] font-bold">
                ¡Oferta! -{product.discount}%
              </p>
            </div>
          ) : (
            <span className="text-lg sm:text-2xl font-bold text-gray-900">
              {`$${(parseFloat(String(product.price || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
            </span>
          )}
        </div>

        <div className="mt-1 mb-2">
          <span className={`text-[10px] sm:text-xs font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-[#007600]'}`}>
            {product.stock <= 5 ? `¡Solo quedan ${product.stock}!` : `Stock: ${product.stock} unidades`}
          </span>
        </div>

        {/* Botón ver producto */}
        <div className="mt-auto pt-2 sm:pt-3 w-full bg-[#495A72] group-hover:bg-[#3E4E63] text-white font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[10px] sm:text-sm transition-colors shadow-sm text-center">
          Ver producto
        </div>
      </div>
    </Link>
  );
};

// Filtros laterales - Adaptados para Ofertas (sin filtro de equipos específicos)
const Sidebar = ({ filters, setFilters, isMobile = false }) => {
  const filterOptions = {
    categories: ["Fútbol", "Fórmula 1", "Jersey Club"],
    priceRanges: [
      { label: "Hasta $30", min: 0, max: 30 },
      { label: "$30 - $50", min: 30, max: 50 },
      { label: "$50 - $80", min: 50, max: 80 },
      { label: "Más de $80", min: 80, max: Infinity },
    ],
  };

  return (
    <aside className={isMobile ? "w-full" : "w-64 flex-shrink-0 hidden lg:block"}>
      <div className="sticky top-4 space-y-6">
        {/* Filtro por categoría */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Categoría</h3>
          <div className="space-y-2">
            {filterOptions.categories.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  checked={filters.categories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, categories: [...filters.categories, category] });
                    } else {
                      setFilters({ ...filters, categories: filters.categories.filter(c => c !== category) });
                    }
                  }}
                />
                <span className="text-sm text-gray-700 group-hover:text-orange-600">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por precio */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Precio</h3>
          <div className="space-y-2">
            {filterOptions.priceRanges.map((range) => (
              <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="priceRange"
                  className="w-4 h-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                  checked={filters.priceRange?.label === range.label}
                  onChange={() => setFilters({ ...filters, priceRange: range })}
                />
                <span className="text-sm text-gray-700 group-hover:text-orange-600">{range.label}</span>
              </label>
            ))}
          </div>
        </div>


        {/* Limpiar filtros */}
        <button
          onClick={() => setFilters({ categories: [], priceRange: null, minDemand: null, searchTerm: "" })}
          className="w-full text-sm text-blue-600 hover:text-orange-600 hover:underline"
        >
          Limpiar todos los filtros
        </button>
      </div>
    </aside>
  );
};

// ========================================
// COMPONENTE PRINCIPAL - OFERTAS
// ========================================

const Ofertas = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: null,
    minDemand: null,
    searchTerm: "", // Término de búsqueda global
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Detectar si estamos en modo búsqueda global
  const globalSearchTerm = searchParams.get('search') || "";
  const isGlobalSearch = globalSearchTerm.trim() !== "";

  // Leer query params de la URL y aplicar filtros iniciales
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');

    setFilters(prev => {
      const newFilters = { ...prev };
      let hasChanges = false;

      if (search && search !== prev.searchTerm) {
        newFilters.searchTerm = search;
        hasChanges = true;
      } else if (!search && prev.searchTerm) {
        newFilters.searchTerm = "";
        hasChanges = true;
      }

      if (categoria) {
        const categoryMap = {
          'Fútbol': 'Fútbol',
          'Fórmula': 'Fórmula 1',
          'Formula': 'Fórmula 1',
          'JerseyClub': 'Jersey Club',
        };
        const mappedCategory = categoryMap[categoria] || categoria;
        if (!prev.categories.includes(mappedCategory)) {
          newFilters.categories = [mappedCategory];
          hasChanges = true;
        }
      }

      return hasChanges ? newFilters : prev;
    });
  }, [searchParams]);

  const [searchResults, setSearchResults] = useState([]);

  // Obtener productos base según modo (búsqueda global vs ofertas)
  // Obtener productos base según modo (búsqueda global vs ofertas)
  useEffect(() => {
    const fetchBaseProducts = async () => {
      try {
        if (isGlobalSearch) {
          // Modo búsqueda global: Usa el utilitario unificado
          const results = await searchProducts(globalSearchTerm);
          setSearchResults(results.map((product, index) => normalizeProduct(product, index)));
        } else {
          // MODO OFERTAS ESTRICTO: Solo productos de la BASE DE DATOS con descuento > 0
          const response = await getProducts();

          if (response && response.status === 'success' && Array.isArray(response.data)) {
            const allDbProducts = response.data;

            // Filtrar solo los que tienen descuento > 0
            const onlyOffers = allDbProducts
              .filter(p => {
                const disc = parseFloat(p.descuento || p.discount || 0);
                return disc > 0;
              })
              .map((p, i) => normalizeProduct(p, i));

            setSearchResults(onlyOffers);
          } else {
            setSearchResults([]);
          }
        }
      } catch (error) {
        console.error("Error cargando productos de ofertas:", error);
        setSearchResults([]);
      }
    };

    fetchBaseProducts();
  }, [isGlobalSearch, globalSearchTerm]);

  // Aplicar filtros a los resultados cargados
  const filteredProducts = useMemo(() => {
    let result = [...searchResults];

    // Filtro por categoría
    if (filters.categories.length > 0) {
      result = result.filter(p => {
        const sourceMap = { 'fb': 'Fútbol', 'f1': 'Fórmula 1', 'jcb': 'Jersey Club' };
        const categoryLabel = sourceMap[p.source] || 'Fútbol';
        return filters.categories.includes(categoryLabel);
      });
    }

    // Filtro por precio
    if (filters.priceRange) {
      result = result.filter(p => {
        const price = parseFloat(p.price.replace('$', ''));
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // Filtro por valoración
    if (filters.minDemand) {
      result = result.filter(p => p.rating >= filters.minDemand);
    }

    // Ordenar
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case "price-high":
        result.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      case "discount":
        result.sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }

    return result;
  }, [searchResults, filters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header de resultados estilo Amazon */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              {isGlobalSearch ? (
                <>
                  <h1 className="text-xl font-bold text-gray-900">
                    🔍 Resultados para: "{globalSearchTerm}"
                  </h1>
                  <p className="text-sm text-gray-600">
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                    {filters.categories.length > 0 && ` en "${filters.categories.join(', ')}"`}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-gray-900">🔥 Ofertas y Descuentos</h1>
                  <p className="text-sm text-gray-600">
                    {filteredProducts.length} productos en oferta
                    {filters.categories.length > 0 && ` en "${filters.categories.join(', ')}"`}
                  </p>
                </>
              )}
            </div>

            {/* Ordenar por */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="featured">Destacados</option>
                <option value="discount">Mayor descuento</option>
                <option value="price-low">Precio: de menor a mayor</option>
                <option value="price-high">Precio: de mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="reviews">Más reseñas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar de filtros */}
          <Sidebar filters={filters} setFilters={setFilters} />

          {/* Grid de productos */}
          <main className="flex-1">
            {/* Banner - Solo mostrar en modo ofertas */}
            {!isGlobalSearch && (
              <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-lg p-4 sm:p-6 mb-4 text-white">
                <h2 className="text-lg sm:text-xl font-bold mb-1">Aprovecha nuestras ofertas!</h2>
                <p className="text-sm opacity-90">Productos de todas las categorías con descuentos exclusivos</p>
              </div>
            )}

            {/* Banner de búsqueda - Solo mostrar en modo búsqueda */}
            {isGlobalSearch && (
              <div className="bg-gradient-to-r from-[#495A72] to-[#3E4E63] rounded-lg p-4 sm:p-6 mb-4 text-white">
                <h2 className="text-lg sm:text-xl font-bold mb-1">🔍 Búsqueda Global</h2>
                <p className="text-sm opacity-90">
                  Mostrando resultados de Fútbol, Fórmula 1 y Jersey Club Brand
                </p>
              </div>
            )}

            {/* Estado vacío */}
            {pagedProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">{isGlobalSearch ? '🔍' : '😔'}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isGlobalSearch
                    ? `No se encontraron productos para "${globalSearchTerm}"`
                    : 'No hay ofertas disponibles'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isGlobalSearch
                    ? 'Intenta con otros términos de búsqueda o explora nuestras categorías.'
                    : 'No encontramos productos en oferta con los filtros seleccionados.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/futbol"
                    className="inline-block bg-[#495A72] hover:bg-[#3d4d61] text-white font-medium py-2 px-6 rounded-full transition-colors"
                  >
                    Ver Fútbol
                  </Link>
                  <Link
                    to="/formula1"
                    className="inline-block bg-[#E10600] hover:bg-[#c00500] text-white font-medium py-2 px-6 rounded-full transition-colors"
                  >
                    Ver Fórmula 1
                  </Link>
                  <Link
                    to="/"
                    className="inline-block border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-full transition-colors"
                  >
                    Ir al inicio
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {pagedProducts.map((product, i) => (
                    <ProductCard key={product.id || i} product={product} />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-1 sm:gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 bg-white text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <span className="hidden sm:inline">← Anterior</span>
                      <span className="sm:hidden">←</span>
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${currentPage === pageNum
                              ? "bg-black text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 bg-white text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <span className="hidden sm:inline">Siguiente →</span>
                      <span className="sm:hidden">→</span>
                    </button>
                  </div>
                )}

                {/* Info de página */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} de {filteredProducts.length} productos
                </p>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Botón para abrir filtros en móvil */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-black text-white px-4 py-3 rounded-full shadow-lg z-40 flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros
      </button>

      {/* Modal deslizante de filtros para móvil */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="w-full sm:w-3/4 max-w-md bg-white h-full shadow-lg transform transition-transform duration-300 translate-x-0 relative flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Sidebar filters={filters} setFilters={setFilters} isMobile={true} />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Ofertas;
