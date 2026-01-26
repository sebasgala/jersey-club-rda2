import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        // Intentar cambiar el idioma de los mensajes a inglés para que Prisma entienda el error
        await prisma.$executeRawUnsafe("SET lc_messages TO 'en_US.UTF-8'");
        console.log('✅ Idioma de mensajes cambiado a Inglés (en_US)');

        const products = await prisma.producto.findMany({
            include: { categoria: true }
        });
        console.log('Productos encontrados:', products.length);
    } catch (e) {
        console.error('❌ ERROR (en inglés):');
        console.error(e.message);
        if (e.meta) console.log('META:', JSON.stringify(e.meta, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
