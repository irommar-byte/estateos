const fs = require('fs');

// 1. NAPRAWA MAPY I ODBLOKOWANIE BUDOWANIA SYSTEMU
const mapFile = 'src/components/map/InteractiveMap.tsx';
if (fs.existsSync(mapFile)) {
    let mapCode = fs.readFileSync(mapFile, 'utf8');
    // TypeScript musi wiedzieć, że to stałe wartości
    mapCode = mapCode.replace(/type: 'Feature'/g, "type: 'Feature' as const");
    mapCode = mapCode.replace(/type: 'Point'/g, "type: 'Point' as const");
    fs.writeFileSync(mapFile, mapCode);
}

// 2. NAPRAWA FORMULARZA (Brakujące pola i kinowa typografia)
const offerFile = 'src/app/dodaj-oferte/page.tsx';
if (fs.existsSync(offerFile)) {
    let offerCode = fs.readFileSync(offerFile, 'utf8');

    // Znajdujemy i podmieniamy cały Krok 1
    const step1Regex = /\{step === 1 && \([\s\S]*?<\/motion\.div>\s*\)\}/;
    const newStep1 = `{step === 1 && (
            <motion.div key="krok1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">
                Zacznijmy od <br/><span className="text-white/30 italic">szczegółów.</span>
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 focus-within:border-white/30 transition-colors md:col-span-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3">Tytuł ogłoszenia</label>
                  <input type="text" placeholder="np. Willa na Mokotowie" className="w-full text-3xl font-medium placeholder:text-white/10 bg-transparent outline-none" onChange={(e) => updateData({ title: e.target.value })} value={data.title || ''} />
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 focus-within:border-white/30 transition-colors">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3">Typ Wnętrza</label>
                  <select className="w-full text-2xl placeholder:text-white/10 bg-transparent text-white cursor-pointer outline-none appearance-none" onChange={(e) => updateData({ propertyType: e.target.value })} value={data.propertyType || "Mieszkanie"}>
                    {["Mieszkanie", "Apartament", "Penthouse", "Dom wolnostojący", "Segment", "Willa"].map(d => <option key={d} className="bg-black text-white">{d}</option>)}
                  </select>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 focus-within:border-white/30 transition-colors">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3">Dzielnica</label>
                  <select className="w-full text-2xl placeholder:text-white/10 bg-transparent text-white cursor-pointer outline-none appearance-none" onChange={(e) => updateData({ district: e.target.value })} value={data.district || "Śródmieście"}>
                    {["Śródmieście", "Mokotów", "Żoliborz", "Wola", "Ochota", "Wilanów", "Praga-Południe", "Praga-Północ", "Ursynów", "Bielany", "Bemowo", "Białołęka", "Targówek", "Rembertów", "Wesoła", "Wawer", "Ursus", "Włochy"].map(d => <option key={d} className="bg-black text-white">{d}</option>)}
                  </select>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 focus-within:border-white/30 transition-colors">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3">Cena (PLN)</label>
                  <input type="text" placeholder="0.00" className="w-full text-2xl placeholder:text-white/10 bg-transparent outline-none" onChange={(e) => updateData({ price: formatNumber(e.target.value) })} value={data.price || ''} />
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 focus-within:border-white/30 transition-colors">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block mb-3">Metraż (m²)</label>
                  <input type="text" placeholder="0" className="w-full text-2xl placeholder:text-white/10 bg-transparent outline-none" onChange={(e) => updateData({ area: e.target.value.replace(/\\D/g, "") })} value={data.area || ''} />
                </div>
              </div>
              <div className="pt-8">
                <button onClick={() => setStep(2)} className="w-full !bg-white !text-black py-6 rounded-full font-bold text-xl hover:!bg-gray-200 transition-colors cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.2)]">Dalej ➔</button>
              </div>
            </motion.div>
          )}`;
    
    offerCode = offerCode.replace(step1Regex, newStep1);

    // Podmiana typografii w pozostałych krokach
    offerCode = offerCode.replace(/<h1[^>]*>Krok 2:[^<]*<br\/>\s*<span[^>]*>Wizualia\.?<\/span>\s*<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">Dodajmy <br/><span className="text-white/30 italic">wizualia.</span></h1>');
    offerCode = offerCode.replace(/<h1[^>]*>Krok 3:[^<]*<br\/>\s*<span[^>]*>Kontakt\.?<\/span>\s*<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">Dane <br/><span className="text-white/30 italic">kontaktowe.</span></h1>');
    offerCode = offerCode.replace(/<h1[^>]*>Krok 4:[^<]*<br\/>\s*<span[^>]*>Konto\.?<\/span>\s*<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">Twoje <br/><span className="text-white/30 italic">konto.</span></h1>');
    
    // W razie gdyby zaciągnęło starą wersję
    offerCode = offerCode.replace(/<h1[^>]*>Wizualia\.?<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">Dodajmy <br/><span className="text-white/30 italic">wizualia.</span></h1>');
    offerCode = offerCode.replace(/<h1[^>]*>Kontakt\.?<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">Dane <br/><span className="text-white/30 italic">kontaktowe.</span></h1>');
    offerCode = offerCode.replace(/<h1[^>]*>Konto\.?<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-8">Twoje <br/><span className="text-white/30 italic">konto.</span></h1>');

    fs.writeFileSync(offerFile, offerCode);
}

// 3. NAPRAWA PANELU KLIENTA (Typografia Apple-style)
const accountFile = 'src/app/moje-konto/page.tsx';
if (fs.existsSync(accountFile)) {
    let accountCode = fs.readFileSync(accountFile, 'utf8');
    accountCode = accountCode.replace(/<h1[^>]*>Twoje[^<]*<br\/>\s*<span[^>]*>Konto\.?<\/span>\s*<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-4">Twoje <br/><span className="text-white/30 italic">konto.</span></h1>');
    accountCode = accountCode.replace(/<h1[^>]*>Twoje Konto\.?<\/h1>/gi, '<h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-4">Twoje <br/><span className="text-white/30 italic">konto.</span></h1>');
    fs.writeFileSync(accountFile, accountCode);
}

console.log("PLATFORMA NAPRAWIONA!");
