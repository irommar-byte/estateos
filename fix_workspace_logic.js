const fs = require('fs');
const path = require('path');

console.log("=== ROZPOCZYNAM NAPRAWĘ LOGIKI I USUWANIE DUPLIKATÓW ===");

// 1. Usunięcie duplikatu z CRM
const crmPath = path.join(process.cwd(), 'src', 'app', 'moje-konto', 'crm', 'page.tsx');
try {
  if (fs.existsSync(crmPath)) {
    let crmCode = fs.readFileSync(crmPath, 'utf8');
    crmCode = crmCode.replace(/import PremiumModeToggle.*?;?\n/, '');
    crmCode = crmCode.replace(/<PremiumModeToggle\s*\/?>(<\/PremiumModeToggle>)?/g, '');
    fs.writeFileSync(crmPath, crmCode);
    console.log("✅ [1/3] Usunięto duplikat przełącznika z panelu CRM.");
  }
} catch (e) {
  console.error("❌ Błąd usuwania duplikatu:", e.message);
}

// 2. Naprawa logiki wywoływania modali w przełączniku
const togglePath = path.join(process.cwd(), 'src', 'components', 'ui', 'PremiumModeToggle.tsx');
try {
  if (fs.existsSync(togglePath)) {
    let toggleCode = fs.readFileSync(togglePath, 'utf8');
    
    // Zmiana błędnych warunków omijających weryfikację na twarde żądanie weryfikacji
    toggleCode = toggleCode.replace(/onClick=\{\(\)\s*=>\s*currentUser\?\.isPro\s*\?\s*selectMode\('BUYER',\s*currentUser\)\s*:\s*forceMode\('BUYER'\)\}/g, "onClick={() => selectMode('BUYER', currentUser)}");
    toggleCode = toggleCode.replace(/onClick=\{\(\)\s*=>\s*currentUser\?\.role\s*===\s*'AGENCY'\s*\?\s*selectMode\('AGENCY',\s*currentUser\)\s*:\s*selectMode\('AGENCY',\s*currentUser\)\}/g, "onClick={() => selectMode('AGENCY', currentUser)}");
    toggleCode = toggleCode.replace(/onClick=\{\(\)\s*=>\s*currentUser\?\.isPro\s*\?\s*selectMode\('SELLER',\s*currentUser\)\s*:\s*forceMode\('SELLER'\)\}/g, "onClick={() => selectMode('SELLER', currentUser)}");
    
    fs.writeFileSync(togglePath, toggleCode);
    console.log("✅ [2/3] Wymuszono twardą weryfikację modali dla wszystkich trzech trybów.");
  }
} catch (e) {
  console.error("❌ Błąd naprawy PremiumModeToggle:", e.message);
}

// 3. Dodanie natychmiastowego odświeżania danych do UserModeContext
const contextPath = path.join(process.cwd(), 'src', 'contexts', 'UserModeContext.tsx');
try {
  if (fs.existsSync(contextPath)) {
    let contextCode = fs.readFileSync(contextPath, 'utf8');
    const forceModeRegex = /const forceMode = \(newMode: UserMode\) => \{([\s\S]*?)\};/;
    const match = forceModeRegex.exec(contextCode);
    
    if (match && !match[1].includes('window.location.reload()')) {
        const newForceMode = `const forceMode = (newMode: UserMode) => {${match[1]}
    // HOTFIX: Wymuszenie natychmiastowego przeładowania danych po zmianie trybu
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("userModeChanged"));
      window.location.reload();
    }
  };`;
        contextCode = contextCode.replace(forceModeRegex, newForceMode);
        fs.writeFileSync(contextPath, contextCode);
        console.log("✅ [3/3] Wdrożono natychmiastowe odświeżanie strony (Auto-Refresh) po udanej zmianie trybu.");
    }
  }
} catch (e) {
  console.error("❌ Błąd naprawy UserModeContext:", e.message);
}

console.log("=== GOTOWE ===");
