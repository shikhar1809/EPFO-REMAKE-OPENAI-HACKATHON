import { motion } from 'framer-motion';

export const SyncAnimation = () => (
  <div className="flex justify-center my-10 relative">
    {/* Outer expanding rings for the "fetching/radar" effect */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="w-24 h-24 border border-epfo-blue/20 rounded-full absolute"
        animate={{ scale: [1, 2], opacity: [0.8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="w-24 h-24 border border-epfo-blue/20 rounded-full absolute"
        animate={{ scale: [1, 2], opacity: [0.8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
      />
    </div>

    {/* The floating Document */}
    <motion.div 
      className="relative w-16 h-20 bg-white border-2 border-slate-200 rounded-xl shadow-lg flex flex-col items-center py-4 overflow-hidden z-10"
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Document UI lines */}
      <div className="w-8 h-1 bg-slate-200 rounded-full mb-2 self-start ml-3" />
      <div className="w-10 h-1 bg-slate-200 rounded-full mb-2 self-start ml-3" />
      <div className="w-6 h-1 bg-slate-200 rounded-full mb-4 self-start ml-3" />
      
      {/* Glowing Scanner Line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-epfo-orange shadow-[0_0_12px_3px_rgba(249,115,22,0.5)] z-20"
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Scanner overlay tint (leaves a trail) */}
      <motion.div 
        className="absolute left-0 right-0 top-0 bg-orange-50/50"
        animate={{ height: ['0%', '100%', '0%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  </div>
);
