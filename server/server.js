import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authController from './controllers/authController.js';
import productosController from './controllers/productos.controller.js';
import { corsMiddleware } from './middleware/cors.js';
import requireAuth from './middleware/requireAuth.js';
import { validators } from './middleware/validator.js';

// Load environment variables
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '../public/assets/images');

const generateImagePath = (name) => {
  if (!name) return 'https://storage.googleapis.com/imagenesjerseyclub/default.webp';

  const normalizeSearch = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const nameNorm = normalizeSearch(name);

  // 1. Mapeos EXACTOS solicitados por el usuario
  if (nameNorm.includes('mclaren f1 lando norris campeon 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/norris.webp';
  if (nameNorm.includes('mclaren f1 racing team 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/mclared-f1-racing.webp';
  if (nameNorm.includes('max verstappen 2025 special edition')) return 'https://storage.googleapis.com/imagenesjerseyclub/red-bull-racing-2025.webp';
  if (nameNorm.includes('mercedes amg petronas')) return 'https://storage.googleapis.com/imagenesjerseyclub/camiseta-mercedes-amg.webp';
  if (nameNorm.includes('alpine f1 team 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/alpine-f1-2025.webp';
  if (nameNorm.includes('aston martin f1 team polo 2024')) return 'https://storage.googleapis.com/imagenesjerseyclub/polo-aston-martin-f1-team-2024.webp';
  if (nameNorm.includes('sauber f1 team 2025')) return 'https://storage.googleapis.com/imagenesjerseyclub/sauber-f1-2025.webp';

  // 2. Mapeos por palabras clave (Fallback secundario)
  if (nameNorm.includes('lando norris')) return 'https://storage.googleapis.com/imagenesjerseyclub/norris.webp';
  if (nameNorm.includes('mclaren') || nameNorm.includes('mclared')) return 'https://storage.googleapis.com/imagenesjerseyclub/mclared-f1-racing.webp';
  if (nameNorm.includes('ferrari')) return 'https://storage.googleapis.com/imagenesjerseyclub/ferrari-f1-team-2025.webp';
  if (nameNorm.includes('red bull')) return 'https://storage.googleapis.com/imagenesjerseyclub/red-bull-racing-2025.webp';
  if (nameNorm.includes('williams')) return 'https://storage.googleapis.com/imagenesjerseyclub/williams-racing-2025.webp';
  if (nameNorm.includes('haas')) return 'https://storage.googleapis.com/imagenesjerseyclub/haas-f1-team-2025.webp';

  // 3. Fallback basado en slug
  const slug = nameNorm.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  return `https://storage.googleapis.com/imagenesjerseyclub/${slug}.webp`;
};

// Middleware básico
// Middleware básico
app.use(corsMiddleware);
app.use(express.json());

// Logger global para depuración
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================

// POST /api/auth/register - Registrar nuevo usuario
// POST /api/auth/register - Registrar nuevo usuario
app.post('/api/auth/register', validators.register, authController.register);

// POST /api/clientes - Crear nuevo cliente (POS) - PROTEGIDO
app.post('/api/clientes', requireAuth, validators.createClient, async (req, res) => {
  try {
    const { nombre, apellido, cedula, email, telefono, direccion } = req.body;

    // Generar ID
    const cliId = await generateNextId('cliente', 'C');

    // Crear en DB
    const newClient = await prisma.cliente.create({
      data: {
        id_cliente: cliId,
        cli_nombre: nombre || 'N/A',
        cli_apellido: apellido || 'N/A',
        cli_ced_ruc: cedula || null,
        cli_email: email || null,
        cli_telefono: telefono || null,
        cli_direccion: direccion || null,
        cli_ciudad: 'Quito', // Default texto, schema espera String
        cli_pais: 'Ecuador'
      }
    });

    await logAudit({ usuarioId: 'POS_ADMIN', accion: 'INSERT', tabla: 'cliente', claveRegistro: cliId, descripcion: `Cliente POS creado: ${nombre} ${apellido}` });

    res.json({ success: true, data: newClient });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: 'Error al crear cliente: ' + error.message });
  }
});

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', validators.login, authController.login);

// GET /api/auth/me - Obtener perfil del usuario autenticado
app.get('/api/auth/me', requireAuth, authController.getProfile);

// GET /api/usuarios - Obtener todos los usuarios (para admin)
app.get('/api/usuarios', requireAuth, authController.getUsers);

// POST /api/usuarios - Crear nuevo usuario (para admin)
app.post('/api/usuarios', requireAuth, validators.register, authController.register);

// PUT /api/usuarios/:id - Actualizar usuario (para admin)
app.put('/api/usuarios/:id', requireAuth, authController.updateUser);

// DELETE /api/usuarios/:id - Eliminar usuario (para admin)
app.delete('/api/usuarios/:id', requireAuth, authController.deleteUser);

// =====================================================
// RUTAS DE PRODUCTOS
// =====================================================

import prisma from './lib/prisma.js';
import { logAudit, generateNextId, handlePrismaError } from './lib/dbHelpers.js';

// GET /api/productos - Obtener todos los productos (con soporte para filtros)
app.get('/api/productos', async (req, res) => {
  try {
    const { categoryId, categoria: catQuery, limit } = req.query;
    const query = {
      where: {},
      take: limit ? parseInt(limit) : undefined,
      include: { categoria: true }
    };

    if (categoryId) {
      query.where.id_categoria = categoryId;
    }

    if (catQuery && typeof catQuery === 'string' && catQuery.trim() !== '') {
      query.where.categoria = {
        cat_nombre: { equals: catQuery.trim(), mode: 'insensitive' }
      };
    }

    console.log('📡 [DEBUG] Ejecutando prisma.producto.findMany con query:', JSON.stringify(query, null, 2));
    const dbProducts = await prisma.producto.findMany(query);
    console.log(`✅ [DEBUG] Encontrados ${dbProducts.length} productos`);

    // Mapear al formato que espera el frontend
    const mapped = dbProducts.map(p => ({
      id: p.id_producto,
      nombre: p.prd_nombre,
      descripcion: p.prd_descripcion,
      precio: parseFloat(p.prd_precio),
      stock: p.prd_stock,
      categoryId: p.id_categoria,
      categoria: p.categoria?.cat_nombre || 'Sin categoría',
      imagen: p.prd_imagen?.startsWith('http') ? p.prd_imagen : generateImagePath(p.prd_nombre),
      image: p.prd_imagen?.startsWith('http') ? p.prd_imagen : generateImagePath(p.prd_nombre),
      descuento: parseFloat(String(p.prd_descuento || 0)),
      discount: parseFloat(String(p.prd_descuento || 0))
    }));

    res.json({ status: 'success', data: mapped });
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

// GET /api/productos/:id - Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const p = await prisma.producto.findUnique({
      where: { id_producto: id },
      include: { categoria: true }
    });

    if (!p) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({
      status: 'success',
      data: {
        id: p.id_producto,
        nombre: p.prd_nombre,
        descripcion: p.prd_descripcion,
        precio: parseFloat(p.prd_precio),
        stock: p.prd_stock,
        categoria: p.categoria?.cat_nombre,
        imagen: p.prd_imagen?.startsWith('http') ? p.prd_imagen : generateImagePath(p.prd_nombre),
        image: p.prd_imagen?.startsWith('http') ? p.prd_imagen : generateImagePath(p.prd_nombre),
        descuento: parseFloat(String(p.prd_descuento || 0))
      }
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

// GET /api/productos/categoria/:id - Obtener productos por categoría
app.get('/api/productos/categoria/:id', productosController.listarProductosPorCategoria);

// POST /api/productos - Crear nuevo producto
app.post('/api/productos', productosController.crearProducto);

// PUT /api/productos/:id - Actualizar producto
app.put('/api/productos/:id', productosController.actualizarProducto);

// DELETE /api/productos/:id - Eliminar producto
app.delete('/api/productos/:id', productosController.eliminarProducto);

// POST /api/ordenes - Crear nueva orden sincronizada con DB - PROTEGIDO
app.post('/api/ordenes', requireAuth, async (req, res) => {
  console.log('📥 Recibida petición POST /api/ordenes (Prisma)');
  try {
    const { shippingData, paymentMethod, items, total, userId, estado, tipo, notas } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Datos de orden incompletos' });
    }

    // 1. Resolver IDs de usuario y cliente
    let idUsuario = 'ADM001'; // Default
    let idCliente = 'C00002'; // Default fallback

    if (req.user?.id) {
      idUsuario = req.user.id;
      const u = await prisma.usuario.findUnique({ where: { id_usuario: idUsuario } });
      if (u?.id_cliente) idCliente = u.id_cliente;
    }

    // 2. Transacción para asegurar integridad
    const result = await prisma.$transaction(async (tx) => {
      const pedId = await generateNextId('pedido', 'PED');

      // Crear Pedido (Estado COMPLETADO automáticamente)
      const nuevoPedido = await tx.pedido.create({
        data: {
          id_pedido: pedId,
          id_usuario: idUsuario,
          id_cliente: idCliente,
          ped_total: typeof total === 'object' ? parseFloat(total.total) : parseFloat(total),
          ped_subtotal: typeof total === 'object' ? parseFloat(total.subtotal) : parseFloat(total) / 1.15,
          ped_iva: typeof total === 'object' ? parseFloat(total.taxes) : 0,
          ped_estado: 'completado', // REQUISITO: Automáticamente COMPLETADO
          ped_fechaentrega: new Date() // Fecha de entrega inmediata (simulada)
        }
      });

      // Crear Detalles y actualizar stock
      let detalleCount = 0;
      for (const item of items) {
        detalleCount++;
        const detId = `D${String(Date.now() + detalleCount).slice(-5)}`; // Generar ID único temporal

        await tx.pedido_detalle.create({
          data: {
            id_detalle: detId,
            id_pedido: pedId,
            id_producto: item.id.length <= 6 ? item.id : 'P00001', // Fallback si el ID es largo
            det_cantidad: item.cantidad || 1,
            det_preciounitario: parseFloat(item.precio || 0),
            det_subtotal: parseFloat(item.precio || 0) * (item.cantidad || 1)
          }
        });

        // Actualizar stock
        await tx.producto.update({
          where: { id_producto: item.id.length <= 6 ? item.id : 'P00001' },
          data: { prd_stock: { decrement: item.cantidad || 1 } }
        });
      }

      // 3. Generar FACTURA automáticamente (REQUISITO)
      const facId = await generateNextId('factura', 'FAC');
      const facNumero = `INV-${Date.now()}`;
      await tx.factura.create({
        data: {
          id_factura: facId,
          id_pedido: pedId,
          id_usuario: idUsuario,
          fac_numero: facNumero,
          fac_total: typeof total === 'object' ? parseFloat(total.total) : parseFloat(total),
          fac_tipo: 'venta'
        }
      });

      // Retornar objeto completo para el frontend (Invoice.jsx)
      return {
        ...req.body, // Mantener shippingData, items, total (obj)
        id: pedId,
        orderNumber: pedId, // ID para mostrar en factura
        invoiceNumber: facNumero,
        status: 'completado',
        createdAt: new Date()
      };
    });

    await logAudit({ usuarioId: idUsuario, accion: 'INSERT', tabla: 'pedido', claveRegistro: result.id, descripcion: `Nueva orden de venta creada ${result.id}` });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente en PostgreSQL',
      data: result
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear la orden en DB' });
  }
});

// GET /api/ordenes - Obtener todas las órdenes - PROTEGIDO (Solo admin/ventas)
app.get('/api/ordenes', requireAuth, async (req, res) => {
  try {
    const all = await prisma.pedido.findMany({
      include: {
        cliente: true,
        pedido_detalle: {
          include: { producto: true }
        }
      },
      orderBy: { ped_createdat: 'desc' }
    });

    const mappedData = all.map(p => ({
      id: p.id_pedido,
      userId: p.id_usuario,
      nombreCliente: p.cliente ? `${p.cliente.cli_nombre} ${p.cliente.cli_apellido}` : 'Cliente Final',
      items: p.pedido_detalle.map(d => ({
        id: d.id_producto,
        nombre: d.producto?.prd_nombre || 'Producto Descontinuado',
        precio: parseFloat(d.det_preciounitario),
        cantidad: d.det_cantidad,
        imagen: `/api/productos/${d.id_producto}/imagen` // Endpoint de imagen dinámica o fallback
      })),
      total: parseFloat(p.ped_total),
      estado: p.ped_estado,
      tipo: 'venta', // Identificador para el frontend
      fecha: p.ped_createdat,
      direccionEnvio: p.cliente?.cli_direccion || 'Dirección de base de datos'
    }));

    res.json({ success: true, data: mappedData });
  } catch (error) {
    return handlePrismaError(error, res);
  }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 5002;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('✅ Integrado con PostgreSQL mediante Prisma');
  });
}

export default app;
