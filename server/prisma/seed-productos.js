/**
 * =====================================================
 * SEED DE PRODUCTOS - Jersey Club EC
 * =====================================================
 * Inserta todos los productos de los archivos estáticos
 * (footballProducts, formula1Products, jerseyClubProducts)
 * en la base de datos PostgreSQL
 * 
 * Ejecutar: node prisma/seed-productos.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== CATEGORÍAS ====================
// Mapeo de categorías para crear si no existen
const CATEGORIAS = {
  'FUT1': { id: 'FUT1', nombre: 'Fútbol' },
  'F1-1': { id: 'F1-1', nombre: 'Fórmula 1' },
  'JCB1': { id: 'JCB1', nombre: 'Jersey Club Brand' },
  'ACC1': { id: 'ACC1', nombre: 'Accesorios' }
};

// Unidad de medida por defecto
const UNIDAD_MEDIDA_DEFAULT = 'UN1';

// ==================== PRODUCTOS DE FÚTBOL ====================
const footballProducts = [
  { title: "Ac Milan 2006 Local Retro", price: 45.00, isOnSale: true },
  { title: "Ac Milan 2006 Visitante Retro", price: 45.00, isOnSale: true },
  { title: "Ac Milan 2025 Away", price: 60.00, isOnSale: false },
  { title: "Ac Milan 2025 Local", price: 60.00, isOnSale: false },
  { title: "Alemania 2024 Home", price: 45.00, isOnSale: true },
  { title: "Argentina 1999 Visitante Retro", price: 45.00, isOnSale: true },
  { title: "Argentina 2005 Local Retro", price: 45.00, isOnSale: true },
  { title: "Argentina 2026 Local", price: 60.00, isOnSale: false },
  { title: "Arsenal 2025 Away", price: 60.00, isOnSale: false },
  { title: "Barcelona 1987 Local Retro", price: 45.00, isOnSale: true },
  { title: "Barcelona 2026 Local", price: 60.00, isOnSale: false },
  { title: "Bayern Munich 2026 Away", price: 60.00, isOnSale: false },
  { title: "Bayern Munich 2026 Local", price: 60.00, isOnSale: false },
  { title: "Boca Jr 1995 Local Retro", price: 45.00, isOnSale: true },
  { title: "Borussia 2025 Home", price: 60.00, isOnSale: false },
  { title: "Brasil 2008 Local Retro", price: 45.00, isOnSale: true },
  { title: "Brasil 2009 Total 90 Retro", price: 45.00, isOnSale: true },
  { title: "Brasil 2024 Local", price: 45.00, isOnSale: true },
  { title: "Burissia 2026 Local", price: 60.00, isOnSale: false },
  { title: "Chelsea 2026 Local", price: 60.00, isOnSale: false },
  { title: "Chelseea 2025 Away", price: 60.00, isOnSale: false },
  { title: "Club Brujas 2025 Home", price: 60.00, isOnSale: false },
  { title: "Deportivo Quiro 2025 Home Ecuador", price: 60.00, isOnSale: false },
  { title: "Emelec 2025 Home Ecuador", price: 60.00, isOnSale: false },
  { title: "España Home 2025", price: 60.00, isOnSale: false },
  { title: "Fc Barcelona 1999 Local Retro", price: 45.00, isOnSale: true },
  { title: "Fc Barcelona 2015 Local Retro", price: 45.00, isOnSale: true },
  { title: "Francia 2025 Away", price: 60.00, isOnSale: false },
  { title: "Idv 2025 Home", price: 60.00, isOnSale: false },
  { title: "Inglaterra 2025 Home", price: 60.00, isOnSale: false },
  { title: "Inter Miami 2025 Local", price: 60.00, isOnSale: false },
  { title: "Inter Miami Home 2025", price: 60.00, isOnSale: false },
  { title: "Inter Milan 2025 Home", price: 60.00, isOnSale: false },
  { title: "Japon 2025 Home", price: 60.00, isOnSale: false },
  { title: "Juventus 2025 Away", price: 60.00, isOnSale: false },
  { title: "Juventus 2026 Local", price: 60.00, isOnSale: false },
  { title: "Leverkusen 2026 Home", price: 60.00, isOnSale: false },
  { title: "Liverpool 2026 Local", price: 60.00, isOnSale: false },
  { title: "Liverpool Home 2025", price: 60.00, isOnSale: false },
  { title: "Liyon 2025 Home", price: 60.00, isOnSale: false },
  { title: "Manchester City 2025 Away", price: 60.00, isOnSale: false },
  { title: "Manchester City 2026 Local", price: 60.00, isOnSale: false },
  { title: "Manchester United 2007 Local Retro", price: 45.00, isOnSale: true },
  { title: "Manchester United 2011 Tercera Retro", price: 45.00, isOnSale: true },
  { title: "Manchester United 2025 Away", price: 60.00, isOnSale: false },
  { title: "Manchester United 2026 Local", price: 60.00, isOnSale: false },
  { title: "Marseille 2025 Home", price: 60.00, isOnSale: false },
  { title: "Monaco 2025 Home", price: 60.00, isOnSale: false },
  { title: "Napoli 2025 Away", price: 60.00, isOnSale: false },
  { title: "Portugal 2004 Local Retro", price: 45.00, isOnSale: true },
  { title: "Portugal 2025 Home", price: 60.00, isOnSale: false },
  { title: "Psg 2026 Local", price: 60.00, isOnSale: false },
  { title: "Real Betis 2025 Home", price: 60.00, isOnSale: false },
  { title: "Real Madrid 2015 Tercera Retro", price: 45.00, isOnSale: true },
  { title: "Real Madrid 2017 Local Retro", price: 45.00, isOnSale: true },
  { title: "Real Madrid 2025 Local", price: 60.00, isOnSale: false },
  { title: "Roma 2025 Home", price: 60.00, isOnSale: false },
  { title: "Atletico Madrid 2025", price: 60.00, isOnSale: false },
  { title: "Aucas 2025 Home Ecuador", price: 55.00, isOnSale: false },
  { title: "Barcelona Ecuador 2025 Home", price: 55.00, isOnSale: false },
  { title: "Colombia 2024 Third", price: 60.00, isOnSale: true },
  { title: "PSG 2025 Tercera", price: 60.00, isOnSale: false }
];

// ==================== PRODUCTOS DE FÓRMULA 1 ====================
const formula1Products = [
  { title: "McLaren F1 Lando Norris Campeón 2025", price: 95.00, isOnSale: false },
  { title: "McLaren F1 Racing Team 2025", price: 85.00, isOnSale: false },
  { title: "Ferrari F1 Team 2025", price: 85.00, isOnSale: false },
  { title: "Lewis Hamilton Ferrari 2025", price: 90.00, isOnSale: false },
  { title: "Charles Leclerc Monaco GP", price: 95.00, isOnSale: true },
  { title: "Red Bull Racing 2025", price: 85.00, isOnSale: false },
  { title: "Max Verstappen 2025 Special Edition", price: 90.00, isOnSale: true },
  { title: "Mercedes AMG Petronas", price: 80.00, isOnSale: false },
  { title: "Alpine F1 Team 2025", price: 75.00, isOnSale: true },
  { title: "Aston Martin F1 Team Polo 2024", price: 70.00, isOnSale: false },
  { title: "Williams Racing 2025", price: 65.00, isOnSale: false },
  { title: "Haas F1 Team 2025", price: 60.00, isOnSale: true },
  { title: "RB F1 Team 2025", price: 65.00, isOnSale: false },
  { title: "Sauber F1 Team 2025", price: 60.00, isOnSale: true }
];

// ==================== PRODUCTOS JERSEY CLUB BRAND ====================
const jerseyClubProducts = [
  { title: "Buzo Compresion Hombre Jersey Club", price: 35.00, isOnSale: false, categoria: 'JCB1' },
  { title: "Camiseta Deportiva Hombre Jersey Club", price: 28.00, isOnSale: true, categoria: 'JCB1' },
  { title: "Camiseta Deportiva Mujer Jersey Club", price: 28.00, isOnSale: true, categoria: 'JCB1' },
  { title: "Gorra Running Jersey Club", price: 18.00, isOnSale: false, categoria: 'ACC1' },
  { title: "Medias Running Jersey Club", price: 12.00, isOnSale: true, categoria: 'ACC1' },
  { title: "Pantaloneta Deportiva Hombre Jersey Club", price: 22.00, isOnSale: false, categoria: 'JCB1' },
  { title: "Pantaloneta Running Hombre Jersey Club", price: 25.00, isOnSale: true, categoria: 'JCB1' },
  { title: "Buzo Compresión Mujer Jersey Club", price: 32.00, isOnSale: false, categoria: 'JCB1' },
  { title: "Camiseta Running Deportiva Mujer Jersey Club", price: 30.00, isOnSale: false, categoria: 'JCB1' },
  { title: "Pantaloneta Deportiva Running Mujer Jersey Club", price: 24.00, isOnSale: true, categoria: 'JCB1' }
];

/**
 * Genera un ID único para producto
 */
