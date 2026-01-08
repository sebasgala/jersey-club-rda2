import cors from 'cors';

/**
 * Configuración de CORS
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    const NODE_ENV = process.env.NODE_ENV || 'development';

    // En desarrollo, permitir cualquier origen
    if (NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Lista de orígenes permitidos en producción
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  maxAge: 86400 // 24 horas
};

/**
 * Middleware de CORS configurado
 */
const corsMiddleware = cors(corsOptions);

// Placeholder middleware for CORS
const placeholderCors = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
};

export { corsMiddleware, placeholderCors };
export default corsMiddleware;
