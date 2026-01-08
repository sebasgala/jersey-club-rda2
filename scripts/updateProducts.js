import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProducts() {
  try {
    console.log('Actualizando productos desde la base de datos...');

    // Obtener todos los productos de la base de datos
    const productos = await prisma.producto.findMany();

    // Mostrar los productos en la consola
    console.log('Productos encontrados:', productos);

    console.log('Actualización completada.');
    process.exit(0); // Salir del script
  } catch (error) {
    console.error('Error al actualizar productos:', error);
    process.exit(1); // Salir con error
  } finally {
    await prisma.$disconnect(); // Desconectar Prisma
  }
}

updateProducts();
