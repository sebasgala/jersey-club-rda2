const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'public/assets/images');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory: ' + err);
  }
  console.log('Files in directory:', files);
});