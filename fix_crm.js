const fs = require('fs');
const path = 'src/app/moje-konto/crm/page.tsx';

// Ponieważ plik jest bardzo duży, najbezpieczniej będzie oprzeć się na Twoim ostatnim działającym kodzie, 
// który udostępniłeś w terminalu przed błędem, i wkleić go w całości, dodając tylko nasz kawałek.

let originalCode = fs.readFileSync(path, 'utf8');

// A. DODANIE IKON I STANU (jeśli nie ma)
if(!originalCode.includes('Briefcase')) {
    originalCode = originalCode.replace('import { ShieldCheck, ChevronLeft', 'import { Briefcase, ArrowRight, ShieldCheck, ChevronLeft');
}
if(!originalCode.includes("const [deals, setDeals]")) {
    originalCode = originalCode.replace(
        "const [activeTab, setActiveTab] = useState<'radar' | 'offers' | 'planowanie'>('radar');",
        "const [activeTab, setActiveTab] = useState<'radar' | 'offers' | 'planowanie' | 'transakcje'>('radar');\n  const [deals, setDeals] = useState<any[]>([]);"
    );
}

// B. FETCHOWANIE DANYCH (jeśli nie ma)
if(!originalCode.includes('/api/crm/deals')) {
    originalCode = originalCode.replace(
        "const res = await fetch('/api/crm/data');",
        `const res = await fetch('/api/crm/data');\n      try { const dRes = await fetch('/api/crm/deals'); if(dRes.ok) { const dData = await dRes.json(); setDeals(dData.deals || []); } } catch(e){}`
    );
}

// C. PRZYCISK W MENU
originalCode = originalCode.replace(
    "{['radar', 'offers', 'planowanie'].map((tab)",
    "{['radar', 'offers', 'planowanie', 'transakcje'].map((tab)"
);

originalCode = originalCode.replace(
    "? (mode === 'BUYER' ? 'Obserwowane' : 'Zarządzaj Ogłoszeniami')\n                            : 'Planowanie'}",
    "? (mode === 'BUYER' ? 'Obserwowane' : 'Zarządzaj Ogłoszeniami')\n                            : tab === 'planowanie' ? 'Planowanie' : 'Transakcje'}"
);

// D. TŁA I STYLE
originalCode = originalCode.replace(
    "'bg-purple-500/10'\n            }",
    "tab === 'planowanie' ? 'bg-purple-500/10' : 'bg-yellow-500/10'\n            }"
);

originalCode = originalCode.replace(
    "'border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.05)]'\n            }",
    "tab === 'planowanie' ? 'border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.05)]' : 'border-yellow-500/20 shadow-[0_0_50px_rgba(234,179,8,0.05)]'\n            }"
);

originalCode = originalCode.replace(
    "'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]'\n            }",
    "tab === 'planowanie' ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]'\n            }"
);

// E. IKONA TECZKI
const briefcaseBlock = `
              {activeTab === 'transakcje' && (
                <div className="relative w-full h-full flex items-center justify-center perspective-1000">
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(234,179,8,0.4)] bg-gradient-to-tr from-yellow-950/40 to-transparent" />
                  <motion.div animate={{ rotateY: [-10, 10, -10], y: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10">
                     <Briefcase size={38} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" strokeWidth={1.5} />
                  </motion.div>
                </div>
              )}
            </div>
            <div className="relative z-10 text-center md:text-left">`;

originalCode = originalCode.replace(/<\/div>\s*\)\}\s*<\/div>\s*<div className="relative z-10 text-center md:text-left">/, briefcaseBlock);

// F. TEKSTY
originalCode = originalCode.replace(
    "{activeTab === 'planowanie' && <>Centrum <span className=\"text-purple-500\">Planowania</span></>}",
    "{activeTab === 'planowanie' && <>Centrum <span className=\"text-purple-500\">Planowania</span></>}\n               {activeTab === 'transakcje' && <>Zarządzanie <span className=\"text-yellow-500\">Transakcjami</span></>}"
);

originalCode = originalCode.replace(
    "{activeTab === 'planowanie' && 'Umawiaj prezentacje nieruchomości, zarządzaj spotkaniami negocjacyjnymi i koordynuj kalendarz z agentami oraz klientami. Twój czas jest kluczowy.'}",
    "{activeTab === 'planowanie' && 'Umawiaj prezentacje nieruchomości, zarządzaj spotkaniami negocjacyjnymi i koordynuj kalendarz z agentami oraz klientami. Twój czas jest kluczowy.'}\n               {activeTab === 'transakcje' && 'Szyfrowane Deal Roomy. Kontroluj oferty cenowe, wymieniaj bezpiecznie dokumenty i finalizuj transakcje w jednym miejscu.'}"
);

// G. KONTENT DEALI
const dealContent = `
        {activeTab === 'transakcje' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-12">
             {deals.length === 0 ? (
               <div className="bg-[#0a0a0a] border border-white/5 border-dashed rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-xl">
                 <Briefcase size={48} className="text-white/10 mb-6" />
                 <h3 className="text-xl font-bold mb-2 text-white">Brak aktywnych procesów</h3>
                 <p className="text-sm text-white/40 max-w-md">Nie prowadzisz obecnie żadnych negocjacji i nie masz otwartych Deal Roomów.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {deals.map((deal, idx) => (
                   <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="group bg-[#0c0c0e] border border-white/5 hover:border-yellow-500/30 rounded-[28px] overflow-hidden transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row">
                     <div className="w-full sm:w-40 h-48 sm:h-auto relative overflow-hidden shrink-0 border-r border-white/5">
                       <img src={deal.offer?.imageUrl || '/placeholder.jpg'} alt="Property" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                       <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                         <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500">{deal.role === 'BUYER' ? 'Kupujesz' : 'Sprzedajesz'}</span>
                       </div>
                     </div>
                     <div className="p-6 flex flex-col justify-between flex-1 relative">
                       <div className="relative z-10">
                         <h3 className="text-lg font-black text-white leading-tight mb-2 pr-4">{deal.offer?.title || 'Oferta Nieruchomości'}</h3>
                         <div className="flex items-center gap-3 mb-4">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{deal.offer?.district || 'Warszawa'}</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{Number(String(deal.offer?.price || 0).replace(/\\D/g, '') || 0).toLocaleString()} PLN</span>
                         </div>
                         <div className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-center gap-3 shadow-inner">
                           <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                           <p className="text-[10px] text-white/70 font-bold tracking-widest uppercase">Trwają negocjacje</p>
                         </div>
                       </div>
                       <Link href={"/dealroom/" + deal.id} className="mt-6 w-full py-3 border border-yellow-500/30 group-hover:bg-yellow-500 text-yellow-500 group-hover:text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer relative z-10">
                         Wejdź do Deal Roomu <ArrowRight size={14} />
                       </Link>
                     </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </motion.div>
        )}
`;

// Wstrzyknijmy DealContent zaraz po zamknięciu zakładki planowanie (zanim zaczyna się Modal Spotkań)
const injectionPoint = /\{\s*\/\*\s*MODAL KONFIGURACJI RADARU\s*\*\/\s*\}/;
// LUB - bezpieczniejsze - zaraz na samym koncu kontenera przed <AnimatePresence> dla 'managingApp'
originalCode = originalCode.replace(
    /<AnimatePresence>\s*\{managingApp && \(\(\) => \{/,
    dealContent + '\n        <AnimatePresence>\n          {managingApp && (() => {'
);


fs.writeFileSync(path, originalCode);
console.log('✔ Naprawiono i zintegrowano kod CRMu!');
