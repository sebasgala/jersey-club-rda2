import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
    console.log('🛠️ Intentando corregir la base de datos...');
    try {
        // Intentar agregar la columna prd_imagen
        await prisma.$executeRawUnsafe(`ALTER TABLE producto ADD COLUMN IF NOT EXISTS prd_imagen VARCHAR(500)`);
        console.log('✅ Columna prd_imagen asegurada.');

        // Verificar si funciona la consulta ahora
        const products = await prisma.producto.findMany({ take: 1 });
        console.log(`✅ Prueba de consulta exitosa. Encontrados ${products.length} productos.`);
        console.log('🚀 El error "existe" debería haber desaparecido.');
    } catch (error) {
        console.error('❌ Error al aplicar corrección:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
