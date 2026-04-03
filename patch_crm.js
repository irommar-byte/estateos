const fs = require('fs');
const file = 'src/app/moje-konto/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// A. Zmiana wymuszenia trybu dla darmowych kont w initCrm
code = code.replace(/await fetchRadarData\(\);/g, `await fetchRadarData();
      if (!uData.isPro && uData.role !== 'ADMIN' && uData.role !== 'AGENCY') {
          if (uData.role === 'SELLER') localStorage.setItem('estateos_user_mode', 'SELLER');
          if (uData.role === 'BUYER' || !uData.role) localStorage.setItem('estateos_user_mode', 'BUYER');
          window.dispatchEvent(new Event('storage'));
      }`);

// B. Logika ActiveTab pod kątem 3 trybów
code = code.replace(/const \[activeTab, setActiveTab\] = useState<'radar' \| 'offers' \| 'planowanie' \| 'transakcje'>\('radar'\);/g, 
`const [activeTab, setActiveTab] = useState<string>('radar');
  useEffect(() => {
    if (mode === 'SELLER' && (activeTab === 'radar' || activeTab === 'radar_pro' || activeTab === 'pozyski')) setActiveTab('offers');
    if (mode === 'BUYER' && (activeTab === 'radar_pro' || activeTab === 'pozyski')) setActiveTab('radar');
    if (mode === 'AGENCY' && activeTab === 'radar') setActiveTab('radar_pro');
  }, [mode]);`);

