import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useDataStore } from '../../store/useDataStore';
import { useTranslation } from 'react-i18next';

export interface FlowHint {
  icon?: 'info' | 'warning';
  text: string;
  source?: string;
  // Condition: if returns false, hint is hidden
  condition?: (ctx: { hasUan: boolean; hasProfile: boolean; serviceYears: number }) => boolean;
}

export const flowKnowledge: Record<string, FlowHint[]> = {
  withdraw_pf: [
    { text: 'Form 19 (full settlement) requires 2+ months of unemployment after leaving, or reaching retirement age. Form 31 (advance) is for while still employed. Form 10C (pension) is only for total service under 10 years.', source: 'EPFO' },
    { text: 'Aadhaar-UAN linking removes the need for employer signature entirely — otherwise a Non-Aadhaar form needs attestation by a Bank Manager, Gazetted Officer, or Magistrate.', source: 'EPFO', condition: ({ hasProfile }) => !hasProfile },
    { text: 'Your Aadhaar is linked, so this claim can be submitted without employer attestation.', source: 'EPFO', condition: ({ hasProfile }) => hasProfile },
    { text: 'Know your exact bank account number (or at least last 4 digits) and have a cancelled cheque or passbook scan ready.', source: 'EPFO' },
    { icon: 'warning', text: 'Under 5 years of service means TDS applies on withdrawal unless the amount is below ₹50,000.', source: 'Income Tax Act', condition: ({ serviceYears }) => serviceYears < 5 },
  ],
  transfer_pf: [
    { text: 'Requires having already changed jobs and holding a new active Member ID under the same UAN — the flow will fail if exit date is not marked with the previous employer first.', source: 'EPFO' },
    { text: 'Current-employer-initiated transfer is usually faster since the new employer has an active digital signature and incentive to complete onboarding.', source: 'Pensionbazaar' },
  ],
  kyc_mismatch: [
    { text: "This is a jointly signed form — both employee and employer must sign, and it goes to the Regional PF Commissioner, so it can't be self-serve online for major mismatches.", source: 'EPFO' },
    { text: 'Have self-attested proof copies ready (Aadhaar, PAN, marksheet, etc.) — we will ask for these upfront, not at submission.', source: 'EPFO' },
    { icon: 'warning', text: 'If the company has shut down, the form can instead be attested by a Bank Manager, Gazetted Officer, or Magistrate.', source: 'EPFO' },
  ],
  merge_accounts: [
    { text: 'Same prerequisite as transfer: exit date must be marked on the old account first.', source: 'EPFO' },
    { text: 'Know which UAN is currently active vs. dormant before the flow asks you to pick the target account.', source: 'EPFO' },
  ],
  life_certificate: [
    { text: 'Needs a working front camera for Face Auth, or be ready to pay the ₹70 fee for a postman visit if you choose that path.', source: 'Jeevan Pramaan' },
    { text: 'Your Pension Account Number (PPO number) should be handy before starting.', source: 'EPFO' },
  ],
  mark_exit: [
    { text: 'Know your exact last working day — EPFO cross-checks this against the employer\'s own exit record, and a mismatched exit date between PF and EPS records can block Form 13 later.', source: 'EPFO' },
  ],
  uan_activation: [
    { text: 'Aadhaar must already be linked to your current mobile number — the activation OTP flow fails silently otherwise.', source: 'EPFO' },
  ],
  grievance: [
    { text: 'Have your UAN, registered mobile number, and any previous correspondence or reference numbers ready.', source: 'EPFiGMS' },
  ],
  passbook: [
    { text: 'Your passbook reflects contributions updated to the previous month. Current-month entries may not appear until the 15th.', source: 'EPFO' },
  ],
  general_inquiry: [
    { text: 'Keep your UAN and Aadhaar handy — most EPFO lookups require one of these identifiers.', source: 'EPFO' },
  ],
};

export const FlowInfoCard: React.FC<{ flowType: string; className?: string }> = ({ flowType, className = '' }) => {
  const { user } = useSessionStore();
  const { profile } = useDataStore();
  const { t } = useTranslation();

  const ctx = {
    hasUan: !!user?.uan,
    hasProfile: !!profile,
    serviceYears: 3, // mock: under 5 years for demo
  };

  const allHints = flowKnowledge[flowType];
  if (!allHints || allHints.length === 0) return null;

  const hints = allHints.filter(h => (h.condition ? h.condition(ctx) : true));
  if (hints.length === 0) return null;

  const getHintT = (text: string) => {
    if (text.includes('Form 19 (full settlement)')) return t('sf_form19_warning', text);
    return t(text, text);
  };

  return (
    <div className={`bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-2.5 ${className}`}>
      <div className='flex items-center gap-2 mb-1'>
        <Info className='w-4 h-4 text-amber-600' />
        <p className='text-xs font-bold text-amber-900 uppercase tracking-wider'>{t('sf_before_start', 'Before You Start')}</p>
      </div>
      {hints.map((hint, idx) => (
        <div key={idx} className='flex items-start gap-2'>
          {hint.icon === 'warning' ? (
            <AlertTriangle className='w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5' />
          ) : (
            <div className='w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5' />
          )}
          <p className='text-[11px] text-amber-900 leading-relaxed'>
            {getHintT(hint.text)}
            {hint.source && <span className='text-amber-600 font-semibold ml-1'>({hint.source})</span>}
          </p>
        </div>
      ))}
    </div>
  );
};
