const fs = require('fs');
const path = require('path');

console.log("=== AWARYJNE USUWANIE BŁĘDU (TS FATAL FIX) ===");

const crmPath = path.join(process.cwd(), 'src', 'app', 'moje-konto', 'crm', 'page.tsx');

try {
  let code = fs.readFileSync(crmPath, 'utf8');

  // 1. CAŁKOWITE USUNIĘCIE BŁĘDNEGO BLOKU (który szukał nieistniejących zmiennych)
  code = code.replace(/\/\/ --- DIRECT GLUE:[\s\S]*?\/\/ --------------------------------------------------------------------------/g, '');

  // 2. CZYSTA, BEZPIECZNA INIEKCJA TYLKO STANU UI (Gwarancja 0 błędów TS)
  const safeGlue = `
  // --- DIRECT GLUE (SAFE UI SYNC) ---
  const [localMode, setLocalMode] = useState(typeof window !== 'undefined' ? localStorage.getItem('estateos_user_mode') || 'BUYER' : 'BUYER');
  useEffect(() => {
      const handleModeSync = () => {
          const current = localStorage.getItem('estateos_user_mode') || 'BUYER';
          if (current !== localMode) {
              setLocalMode(current);
          }
      };
      window.addEventListener('userModeChanged', handleModeSync);
      return () => window.removeEventListener('userModeChanged', handleModeSync);
  }, [localMode]);
  // ----------------------------------
  `;

  // Wstrzyknięcie bezpiecznie pod useUserMode, aby mieć pewność, że to środek komponentu
  if (code.includes('useUserMode()')) {
      code = code.replace(/(const\s+\{[^}]*mode[^}]*\}\s*=\s*useUserMode\(\)[^;]*;)/, `$1\n${safeGlue}`);
      fs.writeFileSync(crmPath, code);
      console.log("✅ Toksyczny kod usunięty. Bezpieczny synchronizator wdrożony.");
  } else {
      console.log("⚠️ Nie znaleziono useUserMode(). Szukam alternatywy...");
      code = code.replace(/(const \[mounted,\s*setMounted\]\s*=\s*useState[^;]+;)/, `$1\n${safeGlue}`);
      fs.writeFileSync(crmPath, code);
      console.log("✅ Wdrożono fallback synchronizatora.");
  }

} catch(e) {
  console.error("❌ Błąd krytyczny:", e.message);
}
