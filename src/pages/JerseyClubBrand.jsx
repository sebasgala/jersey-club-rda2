import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProductsByCategory } from '../models/httpClient';

const PAGE_SIZE = 12;

// ========================================
// LÓGICA DE PRODUCTOS JERSEY CLUB BRAND
// ========================================

const CATEGORY_ID = 'JCB1  '; // Jersey Club Brand

/**
 * Normaliza texto para comparación (quita acentos y convierte a minúsculas)
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Detecta el género del producto basándose en su nombre
 */
const detectGender = (productName) => {
  const normalized = normalizeText(productName);
  if (normalized.includes('hombre')) return 'Hombre';
  if (normalized.includes('mujer')) return 'Mujer';
  return 'Unisex';
};

/**
 * Detecta la categoría del producto basándose en su nombre
 */
const detectCategory = (productName) => {
  const normalized = normalizeText(productName);
  if (normalized.includes('camiseta')) return 'Camisetas';
  if (normalized.includes('buzo')) return 'Buzos';
  if (normalized.includes('pantaloneta')) return 'Pantalonetas';
  if (normalized.includes('gorra')) return 'Accesorios';
  if (normalized.includes('medias')) return 'Accesorios';
  return 'Ropa Deportiva';
};

// Generar datos adicionales para estilo Amazon (igual que Fútbol)
const generateProductData = (product, index) => {
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const reviews = Math.floor(50 + Math.random() * 500);

  // Normalizar campos entre fuente local y API (backend usa nombre/imagen/precio)
  const price = product.price || (product.precio ? `$${product.precio}` : '$0.00');
  const title = (product.nombre || product.title || "Producto Jersey Club").replace(/-/g, ' ');
  const image = product.imagen || product.image || "https://storage.googleapis.com/imagenesjerseyclub/default.webp";

  // Detectar género y categoría basándose en el nombre del producto
  const gender = product.gender || detectGender(title);
  const category = product.category || detectCategory(title);

  // FIX: Priorizar descuento de base de datos
  const dbDiscount = parseFloat(product.descuento || product.discount || 0);
  const hasDbDiscount = dbDiscount > 0;

  // Sincronización Estricta: Solo si viene de la DB es oferta.
  const isOnSale = hasDbDiscount;

  const discount = dbDiscount;

  const originalPrice = isOnSale
    ? `$${(parseFloat(String(price).replace('$', '').replace(',', '')) / (1 - (discount / 100))).toFixed(2)}`
    : null;
  const isBestSeller = index % 3 === 0;

  return {
    ...product,
    title,
    nombre: title,
    image,
    imagen: image,
    price,
    gender,
    category,
    isOnSale,
    rating: parseFloat(rating),
    reviews,
    originalPrice,
    discount,
    isBestSeller,
    stock: (product.stock !== undefined && product.stock > 0) ? product.stock : 25, // Asegurar stock mínimo de 25
  };
};

// ========================================
// COMPONENTES UI (COPIADOS 1:1 DE FÚTBOL)
// ========================================

// Tarjeta de producto estilo Amazon - Con guardado en localStorage
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

        {/* Imagen - MISMO ESTILO QUE FÚTBOL */}
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
        {/* Categoría */}
        <span className="text-[10px] sm:text-xs text-[#1a1a2e] font-medium uppercase tracking-wide">
          {product.category}
        </span>

        {/* Título */}
        <div className="block text-left mt-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#1a1a2e] line-clamp-2 min-h-[32px] sm:min-h-[40px]">
            {product.title}
          </h3>
        </div>

        {/* Género */}
        <span className="text-[10px] sm:text-xs text-gray-500 mt-1">
          {product.gender}
        </span>

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
        <div className="mt-auto pt-2 sm:pt-3 w-full bg-[#495A72] group-hover:bg-[#2d2d44] text-white font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[10px] sm:text-sm transition-colors shadow-sm text-center">
          Ver producto
        </div>
      </div>
    </Link>
  );
};

// Filtros laterales - Adaptados para Jersey Club Brand
const Sidebar = ({ filters, setFilters, isMobile = false }) => {
  const filterOptions = {
    categories: ["Buzos", "Camisetas", "Pantalonetas", "Accesorios"],
    genders: ["Hombre", "Mujer", "Unisex"],
    priceRanges: [
      { label: "Hasta $25", min: 0, max: 25 },
      { label: "$25 - $35", min: 25, max: 35 },
      { label: "$35 - $50", min: 35, max: 50 },
      { label: "Más de $50", min: 50, max: Infinity },
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
                  className="w-4 h-4 rounded border-gray-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
                  checked={filters.categories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, categories: [...filters.categories, category] });
                    } else {
                      setFilters({ ...filters, categories: filters.categories.filter(c => c !== category) });
                    }
                  }}
                />
                <span className="text-sm text-gray-700 group-hover:text-[#1a1a2e]">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro por género */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Género</h3>
          <div className="space-y-2">
            {filterOptions.genders.map((gender) => (
              <label key={gender} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
                  checked={filters.genders.includes(gender)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({ ...filters, genders: [...filters.genders, gender] });
                    } else {
                      setFilters({ ...filters, genders: filters.genders.filter(g => g !== gender) });
                    }
                  }}
                />
                <span className="text-sm text-gray-700 group-hover:text-[#1a1a2e]">{gender}</span>
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
                  className="w-4 h-4 border-gray-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
                  checked={filters.priceRange?.label === range.label}
                  onChange={() => setFilters({ ...filters, priceRange: range })}
                />
                <span className="text-sm text-gray-700 group-hover:text-[#1a1a2e]">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ofertas */}
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

        {/* Limpiar filtros */}
        <button
          onClick={() => setFilters({ categories: [], genders: [], priceRange: null, onlyOffers: false, searchTerm: null })}
          className="w-full text-sm text-blue-600 hover:text-[#1a1a2e] hover:underline"
        >
          Limpiar todos los filtros
        </button>
      </div>
    </aside>
  );
};

