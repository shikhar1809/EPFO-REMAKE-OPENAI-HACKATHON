import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { useAccountStore } from '../../store/useAccountStore';

export const RecentActivityCard: React.FC = () => {
  const { lastTransaction, establishments } = useAccountStore();
  const active = establishments.find(e => e.status === 'active');

  return (
    <div className='bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-slate-200/90 shadow-2xs'>
      <div className='flex items-center gap-1.5 mb-1.5'>
        <Clock className='!w-3.5 !h-3.5 text-slate-500' />
        <span className='text-[10px] font-bold text-slate-700 uppercase tracking-wider'>Recent Activity</span>
      </div>

      <div className='space-y-1'>
        {/* Last contribution */}
        <div className='flex items-center justify-between py-0.5'>
          <div className='flex items-center gap-1.5'>
            <div className='w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center'>
              <ArrowUpRight className='w-3 h-3 text-emerald-600' />
            </div>
            <div>
              <p className='text-[11px] font-semibold text-slate-800'>PF Contribution</p>
              <p className='text-[10px] text-slate-500'>{active?.name || 'Current Employer'}</p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-[11px] font-bold text-emerald-600'>+₹{lastTransaction.amount.toLocaleString('en-IN')}</p>
            <p className='text-[10px] text-slate-400'>{lastTransaction.date}</p>
          </div>
        </div>

        {/* Service summary */}
        <div className='border-t border-slate-100 pt-1 mt-0.5'>
          <div className='flex items-center justify-between text-[10px]'>
            <span className='text-slate-500'>Current Employer</span>
            <span className='font-semibold text-slate-700'>{active?.name || '—'}</span>
          </div>
          <div className='flex items-center justify-between text-[10px] mt-0.5'>
            <span className='text-slate-500'>Joined</span>
            <span className='font-semibold text-slate-700'>{active?.joinDate || '—'}</span>
          </div>
          <div className='flex items-center justify-between text-[10px] mt-0.5'>
            <span className='text-slate-500'>Last Contribution</span>
            <span className='font-semibold text-slate-700'>{active?.lastContribution || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
