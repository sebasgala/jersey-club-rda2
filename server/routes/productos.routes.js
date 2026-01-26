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