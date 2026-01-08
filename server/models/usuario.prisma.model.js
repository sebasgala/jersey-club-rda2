/**
 * =====================================================
 * USUARIOS MODEL - PRISMA
 * =====================================================
 * Modelo de usuarios usando Prisma Client
 * Conectado a la base de datos PostgreSQL
 */

import prisma from '../lib/prisma.js';

/**
 * Obtener todos los usuarios con filtros y paginación
 */
export async function getAll(query = {}) {
  const { page = 1, limit = 20, role, search } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construir filtros
  const where = {};
  
  if (role) {
    where.usu_role = role;
  }

  if (search) {
    where.usu_email = {
      contains: search,
      mode: 'insensitive'
    };
  }

  // Ejecutar consulta
  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      skip,
      take,
      orderBy: { usu_createdat: 'desc' },
      include: {
        cliente: true,
        empleado: true
      }
    }),
    prisma.usuario.count({ where })
  ]);

  return {
    data: usuarios,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
}

/**
 * Obtener un usuario por ID
 */
export async function getById(id) {
  return await prisma.usuario.findUnique({
    where: { id_usuario: id },
    include: {
      cliente: true,
      empleado: true
    }
  });
}

/**
 * Obtener un usuario por email
 */
export async function getByEmail(email) {
  return await prisma.usuario.findUnique({
    where: { usu_email: email },
    include: {
      cliente: true,
      empleado: true
    }
  });
}

/**
 * Crear un nuevo usuario
 */
export async function create(data) {
  // Generar ID único (U0XXXX)
  const lastUser = await prisma.usuario.findFirst({
    orderBy: { id_usuario: 'desc' }
  });
  
  let newId = 'U00001';
  if (lastUser) {
    const lastNum = parseInt(lastUser.id_usuario.substring(1));
    newId = `U${String(lastNum + 1).padStart(5, '0')}`;
  }

  return await prisma.usuario.create({
    data: {
      id_usuario: newId,
      usu_email: data.email,
      usu_passwordhash: data.password,
      usu_role: data.role || 'user',
      id_cliente: data.clienteId,
      id_empleado: data.empleadoId
    },
    include: {
      cliente: true,
      empleado: true
    }
  });
}

/**
 * Actualizar un usuario
 */
export async function update(id, data) {
  const updateData = {};

  if (data.email) updateData.usu_email = data.email;
  if (data.password) updateData.usu_passwordhash = data.password;
  if (data.role) updateData.usu_role = data.role;
  if (data.clienteId !== undefined) updateData.id_cliente = data.clienteId;
  if (data.empleadoId !== undefined) updateData.id_empleado = data.empleadoId;

  return await prisma.usuario.update({
    where: { id_usuario: id },
    data: updateData,
    include: {
      cliente: true,
      empleado: true
    }
  });
}

/**
 * Actualizar último login
 */
export async function updateLastLogin(id) {
  return await prisma.usuario.update({
    where: { id_usuario: id },
    data: {
      usu_lastlogin: new Date()
    }
  });
}

/**
 * Eliminar un usuario
 */
export async function remove(id) {
  return await prisma.usuario.delete({
    where: { id_usuario: id }
  });
}

export default {
  getAll,
  getById,
  getByEmail,
  create,
  update,
  updateLastLogin,
  remove
};
