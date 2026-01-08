/**
 * Middleware: Logger
 * - Registra cada petición con timestamp, método, URL y correlationId
 * - También registra el status de respuesta al finalizar
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const correlationId = req.correlationId || '-';

  // Log de entrada
  console.log(`[${new Date().toISOString()}] --> ${req.method} ${req.originalUrl} (corrId: ${correlationId})`);

  // Hook para log de salida
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] <-- ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });

  next();
};

export default logger;