import { motion } from 'framer-motion';

export const ProfileSuccessAnim = () => (
  <div className="flex justify-center my-6">
    <svg viewBox="0 0 100 100" className="w-32 h-32 text-green-500 overflow-visible">
      <motion.circle
        cx="50" cy="50" r="45"
        fill="none" stroke="currentColor" strokeWidth="4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.path
        d="M50 25a12 12 0 100 24 12 12 0 000-24z"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 10 }}
      />
      <motion.path
        d="M25 75c0-14 11-20 25-20s25 6 25 20"
        fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
      />
      {/* Green Check Badge */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", bounce: 0.5 }}
      >
        <circle cx="80" cy="80" r="16" fill="white" />
        <circle cx="80" cy="80" r="14" fill="#16a34a" />
        <path d="M74 80l4 4 8-8" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  </div>
);

export const VaultSuccessAnim = () => (
  <div className="flex justify-center my-4">
    <svg viewBox="0 0 100 100" className="w-32 h-32 text-green-500 overflow-visible">
      {/* Vault Door / Shield Base */}
      <motion.path
        d="M20 20 L80 20 L80 80 L20 80 Z"
        fill="none" stroke="currentColor" strokeWidth="4" rx="10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      {/* Documents sliding in */}
      <motion.g
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
      >
        <rect x="30" y="30" width="40" height="40" fill="#dcfce7" rx="4" />
        <line x1="40" y1="40" x2="60" y2="40" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="50" x2="55" y2="50" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      
      {/* Locking Mechanism / Sparkles */}
      <motion.circle
        cx="50" cy="50" r="15"
        fill="#16a34a"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
      />
      <motion.path 
        d="M45 50 l3 3 l7 -7" 
        fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.5, duration: 0.3 }}
      />
    </svg>
  </div>
);
