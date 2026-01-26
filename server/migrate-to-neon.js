import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando migración de datos a Neon...');

    // 1. Cargar Categorías
    const productosData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/productos.json'), 'utf8'));

    const categoriasUnicas = [...new Set(productosData.map(p => p.categoria))];
    const categoriasMap = {
        'Fútbol': 'FUT1  ',
        'Fórmula 1': 'F1-1  ',
        'Jersey Club Brand': 'JCB1  ',
        'Ofertas': 'OFF1  '
    };

    console.log('📦 Migrando categorías...');
    for (const catName of categoriasUnicas) {
        const id = categoriasMap[catName] || `C${Math.floor(Math.random() * 90000) + 10000}`;
        await prisma.categoria.upsert({
            where: { cat_nombre: catName },
            update: {},
            create: {
                id_categoria: id.substring(0, 6),
                cat_nombre: catName,
                cat_descripcion: `Categoría de ${catName}`
            }
        });
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
                    prd_precio: p.precio,
                    prd_stock: p.stock,
                    id_categoria: (p.categoryId || categoriasMap[p.categoria] || 'C00004').substring(0, 6),
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
    await prisma.usuario.upsert({
        where: { usu_email: 'admin@jerseyclub.com' },
        update: {},
        create: {
            id_usuario: 'ADM001',
            usu_email: 'admin@jerseyclub.com',
            usu_passwordhash: '$2a$10$r9m0Gz9E9z9z9z9z9z9z9ueY9m0Gz9E9z9z9z9z9z9z9z9z9z9z9z', // password: admin
            usu_role: 'admin'
        }
    });

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
