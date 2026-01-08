/**
 * =====================================================
 * PRISMA SEED - Datos iniciales
 * =====================================================
 * Ejecutar: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // ==================== USUARIOS ====================
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Detectar valores permitidos por la restricción CHECK en la tabla `usuario`
  let allowedRoles = [];
  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT c.conname, pg_get_constraintdef(c.oid) as def FROM pg_constraint c JOIN pg_class cl ON c.conrelid = cl.oid WHERE cl.relname = 'usuario' AND c.contype = 'c'"
    );
    console.log('CHECK constraints on usuario:', rows);
    for (const r of rows) {
      const def = r.def || '';
      const m = def.match(/IN \(([^)]+)\)/i);
      if (m && m[1]) {
        const vals = m[1].split(',').map(s => s.replace(/['\s]/g, '').trim()).filter(Boolean);
        allowedRoles = allowedRoles.concat(vals);
      }
    }
    console.log('Detected allowedRoles:', allowedRoles);
  } catch (e) {
    // Si falla la detección, dejamos allowedRoles vacío y usaremos valores por defecto
    console.warn('No se pudieron detectar roles permitidos desde la DB, usando valores por defecto', e.message);
  }

  // Debug: imprimir tipos/longitudes de columnas de la tabla usuario
  try {
    const cols = await prisma.$queryRawUnsafe(
      "SELECT column_name, character_maximum_length FROM information_schema.columns WHERE table_name='usuario'"
    );
    console.log('usuario columns info:', cols);
  } catch (e) {
    console.warn('No se pudo obtener info de columnas de usuario:', e.message);
  }

  // Escoger roles válidos según lo detectado
  const pick = (candidates, fallback) => {
    for (const c of candidates) if (allowedRoles.includes(c)) return c;
    return allowedRoles[0] || fallback;
  };

  const adminRole = pick(['admin', 'administrador', 'ADMIN', 'Administradores'], 'admin');
  const customerRole = pick(['user', 'cliente', 'customer', 'CLIENTE'], 'user');

  // Crear cliente y empleado necesarios para respetar la restricción CHECK
  const cliente = await prisma.cliente.upsert({
    where: { id_cliente: 'C00001' },
    update: {},
    create: {
      id_cliente: 'C00001',
      cli_nombre: 'Cliente',
      cli_apellido: 'Test',
      cli_email: 'cliente@test.com'
    }
  });

  const empleado = await prisma.empleado.upsert({
    where: { id_empleado: 'E00001' },
    update: {},
    create: {
      id_empleado: 'E00001',
      emp_nombre: 'Admin',
      emp_apellido: 'User'
    }
  });

  const admin = await prisma.usuario.upsert({
    where: { usu_email: 'admin@jerseyclub.ec' },
    update: {},
    create: {
      id_usuario: 'U00001',
      usu_email: 'admin@jerseyclub.ec',
      usu_passwordhash: hashedPassword,
      usu_role: adminRole,
      id_empleado: empleado.id_empleado
    }
  });

  const customer = await prisma.usuario.upsert({
    where: { usu_email: 'cliente@test.com' },
    update: {},
    create: {
      id_usuario: 'U00002',
      usu_email: 'cliente@test.com',
      usu_passwordhash: await bcrypt.hash('Cliente123!', 10),
      usu_role: customerRole,
      id_cliente: cliente.id_cliente
    }
  });

  console.log('✅ Usuarios creados:', { admin: admin.usu_email, customer: customer.usu_email });

  // ==================== PRODUCTOS ====================
  const products = [
    {
      name: 'Camiseta Ecuador Local 2024',
      slug: 'camiseta-ecuador-local-2024',
      description: 'Camiseta oficial de la selección ecuatoriana',
      price: 89.99,
      originalPrice: 99.99,
      category: 'futbol',
      subcategory: 'selecciones',
      team: 'Ecuador',
      league: 'CONMEBOL',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['amarillo']),
      images: JSON.stringify(['/assets/images/ecuador-home.jpg']),
      stock: 50,
      isNew: true,
      isFeatured: true,
      isOnSale: true,
      discount: 10
    },
    {
      name: 'Camiseta Barcelona SC 2024',
      slug: 'camiseta-barcelona-sc-2024',
      description: 'Camiseta oficial del Barcelona Sporting Club',
      price: 79.99,
      category: 'futbol',
      subcategory: 'clubes',
      team: 'Barcelona SC',
      league: 'Liga Pro Ecuador',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['amarillo', 'negro']),
      images: JSON.stringify(['/assets/images/barcelona-sc.jpg']),
      stock: 100,
      isNew: true,
      isFeatured: true
    },
    {
      name: 'Camiseta Red Bull Racing F1 2024',
      slug: 'camiseta-red-bull-racing-f1-2024',
      description: 'Camiseta oficial del equipo Red Bull Racing',
      price: 129.99,
      originalPrice: 149.99,
      category: 'formula1',
      subcategory: 'equipos',
      team: 'Red Bull Racing',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['azul']),
      images: JSON.stringify(['/assets/images/redbull-f1.jpg']),
      stock: 30,
      isNew: true,
      isFeatured: true,
      isOnSale: true,
      discount: 15
    },
    {
      name: 'Camiseta Ferrari F1 2024',
      slug: 'camiseta-ferrari-f1-2024',
      description: 'Camiseta oficial del equipo Scuderia Ferrari',
      price: 119.99,
      category: 'formula1',
      subcategory: 'equipos',
      team: 'Ferrari',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['rojo']),
      images: JSON.stringify(['/assets/images/ferrari-f1.jpg']),
      stock: 25,
      isFeatured: true
    },
    {
      name: 'Camiseta Jersey Club Exclusive',
      slug: 'camiseta-jersey-club-exclusive',
      description: 'Diseño exclusivo de Jersey Club EC',
      price: 59.99,
      category: 'jersey-club',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['negro', 'blanco']),
      images: JSON.stringify(['/assets/images/jersey-club-exclusive.jpg']),
      stock: 200,
      isNew: true,
      isFeatured: true
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  console.log('✅ Productos creados:', products.length);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
