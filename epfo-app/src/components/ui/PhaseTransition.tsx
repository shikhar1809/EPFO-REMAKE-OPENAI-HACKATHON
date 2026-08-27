import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { AssistantAvatar } from './AssistantAvatar';
import type { Phase } from '../../store/useWorkflowStore';

interface PhaseTransitionProps {
  phases: Phase[];
  currentPhaseIndex: number;
  onDismiss: () => void;
  primaryRgb?: string;
}

export const PhaseTransition: React.FC<PhaseTransitionProps> = ({ phases, currentPhaseIndex, onDismiss, primaryRgb = '59,130,246' }) => {
  const currentPhase = phases[currentPhaseIndex];
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      onDismiss();
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentPhaseIndex, onDismiss]);

  if (!currentPhase) return null;

  const completedPhases = phases.filter((_, i) => i < currentPhaseIndex).length;
  const totalPhases = phases.length;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={currentPhase.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-6'
        >
          {/* Backdrop */}
          <div className='absolute inset-0 bg-black/30 backdrop-blur-sm' onClick={() => { setShow(false); onDismiss(); }} aria-label="Dismiss phase transition" />

          {/* Card */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            role="status"
            aria-live="polite"
            aria-label="Phase transition notification"
            className='relative bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full overflow-hidden'
          >
            {/* Progress bar at top */}
            <div className='absolute top-0 left-0 right-0 h-1 bg-slate-100'>
              <motion.div
                className='h-full rounded-full'
                style={{ backgroundColor: `rgb(${primaryRgb})` }}
                initial={{ width: `${(completedPhases / totalPhases) * 100}%` }}
                animate={{ width: `${((completedPhases + 1) / totalPhases) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>

            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-xl flex items-center justify-center' style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)` }}>
                <AssistantAvatar state='success' className='!w-7 !h-7' />
              </div>
              <div>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
                  Phase {currentPhaseIndex + 1} of {totalPhases}
                </p>
                <h3 className='font-bold text-slate-900 text-sm leading-tight'>{currentPhase.label}</h3>
              </div>
            </div>

            <p className='text-xs text-slate-500 leading-relaxed mb-4'>{currentPhase.description}</p>

            {/* Phase dots */}
            <div className='flex items-center gap-1.5'>
              {phases.map((phase, i) => (
                <div key={phase.id} className='flex items-center gap-1.5'>
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentPhaseIndex ? 'bg-emerald-500' :
                    i === currentPhaseIndex ? 'ring-2' :
                    'bg-slate-200'
                  }`} style={i === currentPhaseIndex ? { backgroundColor: `rgb(${primaryRgb})`, boxShadow: `0 0 0 4px rgba(${primaryRgb}, 0.15)` } : undefined} />
                  {i < phases.length - 1 && (
                    <div className={`w-4 h-0.5 rounded-full ${i < currentPhaseIndex ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Completed phases summary */}
            {completedPhases > 0 && (
              <div className='mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold'>
                <CheckCircle2 className='w-3.5 h-3.5' />
                {completedPhases} phase{completedPhases > 1 ? 's' : ''} completed — {phases.filter((_, i) => i < currentPhaseIndex).map(p => p.label).join(' → ')}
              </div>
            )}

            <div className='mt-4 flex items-center gap-1.5 text-[11px] font-bold' style={{ color: `rgb(${primaryRgb})` }}>
              Starting next phase <ArrowRight className='w-3 h-3' />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
