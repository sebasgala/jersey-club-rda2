import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  console.log('📡 [TEST] Intentando consultar productos...');
  try {
    const query = {
      where: {},
      include: { categoria: true }
    };
    const products = await prisma.producto.findMany(query);
    console.log(`✅ [TEST] ÉXITO: Se encontraron ${products.length} productos sin errores.`);
    if (products.length > 0) {
      console.log('Ejemplo del primer producto:', JSON.stringify(products[0], null, 2));
    }
  } catch (error) {
    console.error('❌ [TEST] ERROR DETECTADO:');
    console.error(error);
    if (error.meta) {
      console.log('Metadatos del error:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

check();
