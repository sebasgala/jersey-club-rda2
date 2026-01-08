/**
 * =====================================================
 * PRISMA CLIENT SINGLETON
 * =====================================================
 * Conexión única a la base de datos PostgreSQL
 */

import { PrismaClient } from '@prisma/client';

// Crear una instancia única de PrismaClient
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['info', 'warn', 'error'] 
    : ['error'],
});

export default prisma;
