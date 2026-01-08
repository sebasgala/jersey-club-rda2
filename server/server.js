import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authController from './controllers/authController.js';

// Load environment variables
dotenv.config();

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the JSON file
const PRODUCTOS_FILE = path.join(__dirname, 'data', 'productos.json');

// Helper function to load products from JSON file
const loadProducts = () => {
  try {
    if (fs.existsSync(PRODUCTOS_FILE)) {
      const data = fs.readFileSync(PRODUCTOS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('❌ Error loading products from file:', error);
    return [];
  }
};

// Helper function to save products to JSON file
const saveProducts = (productos) => {
  try {
    const dir = path.dirname(PRODUCTOS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRODUCTOS_FILE, JSON.stringify(productos, null, 2), 'utf-8');
    console.log('✅ Products saved to file successfully');
  } catch (error) {
    console.error('❌ Error saving products to file:', error);
  }
};

// Middleware básico
app.use(cors());
app.use(express.json());

// =====================================================
// ALMACENAMIENTO PERSISTENTE PARA PRODUCTOS
// =====================================================
let productos = loadProducts();

const categoriasMap = {
  'C00004': 'Fútbol',
  'C00005': 'Fórmula 1',
  'C00006': 'Accesorios',
  'C00007': 'Jersey Club Brand',
};

const generateId = () => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `P${randomNum}`;
};

// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================

// POST /api/auth/register - Registrar nuevo usuario
app.post('/api/auth/register', authController.register);

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', authController.login);

// GET /api/auth/me - Obtener perfil del usuario autenticado
app.get('/api/auth/me', authController.getProfile);

// GET /api/usuarios - Obtener todos los usuarios (para admin)
app.get('/api/usuarios', authController.getUsers);

// =====================================================
// RUTAS DE PRODUCTOS
// =====================================================

// GET /api/productos - Obtener todos los productos (con soporte para filtros)
app.get('/api/productos', (req, res) => {
  let resultado = [...productos];
  const { categoryId, categoria, limit } = req.query;

  // Filtrar por ID de categoría
  if (categoryId) {
    resultado = resultado.filter(p => p.categoryId === categoryId);
  }

  // Filtrar por nombre de categoría (case insensitive)
  if (categoria) {
    resultado = resultado.filter(p =>
      p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase()
    );
  }

  // Limitar resultados
  if (limit) {
    resultado = resultado.slice(0, parseInt(limit));
  }

  res.json({ status: 'success', data: resultado });
});

// GET /api/productos/categoria/:categoryId - Obtener productos por ID de categoría
app.get('/api/productos/categoria/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const filteredProducts = productos.filter(p => p.categoryId === categoryId);

  res.json({ status: 'success', data: filteredProducts });
});

// GET /api/productos/:id - Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  }

  res.json({ status: 'success', data: producto });
});

// POST /api/productos - Crear un nuevo producto
app.post('/api/productos', (req, res) => {
  const { nombre, descripcion, precio, stock, categoryId, imagen } = req.body;

  // Validación básica
  if (!nombre || !precio || !stock || !categoryId) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan campos requeridos: nombre, precio, stock, categoryId'
    });
  }

  const nuevoProducto = {
    id: generateId(),
    nombre,
    descripcion: descripcion || '',
    precio: parseFloat(precio),
    stock: parseInt(stock),
    categoryId,
    categoria: categoriasMap[categoryId] || 'Sin categoría',
    imagen: imagen || '/assets/images/default.webp',
    createdAt: new Date().toISOString()
  };

  productos.push(nuevoProducto);
  saveProducts(productos);  // Save to file

  res.status(201).json({ status: 'success', data: nuevoProducto });
});

// PUT /api/productos/:id - Actualizar un producto
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, categoryId, imagen } = req.body;

  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  }

  const prev = productos[index];
  productos[index] = {
    ...prev,
    nombre: nombre || prev.nombre,
    descripcion: descripcion !== undefined ? descripcion : prev.descripcion,
    precio: precio !== undefined ? parseFloat(precio) : prev.precio,
    stock: stock !== undefined ? parseInt(stock) : prev.stock,
    categoryId: categoryId || prev.categoryId,
    categoria: categoryId ? (categoriasMap[categoryId] || 'Sin categoría') : prev.categoria,
    imagen: imagen || prev.imagen,
    updatedAt: new Date().toISOString()
  };

  saveProducts(productos);  // Save to file

  res.json({ status: 'success', data: productos[index] });
});

// DELETE /api/productos/:id - Eliminar un producto
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  }

  productos.splice(index, 1);
  saveProducts(productos);  // Save to file

  res.json({ status: 'success', message: 'Producto eliminado exitosamente' });
});

// =====================================================
// ALMACENAMIENTO PERSISTENTE PARA ÓRDENES
// =====================================================
const ORDENES_FILE = path.join(__dirname, 'data', 'ordenes.json');

const loadOrdenes = () => {
  try {
    if (fs.existsSync(ORDENES_FILE)) {
      const data = fs.readFileSync(ORDENES_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('❌ Error loading orders from file:', error);
    return [];
  }
};

const saveOrdenes = (ordenes) => {
  try {
    const dir = path.dirname(ORDENES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDENES_FILE, JSON.stringify(ordenes, null, 2), 'utf-8');
  } catch (error) {
    console.error('❌ Error saving orders to file:', error);
  }
};

let ordenes = loadOrdenes();

// =====================================================
// RUTAS DE ÓRDENES
// =====================================================

// POST /api/ordenes - Crear nueva orden
app.post('/api/ordenes', (req, res) => {
  try {
    const { shippingData, paymentMethod, items, total, userId } = req.body;

    if (!shippingData || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de orden incompletos'
      });
    }

    const newOrder = {
      id: generateId(),
      orderNumber: `JC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      userId: userId || 'guest',
      status: 'pending',
      items,
      total,
      shippingData,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    ordenes.push(newOrder);
    saveOrdenes(ordenes);

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al crear la orden'
    });
  }
});

// GET /api/ordenes - Obtener todas las órdenes
app.get('/api/ordenes', (req, res) => {
  res.json({ success: true, data: ordenes });
});

// GET /api/ordenes/:id - Obtener orden por ID
app.get('/api/ordenes/:id', (req, res) => {
  const order = ordenes.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
  res.json({ success: true, data: order });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Productos cargados: ${productos.length}`);
  console.log(`📦 Órdenes cargadas: ${ordenes.length}`);
});