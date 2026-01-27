/**
 * Script para insertar productos de Jersey Club Brand en la base de datos Neon
 * Ejecutar con: node server/seed-jersey-club-products.js
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno desde server/.env
dotenv.config({ path: 'server/.env' });

// Verificar que DATABASE_URL esté configurada
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está definida en server/.env');
    process.exit(1);
}

console.log('✅ DATABASE_URL encontrada');

const prisma = new PrismaClient();

// Productos de Jersey Club Brand a insertar
const jerseyClubProducts = [
    {
        id_producto: 'JCB001',
        prd_nombre: 'Buzo Compresión Hombre Jersey Club',
        prd_descripcion: 'Buzo de compresión para entrenamiento de alta intensidad. Material transpirable y secado rápido.',
        prd_precio: 35.00,
        prd_stock: 50,
        prd_stockminimo: 10,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/buzo-compresion-hombre-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB002',
        prd_nombre: 'Camiseta Deportiva Hombre Jersey Club',
        prd_descripcion: 'Camiseta deportiva ligera y cómoda para entrenamientos. Tejido anti-humedad.',
        prd_precio: 28.00,
        prd_stock: 75,
        prd_stockminimo: 15,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/camiseta-deportiva-hombre-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB003',
        prd_nombre: 'Camiseta Deportiva Mujer Jersey Club',
        prd_descripcion: 'Camiseta deportiva femenina con corte moderno. Ideal para yoga, running y gym.',
        prd_precio: 28.00,
        prd_stock: 60,
        prd_stockminimo: 12,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/camiseta-deportiva-mujer-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB004',
        prd_nombre: 'Gorra Running Jersey Club',
        prd_descripcion: 'Gorra deportiva ligera con protección UV. Perfecta para correr bajo el sol.',
        prd_precio: 18.00,
        prd_stock: 100,
        prd_stockminimo: 20,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/gorra-running-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB005',
        prd_nombre: 'Medias Running Jersey Club',
        prd_descripcion: 'Medias deportivas con soporte de arco y amortiguación. Antideslizantes.',
        prd_precio: 12.00,
        prd_stock: 150,
        prd_stockminimo: 30,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/medias-running-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB006',
        prd_nombre: 'Pantaloneta Deportiva Hombre Jersey Club',
        prd_descripcion: 'Pantaloneta deportiva con bolsillos laterales. Tela liviana y transpirable.',
        prd_precio: 22.00,
        prd_stock: 80,
        prd_stockminimo: 15,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/pantaloneta-deportiva-hombre-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB007',
        prd_nombre: 'Pantaloneta Running Hombre Jersey Club',
        prd_descripcion: 'Pantaloneta ultraliviana para running. Con bolsillo interno para llaves.',
        prd_precio: 25.00,
        prd_stock: 70,
        prd_stockminimo: 14,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/pantaloneta-running-hombre-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB008',
        prd_nombre: 'Buzo Compresión Mujer Jersey Club',
        prd_descripcion: 'Buzo de compresión femenino para entrenamientos de alta intensidad. Diseño anatómico.',
        prd_precio: 32.00,
        prd_stock: 45,
        prd_stockminimo: 10,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/buzo-compresion-mujer-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB009',
        prd_nombre: 'Camiseta Running Deportiva Mujer Jersey Club',
        prd_descripcion: 'Camiseta de running femenina con tecnología de secado rápido. Corte ajustado.',
        prd_precio: 30.00,
        prd_stock: 55,
        prd_stockminimo: 11,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/camiseta-running-deportiva-mujer-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    },
    {
        id_producto: 'JCB010',
        prd_nombre: 'Pantaloneta Deportiva Running Mujer Jersey Club',
        prd_descripcion: 'Pantaloneta deportiva femenina para running y gym. Con shorts internos incorporados.',
        prd_precio: 24.00,
        prd_stock: 65,
        prd_stockminimo: 13,
        prd_descuento: 0,
        prd_imagen: 'https://storage.googleapis.com/imagenesjerseyclub/pantaloneta-deportiva-running-mujer-jersey-club.webp',
        id_categoria: 'JCB1  ',
        prd_activo: true
    }
];

async function seedJerseyClubProducts() {
    console.log('🚀 Iniciando inserción de productos Jersey Club Brand...\n');

    // Primero verificar que existe la categoría JCB1
    const categoryExists = await prisma.categoria.findUnique({
        where: { id_categoria: 'JCB1  ' }
    });

    if (!categoryExists) {
        console.log('📁 Creando categoría Jersey Club Brand...');
        await prisma.categoria.create({
            data: {
                id_categoria: 'JCB1  ',
                cat_nombre: 'Jersey Club Brand',
                cat_descripcion: 'Ropa deportiva de marca propia Jersey Club EC'
            }
        });
        console.log('✅ Categoría creada exitosamente\n');
    } else {
        console.log('✅ Categoría Jersey Club Brand ya existe\n');
    }

    // Insertar productos
    let insertados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const producto of jerseyClubProducts) {
        try {
            // Verificar si el producto ya existe
            const existingProduct = await prisma.producto.findUnique({
                where: { id_producto: producto.id_producto }
            });

            if (existingProduct) {
                // Actualizar producto existente
                await prisma.producto.update({
                    where: { id_producto: producto.id_producto },
                    data: producto
                });
                console.log(`🔄 Actualizado: ${producto.prd_nombre}`);
                actualizados++;
            } else {
                // Insertar nuevo producto
                await prisma.producto.create({
                    data: producto
                });
                console.log(`✅ Insertado: ${producto.prd_nombre}`);
                insertados++;
            }
        } catch (error) {
            console.error(`❌ Error con ${producto.prd_nombre}:`, error.message);
            errores++;
        }
    }

    console.log('\n========================================');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('========================================');
    console.log(`✅ Productos insertados: ${insertados}`);
    console.log(`🔄 Productos actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📦 Total procesados: ${jerseyClubProducts.length}`);
    console.log('========================================\n');

    // Verificar productos insertados
    const count = await prisma.producto.count({
        where: { id_categoria: 'JCB1  ' }
    });
    console.log(`📦 Total productos en categoría Jersey Club Brand: ${count}`);
}

// Ejecutar
seedJerseyClubProducts()
    .then(() => {
        console.log('\n🎉 Migración completada exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
