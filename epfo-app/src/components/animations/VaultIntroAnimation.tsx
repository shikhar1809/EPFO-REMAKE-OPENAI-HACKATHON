import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export const VaultIntroAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 select-none bg-transparent">
      {/* Premium 3D Animated Vault */}
      <motion.div
        className="relative flex items-center justify-center w-36 h-36 mb-4 perspective-[800px]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [-5, 5, -5] }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.6 },
          opacity: { duration: 0.6 }
        }}
      >
        {/* Soft Background Radial Light */}
        <div className="absolute w-56 h-56 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Outer Vault Shell (Metallic Gradient) */}
        <div className="relative w-full h-full bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 rounded-2xl p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-t border-slate-300">
          
          {/* Inside of Vault (Dark Depth) */}
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black rounded-xl shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] overflow-hidden relative border-2 border-slate-600 flex items-center justify-center">
             
             {/* Glowing Grid Background inside Vault */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0%,transparent_70%)]" />
             
             {/* Glowing Documents */}
             <motion.div
               animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1, 0.95] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-10"
             >
                <div className="relative w-12 h-16 bg-white rounded-md shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-slate-200 flex flex-col items-center pt-3 gap-1.5 rotate-[-5deg]">
                  <div className="w-[70%] h-1 bg-blue-500/50 rounded-full" />
                  <div className="w-[85%] h-1 bg-slate-300 rounded-full" />
                  <div className="w-[60%] h-1 bg-slate-300 rounded-full" />
                  <ShieldCheck className="w-6 h-6 text-green-500 mt-1 drop-shadow-md" />
                </div>
             </motion.div>
          </div>

          {/* Vault Door (Swinging Open) */}
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: -70 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.6 }}
            style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 rounded-2xl shadow-[15px_10px_20px_rgba(0,0,0,0.4)] border-t-2 border-l-2 border-white/60 flex items-center justify-center"
          >
            {/* Inner Door Panel */}
            <div className="w-[85%] h-[85%] bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] border border-slate-400 flex items-center justify-center relative">
              
              {/* Vault Dial Mechanism */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-b from-slate-100 to-slate-300 border-[3px] border-slate-400 flex items-center justify-center shadow-[0_5px_10px_rgba(0,0,0,0.3)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center shadow-inner">
                   <div className="w-1 h-3 bg-red-500 rounded-full -mt-4 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                </div>
              </div>
              
              {/* Heavy Door Handle */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-400 border border-slate-400 rounded-full shadow-[2px_0_5px_rgba(0,0,0,0.3)]" />
            </div>
            
            {/* Hinges */}
            <div className="absolute left-0 top-6 w-2 h-6 bg-gradient-to-r from-slate-400 to-slate-600 rounded-r-md border border-slate-500" />
            <div className="absolute left-0 bottom-6 w-2 h-6 bg-gradient-to-r from-slate-400 to-slate-600 rounded-r-md border border-slate-500" />
          </motion.div>
          
        </div>
      </motion.div>

      {/* Bold Minimalist VAULT Typography */}
      <motion.div 
        className="mt-6 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-black tracking-[0.25em] text-slate-950 uppercase font-sans">
          VAULT
        </h2>
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 mt-1">
          DigiLocker KYC Bridge
        </span>
      </motion.div>
    </div>
  );
};
