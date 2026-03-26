const fs = require('fs');

['src/app/dodaj-oferte/page.tsx', 'src/app/edytuj-oferte/[id]/page.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Wyrzucamy wszystko co było związane ze zmiennymi klasami 
    content = content.replace(/const getBtnClass = \(\) => [^;]*;/g, `
    const getBtnClass = () => {
      const base = "w-full py-6 rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:bg-[#151515] disabled:text-[#888888] disabled:border disabled:border-[#2a2a2a] disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group ";
      const active = isAgency ? "bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)]" : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]";
      return base + active;
    };
    `);
    
    fs.writeFileSync(file, content);
  }
});
