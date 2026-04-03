const fs = require('fs');
const file = 'src/app/moje-konto/crm/page.tsx';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    // Wymiana zakładek na dynamiczne
    const oldTabsRegex = /\{?\['radar', 'offers', 'planowanie', 'transakcje'\]\.map\(\(tab\) => \(/;
    if (code.match(oldTabsRegex)) {
        code = code.replace(oldTabsRegex, `{(mode === 'AGENCY' ? ['radar_pro', 'pozyski', 'planowanie', 'transakcje'] : mode === 'SELLER' ? ['offers', 'planowanie', 'transakcje'] : ['radar', 'offers', 'planowanie', 'transakcje']).map((tab) => (`);
    }

    // Wymiana nazw zakładek
    const oldTabNames = /\{tab === 'radar'[\s\S]*?\?\s*\(mode === 'BUYER' \? 'Radar Inwestycji' : 'System Radar'\)[\s\S]*?: tab === 'offers'[\s\S]*?\?\s*\(mode === 'BUYER' \? 'Obserwowane' : 'Zarządzaj Ogłoszeniami'\)[\s\S]*?: tab === 'planowanie' \? 'Planowanie' : 'Transakcje'\}/;
    const newTabNames = `{tab === 'radar_pro' ? 'Radar Pro™' : tab === 'pozyski' ? 'Baza Pozysków' : tab === 'radar' ? 'Radar Inwestycji' : tab === 'offers' ? (mode === 'BUYER' ? 'Obserwowane' : 'Zarządzaj Ogłoszeniami') : tab === 'planowanie' ? 'Planowanie' : 'Transakcje'}`;
    if(code.match(oldTabNames)) {
        code = code.replace(oldTabNames, newTabNames);
    }

    // Kolory Aktywnej Pigułki (Złota dla Partnera, Cyjan dla Sellera)
    code = code.replace(/layoutId="activeTabPill"[\s\S]*?className="absolute inset-0 bg-emerald-500 rounded-full shadow-\[0_0_20px_rgba\(16,185,129,0\.4\)\]"/, `layoutId="activeTabPill"
                    className={\`absolute inset-0 rounded-full \${mode === 'AGENCY' ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : mode === 'SELLER' ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}\`}`);

    fs.writeFileSync(file, code);
    console.log('✓ Naprawiono zakładki i kolory w panelu CRM.');
}
