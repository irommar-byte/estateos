const fs = require('fs');
const file = 'src/components/PasskeyToggle.tsx';

if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Usuwamy absolutnie całą logikę blokującą opartą na isPro
    const blokadaRegex = /const isPro =[\s\S]*?if \(\!isPro\) return;/;
    code = code.replace(blokadaRegex, '');
    
    fs.writeFileSync(file, code);
    console.log('✓ Passkey: Usunięto blokadę PRO (Teraz działa dla każdego!)');
}
