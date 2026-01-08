import { Router } from "express";
import { 
  crearPedido, 
  obtenerMisPedidos, 
  obtenerTodosLosPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido
} from "../controllers/pedidos.controller.js";

const router = Router();

// Rutas CRUD para pedidos
router.get("/", obtenerTodosLosPedidos);
router.get("/mis-pedidos", obtenerMisPedidos);
router.get("/:id", obtenerPedidoPorId);
router.post("/", crearPedido);
router.put("/:id", actualizarPedido);
router.delete("/:id", eliminarPedido);

export default router;