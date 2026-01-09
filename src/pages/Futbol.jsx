import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProductsByCategory } from '../models/httpClient';
import PromoSection from "../components/PromoSection";

const PAGE_SIZE = 12;
const CATEGORY_ID = 'C00004'; // Fútbol

// Generar datos adicionales
const generateProductData = (product, index) => {
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const reviews = Math.floor(100 + Math.random() * 2000);
  const originalPrice = product.isOnSale
    ? `$${(parseFloat(product.price.replace('$', '')) * 1.4).toFixed(2)}`
    : null;
  const discount = product.isOnSale ? Math.floor(20 + Math.random() * 15) : 0;
  const isBestSeller = index % 7 === 0;

  return {
    ...product,
    rating: parseFloat(rating),
    reviews,
    originalPrice,
    discount,
    isBestSeller,
    stock: product.stock !== undefined ? product.stock : 0, // Stock real
  };
};

// Helper para generar slugs (igual que en Product.jsx)
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

const ProductCard = ({ product }) => {
  const handleClick = () => {
    try {
      localStorage.setItem("lastSelectedProduct", JSON.stringify(product));
    } catch (e) {
      console.warn("Error guardando producto en localStorage:", e);
    }
  };

  // Usar ID para la navegación directa (más fiable para productos creados por el backend)
  const productId = product.id;

  return (
    <Link
      to={`/product/${productId}`}
      onClick={handleClick}
      className="group bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
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

        <div className="block p-2 sm:p-4 pb-1 sm:pb-2 w-full">
          <figure className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-50">
            <img
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              src={product.imagen || product.image || '/assets/images/default.webp'}
              alt={product.nombre || product.title}
              loading="lazy"
              onError={(e) => { e.target.src = '/assets/images/default.webp'; }}
            />
          </figure>
        </div>
      </div>

      <div className="flex-1 px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col">
        <span className="text-[10px] sm:text-xs text-[#1a1a2e] font-medium uppercase tracking-wide">
          {product.categoria || 'Fútbol'}
        </span>

        <div className="block text-left mt-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#1a1a2e] line-clamp-2 min-h-[32px] sm:min-h-[40px]">
            {product.nombre || product.title}
          </h3>
        </div>

        <div className="mt-2 sm:mt-3">
          {product.isOnSale ? (
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold text-gray-900">{typeof product.precio === 'number' ? `$${product.precio}` : product.precio}</span>
                <span className="text-[10px] sm:text-sm text-gray-500 line-through">{product.originalPrice}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#E10600] font-medium">
                ¡Oferta!
              </p>
            </div>
          ) : (
            <span className="text-lg sm:text-2xl font-bold text-gray-900">{typeof product.precio === 'number' ? `$${product.precio}` : product.precio}</span>
          )}
        </div>

        <div className="mt-auto pt-2 sm:pt-3 w-full bg-[#495A72] group-hover:bg-[#2d2d44] text-white font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[10px] sm:text-sm transition-colors shadow-sm text-center">
          Ver producto
        </div>
      </div>
    </Link>
  );
};

