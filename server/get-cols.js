import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    try {
        const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'producto'
    `;
        const names = columns.map(c => c.column_name);
        fs.writeFileSync('db_cols.json', JSON.stringify(names, null, 2));
        console.log('✅ Columnas guardadas en db_cols.json');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
