import React from 'react';
import { motion } from 'framer-motion';

export const ScamAwarenessAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center select-none bg-transparent">
      <div className="relative w-36 h-36">
        {/* Soft Background Radial Light */}
        <div className="absolute inset-0 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Phone Frame */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[120px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.4)] overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Phone Screen */}
          <div className="w-full h-full bg-gradient-to-b from-white to-slate-100 p-1.5 flex flex-col items-center justify-center gap-1">
            {/* Fake Agent Silhouette */}
            <motion.div
              className="w-7 h-7 rounded-full bg-slate-400/60 flex items-center justify-center"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#64748b" />
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#64748b" />
              </svg>
            </motion.div>
            {/* Rupee Symbol */}
            <motion.div
              className="text-xs font-black text-red-500"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              ₹
            </motion.div>
            <div className="w-[70%] h-0.5 bg-slate-300 rounded-full" />
            <div className="w-[55%] h-0.5 bg-slate-300 rounded-full" />
          </div>
        </motion.div>

        {/* Flying Money Bills */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-2.5 bg-green-400 rounded-sm border border-green-600 flex items-center justify-center"
            style={{ top: `${35 + i * 10}%`, left: '50%' }}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
            animate={{ x: [-8 + i * 12, 16 - i * 20], y: [-4, -24], opacity: [0, 0.9, 0], rotate: [-10, 15] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
          >
            <span className="text-[5px] font-bold text-green-800">₹</span>
          </motion.div>
        ))}

        {/* Red X */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 z-20 pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.1, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <svg viewBox="0 0 80 80" fill="none" className="w-full h-full drop-shadow-lg">
            <circle cx="40" cy="40" r="36" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
            <line x1="24" y1="24" x2="56" y2="56" stroke="white" strokeWidth="5" strokeLinecap="round" />
            <line x1="56" y1="24" x2="24" y2="56" stroke="white" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Green Shield */}
        <motion.div
          className="absolute -right-1 -bottom-1 z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <div className="w-9 h-9 bg-gradient-to-b from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(34,197,94,0.5)] border-2 border-green-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
        </motion.div>

        {/* FREE Badge */}
        <motion.div
          className="absolute -left-2 -bottom-1 z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.4)] border border-blue-400">
            <span className="text-[7px] font-black text-white tracking-wider">FREE</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