// C. Dynamiczne Tablice Przycisków (Właściciel traci Radar!)
code = code.replace(/\{\['radar', 'offers', 'planowanie', 'transakcje'\]\.map\(\(tab\) => \(/g, 
`{(mode === 'AGENCY' ? ['radar_pro', 'pozyski', 'planowanie', 'transakcje'] : mode === 'SELLER' ? ['offers', 'planowanie', 'transakcje'] : ['radar', 'offers', 'planowanie', 'transakcje']).map((tab) => (`);

// D. Teksty przycisków w menu
code = code.replace(/\{tab === 'radar'[\s\S]*?tab === 'planowanie' \? 'Planowanie' : 'Transakcje'\}/g, 
`{tab === 'radar_pro' ? 'Radar Pro™' : tab === 'pozyski' ? 'Baza Pozysków' : tab === 'radar' ? 'Radar Inwestycji' : tab === 'offers' ? (mode === 'BUYER' ? 'Obserwowane' : 'Zarządzaj Ogłoszeniami') : tab === 'planowanie' ? 'Planowanie' : 'Transakcje'}`);

// E. Dynamiczne kolory kontenerów (Active Tab styling)
code = code.replace(/activeTab === 'radar' \? 'border-emerald-500\/20 shadow-\[0_0_50px_rgba\(16,185,129,0\.05\)\]' :/g, `activeTab === 'radar_pro' ? 'border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]' : activeTab === 'pozyski' ? 'border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.05)]' : activeTab === 'radar' ? 'border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)]' :`);
code = code.replace(/activeTab === 'radar' \? 'bg-emerald-500\/10' :/g, `activeTab === 'radar_pro' ? 'bg-cyan-500/10' : activeTab === 'pozyski' ? 'bg-rose-500/10' : activeTab === 'radar' ? 'bg-emerald-500/10' :`);
code = code.replace(/activeTab === 'radar' \? 'border-emerald-500\/50 shadow-\[0_0_30px_rgba\(16,185,129,0\.2\)\]' :/g, `activeTab === 'radar_pro' ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : activeTab === 'pozyski' ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : activeTab === 'radar' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :`);

// F. Podmiana Nagłówków i Opisów z odpowiednimi kolorami
code = code.replace(/\{activeTab === 'radar' && \(mode === 'BUYER' \? <>Radar <span className="text-emerald-500">Okazji<\/span><\/> : <>Radar <span className="text-emerald-500">Kupców<\/span><\/>\)\}/g, 
`{activeTab === 'radar_pro' && <>Radar <span className="text-cyan-400">Pro™</span></>}
{activeTab === 'pozyski' && <>Baza <span className="text-rose-500">Pozysków</span></>}
{activeTab === 'radar' && <>Radar <span className="text-emerald-500">Okazji</span></>}`);

code = code.replace(/\{activeTab === 'radar' && \(mode === 'BUYER' \? 'Sztuczna inteligencja śledzi rynek[\s\S]*?zanim ktokolwiek dowie się o sprzedaży\.'\)\}/g, 
`{activeTab === 'radar_pro' && 'Zaawansowany algorytm dwukierunkowy. Skanuj bazę zweryfikowanych inwestorów pod swoje oferty, lub przechwytuj nieruchomości off-market w ułamki sekund.'}
{activeTab === 'pozyski' && 'Ekskluzywna baza leadów i ofert bezpośrednich. Przejmuj kontakty, wysyłaj propozycje współpracy i buduj swój portfel.'}
{activeTab === 'radar' && 'Sztuczna inteligencja śledzi rynek i wyłapuje oferty off-market spełniające Twoje kryteria inwestycyjne w czasie rzeczywistym.'}`);

// G. Animacje 3D dla nowych okręgów w panelu
const newAnimations = `
{activeTab === 'radar_pro' && (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full perspective-1000">
    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(6,182,212,0.4)] bg-gradient-to-tr from-cyan-950/40 to-transparent" />
    <Radar size={34} className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] relative z-10" strokeWidth={1.5} />
    <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute inset-1 border-2 border-cyan-500/30 border-dotted rounded-full" />
    <motion.div animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute -inset-2 border-2 border-transparent border-t-cyan-500/60 border-b-cyan-500/10 rounded-full" />
  </div>
)}
{activeTab === 'pozyski' && (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full perspective-1000">
    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(244,63,94,0.4)] bg-gradient-to-tr from-rose-950/40 to-transparent" />
    <Target size={34} className="text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] relative z-10" strokeWidth={1.5} />
    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-2 bg-rose-500/20 rounded-full" />
  </div>
)}
`;
code = code.replace(/\{activeTab === 'radar' && \(\s*<div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full perspective-1000">/, newAnimations + `{activeTab === 'radar' && (\n<div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full perspective-1000">`);

// H. Wstrzyknięcie pełnych sekcji "Radar Pro" i "Pozyski"
const newContent = `
{activeTab === 'radar_pro' && (
  <div className="flex flex-col gap-8 mb-12">
    <div className="relative w-full p-8 md:p-10 rounded-[3rem] border border-cyan-500/20 bg-gradient-to-br from-[#111] to-[#050505] shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-cyan-500/50 transition-all duration-700">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-8">
         <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
           <Radar size={28} className="text-cyan-400 animate-[spin_3s_linear_infinite]" />
         </div>
         <div>
           <h3 className="text-white text-2xl font-black tracking-tighter">Radar Pro™</h3>
           <p className="text-cyan-500/80 text-[10px] uppercase font-bold tracking-[0.3em] mt-1">Podwójne skanowanie systemu</p>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
         <div className="bg-black/50 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center hover:border-cyan-500/50 hover:bg-cyan-950/20 hover:-translate-y-1 transition-all cursor-pointer shadow-xl">
            <Target size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] mb-4" />
            <h4 className="text-white font-black text-xl mb-2">Skanuj Kupców</h4>
            <p className="text-white/40 text-xs">Algorytm wyszuka zweryfikowanych inwestorów bezpośrednio pod Twoje oferty sprzedaży.</p>
            <button className="mt-6 px-8 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">Uruchom Analizę</button>
         </div>
         <div className="bg-black/50 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center hover:border-cyan-500/50 hover:bg-cyan-950/20 hover:-translate-y-1 transition-all cursor-pointer shadow-xl">
            <Search size={36} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] mb-4" />
            <h4 className="text-white font-black text-xl mb-2">Skanuj Nieruchomości</h4>
            <p className="text-white/40 text-xs">Przechwytuj najlepsze oferty off-market natychmiast, z ominięciem opóźnień dla darmowych kont.</p>
            <button className="mt-6 px-8 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">Uruchom Radary</button>
         </div>
      </div>
    </div>
  </div>
)}
{activeTab === 'pozyski' && (
  <div className="flex flex-col items-center justify-center py-24 border border-dashed border-rose-500/30 rounded-[2.5rem] bg-[#0a0a0a] relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] mb-12">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-900/5 pointer-events-none" />
    <Target size={48} className="text-rose-500/50 mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
    <p className="text-white font-black uppercase tracking-[0.3em] text-lg mb-3 relative z-10">Baza Pozysków</p>
    <p className="text-rose-500/60 text-xs text-center font-bold tracking-widest uppercase max-w-md relative z-10">Trwa agregacja rynku prywatnego...</p>
  </div>
)}
`;
code = code.replace(/\{activeTab === 'radar' && \(\n\s*<div className="flex flex-col gap-8 mb-12">/, newContent + `{activeTab === 'radar' && (\n          <div className="flex flex-col gap-8 mb-12">`);

fs.writeFileSync(file, code);
