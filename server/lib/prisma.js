/**
 * =====================================================
 * PRISMA CLIENT SINGLETON
 * =====================================================
 * Conexión única a la base de datos PostgreSQL
 */

import { PrismaClient } from '@prisma/client';

// Crear una instancia única de PrismaClient
// En Vercel, a veces Prisma tiene problemas leyendo la env var directamente
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development'
    ? ['info', 'warn', 'error']
    : ['error'],
});

export default prisma;
