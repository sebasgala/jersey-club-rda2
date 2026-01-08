import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createOrderDetail(req, res) {
  const { id_pedido, id_producto, det_cantidad, ...otherFields } = req.body;

  // Validar que la cantidad sea mayor que 0
  if (det_cantidad <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser mayor que 0." });
  }

  try {
    const newOrderDetail = await prisma.pedido_detalle.create({
      data: { id_pedido, id_producto, det_cantidad, ...otherFields },
    });
    res.status(201).json(newOrderDetail);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el detalle del pedido." });
  }
}

export { createOrderDetail };