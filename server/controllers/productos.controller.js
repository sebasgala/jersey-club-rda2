import prisma from '../lib/prisma.js';
import { logAudit } from '../lib/dbHelpers.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '../../public/assets/images');

/**
 * Genera el nombre de imagen basado en el nombre del producto
 * Ej: "Real Madrid 2017 Local Retro" -> "/assets/images/real-madrid-2017-local-retro.webp"
 */
const GCS_BASE_URL = 'https://storage.googleapis.com/imagenesjerseyclub';

const generateImagePath = (id, name) => {
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

/**
 * Transforma un producto de la base de datos al formato esperado por el frontend
 * Campos reales del schema PostgreSQL (según schema.prisma):
 * - prd_nombre: nombre del producto (VarChar 200)
 * - prd_descripcion: descripción del producto
 * - prd_precio: precio del producto (Decimal 10,2)
 * - prd_stock: stock disponible (Int)
 * - prd_stockminimo: stock mínimo (Int, default 5)
 * - id_categoria: FK a categoria (Char 6, nullable)
 * - prd_activo: si está activo (Boolean, default true)
 */


const transformProduct = (producto) => {
  if (!producto) return null;

  const nombre = producto.prd_nombre || 'Sin nombre';



  return {
    id: producto.id_producto,
    nombre: nombre,
    name: nombre,
    descripcion: producto.prd_descripcion || nombre,
    description: producto.prd_descripcion || nombre,
    precio: parseFloat(String(producto.prd_precio)) || 0,
    price: parseFloat(String(producto.prd_precio)) || 0,
    stock: producto.prd_stock || 0,
    stockMinimo: producto.prd_stockminimo || 5,
    descuento: parseFloat(String(producto.prd_descuento || 0)) || 0,
    discount: parseFloat(String(producto.prd_descuento || 0)) || 0,
    activo: producto.prd_activo !== false,
    categoria: producto.categoria?.cat_nombre || producto.id_categoria || 'Sin categoría',
    category: producto.categoria?.cat_nombre || producto.id_categoria || 'Sin categoría',
    categoryId: producto.id_categoria,
    // Priorizar imagen de la base de datos si existe y tiene formato de URL
    imagen: producto.prd_imagen?.startsWith('http')
      ? producto.prd_imagen
      : generateImagePath(producto.id_producto, nombre),
    image: producto.prd_imagen?.startsWith('http')
      ? producto.prd_imagen
      : generateImagePath(producto.id_producto, nombre),
    createdAt: producto.prd_createdat,
    updatedAt: producto.prd_updatedat
  };
};

export async function listarProductos(req, res, next) {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true
      }
    });

    const data = productos.map(transformProduct);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function detalleProducto(req, res, next) {
  try {
    const id = req.params.id;

    const prod = await prisma.producto.findUnique({
      where: { id_producto: id },
      include: {
        categoria: true
      }
    });

    if (!prod) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      return next(err);
    }

    res.status(200).json({ status: 'success', data: transformProduct(prod) });
  } catch (err) {
    next(err);
  }
}

export async function listarProductosPorCategoria(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`🔍 [DEBUG] Buscando productos para categoría: "${id}"`);

    // Buscar productos que pertenezcan a esta categoría
    // El ID en la base de datos puede tener espacios al final por ser Char(6)
    const productos = await prisma.producto.findMany({
      where: {
        id_categoria: {
          startsWith: id.trim()
        }
      },
      include: {
        categoria: true
      }
    });

    console.log(`✅ [DEBUG] Encontrados ${productos.length} productos para "${id}"`);

    const data = productos.map(transformProduct);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    console.error(`❌ [DEBUG ERR] Error listando productos por categoría:`, err);
    next(err);
  }
}

