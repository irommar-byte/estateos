const fs = require('fs');
const file = 'src/app/moje-konto/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Zmiana kolorów zakładek (Active Tab Styling)
// Właściciel (offers) na Cyjan
code = code.replace(/activeTab === 'offers' \? 'border-blue-500\/20 shadow-\[0_0_50px_rgba\(59,130,246,0\.05\)\]'/g, "activeTab === 'offers' ? 'border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]'");
code = code.replace(/activeTab === 'offers' \? 'border-blue-500\/50 shadow-\[0_0_30px_rgba\(59,130,246,0\.2\)\]'/g, "activeTab === 'offers' ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]'");

// Partner (radar_pro i pozyski) na Amber
code = code.replace(/activeTab === 'radar_pro' \? 'border-cyan-500\/20 shadow-\[0_0_50px_rgba\(6,182,212,0\.05\)\]'/g, "activeTab === 'radar_pro' ? 'border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]'");
code = code.replace(/activeTab === 'radar_pro' \? 'bg-cyan-500\/10'/g, "activeTab === 'radar_pro' ? 'bg-amber-500/10'");
code = code.replace(/activeTab === 'radar_pro' \? 'border-cyan-500\/50 shadow-\[0_0_30px_rgba\(6,182,212,0\.2\)\]'/g, "activeTab === 'radar_pro' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'");

code = code.replace(/activeTab === 'pozyski' \? 'border-rose-500\/20 shadow-\[0_0_50px_rgba\(244,63,94,0\.05\)\]'/g, "activeTab === 'pozyski' ? 'border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.05)]'");
code = code.replace(/activeTab === 'pozyski' \? 'bg-rose-500\/10'/g, "activeTab === 'pozyski' ? 'bg-amber-500/10'");
code = code.replace(/activeTab === 'pozyski' \? 'border-rose-500\/50 shadow-\[0_0_30px_rgba\(244,63,94,0\.2\)\]'/g, "activeTab === 'pozyski' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'");

// 2. Nagłówki
code = code.replace(/<span className="text-cyan-400">Pro™<\/span>/g, '<span className="text-amber-400">Pro™</span>');
code = code.replace(/<span className="text-rose-500">Pozysków<\/span>/g, '<span className="text-amber-500">Pozysków</span>');

// 3. Wnętrze nowo dodanych komponentów (zamiana z Cyan na Amber)
// Zamieniamy 'cyan' na 'amber' we wnętrzu Radar Pro
code = code.replace(/cyan-950/g, 'amber-950');
code = code.replace(/cyan-500/g, 'amber-500');
code = code.replace(/cyan-400/g, 'amber-400');
code = code.replace(/rgba\(6,182,212/g, 'rgba(245,158,11');

// Zamieniamy 'rose' na 'amber' we wnętrzu Pozysków
code = code.replace(/rose-950/g, 'amber-950');
code = code.replace(/rose-500/g, 'amber-500');
code = code.replace(/rose-400/g, 'amber-400');
code = code.replace(/rgba\(244,63,94/g, 'rgba(245,158,11');

fs.writeFileSync(file, code);
