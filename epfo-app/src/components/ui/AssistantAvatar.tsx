import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { FileText, Search, ListChecks, Settings2, CheckCircle2, Moon } from 'lucide-react';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'reading' | 'generating' | 'processing' | 'success';

interface AssistantAvatarProps {
  state?: AvatarState;
  className?: string;
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ state = 'idle', className }) => {
  const [blink, setBlink] = useState(false);
  const [yawn, setYawn] = useState(false);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    let yawnTimeout: ReturnType<typeof setTimeout>;
    let active = true;

    const triggerBlink = () => {
      if (!active) return;
      setBlink(true);
      setTimeout(() => {
        if (active) setBlink(false);
      }, 150);
      blinkTimeout = setTimeout(triggerBlink, Math.random() * 4000 + 2000);
    };

    const triggerYawn = () => {
      if (!active) return;
      if (state === 'idle') {
        setYawn(true);
        setTimeout(() => {
          if (active) setYawn(false);
        }, 2000);
      }
      yawnTimeout = setTimeout(triggerYawn, Math.random() * 8000 + 5000);
    };
    
    blinkTimeout = setTimeout(triggerBlink, 2000);
    yawnTimeout = setTimeout(triggerYawn, 5000);
    
    return () => {
      active = false;
      clearTimeout(blinkTimeout);
      clearTimeout(yawnTimeout);
    };
  }, [state]);

  const eyeVariants = {
    idle: {
      x: [0, 1.5, -1.5, 0],
      y: [0, 0.5, -0.5, 0],
      scaleY: yawn ? 0.2 : 1, // Squint when yawning
      transition: { duration: 5, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as const }
    },
    listening: {
      x: 0,
      y: 2,
      scaleY: 1,
      transition: { duration: 0.3 }
    },
    thinking: {
      x: [1.5, -1.5],
      y: -2,
      scaleY: 1,
      transition: { duration: 1, repeat: Infinity, repeatType: "mirror" as const }
    },
    speaking: {
      x: 0,
      y: [0, -1, 0],
      scaleY: 1,
      transition: { duration: 0.4, repeat: Infinity }
    },
    reading: {
      x: [-3, 3, -3, 3],
      y: 1,
      scaleY: 1,
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" as const }
    },
    generating: {
      rotate: [0, 10, -10, 0],
      scaleY: 1,
      transition: { duration: 0.5, repeat: Infinity }
    },
    processing: {
      x: [-0.5, 0.5, -0.5],
      y: [-0.5, 0.5, -0.5],
      scaleY: 1,
      transition: { duration: 0.1, repeat: Infinity }
    },
    success: {
      scaleY: [1, 0.2, 1],
      y: [0, -2, 0],
      transition: { duration: 0.8 }
    }
  };

  return (
    <div className={cn('relative flex items-center justify-center w-6 h-6 rounded-lg bg-[#222] shrink-0 border border-[#333] shadow-sm', className)}>
      
      {/* Contextual Overlay Icons based on State */}
      <AnimatePresence>
        
        {/* Yawning / Zzz state */}
        {state === 'idle' && yawn && (
          <motion.div
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -15, x: 10, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute -top-1 -right-2 z-10 text-slate-400"
          >
            <Moon className="w-3 h-3 fill-slate-400" />
          </motion.div>
        )}

        {/* Reading Paper state */}
        {state === 'reading' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.5 }}
            className="absolute -bottom-2 -right-2 z-10 bg-white p-0.5 rounded shadow-sm border border-slate-200"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <motion.div
              animate={{ x: [-2, 4, -2], y: [-2, 4, -2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -left-1"
            >
              <Search className="w-2.5 h-2.5 text-slate-700" />
            </motion.div>
          </motion.div>
        )}

        {/* Generating Steps state */}
        {state === 'generating' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -bottom-2 -right-2 z-10 bg-orange-100 p-0.5 rounded shadow-sm border border-orange-200"
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, staggerChildren: 0.1 }}
            >
              <ListChecks className="w-3.5 h-3.5 text-orange-600" />
            </motion.div>
          </motion.div>
        )}

        {/* Processing Gear state */}
        {state === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -top-2 -right-2 z-10 bg-slate-100 p-0.5 rounded shadow-sm border border-slate-200"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-600" />
            </motion.div>
          </motion.div>
        )}

        {/* Success state */}
        {state === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -bottom-1 -right-1 z-10 bg-green-100 rounded-full border border-green-200"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eyes */}
      <motion.div 
        variants={eyeVariants}
        initial="idle"
        animate={state}
        className="flex gap-[3px]"
      >
        <motion.div 
          animate={{ scaleY: (blink || (state === 'idle' && yawn)) ? 0.1 : 1 }}
          transition={{ duration: 0.05 }}
          className="w-1 h-1.5 bg-white rounded-full" 
        />
        <motion.div 
          animate={{ scaleY: (blink || (state === 'idle' && yawn)) ? 0.1 : 1 }}
          transition={{ duration: 0.05 }}
          className="w-1 h-1.5 bg-white rounded-full" 
        />
      </motion.div>
    </div>
  );
};
