import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is missing or invalid
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('No autorizado');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT
    const secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    const payload = jwt.verify(token, secret);

    // Attach user payload to the request
    req.user = payload; // At least { id, rol }
    next();
  } catch (err) {
    const error = new Error('Token inválido');
    error.status = 401;
    return next(error);
  }
};

export default requireAuth;