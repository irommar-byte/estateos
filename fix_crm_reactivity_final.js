const fs = require('fs');
const path = require('path');

console.log("=== OSTATECZNA NAPRAWA REAKTYWNOŚCI CRM ===");

// 1. Dodanie nadajnika do wszystkich miejsc zmieniających tryb w Kontekście
const ctxPath = path.join(process.cwd(), 'src', 'contexts', 'UserModeContext.tsx');
try {
  let ctxCode = fs.readFileSync(ctxPath, 'utf8');
  const targetStr = 'localStorage.setItem("estateos_user_mode", newMode);';
  
  // Zabezpieczenie przed podwójnym dodaniem
  if (!ctxCode.includes('window.dispatchEvent(new Event("userModeChanged"));')) {
      const replacement = targetStr + '\n      if (typeof window !== "undefined") window.dispatchEvent(new Event("userModeChanged"));';
      ctxCode = ctxCode.split(targetStr).join(replacement);
      fs.writeFileSync(ctxPath, ctxCode);
      console.log("✅ [1/2] Nadajnik sygnału wpięty pod każdą zmianę trybu (w tym selectMode).");
  } else {
      console.log("✅ [1/2] Nadajnik sygnału był już obecny (naprawiamy natywnego Reacta).");
  }
} catch(e) { console.error("❌ Błąd Kontekstu:", e.message); }

// 2. Dodanie twardego nasłuchu React na zmienną "mode" w CRM
const crmPath = path.join(process.cwd(), 'src', 'app', 'moje-konto', 'crm', 'page.tsx');
try {
  let crmCode = fs.readFileSync(crmPath, 'utf8');
  
  const reactEffect = `
  // --- NATIVE REACT: Wymuszenie pobrania danych przy zmianie trybu ---
  useEffect(() => {
    const uid = currentUser?.id || (typeof user !== 'undefined' ? user?.id : null);
    if (uid && typeof fetchData === 'function') {
      fetchData(uid);
    }
    if (typeof fetchRadarData === 'function') {
      fetchRadarData();
    }
  }, [mode]);
  // -------------------------------------------------------------------
  `;

  // Szukamy odpowiedniego miejsca do wstrzyknięcia (np. przed zamknięciem głównego komponentu lub po innych useEffectach)
  if (!crmCode.includes('NATIVE REACT: Wymuszenie pobrania')) {
      // Bezpieczne wstrzyknięcie po deklaracji fetchData (lub blisko początku komponentu)
      crmCode = crmCode.replace(/(const fetchData = async[^\}]+\};)/, `$1\n${reactEffect}`);
      fs.writeFileSync(crmPath, crmCode);
      console.log("✅ [2/2] Wdrożono natywny, niezawodny nasłuch React (mode dependency) w CRM.");
  } else {
      console.log("✅ [2/2] Nasłuch React był już wdrożony.");
  }
} catch(e) { console.error("❌ Błąd CRM:", e.message); }

console.log("=== GOTOWE ===");
