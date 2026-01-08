import { randomUUID } from 'crypto';

/**
 * Middleware: Correlation ID
 * - Lee x-correlation-id del request o genera uno nuevo
 * - Lo agrega a req.correlationId
 * - Lo incluye en el header de respuesta
 */
const correlationId = (req, res, next) => {
  const id = req.headers['x-correlation-id'] || randomUUID();
  req.correlationId = id;
  res.setHeader('x-correlation-id', id);
  next();
};

export default correlationId;