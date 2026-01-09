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

// Logger global para depuración
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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

// POST /api/usuarios - Crear nuevo usuario (para admin)
app.post('/api/usuarios', authController.register);

// PUT /api/usuarios/:id - Actualizar usuario (para admin)
app.put('/api/usuarios/:id', authController.updateUser);

// DELETE /api/usuarios/:id - Eliminar usuario (para admin)
app.delete('/api/usuarios/:id', authController.deleteUser);

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
  console.log('📥 Recibida petición POST /api/ordenes');
  try {
    const { shippingData, paymentMethod, items, total, userId, estado, fecha, tipo, notas } = req.body;

    if (!shippingData || !items || items.length === 0) {
      console.log('⚠️ Petición rechazada: Datos incompletos');
      return res.status(400).json({
        success: false,
        message: 'Datos de orden incompletos'
      });
    }

    const newOrder = {
      id: generateId(),
      orderNumber: `JC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      userId: userId || 'guest',
      status: estado || 'pending', // Usar estado si viene del front
      estado: estado || 'pendiente',
      items,
      total,
      shippingData,
      paymentMethod,
      fecha: fecha || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      tipo: tipo || 'venta',
      notas: notas || ''
    };

    ordenes.push(newOrder);
    saveOrdenes(ordenes);

    // --- LÓGICA DE CONTROL DE STOCK ---
    items.forEach(item => {
      const productIndex = productos.findIndex(p => p.id === item.id);
      if (productIndex !== -1) {
        if (tipo === 'compra') {
          // Si es una compra (restock), aumentamos el stock
          productos[productIndex].stock = (productos[productIndex].stock || 0) + (item.cantidad || 0);
          console.log(`📦 Restock: +${item.cantidad} a ${productos[productIndex].nombre}`);
        } else {
          // Si es una venta (o por defecto), reducimos el stock
          productos[productIndex].stock = Math.max(0, (productos[productIndex].stock || 0) - (item.cantidad || 0));
          console.log(`🛒 Venta: -${item.cantidad} a ${productos[productIndex].nombre}`);
        }
      }
    });
    saveProducts(productos);
    // ----------------------------------

    console.log(`✅ Orden ${newOrder.id} creada con éxito`);
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente y stock actualizado',
      data: newOrder
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al crear la orden'
    });
  }
});

// GET /api/ordenes/compra - Obtener solo órdenes de compra (Mover arriba de /:id)
app.get('/api/ordenes/compra', (req, res) => {
  console.log('📡 [GET] Filtrando órdenes de COMPRA');
  const filtered = ordenes.filter(o => o.tipo === 'compra');
  res.json({ success: true, data: filtered });
});

// GET /api/ordenes/venta - Obtener solo órdenes de venta (Mover arriba de /:id)
app.get('/api/ordenes/venta', (req, res) => {
  console.log('📡 [GET] Filtrando órdenes de VENTA');
  const filtered = ordenes.filter(o => o.tipo === 'venta');
  res.json({ success: true, data: filtered });
});

// GET /api/ordenes - Obtener todas las órdenes
app.get('/api/ordenes', (req, res) => {
  res.json({ success: true, data: ordenes });
});

// GET /api/ordenes/:id - Obtener orden por ID
app.get('/api/ordenes/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📡 [GET] Buscando orden por ID: ${id}`);
  const order = ordenes.find(o => String(o.id) === String(id));
  if (!order) return res.status(404).json({ success: false, message: 'Orden no encontrada' });
  res.json({ success: true, data: order });
});

