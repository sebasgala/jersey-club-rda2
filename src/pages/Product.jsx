import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductDetails } from "../controllers";
import Button from "../components/ui/button";
import { useCart } from "../context/CartContext";

// Importar datos de productos estáticos
import footballProducts from "../data/footballProducts";
import formula1Products from "../data/formula1Products";
import jerseyClubProducts from "../data/jerseyClubProducts";

/**
 * Genera un slug a partir del título
 */
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

/**
 * Enriquece un producto con datos adicionales
 */
const enrichProduct = (p, category = 'general') => {
  const basePrice = p.price ? parseFloat(String(p.price).replace('$', '')) : p.precio || 0;
  const title = p.title || p.name || p.nombre || 'Producto';
  const slug = generateSlug(title);

  return {
    ...p,
    id: p.id || slug,
    slug,
    title,
    name: title,
    category: p.category || category,
    price: typeof p.price === 'string' ? p.price : `$${basePrice.toFixed(2)}`,
    priceNumber: basePrice,
    image: p.image || p.imagen || '/assets/images/default.webp',
    rating: p.rating || (3.5 + Math.random() * 1.5),
    reviews: p.reviews || Math.floor(100 + Math.random() * 2000),
    originalPrice: p.isOnSale ? `$${(basePrice * 1.3).toFixed(2)}` : p.originalPrice || null,
    sizes: p.sizes || [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true },
      { name: "XXL", available: true }
    ],
    stock: p.stock || Math.floor(5 + Math.random() * 20),
    isOnSale: p.isOnSale || false,
    discount: p.discount || (p.isOnSale ? 20 : 0),
    description: p.description || p.descripcion || `${title} - Camiseta oficial de alta calidad`,
    // Mapping backend fields (Spanish) to UI fields (English)
    team: p.team || p.equipo || null,
    season: p.season || p.temporada || null,
    gender: p.gender || p.genero || 'Unisex'
  };
};

/**
 * Busca un producto por ID/slug en los datos locales
 */
const findProductInLocalData = (idOrSlug) => {
  // Combinar todos los productos
  const allProducts = [
    ...footballProducts.map(p => enrichProduct(p, 'futbol')),
    ...formula1Products.map(p => enrichProduct(p, 'formula1')),
    ...jerseyClubProducts.map(p => enrichProduct(p, 'jersey-club'))
  ];

  // Buscar por ID exacto, slug, o título normalizado
  const searchSlug = idOrSlug.toLowerCase();

  return allProducts.find(p =>
    p.id === idOrSlug ||
    p.slug === searchSlug ||
    generateSlug(p.title) === searchSlug ||
    p.title?.toLowerCase() === searchSlug
  );
};

/**
 * =====================================================
 * PÁGINA DE DETALLE DE PRODUCTO - 100% RESPONSIVE
 * =====================================================
 * 
 * CAMBIOS PRINCIPALES:
 * - ELIMINADO: Modal, overlay, fixed, estados open/close
 * - AGREGADO: useParams() para obtener ID desde URL
 * - AGREGADO: useNavigate() para botón "Volver"
 * - LAYOUT: Página completa con grid responsive
 * - CONTENEDOR: w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8
 * - SIN: overflow-hidden, max-h fijos, widths en px
 */
