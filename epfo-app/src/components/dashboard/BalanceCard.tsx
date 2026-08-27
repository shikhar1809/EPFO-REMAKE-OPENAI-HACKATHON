import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAccountStore } from '../../store/useAccountStore';

export const BalanceCard: React.FC = () => {
  const navigate = useNavigate();
  const { balance } = useAccountStore();
  const total = balance.total;
  const empPct = (balance.employee / total) * 100;
  const erPct = (balance.employer / total) * 100;
  const pensionPct = (balance.pension / total) * 100;

  return (
    <div className='bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-lg'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className='bg-white/10 p-1.5 rounded-lg'>
            <Wallet className='!w-4 !h-4' />
          </div>
          <span className='text-[11px] font-medium text-white/60'>Total PF Balance</span>
        </div>
        <button
          onClick={() => navigate('/passbook')}
          className='text-[10px] font-bold text-white/50 hover:text-white/80 transition-colors underline underline-offset-2'
        >
          View Passbook
        </button>
      </div>

      <div className='mb-3'>
        <span className='text-2xl font-bold tracking-tight'>₹{total.toLocaleString('en-IN')}</span>
      </div>

      {/* Colored breakdown bar */}
      <div className='h-2 rounded-full overflow-hidden flex bg-white/10'>
        <div className='bg-emerald-400 h-full' style={{ width: `${empPct}%` }} />
        <div className='bg-blue-400 h-full' style={{ width: `${erPct}%` }} />
        <div className='bg-amber-400 h-full' style={{ width: `${pensionPct}%` }} />
      </div>

      <div className='flex gap-4 mt-2'>
        <div className='flex items-center gap-1.5'>
          <div className='w-2 h-2 rounded-full bg-emerald-400' />
          <span className='text-[10px] text-white/50'>Employee ₹{balance.employee.toLocaleString('en-IN')}</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='w-2 h-2 rounded-full bg-blue-400' />
          <span className='text-[10px] text-white/50'>Employer ₹{balance.employer.toLocaleString('en-IN')}</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div className='w-2 h-2 rounded-full bg-amber-400' />
          <span className='text-[10px] text-white/50'>Pension ₹{balance.pension.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};
