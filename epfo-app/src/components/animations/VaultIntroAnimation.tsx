import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';

export const VaultIntroAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-2 select-none">
      {/* Clean Minimalist Shield with Gentle Breathing Glow */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Soft subtle breathing pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-emerald-500/10 border border-emerald-500/20"
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.25, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Crisp Central Icon Badge */}
        <motion.div 
          className="relative z-10 w-16 h-16 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </motion.div>

        {/* Small subtle security lock badge */}
        <div className="absolute bottom-0 right-0 z-20 bg-slate-900 text-emerald-400 p-1 rounded-full border-2 border-white shadow-2xs">
          <Lock className="w-3 h-3" />
        </div>
      </div>

      {/* Minimal clean verified badge */}
      <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-emerald-50/90 border border-emerald-100 rounded-full text-[11px] font-semibold text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        DigiLocker Certified Vault
      </div>
    </div>
  );
};
