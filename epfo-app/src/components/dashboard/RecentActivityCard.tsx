import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { useAccountStore } from '../../store/useAccountStore';

export const RecentActivityCard: React.FC = () => {
  const { lastTransaction, establishments } = useAccountStore();
  const active = establishments.find(e => e.status === 'active');

  return (
    <div className='bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xs'>
      <div className='flex items-center gap-2 mb-3'>
        <Clock className='!w-4 !h-4 text-slate-500' />
        <span className='text-[11px] font-bold text-slate-700 uppercase tracking-wider'>Recent Activity</span>
      </div>

      <div className='space-y-2'>
        {/* Last contribution */}
        <div className='flex items-center justify-between py-1.5'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center'>
              <ArrowUpRight className='w-3 h-3 text-emerald-600' />
            </div>
            <div>
              <p className='text-xs font-semibold text-slate-800'>PF Contribution</p>
              <p className='text-[10px] text-slate-500'>{active?.name || 'Current Employer'}</p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-xs font-bold text-emerald-600'>+₹{lastTransaction.amount.toLocaleString('en-IN')}</p>
            <p className='text-[10px] text-slate-400'>{lastTransaction.date}</p>
          </div>
        </div>

        {/* Service summary */}
        <div className='border-t border-slate-100 pt-2 mt-1'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='text-slate-500'>Current Employer</span>
            <span className='font-semibold text-slate-700'>{active?.name || '—'}</span>
          </div>
          <div className='flex items-center justify-between text-[11px] mt-1'>
            <span className='text-slate-500'>Joined</span>
            <span className='font-semibold text-slate-700'>{active?.joinDate || '—'}</span>
          </div>
          <div className='flex items-center justify-between text-[11px] mt-1'>
            <span className='text-slate-500'>Last Contribution</span>
            <span className='font-semibold text-slate-700'>{active?.lastContribution || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
