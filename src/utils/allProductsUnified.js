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
  
  return {
    ...product,
    id,
    // Campos normalizados para búsqueda
    name: product.title || product.name || "",
    title: product.title || product.name || "",
    brand: product.brand || product.team || category,
    category: product.category || category,
    source, // 'fb' = fútbol, 'f1' = fórmula 1, 'jcb' = jersey club
    // Campos para filtrado
    isOnSale: product.isOnSale || product.onSale || false,
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

// ========================================
// BÚSQUEDA GLOBAL
// ========================================

/**
 * Busca productos globalmente por término de búsqueda
 * Busca en: title/name, brand, category, description, team, driver
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} - Productos que coinciden
 */
export const searchProducts = (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === "") {
    return [];
  }

  const term = searchTerm.toLowerCase().trim();
  const allProducts = getAllProductsUnified();

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
    ];

    // Buscar en todos los campos
    return searchableFields.some((field) => {
      if (!field) return false;
      return field.toLowerCase().includes(term);
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
