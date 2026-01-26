import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_0UosHDl6VfnC@ep-hidden-salad-aheffw2j.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        },
    },
    // Enable logging to see the exact SQL and error
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('🧪 Checking Schema Existence...');
    try {
        const schemas = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata`;
        console.log('📂 Schemas in DB:', schemas);

        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('📊 Tables in public Schema:', tables);

        const validTables = ['producto', 'categoria'];
        for (const t of validTables) {
            const count = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "${t}"`);
            console.log(`📦 ${t} count:`, count);
        }
    } catch (e) {
        console.error('❌ Schema Check Failed:', e.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
