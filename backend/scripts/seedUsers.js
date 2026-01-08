const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.usuario.upsert({
      where: { email: 'sebastian.quishpe@jerseyclub.ec' },
      update: {},
      create: {
        nombre: 'Sebastian Quishpe',
        email: 'sebastian.quishpe@jerseyclub.ec',
        password: adminPassword,
        role: 'admin'
      }
    });
    console.log('✅ Usuario admin creado:', admin.email);

    // Crear usuario cliente
    const clientPassword = await bcrypt.hash('Cliente123!', 10);
    const client = await prisma.usuario.upsert({
      where: { email: 'melany.freire@jerseyclub.ec' },
      update: {},
      create: {
        nombre: 'Melany Freire',
        email: 'melany.freire@jerseyclub.ec',
        password: clientPassword,
        role: 'cliente'
      }
    });
    console.log('✅ Usuario cliente creado:', client.email);

    console.log('\n🎉 Usuarios creados exitosamente!');
    console.log('\nCredenciales:');
    console.log('Admin: sebastian.quishpe@jerseyclub.ec / Admin123!');
    console.log('Cliente: melany.freire@jerseyclub.ec / Cliente123!');

  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
