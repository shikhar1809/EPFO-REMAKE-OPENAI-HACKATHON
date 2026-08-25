import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Settings, CheckCircle2, Heart } from 'lucide-react';

export type AvatarState = 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'speaking' 
  | 'reading' 
  | 'generating' 
  | 'processing' 
  | 'success' 
  | 'thank_you'
  | 'checking'       // eligibility check — magnifying glass
  | 'fetching'       // fetching KYC docs — folder with flying paper
  | 'reviewing'      // review claim — pen writing on clipboard
  | 'authenticating' // aadhaar OTP — shield + phone signal
  ;

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

  const successStates = ['success', 'thank_you'];

  const eyeVariants: any = {
    idle: { x: '0%', y: '0%', transition: { duration: 0.2 } },
    listening: { x: '0%', y: '20%', transition: { duration: 0.2 } },
    thinking: { x: '20%', y: '-20%', transition: { duration: 0.2 } },
    speaking: { x: '0%', y: '0%', transition: { duration: 0.2 } },
    reading: { x: ['-20%', '20%', '-20%'], y: '0%', transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } },
    generating: { x: '0%', y: '25%', transition: { duration: 0.2 } },
    processing: { x: '0%', y: '0%', transition: { duration: 0.2 } },
    success: { x: '0%', y: '-10%', transition: { duration: 0.2 } },
    thank_you: { x: '0%', y: '-10%', transition: { duration: 0.2 } },
    // Reactive eye positions for context states
    checking: { x: ['-15%', '15%', '-15%'], y: '-15%', transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }, // scanning left-right looking through magnifier
    fetching: { x: '0%', y: '-20%', transition: { duration: 0.2 } },  // looking up at floating doc
    reviewing: { x: ['-5%', '5%', '-5%'], y: '10%', transition: { duration: 1, repeat: Infinity, ease: 'linear' } }, // eyes scanning written text
    authenticating: { x: '0%', y: '0%', transition: { duration: 0.2 } },
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
                animate={{ y: [0, 12] }}
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
        {successStates.includes(state) && (
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

        {/* SCENE: Thank You (Heart floating above) */}
        {state === 'thank_you' && (
          <motion.div
            key="thank-you-prop"
            initial={{ scale: 0, y: 5 }}
            animate={{ scale: [1, 1.2, 1], y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-[50%] -right-[30%] z-30"
          >
            <Heart className="w-[120%] h-[120%] text-red-500 fill-red-500" />
          </motion.div>
        )}

        {/* SCENE: Checking eligibility (Magnifying glass scanning) */}
        {state === 'checking' && (
          <motion.div
            key="checking-prop"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-[50%] -left-[15%] z-30"
          >
            {/* Magnifying glass */}
            <motion.div
              animate={{ x: [0, 8, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[120%] h-[120%] flex items-center justify-center"
            >
              {/* Circle of the glass */}
              <div className="w-[70%] h-[70%] rounded-full border-[2px] border-yellow-400 bg-yellow-400/20" />
              {/* Handle */}
              <div className="absolute bottom-[0%] right-[0%] w-[8%] h-[45%] bg-yellow-400 rounded-full" style={{ transform: 'rotate(45deg)', transformOrigin: 'top center' }} />
            </motion.div>
          </motion.div>
        )}

        {/* SCENE: Fetching document from KYC (Vault opening with flying paper) */}
        {state === 'fetching' && (
          <motion.div
            key="fetching-prop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-[20%] z-30 w-[100%] flex justify-center perspective-[200px]"
          >
            {/* Vault Body */}
            <div className="relative w-[75%] aspect-[1.1] bg-slate-300 rounded-[2px] border border-slate-500 flex items-center justify-center">
              
              {/* Inside of Vault */}
              <div className="absolute inset-[10%] bg-slate-800 rounded-[1px] shadow-inner" />

              {/* Flying document out of vault */}
              <motion.div
                animate={{ y: [0, -12, -22], opacity: [0, 1, 0], scale: [0.7, 1, 1.1], rotate: [0, -8, -15] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute z-10 w-[50%] h-[70%] bg-white rounded-[1px] border border-slate-300 flex flex-col gap-[12%] p-[10%] shadow-sm"
              >
                <div className="w-full h-[12%] bg-amber-500 rounded-full" />
                <div className="w-[70%] h-[12%] bg-slate-300 rounded-full" />
                <div className="w-[90%] h-[12%] bg-slate-300 rounded-full" />
              </motion.div>

              {/* Vault Door (Opens on Y-axis) */}
              <motion.div
                animate={{ rotateY: [0, -110, -110, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: 'left center' }}
                className="absolute inset-0 z-20 bg-slate-200 border border-slate-400 rounded-[2px] flex items-center justify-center shadow-xs"
              >
                {/* Vault Door Dial */}
                <div className="w-[45%] h-[45%] rounded-full bg-slate-300 border border-slate-500 flex items-center justify-center shadow-sm">
                  <div className="w-[30%] h-[30%] rounded-full bg-slate-800" />
                </div>
                {/* Door Handle */}
                <div className="absolute right-[12%] top-[30%] w-[10%] h-[40%] bg-slate-400 border border-slate-500 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* SCENE: Reviewing claim (Pen writing on clipboard) */}
        {state === 'reviewing' && (
          <motion.div
            key="reviewing-prop"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="absolute -bottom-[10%] z-30 w-[110%] flex justify-center"
          >
            {/* Clipboard */}
            <div className="relative w-[85%] h-[50%] bg-slate-100 rounded-[2px] border border-slate-300 flex flex-col gap-[10%] p-[8%]">
              {/* Clip at top */}
              <div className="absolute -top-[15%] left-[35%] w-[30%] h-[20%] bg-slate-500 rounded-sm" />
              {/* Lines being written */}
              <motion.div
                animate={{ width: ['10%', '90%', '10%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="h-[12%] bg-blue-400 rounded-full"
              />
              <div className="w-[80%] h-[12%] bg-slate-300 rounded-full" />
              <div className="w-[60%] h-[12%] bg-slate-300 rounded-full" />
              {/* Pen writing */}
              <motion.div
                animate={{ x: ['5%', '75%', '5%'], y: [0, 0, 12] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute top-[20%] w-[8%] h-[40%] bg-blue-600 rounded-full"
                style={{ rotate: '25deg' }}
              />
            </div>
          </motion.div>
        )}

        {/* SCENE: Authenticating Aadhaar OTP (Phone with signal waves) */}
        {state === 'authenticating' && (
          <motion.div
            key="authenticating-prop"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-[55%] right-[-15%] z-30 flex items-center gap-[5%]"
          >
            {/* Signal waves */}
            <div className="flex items-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-[3px] bg-blue-400 rounded-full"
                  style={{ height: `${(i + 1) * 4}px` }}
                />
              ))}
            </div>
            {/* Phone body */}
            <div className="relative w-[14px] h-[22px] bg-slate-700 rounded-[2px] border border-slate-500 flex flex-col items-center justify-center gap-[2px]">
              {/* Screen showing OTP digits */}
              <div className="w-[80%] h-[50%] bg-blue-900 rounded-[1px] flex items-center justify-center gap-[2px]">
                {['*','*','*','*'].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1, delay: i * 0.25 }}
                    className="w-[15%] h-[15%] bg-green-400 rounded-full"
                  />
                ))}
              </div>
              {/* Home button */}
              <div className="w-[25%] h-[8%] bg-slate-500 rounded-full" />
            </div>
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
        {/* Left Cheek Blush (Success / Thank You) */}
        <AnimatePresence>
          {successStates.includes(state) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              className="absolute -left-[10%] top-[80%] w-[30%] h-[50%] bg-pink-500 rounded-full blur-[1px]" 
            />
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ scaleY: (blink || successStates.includes(state)) ? 0.1 : 1 }}
          transition={{ duration: 0.05 }}
          className="w-[16%] h-0 pb-[25%] bg-white rounded-full relative" 
        />
        
        <motion.div 
          animate={{ scaleY: (blink || successStates.includes(state)) ? 0.1 : 1 }}
          transition={{ duration: 0.05 }}
          className="w-[16%] h-0 pb-[25%] bg-white rounded-full relative" 
        />

        {/* Right Cheek Blush (Success / Thank You) */}
        <AnimatePresence>
          {successStates.includes(state) && (
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
