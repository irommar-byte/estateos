"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Menu, X, Home, Building2, PlusCircle, Shield, LogIn, Search, Crown, ChevronUp } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => { if (!data.error) setUser(data); })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("luxestate_user");
    window.location.href = "/login";
  };

  const handleNavClick = (path: string, isMap = false) => {
    if (isMap) {
      if (pathname === '/') document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else router.push('/#map');
    } else {
      router.push(path);
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div onClick={() => router.push('/')} className="cursor-pointer group flex-shrink-0 relative z-20">
          <span className="text-xl font-black tracking-tighter text-white uppercase italic transition-all group-hover:text-emerald-500">
            <span className="text-[#10b981]">E</span>state<span className="text-[#10b981]">OS</span>&trade;
          </span>
        </div>

        {/* CENTRALNY iOS SEGMENTED CONTROL */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center z-10">
          <div className="flex bg-[#111] border border-white/5 rounded-full p-1 shadow-inner w-[240px] sm:w-[280px]">
            <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#0a0a0a] border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${pathname === '/dodaj-oferte' ? 'translate-x-[calc(100%+4px)]' : (pathname === '/szukaj' ? 'translate-x-0' : 'opacity-0 scale-95')}`}></div>
            
            <button onClick={() => handleNavClick('/szukaj')} className={`relative z-10 flex-1 py-2 sm:py-2.5 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 text-center ${pathname === '/szukaj' ? 'text-emerald-400' : 'text-white/40 hover:text-white/80'}`}>
              Kup
            </button>
            
            <button onClick={() => handleNavClick('/dodaj-oferte')} className={`relative z-10 flex-1 py-2 sm:py-2.5 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 text-center ${pathname === '/dodaj-oferte' ? 'text-emerald-400' : 'text-white/40 hover:text-white/80'}`}>
              Sprzedaj
            </button>
          </div>

          {/* Animowana wskazówka */}
          <AnimatePresence>
            {!isScrolled && pathname === '/' && (
              <motion.div 
                initial={{ opacity: 0, y: 300, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                transition={{ delay: 0.8, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-[130%] flex flex-col items-center pointer-events-none drop-shadow-2xl"
              >
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mb-1.5 mt-2">
                  <ChevronUp size={16} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]" />
                </motion.div>
                <span className="text-[8.5px] font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                  Określ swój cel
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center justify-between flex-1 ml-10">
            
            {/* EKSPLORACJA */}
            <div className="flex items-center gap-6">
               <button onClick={() => handleNavClick('/', true)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all flex items-center gap-2">
                 Odkryj
               </button>
               <button onClick={() => handleNavClick('/oferty')} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all flex items-center gap-2">
                 Rynek
               </button>
            </div>

            {/* STREFA BIZNESOWA & KONTO */}
            <div className="flex items-center gap-5">
               {/* Nowy Złoty Przycisk Cennika */}
               <button onClick={() => handleNavClick('/cennik')} className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-[#FFF0AA] transition-colors flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                  <Crown size={14} className="mb-[1px]"/> Cennik PRO
               </button>
               
               <div className="h-4 w-[1px] bg-white/10 mx-1" />
               <NotificationCenter />
               
               {user ? (
                 <div className="flex items-center gap-4 ml-1">
                   <button 
                     onClick={() => router.push(user.role === 'ADMIN' ? '/centrala' : '/moje-konto/crm')}
                     style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
                     className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                   >
                     {user.role === 'ADMIN' ? 'Centrala' : 'Konto CRM'}
                   </button>
                   <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
                 </div>
               ) : (
                 <button 
                   onClick={() => router.push('/login')}
                   className="text-[10px] font-black uppercase tracking-widest text-white hover:text-emerald-500 transition-colors flex items-center gap-2 ml-1"
                 >
                   Zaloguj <LogIn size={14} />
                 </button>
               )}
            </div>
        </div>

        {/* WYZWALACZ MOBILNY */}
        <div className="flex items-center gap-4 lg:hidden relative z-20">
          <NotificationCenter />
          <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 hover:text-emerald-500 transition-colors">
             {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILNE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0, y: -20 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -20 }} className="lg:hidden bg-[#0a0a0a] border-b border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 flex flex-col gap-8">
              
              {/* MOBILE iOS SEGMENTED CONTROL */}
              <div className="relative flex w-full bg-[#111] border border-white/5 rounded-2xl p-1.5 shadow-inner">
                <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-[#0a0a0a] border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${pathname === '/dodaj-oferte' ? 'translate-x-[calc(100%+4px)]' : (pathname === '/szukaj' ? 'translate-x-0' : 'opacity-0 scale-95')}`}></div>
                <button onClick={() => handleNavClick('/szukaj')} className={`relative z-10 flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${pathname === '/szukaj' ? 'text-emerald-400' : 'text-white/40 hover:text-white/80'}`}>Znajdź Nieruchomość</button>
                <button onClick={() => handleNavClick('/dodaj-oferte')} className={`relative z-10 flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${pathname === '/dodaj-oferte' ? 'text-emerald-400' : 'text-white/40 hover:text-white/80'}`}>Sprzedaj Nieruchomość</button>
              </div>

              <div className="space-y-6 px-2">
                <button onClick={() => handleNavClick('/', true)} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all w-full text-left"><Home size={18} className="text-gray-600"/> Odkryj Mapę</button>
                <button onClick={() => handleNavClick('/oferty')} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all w-full text-left"><Building2 size={18} className="text-gray-600"/> Rynek Nieruchomości</button>
                <button onClick={() => handleNavClick('/cennik')} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[#D4AF37] hover:text-[#FFF0AA] w-full text-left"><Crown size={18}/> Cennik PRO</button>
              </div>

              <div className="h-[1px] bg-white/5" />

              <div className="space-y-6 px-2">
                {user ? (
                  <>
                    <button onClick={() => handleNavClick(user.role === 'ADMIN' ? '/centrala' : '/moje-konto/crm')} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-emerald-500 w-full text-left"><Shield size={18} /> {user.role === 'ADMIN' ? 'Zarządzaj (Centrala)' : 'Konto CRM'}</button>
                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-red-500/70 w-full text-left"><LogOut size={18} /> Wyloguj</button>
                  </>
                ) : (
                  <button onClick={() => handleNavClick('/login')} style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }} className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-emerald-500 w-full text-left p-4 rounded-2xl"><User size={18} /> Zaloguj do Systemu</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
