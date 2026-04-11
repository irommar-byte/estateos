const fs = require('fs');
const path = require('path');

console.log("=== USUWANIE BŁĘDU TYPESCRIPT W CRM ===");

const crmPath = path.join(process.cwd(), 'src', 'app', 'moje-konto', 'crm', 'page.tsx');

try {
  let crmCode = fs.readFileSync(crmPath, 'utf8');
  
  // Usuwamy problematyczny blok z setMode, który blokuje kompilator
  const blockToRemove = /\/\/\s*Jeśli jest dostępny setter z kontekstu[\s\S]*?setMode\(currentMode\);\s*\}/g;
  const fallbackRemove = /if\s*\(\s*typeof\s*setMode\s*===\s*'function'\s*\)\s*\{[\s\S]*?\}/g;

  if (blockToRemove.test(crmCode)) {
      crmCode = crmCode.replace(blockToRemove, '');
      fs.writeFileSync(crmPath, crmCode);
      console.log("✅ Usunięto niezadeklarowane odwołanie do setMode.");
  } else if (fallbackRemove.test(crmCode)) {
      crmCode = crmCode.replace(fallbackRemove, '');
      fs.writeFileSync(crmPath, crmCode);
      console.log("✅ Usunięto odwołanie do setMode (fallback).");
  } else {
      console.log("⚠️ Nie znaleziono bloku do usunięcia. Być może został już naprawiony.");
  }
} catch (e) {
  console.error("❌ Błąd modyfikacji CRM:", e.message);
}
