import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Settings, CheckCircle2 } from 'lucide-react';

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

  const eyeVariants: any = {
    idle: { x: '0%', y: '0%', transition: { duration: 0.2 } },
    listening: { x: '0%', y: '20%', transition: { duration: 0.2 } },
    thinking: { x: '20%', y: '-20%', transition: { duration: 0.2 } },
    speaking: { x: '0%', y: '0%', transition: { duration: 0.2 } },
    reading: { x: ['-20%', '20%', '-20%'], y: '0%', transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } },
    generating: { x: '0%', y: '25%', transition: { duration: 0.2 } }, // Looking down at the tracks
    processing: { x: '0%', y: '0%', transition: { duration: 0.2 } },
    success: { x: '0%', y: '-10%', transition: { duration: 0.2 } }
  };

  return (
    <div className={cn('relative flex items-center justify-center w-6 h-6 rounded-lg bg-[#222] shrink-0 border border-[#333]', className)}>
      
      {/* SCENERY & PROPS */}
      <AnimatePresence>
        
        {/* SCENE: Reading (Holding a Newspaper) */}
        {state === 'reading' && (
          <motion.div
            key="reading-prop"
            initial={{ y: 10, opacity: 0, rotate: 5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: -5 }}
            className="absolute bottom-[-10%] w-[130%] h-[55%] bg-slate-50 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex flex-col justify-center gap-[12%] p-[10%] z-20 border border-slate-200"
          >
            {/* Newspaper Text Lines */}
            <div className="w-[80%] h-[12%] bg-slate-300 rounded-full" />
            <div className="w-[100%] h-[12%] bg-slate-300 rounded-full" />
            <div className="w-[60%] h-[12%] bg-slate-300 rounded-full" />
            
            {/* Little robot hands holding the paper */}
            <div className="absolute -left-[5%] top-[40%] w-[15%] h-[35%] bg-[#444] rounded-full border border-[#222]" />
            <div className="absolute -right-[5%] top-[40%] w-[15%] h-[35%] bg-[#444] rounded-full border border-[#222]" />
          </motion.div>
        )}

        {/* SCENE: Generating (Laying Railway Tracks) */}
        {state === 'generating' && (
          <motion.div
            key="generating-prop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-[90%] w-[100%] h-[100%] flex justify-center z-20 overflow-hidden"
            style={{ perspective: '40px' }}
          >
            {/* Track Container tilted in 3D */}
            <div 
              className="relative w-[60%] h-[200%] border-x-[2px] border-slate-400 flex flex-col items-center"
              style={{ transform: 'rotateX(55deg)', transformOrigin: 'top center' }}
            >
              {/* Moving Ties (Wooden Planks) */}
              <motion.div
                animate={{ y: [0, 12] }} // moves down one "tie" length to loop seamlessly
                transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 w-[140%] flex flex-col gap-[8px]"
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-full h-[3px] bg-orange-700 rounded-sm" />
                ))}
              </motion.div>
            </div>
            
            {/* Hammer / Construction Arm Laying tracks */}
            <motion.div 
              animate={{ rotate: [0, -60, 0], y: [0, 4, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="absolute top-0 right-[15%] w-[15%] h-[50%] bg-[#555] rounded-sm origin-bottom"
            />
          </motion.div>
        )}

        {/* SCENE: Processing (Gears spinning on head) */}
        {state === 'processing' && (
          <motion.div
            key="processing-prop"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-[40%] text-slate-400 z-20"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <Settings className="w-[80%] h-[80%]" />
            </motion.div>
          </motion.div>
        )}

        {/* SCENE: Speaking (Audio Wave) */}
        {state === 'speaking' && (
          <motion.div
            key="speaking-prop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-[20%] w-[60%] h-[30%] flex justify-center items-center gap-[10%] z-20"
          >
            <motion.div animate={{ height: ['40%', '100%', '40%'] }} transition={{ duration: 0.4, repeat: Infinity }} className="w-[15%] bg-green-400 rounded-full" />
            <motion.div animate={{ height: ['20%', '80%', '20%'] }} transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }} className="w-[15%] bg-green-400 rounded-full" />
            <motion.div animate={{ height: ['60%', '100%', '60%'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} className="w-[15%] bg-green-400 rounded-full" />
          </motion.div>
        )}

        {/* SCENE: Success (Badge & Blush) */}
        {state === 'success' && (
          <motion.div
            key="success-prop"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -bottom-[20%] -right-[20%] z-30 bg-green-500 rounded-full p-[5%] border-2 border-[#222]"
          >
            <CheckCircle2 className="w-[100%] h-[100%] text-white" />
          </motion.div>
        )}

      </AnimatePresence>

      {/* THE EYES (Always present) */}
      <motion.div 
        variants={eyeVariants}
        initial="idle"
        animate={state}
        className="flex gap-[12%] z-10 w-full justify-center relative"
      >
        {/* Left Cheek Blush (Success) */}
        <AnimatePresence>
          {state === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              className="absolute -left-[10%] top-[80%] w-[30%] h-[50%] bg-pink-500 rounded-full blur-[1px]" 
            />
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ scaleY: (blink || state === 'success') ? 0.1 : 1 }}
          transition={{ duration: 0.05 }}
          className="w-[16%] h-0 pb-[25%] bg-white rounded-full relative" 
        />
        
        <motion.div 
          animate={{ scaleY: (blink || state === 'success') ? 0.1 : 1 }}
          transition={{ duration: 0.05 }}
          className="w-[16%] h-0 pb-[25%] bg-white rounded-full relative" 
        />

        {/* Right Cheek Blush (Success) */}
        <AnimatePresence>
          {state === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              className="absolute -right-[10%] top-[80%] w-[30%] h-[50%] bg-pink-500 rounded-full blur-[1px]" 
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
