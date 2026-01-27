import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const prisma = new PrismaClient();

async function test() {
    console.log('🔍 Verificando conexión a Neon...');
    console.log('DATABASE_URL está configurada:', !!process.env.DATABASE_URL);

    try {
        // 1. Verificar categorías existentes
        const categories = await prisma.categoria.findMany();
        console.log('\n📁 Categorías existentes:');
        categories.forEach(c => {
            console.log(`   - ID: "${c.id_categoria}" | Nombre: "${c.cat_nombre}"`);
        });

        // 2. Verificar productos de Jersey Club Brand
        const jcbProducts = await prisma.producto.findMany({
            where: { id_categoria: 'JCB1  ' }
        });
        console.log(`\n📦 Productos en Jersey Club Brand: ${jcbProducts.length}`);
        jcbProducts.forEach(p => {
            console.log(`   - ${p.prd_nombre}`);
        });

        // 3. Contar todos los productos
        const totalProducts = await prisma.producto.count();
        console.log(`\n📊 Total productos en BD: ${totalProducts}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Código:', error.code);
        if (error.meta) {
            console.error('Meta:', JSON.stringify(error.meta, null, 2));
        }
    } finally {
        await prisma.$disconnect();
    }
}

test();
