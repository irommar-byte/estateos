const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', '[...nextauth]', 'route.ts');

try {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  
  // Weryfikacja, czy w linii 32 (indeks 31) znajduje się ten zbędny znak
  if (lines[31].trim() === '}') {
      lines.splice(31, 1); // Wycięcie zepsutej linii
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log("✅ Usunięto zbędny nawias z linii 32 w pliku route.ts.");
  } else {
      // Fallback, gdyby linie się przesunęły
      let code = fs.readFileSync(filePath, 'utf8');
      code = code.replace(/}\s*}\s*}\),/g, "}\n    }),");
      fs.writeFileSync(filePath, code);
      console.log("✅ Naprawiono strukturę nawiasów przy użyciu wzorca.");
  }
} catch (e) {
  console.error("❌ Błąd naprawy pliku:", e.message);
}
