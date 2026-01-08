/**
 * =====================================================
 * MIDDLEWARE: Error Handler
 * =====================================================
 * Manejo centralizado de errores (ES Modules)
 */

/**
 * Middleware para manejar rutas no encontradas
 * Ignora rutas de WebSocket del hot-reload de React y archivos estáticos
 */
export function notFound(req, res, next) {
  // Ignorar rutas de WebSocket (hot-reload de React)
  if (req.originalUrl === '/ws' || req.originalUrl.startsWith('/ws/')) {
    return res.status(404).end();
  }
  
  // Ignorar rutas de sockjs-node (otro tipo de hot-reload)
  if (req.originalUrl.includes('sockjs-node')) {
    return res.status(404).end();
  }
  
  // Silenciar errores de archivos estáticos no encontrados (imágenes, etc.)
  if (req.originalUrl.startsWith('/assets/') || 
      req.originalUrl.endsWith('.webp') || 
      req.originalUrl.endsWith('.png') || 
      req.originalUrl.endsWith('.jpg') || 
      req.originalUrl.endsWith('.jpeg') ||
      req.originalUrl.endsWith('.svg') ||
      req.originalUrl.endsWith('.ico')) {
    return res.status(404).end();
  }
  
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

/**
 * Middleware de manejo de errores global
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error capturado:", err);
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";
  return res.status(status).json({
    status: "error",
    code: status,
    message
  });
};

export default errorHandler;

/**
 * Wrapper para manejar errores en funciones async
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
