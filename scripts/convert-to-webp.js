const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Input directory - usando ruta absoluta para Windows
const inputDir = 'E:\\Usuarios\\Sebas\\Desktop\\PUCE\\QUINTO\\Desarrollo de plataformas\\Semana 13\\jersey-club-ec-main\\jersey-club-ec\\public\\assets\\images';

// Output directory - mismo directorio que entrada
const outputDir = inputDir;

// Obtener todos los archivos de imagen
function getImageFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
  });
}

// Convertir imágenes a 1024x1024 WebP
async function convertImages() {
  console.log('Directorio de entrada:', inputDir);
  console.log('Directorio de salida:', outputDir);

  const files = getImageFiles(inputDir);

  if (files.length === 0) {
    console.error('No se encontraron imágenes en el directorio de entrada.');
    return;
  }

  console.log(`Se encontraron ${files.length} imágenes para convertir.`);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const fileName = path.basename(file, path.extname(file));
    const outputPath = path.join(outputDir, `${fileName}.webp`);

    try {
      await sharp(inputPath)
        .resize(1024, 1024, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`✓ Convertido: ${file} -> ${fileName}.webp`);

      // Eliminar el archivo original después de convertir
      fs.unlinkSync(inputPath);
      console.log(`  Eliminado original: ${file}`);
    } catch (err) {
      console.error(`✗ Error al procesar ${file}:`, err.message);
    }
  }

  console.log('¡Conversión completada!');
}

convertImages();