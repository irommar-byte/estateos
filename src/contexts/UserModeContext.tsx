'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Wallet, Radar, Key, Sparkles } from 'lucide-react';

type UserMode = 'BUYER' | 'SELLER';

interface UserModeContextType {
  mode: UserMode;
  toggleMode: () => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<UserMode>('BUYER');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetMode, setTargetMode] = useState<UserMode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('estateos_user_mode') as UserMode;
    if (saved) setMode(saved);
  }, []);

  const toggleMode = () => {
    if (isTransitioning) return; // Zabezpieczenie przed spamowaniem kliknięć
    const nextMode = mode === 'BUYER' ? 'SELLER' : 'BUYER';
    setTargetMode(nextMode);
    setIsTransitioning(true);

    // W połowie animacji (1 sekunda) w tle podmieniamy dane CRM
    setTimeout(() => {
      setMode(nextMode);
      localStorage.setItem('estateos_user_mode', nextMode);
    }, 1000);

    // Zdejmujemy szklaną kurtynę po pełnych 2 sekundach luksusowej animacji
    setTimeout(() => {
      setIsTransitioning(false);
      setTargetMode(null);
    }, 2200);
  };

  // Zmienne tematyczne dla animacji
  const isInvestor = targetMode === 'BUYER';
  const themeColor = isInvestor ? 'text-emerald-400' : 'text-amber-400';
  const glowColor = isInvestor ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.3)';
  const bgGradient = isInvestor ? 'from-emerald-900/20 to-black' : 'from-amber-900/20 to-black';

  return (
    <UserModeContext.Provider value={{ mode, toggleMode }}>
      {children}
      
      {/* 🔥 OVERPRICE ANIMATION: Szklana Kurtyna Premium 🔥 */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(60px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/70 bg-gradient-to-b ${bgGradient} overflow-hidden`}
          >
            {/* Tło - Pulsujące kule świetlne */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div 
                className="w-[800px] h-[800px] rounded-full blur-[120px]" 
                style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
              />
            </motion.div>

            {/* Główny kontener animacji z fizyką Spring */}
            <motion.div
              initial={{ scale: 0.5, y: 100, rotateX: 45, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
              className="relative text-center z-10 perspective-1000"
            >
              {/* Ikony w zależności od trybu */}
              <div className="relative flex justify-center items-center mb-8">
                {isInvestor ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <Radar size={120} className={themeColor} strokeWidth={1} />
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 border border-emerald-500/50 rounded-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: -20 }} animate={{ y: 0 }} 
                    transition={{ type: "spring", stiffness: 300, bounce: 0.7 }}
                    className="relative"
                  >
                    <Building size={120} className={themeColor} strokeWidth={1} />
                    <Sparkles size={40} className={`absolute -top-4 -right-4 ${themeColor} animate-pulse`} />
                  </motion.div>
                )}
              </div>

              {/* Typografia Premium */}
              <motion.h2 
                initial={{ letterSpacing: "0em", opacity: 0 }}
                animate={{ letterSpacing: "0.2em", opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="text-3xl md:text-5xl font-black text-white uppercase mb-4 drop-shadow-2xl"
              >
                Przestrzeń <span className={themeColor}>{isInvestor ? 'Inwestora' : 'Właściciela'}</span>
              </motion.h2>

              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-3 text-white/50 text-sm font-semibold tracking-widest uppercase"
              >
                <div className="w-4 h-4 rounded-full border-t-2 border-l-2 border-white animate-spin" />
                {isInvestor ? 'Kalibracja radaru ofert...' : 'Skanowanie bazy kupców...'}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </UserModeContext.Provider>
  );
}

export const useUserMode = () => {
  const context = useContext(UserModeContext);
  if (!context) throw new Error('useUserMode must be used within a UserModeProvider');
  return context;
};
