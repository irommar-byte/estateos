const fs = require('fs');
const path = require('path');

console.log("=== NAPRAWA SKŁADNI JSX ===");

function fixSyntax(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixSyntax(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let code = fs.readFileSync(fullPath, 'utf8');
            // Szukamy uciętego samozamykającego się tagu z dodanym onClick
            const badSyntax = /\/\s*onClick=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}>/g;
            
            if (badSyntax.test(code)) {
                code = code.replace(badSyntax, 'onClick={(e) => e.stopPropagation()} />');
                fs.writeFileSync(fullPath, code);
                console.log(`✅ Naprawiono błąd składni w: ${fullPath.split('src/')[1] || fullPath}`);
            }
        }
    }
}

fixSyntax(path.join(process.cwd(), 'src'));
console.log("=== GOTOWE ===");
