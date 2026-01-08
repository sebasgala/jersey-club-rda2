import { Router } from "express";
import {
  crearUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
} from "../controllers/usuarios.controller.js";

const router = Router();

// Rutas CRUD para usuarios
router.get("/", getAllUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", crearUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

export default router;