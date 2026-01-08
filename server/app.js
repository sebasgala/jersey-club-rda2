import express from 'express';
import testRoutes from './routes/testRoutes.js'; // Importación correcta con export default

const app = express();

app.use('/api/test', testRoutes);

export default app;