export async function crearProducto(req, res, next) {
  try {
    const { nombre, name, descripcion, description, precio, price, stock, categoryId, id_categoria, activo, imagen, image } = req.body;

    // Usar nombre o name
    const productName = nombre || name;
    if (!productName || productName.trim() === '') {
      const err = new Error('El nombre del producto es requerido');
      err.status = 400;
      return next(err);
    }

    // Usar precio o price
    const productPrice = parseFloat(precio || price || 0);
    if (productPrice <= 0) {
      const err = new Error('El precio debe ser mayor a 0');
      err.status = 400;
      return next(err);
    }

    // Usar descripcion o description
    const productDescription = descripcion || description || productName;

    // Generar ID único (P00XXX)
    // Generate a unique 6-character ID (P + 5 digits)
    let newId;
    let attempts = 0;
    do {
      const randomNum = Math.floor(Math.random() * 99999) + 1;
      newId = `P${String(randomNum).padStart(5, '0')}`;
      attempts++;

      // Check if ID exists
      const existing = await prisma.producto.findUnique({
        where: { id_producto: newId }
      });

      if (!existing) break;

      if (attempts > 100) {
        // Fallback: use timestamp-based ID but limited to 5 chars
        const timestamp = Date.now().toString();
        const last5 = timestamp.slice(-5);
        newId = `P${last5}`;
        break;
      }
    } while (true);

    // Validar categoría - usar FUT1 (Fútbol) por defecto
    const categoriaId = categoryId || id_categoria || 'FUT1  ';

    // Verificar que la categoría existe
    const catFound = await prisma.categoria.findUnique({
      where: { id_categoria: categoriaId }
    });

    if (!catFound) {
      const err = new Error(`La categoría ${categoriaId} no existe`);
      err.status = 400;
      return next(err);
    }

    const creado = await prisma.producto.create({
      data: {
        id_producto: newId,
        prd_nombre: productName,
        prd_descripcion: productDescription,
        prd_precio: productPrice,
        prd_stock: stock || 0,
        prd_stockminimo: 5,
        prd_descuento: req.body.descuento !== undefined ? req.body.descuento : (req.body.discount || 0),
        id_categoria: categoriaId,
        prd_activo: activo !== false,
        prd_imagen: imagen || image || null
      },
      include: {
        categoria: true
      }
    });

    await logAudit({
      usuarioId: req.user?.id || 'ADMIN',
      accion: 'INSERT',
      tabla: 'producto',
      claveRegistro: parseInt(newId.replace(/\D/g, '')),
      descripcion: `Producto creado: ${productName} (${newId})`
    });

    res.status(201).json({ status: 'created', data: transformProduct(creado) });
  } catch (err) {
    next(err);
  }
}

export async function actualizarProducto(req, res, next) {
  try {
    const id = req.params.id;
    const { nombre, name, descripcion, description, precio, price, stock, stockMinimo, categoryId, id_categoria, activo, imagen, image } = req.body;

    const updateData = {};

    // Nombre
    if (nombre !== undefined) updateData.prd_nombre = nombre;
    else if (name !== undefined) updateData.prd_nombre = name;

    // Descripción
    if (descripcion !== undefined) updateData.prd_descripcion = descripcion;
    else if (description !== undefined) updateData.prd_descripcion = description;

    // Precio
    if (precio !== undefined) updateData.prd_precio = precio;
    else if (price !== undefined) updateData.prd_precio = price;

    // Descuento
    if (req.body.descuento !== undefined) {
      updateData.prd_descuento = parseFloat(req.body.descuento);
    } else if (req.body.discount !== undefined) {
      updateData.prd_descuento = parseFloat(req.body.discount);
    }

    // Stock
    if (stock !== undefined) updateData.prd_stock = stock;

    // Stock mínimo
    if (stockMinimo !== undefined) updateData.prd_stockminimo = stockMinimo;

    // Categoría
    if (categoryId !== undefined) updateData.id_categoria = categoryId;
    else if (id_categoria !== undefined) updateData.id_categoria = id_categoria;

    // Activo
    if (activo !== undefined) updateData.prd_activo = activo;

    // Imagen
    if (imagen !== undefined) updateData.prd_imagen = imagen;
    else if (image !== undefined) updateData.prd_imagen = image;

    console.log(`📝 [DEBUG] Actualizando producto ${id} con data:`, JSON.stringify(updateData, null, 2));

    const updated = await prisma.producto.update({
      where: { id_producto: id.trim() },
      data: updateData,
      include: {
        categoria: true
      }
    });

    try {
      await logAudit({
        usuarioId: req.user?.id || 'ADMIN',
        accion: 'UPDATE',
        tabla: 'producto',
        claveRegistro: id,
        descripcion: `Producto actualizado: ${id}`
      });
    } catch (auditErr) {
      console.error('⚠️ Error no crítico en logAudit:', auditErr.message);
    }

    res.status(200).json({ status: 'updated', data: transformProduct(updated) });
  } catch (err) {
    console.error('❌ Error fatal en actualizarProducto:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el producto',
      details: err.message
    });
  }
}

export async function eliminarProducto(req, res, next) {
  try {
    const id = req.params.id;

    await prisma.producto.delete({ where: { id_producto: id } });
    await logAudit({
      usuarioId: req.user?.id || 'ADMIN',
      accion: 'DELETE',
      tabla: 'producto',
      claveRegistro: parseInt(id.replace(/\D/g, '')),
      descripcion: `Producto eliminado: ${id}`
    });

    res.status(200).json({ status: 'deleted', data: { id } });
  } catch (err) {
    next(err);
  }
}

export default {
  listarProductos,
  detalleProducto,
  listarProductosPorCategoria,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};

