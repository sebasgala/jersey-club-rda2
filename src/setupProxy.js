const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5002', // Proxy API requests to backend on port 5002
      changeOrigin: true,
    })
  );
};