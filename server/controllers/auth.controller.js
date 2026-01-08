import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jersey-club-secret-key-2024';

export async function register(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!email || !password) {
      const err = new Error('Email y password son requeridos');
      err.status = 400;
      return next(err);
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { usu_email: email }
    });
    
    if (existingUser) {
      const err = new Error('Usuario duplicado');
      err.status = 409;
      return next(err);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRol = rol === 'admin' || rol === 'user' ? rol : 'user';

    // Generar ID único
    const count = await prisma.usuario.count();
    const newId = `U${String(count + 1).padStart(5, '0')}`;

    const newUser = await prisma.usuario.create({
      data: {
        id_usuario: newId,
        usu_email: email,
        usu_passwordhash: passwordHash,
        usu_role: userRol
      }
    });

    res.status(201).json({
      status: 'created',
      data: {
        id: newUser.id_usuario,
        email: newUser.usu_email,
        rol: newUser.usu_role,
      },
    });
  } catch (err) {
    console.error('Error en register:', err);
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      const err = new Error('Email y password son requeridos');
      err.status = 400;
      return next(err);
    }

    // Buscar usuario en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { usu_email: email },
      include: {
        cliente: true,
        empleado: true
      }
    });

    if (!user) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      return next(err);
    }

    // Verificar contraseña
    let isPasswordValid = false;
    if (user.usu_passwordhash) {
      if (user.usu_passwordhash.startsWith('$2')) {
        isPasswordValid = await bcrypt.compare(password, user.usu_passwordhash);
      } else {
        isPasswordValid = password === user.usu_passwordhash;
      }
    }

    if (!isPasswordValid) {
      const err = new Error('Credenciales inválidas');
      err.status = 401;
      return next(err);
    }

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.usu_role, email: user.usu_email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id_usuario,
          email: user.usu_email,
          rol: user.usu_role,
          cliente: user.cliente,
          empleado: user.empleado
        },
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    next(err);
  }
}