import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'reading' | 'generating' | 'processing' | 'success';

interface AssistantAvatarProps {
  state?: AvatarState;
  className?: string;
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({ state = 'idle', className }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let active = true;

    const triggerBlink = () => {
      if (!active) return;
      setBlink(true);
      setTimeout(() => {
        if (active) setBlink(false);
      }, 150);
      timeout = setTimeout(triggerBlink, Math.random() * 4000 + 2000);
    };
    
    timeout = setTimeout(triggerBlink, 2000);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);

  const eyeVariants = {
    idle: {
      x: [0, 1.5, -1.5, 0],
      y: [0, 0.5, -0.5, 0],
      transition: { duration: 5, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as const }
    },
    listening: {
      x: 0,
      y: 2,
      transition: { duration: 0.3 }
    },
    thinking: {
      x: [1.5, -1.5],
      y: -2,
      transition: { duration: 1, repeat: Infinity, repeatType: "mirror" as const }
    },
    speaking: {
      x: 0,
      y: [0, -1, 0],
      transition: { duration: 0.4, repeat: Infinity }
    },
    reading: {
      x: [-2, 2, -2, 2],
      y: 0,
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" as const }
    },
    generating: {
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 1, repeat: Infinity, ease: "linear" as const }
    },
    processing: {
      x: [-1, 1, -1],
      y: [-1, 1, -1],
      transition: { duration: 0.3, repeat: Infinity }
    },
    success: {
      scaleY: [1, 0.2, 1, 0.2, 1],
      y: [0, -2, 0],
      transition: { duration: 0.8 }
    }
  };

  return (
    <div className={cn('relative flex items-center justify-center w-6 h-6 rounded-lg bg-[#222] shrink-0 border border-[#333]', className)}>
      <motion.div 
        variants={eyeVariants}
        initial="idle"
        animate={state}
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
    </div>
  );
};