const Sidebar = ({ filters, setFilters, isMobile = false }) => {
  const filterOptions = {
    teams: ["Real Madrid", "Barcelona", "Manchester City", "Arsenal", "Liverpool", "Bayern Munich", "PSG", "Boca Juniors", "River Plate", "Emelec", "Barcelona SC", "LDU"],
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
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Equipo</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filterOptions.teams.map((team) => (
              <label key={team} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
                  checked={filters.teams.includes(team)}
                  onChange={(e) => {
                    setFilters((prev) => {
                      const updatedTeams = e.target.checked
                        ? [...prev.teams, team]
                        : prev.teams.filter((t) => t !== team);
                      return { ...prev, teams: updatedTeams };
                    });
                  }}
                />
                <span className="text-sm text-gray-700 group-hover:text-[#1a1a2e]">{team}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Precio</h3>
          <div className="space-y-2">
            {filterOptions.priceRanges.map((range) => (
              <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="priceRange"
                  className="w-4 h-4 border-gray-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
                  checked={filters.priceRange?.label === range.label}
                  onChange={() => setFilters({ ...filters, priceRange: range })}
                />
                <span className="text-sm text-gray-700 group-hover:text-[#1a1a2e]">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Ofertas</h3>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
              checked={filters.onlyOffers}
              onChange={(e) => setFilters({ ...filters, onlyOffers: e.target.checked })}
            />
            <span className="text-sm text-gray-700 group-hover:text-[#1a1a2e]">Solo ofertas</span>
          </label>
        </div>

        <button
          onClick={() => setFilters({ teams: [], priceRange: null, onlyOffers: false, coleccion: null, tipo: null })}
          className="w-full text-sm text-blue-600 hover:text-[#1a1a2e] hover:underline"
        >
          Limpiar todos los filtros
        </button>
      </div>
    </aside>
  );
};

const Futbol = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    teams: [],
    priceRange: null,
    onlyOffers: false,
    coleccion: null,
    tipo: null,
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // UNIFIED FETCH STRATEGY: Get all products, filter by category locally or let backend handle it
  // Since we fixed getProductsByCategory in the backend, we can rely on it.
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProductsByCategory(CATEGORY_ID);
        if (response.status === 'success' && Array.isArray(response.data)) {
          // Normalizar e hidratar datos
          const normalized = response.data.map((p, i) => ({
            ...p,
            price: typeof p.precio === 'number' ? `$${p.precio}` : p.precio || '$0',
            title: p.nombre || p.title,
            image: p.imagen || p.image || '/assets/images/default.webp'
          }));

          const enriched = normalized.map((p, i) => generateProductData(p, i));
          setProducts(enriched);
          setFilteredProducts(enriched);
        } else {
          console.warn("Respuesta inesperada al cargar productos:", response);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error al cargar productos de Fútbol:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Leer query params
  useEffect(() => {
    const equipo = searchParams.get('equipo');
    const onSale = searchParams.get('onSale');
    const coleccion = searchParams.get('coleccion');
    const tipo = searchParams.get('tipo');

    const newFilters = { ...filters };
    let hasChanges = false;

    if (equipo && !filters.teams.includes(equipo)) {
      newFilters.teams = [equipo];
      hasChanges = true;
    }

    if (onSale === 'true') {
      newFilters.onlyOffers = true;
      hasChanges = true;
    }

    if (coleccion) {
      newFilters.coleccion = coleccion;
      hasChanges = true;
    }

    if (tipo === 'retro') {
      newFilters.tipo = 'retro';
      hasChanges = true;
    }

    if (hasChanges) {
      setFilters(newFilters);
    }
  }, [searchParams]);

  // Aplicar filtros
  useEffect(() => {
    let result = [...products];

    if (filters.teams.length > 0) {
      result = result.filter(p =>
        filters.teams.some(team => (p.nombre || p.title).toLowerCase().includes(team.toLowerCase()))
      );
    }

    if (filters.onlyOffers) {
      result = result.filter(p => p.isOnSale);
    }

    if (filters.coleccion) {
      result = result.filter(p =>
        (p.nombre || p.title).toLowerCase().includes(filters.coleccion.toLowerCase())
      );
    }

    // Filtro retro (años <= 2015)
    if (filters.tipo === 'retro') {
      result = result.filter(p => {
        const yearMatch = (p.nombre || p.title).match(/\b(\d{4})\b/);
        return yearMatch && parseInt(yearMatch[1]) <= 2015;
      });
    }

    if (filters.priceRange) {
      result = result.filter(p => {
        const priceStr = typeof p.precio === 'string' ? p.precio : `$${p.precio}`;
        const price = parseFloat(priceStr.replace('$', ''));
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // Ordenar
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => {
          const pA = parseFloat((typeof a.precio === 'string' ? a.precio : `$${a.precio}`).replace('$', ''));
          const pB = parseFloat((typeof b.precio === 'string' ? b.precio : `$${b.precio}`).replace('$', ''));
          return pA - pB;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const pA = parseFloat((typeof a.precio === 'string' ? a.precio : `$${a.precio}`).replace('$', ''));
          const pB = parseFloat((typeof b.precio === 'string' ? b.precio : `$${b.precio}`).replace('$', ''));
          return pB - pA;
        });
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, filters, sortBy]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a2e]"></div>
            <span className="ml-3 text-gray-600">Cargando productos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Camisetas de Fútbol</h1>
              <p className="text-sm text-gray-600">
                {filteredProducts.length} resultados
                {filters.teams.length > 0 && ` para "${filters.teams.join(', ')}"`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-[#1a1a2e] focus:border-[#1a1a2e]"
              >
                <option value="featured">Destacados</option>
                <option value="price-low">Precio: de menor a mayor</option>
                <option value="price-high">Precio: de mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="reviews">Más reseñas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <Sidebar filters={filters} setFilters={setFilters} />

          <main className="flex-1">
            <PromoSection onApplyFilter={() => setFilters({ ...filters, onlyOffers: true })} />

            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {pagedProducts.map((product, i) => (
                <ProductCard
                  key={product.id || i}
                  product={product}
                />
              ))}
            </div>

            {pagedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
                <button
                  onClick={() => setFilters({ teams: [], priceRange: null, onlyOffers: false, coleccion: null, tipo: null })}
                  className="mt-4 text-[#1a1a2e] hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

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

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${currentPage === i + 1
                        ? "bg-[#1a1a2e] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
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
            {filteredProducts.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} de {filteredProducts.length} productos
              </p>
            )}
          </main>
        </div>
      </div>

      {/* Botón para abrir filtros en móvil */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-[#1a1a2e] text-white px-4 py-3 rounded-full shadow-lg z-40 flex items-center gap-2 text-sm font-medium hover:bg-[#2d2d44] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros
      </button>

      {/* Modal deslizante de filtros para móvil */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-full sm:w-3/4 max-w-md bg-white h-full shadow-lg transform transition-transform duration-300 translate-x-0 relative flex flex-col">
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
                className="w-full py-2 px-4 bg-[#1a1a2e] text-white font-semibold rounded-lg hover:bg-[#2d2d44]"
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

export default Futbol;
