import { motion } from 'framer-motion';

export const ThinkingAnimation = () => {
  return (
    <div className="flex space-x-1.5 items-center justify-center h-4 mt-1">
      <motion.div className="w-2 h-2 bg-epfo-blue rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="w-2 h-2 bg-epfo-blue rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }} />
      <motion.div className="w-2 h-2 bg-epfo-blue rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} />
    </div>
  );
};
