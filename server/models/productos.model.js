import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "data", "productos.json");

// Helper functions to load and save JSON data
const load = () => {
  try {
    if (!fs.existsSync(dataPath)) return [];
    const data = fs.readFileSync(dataPath, "utf-8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    throw new Error("Error reading productos.json: " + error.message);
  }
};

const save = (productos) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(productos, null, 2));
  } catch (error) {
    throw new Error("Error writing productos.json: " + error.message);
  }
};

// Exported functions
export function getAll(query = {}) {
  const { page = 1, limit = 20, categoria, sort } = query;
  let productos = load();

  // Filter by category if provided
  if (categoria) {
    productos = productos.filter((producto) => producto.categoria === categoria);
  }

  // Sort by the specified field if provided
  if (sort) {
    productos.sort((a, b) => (a[sort] > b[sort] ? 1 : -1));
  }

  // Paginate the results
  const start = (page - 1) * limit;
  const end = start + limit;
  return productos.slice(start, end);
}

export function getById(id) {
  const productos = load();
  return productos.find((producto) => producto.id === id) || null;
}

export function create(data) {
  const productos = load();
  const maxId = productos.reduce((max, producto) => Math.max(max, producto.id || 0), 0);
  const newProducto = { id: maxId + 1, ...data };
  productos.push(newProducto);
  save(productos);
  return newProducto;
}

export function update(id, data) {
  const productos = load();
  const index = productos.findIndex((producto) => producto.id === id);
  if (index === -1) return null;

  const updatedProducto = { id, ...data };
  productos[index] = updatedProducto;
  save(productos);
  return updatedProducto;
}

export function remove(id) {
  const productos = load();
  const index = productos.findIndex((producto) => producto.id === id);
  if (index === -1) return null;

  const [deletedProducto] = productos.splice(index, 1);
  save(productos);
  return deletedProducto;
}

// Removed unused in-memory array and related functions
// Ensure only load/save-based functions are exported