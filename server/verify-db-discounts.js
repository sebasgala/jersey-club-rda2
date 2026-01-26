
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 verificando valores de descuento en la base de datos...');

    const productos = await prisma.producto.findMany({
        select: {
            id_producto: true,
            prd_nombre: true,
            prd_descuento: true,
            prd_precio: true
        }
    });

    console.log(`Found ${productos.length} products.`);

    const conDescuento = productos.filter(p => p.prd_descuento && Number(p.prd_descuento) > 0);

    console.log(`\nProductos con descuento (> 0): ${conDescuento.length}`);
    conDescuento.forEach(p => {
        console.log(`- [${p.id_producto}] ${p.prd_nombre}: ${p.prd_descuento} (Type: ${typeof p.prd_descuento})`);
    });

    if (conDescuento.length === 0) {
        console.log('\n⚠️ NO se encontraron productos con descuento en la BD.');
        console.log('Esto indica que el problema es de GUARDADO (Persistencia), no de visualización.');
    } else {
        console.log('\n✅ SI hay descuentos en la BD. El problema es de VISUALIZACIÓN.');
    }

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
