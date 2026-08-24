import { motion } from 'framer-motion';

export const EpfoLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-24 h-24">
        {/* Outer rotating dashed ring */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full text-epfo-blue"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="10 6"
          />
        </motion.svg>

        {/* Inner reverse rotating solid ring */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full text-epfo-orange"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        >
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="50 150"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Center pulsing Rupee / Shield concept */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-epfo-blue"
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            {/* Minimal Shield */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="fill-blue-50 stroke-epfo-blue" />
            {/* Indian Rupee Symbol inside */}
            <path d="M9 8h6M9 11h6M10 11l4 4H9" strokeWidth="1.5" className="stroke-epfo-blue" />
          </svg>
        </motion.div>
      </div>
      
      {/* Loading Text */}
      <motion.div 
        className="text-epfo-blue font-semibold tracking-wide text-sm flex items-center gap-1"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>SECURE</span>
        <span className="w-1.5 h-1.5 bg-epfo-orange rounded-full inline-block mx-1" />
        <span>EPFO</span>
        <span className="w-1.5 h-1.5 bg-epfo-orange rounded-full inline-block mx-1" />
        <span>PORTAL</span>
      </motion.div>
    </div>
  );
};
