import { motion } from 'framer-motion';

interface ThinkingAnimationProps {
  color?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({ color = 'epfo-blue' }) => {
  const bgClass = color.startsWith('#') || color.startsWith('rgb') ? '' : `bg-${color}`;
  const style = (color.startsWith('#') || color.startsWith('rgb')) ? { backgroundColor: color } : undefined;

  return (
    <div className='flex space-x-1.5 items-center justify-center h-4 mt-1'>
      <motion.div className={`w-2 h-2 rounded-full ${bgClass}`} style={style} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className={`w-2 h-2 rounded-full ${bgClass}`} style={style} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }} />
      <motion.div className={`w-2 h-2 rounded-full ${bgClass}`} style={style} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
    </div>
  );
};
