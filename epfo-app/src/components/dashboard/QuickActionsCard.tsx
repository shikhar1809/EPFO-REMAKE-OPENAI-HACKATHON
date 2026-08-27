import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRightLeft, Award, CalendarX2, FileText, HelpCircle } from 'lucide-react';

const ACTIONS = [
  { label: 'Withdraw PF', desc: 'Form 31/19/10C', icon: Wallet, path: '/smart-flow', color: 'bg-blue-50 text-blue-600', query: 'I want to withdraw PF' },
  { label: 'Transfer PF', desc: 'One Member One EPF', icon: ArrowRightLeft, path: '/smart-flow', color: 'bg-indigo-50 text-indigo-600', query: 'Transfer my old PF account' },
  { label: 'Life Certificate', desc: 'Jeevan Pramaan', icon: Award, path: '/smart-flow', color: 'bg-teal-50 text-teal-600', query: 'Submit my life certificate' },
  { label: 'Mark Exit', desc: 'Self-declare date', icon: CalendarX2, path: '/smart-flow', color: 'bg-amber-50 text-amber-600', query: 'Mark my exit date' },
  { label: 'File Grievance', desc: 'EPFiGMS ticket', icon: HelpCircle, path: '/smart-flow', color: 'bg-rose-50 text-rose-600', query: 'File a grievance' },
  { label: 'View Claims', desc: 'Claim status', icon: FileText, path: '/claim', color: 'bg-emerald-50 text-emerald-600' },
];

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider px-0.5 mb-2'>
        Quick Actions
      </h2>
      <div className='grid grid-cols-3 gap-2'>
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className='p-3 bg-white/95 hover:bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col items-center text-center transition-all shadow-2xs hover:shadow-xs group'
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${action.color} group-hover:scale-105 transition-transform`}>
                <Icon className='w-4 h-4' />
              </div>
              <span className='text-[11px] font-bold text-slate-800 leading-tight'>{action.label}</span>
              <span className='text-[9px] text-slate-500 mt-0.5'>{action.desc}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
