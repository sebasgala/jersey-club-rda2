import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'producto'
      ORDER BY column_name;
    `;
        console.log('--- COLUMNS IN "producto" TABLE ---');
        columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

        const tableInfo = await prisma.$queryRaw`
      SELECT * FROM pg_catalog.pg_tables WHERE tablename = 'producto';
    `;
        console.log('--- TABLE INFO ---');
        console.log(JSON.stringify(tableInfo, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
