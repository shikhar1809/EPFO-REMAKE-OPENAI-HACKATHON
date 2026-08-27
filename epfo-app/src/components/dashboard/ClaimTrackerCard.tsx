import React from 'react';
import { FileText, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { useDemoStore } from '../../store/useDemoStore';
import { useNavigate } from 'react-router-dom';

export const ClaimTrackerCard: React.FC = () => {
  const activeScenario = useDemoStore((s) => s.activeScenario);
  const navigate = useNavigate();
  
  let status = 'processing';
  if (activeScenario === 'claim_denied' || activeScenario === 'advance_rejected') {
    status = 'rejected';
  } else if (activeScenario === 'employer_hold') {
    status = 'employer';
  } else if (activeScenario === 'happy' || activeScenario.includes('multi_phase')) {
    status = 'field_office';
  }

  const getStepStatus = (step: number) => {
    if (status === 'rejected') {
      if (step === 1) return 'done';
      if (step === 2) return 'rejected';
      return 'pending';
    }
    if (status === 'employer') {
      if (step === 1) return 'done';
      if (step === 2) return 'active';
      return 'pending';
    }
    if (status === 'field_office') {
      if (step <= 2) return 'done';
      if (step === 3) return 'active';
      return 'pending';
    }
    return 'pending';
  };

  const Step = ({ title, date, state, isLast }: { title: string, date: string, state: 'done' | 'active' | 'pending' | 'rejected', isLast?: boolean }) => (
    <div className='flex gap-2.5 relative'>
      {!isLast && (
        <div className={`absolute left-[7px] top-4 bottom-[-8px] w-0.5 ${state === 'done' ? 'bg-emerald-500' : 'bg-slate-100'}`} />
      )}
      <div className='relative z-10 shrink-0 mt-0.5'>
        {state === 'done' ? (
          <div className='w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center'>
            <CheckCircle2 className='w-2.5 h-2.5 text-white' />
          </div>
        ) : state === 'active' ? (
          <div className='w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-amber-100'>
            <Clock className='w-2.5 h-2.5 text-white' />
          </div>
        ) : state === 'rejected' ? (
          <div className='w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center'>
            <span className='text-[10px] text-white font-bold inline-block leading-none mb-[1px]'>!</span>
          </div>
        ) : (
          <div className='w-4 h-4 rounded-full bg-slate-100 border border-slate-200' />
        )}
      </div>
      <div className='pb-2.5'>
        <p className={`text-[11px] font-semibold ${state === 'active' ? 'text-amber-700' : state === 'rejected' ? 'text-rose-700' : state === 'done' ? 'text-slate-800' : 'text-slate-400'}`}>
          {title}
        </p>
        <p className='text-[9px] text-slate-500'>{date}</p>
      </div>
    </div>
  );

  return (
    <div className='bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-slate-200/90 shadow-2xs cursor-pointer hover:bg-slate-50/50 transition-colors' onClick={() => navigate('/claim')}>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-1.5'>
          <FileText className='!w-3.5 !h-3.5 text-slate-500' />
          <span className='text-[10px] font-bold text-slate-700 uppercase tracking-wider'>Track Application</span>
        </div>
        <div className='text-[9px] font-bold text-epfo-blue hover:underline flex items-center'>
          Form 31 <ChevronRight className='w-3 h-3' />
        </div>
      </div>

      <div className='pl-1 mt-2.5'>
        <Step title='Claim Submitted at Portal' date='24 Aug 2026, 10:30 AM' state={getStepStatus(1)} />
        <Step title={status === 'employer' ? 'Pending with Employer' : status === 'rejected' ? 'Rejected' : 'Sent to Field Office'} date={status === 'rejected' ? '25 Aug 2026, 02:15 PM' : (getStepStatus(1) === 'done' ? '24 Aug 2026, 10:35 AM' : '--')} state={getStepStatus(2)} />
        <Step title='Under Process' date={getStepStatus(3) === 'active' ? '26 Aug 2026, 11:20 AM' : '--'} state={getStepStatus(3)} />
        <Step title='Settled' date='--' state={getStepStatus(4)} isLast />
      </div>
    </div>
  );
};
