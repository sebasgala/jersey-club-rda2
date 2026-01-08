/**
 * =====================================================
 * PRODUCTOS MODEL - PRISMA
 * =====================================================
 * Modelo de productos usando Prisma Client
 * Conectado a la base de datos PostgreSQL
 */

import prisma from '../lib/prisma.js';

/**
 * Obtener todos los productos con filtros y paginación
 */
export async function getAll(query = {}) {
  const { page = 1, limit = 20, categoria, sort, search, activo } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construir filtros
  const where = {};
  
  if (categoria) {
    where.id_categoria = categoria;
  }

  if (activo !== undefined) {
    where.prd_activo = activo === 'true' || activo === true;
  }

  if (search) {
    where.prd_nombre = {
      contains: search,
      mode: 'insensitive'
    };
  }

  // Construir ordenamiento
  let orderBy = { prd_createdat: 'desc' };
  if (sort) {
    const [field, order] = sort.split(':');
    orderBy = { [field]: order || 'asc' };
  }

  // Ejecutar consulta
  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        categoria: true
      }
    }),
    prisma.producto.count({ where })
  ]);

  return {
    data: productos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
}

/**
 * Obtener un producto por ID
 */
export async function getById(id) {
  return await prisma.producto.findUnique({
    where: { id_producto: id },
    include: {
      categoria: true
    }
  });
}

/**
 * Crear un nuevo producto
 */
export async function create(data) {
  // Generate a unique 6-character ID (P + 5 digits)
  let newId;
  let attempts = 0;
  do {
    const randomNum = Math.floor(Math.random() * 99999) + 1;
    newId = `P${String(randomNum).padStart(5, '0')}`;
    attempts++;
    
    // Check if ID exists
    const existing = await prisma.producto.findUnique({
      where: { id_producto: newId }
    });
    
    if (!existing) break;
    
    if (attempts > 100) {
      // Fallback: use timestamp-based ID but limited to 5 chars
      const timestamp = Date.now().toString();
      const last5 = timestamp.slice(-5);
      newId = `P${last5}`;
      break;
    }
  } while (true);

  return await prisma.producto.create({
    data: {
      id_producto: newId,
      prd_nombre: data.nombre,
      prd_descripcion: data.descripcion,
      prd_precio: data.precio,
      prd_stock: data.stock || 0,
      prd_stockminimo: data.stockMinimo || 5,
      id_categoria: data.categoriaId,
      prd_activo: data.activo !== undefined ? data.activo : true
    },
    include: {
      categoria: true
    }
  });
}

/**
 * Actualizar un producto
 */
export async function update(id, data) {
  const updateData = {};

  if (data.nombre) updateData.prd_nombre = data.nombre;
  if (data.descripcion !== undefined) updateData.prd_descripcion = data.descripcion;
  if (data.precio !== undefined) updateData.prd_precio = data.precio;
  if (data.stock !== undefined) updateData.prd_stock = data.stock;
  if (data.stockMinimo !== undefined) updateData.prd_stockminimo = data.stockMinimo;
  if (data.categoriaId !== undefined) updateData.id_categoria = data.categoriaId;
  if (data.activo !== undefined) updateData.prd_activo = data.activo;

  return await prisma.producto.update({
    where: { id_producto: id },
    data: updateData,
    include: {
      categoria: true
    }
  });
}

/**
 * Eliminar un producto
 */
export async function remove(id) {
  return await prisma.producto.delete({
    where: { id_producto: id }
  });
}

/**
 * Obtener productos con stock bajo
 */
export async function getStockBajo() {
  return await prisma.producto.findMany({
    where: {
      prd_activo: true,
      prd_stock: {
        lte: prisma.raw('prd_stockminimo')
      }
    },
    include: {
      categoria: true
    }
  });
}

/**
 * Obtener productos por categoría
 */
export async function getByCategoria(categoriaId) {
  return await prisma.producto.findMany({
    where: {
      id_categoria: categoriaId,
      prd_activo: true
    },
    include: {
      categoria: true
    }
  });
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getStockBajo,
  getByCategoria
};
