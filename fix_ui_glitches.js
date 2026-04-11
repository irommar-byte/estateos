const fs = require('fs');
const path = require('path');

console.log("=== NAPRAWA BŁYSKU ANIMACJI I UKŁADU NAVBARA ===");

// 1. NAPRAWA MODE TRANSITION (Twarda blokada przy odświeżaniu F5)
const transitionPath = path.join(process.cwd(), 'src', 'components', 'ui', 'ModeTransition.tsx');
try {
  const safeTransition = `
'use client';
import { useEffect, useState, useRef } from 'react';
import { useUserMode } from '@/contexts/UserModeContext';

export default function ModeTransition() {
  const { mode } = useUserMode();
  const [visible, setVisible] = useState(false);
  const [displayMode, setDisplayMode] = useState(mode);
  
  // Referencje do śledzenia pierwszego ładowania
  const isInitialMount = useRef(true);
  const prevMode = useRef(mode);

  useEffect(() => {
    // 1. Ochrona przed F5: Ignorujemy pierwsze załadowanie komponentu
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevMode.current = mode;
      return;
    }

    // 2. Uruchamiamy animację TYLKO jeśli tryb fizycznie się zmienił (np. po kliknięciu)
    if (mode && mode !== prevMode.current) {
      setDisplayMode(mode);
      setVisible(true);
      prevMode.current = mode;

      const timeout = setTimeout(() => {
        setVisible(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [mode]);

  if (!visible || !displayMode) return null;

  const config = {
    BUYER: { title: "INWESTOR", subtitle: "Analiza rynku • Wyszukiwanie okazji • Synchronizacja danych" },
    SELLER: { title: "WŁAŚCICIEL", subtitle: "Zarządzanie ofertami • Publikacja • Optymalizacja widoczności" },
    AGENCY: { title: "PARTNER", subtitle: "Dostęp do bazy klientów • CRM • Narzędzia profesjonalne" }
  };

  const current = config[displayMode as keyof typeof config];

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl animate-in fade-in duration-300" />
      <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
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
  fs.writeFileSync(transitionPath, safeTransition.trim());
  console.log("✅ Animacja naprawiona: 'Błysk Inwestora' po wciśnięciu F5 wyeliminowany.");
} catch(e) { console.error("❌ Błąd Transition:", e.message); }

// 2. NAPRAWA NAVBARA (Usunięcie nakładania się elementów)
const navbarPath = path.join(process.cwd(), 'src', 'components', 'layout', 'Navbar.tsx');
try {
  let code = fs.readFileSync(navbarPath, 'utf8');

  // Usuwamy brutalne "absolute" i zamieniamy na elastyczny "flex-1", który sam robi miejsce
  code = code.replace(/className="absolute left-1\/2 -translate-x-1\/2 flex flex-col items-center z-\[100\] top-1 md:top-2"/g, 
                      'className="flex-1 flex justify-center items-center z-[100] min-w-max px-2 md:px-8"');
  
  // Jeśli wcześniej narzuciliśmy sztywny padding z lewej (pl-[300px]), usuwamy go, bo gniecie layout
  code = code.replace(/pl-\[300px\]/g, 'pl-2 lg:pl-8');

  fs.writeFileSync(navbarPath, code);
  console.log("✅ Navbar naprawiony: Zastosowano bezpieczny układ Flexbox chroniący przed nakładaniem.");
} catch(e) { console.error("❌ Błąd Navbar:", e.message); }

console.log("=== GOTOWE ===");
