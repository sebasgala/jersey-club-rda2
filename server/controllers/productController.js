/**
 * =====================================================
 * CONTROLLER: Products
 * =====================================================
 * Controlador HTTP para productos
 */

import { prisma } from '../prisma/client.js';

/**
 * Transforma un producto de la base de datos al formato esperado por el frontend
 */
const transformProduct = (producto) => {
  if (!producto) return null;

  // Lógica de mapeo de imágenes para productos de F1 y otros
  const getImageUrl = (name, category, existingImage) => {
    // Solo retornar la imagen existente si es una URL de nube válida (no localhost)
    if (existingImage && existingImage.startsWith('http') && !existingImage.includes('localhost')) return existingImage;
    if (existingImage && existingImage.includes('gs://')) return existingImage;

    // Normalizar para comparación (quitar tildes y casos especiales)
    const normalizeSearch = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const nameNorm = normalizeSearch(name || "");

    // 1. Mapeos EXACTOS solicitados por el usuario
    if (nameNorm.includes('mclaren f1 lando norris campeon 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/norris.webp';
    if (nameNorm.includes('mclaren f1 racing team 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/mclared-f1-racing.webp';
    if (nameNorm.includes('max verstappen 2025 special edition')) return 'https://storage.googleapis.com/imagenesjerseyclub/red-bull-racing-2025.webp';
    if (nameNorm.includes('mercedes amg petronas')) return 'https://storage.googleapis.com/imagenesjerseyclub/camiseta-mercedes-amg.webp';
    if (nameNorm.includes('alpine f1 team 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/alpine-f1-2025.webp';
    if (nameNorm.includes('aston martin f1 team polo 2024')) return 'https://storage.googleapis.com/imagenesjerseyclub/polo-aston-martin-f1-team-2024.webp';
    if (nameNorm.includes('sauber f1 team 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/sauber-f1-2025.webp';

    // 2. Mapeos por palabras clave (Fallback secundario)
    if (nameNorm.includes('lando norris')) return 'https://storage.googleapis.com/imagenesjerseyclub/norris.webp';
    if (nameNorm.includes('mclaren') || nameNorm.includes('mclared')) return 'https://storage.googleapis.com/imagenesjerseyclub/mclared-f1-racing.webp';
    if (nameNorm.includes('ferrari')) return 'https://storage.googleapis.com/imagenesjerseyclub/ferrari-f1-team-2025.webp';
    if (nameNorm.includes('red bull')) return 'https://storage.googleapis.com/imagenesjerseyclub/red-bull-racing-2025.webp';
    if (nameNorm.includes('williams')) return 'https://storage.googleapis.com/imagenesjerseyclub/williams-racing-2025.webp';
    if (nameNorm.includes('haas')) return 'https://storage.googleapis.com/imagenesjerseyclub/haas-f1-team-2025.webp';

    // 3. Fallback basado en slug
    const slug = nameNorm.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    return `https://storage.googleapis.com/imagenesjerseyclub/${slug}.webp`;
  };

  return {
    id: producto.id_producto,
    name: producto.prd_nombre || 'Sin nombre',
    description: producto.prd_descripcion || '',
    price: parseFloat(producto.prd_precio) || 0,
    stock: producto.prd_stock || 0,
    minStock: producto.prd_stockminimo || 5,
    category: producto.categoria?.cat_nombre || producto.id_categoria || 'Sin categoría',
    categoryId: producto.id_categoria,
    image: getImageUrl(producto.prd_nombre, producto.id_categoria, producto.prd_imagen),
    imagen: getImageUrl(producto.prd_nombre, producto.id_categoria, producto.prd_imagen),
    active: producto.prd_activo,
    createdAt: producto.prd_createdat,
    updatedAt: producto.prd_updatedat,
    // Campos adicionales para compatibilidad
    featured: true,
    isNew: true,
    onSale: (parseFloat(producto.prd_descuento) > 0),
    descuento: parseFloat(producto.prd_descuento) || 0
  };
};

/**
 * GET /api/products
 * Obtener todos los productos con filtros
 */
const getAll = async (req, res, next) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { prd_activo: true },
      include: { categoria: true }
    });

    const products = productos.map(transformProduct);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/featured
 * Obtener productos destacados
 */
const getFeatured = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const productos = await prisma.producto.findMany({
      where: { prd_activo: true },
      take: limit,
      include: { categoria: true }
    });

    const products = productos.map(transformProduct);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/new
 * Obtener productos nuevos
 */
const getNew = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const productos = await prisma.producto.findMany({
      where: { prd_activo: true },
      orderBy: { prd_createdat: 'desc' },
      take: limit,
      include: { categoria: true }
    });

    const products = productos.map(transformProduct);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/on-sale
 * Obtener productos en oferta
 */
const getOnSale = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const productos = await prisma.producto.findMany({
      where: { prd_activo: true },
      take: limit,
      include: { categoria: true }
    });

    const products = productos.map(p => ({ ...transformProduct(p), onSale: true }));

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Obtener producto por ID
 */
const getById = async (req, res, next) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id_producto: req.params.id },
      include: { categoria: true }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product: transformProduct(producto) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/slug/:slug
 * Obtener producto por slug (usa nombre como fallback)
 */
const getBySlug = async (req, res, next) => {
  try {
    const producto = await prisma.producto.findFirst({
      where: { prd_nombre: { contains: req.params.slug, mode: 'insensitive' } },
      include: { categoria: true }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: { product: transformProduct(producto) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products (Admin)
 * Crear nuevo producto
 */
const create = async (req, res, next) => {
  try {
    const { name, description, price, stock, minStock, categoryId, imagen, descuento } = req.body;

    // Validar que el precio sea mayor o igual a 0
    if (price < 0) {
      return res.status(400).json({ error: "El precio del producto debe ser mayor o igual a 0." });
    }

    // Generar ID único
    const count = await prisma.producto.count();
    const newId = `P${String(count + 1).padStart(5, '0')}`;

    const producto = await prisma.producto.create({
      data: {
        id_producto: newId,
        prd_nombre: name,
        prd_descripcion: description,
        prd_precio: price,
        prd_stock: stock || 0,
        prd_stockminimo: minStock || 5,
        id_categoria: categoryId || null,
        prd_imagen: imagen || null,
        prd_descuento: descuento || 0
      },
      include: { categoria: true }
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: transformProduct(producto) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id (Admin)
 * Actualizar producto
 */
const update = async (req, res, next) => {
  try {
    const { name, description, price, active, imagen, descuento, stock, categoryId } = req.body;

    // Validar que el precio sea mayor o igual a 0
    if (price < 0) {
      return res.status(400).json({ error: "El precio del producto debe ser mayor o igual a 0." });
    }

    const updateData = {};
    if (name !== undefined) updateData.prd_nombre = name;
    if (description !== undefined) updateData.prd_descripcion = description;
    if (price !== undefined) updateData.prd_precio = price;
    if (active !== undefined) updateData.prd_activo = active;
    if (imagen !== undefined) updateData.prd_imagen = imagen;
    if (descuento !== undefined) updateData.prd_descuento = descuento;
    if (stock !== undefined) updateData.prd_stock = stock;
    if (categoryId !== undefined) updateData.id_categoria = categoryId;
    updateData.prd_updatedat = new Date();

    const producto = await prisma.producto.update({
      where: { id_producto: req.params.id },
      data: updateData,
      include: { categoria: true }
    });

    res.json({
      success: true,
      message: 'Producto actualizado',
      data: { product: transformProduct(producto) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id (Admin)
 * Eliminar producto
 */
const remove = async (req, res, next) => {
  try {
    await prisma.producto.delete({ where: { id_producto: req.params.id } });

    res.json({
      success: true,
      message: 'Producto eliminado'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/low-stock
 * Obtener productos con stock bajo
 */
const getLowStockProducts = async (req, res) => {
  try {
    // Consulta SQL cruda para obtener los datos de la vista
    const lowStockProducts = await prisma.$queryRaw`
      SELECT * FROM "V_PRODUCTOS_STOCK_BAJO"
    `;
    res.status(200).json(lowStockProducts);
  } catch (error) {
    console.error("Error al consultar productos con stock bajo:", error);
    res.status(500).json({ error: "Error al consultar productos con stock bajo." });
  }
};

export default {
  getAll,
  getFeatured,
  getNew,
  getOnSale,
  getById,
  getBySlug,
  create,
  update,
  remove,
  getLowStockProducts
};
