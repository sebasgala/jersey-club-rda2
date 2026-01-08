import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('=== DEPURACIÓN AUTH MIDDLEWARE ===');
  console.log('Encabezado Authorization:', authHeader);
  console.log('JWT_SECRET configurado:', process.env.JWT_SECRET ? 'Sí (longitud: ' + process.env.JWT_SECRET.length + ')' : 'No');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Error: No hay token o formato incorrecto');
    return res.status(401).json({ status: 'error', code: 401, message: 'No autorizado - Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extraído:', token.substring(0, 20) + '...');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado exitosamente:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Error al verificar token:', error.message);
    return res.status(401).json({ status: 'error', code: 401, message: 'Token inválido' });
  }
};
