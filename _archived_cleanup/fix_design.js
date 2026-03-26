const fs = require('fs');

function replaceInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
  }
}

// A. Naprawa uciętych marginesów na stronach (dodajemy pt-32 do pt-40)
const paddingRegex = /className="min-h-screen bg-\[#050505\] text-white p-8 md:p-16"/g;
const paddingFix = 'className="min-h-screen bg-[#050505] text-white p-6 pt-32 md:p-16 md:pt-40"';
replaceInFile('src/app/centrala/page.tsx', paddingRegex, paddingFix);
replaceInFile('src/app/moje-konto/page.tsx', paddingRegex, paddingFix);

// B. Naprawa znikających (czarnych) tekstów po najechaniu myszką w Navbarze
if (fs.existsSync('src/components/layout/Navbar.tsx')) {
  let nav = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
  // Zamienia wszystkie czarne hovery na piękny, szmaragdowy kolor premium
  nav = nav.replace(/hover:text-black/g, 'hover:text-emerald-400');
  fs.writeFileSync('src/components/layout/Navbar.tsx', nav);
}
