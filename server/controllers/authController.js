/**
 * =====================================================
 * CONTROLLER: Auth
 * =====================================================
 * Controlador HTTP para autenticación
 */

import jwt from 'jsonwebtoken';

// JWT configuration - will be loaded from .env by dotenv in server.js
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Almacenamiento en memoria para usuarios
const users = [
  {
    id: 1,
    email: 'sebastian.quishpe@jerseyclub.ec',
    password: 'Admin123!',
    name: 'Sebastian Quishpe',
    rol: 'admin'
  },
  {
    id: 2,
    email: 'melany.freire@jerseyclub.ec',
    password: 'Cliente123!',
    name: 'Melany Freire',
    rol: 'cliente'
  }
];

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
  const { email, password, name, rol = 'cliente' } = req.body;

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
    id: users.length + 1, // Generar un ID único
    email,
    password, // Nota: No es seguro almacenar contraseñas en texto plano
    name,
    rol,
  };

  users.push(newUser); // Guardar el usuario en memoria

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
    name: user.name,
    rol: user.rol
  }));

  res.json(safeUsers);
};

export default {
  register,
  login,
  getProfile,
  getUsers
};
