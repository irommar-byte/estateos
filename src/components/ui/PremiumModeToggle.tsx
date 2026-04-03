'use client';

import React from 'react';
import { useUserMode } from '@/contexts/UserModeContext';
import { Building, Wallet, Briefcase } from 'lucide-react';

export default function PremiumModeToggle({ currentUser }: { currentUser?: any }) {
  const { mode, selectMode, forceMode } = useUserMode();

  return (
    <div className="flex flex-col items-center justify-center pointer-events-auto relative z-50 w-full max-w-[600px] mx-auto">
      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        Wybór Przestrzeni Pracy
      </span>
      
      {/* KONTENER PRZYCISKÓW */}
      <div className="flex flex-row gap-2 sm:gap-3 items-stretch justify-center w-full">
        
        {/* PRZYCISK 1: INWESTOR */}
        <button 
          onClick={() => currentUser?.isPro ? selectMode('BUYER', currentUser) : forceMode('BUYER')} 
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 sm:px-4 rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] transition-all duration-300 border shadow-lg cursor-pointer
            ${mode === 'BUYER' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105 z-10' : 'bg-[#0a0a0a] border-white/10 text-white/40 hover:border-white/30 hover:bg-[#111] hover:text-white/80'}`}
        >
          <Wallet size={18} className="shrink-0" />
          <span className="whitespace-nowrap mt-0.5 sm:mt-0">Inwestor</span>
        </button>

        {/* PRZYCISK 2: PARTNER (AGENCJA) */}
        <button 
          onClick={() => currentUser?.role === 'AGENCY' ? selectMode('AGENCY', currentUser) : selectMode('AGENCY', currentUser)} 
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 sm:px-4 rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] transition-all duration-300 border shadow-lg cursor-pointer
            ${mode === 'AGENCY' ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105 z-10' : 'bg-[#0a0a0a] border-white/10 text-white/40 hover:border-white/30 hover:bg-[#111] hover:text-white/80'}`}
        >
          <Briefcase size={18} className="shrink-0" />
          <span className="whitespace-nowrap mt-0.5 sm:mt-0">Partner</span>
        </button>

        {/* PRZYCISK 3: WŁAŚCICIEL */}
        <button 
          onClick={() => currentUser?.isPro ? selectMode('SELLER', currentUser) : forceMode('SELLER')} 
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 sm:px-4 rounded-2xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] transition-all duration-300 border shadow-lg cursor-pointer
            ${mode === 'SELLER' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105 z-10' : 'bg-[#0a0a0a] border-white/10 text-white/40 hover:border-white/30 hover:bg-[#111] hover:text-white/80'}`}
        >
          <Building size={18} className="shrink-0" />
          <span className="whitespace-nowrap mt-0.5 sm:mt-0">Właściciel</span>
        </button>

      </div>
    </div>
  );
}
