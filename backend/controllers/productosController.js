const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIAS = {
  C00004: 'Fútbol',
  C00005: 'Fórmula 1',
  C00006: 'Accesorios',
  C00007: 'Jersey Club Brand',
};

const getProductos = async (req, res) => {
  try {
    const productos = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    res.json({ status: 'success', data: productos });
  } catch (err) {
    console.error('Error en getProductos:', err);
    res.status(500).json({ status: 'error', message: 'Error al obtener productos' });
  }
};

const getProductosByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const productos = await prisma.product.findMany({ where: { categoryId } });
    res.json({ status: 'success', data: productos });
  } catch (err) {
    console.error('getProductosByCategory error:', err);
    res.status(500).json({ status: 'error', message: 'Error al obtener productos por categoría' });
  }
};

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await prisma.product.findUnique({ where: { id } });
    if (!producto) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.json({ status: 'success', data: producto });
  } catch (err) {
    console.error('getProductoById error:', err);
    res.status(500).json({ status: 'error', message: 'Error al obtener producto' });
  }
};

const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoryId, categoria, imagen, tallas } = req.body;
    const nuevoProducto = await prisma.product.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock, 10),
        categoryId,
        categoria,
        imagen,
        tallas: Array.isArray(tallas) ? tallas : tallas.split(',').map(t => t.trim()),
        createdAt: new Date(),
      },
    });
    res.status(201).json({ status: 'success', data: nuevoProducto });
  } catch (err) {
    console.error('Error en createProducto:', err);
    res.status(500).json({ status: 'error', message: 'Error al crear producto' });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoryId, imagen, tallas, categoria } = req.body;
    const catNombre = categoria || (categoryId ? CATEGORIAS[categoryId] : undefined);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(nombre ? { nombre } : {}),
        ...(descripcion ? { descripcion } : {}),
        ...(precio !== undefined ? { precio: Number(precio) } : {}),
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(catNombre ? { categoria: catNombre } : {}),
        ...(imagen ? { imagen } : {}),
        ...(tallas ? { tallas: Array.isArray(tallas) ? tallas : String(tallas).split(',').map(t => t.trim()) } : {}),
        updatedAt: new Date(),
      },
    });
    res.json({ status: 'success', data: updated });
  } catch (err) {
    console.error('updateProducto error:', err);
    if (err.code === 'P2025') return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.status(500).json({ status: 'error', message: 'Error al actualizar producto' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.product.delete({ where: { id } });
    res.json({ status: 'success', data: deleted });
  } catch (err) {
    console.error('deleteProducto error:', err);
    if (err.code === 'P2025') return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.status(500).json({ status: 'error', message: 'Error al eliminar producto' });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  getProductosByCategory,
  createProducto,
  updateProducto,
  deleteProducto,
};