export default function Product() {
  // Obtener ID del producto desde la URL
  const { id } = useParams();
  const navigate = useNavigate();

  // Hook del carrito
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  // Estados del producto
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de selección
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");

  // Buscar producto por ID
  useEffect(() => {
    const obtenerProducto = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Primero buscar en datos locales estáticos
        const localProduct = findProductInLocalData(id);

        if (localProduct) {
          setProduct(localProduct);
          setMainImage(localProduct.image);
          setSelectedColor(localProduct.colors?.[0] || null);
          setLoading(false);
          return;
        }

        // 2. Si no está en local, intentar con la API del backend por ID directo
        // Si el ID parece un slug (contiene guiones), quizás falle, pero intentamos igual.
        const data = await fetchProductDetails(id);
        if (data) {
          const enrichedData = enrichProduct(data);
          setProduct(enrichedData);
          setMainImage(enrichedData.image);
          setSelectedColor(enrichedData.colors?.[0] || null);
        } else {
          // 3. Fallback: El ID podría ser un slug y el backend solo acepta IDs.
          // Buscamos TODOS los productos del backend para encontrar el match por slug.
          // Nota: Esto no es lo más optimizado para producción masiva, pero resuelve el problema actual.
          try {
            // Importamos dinámicamente o usamos fetch directo para evitar dependencias circulares complejas
            const res = await fetch('/api/productos');
            const result = await res.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
              const allBackendProducts = result.data.map(p => enrichProduct(p));
              const searchSlug = id.toLowerCase();

              const found = allBackendProducts.find(p =>
                p.id === id ||
                p.slug === searchSlug ||
                generateSlug(p.title) === searchSlug
              );

              if (found) {
                setProduct(found);
                setMainImage(found.image);
                setSelectedColor(found.colors?.[0] || null);
              } else {
                throw new Error("Producto no encontrado en backend tras búsqueda por slug.");
              }
            } else {
              throw new Error("Error obteniendo lista completa de productos.");
            }
          } catch (slugErr) {
            console.error("Error fallback slug search:", slugErr);
            setError("Producto no encontrado.");
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Producto no encontrado o no disponible.");
      } finally {
        setLoading(false);
      }
    };

    obtenerProducto();
  }, [id]);

  // Scroll al top cuando se carga la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Calcular descuento
  const calculateDiscount = () => {
    if (!product?.isOnSale || !product?.originalPrice) return 0;
    const original = parseFloat(product.originalPrice.replace('$', ''));
    const current = parseFloat(product.price.replace('$', ''));
    return Math.round(((original - current) / original) * 100);
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#E10600] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Estado de error / no encontrado
  if (error || !product) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#495A72] hover:bg-[#3d4d61] text-white px-6 py-2 rounded-lg transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    // WRAPPER PRINCIPAL - Página completa, sin modal
    // - min-h-[calc(100vh-80px)] considera el navbar
    // - bg-gray-50 fondo suave
    // - py-4 sm:py-6 lg:py-8 padding vertical responsive
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 py-4 sm:py-6 lg:py-8">

      {/* CONTENEDOR CENTRADO - max-w-screen-xl limita ancho máximo */}
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* BREADCRUMB + BOTÓN VOLVER */}
        <nav className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[#007185] hover:text-[#C7511F] hover:underline transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        </nav>

        {/* CONTENIDO PRINCIPAL - Card blanca */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">

          {/* 
            GRID LAYOUT RESPONSIVE
            - grid-cols-1 en móvil (stacked)
            - md:grid-cols-2 en tablet+ (lado a lado)
            - gap-0 para que los bordes se unan limpiamente
          */}
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* ========== COLUMNA IZQUIERDA - GALERÍA ========== */}
            <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">

              {/* Imagen principal - aspect-square mantiene proporción */}
              <div className="relative w-full max-w-lg aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                {discount > 0 && (
                  <span className="absolute top-2 left-2 z-10 bg-[#CC0C39] text-white text-xs font-bold px-2 py-1 rounded">
                    -{discount}%
                  </span>
                )}
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              {/* Miniaturas - flex-wrap para envolver si es necesario */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {[product.image, product.image, product.image].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 rounded-md transition-all bg-gray-50 ${mainImage === img
                      ? "border-[#007185] ring-2 ring-[#007185] ring-offset-1"
                      : "border-gray-200 hover:border-[#007185]"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* ========== COLUMNA DERECHA - DETALLES ========== */}
            {/* border-t en móvil, border-l en md+ */}
            <div className="p-4 sm:p-6 lg:p-8 border-t md:border-t-0 md:border-l border-gray-200">

              {/* Badge de oferta */}
              {product.isOnSale && (
                <div className="inline-flex items-center gap-2 bg-[#CC0C39] text-white text-xs font-bold px-3 py-1 rounded mb-3">
                  <span>OFERTA</span>
                </div>
              )}

              {/* Título - break-words para textos largos */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-[#0F1111] leading-tight mb-3 break-words whitespace-normal">
                {product.title}
              </h1>

              {/* Precio - flex-wrap para móvil */}
              <div className="border-t border-b border-gray-200 py-4 mb-5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#B12704]">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-base sm:text-lg text-gray-500 line-through">
                        {product.originalPrice}
                      </span>
                      <span className="text-sm font-bold text-[#CC0C39]">
                        ({discount}% dto.)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-[#007600] mt-2 font-medium">
                  ✓ Envío GRATIS en pedidos superiores a $50
                </p>
              </div>

              {/* Selector de talla - flex-wrap */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-medium text-[#0F1111] mb-2">
                    Talla: <span className="font-normal">{selectedSize}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes
                      .filter((size) => ["S", "M", "L", "XL", "XXL"].includes(size.name))
                      .map((size) => (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size.name)}
                          className={`min-w-[44px] sm:min-w-[52px] px-3 py-2 text-sm rounded-md border-2 transition-all font-medium ${selectedSize === size.name
                            ? "bg-[#007185] text-white border-[#007185]"
                            : "bg-white text-[#0F1111] border-gray-300 hover:border-[#007185] hover:bg-[#F7FAFA]"
                            }`}
                        >
                          {size.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Selector de cantidad */}
              <div className="mb-5">
                <p className="text-sm font-medium text-[#0F1111] mb-2">Cantidad:</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-xl font-bold text-gray-600 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-xl font-bold text-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-[#007600] font-medium">
                    ✓ En stock ({product.stock} disponibles)
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    const success = addToCart(product, quantity, selectedSize);
                    if (success) {
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 2000);
                    }
                  }}
                  className={`w-full font-medium py-3 px-4 rounded-full border text-sm sm:text-base transition-all shadow-sm ${addedToCart
                    ? 'bg-[#007600] hover:bg-[#006600] border-[#006600] text-white'
                    : 'bg-[#BF1919] hover:bg-[#a81616] border-[#a81616] text-white'
                    }`}
                >
                  {addedToCart ? '✓ Añadido al carrito' : 'Añadir al carrito'}
                </Button>
                {/* Ensure the 'Buy Now' button color is #495A72 */}
                <Button
                  onClick={() => {
                    addToCart(product, quantity, selectedSize);
                    navigate('/cart');
                  }}
                  className="w-full bg-[#495A72] hover:bg-[#3d4d61] text-white font-medium py-3 px-4 rounded-full border border-[#3d4d61] text-sm sm:text-base transition-all shadow-sm"
                >
                  Comprar ahora
                </Button>
              </div>

              {/* Información adicional */}
              <div className="mt-6 pt-5 border-t border-gray-200 text-sm text-gray-600 space-y-2">
                <p className="flex items-center gap-2">
                  <span>Transacción segura</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>Envío gestionado por Jersey Club EC</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>Devoluciones gratuitas en 30 días</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE DESCRIPCIÓN (Opcional) */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#0F1111] mb-4">
            Descripción del producto
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 break-words whitespace-normal">
            <p>
              {product.title} - Camiseta oficial de alta calidad. Diseño exclusivo con materiales premium
              que garantizan comodidad y durabilidad. Ideal para los verdaderos fanáticos que quieren
              lucir los colores de su equipo favorito.
            </p>
            <ul className="mt-4 space-y-1">
              <li>✓ Material: Poliéster 100% reciclado</li>
              <li>✓ Tecnología de secado rápido</li>
              <li>✓ Ajuste regular</li>
              <li>✓ Escudo bordado de alta definición</li>
              {product.team && <li>✓ Equipo: {product.team}</li>}
              {product.season && <li>✓ Temporada: {product.season}</li>}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
