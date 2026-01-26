const fs = require('fs');
const path = 'e:/Usuarios/Sebas/Desktop/PUCE/QUINTO/Desarrollo de plataformas/Semana 13/jersey-club-ec-main/jersey-club-ec/src/pages/AdminProductos.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">\s*\{product\.categoria\}\s*<\/span>\s*<\/td>/g;

const newText = `<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {product.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          \${parseFloat(product.precio).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock} unidades
                        </td>`;

if (regex.test(content)) {
    content = content.replace(regex, newText);
    fs.writeFileSync(path, content);
    console.log('File updated successfully');
} else {
    console.log('Regex template not found');
}
