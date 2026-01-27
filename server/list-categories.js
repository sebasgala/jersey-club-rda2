import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listCategories() {
    try {
        const categories = await prisma.categoria.findMany();
        console.log('Categorías encontradas:', categories.length);
        categories.forEach(c => {
            console.log(`ID: "${c.id_categoria}" | Nombre: ${c.cat_nombre}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listCategories();
