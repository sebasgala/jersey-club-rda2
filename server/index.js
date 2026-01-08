import 'dotenv/config';
import app from './app.js'; // Cambiar require por import

const PORT = process.env.PORT || 5002;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
