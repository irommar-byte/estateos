const fs = require('fs');
const path = 'src/app/centrala/oferty/page.tsx';

if (fs.existsSync(path)) {
  let code = fs.readFileSync(path, 'utf8');

  // 1. CHIRURGICZNA ZMIANA PRZYCISKÓW (Biały tekst, Szmaragdowy hover, widoczny Długopis)
  const oldBtnRegex = /<div className="flex gap-3">[\s\S]*?<\/button>\s*<\/div>/;
  const newBtns = `<div className="flex gap-3">
                  <button onClick={() => handleUpdateStatus(selectedOffer.id, selectedOffer.status === 'active' ? 'pending' : 'active')} className={\`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border \${selectedOffer.status === 'active' ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10' : 'border-white/20 text-white hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 shadow-lg'}\`}>
                    {selectedOffer.status === 'active' ? 'Cofnij Publikację' : 'Aktywuj Ofertę'}
                  </button>
                  <button onClick={() => router.push(\`/edytuj-oferte/\${selectedOffer.id}?from=admin\`)} className="p-5 border border-white/20 text-white hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all flex items-center justify-center group shadow-lg">
                    <Edit3 size={20} className="group-hover:rotate-12 transition-transform"/>
                  </button>
                </div>`;
  
  code = code.replace(oldBtnRegex, newBtns);

  // 2. CHIRURGICZNA ZMIANA WŁAŚCICIELA (Prywatny/Agencja + Link do profilu)
  const oldOwnerStr = `<User size={16}/> Właściciel: <span className="text-white ml-auto">{selectedOffer.userEmail || 'Anonim'}</span>`;
  const newOwnerStr = `<User size={16}/> Właściciel: <Link href="/centrala/uzytkownicy" className="text-white hover:text-emerald-500 transition-colors ml-auto flex items-center gap-2">{selectedOffer.advertiserType === 'agency' ? 'Agencja' : 'Prywatny'} <span className="text-[9px] bg-white/10 px-2 py-1 rounded">Profil ➔</span></Link>`;
  
  code = code.replace(oldOwnerStr, newOwnerStr);

  fs.writeFileSync(path, code);
  console.log('✅ Zaktualizowano przyciski i właściciela chirurgicznie. Reszta pliku nietknięta.');
} else {
  console.log('❌ Nie znaleziono pliku centrala/oferty/page.tsx');
}
