"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroDepthEffect() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fadeOutIndicator = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const customEase = [0.16, 1, 0.3, 1] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 1.0, staggerChildren: 0.12 } }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: customEase } }
  };

  const word = "WARSAW";

  return (
    <div ref={ref} className="relative w-full overflow-hidden bg-black h-[100vh]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        <motion.div
          style={{ y: bgY, backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')" }}
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale-[0.5]"
        />
        
        <motion.div style={{ y: textY }} className="relative z-10 text-center pointer-events-none flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2, ease: customEase }}
            className="text-[15vw] md:text-[12vw] font-bold tracking-tighter leading-none text-white drop-shadow-2xl"
          >
            <span className="text-[#10b981]">E</span>state<span className="text-[#10b981]">OS</span>&trade;
          </motion.h1>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex space-x-3 mt-4 md:mt-6 text-white/40 text-lg md:text-2xl tracking-[0.6em] uppercase font-semibold pl-[0.6em]"
          >
            {word.split("").map((char, index) => (
              <motion.span key={index} variants={letterVariants}>{char}</motion.span>
            ))}
          </motion.div>
        </motion.div>
        
        {/* NOWOŚĆ: onMouseEnter i onClick wyzwalające płynny scroll */}
        <motion.div 
          style={{ opacity: fadeOutIndicator }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
          onMouseEnter={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-white/40 cursor-pointer pointer-events-auto hover:text-white transition-colors"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold mb-3 drop-shadow-lg">Odkryj Mapę</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown size={28} className="text-white/60 drop-shadow-lg" />
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
    </div>
  );
}
