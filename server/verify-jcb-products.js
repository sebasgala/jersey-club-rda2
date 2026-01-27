import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const prisma = new PrismaClient();

async function verify() {
    console.log('📦 Verificando productos de Jersey Club Brand en Neon...\n');

    try {
        const products = await prisma.producto.findMany({
            where: { id_categoria: 'JCB1  ' },
            orderBy: { prd_nombre: 'asc' }
        });

        console.log(`Total productos: ${products.length}\n`);
        console.log('Lista de productos:');
        console.log('==================');

        products.forEach((p, i) => {
            console.log(`${i + 1}. ${p.prd_nombre}`);
            console.log(`   Precio: $${p.prd_precio} | Stock: ${p.prd_stock}`);
            console.log(`   Imagen: ${p.prd_imagen ? '✅' : '❌'}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
