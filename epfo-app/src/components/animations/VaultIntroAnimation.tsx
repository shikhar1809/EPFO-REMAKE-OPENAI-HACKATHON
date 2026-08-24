import React from 'react';
import { motion } from 'framer-motion';

export const VaultIntroAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4 select-none bg-transparent">
      {/* 3D Extruded Keyhole Icon with Gentle Float and Depth */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [-3, 3, -3] }}
        transition={{ 
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.4 },
          opacity: { duration: 0.4 }
        }}
      >
        {/* Soft Background Radial Light */}
        <div className="absolute w-36 h-36 bg-slate-200/40 rounded-full blur-xl pointer-events-none" />

        <svg 
          viewBox="0 0 160 180" 
          className="w-28 h-28 drop-shadow-md overflow-visible"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 3D Extrusion Shadow Body (Solid Black) */}
          <path
            d="M 74 16 
               C 100 16, 120 36, 120 62
               C 120 78, 110 92, 102 100
               L 122 150
               L 106 152
               L 54 152
               L 42 150
               L 64 100
               C 56 92, 46 78, 46 62
               C 46 36, 66 16, 74 16 Z"
            fill="#09090b"
          />

          {/* Right Isometric Extrusion Bevel (Dark Shade) */}
          <path
            d="M 74 16 
               C 100 16, 120 36, 120 62
               C 120 78, 110 92, 102 100
               L 122 150
               L 104 150
               L 86 100
               C 94 92, 102 78, 102 62
               C 102 40, 88 22, 66 22
               Z"
            fill="#18181b"
          />

          {/* Front Face Keyhole Outer Shell */}
          <path
            d="M 64 26 
               C 86 26, 104 44, 104 66
               C 104 80, 95 92, 88 100
               L 106 148
               L 44 148
               L 62 100
               C 55 92, 46 80, 46 66
               C 46 44, 64 26, 64 26 Z"
            fill="#09090b"
          />

          {/* Inner Light Aperture (Crisp White Keyhole Opening) */}
          <motion.path
            d="M 75 42 
               C 87 42, 95 51, 95 64
               C 95 73, 89 80, 84 86
               L 92 136
               L 58 136
               L 66 86
               C 61 80, 55 73, 55 64
               C 55 51, 63 42, 75 42 Z"
            fill="#ffffff"
            animate={{ opacity: [0.94, 1, 0.94] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Subtle 3D Inner Left Bevel Highlight */}
          <path
            d="M 55 64
               C 55 51, 63 42, 75 42
               L 75 44
               C 64 44, 57 52, 57 64
               C 57 72, 62 79, 67 85
               L 59 134
               L 58 136
               L 66 86
               C 61 80, 55 73, 55 64 Z"
            fill="#e2e8f0"
            opacity="0.85"
          />
        </svg>
      </motion.div>

      {/* Bold Minimalist VAULT Typography */}
      <motion.div 
        className="mt-3.5 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-black tracking-[0.25em] text-slate-950 uppercase font-sans">
          VAULT
        </h2>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
          DigiLocker KYC Bridge
        </span>
      </motion.div>
    </div>
  );
};
