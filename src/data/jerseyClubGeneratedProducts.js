/**
 * Fuente unificada de productos Jersey Club Brand
 * Genera productos desde las imágenes con IDs consistentes usando toSlug()
 * Exportado para uso en Product.jsx y JerseyClubBrand.jsx
 */
import { toSlug } from "../utils/toSlug";

// Lista completa de imágenes Jersey Club (barrido de /public/assets/images/)
const allJerseyClubImages = [
  "buzo-compresion-hombre-jersey-club.webp",
  "camiseta-deportiva-hombre-jersey-club.webp",
  "camiseta-deportiva-mujer-jersey-club.webp",
  "gorra-running-jersey-club.webp",
  "medias-running-jersey-club.webp",
  "pantaloneta-deportiva-hombre-jersey-club.webp",
  "pantaloneta-running-hombre-jersey-club.webp",
  "buzo-compresion-mujer-jersey-club.webp",
  "camiseta-running-deportiva-mujer-jersey-club.webp",
  "pantaloneta-deportiva-running-mujer-jersey-club.webp",
];

// Función de normalización para detección de género/categoría
const normalize = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ") // Reemplazar guiones con espacios
    .replace(/\s+/g, " ")
    .trim();
};

// Generar productos desde las imágenes con precios FIJOS (no aleatorios)
// para que sean consistentes en cada carga
const generateJerseyClubProducts = () => {
  // Precios fijos por índice para consistencia
  const fixedPrices = [35, 28, 28, 18, 12, 22, 25, 32, 30, 24];

  return allJerseyClubImages
    .filter((filename) => normalize(filename).includes("jersey club"))
    .map((filename, index) => {
      const baseName = filename.replace(/\.[^/.]+$/, ""); // Quitar extensión
      const normalizedName = normalize(baseName);

      // Detectar género del nombre
      let gender = "Unisex";
      if (normalizedName.includes("hombre")) gender = "Hombre";
      else if (normalizedName.includes("mujer")) gender = "Mujer";

      // Detectar categoría
      let category = "Ropa Deportiva";
      if (normalizedName.includes("buzo")) category = "Buzos";
      else if (normalizedName.includes("camiseta")) category = "Camisetas";
      else if (normalizedName.includes("pantaloneta")) category = "Pantalonetas";
      else if (normalizedName.includes("gorra")) category = "Accesorios";
      else if (normalizedName.includes("medias")) category = "Accesorios";

      // Precio fijo basado en índice
      const basePrice = fixedPrices[index] || 25;
      const isOnSale = index % 3 === 0;

      // ID generado con toSlug para consistencia
      const id = toSlug(baseName);

      return {
        id,
        title: normalizedName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        image: `https://storage.googleapis.com/imagenesjerseyclub/${filename}`,
        price: `$${basePrice}.00`,
        isOnSale,
        category,
        gender,
        brand: "Jersey Club",
      };
    });
};

// Productos base generados
export const jerseyClubGeneratedProducts = generateJerseyClubProducts();

// Crear un mapa por ID para búsqueda rápida
export const jerseyClubProductsById = jerseyClubGeneratedProducts.reduce((acc, product) => {
  acc[product.id] = product;
  return acc;
}, {});

// Función para buscar un producto Jersey Club por ID
export const findJerseyClubProductById = (id) => {
  return jerseyClubProductsById[id] || null;
};

export default jerseyClubGeneratedProducts;
