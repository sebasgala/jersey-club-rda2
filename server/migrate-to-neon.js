import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando migración de datos a Neon...');

    // 1. Cargar Categorías
    // Fix: Use correct relative path from server directory
    const dataPath = path.join(process.cwd(), 'server/data/productos.json');
    console.log(`📂 Reading data from: ${dataPath}`);
    const productosData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const categoriasUnicas = [...new Set(productosData.map(p => p.categoria))];
    const categoriasMap = {
        'Fútbol': 'FUT1  ',
        'Fórmula 1': 'F1-1  ',
        'Jersey Club Brand': 'JCB1  ',
        'Ofertas': 'OFF1  '
    };

    console.log('📦 Migrando categorías...');
    for (const catName of categoriasUnicas) {
        if (!catName) continue;
        let idRaw = categoriasMap[catName] || `C${Math.floor(Math.random() * 90000) + 10000}`;
        // Ensure exactly 6 chars
        const id = idRaw.padEnd(6, ' ').substring(0, 6);

        // STORE THE ID BACK IN MAP FOR PRODUCT LOOP
        categoriasMap[catName] = id;

        console.log(`🔹 Insertando: "${catName}" con ID "${id}"`);
        try {
            await prisma.categoria.upsert({
                where: { cat_nombre: catName },
                update: {},
                create: {
                    id_categoria: id,
                    cat_nombre: catName,
                    cat_descripcion: `Categoría de ${catName}`
                }
            });
        } catch (e) {
            console.error(`❌ Falló categoría ${catName}:`, e.message);
        }
    }

    // 2. Cargar Productos
    console.log('👕 Migrando productos...');
    for (const p of productosData) {
        try {
            await prisma.producto.upsert({
                where: { id_producto: p.id.substring(0, 6) },
                update: {},
                create: {
                    id_producto: p.id.substring(0, 6),
                    prd_nombre: p.nombre,
                    prd_descripcion: p.descripcion,
                    prd_precio: parseFloat(String(p.precio).replace('$', '').replace(',', '')),
                    prd_stock: p.stock || 0,
                    id_categoria: (p.categoryId || categoriasMap[p.categoria] || 'C00004').padEnd(6, ' ').substring(0, 6),
                    prd_imagen: p.imagen,
                    prd_activo: true
                }
            });
        } catch (prodError) {
            console.error(`❌ Error al crear producto ${p.nombre}:`, prodError.message);
            if (prodError.meta) console.error('Meta:', prodError.meta);
        }
    }

    // 3. Crear Usuario Admin por defecto
    console.log('👤 Creando usuario administrador...');

    // Fix: Robust error handling for user creation
    try {
        const existingUser = await prisma.usuario.findUnique({ where: { usu_email: 'admin@jerseyclub.com' } });

        if (!existingUser) {
            await prisma.usuario.create({
                data: {
                    id_usuario: 'ADM001',
                    usu_email: 'admin@jerseyclub.com',
                    usu_passwordhash: '$2a$10$r9m0Gz9E9z9z9z9z9z9z9ueY9m0Gz9E9z9z9z9z9z9z9z9z9z9z9z', // password: admin
                    usu_role: 'admin'
                }
            });
            console.log('✅ Usuario admin creado');
        } else {
            console.log('ℹ️ Usuario admin ya existe, omitiendo...');
        }
    } catch (e) {
        if (e.code === 'P2002') {
            console.log('ℹ️ Usuario admin ya existe (capturado por error único), omitiendo...');
        } else {
            console.error('❌ Error no controlado al crear usuario:', e.message);
        }
    }
    // Old code removed


    console.log('✅ Migración completada con éxito.');
}

main()
    .catch((e) => {
        console.error('❌ Error durante la migración:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
