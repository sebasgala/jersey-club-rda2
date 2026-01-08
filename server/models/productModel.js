/**
 * =====================================================
 * MODEL: Product
 * =====================================================
 * Capa de acceso a datos para productos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Buscar producto por ID
 */
const findById = async (id) => {
  return prisma.product.findUnique({
    where: { id }
  });
};

/**
 * Buscar producto por slug
 */
const findBySlug = async (slug) => {
  return prisma.product.findUnique({
    where: { slug }
  });
};

/**
 * Obtener todos los productos con filtros
 */
const findAll = async (filters = {}) => {
  const {
    category,
    subcategory,
    team,
    league,
    minPrice,
    maxPrice,
    isNew,
    isFeatured,
    isOnSale,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const where = {};

  if (category) where.category = category;
  if (subcategory) where.subcategory = subcategory;
  if (team) where.team = { contains: team };
  if (league) where.league = league;
  if (isNew !== undefined) where.isNew = isNew === 'true';
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
  if (isOnSale !== undefined) where.isOnSale = isOnSale === 'true';

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { team: { contains: search } }
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.product.count({ where })
  ]);

  // Parsear campos JSON
  const parsedProducts = products.map(product => ({
    ...product,
    sizes: JSON.parse(product.sizes || '[]'),
    colors: product.colors ? JSON.parse(product.colors) : [],
    images: JSON.parse(product.images || '[]')
  }));

  return {
    products: parsedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Crear producto
 */
const create = async (productData) => {
  const data = {
    ...productData,
    sizes: JSON.stringify(productData.sizes || []),
    colors: JSON.stringify(productData.colors || []),
    images: JSON.stringify(productData.images || [])
  };

  return prisma.product.create({ data });
};

/**
 * Actualizar producto
 */
const update = async (id, productData) => {
  const data = { ...productData };

  if (productData.sizes) data.sizes = JSON.stringify(productData.sizes);
  if (productData.colors) data.colors = JSON.stringify(productData.colors);
  if (productData.images) data.images = JSON.stringify(productData.images);

  return prisma.product.update({
    where: { id },
    data
  });
};

/**
 * Eliminar producto
 */
const remove = async (id) => {
  return prisma.product.delete({
    where: { id }
  });
};

/**
 * Actualizar stock
 */
const updateStock = async (id, quantity) => {
  return prisma.product.update({
    where: { id },
    data: {
      stock: { decrement: quantity }
    }
  });
};

/**
 * Obtener productos destacados
 */
const findFeatured = async (limit = 8) => {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  return products.map(product => ({
    ...product,
    sizes: JSON.parse(product.sizes || '[]'),
    colors: product.colors ? JSON.parse(product.colors) : [],
    images: JSON.parse(product.images || '[]')
  }));
};

/**
 * Obtener productos nuevos
 */
const findNew = async (limit = 8) => {
  const products = await prisma.product.findMany({
    where: { isNew: true },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  return products.map(product => ({
    ...product,
    sizes: JSON.parse(product.sizes || '[]'),
    colors: product.colors ? JSON.parse(product.colors) : [],
    images: JSON.parse(product.images || '[]')
  }));
};

/**
 * Obtener productos en oferta
 */
const findOnSale = async (limit = 8) => {
  const products = await prisma.product.findMany({
    where: { isOnSale: true },
    take: limit,
    orderBy: { discount: 'desc' }
  });

  return products.map(product => ({
    ...product,
    sizes: JSON.parse(product.sizes || '[]'),
    colors: product.colors ? JSON.parse(product.colors) : [],
    images: JSON.parse(product.images || '[]')
  }));
};

export default {
  findById,
  findBySlug,
  findAll,
  create,
  update,
  remove,
  updateStock,
  findFeatured,
  findNew,
  findOnSale
};
