const fs = require('fs');
const path = require('path');

console.log("=== WDRAŻANIE KINOWYCH ANIMACJI I BRAMKI PŁATNOŚCI ===");

// 1. WSTRZYKNIĘCIE TRANSITION DO LAYOUTU
const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
    let code = fs.readFileSync(layoutPath, 'utf8');
    
    if (!code.includes('ModeTransition')) {
        code = "import ModeTransition from '@/components/ui/ModeTransition';\n" + code;
        code = code.replace('</body>', '  <ModeTransition />\n      </body>');
        fs.writeFileSync(layoutPath, code);
        console.log("✅ Wpięto ModeTransition do layout.tsx (animacja w końcu ma gdzie się pokazać).");
    } else {
        console.log("ℹ️ ModeTransition był już w layoucie.");
    }
}

// 2. ULTRAPREMIUM MODE TRANSITION (Apple Cinematic Style)
const transitionPath = path.join(process.cwd(), 'src', 'components', 'ui', 'ModeTransition.tsx');
const luxuryTransition = `
'use client';
import { useEffect, useState } from 'react';
import { useUserMode } from '@/contexts/UserModeContext';

export default function ModeTransition() {
  const { mode } = useUserMode();
  const [visible, setVisible] = useState(false);
  const [displayMode, setDisplayMode] = useState(mode);

  useEffect(() => {
    setDisplayMode(mode);
    setVisible(true);
    // Kinowy czas trwania: 1.5 sekundy
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [mode]);

  if (!visible) return null;

  const config = {
    BUYER: { title: "INWESTOR", subtitle: "Analiza rynku • Wyszukiwanie okazji • Synchronizacja" },
    SELLER: { title: "WŁAŚCICIEL", subtitle: "Zarządzanie ofertami • Publikacja • Optymalizacja" },
    AGENCY: { title: "PARTNER", subtitle: "Baza klientów PRO • System CRM • Narzędzia Agencji" }
  };

  const current = config[displayMode as keyof typeof config];

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none">
      {/* Ciemne szkło tła */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300" />
      
      {/* Centralny pulsujący blask */}
      <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />

      {/* Główna treść */}
      <div className="relative text-center text-white px-6 animate-in zoom-in-95 duration-700 ease-out">
        <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-emerald-400 mb-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
          System EstateOS™
        </div>
        <div className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
          Tryb {current.title}
        </div>
        <div className="text-sm md:text-base font-medium tracking-widest text-white/40 uppercase">
          {current.subtitle}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(transitionPath, luxuryTransition.trim());
console.log("✅ Wdrożono nowy, kinowy styl dla ModeTransition.");

// 3. UPGRADE MODALU I PODPIĘCIE STRIPE (Jaskrawy przycisk + API)
const modalPath = path.join(process.cwd(), 'src', 'components', 'ui', 'UpgradeModal.tsx');
if (fs.existsSync(modalPath)) {
    let code = fs.readFileSync(modalPath, 'utf8');
    
    // Dodanie stanu ładowania i funkcji płatności
    if (!code.includes('const handlePayment')) {
        code = code.replace(/export default function UpgradeModal\(\) \{/, 
`import { useState } from 'react';\n\nexport default function UpgradeModal() {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: upgradeModalType })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };`
        );
    }

    // Podmiana nudnego przycisku na jaskrawy, szmaragdowy przycisk kasy
    const oldBtnRegex = /<button className="w-full py-4 bg-white text-black[^>]*>[\s\S]*?<\/button>/;
    const newBtn = `
            <button 
              onClick={handlePayment} 
              disabled={isLoading}
              className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(52,211,153,0.8)] disabled:opacity-50"
            >
              <Zap size={18} className="fill-black" /> 
              {isLoading ? 'Łączenie z bramką...' : 'Opłać pakiet teraz'}
            </button>
    `;
    code = code.replace(oldBtnRegex, newBtn.trim());
    fs.writeFileSync(modalPath, code);
    console.log("✅ Modal zaktualizowany: Jaskrawy przycisk + integracja ze Stripe Checkout dodana.");
}

console.log("=== GOTOWE ===");
