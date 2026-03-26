'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useUserMode } from '@/contexts/UserModeContext';
import { Building, Wallet } from 'lucide-react';

export default function PremiumModeToggle() {
  const { mode, toggleMode } = useUserMode();

  return (
    <div 
      onClick={toggleMode}
      className="relative flex items-center w-64 h-12 bg-[#111] rounded-full p-1 cursor-pointer border border-white/10 overflow-hidden"
    >
      {/* Przesuwające się tło (Pigułka) */}
      <motion.div
        className="absolute w-[calc(50%-4px)] h-[calc(100%-8px)] bg-[#10b981]/20 border border-[#10b981]/50 rounded-full"
        animate={{
          left: mode === 'BUYER' ? '4px' : 'calc(50% + 0px)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {/* Przycisk Inwestor */}
      <div className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs font-semibold tracking-wider transition-colors duration-300 ${mode === 'BUYER' ? 'text-[#10b981]' : 'text-gray-500'}`}>
        <Wallet size={14} />
        INWESTOR
      </div>

      {/* Przycisk Właściciel */}
      <div className={`relative z-10 flex-1 flex items-center justify-center gap-2 text-xs font-semibold tracking-wider transition-colors duration-300 ${mode === 'SELLER' ? 'text-[#10b981]' : 'text-gray-500'}`}>
        <Building size={14} />
        WŁAŚCICIEL
      </div>
    </div>
  );
}