// ========================================
// COMPONENTE PRINCIPAL (ESTRUCTURA DE FÚTBOL)
// ========================================

const JerseyClubBrand = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    categories: [],
    genders: [],
    priceRange: null,
    onlyOffers: false,
    searchTerm: null,
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar productos SOLO desde la base de datos (Neon)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProductsByCategory(CATEGORY_ID);

        if (response.status === 'success' && Array.isArray(response.data)) {
          const apiProducts = response.data.map(p => ({
            ...p,
            source: 'api'
          }));

          // Enriquecer datos con género, categoría, etc.
          const enriched = apiProducts.map((p, i) => generateProductData(p, i));
          setProducts(enriched);
          setFilteredProducts(enriched);
        } else {
          console.error('Error: respuesta del backend no válida');
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (err) {
        console.error('Error al cargar productos de Jersey Club desde la base de datos:', err);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Leer query params de la URL y aplicar filtros iniciales
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    const categoria = searchParams.get('categoria');
    const buscar = searchParams.get('buscar');

    setFilters(prev => {
      const newFilters = { ...prev };
      let hasChanges = false;

      // Filtro por tipo (categoría de producto)
      if (tipo) {
        const tipoMap = {
          'camisetas': 'Camisetas',
          'accesorios': 'Accesorios',
          'buzos': 'Buzos',
          'pantalonetas': 'Pantalonetas'
        };
        const mappedTipo = tipoMap[tipo.toLowerCase()] || tipo;
        if (!prev.categories.includes(mappedTipo)) {
          newFilters.categories = [mappedTipo];
          hasChanges = true;
        }
      }

      // Filtro por género
      if (categoria) {
        const generoMap = { 'hombre': 'Hombre', 'mujer': 'Mujer' };
        const mappedGenero = generoMap[categoria.toLowerCase()] || categoria;
        if (!prev.genders.includes(mappedGenero)) {
          newFilters.genders = [mappedGenero];
          hasChanges = true;
        }
      }

      // Filtro por búsqueda de nombre
      if (buscar && prev.searchTerm !== buscar) {
        newFilters.searchTerm = buscar;
        hasChanges = true;
      }

      return hasChanges ? newFilters : prev;
    });
  }, [searchParams]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let result = [...products];

    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }

    if (filters.genders.length > 0) {
      result = result.filter(p => filters.genders.includes(p.gender));
    }

    if (filters.onlyOffers) {
      result = result.filter(p => p.isOnSale);
    }

    if (filters.priceRange) {
      result = result.filter(p => {
        const priceStr = typeof p.price === 'string' ? p.price : `$${p.price}`;
        const price = parseFloat(priceStr.replace('$', ''));
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // Filtro por término de búsqueda (nombre del producto)
    if (filters.searchTerm) {
      const searchNormalized = filters.searchTerm
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\+/g, ' ');

      result = result.filter(p => {
        const titleNormalized = (p.title || p.nombre || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return titleNormalized.includes(searchNormalized);
      });
    }

    // Ordenar
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => {
          const pA = parseFloat(String(a.price).replace('$', ''));
          const pB = parseFloat(String(b.price).replace('$', ''));
          return pA - pB;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const pA = parseFloat(String(a.price).replace('$', ''));
          const pB = parseFloat(String(b.price).replace('$', ''));
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

    return result;
  }, [products, filters, sortBy]);

  useEffect(() => {
    setFilteredProducts(applyFilters());
    setCurrentPage(1);
  }, [applyFilters]);

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
            <span className="ml-3 text-gray-600">Cargando productos de la marca...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header de resultados estilo Amazon - IGUAL QUE FÚTBOL */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Jersey Club Brand</h1>
              <p className="text-sm text-gray-600">
                {filteredProducts.length} resultados
                {filters.categories.length > 0 && ` en "${filters.categories.join(', ')}"`}
              </p>
            </div>

            {/* Ordenar por */}
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

      {/* Contenido principal - MISMO LAYOUT QUE FÚTBOL */}
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar de filtros */}
          <Sidebar filters={filters} setFilters={setFilters} />

          {/* Grid de productos */}
          <main className="flex-1">
            {/* Banner promocional Jersey Club Brand */}
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white rounded-lg p-4 sm:p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Colección Jersey Club Brand</h2>
              <p className="text-sm text-gray-300">
                Diseños exclusivos creados por Jersey Club EC. Ropa deportiva de alta calidad para entrenar con estilo.
              </p>
            </div>

            {/* Grid - MISMO QUE FÚTBOL: 3 columnas en lg */}
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {pagedProducts.map((product, i) => (
                <ProductCard key={product.id || i} product={product} />
              ))}
            </div>

            {/* Estado vacío */}
            {pagedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
                <button
                  onClick={() => setFilters({ categories: [], genders: [], priceRange: null, onlyOffers: false, searchTerm: null })}
                  className="mt-4 text-[#1a1a2e] hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Paginación - IGUAL QUE FÚTBOL */}
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
                          ? "bg-[#1a1a2e] text-white"
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
            {filteredProducts.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} de {filteredProducts.length} productos
              </p>
            )}
          </main>
        </div>
      </div>

      {/* Botón para abrir filtros en móvil - IGUAL QUE FÚTBOL */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-[#1a1a2e] text-white px-4 py-3 rounded-full shadow-lg z-40 flex items-center gap-2 text-sm font-medium hover:bg-[#2d2d44] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros
      </button>

      {/* Modal deslizante de filtros para móvil - IGUAL QUE FÚTBOL */}
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

export default JerseyClubBrand;
