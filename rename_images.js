const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'public/assets/images');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory: ' + err);
  }

  files.forEach((file) => {
    // Reemplazar espacios con guiones y convertir a minúsculas
    const newFileName = file.replace(/\s+/g, '-').toLowerCase();
    
    if (file !== newFileName) {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, newFileName);
      
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(`Error renaming ${file}:`, err);
        } else {
          console.log(`Renamed: ${file} -> ${newFileName}`);
        }
      });
    }
  });
  
  console.log('Done renaming files.');
});
