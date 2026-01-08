import { Router } from "express";
import {
  listarProductos,
  detalleProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/productos.controller.js";
import {
  authenticate,
  requireAdmin,
  validateProducto,
  parsePagination,
} from "../middleware/index.js";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
const prisma = new PrismaClient();

// ==================== RUTAS PÚBLICAS ====================

// GET /api/productos - Listar productos con paginación/filtros
router.get("/", parsePagination, listarProductos);

// GET /api/productos/:id - Detalle de un producto
router.get("/:id", detalleProducto);

// Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const productos = await prisma.product.findMany({
      include: {
        categoria: true, // Incluir la relación con categoría si existe
      },
    });

    // Transformar los datos para que coincidan con lo que espera el frontend
    const productosFormateados = productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen || "/assets/images/placeholder.webp",
      categoria: producto.categoria?.nombre || "Sin categoría",
      categoryId: producto.categoryId,
    }));

    res.json(productosFormateados);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// ==================== RUTAS PROTEGIDAS (ADMIN) ====================

// POST /api/productos - Crear producto
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateProducto,
  authMiddleware,
  crearProducto
);

// PUT /api/productos/:id - Actualizar producto
router.put("/:id", authenticate, requireAdmin, validateProducto, actualizarProducto);

// DELETE /api/productos/:id - Eliminar producto
router.delete("/:id", authenticate, requireAdmin, eliminarProducto);

export default router;