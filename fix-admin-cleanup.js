const fs = require('fs');
const path = 'e:/Usuarios/Sebas/Desktop/PUCE/QUINTO/Desarrollo de plataformas/Semana 13/jersey-club-ec-main/jersey-club-ec/src/pages/AdminProductos.jsx';

// Read file, handling potential CRLF issues by splitting on \n and trimming \r later if needed, 
// but splitting on \r\n or \n is safer.
let rawContent = fs.readFileSync(path, 'utf8');
let usedCRLF = rawContent.includes('\r\n');
let lines = rawContent.split(/\r?\n/);

console.log(`Total lines: ${lines.length}`);

// Lines to remove (1-based to 0-based)
// Remove from bottom to top to preserve indices of earlier blocks
const groupB_start = 776;
const groupB_end = 779;
// Indices: 775 to 778 (inclusive)

const groupA_start = 570;
const groupA_end = 575;
// Indices: 569 to 574 (inclusive)

// Helper to remove range
function removeRange(startLine, endLine) {
    const startIndex = startLine - 1;
    const deleteCount = endLine - startLine + 1;
    console.log(`Removing lines ${startLine}-${endLine} (Indices ${startIndex}-${startIndex + deleteCount - 1})`);

    // Print lines being removed for verification
    for (let i = startIndex; i < startIndex + deleteCount; i++) {
        console.log(`[-]: ${lines[i]}`);
    }

    lines.splice(startIndex, deleteCount);
}

// Remove Group B first (bottom)
removeRange(groupB_start, groupB_end);

// Remove Group A second (top)
removeRange(groupA_start, groupA_end);

// Reconstruct
const newContent = lines.join(usedCRLF ? '\r\n' : '\n');

fs.writeFileSync(path, newContent);
console.log('File updated successfully.');
