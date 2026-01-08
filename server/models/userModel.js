/**
 * =====================================================
 * MODEL: User
 * =====================================================
 * Capa de acceso a datos para usuarios (tabla: usuario)
 */

import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';

/**
 * Buscar usuario por ID
 */
const findById = async (id) => {
  const user = await prisma.usuario.findUnique({
    where: { id_usuario: id },
    include: {
      cliente: true,
      empleado: true
    }
  });
  
  if (!user) return null;
  
  // Transformar a formato compatible
  return {
    id: user.id_usuario,
    email: user.usu_email,
    password: user.usu_passwordhash,
    role: user.usu_role,
    createdAt: user.usu_createdat,
    cliente: user.cliente,
    empleado: user.empleado
  };
};

/**
 * Buscar usuario por email
 */
const findByEmail = async (email) => {
  const user = await prisma.usuario.findUnique({
    where: { usu_email: email },
    include: {
      cliente: true,
      empleado: true
    }
  });
  
  if (!user) return null;
  
  // Transformar a formato compatible
  return {
    id: user.id_usuario,
    email: user.usu_email,
    password: user.usu_passwordhash,
    role: user.usu_role,
    createdAt: user.usu_createdat,
    cliente: user.cliente,
    empleado: user.empleado
  };
};

/**
 * Crear nuevo usuario
 */
const create = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Generar ID único
  const count = await prisma.usuario.count();
  const newId = `U${String(count + 1).padStart(5, '0')}`;
  
  const user = await prisma.usuario.create({
    data: {
      id_usuario: newId,
      usu_email: userData.email,
      usu_passwordhash: hashedPassword,
      usu_role: userData.role || 'user',
      id_cliente: userData.id_cliente || null,
      id_empleado: userData.id_empleado || null
    }
  });
  
  return {
    id: user.id_usuario,
    email: user.usu_email,
    role: user.usu_role,
    createdAt: user.usu_createdat
  };
};

/**
 * Actualizar usuario
 */
const update = async (id, userData) => {
  const updateData = {};
  
  if (userData.email) updateData.usu_email = userData.email;
  if (userData.role) updateData.usu_role = userData.role;
  if (userData.password) {
    updateData.usu_passwordhash = await bcrypt.hash(userData.password, 10);
  }
  
  const user = await prisma.usuario.update({
    where: { id_usuario: id },
    data: updateData
  });
  
  return {
    id: user.id_usuario,
    email: user.usu_email,
    role: user.usu_role,
    updatedAt: user.usu_createdat
  };
};

/**
 * Eliminar usuario
 */
const remove = async (id) => {
  return prisma.usuario.delete({
    where: { id_usuario: id }
  });
};

/**
 * Verificar contraseña
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  // Si la contraseña almacenada no es un hash bcrypt, comparar directamente
  if (!hashedPassword.startsWith('$2')) {
    return plainPassword === hashedPassword;
  }
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Obtener todos los usuarios (admin)
 */
const findAll = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      skip,
      take: limit,
      include: {
        cliente: true,
        empleado: true
      },
      orderBy: { usu_createdat: 'desc' }
    }),
    prisma.usuario.count()
  ]);
  
  const users = usuarios.map(user => ({
    id: user.id_usuario,
    email: user.usu_email,
    role: user.usu_role,
    createdAt: user.usu_createdat,
    cliente: user.cliente,
    empleado: user.empleado
  }));
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Actualizar último login
 */
const updateLastLogin = async (id) => {
  return prisma.usuario.update({
    where: { id_usuario: id },
    data: { usu_lastlogin: new Date() }
  });
};

export default {
  findById,
  findByEmail,
  create,
  update,
  remove,
  verifyPassword,
  findAll,
  updateLastLogin
};
