const express = require('express');
const cors = require('cors');
const path = require('path');
const productosRoutes = require('./routes/productos');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware CORS - permitir todas las solicitudes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log(`\n🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Rutas de productos
app.use('/api/productos', productosRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Jersey Club EC - Backend funcionando',
    endpoints: {
      productos: '/api/productos',
      health: '/api/health'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVIDOR JERSEY CLUB EC INICIADO');
  console.log('='.repeat(60));
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📦 Productos: http://localhost:${PORT}/api/productos`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60) + '\n');
});
