import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getProductsByCategory } from '../models/httpClient';

const PAGE_SIZE = 12;
const EAGER_COUNT = 4;
const CATEGORY_ID = 'C00005'; // Fórmula 1

// Generar datos adicionales para estilo Amazon
const generateProductData = (product, index) => {
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const reviews = Math.floor(50 + Math.random() * 500);
  const originalPrice = product.isOnSale
    ? `$${(parseFloat(product.price.replace('$', '')) * 1.3).toFixed(2)}`
    : null;
  const discount = product.isOnSale ? Math.floor(15 + Math.random() * 20) : 0;
  const isBestSeller = index % 3 === 0;

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

// Helper para generar slugs (igual que en Futbol.jsx y Product.jsx)
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

const ProductCard = ({ product, isEager }) => {
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
              loading={isEager ? "eager" : "lazy"}
              onError={(e) => { e.target.src = '/assets/images/default.webp'; }}
            />
          </figure>
        </div>
      </div>

      <div className="flex-1 px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col">
        <span className="text-[10px] sm:text-xs text-[#1a1a2e] font-medium uppercase tracking-wide">
          {product.categoria || 'Fórmula 1'}
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
    teams: ["Red Bull", "Ferrari", "Mercedes", "McLaren", "Aston Martin", "Alpine", "Williams", "Haas"],
    priceRanges: [
      { label: "Hasta $50", min: 0, max: 50 },
      { label: "$50 - $100", min: 50, max: 100 },
      { label: "Más de $100", min: 100, max: Infinity },
    ],
  };

  return (
    <aside className={isMobile ? "w-full" : "w-64 flex-shrink-0 hidden lg:block"}>
      <div className="sticky top-4 space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Escudería</h3>
          <div className="space-y-2">
            {filterOptions.teams.map((team) => (
              <label key={team} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#E10600] focus:ring-[#E10600]"
                  checked={filters.teams.includes(team)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, teams: [...filters.teams, team] });
                    } else {
                      setFilters({ ...filters, teams: filters.teams.filter(t => t !== team) });
                    }
                  }}
                />
                <span className="text-sm text-gray-700 group-hover:text-[#E10600]">{team}</span>
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
                  className="w-4 h-4 border-gray-300 text-[#E10600] focus:ring-[#E10600]"
                  checked={filters.priceRange?.label === range.label}
                  onChange={() => setFilters({ ...filters, priceRange: range })}
                />
                <span className="text-sm text-gray-700 group-hover:text-[#E10600]">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Ofertas</h3>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#E10600] focus:ring-[#E10600]"
              checked={filters.onlyOffers}
              onChange={(e) => setFilters({ ...filters, onlyOffers: e.target.checked })}
            />
            <span className="text-sm text-gray-700 group-hover:text-[#E10600]">Solo ofertas</span>
          </label>
        </div>

        <button
          onClick={() => setFilters({ teams: [], priceRange: null, onlyOffers: false })}
          className="w-full text-sm text-blue-600 hover:text-[#E10600] hover:underline"
        >
          Limpiar todos los filtros
        </button>
      </div>
    </aside>
  );
};

const Formula1 = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    teams: [],
    priceRange: null,
    onlyOffers: false,
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProductsByCategory(CATEGORY_ID);
        if (response.status === 'success' && Array.isArray(response.data)) {
          // Normalizar datos
          const normalized = response.data.map((p, i) => ({
            ...p,
            price: typeof p.precio === 'number' ? `$${p.precio}` : p.precio || '$0',
            title: p.nombre,
            image: p.imagen
          }));
          // Generar datos extra (ratings, etc)
          const enriched = normalized.map((p, i) => generateProductData(p, i));
          setProducts(enriched);
          setFilteredProducts(enriched);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (err) {
        console.error('Error al cargar productos de F1:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E10600]"></div>
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
              <h1 className="text-xl font-bold text-gray-900">Fórmula 1 Store</h1>
              <p className="text-sm text-gray-600">
                {filteredProducts.length} resultados
                {filters.teams.length > 0 && ` de "${filters.teams.join(', ')}"`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-[#E10600] focus:border-[#E10600]"
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
            <div className="bg-gradient-to-r from-[#E10600] to-[#8a0400] text-white rounded-lg p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Colección Oficial F1 2025</h2>
              <p className="text-sm text-gray-100">
                Viste los colores de tu escudería favorita. Merchandising oficial de Ferrari, Red Bull, Mercedes y más.
              </p>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {pagedProducts.map((product, i) => (
                <ProductCard key={product.id || i} product={product} isEager={i < EAGER_COUNT} />
              ))}
            </div>

            {pagedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
                <button
                  onClick={() => setFilters({ teams: [], priceRange: null, onlyOffers: false })}
                  className="mt-4 text-[#E10600] hover:underline"
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
                        ? "bg-[#E10600] text-white"
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

            {filteredProducts.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} de {filteredProducts.length} productos
              </p>
            )}
          </main>
        </div>
      </div>

      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-[#E10600] text-white px-4 py-3 rounded-full shadow-lg z-40 flex items-center gap-2 text-sm font-medium hover:bg-[#b30500] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros
      </button>

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
                className="w-full py-2 px-4 bg-[#E10600] text-white font-semibold rounded-lg hover:bg-[#b30500]"
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

export default Formula1;
