/**
 * =====================================================
 * PEDIDOS MODEL - PRISMA
 * =====================================================
 * Modelo de pedidos usando Prisma Client
 * Conectado a la base de datos PostgreSQL
 */

import prisma from '../lib/prisma.js';

/**
 * Obtener todos los pedidos con filtros y paginación
 */
export async function getAll(query = {}) {
  const { page = 1, limit = 20, estado, clienteId, usuarioId } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construir filtros
  const where = {};
  
  if (estado) {
    where.ped_estado = estado;
  }

  if (clienteId) {
    where.id_cliente = clienteId;
  }

  if (usuarioId) {
    where.id_usuario = usuarioId;
  }

  // Ejecutar consulta
  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      skip,
      take,
      orderBy: { ped_createdat: 'desc' },
      include: {
        cliente: true,
        usuario: true,
        pedido_detalle: {
          include: {
            producto: true
          }
        }
      }
    }),
    prisma.pedido.count({ where })
  ]);

  return {
    data: pedidos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
}

/**
 * Obtener un pedido por ID
 */
export async function getById(id) {
  return await prisma.pedido.findUnique({
    where: { id_pedido: id },
    include: {
      cliente: true,
      usuario: true,
      pedido_detalle: {
        include: {
          producto: true
        }
      }
    }
  });
}

/**
 * Crear un nuevo pedido
 */
export async function create(data) {
  // Generar ID único (P0XXXX)
  const lastPedido = await prisma.pedido.findFirst({
    orderBy: { id_pedido: 'desc' }
  });
  
  let newId = 'P00001';
  if (lastPedido) {
    const lastNum = parseInt(lastPedido.id_pedido.substring(1));
    newId = `P${String(lastNum + 1).padStart(5, '0')}`;
  }

  // Crear el pedido con sus detalles
  return await prisma.pedido.create({
    data: {
      id_pedido: newId,
      id_usuario: data.usuarioId,
      id_cliente: data.clienteId,
      ped_total: data.total || 0,
      ped_subtotal: data.subtotal || 0,
      ped_iva: data.iva || 0,
      ped_descuento: data.descuento || 0,
      ped_estado: data.estado || 'pendiente',
      ped_fechaentrega: data.fechaEntrega ? new Date(data.fechaEntrega) : null
    },
    include: {
      cliente: true,
      usuario: true
    }
  });
}

/**
 * Agregar detalle a un pedido
 */
export async function addDetalle(pedidoId, detalle) {
  // Generar ID único para el detalle (D0XXXX)
  const lastDetalle = await prisma.pedido_detalle.findFirst({
    orderBy: { id_detalle: 'desc' }
  });
  
  let newId = 'D00001';
  if (lastDetalle) {
    const lastNum = parseInt(lastDetalle.id_detalle.substring(1));
    newId = `D${String(lastNum + 1).padStart(5, '0')}`;
  }

  return await prisma.pedido_detalle.create({
    data: {
      id_detalle: newId,
      id_pedido: pedidoId,
      id_producto: detalle.productoId,
      det_cantidad: detalle.cantidad,
      det_preciounitario: detalle.precioUnitario,
      det_subtotal: detalle.subtotal,
      det_descuento: detalle.descuento || 0
    },
    include: {
      producto: true
    }
  });
}

/**
 * Actualizar un pedido
 */
export async function update(id, data) {
  const updateData = {};

  if (data.total !== undefined) updateData.ped_total = data.total;
  if (data.subtotal !== undefined) updateData.ped_subtotal = data.subtotal;
  if (data.iva !== undefined) updateData.ped_iva = data.iva;
  if (data.descuento !== undefined) updateData.ped_descuento = data.descuento;
  if (data.estado) updateData.ped_estado = data.estado;
  if (data.fechaEntrega) updateData.ped_fechaentrega = new Date(data.fechaEntrega);
  updateData.ped_updatedat = new Date();

  return await prisma.pedido.update({
    where: { id_pedido: id },
    data: updateData,
    include: {
      cliente: true,
      usuario: true,
      pedido_detalle: {
        include: {
          producto: true
        }
      }
    }
  });
}

/**
 * Actualizar estado de un pedido
 */
export async function updateEstado(id, estado) {
  return await prisma.pedido.update({
    where: { id_pedido: id },
    data: {
      ped_estado: estado,
      ped_updatedat: new Date()
    }
  });
}

/**
 * Eliminar un pedido
 */
export async function remove(id) {
  return await prisma.pedido.delete({
    where: { id_pedido: id }
  });
}

/**
 * Obtener pedidos por cliente
 */
export async function getByCliente(clienteId) {
  return await prisma.pedido.findMany({
    where: { id_cliente: clienteId },
    orderBy: { ped_createdat: 'desc' },
    include: {
      pedido_detalle: {
        include: {
          producto: true
        }
      }
    }
  });
}

/**
 * Obtener resumen de pedidos
 */
export async function getResumen() {
  const [total, pendientes, completados, cancelados] = await Promise.all([
    prisma.pedido.count(),
    prisma.pedido.count({ where: { ped_estado: 'pendiente' } }),
    prisma.pedido.count({ where: { ped_estado: 'completado' } }),
    prisma.pedido.count({ where: { ped_estado: 'cancelado' } })
  ]);

  return { total, pendientes, completados, cancelados };
}

export default {
  getAll,
  getById,
  create,
  addDetalle,
  update,
  updateEstado,
  remove,
  getByCliente,
  getResumen
};
