import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAccountStore } from '../../store/useAccountStore';

export const AccountHealthCard: React.FC = () => {
  const { kycStatus, serviceMonths, exitStatus } = useAccountStore();

  const items = [
    {
      label: 'Aadhaar KYC',
      ok: kycStatus.aadhaar,
      detail: kycStatus.aadhaar ? 'Linked & verified' : 'Not linked',
    },
    {
      label: 'PAN KYC',
      ok: kycStatus.pan,
      detail: kycStatus.pan ? 'Verified' : 'Not linked',
    },
    {
      label: 'Bank KYC',
      ok: kycStatus.bank,
      detail: kycStatus.bank ? 'IFSC verified' : 'Not seeded',
    },
    {
      label: 'e-Nomination',
      ok: kycStatus.nominee,
      detail: kycStatus.nominee ? 'Filed' : 'Not filed',
    },
    {
      label: 'Exit Status',
      ok: exitStatus.marked,
      detail: exitStatus.marked ? `Marked (${exitStatus.date})` : 'Not marked',
    },
    {
      label: 'Service',
      ok: serviceMonths >= 12,
      detail: `${serviceMonths} months`,
    },
  ];

  const okCount = items.filter(i => i.ok).length;
  const score = Math.round((okCount / items.length) * 100);

  return (
    <div className='bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-2xs'>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-1.5'>
          {score === 100 ? (
            <ShieldCheck className='!w-3.5 !h-3.5 text-emerald-600' />
          ) : (
            <ShieldAlert className='!w-3.5 !h-3.5 text-amber-600' />
          )}
          <span className='text-[10px] font-bold text-slate-700 uppercase tracking-wider'>Account Details</span>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          score === 100 ? 'bg-emerald-100 text-emerald-700' :
          score >= 60 ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>{score}%</span>
      </div>

      <div className='space-y-0.5'>
        {items.map((item) => (
          <div key={item.label} className='flex items-center justify-between py-0.5'>
            <div className='flex items-center gap-1.5'>
              {item.ok ? (
                <CheckCircle2 className='w-3 h-3 text-emerald-500' />
              ) : (
                <AlertTriangle className='w-3 h-3 text-amber-500' />
              )}
              <span className='text-[11px] text-slate-600'>{item.label}</span>
            </div>
            <span className={`text-[10px] font-semibold ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
