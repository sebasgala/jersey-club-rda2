/**
 * =====================================================
 * CONTROLLER: Auth
 * =====================================================
 * Controlador HTTP para autenticación
 */

import prisma from '../lib/prisma.js';
import { logAudit, generateNextId, handlePrismaError } from '../lib/dbHelpers.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generar token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id_usuario,
      email: user.usu_email,
      rol: user.usu_role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register
 * Registro de nuevo usuario (Cliente o Empleado)
 */
const register = async (req, res) => {
  const { email, password, name, nombre, rol = 'cliente', telefono, direccion } = req.body;
  const finalName = name || nombre || email.split('@')[0];

  try {
    // 1. Verificar si el email ya existe en DB
    const existingUser = await prisma.usuario.findUnique({
      where: { usu_email: email }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // 2. Hash de contraseña (usaremos bcrypt si está importado, si no, texto plano por ahora para no romper, pero lo agregaré arriba)
    const passHash = await bcrypt.hash(password, 10);

    // 3. Crear registros según rol
    const usuId = await generateNextId('usuario', 'U');
    let cliId = null;
    let empId = null;

    if (rol === 'cliente') {
      cliId = await generateNextId('cliente', 'C');
      await prisma.cliente.create({
        data: {
          id_cliente: cliId,
          cli_nombre: finalName.split(' ')[0],
          cli_apellido: finalName.split(' ').slice(1).join(' ') || 'N/A',
          cli_email: email,
          cli_telefono: telefono || null
        }
      });
      await logAudit({ usuarioId: 'SYSTEM', accion: 'INSERT', tabla: 'cliente', claveRegistro: cliId, descripcion: `Cliente registrado: ${email}` });
    } else {
      empId = await generateNextId('empleado', 'E');
      await prisma.empleado.create({
        data: {
          id_empleado: empId,
          emp_nombre: finalName.split(' ')[0],
          emp_apellido: finalName.split(' ').slice(1).join(' ') || 'N/A'
        }
      });
      await logAudit({ usuarioId: 'SYSTEM', accion: 'INSERT', tabla: 'empleado', claveRegistro: empId, descripcion: `Empleado registrado (rol ${rol}): ${email}` });
    }

    // 4. Crear Usuario
    const newUser = await prisma.usuario.create({
      data: {
        id_usuario: usuId,
        usu_email: email,
        usu_passwordhash: passHash,
        usu_role: rol,
        id_cliente: cliId,
        id_empleado: empId
      }
    });

    await logAudit({ usuarioId: 'SYSTEM', accion: 'INSERT', tabla: 'usuario', claveRegistro: usuId, descripcion: `Usuario login creado para ${email}` });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente en la base de datos',
      data: {
        user: { id: newUser.id_usuario, email: newUser.usu_email, name: finalName, rol: newUser.usu_role },
        token,
      },
    });

  } catch (error) {
    return handlePrismaError(error, res);
  }
};

/**
 * POST /api/auth/login
 * Inicio de sesión
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.usuario.findUnique({
      where: { usu_email: email }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Comparar password (bcrypt)
    const isMatch = await bcrypt.compare(password, user.usu_passwordhash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }


    const token = generateToken(user);

    await logAudit({ usuarioId: user.id_usuario, accion: 'LOGIN', tabla: 'usuario', claveRegistro: user.id_usuario, descripcion: `Sesión iniciada: ${email}` });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: { id: user.id_usuario, email: user.usu_email, rol: user.usu_role },
        token,
      },
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

/**
 * GET /api/auth/me
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: req.user.id },
      include: {
        cliente: true,
        empleado: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id_usuario,
          email: user.usu_email,
          rol: user.usu_role,
          detalle: user.cliente || user.empleado
        }
      },
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

/**
 * Obtener todos los usuarios
 * GET /api/usuarios
 */
const getUsers = async (req, res) => {
  try {
    const allUsers = await prisma.usuario.findMany({
      include: {
        cliente: true,
        empleado: true
      }
    });

    const safeUsers = allUsers.map(user => ({
      id: user.id_usuario,
      email: user.usu_email,
      name: user.cliente ? `${user.cliente.cli_nombre} ${user.cliente.cli_apellido}` :
        (user.empleado ? `${user.empleado.emp_nombre} ${user.empleado.emp_apellido}` : user.usu_email),
      rol: user.usu_role,
      telefono: user.cliente?.cli_telefono || 'N/A',
      id_relacion: user.id_cliente || user.id_empleado
    }));

    res.json(safeUsers);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

/**
 * PUT /api/usuarios/:id
 * Actualizar usuario existente
 */
const updateUser = async (req, res) => {
  const id = req.params.id;
  const { email, password, name, nombre, rol, telefono } = req.body;
  const finalName = name || nombre;

  try {
    const user = await prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const updateData = {
      usu_email: email || user.usu_email,
      usu_role: rol || user.usu_role
    };

    if (password) {
      updateData.usu_passwordhash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.usuario.update({
      where: { id_usuario: id },
      data: updateData
    });

    // Actualizar nombre en tabla relacionada
    if (finalName) {
      if (user.id_cliente) {
        await prisma.cliente.update({
          where: { id_cliente: user.id_cliente },
          data: { cli_nombre: finalName.split(' ')[0], cli_apellido: finalName.split(' ').slice(1).join(' ') || 'N/A' }
        });
      } else if (user.id_empleado) {
        await prisma.empleado.update({
          where: { id_empleado: user.id_empleado },
          data: { emp_nombre: finalName.split(' ')[0], emp_apellido: finalName.split(' ').slice(1).join(' ') || 'N/A' }
        });
      }
    }

    await logAudit({ usuarioId: 'ADMIN', accion: 'UPDATE', tabla: 'usuario', claveRegistro: id, descripcion: `Usuario ${id} actualizado` });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { user: updated }
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

/**
 * DELETE /api/usuarios/:id
 * Eliminar usuario
 */
const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    await prisma.usuario.delete({ where: { id_usuario: id } });

    // Opcional: Borrar también cliente/empleado si es huérfano? 
    // Por ahora lo dejamos así para evitar borrar datos históricos de facturas.

    await logAudit({ usuarioId: 'ADMIN', accion: 'DELETE', tabla: 'usuario', claveRegistro: id, descripcion: `Usuario ${id} eliminado` });

    res.json({ success: true, message: 'Usuario eliminado exitosamente de la base de datos' });
  } catch (error) {
    return handlePrismaError(error, res);
  }
};

export default {
  register,
  login,
  getProfile,
  getUsers,
  updateUser,
  deleteUser
};
