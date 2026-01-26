import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
async function test() {
    try {
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ DATABASE CONNECTED:', result);
        const count = await prisma.producto.count();
        console.log('📦 PRODUCT COUNT:', count);
        const firstProd = await prisma.producto.findFirst({ include: { categoria: true } });
        console.log('🏷️ FIRST PRODUCT CAT:', firstProd?.categoria?.cat_nombre, 'ID_CAT:', firstProd?.id_categoria);
    } catch (e) {
        console.error('❌ CONNECTION FAILED:');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