// PUT /api/ordenes/:id - Actualizar una orden (Fix 404)
app.put('/api/ordenes/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📥 Procesando PUT /api/ordenes/${id}`);

  const index = ordenes.findIndex(o => String(o.id) === String(id));

  if (index === -1) {
    console.log(`❌ Orden ${id} no encontrada. IDs disponibles:`, ordenes.map(o => o.id));
    return res.status(404).json({ success: false, message: `Orden ${id} no encontrada` });
  }

  // --- LÓGICA DE ACTUALIZACIÓN DE STOCK ---
  const oldOrder = ordenes[index];
  const newItems = req.body.items || oldOrder.items;
  const tipo = req.body.tipo || oldOrder.tipo;

  console.log(`⚖️ Ajustando stock para orden ${tipo} (${id})`);

  if (tipo === 'venta') {
    // 1. Devolver stock de la orden anterior
    oldOrder.items.forEach(item => {
      const pIndex = productos.findIndex(p => p.id === item.id);
      if (pIndex !== -1) {
        productos[pIndex].stock = (productos[pIndex].stock || 0) + (item.cantidad || 0);
        console.log(`   🔙 Revertido: +${item.cantidad} a ${productos[pIndex].nombre} (Stock: ${productos[pIndex].stock})`);
      }
    });
    // 2. Restar stock de la nueva versión de la orden
    newItems.forEach(item => {
      const pIndex = productos.findIndex(p => p.id === item.id);
      if (pIndex !== -1) {
        productos[pIndex].stock = Math.max(0, (productos[pIndex].stock || 0) - (item.cantidad || 0));
        console.log(`   📉 Aplicado: -${item.cantidad} a ${productos[pIndex].nombre} (Stock: ${productos[pIndex].stock})`);
      }
    });
  } else if (tipo === 'compra') {
    // Lógica inversa para órdenes de compra (restock)
    oldOrder.items.forEach(item => {
      const pIndex = productos.findIndex(p => p.id === item.id);
      if (pIndex !== -1) {
        productos[pIndex].stock = Math.max(0, (productos[pIndex].stock || 0) - (item.cantidad || 0));
        console.log(`   🔙 Revertido restock: -${item.cantidad} a ${productos[pIndex].nombre} (Stock: ${productos[pIndex].stock})`);
      }
    });
    newItems.forEach(item => {
      const pIndex = productos.findIndex(p => p.id === item.id);
      if (pIndex !== -1) {
        productos[pIndex].stock = (productos[pIndex].stock || 0) + (item.cantidad || 0);
        console.log(`   📈 Aplicado restock: +${item.cantidad} a ${productos[pIndex].nombre} (Stock: ${productos[pIndex].stock})`);
      }
    });
  }
  saveProducts(productos);
  // -----------------------------------------

  // Sincronizar estado y status
  if (req.body.estado) req.body.status = req.body.estado;
  else if (req.body.status) req.body.estado = req.body.status;

  ordenes[index] = {
    ...ordenes[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  saveOrdenes(ordenes);
  console.log(`✅ Orden ${id} actualizada con éxito`);
  res.json({ success: true, message: 'Orden actualizada exitosamente', data: ordenes[index] });
});

// DELETE /api/ordenes/:id - Eliminar una orden (Fix 404)
app.delete('/api/ordenes/:id', (req, res) => {
  const { id } = req.params;
  const index = ordenes.findIndex(o => String(o.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Orden no encontrada' });
  }

  const orderToDelete = ordenes[index];

  // --- DEVOLVER STOCK AL ELIMINAR ---
  if (orderToDelete.tipo === 'compra') {
    orderToDelete.items.forEach(item => {
      const pIndex = productos.findIndex(p => p.id === item.id);
      if (pIndex !== -1) {
        productos[pIndex].stock = Math.max(0, (productos[pIndex].stock || 0) - (item.cantidad || 0));
      }
    });
  } else {
    // Venta por defecto
    orderToDelete.items.forEach(item => {
      const pIndex = productos.findIndex(p => p.id === item.id);
      if (pIndex !== -1) {
        productos[pIndex].stock = (productos[pIndex].stock || 0) + (item.cantidad || 0);
      }
    });
  }
  saveProducts(productos);
  // ----------------------------------

  ordenes.splice(index, 1);
  saveOrdenes(ordenes);
  console.log(`🗑️ Orden ${id} eliminada y stock restaurado`);
  res.json({ success: true, message: 'Orden eliminada exitosamente' });
});

// -----------------------------------------------------
// Catch-all para 404 (para depuración)
app.use((req, res) => {
  console.log(`⚠️ 404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
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