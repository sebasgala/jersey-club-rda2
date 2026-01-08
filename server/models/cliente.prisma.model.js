/**
 * =====================================================
 * CLIENTES MODEL - PRISMA
 * =====================================================
 * Modelo de clientes usando Prisma Client
 * Conectado a la base de datos PostgreSQL
 */

import prisma from '../lib/prisma.js';

/**
 * Obtener todos los clientes con filtros y paginación
 */
export async function getAll(query = {}) {
  const { page = 1, limit = 20, search, ciudad, pais } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construir filtros
  const where = {};
  
  if (ciudad) {
    where.cli_ciudad = ciudad;
  }

  if (pais) {
    where.cli_pais = pais;
  }

  if (search) {
    where.OR = [
      { cli_nombre: { contains: search, mode: 'insensitive' } },
      { cli_apellido: { contains: search, mode: 'insensitive' } },
      { cli_email: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Ejecutar consulta
  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      skip,
      take,
      orderBy: { cli_createdat: 'desc' }
    }),
    prisma.cliente.count({ where })
  ]);

  return {
    data: clientes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
}

/**
 * Obtener un cliente por ID
 */
export async function getById(id) {
  return await prisma.cliente.findUnique({
    where: { id_cliente: id },
    include: {
      pedido: true,
      usuario: true
    }
  });
}

/**
 * Obtener un cliente por email
 */
export async function getByEmail(email) {
  return await prisma.cliente.findUnique({
    where: { cli_email: email }
  });
}

/**
 * Crear un nuevo cliente
 */
export async function create(data) {
  // Generar ID único (CL0XXX)
  const lastCliente = await prisma.cliente.findFirst({
    orderBy: { id_cliente: 'desc' }
  });
  
  let newId = 'CL0001';
  if (lastCliente) {
    const lastNum = parseInt(lastCliente.id_cliente.substring(2));
    newId = `CL${String(lastNum + 1).padStart(4, '0')}`;
  }

  return await prisma.cliente.create({
    data: {
      id_cliente: newId,
      cli_nombre: data.nombre,
      cli_apellido: data.apellido,
      cli_email: data.email,
      cli_telefono: data.telefono,
      cli_direccion: data.direccion,
      cli_ciudad: data.ciudad,
      cli_pais: data.pais || 'Ecuador'
    }
  });
}

/**
 * Actualizar un cliente
 */
export async function update(id, data) {
  const updateData = {};

  if (data.nombre) updateData.cli_nombre = data.nombre;
  if (data.apellido) updateData.cli_apellido = data.apellido;
  if (data.email) updateData.cli_email = data.email;
  if (data.telefono !== undefined) updateData.cli_telefono = data.telefono;
  if (data.direccion !== undefined) updateData.cli_direccion = data.direccion;
  if (data.ciudad !== undefined) updateData.cli_ciudad = data.ciudad;
  if (data.pais !== undefined) updateData.cli_pais = data.pais;

  return await prisma.cliente.update({
    where: { id_cliente: id },
    data: updateData
  });
}

/**
 * Eliminar un cliente
 */
export async function remove(id) {
  return await prisma.cliente.delete({
    where: { id_cliente: id }
  });
}

export default {
  getAll,
  getById,
  getByEmail,
  create,
  update,
  remove
};
