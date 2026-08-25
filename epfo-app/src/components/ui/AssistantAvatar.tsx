import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

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
      }, 150); // fast blink
      blinkTimeout = setTimeout(triggerBlink, Math.random() * 3000 + 1500);
    };

    blinkTimeout = setTimeout(triggerBlink, 2000);
    
    return () => {
      active = false;
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Base physics for the face container (handles looking around / breathing)
  const faceVariants: any = {
    idle: { y: [0, -1, 0], x: 0, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
    listening: { y: 0, x: 0, scale: 1.05, transition: { duration: 0.5 } },
    thinking: { y: -2, x: 2, transition: { duration: 0.5 } },
    speaking: { y: 0, x: 0, transition: { duration: 0.3 } },
    reading: { x: [-3, 3, -3], y: 0, transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    generating: { y: -2, x: 0, transition: { duration: 0.5 } },
    processing: { x: [-0.5, 0.5, -0.5], y: 0, transition: { duration: 0.1, repeat: Infinity } },
    success: { y: [0, -3, 0], x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  // Eyes morphing based on state
  const eyeVariants: any = {
    idle: { height: '24%', width: '16%', borderRadius: '50%', y: 0 },
    listening: { height: '28%', width: '18%', borderRadius: '50%', y: 0 },
    thinking: { height: '20%', width: '16%', borderRadius: '50%', y: 0 },
    speaking: { height: '24%', width: '16%', borderRadius: '50%', y: 0 },
    reading: { height: '18%', width: '16%', borderRadius: '50%', y: 0 }, // focused/squinting slightly
    generating: { height: '32%', width: '22%', borderRadius: '50%', y: -2 }, // wide eyed
    processing: { height: '4%', width: '20%', borderRadius: '2px', y: 0 }, // squeezed shut
    success: { height: '12%', width: '24%', borderRadius: '50% 50% 10% 10%', y: -2 } // happy crescents
  };

  // Mouth morphing based on state
  const mouthVariants: any = {
    idle: { height: '4%', width: '25%', borderRadius: '2px', y: 0, opacity: 0.8 },
    listening: { height: '6%', width: '15%', borderRadius: '50%', y: 0, opacity: 1 },
    thinking: { height: '4%', width: '15%', borderRadius: '2px', y: 0, opacity: 0.8, x: -2 }, // hmm...
    speaking: { height: ['4%', '15%', '4%'], width: ['25%', '20%', '25%'], borderRadius: '50%', y: 0, opacity: 1, transition: { duration: 0.3, repeat: Infinity } },
    reading: { height: '2%', width: '15%', borderRadius: '2px', y: -1, opacity: 0.5 },
    generating: { height: '15%', width: '15%', borderRadius: '50%', y: 2, opacity: 1 }, // "o" shape
    processing: { height: '2%', width: '10%', borderRadius: '2px', y: 0, opacity: 0.3 },
    success: { height: '15%', width: '35%', borderRadius: '10% 10% 50% 50%', y: 1, opacity: 1 } // big smile
  };

  // Background glow intensity
  const glowVariants: any = {
    idle: { opacity: 0.3, transition: { duration: 2 } },
    listening: { opacity: 0.5, transition: { duration: 0.3 } },
    thinking: { opacity: 0.4, transition: { duration: 0.5 } },
    speaking: { opacity: [0.4, 0.6, 0.4], transition: { duration: 1, repeat: Infinity } },
    reading: { opacity: 0.4, transition: { duration: 0.5 } },
    generating: { opacity: [0.3, 0.8, 0.3], transition: { duration: 1.5, repeat: Infinity } },
    processing: { opacity: [0.2, 0.7, 0.2], transition: { duration: 0.2, repeat: Infinity } },
    success: { opacity: 0.8, transition: { duration: 0.5 } }
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center shrink-0 w-6 h-6 rounded-xl overflow-hidden',
      'bg-slate-900 border-[1.5px] border-slate-700/80 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.2)]',
      className
    )}>
      
      {/* 3D Glass Reflection Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-60 pointer-events-none z-20 mix-blend-overlay" />
      
      {/* Ambient Screen Glow */}
      <motion.div 
        animate={state}
        variants={glowVariants}
        className="absolute inset-0 bg-cyan-400 mix-blend-screen blur-md z-0" 
      />

      {/* Main Face Container */}
      <motion.div 
        variants={faceVariants}
        initial="idle"
        animate={state}
        className="relative w-full h-full flex flex-col items-center justify-center z-10"
      >
        {/* Eyes Row */}
        <div className="flex justify-between items-center w-[45%] mt-[5%] relative">
          
          {/* Left Cheek Blush (Success) */}
          <AnimatePresence>
            {state === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 0.6, scale: 1 }} 
                exit={{ opacity: 0, scale: 0 }}
                className="absolute -left-[40%] top-[80%] w-[35%] h-[40%] bg-pink-500 rounded-full blur-[2px]" 
              />
            )}
          </AnimatePresence>

          {/* Left Eye */}
          <motion.div 
            variants={eyeVariants}
            initial="idle"
            animate={state}
            style={{ 
              scaleY: blink && state !== 'processing' && state !== 'success' ? 0.1 : 1 
            }}
            transition={{ duration: 0.2 }}
            className="bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.8)]" 
          />
          
          {/* Right Eye */}
          <motion.div 
            variants={eyeVariants}
            initial="idle"
            animate={state}
            style={{ 
              scaleY: blink && state !== 'processing' && state !== 'success' ? 0.1 : 1 
            }}
            transition={{ duration: 0.2 }}
            className="bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.8)]" 
          />

          {/* Right Cheek Blush (Success) */}
          <AnimatePresence>
            {state === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 0.6, scale: 1 }} 
                exit={{ opacity: 0, scale: 0 }}
                className="absolute -right-[40%] top-[80%] w-[35%] h-[40%] bg-pink-500 rounded-full blur-[2px]" 
              />
            )}
          </AnimatePresence>

        </div>

        {/* Mouth */}
        <motion.div 
          variants={mouthVariants}
          initial="idle"
          animate={state}
          transition={{ duration: 0.2 }}
          className="bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.8)] mt-[8%]" 
        />
        
      </motion.div>
    </div>
  );
};
