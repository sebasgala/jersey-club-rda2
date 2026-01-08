const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Clave secreta para JWT (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'jersey-club-secret-key-2024';

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se envíen email y password
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const user = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Si no existe el usuario
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Responder con usuario y token (sin incluir la contraseña)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, role = 'cliente' } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role // 'admin' o 'cliente'
      }
    });

    // Generar token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Responder sin la contraseña
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en /me:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
});

module.exports = router;
