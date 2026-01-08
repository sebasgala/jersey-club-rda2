import { v4 as uuidv4 } from 'uuid';

export default function correlation(req, res, next) {
  req.correlationId = `cid-${uuidv4()}`;
  res.setHeader('x-correlation-id', req.correlationId);
  next();
}