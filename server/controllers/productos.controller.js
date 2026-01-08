import { prisma } from '../prisma/client.js';

/**
 * Genera el nombre de imagen basado en el nombre del producto
 * Ej: "Real Madrid 2017 Local Retro" -> "/assets/images/real-madrid-2017-local-retro.webp"
 */
const generateImagePath = (nombre) => {
  if (!nombre) return '/assets/images/default.webp';
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')    // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-');           // Espacios a guiones
  return `/assets/images/${slug}.webp`;
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
    precio: parseFloat(producto.prd_precio) || 0,
    price: parseFloat(producto.prd_precio) || 0,
    stock: producto.prd_stock || 0,
    stockMinimo: producto.prd_stockminimo || 5,
    activo: producto.prd_activo !== false,
    categoria: producto.categoria?.cat_nombre || producto.id_categoria || 'Sin categoría',
    category: producto.categoria?.cat_nombre || producto.id_categoria || 'Sin categoría',
    categoryId: producto.id_categoria,
    // Generar ruta de imagen desde el nombre del producto
    imagen: generateImagePath(nombre),
    image: generateImagePath(nombre),
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

export async function crearProducto(req, res, next) {
  try {
    const { nombre, name, descripcion, description, precio, price, stock, categoryId, id_categoria, activo } = req.body;
    
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

    // Validar categoría - usar C00004 (Fútbol) por defecto
    const categoriaId = categoryId || id_categoria || 'C00004';
    
    // Verificar que la categoría existe
    const categoriaExiste = await prisma.categoria.findUnique({
      where: { id_categoria: categoriaId }
    });
    
    if (!categoriaExiste) {
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
        id_categoria: categoriaId,
        prd_activo: activo !== false
      },
      include: {
        categoria: true
      }
    });
    
    res.status(201).json({ status: 'created', data: transformProduct(creado) });
  } catch (err) {
    next(err);
  }
}

export async function actualizarProducto(req, res, next) {
  try {
    const id = req.params.id;
    const { nombre, name, descripcion, description, precio, price, stock, stockMinimo, categoryId, id_categoria, activo } = req.body;
    
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
    
    // Stock
    if (stock !== undefined) updateData.prd_stock = stock;
    
    // Stock mínimo
    if (stockMinimo !== undefined) updateData.prd_stockminimo = stockMinimo;
    
    // Categoría
    if (categoryId !== undefined) updateData.id_categoria = categoryId;
    else if (id_categoria !== undefined) updateData.id_categoria = id_categoria;
    
    // Activo
    if (activo !== undefined) updateData.prd_activo = activo;
    
    // Actualizar timestamp
    updateData.prd_updatedat = new Date();

    const updated = await prisma.producto.update({ 
      where: { id_producto: id }, 
      data: updateData,
      include: {
        categoria: true
      }
    });
    
    res.status(200).json({ status: 'updated', data: transformProduct(updated) });
  } catch (err) {
    next(err);
  }
}

export async function eliminarProducto(req, res, next) {
  try {
    const id = req.params.id;

    await prisma.producto.delete({ where: { id_producto: id } });
    res.status(200).json({ status: 'deleted', data: { id } });
  } catch (err) {
    next(err);
  }
}

