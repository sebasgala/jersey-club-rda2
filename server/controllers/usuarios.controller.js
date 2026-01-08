import { prisma } from '../prisma/client.js';

/**
 * Transforma un usuario de la base de datos al formato esperado por el frontend
 */
const transformUsuario = (usuario) => {
  if (!usuario) return null;
  return {
    id: usuario.id_usuario,
    email: usuario.usu_email,
    role: usuario.usu_role,
    clienteId: usuario.id_cliente,
    empleadoId: usuario.id_empleado,
    createdAt: usuario.usu_createdat,
    lastLogin: usuario.usu_lastlogin
  };
};

export async function crearUsuario(req, res, next) {
  try {
    const { email, password, role, clienteId, empleadoId } = req.body;
    
    // Generar ID único
    const count = await prisma.usuario.count();
    const newId = `U${String(count + 1).padStart(5, '0')}`;
    
    const usuario = await prisma.usuario.create({ 
      data: {
        id_usuario: newId,
        usu_email: email,
        usu_passwordhash: password, // En producción debería hashearse
        usu_role: role || 'user',
        id_cliente: clienteId || null,
        id_empleado: empleadoId || null
      } 
    });
    res.status(201).json({ status: 'created', data: transformUsuario(usuario) });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsuarios(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        cliente: true,
        empleado: true
      }
    });
    const data = usuarios.map(transformUsuario);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

export async function getUsuarioById(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({ 
      where: { id_usuario: id },
      include: {
        cliente: true,
        empleado: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    }

    res.status(200).json({ status: 'success', data: transformUsuario(usuario) });
  } catch (error) {
    next(error);
  }
}

export async function updateUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { email, role, clienteId, empleadoId } = req.body;
    
    const updateData = {};
    if (email !== undefined) updateData.usu_email = email;
    if (role !== undefined) updateData.usu_role = role;
    if (clienteId !== undefined) updateData.id_cliente = clienteId;
    if (empleadoId !== undefined) updateData.id_empleado = empleadoId;
    
    const usuarioActualizado = await prisma.usuario.update({ 
      where: { id_usuario: id }, 
      data: updateData 
    });
    res.status(200).json({ status: 'success', data: transformUsuario(usuarioActualizado) });
  } catch (error) {
    next(error);
  }
}

export async function deleteUsuario(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.usuario.delete({ where: { id_usuario: id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}