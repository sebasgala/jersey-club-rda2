import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "data", "pedidos.json");

function readArray(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]");
      return [];
    }
    const content = fs.readFileSync(filePath, "utf-8");
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`JSON inválido en pedidos.json: ${error.message}`);
  }
}

export function getAll() {
  try {
    return readArray(dataPath);
  } catch (error) {
    throw new Error("Error al leer pedidos: " + error.message);
  }
}

export function create(data) {
  try {
    const pedidos = readArray(dataPath);
    const newPedido = { id: Date.now(), ...data };
    pedidos.push(newPedido);
    fs.writeFileSync(dataPath, JSON.stringify(pedidos, null, 2));
    return newPedido;
  } catch (error) {
    throw new Error("Error al crear pedido: " + error.message);
  }
}

export function getById(id) {
  try {
    const pedidos = readArray(dataPath);
    return pedidos.find((pedido) => pedido.id === id) || null;
  } catch (error) {
    throw new Error("Error al obtener pedido por ID: " + error.message);
  }
}

export function update(id, updatedData) {
  try {
    const pedidos = readArray(dataPath);
    const index = pedidos.findIndex((pedido) => pedido.id === id);

    if (index === -1) {
      throw new Error("Pedido no encontrado");
    }

    pedidos[index] = { ...pedidos[index], ...updatedData };
    fs.writeFileSync(dataPath, JSON.stringify(pedidos, null, 2));

    return pedidos[index];
  } catch (error) {
    throw new Error("Error al actualizar pedido: " + error.message);
  }
}

export function remove(id) {
  try {
    const pedidos = readArray(dataPath);
    const filteredPedidos = pedidos.filter((pedido) => pedido.id !== id);

    if (pedidos.length === filteredPedidos.length) {
      throw new Error("Pedido no encontrado");
    }

    fs.writeFileSync(dataPath, JSON.stringify(filteredPedidos, null, 2));
    return true;
  } catch (error) {
    throw new Error("Error al eliminar pedido: " + error.message);
  }
}