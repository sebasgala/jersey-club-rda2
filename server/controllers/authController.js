/**
 * =====================================================
 * CONTROLLER: Auth
 * =====================================================
 * Controlador HTTP para autenticación
 */

import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// JWT configuration - will be loaded from .env by dotenv in server.js
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Path for persistence (JSON file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USUARIOS_FILE = path.join(__dirname, '..', 'data', 'usuarios.json');

// Helper to load users
const loadUsers = () => {
  try {
    if (fs.existsSync(USUARIOS_FILE)) {
      const data = fs.readFileSync(USUARIOS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [
    {
      id: 1,
      email: 'sebastian.quishpe@jerseyclub.ec',
      password: 'Admin123!',
      name: 'Sebastian Quishpe',
      rol: 'admin',
      telefono: '0999999999',
      direccion: 'Quito, Ecuador'
    },
    {
      id: 2,
      email: 'melany.freire@jerseyclub.ec',
      password: 'Cliente123!',
      name: 'Melany Freire',
      rol: 'cliente',
      telefono: '0888888888',
      direccion: 'Guayaquil, Ecuador'
    }
  ];
};

// Helper to save users
const saveUsers = (usersList) => {
  try {
    const dir = path.dirname(USUARIOS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usersList, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Almacenamiento para usuarios
let users = loadUsers();

/**
 * Generar token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 */
const register = (req, res) => {
  const { email, password, name, nombre, rol = 'cliente', telefono, direccion } = req.body;

  // Usar nombre si name no está presente (compatibilidad frontend)
  const finalName = name || nombre;

  // Verificar si el email ya existe
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'El email ya está registrado',
    });
  }

  // Crear nuevo usuario
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    email,
    password, // Nota: No es seguro almacenar contraseñas en texto plano
    name: finalName,
    nombre: finalName, // Guardar ambos por compatibilidad
    rol,
    telefono: telefono || '',
    direccion: direccion || '',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users); // Persistir cambios

  // Generar token
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: { id: newUser.id, email: newUser.email, name: newUser.name, rol: newUser.rol },
      token,
    },
  });
};

/**
 * POST /api/auth/login
 * Inicio de sesión
 */
const login = (req, res) => {
  const { email, password } = req.body;

  // Buscar usuario por email
  const user = users.find((user) => user.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas',
    });
  }

  // Generar token
  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: {
      user: { id: user.id, email: user.email, name: user.name, rol: user.rol },
      token,
    },
  });
};

/**
 * GET /api/auth/me
 * Obtener perfil del usuario autenticado
 */
const getProfile = (req, res) => {
  const user = users.find((user) => user.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
    });
  }

  res.json({
    success: true,
    data: { user: { id: user.id, email: user.email, name: user.name, rol: user.rol } },
  });
};

/**
 * Obtener todos los usuarios
 * GET /api/usuarios
 */
const getUsers = (req, res) => {
  const safeUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name || user.nombre,
    nombre: user.nombre || user.name,
    rol: user.rol,
    telefono: user.telefono,
    direccion: user.direccion
  }));

  res.json(safeUsers);
};

/**
 * PUT /api/usuarios/:id
 * Actualizar usuario existente
 */
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { email, password, name, nombre, rol, telefono, direccion } = req.body;

  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }

  const updatedUser = {
    ...users[userIndex],
    email: email || users[userIndex].email,
    name: name || nombre || users[userIndex].name,
    nombre: nombre || name || users[userIndex].nombre,
    rol: rol || users[userIndex].rol,
    telefono: telefono !== undefined ? telefono : users[userIndex].telefono,
    direccion: direccion !== undefined ? direccion : users[userIndex].direccion,
  };

  if (password) {
    updatedUser.password = password;
  }

  users[userIndex] = updatedUser;
  saveUsers(users);

  res.json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: { user: updatedUser }
  });
};

/**
 * DELETE /api/usuarios/:id
 * Eliminar usuario
 */
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  const initialCount = users.length;
  users = users.filter(u => u.id !== id);

  if (users.length === initialCount) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }

  saveUsers(users);
  res.json({ success: true, message: 'Usuario eliminado exitosamente' });
};

export default {
  register,
  login,
  getProfile,
  getUsers,
  updateUser,
  deleteUser
};
