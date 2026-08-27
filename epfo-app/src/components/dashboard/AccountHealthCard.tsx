import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAccountStore } from '../../store/useAccountStore';
import { useDemoStore } from '../../store/useDemoStore';

export const AccountHealthCard: React.FC = () => {
  const navigate = useNavigate();
  const { serviceMonths } = useAccountStore();
  const sc = useDemoStore(s => s.activeScenario);

  const isKycMissing = sc === 'no_kyc';
  const isKycMismatch = sc === 'kyc_wrong';
  const isAadhaarConflict = sc === 'aadhaar_conflict';
  const isBankNotSeeded = sc === 'bank_not_seeded';
  const isNomineeMissing = sc === 'no_nominee';
  const isExitNotMarked = sc === 'no_exit';

  const aadhaarOk = !(isKycMissing || isKycMismatch || isAadhaarConflict);
  const panOk = !(isKycMissing || isKycMismatch);
  const bankOk = !(isKycMissing || isBankNotSeeded);
  const nomineeOk = !isNomineeMissing;
  const exitOk = !isExitNotMarked;
  const serviceOk = serviceMonths >= 12;

  const aadhaarDetail = isAadhaarConflict ? 'Linked to wrong UAN' : isKycMismatch ? 'Mismatch detected' : aadhaarOk ? 'Linked & verified' : 'Not linked';
  const panDetail = isKycMismatch ? 'Mismatch detected' : panOk ? 'Verified' : 'Not linked';

  const items = [
    { label: 'Aadhaar KYC', ok: aadhaarOk, detail: aadhaarDetail },
    { label: 'PAN KYC', ok: panOk, detail: panDetail },
    { label: 'Bank KYC', ok: bankOk, detail: bankOk ? 'IFSC verified' : 'Not seeded' },
    { label: 'e-Nomination', ok: nomineeOk, detail: nomineeOk ? 'Filed' : 'Not filed' },
    { label: 'Exit Status', ok: exitOk, detail: exitOk ? 'Marked (23 Jul 2026)' : 'Not marked' },
    { label: 'Service', ok: serviceOk, detail: `${serviceMonths} months` },
  ];

  const okCount = items.filter(i => i.ok).length;
  const score = Math.round((okCount / items.length) * 100);

  let fixAction: { label: string; path: string } | null = null;
  if (isKycMissing) fixAction = { label: 'Resolve KYC', path: '/documents' };
  else if (isKycMismatch || isAadhaarConflict) fixAction = { label: 'Fix KYC', path: '/kyc-mismatch' };
  else if (isBankNotSeeded) fixAction = { label: 'Fix Bank', path: '/documents' };
  else if (isNomineeMissing) fixAction = { label: 'File Nomination', path: '/smart-flow' };
  else if (isExitNotMarked) fixAction = { label: 'Mark Exit', path: '/mark-exit' };

  return (
    <div className='bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-slate-200/90 shadow-2xs'>
      <div className='flex items-center justify-between mb-1.5'>
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

      <div className='space-y-0'>
        {items.map((item) => (
          <div key={item.label} className='flex items-center justify-between py-[3px]'>
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

      {fixAction && (
        <button
          onClick={() => navigate(fixAction.path)}
          className='mt-1.5 w-full flex items-center justify-between gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-epfo-blue/30 hover:border-epfo-blue text-epfo-blue font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all group'
        >
          <span>{fixAction.label}</span>
          <ArrowRight className='w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform' />
        </button>
      )}
    </div>
  );
};