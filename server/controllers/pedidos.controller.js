import { prisma } from '../prisma/client.js';

/**
 * Transforma un pedido de la base de datos al formato esperado por el frontend
 */
const transformPedido = (pedido) => {
  if (!pedido) return null;
  return {
    id: pedido.id_pedido,
    usuarioId: pedido.id_usuario,
    clienteId: pedido.id_cliente,
    total: parseFloat(pedido.ped_total) || 0,
    subtotal: parseFloat(pedido.ped_subtotal) || 0,
    iva: parseFloat(pedido.ped_iva) || 0,
    descuento: parseFloat(pedido.ped_descuento) || 0,
    estado: pedido.ped_estado,
    fechaEntrega: pedido.ped_fechaentrega,
    createdAt: pedido.ped_createdat,
    updatedAt: pedido.ped_updatedat,
    cliente: pedido.cliente ? {
      id: pedido.cliente.id_cliente,
      nombre: pedido.cliente.cli_nombre,
      apellido: pedido.cliente.cli_apellido,
      email: pedido.cliente.cli_email
    } : null,
    detalles: pedido.pedido_detalle?.map(det => ({
      id: det.id_detalle,
      productoId: det.id_producto,
      cantidad: det.det_cantidad,
      precioUnitario: parseFloat(det.det_preciounitario) || 0,
      subtotal: parseFloat(det.det_subtotal) || 0,
      descuento: parseFloat(det.det_descuento) || 0
    })) || []
  };
};

export async function crearPedido(req, res, next) {
  try {
    const { usuarioId, clienteId, items, subtotal, iva, descuento, total, fechaEntrega } = req.body;
    
    // Generar ID único para el pedido
    const count = await prisma.pedido.count();
    const newId = `PD${String(count + 1).padStart(4, '0')}`;
    
    const pedido = await prisma.pedido.create({ 
      data: {
        id_pedido: newId,
        id_usuario: usuarioId,
        id_cliente: clienteId,
        ped_subtotal: subtotal || 0,
        ped_iva: iva || 0,
        ped_descuento: descuento || 0,
        ped_total: total || 0,
        ped_estado: 'pendiente',
        ped_fechaentrega: fechaEntrega ? new Date(fechaEntrega) : null
      },
      include: {
        cliente: true,
        pedido_detalle: true
      }
    });
    res.status(201).json({ status: 'created', data: transformPedido(pedido) });
  } catch (error) {
    next(error);
  }
}

export async function obtenerPedidoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const pedido = await prisma.pedido.findUnique({ 
      where: { id_pedido: id },
      include: {
        cliente: true,
        pedido_detalle: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!pedido) {
      return res.status(404).json({ status: 'error', message: 'Pedido no encontrado' });
    }

    res.json({ status: 'success', data: transformPedido(pedido) });
  } catch (error) {
    next(error);
  }
}

export async function obtenerMisPedidos(req, res, next) {
  try {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
    }
    
    const pedidos = await prisma.pedido.findMany({ 
      where: { id_usuario: userId },
      include: {
        cliente: true,
        pedido_detalle: true
      },
      orderBy: {
        ped_createdat: 'desc'
      }
    });
    res.json({ status: 'success', data: pedidos.map(transformPedido) });
  } catch (error) {
    next(error);
  }
}

export async function obtenerTodosLosPedidos(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        usuario: true,
        pedido_detalle: true
      },
      orderBy: {
        ped_createdat: 'desc'
      }
    });
    res.json({ status: 'success', data: pedidos.map(transformPedido) });
  } catch (error) {
    next(error);
  }
}

export async function actualizarPedido(req, res, next) {
  try {
    const { id } = req.params;
    const { estado, fechaEntrega, subtotal, iva, descuento, total } = req.body;
    
    const updateData = {};
    if (estado !== undefined) updateData.ped_estado = estado;
    if (fechaEntrega !== undefined) updateData.ped_fechaentrega = new Date(fechaEntrega);
    if (subtotal !== undefined) updateData.ped_subtotal = subtotal;
    if (iva !== undefined) updateData.ped_iva = iva;
    if (descuento !== undefined) updateData.ped_descuento = descuento;
    if (total !== undefined) updateData.ped_total = total;
    updateData.ped_updatedat = new Date();
    
    const pedidoActualizado = await prisma.pedido.update({ 
      where: { id_pedido: id }, 
      data: updateData,
      include: {
        cliente: true,
        pedido_detalle: true
      }
    });
    res.json({ status: 'success', data: transformPedido(pedidoActualizado) });
  } catch (error) {
    next(error);
  }
}

export async function eliminarPedido(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.pedido.delete({ where: { id_pedido: id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}