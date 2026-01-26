import fs from 'fs';
import path from 'path';

function search(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                        search(fullPath);
                    }
                } else if (stat.isFile()) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.includes('existe')) {
                        console.log(`FOUND in ${fullPath}`);
                        const lines = content.split('\n');
                        lines.forEach((line, i) => {
                            if (line.includes('existe')) {
                                console.log(`  L${i + 1}: ${line.trim()}`);
                            }
                        });
                    }
                }
            } catch (e) {
                // skip files we can't read
            }
        }
    } catch (e) {
        // skip dirs we can't read
    }
}

search('..'); 
