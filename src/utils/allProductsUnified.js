/**
 * Fuente unificada de TODOS los productos del ecommerce
 * Combina: Fútbol, Fórmula 1, Jersey Club Brand
 * Usado para búsqueda global desde el header
 */
import footballProducts from "../data/footballProducts";
import formula1Products from "../data/formula1Products";
import { jerseyClubGeneratedProducts } from "../data/jerseyClubGeneratedProducts";
import { toSlug } from "./toSlug";

// ========================================
// NORMALIZACIÓN Y GENERACIÓN DE IDs
// ========================================

/**
 * Genera un ID único y consistente para un producto
 * Usa toSlug para normalizar el título/nombre
 */
const generateProductId = (product, index, prefix) => {
  // Si ya tiene ID, usarlo; si no, generar uno basado en título
  if (product.id) return product.id;

  const title = product.title || product.name || `producto-${index}`;
  return `${prefix}-${toSlug(title)}`;
};

/**
 * Normaliza un producto para búsqueda, agregando campos necesarios
 */
const normalizeProduct = (product, index, source, category) => {
  const id = generateProductId(product, index, source);
  const name = product.nombre || product.title || product.name || "";
  const image = product.imagen || product.image || "https://storage.googleapis.com/imagenesjerseyclub/gs://imagenesjerseyclub/default.webp";

  // Formatear precio para asegurar que tenga el signo $ y dos decimales
  // Prioridad: precio (número de backend) > price (string de frontend)
  const rawPrice = product.precio !== undefined ? product.precio : product.price;
  let numericPrice = 0;

  if (typeof rawPrice === 'number') {
    numericPrice = rawPrice;
  } else if (typeof rawPrice === 'string') {
    numericPrice = parseFloat(rawPrice.replace('$', '').replace(',', '')) || 0;
  }

  const formattedPrice = `$${numericPrice.toFixed(2)}`;

  // Campos para filtrado
  // Si NO tiene la propiedad definida, asignamos un 25% de probabilidad de oferta de forma pseudo-aleatoria pero consistente
  const randomSale = (index % 4 === 0);
  const isOnSale = product.isOnSale !== undefined ? product.isOnSale : randomSale;

  const discount = product.descuento || product.discount || (isOnSale ? (15 + (index % 4) * 5) : 0);

  return {
    ...product,
    id,
    // Campos normalizados para búsqueda y visualización
    name,
    nombre: name,
    title: name,
    image,
    imagen: image,
    brand: product.brand || product.team || category,
    category: product.categoria || product.category || category,
    source, // 'fb' = fútbol, 'f1' = fórmula 1, 'jcb' = jersey club, 'db' = backend
    // Campos para filtrado
    isOnSale: isOnSale,
    price: formattedPrice,
    precio: formattedPrice,
    discount: discount,
    stock: (product.stock !== undefined && product.stock > 0) ? product.stock : 25,
  };
};

// ========================================
// FUENTE UNIFICADA
// ========================================

/**
 * Obtiene TODOS los productos de todas las fuentes, normalizados
 */
export const getAllProductsUnified = () => {
  const allProducts = [
    // Productos de Fútbol
    ...footballProducts.map((p, i) =>
      normalizeProduct(p, i, 'fb', 'Fútbol')
    ),
    // Productos de Fórmula 1
    ...formula1Products.map((p, i) =>
      normalizeProduct(p, i, 'f1', 'Fórmula 1')
    ),
    // Productos de Jersey Club Brand
    ...jerseyClubGeneratedProducts.map((p, i) =>
      normalizeProduct(p, i, 'jcb', 'Jersey Club')
    ),
  ];

  return allProducts;
};

/**
 * Busca productos globalmente por término de búsqueda (Asincrónico para incluir datos del backend)
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} - Productos que coinciden
 */
export const searchProducts = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === "") {
    return [];
  }

  const term = searchTerm.toLowerCase().trim();
  let allProducts = [];

  try {
    // Intentar obtener productos actualizados desde el backend
    const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/productos`);
    const result = await response.json();

    if (result.success || result.status === 'success') {
      const apiProducts = result.data;

      // Normalizar productos de la API
      allProducts = apiProducts.map((p, i) => normalizeProduct(p, i, p.source || 'db', p.categoria || 'General'));
    } else {
      // Si falla la API, usar datos locales como fallback
      allProducts = getAllProductsUnified();
    }
  } catch (error) {
    console.warn("⚠️ API de productos no disponible, usando datos estáticos para búsqueda:", error);
    allProducts = getAllProductsUnified();
  }

  return allProducts.filter((product) => {
    // Campos a buscar
    const searchableFields = [
      product.title,
      product.name,
      product.brand,
      product.category,
      product.description,
      product.team,
      product.driver,
      product.gender,
      product.id
    ];

    // Buscar en todos los campos
    return searchableFields.some((field) => {
      if (!field) return false;
      return String(field).toLowerCase().includes(term);
    });
  });
};

/**
 * Obtiene productos en oferta de todas las fuentes
 */
export const getOfferProductsUnified = () => {
  return getAllProductsUnified().filter((product) => product.isOnSale);
};

// Exportar por defecto la lista completa
export default getAllProductsUnified;
