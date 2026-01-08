import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "data", "usuarios.json");

function readArray(filePath) {
  // Si no existe el archivo, lo inicializa como []
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
    return [];
  }

  // Lee contenido y si está vacío lo trata como []
  const content = fs.readFileSync(filePath, "utf-8").trim();
  if (!content) return [];

  // Parseo seguro
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) {
    throw new Error("usuarios.json no contiene un array JSON");
  }
  return parsed;
}

export function getAll() {
  try {
    return readArray(dataPath);
  } catch (error) {
    throw new Error("Error al leer usuarios: " + error.message);
  }
}

export function create(usuario) {
  try {
    console.log("USUARIOS.JSON PATH (create) =>", dataPath);

    const usuarios = readArray(dataPath);
    const newUsuario = { id: Date.now(), ...usuario };

    usuarios.push(newUsuario);
    fs.writeFileSync(dataPath, JSON.stringify(usuarios, null, 2), "utf-8");

    return newUsuario;
  } catch (error) {
    throw new Error("Error al crear usuario: " + error.message);
  }
}

export function getById(id) {
  try {
    const usuarios = readArray(dataPath);
    return usuarios.find((usuario) => usuario.id === id) || null;
  } catch (error) {
    throw new Error("Error al obtener usuario por ID: " + error.message);
  }
}

export function update(id, updatedData) {
  try {
    const usuarios = readArray(dataPath);
    const index = usuarios.findIndex((usuario) => usuario.id === id);

    if (index === -1) {
      throw new Error("Usuario no encontrado");
    }

    usuarios[index] = { ...usuarios[index], ...updatedData };
    fs.writeFileSync(dataPath, JSON.stringify(usuarios, null, 2), "utf-8");

    return usuarios[index];
  } catch (error) {
    throw new Error("Error al actualizar usuario: " + error.message);
  }
}

export function remove(id) {
  try {
    const usuarios = readArray(dataPath);
    const filteredUsuarios = usuarios.filter((usuario) => usuario.id !== id);

    if (usuarios.length === filteredUsuarios.length) {
      throw new Error("Usuario no encontrado");
    }

    fs.writeFileSync(dataPath, JSON.stringify(filteredUsuarios, null, 2), "utf-8");
    return true;
  } catch (error) {
    throw new Error("Error al eliminar usuario: " + error.message);
  }
}
