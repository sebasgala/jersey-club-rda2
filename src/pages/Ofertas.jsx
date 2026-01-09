import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

// Importar productos de todas las fuentes
import footballProducts from "../data/footballProducts";
import formula1Products from "../data/formula1Products";
import { jerseyClubGeneratedProducts } from "../data/jerseyClubGeneratedProducts";

// Importar utilidad de búsqueda global
import { searchProducts } from "../utils/allProductsUnified";

const PAGE_SIZE = 12;

// ========================================
// FUENTE UNIFICADA DE PRODUCTOS
// ========================================

// Generar datos adicionales para estilo Amazon (incluye ID único)
const generateProductData = (product, index, prefix) => {
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const reviews = Math.floor(100 + Math.random() * 2000);
  const originalPrice = product.isOnSale
    ? `$${(parseFloat(product.price.replace('$', '')) * 1.4).toFixed(2)}`
    : null;
  const discount = product.isOnSale ? Math.floor(20 + Math.random() * 15) : 0;
  const isBestSeller = index % 7 === 0;

  return {
    ...product,
    id: product.id || `${prefix}-${index}`, // Usar ID existente o generar uno
    rating: parseFloat(rating),
    reviews,
    originalPrice,
    discount,
    isBestSeller,
    stock: product.stock !== undefined ? product.stock : 0, // Stock real
    source: prefix, // Para identificar de dónde viene el producto
  };
};

// Función helper para detectar si un producto está en oferta
const isOnOffer = (product) => {
  // Detectar oferta según los campos que existen en el proyecto
  if (product.isOnSale === true) return true;
  if (product.onSale === true) return true;
  if (product.isOffer === true) return true;
  if (product.discountPercentage && product.discountPercentage > 0) return true;
  if (product.discount && product.discount > 0) return true;
  return false;
};

// Unificar todos los productos del ecommerce
const getAllProducts = () => {
  const allProducts = [
    // Productos de Fútbol
    ...footballProducts.map((p, i) => generateProductData(p, i, 'fb')),
    // Productos de Fórmula 1
    ...formula1Products.map((p, i) => generateProductData(p, i, 'f1')),
    // Productos de Jersey Club Brand
    ...jerseyClubGeneratedProducts.map((p, i) => generateProductData(p, i, 'jcb')),
  ];
  return allProducts;
};

// Obtener solo productos en oferta
const getOfferProducts = () => {
  return getAllProducts().filter(isOnOffer);
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
          <div className="absolute top-0 left-0 z-20 bg-[#E10600] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-tl-lg rounded-br-lg">
            ¡Oferta!
          </div>
        )}
        {product.isOnSale && !product.isBestSeller && (
          <div className="absolute top-0 left-0 z-20 bg-[#BF1919] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-tl-lg rounded-br-lg">
            -{product.discount}%
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
              onError={(e) => { e.target.src = '/assets/images/default.webp'; }}
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
                <span className="text-lg sm:text-2xl font-bold text-gray-900">{product.price}</span>
                <span className="text-[10px] sm:text-sm text-gray-500 line-through">{product.originalPrice}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#E10600] font-medium">
                ¡Oferta!
              </p>
            </div>
          ) : (
            <span className="text-lg sm:text-2xl font-bold text-gray-900">{product.price}</span>
          )}
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
    demand: [4, 3, 2, 1],
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

        {/* Filtro por demandadas */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Valoración</h3>
          <div className="space-y-2">
            {filterOptions.demand.map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="demand"
                  className="w-4 h-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                  checked={filters.minDemand === rating}
                  onChange={() => setFilters({ ...filters, minDemand: rating })}
                />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-700">{rating} estrellas y más</span>
                </div>
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
    const equipo = searchParams.get('equipo');
    const search = searchParams.get('search');

    const newFilters = { ...filters };
    let hasChanges = false;

    // Si hay búsqueda global, actualizar el estado
    if (search && search !== filters.searchTerm) {
      newFilters.searchTerm = search;
      hasChanges = true;
    } else if (!search && filters.searchTerm) {
      newFilters.searchTerm = "";
      hasChanges = true;
    }

    // Si hay categoría en URL, aplicar filtro
    if (categoria) {
      // Mapear nombre de categoría al formato esperado
      const categoryMap = {
        'Fútbol': 'Fútbol',
        'Fórmula': 'Fórmula 1',
        'Formula': 'Fórmula 1',
        'JerseyClub': 'Jersey Club',
      };
      const mappedCategory = categoryMap[categoria] || categoria;
      if (!filters.categories.includes(mappedCategory)) {
        newFilters.categories = [mappedCategory];
        hasChanges = true;
      }
    }

    // Si hay equipo en URL, se puede usar para búsqueda futura
    // Por ahora solo aplicamos la categoría base

    if (hasChanges) {
      setFilters(newFilters);
    }
  }, [searchParams, filters]); // Solo ejecutar cuando cambian los params o filtros externos

  const [searchResults, setSearchResults] = useState([]);

  // Obtener productos base según modo (búsqueda global vs ofertas)
  useEffect(() => {
    const fetchBaseProducts = async () => {
      if (isGlobalSearch) {
        try {
          // Modo búsqueda global: buscar en TODOS los productos (ahora asíncrono)
          const results = await searchProducts(globalSearchTerm);
          // Agregar datos adicionales para visualización
          setSearchResults(results.map((product, index) => generateProductData(product, index, product.source || 'fb')));
        } catch (error) {
          console.error("Error en búsqueda global:", error);
          setSearchResults([]);
        }
      } else {
        // Modo normal: solo productos en oferta
        setSearchResults(getOfferProducts());
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
        const category = p.source === 'fb' ? 'Fútbol' : p.source === 'f1' ? 'Fórmula 1' : 'Jersey Club';
        return filters.categories.includes(category);
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
              <div className="bg-gradient-to-r from-[#E10600] to-[#BF1919] rounded-lg p-4 sm:p-6 mb-4 text-white">
                <h2 className="text-lg sm:text-xl font-bold mb-1">🎉 ¡Aprovecha nuestras ofertas!</h2>
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
