/**
 * Función compartida para generar slugs/IDs consistentes
 * Usado tanto en JerseyClubBrand.jsx como en Product.jsx
 * para garantizar que los IDs sean idénticos en ambos lugares.
 */
export const toSlug = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar tildes/acentos
    .replace(/\.[^/.]+$/, "") // Quitar extensión de archivo si existe
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno solo
    .trim();
};

export default toSlug;
