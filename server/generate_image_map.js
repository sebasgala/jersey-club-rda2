import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

const generateSlug = (nombre) => {
    if (!nombre) return '';
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') + '.webp';
};

async function main() {
    const products = await prisma.producto.findMany({
        select: {
            id_producto: true,
            prd_nombre: true
        }
    });

    let output = '# Mapeo de Imágenes (Archivo Original -> Nuevo)\n\n';
    output += '| ID (Nombre Nuevo) | Archivo Original (Slug) | Nombre Producto |\n';
    output += '|---|---|---|\n';

    products.forEach(p => {
        const slug = generateSlug(p.prd_nombre);
        output += `| **${p.id_producto}.webp** | ${slug} | ${p.prd_nombre} |\n`;
    });

    fs.writeFileSync('image_mapping.md', output, 'utf8');
    console.log('File written to image_mapping.md');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