let productCounter = 0;
const generateProductId = () => {
  productCounter++;
  return `P${String(productCounter).padStart(5, '0')}`;
};

/**
 * Genera el slug desde el título (para imagen)
 */
const toSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

async function main() {
  console.log('🌱 Iniciando seed de productos...\n');

  try {
    // 1. Verificar o crear categorías
    console.log('📁 Verificando categorías...');
    for (const [id, cat] of Object.entries(CATEGORIAS)) {
      const exists = await prisma.categoria.findUnique({ where: { id_categoria: id } });
      if (!exists) {
        await prisma.categoria.create({
          data: { id_categoria: id, cat_nombre: cat.nombre }
        });
        console.log(`   ✅ Categoría creada: ${cat.nombre}`);
      } else {
        console.log(`   ℹ️  Categoría existente: ${cat.nombre}`);
      }
    }

    // 2. Verificar unidad de medida
    console.log('\n📏 Verificando unidades de medida...');
    const unidadExists = await prisma.unidad_medida.findUnique({ where: { id_unimedida: UNIDAD_MEDIDA_DEFAULT } });
    if (!unidadExists) {
      await prisma.unidad_medida.create({
        data: { id_unimedida: UNIDAD_MEDIDA_DEFAULT, uni_nombre: 'Unidad' }
      });
      console.log('   ✅ Unidad de medida creada: Unidad');
    } else {
      console.log('   ℹ️  Unidad de medida existente');
    }

    // 3. Obtener el último ID de producto
    const lastProduct = await prisma.producto.findFirst({
      orderBy: { id_producto: 'desc' }
    });
    if (lastProduct) {
      productCounter = parseInt(lastProduct.id_producto.substring(1)) || 0;
    }
    console.log(`\n📊 Último ID de producto: P${String(productCounter).padStart(5, '0')}`);

    // 4. Insertar productos de fútbol
    console.log('\n⚽ Insertando productos de FÚTBOL...');
    let futbolCount = 0;
    for (const p of footballProducts) {
      const slug = toSlug(p.title);
      // Verificar si ya existe por nombre
      const exists = await prisma.producto.findFirst({
        where: { prd_nombre: p.title }
      });
      
      if (!exists) {
        await prisma.producto.create({
          data: {
            id_producto: generateProductId(),
            prd_nombre: p.title,
            prd_pvp: p.price,
            prd_costo: p.price * 0.6,
            prd_stock: Math.floor(Math.random() * 50) + 10,
            id_categoria: 'FUT1',
            id_unimedida: UNIDAD_MEDIDA_DEFAULT
          }
        });
        futbolCount++;
      }
    }
    console.log(`   ✅ ${futbolCount} productos de fútbol insertados`);

    // 5. Insertar productos de Fórmula 1
    console.log('\n🏎️  Insertando productos de FÓRMULA 1...');
    let f1Count = 0;
    for (const p of formula1Products) {
      const exists = await prisma.producto.findFirst({
        where: { prd_nombre: p.title }
      });
      
      if (!exists) {
        await prisma.producto.create({
          data: {
            id_producto: generateProductId(),
            prd_nombre: p.title,
            prd_pvp: p.price,
            prd_costo: p.price * 0.6,
            prd_stock: Math.floor(Math.random() * 30) + 5,
            id_categoria: 'F1-1',
            id_unimedida: UNIDAD_MEDIDA_DEFAULT
          }
        });
        f1Count++;
      }
    }
    console.log(`   ✅ ${f1Count} productos de F1 insertados`);

    // 6. Insertar productos Jersey Club Brand
    console.log('\n👕 Insertando productos de JERSEY CLUB BRAND...');
    let jcbCount = 0;
    for (const p of jerseyClubProducts) {
      const exists = await prisma.producto.findFirst({
        where: { prd_nombre: p.title }
      });
      
      if (!exists) {
        await prisma.producto.create({
          data: {
            id_producto: generateProductId(),
            prd_nombre: p.title,
            prd_pvp: p.price,
            prd_costo: p.price * 0.6,
            prd_stock: Math.floor(Math.random() * 100) + 20,
            id_categoria: p.categoria || 'JCB1',
            id_unimedida: UNIDAD_MEDIDA_DEFAULT
          }
        });
        jcbCount++;
      }
    }
    console.log(`   ✅ ${jcbCount} productos de Jersey Club insertados`);

    // 7. Mostrar resumen
    const totalProducts = await prisma.producto.count();
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 RESUMEN DE SEED');
    console.log('═══════════════════════════════════════════');
    console.log(`   Fútbol:        ${futbolCount} nuevos`);
    console.log(`   Fórmula 1:     ${f1Count} nuevos`);
    console.log(`   Jersey Club:   ${jcbCount} nuevos`);
    console.log('───────────────────────────────────────────');
    console.log(`   TOTAL EN BD:   ${totalProducts} productos`);
    console.log('═══════════════════════════════════════════');
    console.log('\n🎉 Seed completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
