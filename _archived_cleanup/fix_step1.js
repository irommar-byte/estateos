const fs = require('fs');
const path = './src/app/dodaj-oferte/page.tsx';

let content = fs.readFileSync(path, 'utf8');

// The replacement content for Step 1
const newStep1 = `          {/* KROK 1 */}
          {step === 1 && (
            <motion.div key="k1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Zacznijmy od <br/><span className="text-black/30 dark:text-white/30 italic">szczegółów.</span></h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Tytuł */}
                <div className={\`\${inputCardClass} md:col-span-2 relative\`}>
                  <label className={labelClass}>Tytuł ogłoszenia</label>
                  <input type="text" maxLength={60} placeholder="np. Jasny apartament z tarasem" className={inputClass} onChange={(e) => updateData({ title: e.target.value })} value={data.title || ''} />
                  {(!data.title || data.title.length < 10) && <p className="text-[10px] text-red-500 mt-2 absolute bottom-2 left-6">Wymagane 10-60 znaków, aby przyciągnąć uwagę.</p>}
                  {data.title && data.title.length >= 10 && <p className="text-[10px] text-emerald-500/50 mt-2 absolute bottom-2 left-6">{data.title.length}/60 znaków</p>}
                </div>

                {/* Typ Nieruchomości */}
                <div className={inputCardClass}>
                  <label className={labelClass}>Typ Nieruchomości</label>
                  <select className={\`\${inputClass} appearance-none cursor-pointer\`} onChange={(e) => updateData({ propertyType: e.target.value, plotArea: "" })} value={data.propertyType || "Mieszkanie"}>
                    {PROPERTY_TYPES.map(d => <option key={d} className="bg-white dark:bg-black text-black dark:text-white">{d}</option>)}
                  </select>
                </div>

                {/* Dzielnica */}
                <div className={inputCardClass}>
                  <label className={labelClass}>Dzielnica</label>
                  <select className={\`\${inputClass} appearance-none cursor-pointer\`} onChange={(e) => updateData({ district: e.target.value })} value={data.district || "Śródmieście"}>
                    {ALL_DISTRICTS.map(d => <option key={d} className="bg-white dark:bg-black text-black dark:text-white">{d}</option>)}
                  </select>
                </div>

                {/* Cena */}
                <div className={inputCardClass}>
                  <label className={labelClass}>Cena (PLN)</label>
                  <input type="text" placeholder="0" className={inputClass} onChange={(e) => updateData({ price: formatNumber(e.target.value) })} value={data.price || ''} />
                  {!data.price && <p className="text-[10px] text-red-500 mt-2 absolute bottom-2 left-6">Podaj całkowitą cenę nieruchomości.</p>}
                </div>

                {/* Metraż z obliczaniem m2 w czasie rzeczywistym */}
                <div className={\`\${inputCardClass} relative\`}>
                  <label className={labelClass}>Metraż (m²)</label>
                  <div className="relative flex items-center">
                    <input type="text" placeholder="np. 75,5" className={\`\${inputClass} pr-24\`} onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9,]/g, '');
                      updateData({ area: val });
                    }} value={data.area || ''} />
                    
                    {/* Live Kalkulator z kolorami na podstawie "ceny rynkowej" (tu mock 18000 PLN) */}
                    {(() => {
                      const numPrice = Number((data.price || '').replace(/\\D/g, ''));
                      const numArea = Number((data.area || '').replace(',', '.'));
                      if (numPrice > 0 && numArea > 0) {
                        const pricePerSqM = Math.round(numPrice / numArea);
                        let colorClass = 'text-yellow-500'; // Średnia
                        if (pricePerSqM < 15000) colorClass = 'text-emerald-500'; // Okazja
                        if (pricePerSqM > 22000) colorClass = 'text-red-500'; // Drogo
                        return <span className={\`absolute right-0 top-0 h-full flex items-center pr-4 text-[10px] font-bold uppercase tracking-widest \${colorClass}\`}>{pricePerSqM.toLocaleString('pl-PL')} PLN/m²</span>;
                      }
                      return null;
                    })()}
                  </div>
                  {!data.area && <p className="text-[10px] text-red-500 mt-2 absolute bottom-2 left-6">Podaj metraż (możesz użyć przecinka).</p>}
                </div>

                {/* Pokoje */}
                <div className={inputCardClass}>
                  <label className={labelClass}>Liczba pokoi</label>
                  <input type="text" placeholder="np. 3" className={inputClass} onChange={(e) => updateData({ rooms: e.target.value.replace(/\\D/g, "") })} value={data.rooms || ''} />
                </div>

                {/* Dynamiczne piętro / budynek */}
                {data.propertyType !== 'Działka' && (
                  <div className={inputCardClass}>
                    <label className={labelClass}>{['Dom wolnostojący', 'Segment'].includes(data.propertyType || '') ? 'Ilu piętrowy budynek?' : 'Piętro'}</label>
                    <select className={\`\${inputClass} appearance-none cursor-pointer\`} onChange={(e) => updateData({ floor: e.target.value })} value={data.floor || "0"}>
                      <option className="bg-white dark:bg-black text-black dark:text-white" value="-1">-1 (Suterena / Piwnica)</option>
                      <option className="bg-white dark:bg-black text-black dark:text-white" value="0">0 (Parter)</option>
                      {[...Array(10)].map((_, i) => <option key={i+1} className="bg-white dark:bg-black text-black dark:text-white" value={i+1}>{i+1}</option>)}
                      <option className="bg-white dark:bg-black text-black dark:text-white" value="11+">ponad 10</option>
                    </select>
                  </div>
                )}

                {/* Powierzchnia Działki (Zależna od typu) */}
                {['Dom wolnostojący', 'Segment', 'Działka'].includes(data.propertyType || '') && (
                  <div className={inputCardClass}>
                    <label className={labelClass}>Powierzchnia działki (m²)</label>
                    <input type="text" placeholder="np. 1200" className={inputClass} onChange={(e) => updateData({ plotArea: e.target.value.replace(/[^0-9,]/g, "") })} value={data.plotArea || ''} />
                  </div>
                )}

                {/* Rok budowy */}
                <div className={inputCardClass}>
                  <label className={labelClass}>Rok budowy</label>
                  <input type="text" maxLength={4} placeholder="np. 2024" className={inputClass} onChange={(e) => updateData({ buildYear: e.target.value.replace(/\\D/g, "") })} value={data.buildYear || ''} />
                </div>

              </div>

              {/* Przycisk DALEJ */}
              <div className="pt-8">
                <button 
                  onClick={() => {
                     // Podstawowa walidacja przez przejściem dalej
                     if(!data.title || data.title.length < 10 || !data.price || !data.area) {
                        alert("Uzupełnij wymagane pola zaznaczone na czerwono.");
                        return;
                     }
                     setStep(2);
                  }} 
                  className={\`w-full bg-\${colorAcc}-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-2xl\`}
                >
                  Przejdź dalej <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}`;

// Find the start and end of Step 1 to replace it
const startIndex = content.indexOf('{/* KROK 1 */}');
const endIndex = content.indexOf('{/* KROK 2 */}');

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + newStep1 + '\n\n          ' + content.substring(endIndex);
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('Zaktualizowano Krok 1 pomyślnie!');
} else {
  console.log('Nie udało się znaleźć znaczników KROK 1 lub KROK 2 w pliku.');
}
