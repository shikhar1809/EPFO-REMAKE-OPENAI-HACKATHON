import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileCheck2, Database, Key } from 'lucide-react';

export const VaultIntroAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-44 flex items-center justify-center overflow-hidden my-1">
      {/* Background Soft Glow Aura */}
      <div className="absolute w-40 h-40 bg-gradient-to-tr from-emerald-200/40 via-blue-200/30 to-indigo-200/40 rounded-full blur-2xl pointer-events-none" />

      {/* Outer Pulse Rings */}
      <motion.div
        className="absolute w-36 h-36 rounded-full border border-emerald-400/30"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-28 h-28 rounded-full border border-blue-400/40"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.2, 0.7] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Central DigiLocker Vault Shield Hub */}
      <motion.div
        className="relative z-10 w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 rounded-3xl p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center"
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full bg-white/95 rounded-[22px] flex flex-col items-center justify-center p-2 shadow-inner">
          <div className="relative">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <motion.div 
              className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-2.5 h-2.5" />
            </motion.div>
          </div>
          <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider mt-0.5">
            DigiLocker
          </span>
        </div>
      </motion.div>

      {/* Orbiting KYC Document 1: Aadhaar Card (Top Left) */}
      <motion.div
        className="absolute top-3 left-4 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-200/80 shadow-md flex items-center gap-1.5"
        animate={{ y: [-4, 4, -4], x: [-2, 2, -2] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-5 h-5 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
          <FileCheck2 className="w-3 h-3" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold text-slate-800 leading-tight">Aadhaar</p>
          <p className="text-[8px] text-emerald-600 font-semibold">Verified ✓</p>
        </div>
      </motion.div>

      {/* Orbiting KYC Document 2: PAN Card (Top Right) */}
      <motion.div
        className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-blue-200/80 shadow-md flex items-center gap-1.5"
        animate={{ y: [4, -4, 4], x: [2, -2, 2] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center text-epfo-blue">
          <Database className="w-3 h-3" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold text-slate-800 leading-tight">PAN Card</p>
          <p className="text-[8px] text-blue-600 font-semibold">Instant KYC</p>
        </div>
      </motion.div>

      {/* Orbiting KYC Document 3: Bank Passbook (Bottom Center-Left) */}
      <motion.div
        className="absolute bottom-2 left-6 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-purple-200/80 shadow-md flex items-center gap-1.5"
        animate={{ y: [-3, 3, -3], x: [1, -1, 1] }}
        transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <div className="w-5 h-5 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
          <Key className="w-3 h-3" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold text-slate-800 leading-tight">Bank Passbook</p>
          <p className="text-[8px] text-purple-600 font-semibold">Direct Seeding</p>
        </div>
      </motion.div>

      {/* Security 256-Bit Pill (Bottom Right) */}
      <motion.div
        className="absolute bottom-3 right-6 z-20 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-sm flex items-center gap-1"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <Lock className="w-2.5 h-2.5 text-emerald-400" />
        <span className="text-[9px] font-mono font-bold tracking-tight">AES-256</span>
      </motion.div>

      {/* Connecting Flow Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300/60" strokeDasharray="3,3">
        <line x1="25%" y1="25%" x2="50%" y2="50%" strokeWidth="1" />
        <line x1="75%" y1="25%" x2="50%" y2="50%" strokeWidth="1" />
        <line x1="30%" y1="80%" x2="50%" y2="50%" strokeWidth="1" />
      </svg>
    </div>
  );
};
