const fs = require('fs');
const path = require('path');

console.log("=== ROZPOCZYNAM GLOBALNĄ NAPRAWĘ MODALI ===");

// 1. Aktualizacja BaseModal do Dark Theme (dla przyszłych modali)
const baseModalPath = path.join(process.cwd(), 'src', 'components', 'ui', 'BaseModal.tsx');
if (fs.existsSync(baseModalPath)) {
    let bmCode = fs.readFileSync(baseModalPath, 'utf8');
    bmCode = bmCode.replace('bg-white', 'bg-[#0a0a0a] border border-white/10');
    bmCode = bmCode.replace('text-gray-900', 'text-white');
    bmCode = bmCode.replace('border-gray-100', 'border-white/5 bg-[#050505]');
    fs.writeFileSync(baseModalPath, bmCode);
    console.log("✅ Dostosowano BaseModal do stylistyki Dark Theme.");
}

// 2. Skanowanie i naprawa wszystkich obecnych modali
function scanAndFix(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanAndFix(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let code = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Szukamy plików posiadających tło pop-upu
            if (code.includes('fixed') && code.includes('inset-0')) {
                const originalCode = code;

                // FIX 1: Z-index oraz ucięta góra (items-center -> items-start overflow-y-auto)
                code = code.replace(/className="([^"]*fixed[^"]*inset-0[^"]*)"/g, (match, p1) => {
                    let newClass = p1;
                    newClass = newClass.replace(/z-\[\d+\]/g, 'z-[999999]');
                    if (newClass.includes('items-center')) {
                        newClass = newClass.replace('items-center', 'items-start overflow-y-auto pt-10 pb-10 sm:pt-20 sm:pb-20');
                    }
                    return `className="${newClass}"`;
                });

                // FIX 2: Dodanie my-auto i shrink-0 do kontenera okna, żeby idealnie centrował się w osi Y
                code = code.replace(/className="([^"]*max-w-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)[^"]*bg-[^"]*)"/g, (match, p1) => {
                    let newClass = p1;
                    if (newClass.includes('fixed') || newClass.includes('inset-0')) return match;
                    if (!newClass.includes('my-auto')) newClass += ' my-auto shrink-0';
                    return `className="${newClass}"`;
                });

                // FIX 3: Blokada znikających modali (stopPropagation)
                code = code.replace(/(<motion\.div|<div)([^>]*className="[^"]*max-w-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)[^"]*bg-[^"]*"[^>]*)>/g, (match, tag, rest) => {
                    if (!rest.includes('stopPropagation') && !rest.includes('fixed') && !rest.includes('inset-0')) {
                        return `${tag}${rest} onClick={(e) => e.stopPropagation()}>`;
                    }
                    return match;
                });

                if (code !== originalCode) {
                    fs.writeFileSync(fullPath, code);
                    console.log(`✅ Naprawiono fizykę modala w: ${fullPath.split('src/')[1] || fullPath}`);
                    modified = true;
                }
            }
        }
    }
}

scanAndFix(path.join(process.cwd(), 'src'));
console.log("=== ZAKOŃCZONO NAPRAWĘ MODALI ===");
