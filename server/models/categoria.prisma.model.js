/**
 * =====================================================
 * CATEGORIAS MODEL - PRISMA
 * =====================================================
 * Modelo de categorías usando Prisma Client
 * Conectado a la base de datos PostgreSQL
 */

import prisma from '../lib/prisma.js';

/**
 * Obtener todas las categorías
 */
export async function getAll() {
  return await prisma.categoria.findMany({
    orderBy: { cat_nombre: 'asc' },
    include: {
      _count: {
        select: { producto: true }
      }
    }
  });
}

/**
 * Obtener una categoría por ID
 */
export async function getById(id) {
  return await prisma.categoria.findUnique({
    where: { id_categoria: id },
    include: {
      producto: true
    }
  });
}

/**
 * Obtener una categoría por nombre
 */
export async function getByNombre(nombre) {
  return await prisma.categoria.findUnique({
    where: { cat_nombre: nombre }
  });
}

/**
 * Crear una nueva categoría
 */
export async function create(data) {
  // Generar ID único (C0XXXX)
  const lastCategoria = await prisma.categoria.findFirst({
    orderBy: { id_categoria: 'desc' }
  });
  
  let newId = 'C00001';
  if (lastCategoria) {
    const lastNum = parseInt(lastCategoria.id_categoria.substring(1));
    newId = `C${String(lastNum + 1).padStart(5, '0')}`;
  }

  return await prisma.categoria.create({
    data: {
      id_categoria: newId,
      cat_nombre: data.nombre,
      cat_descripcion: data.descripcion
    }
  });
}

/**
 * Actualizar una categoría
 */
export async function update(id, data) {
  const updateData = {};

  if (data.nombre) updateData.cat_nombre = data.nombre;
  if (data.descripcion !== undefined) updateData.cat_descripcion = data.descripcion;

  return await prisma.categoria.update({
    where: { id_categoria: id },
    data: updateData
  });
}

/**
 * Eliminar una categoría
 */
export async function remove(id) {
  return await prisma.categoria.delete({
    where: { id_categoria: id }
  });
}

export default {
  getAll,
  getById,
  getByNombre,
  create,
  update,
  remove
};
