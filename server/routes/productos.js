import express from 'express';

const router = express.Router();

// Almacenamiento en memoria (sin BD, sin auth)
let productos = [
  {
    id: 'P00001',
    nombre: 'Producto de ejemplo',
    descripcion: 'Este es un producto de ejemplo',
    precio: 50,
    stock: 10,
    categoryId: 'C00004',
    categoria: 'Fútbol',
    imagen: '/assets/images/placeholder.webp',
    createdAt: new Date().toISOString(),
  },
];

const categoriasMap = {
  'C00004': 'Fútbol',
  'C00005': 'Fórmula 1',
  'C00006': 'Accesorios',
  'C00007': 'Jersey Club Brand',
};

const generateId = () => {
  const last = productos.at(-1);
  const lastNum = last ? parseInt(last.id.replace('P', ''), 10) : 0;
  return `P${String(lastNum + 1).padStart(5, '0')}`;
};

// GET público
router.get('/', (req, res) => {
  res.json({ status: 'success', data: productos });
});

// GET por id público
router.get('/:id', (req, res) => {
  const item = productos.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  res.json({ status: 'success', data: item });
});

// POST público
router.post('/', (req, res) => {
  const { nombre, descripcion, precio, stock, categoryId, imagen } = req.body;
  if (!nombre || !precio || stock == null || !categoryId) {
    return res.status(400).json({ status: 'error', message: 'Campos obligatorios: nombre, precio, stock, categoryId' });
  }

  const nuevo = {
    id: generateId(),
    nombre,
    descripcion: descripcion || nombre,
    precio: parseFloat(precio),
    stock: parseInt(stock, 10),
    categoryId,
    categoria: categoriasMap[categoryId] || 'Sin categoría',
    imagen: imagen || '/assets/images/placeholder.webp',
    createdAt: new Date().toISOString(),
  };

  productos.push(nuevo);
  res.status(201).json({ status: 'success', data: nuevo });
});

// PUT público
router.put('/:id', (req, res) => {
  const idx = productos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

  const { nombre, descripcion, precio, stock, categoryId, imagen } = req.body;
  const prev = productos[idx];

  productos[idx] = {
    ...prev,
    nombre: nombre ?? prev.nombre,
    descripcion: descripcion ?? prev.descripcion,
    precio: precio != null ? parseFloat(precio) : prev.precio,
    stock: stock != null ? parseInt(stock, 10) : prev.stock,
    categoryId: categoryId ?? prev.categoryId,
    categoria: categoryId ? (categoriasMap[categoryId] || prev.categoria) : prev.categoria,
    imagen: imagen ?? prev.imagen,
    updatedAt: new Date().toISOString(),
  };

  res.json({ status: 'success', data: productos[idx] });
});

// DELETE público
router.delete('/:id', (req, res) => {
  const idx = productos.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  productos.splice(idx, 1);
  res.json({ status: 'success', message: 'Producto eliminado exitosamente' });
});

export default router;