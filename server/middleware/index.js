import authenticate from "./authenticate.js";
import requireAuth from "./requireAuth.js";
import requireAdmin from "./requireAdmin.js";
import cors from "./cors.js";
import correlationId from "./correlationId.js";
import authContext from "./authContext.js";
import logger from "./logger.js";
import parsePagination from "./parsePagination.js";
import validateProducto from "./validateProducto.js";
import errorHandler from "./errorHandler.js";

export {
  // Autenticación
  authenticate,
  requireAuth,
  requireAdmin,

  // CORS
  cors,

  // Correlation ID
  correlationId,

  // Contexto de autenticación
  authContext,

  // Logger
  logger,

  // Paginación
  parsePagination,

  // Validación de productos
  validateProducto,

  // Errores
  errorHandler,
};
