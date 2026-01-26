import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_UbIy2sDOoeW4@ep-quiet-snow-ah06yky8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
        },
    },
});

async function main() {
    console.log('🧪 Verifying "FUT1" Category Query...');
    try {
        const products = await prisma.producto.findMany({
            where: {
                id_categoria: {
                    contains: 'FUT1'
                }
            },
            include: {
                categoria: true
            }
        });
        console.log(`✅ Success! Found ${products.length} products.`);
        if (products.length === 0) {
            console.log('⚠️ No products. Attempting manual insert to see error...');
            try {
                await prisma.producto.create({
                    data: {
                        id_producto: 'P99999',
                        prd_nombre: 'Test Product',
                        prd_precio: 10.00,
                        prd_stock: 10,
                        id_categoria: 'FUT1  ', // Ensure padding matches what we think
                        prd_imagen: 'test.jpg'
                    }
                });
                console.log('✅ Manual insert MATCHED!');
            } catch (insertError) {
                console.error('❌ Manual Insert Failed:', insertError.message);
                if (insertError.meta) console.error('Meta:', insertError.meta);
            }
        }
    } catch (e) {
        console.error('❌ Failed:', e);
        process.exit(1);
    }
}

main().finally(() => prisma.$disconnect());
