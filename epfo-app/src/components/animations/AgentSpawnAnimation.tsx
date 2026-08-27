import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssistantAvatar } from '../ui/AssistantAvatar';
import { ThinkingAnimation } from '../ui/ThinkingAnimation';
import type { AgentColorTheme } from '../../agents/types';

interface AgentSpawnAnimationProps {
  colors: AgentColorTheme;
  initMessages: string[];
  onComplete: () => void;
}

export const AgentSpawnAnimation: React.FC<AgentSpawnAnimationProps> = ({ colors, initMessages, onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < initMessages.length) {
        setStage(current);
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [initMessages.length, onComplete]);

  const avatarState = stage < 1 ? 'reading' : stage === 1 ? 'checking' : stage === 2 ? 'generating' : 'success';

  return (
    <div className='flex-1 flex flex-col items-center justify-center -mt-20'>
      {/* Radial glow background in agent color */}
      <div
        className='absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none'
        style={{ background: `rgb(${colors.primaryRgb})` }}
      />

      {/* Spinning ring + Avatar — same structure as existing init */}
      <div className='w-24 h-24 relative flex items-center justify-center mb-8'>
        <motion.div
          className={`absolute inset-0 border-4 rounded-full`}
          style={{ borderColor: `rgba(${colors.primaryRgb}, 0.2)` }}
        />
        <motion.div
          className='absolute inset-0 border-4 border-t-transparent rounded-full'
          style={{ borderColor: `rgb(${colors.primaryRgb})`, borderTopColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <AssistantAvatar
          state={avatarState}
          className='!w-12 !h-12 shadow-xl'
          ringColor={colors.ring}
        />
      </div>

      {/* Agent label + icon */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={`label-${stage}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className='text-center mb-3'
        >
          <span className={`text-sm font-bold ${colors.textPrimary}`}>
            {colors.icon} {colors.label}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Status message — same as existing init text */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={`msg-${stage}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className='text-lg font-semibold text-slate-800 text-center px-6'
        >
          {initMessages[stage]}
        </motion.div>
      </AnimatePresence>

      {/* Thinking dots on intermediate stages */}
      {stage < initMessages.length - 1 && (
        <div className='mt-4'>
          <ThinkingAnimation color={`rgb(${colors.primaryRgb})`} />
        </div>
      )}
    </div>
  );
};
