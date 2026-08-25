import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Search, Sparkles, Settings2, Check, } from 'lucide-react';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'reading' | 'generating' | 'processing' | 'success';

interface AssistantAvatarProps {
  state?: AvatarState;
  className?: string;
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ state = 'idle', className }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    let active = true;

    const triggerBlink = () => {
      if (!active) return;
      setBlink(true);
      setTimeout(() => {
        if (active) setBlink(false);
      }, 150);
      blinkTimeout = setTimeout(triggerBlink, Math.random() * 4000 + 2000);
    };
    
    blinkTimeout = setTimeout(triggerBlink, 2000);
    
    return () => {
      active = false;
      clearTimeout(blinkTimeout);
    };
  }, []);

  return (
    <div className={cn('relative flex items-center justify-center w-6 h-6 rounded-lg bg-[#222] shrink-0 border border-[#333] overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        
        {/* IDLE / LISTENING / THINKING -> Normal Eyes */}
        {(state === 'idle' || state === 'listening' || state === 'thinking') && (
          <motion.div 
            key="eyes"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: state === 'thinking' ? -2 : state === 'listening' ? 2 : 0,
              x: state === 'thinking' ? [1.5, -1.5] : 0
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ 
              x: { duration: 1, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
              default: { duration: 0.2 }
            }}
            className="flex gap-[3px]"
          >
            <motion.div 
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.05 }}
              className="w-1 h-1.5 bg-white rounded-full" 
            />
            <motion.div 
              animate={{ scaleY: blink ? 0.1 : 1 }}
              transition={{ duration: 0.05 }}
              className="w-1 h-1.5 bg-white rounded-full" 
            />
          </motion.div>
        )}

        {/* SPEAKING -> Animated Message/Waveform */}
        {state === 'speaking' && (
          <motion.div
            key="speaking"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="flex gap-[2px] items-center h-full"
          >
            <motion.div animate={{ height: ['40%', '80%', '40%'] }} transition={{ duration: 0.4, repeat: Infinity }} className="w-[2px] bg-white rounded-full" />
            <motion.div animate={{ height: ['60%', '100%', '60%'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} className="w-[2px] bg-white rounded-full" />
            <motion.div animate={{ height: ['30%', '70%', '30%'] }} transition={{ duration: 0.3, repeat: Infinity, delay: 0.2 }} className="w-[2px] bg-white rounded-full" />
          </motion.div>
        )}

        {/* READING -> Scanning Search Glass */}
        {state === 'reading' && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, x: [-3, 3, -3] }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }, default: { duration: 0.2 } }}
            className="text-white"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={3} />
          </motion.div>
        )}

        {/* GENERATING -> Pulsing Sparkles */}
        {state === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: [1, 1.2, 1], rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            transition={{ scale: { duration: 1, repeat: Infinity }, default: { duration: 0.2 } }}
            className="text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" strokeWidth={2.5} />
          </motion.div>
        )}

        {/* PROCESSING -> Spinning Gear */}
        {state === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, default: { duration: 0.2 } }}
            className="text-white"
          >
            <Settings2 className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
          </motion.div>
        )}

        {/* SUCCESS -> Checkmark */}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-green-400"
          >
            <Check className="w-4 h-4" strokeWidth={4} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
