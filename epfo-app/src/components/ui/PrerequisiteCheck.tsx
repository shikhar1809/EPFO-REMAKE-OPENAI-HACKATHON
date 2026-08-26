import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Button } from './Button';
import { useSessionStore } from '../../store/useSessionStore';
import { useDataStore } from '../../store/useDataStore';
import { useDemoStore } from '../../store/useDemoStore';

export interface Prerequisite {
  id: string;
  label: string;
  met: boolean;
  fixHint: string;
  fixRoute?: string;
  critical: boolean;
}

interface Props {
  flowType: string;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

function getPrerequisites(flowType: string, hasUan: boolean, hasProfile: boolean): Prerequisite[] {
  const base = [
    { id: 'uan', label: 'UAN is activated', met: hasUan, fixHint: 'Activate your UAN using Aadhaar-based OTP.', fixRoute: '/uan-activation', critical: true },
  ];

  switch (flowType) {
    case 'withdraw_pf':
      return [
        ...base,
        { id: 'kyc', label: 'KYC is linked (Aadhaar + PAN + Bank)', met: hasProfile, fixHint: 'Open Document Vault and connect DigiLocker to link your KYC.', fixRoute: '/documents', critical: true },
        { id: 'bank', label: 'Bank account is seeded with Aadhaar', met: hasProfile, fixHint: 'Link your bank account via the Document Vault.', fixRoute: '/documents', critical: true },
        { id: 'exit', label: 'Date of exit is marked on EPFO records', met: false, fixHint: 'Use "Mark Exit Date" to self-declare your leaving date (available 60 days after exit).', fixRoute: '/mark-exit', critical: false },
        { id: 'service', label: 'Minimum 5 years of service completed', met: true, fixHint: '', critical: false },
      ];
    case 'transfer_pf':
      return [
        ...base,
        { id: 'kyc', label: 'KYC is linked (Aadhaar + PAN)', met: hasProfile, fixHint: 'Open Document Vault and connect DigiLocker.', fixRoute: '/documents', critical: true },
        { id: 'prev', label: 'Previous employment records exist', met: true, fixHint: 'EPFO could not find old Member IDs. Contact your previous employer.', critical: true },
        { id: 'exit_old', label: 'Exit date marked on previous account', met: false, fixHint: 'Previous employer must mark your exit before transfer can proceed.', fixRoute: '/mark-exit', critical: false },
      ];
    case 'life_certificate':
      return [
        { id: 'pensioner', label: 'Registered as EPS-95 pensioner', met: true, fixHint: '', critical: true },
        { id: 'aadhaar', label: 'Aadhaar linked to PPO number', met: hasProfile, fixHint: 'Link Aadhaar via the Document Vault or visit your EPFO office.', fixRoute: '/documents', critical: true },
        { id: 'bank', label: 'Active bank account for pension credit', met: hasProfile, fixHint: 'Ensure your pension bank account is active and seeded.', fixRoute: '/documents', critical: true },
      ];
    case 'mark_exit':
      return [
        ...base,
        { id: 'employment', label: 'Active employment record found', met: true, fixHint: 'No employment records found on your UAN. Contact your employer.', critical: true },
        { id: 'days', label: 'At least 60 days since last working day', met: true, fixHint: 'You can self-declare exit only after 60 days of leaving.', critical: false },
      ];
    case 'grievance':
      return [
        { id: 'uan_g', label: 'UAN (optional but recommended)', met: hasUan, fixHint: 'Enter your UAN for faster grievance resolution.', fixRoute: '/uan-activation', critical: false },
        { id: 'mobile', label: 'Registered mobile number', met: true, fixHint: '', critical: true },
      ];
    case 'kyc_mismatch':
      return [
        ...base,
        { id: 'aadhaar_card', label: 'Original Aadhaar card available', met: hasProfile, fixHint: 'You need your Aadhaar card to verify correct name/DOB.', critical: true },
      ];
    case 'passbook':
      return [
        ...base,
      ];
    case 'uan_activation':
      return [
        { id: 'aadhaar_u', label: 'Aadhaar number available', met: hasProfile, fixHint: 'You need your 12-digit Aadhaar for activation.', critical: true },
        { id: 'mobile_u', label: 'Mobile linked to Aadhaar', met: true, fixHint: 'Ensure your mobile receives OTP from UIDAI.', critical: true },
      ];
    case 'merge_accounts':
      return [
        ...base,
        { id: 'aadhaar_merge', label: 'Aadhaar seeded on both UANs', met: hasProfile, fixHint: 'Both duplicate UANs must be Aadhaar-seeded for auto-merge.', critical: true },
        { id: 'kyc_merge', label: 'KYC verified on current UAN', met: hasProfile, fixHint: 'Complete KYC in Document Vault first.', fixRoute: '/documents', critical: true },
      ];
    default:
      return base;
  }
}

export const PrerequisiteCheck: React.FC<Props> = ({ flowType, isOpen, onClose, onContinue }) => {
  const navigate = useNavigate();
  const { user } = useSessionStore();
  const { profile } = useDataStore();
  const { isKycMissing } = useDemoStore();
  const [checks, setChecks] = useState<Prerequisite[]>([]);

  useEffect(() => {
    if (isOpen) {
      const hasUan = !!user?.uan;
      const hasProfile = isKycMissing() ? false : !!profile;
      setChecks(getPrerequisites(flowType, hasUan, hasProfile));
    }
  }, [isOpen, flowType, user, profile, isKycMissing]);

  const criticalMissing = checks.filter(c => c.critical && !c.met);
  const allMet = criticalMissing.length === 0;
  const totalMet = checks.filter(c => c.met).length;

  // Find the first critical missing item with a fix route
  const firstFixable = criticalMissing.find(c => c.fixRoute);

  const handleFixNow = () => {
    if (firstFixable?.fixRoute) {
      onClose();
      navigate(firstFixable.fixRoute);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4'
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className='bg-white w-[calc(100%-2rem)] sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col'
        >
          {/* Header */}
          <div className='px-5 pt-5 pb-3 border-b border-slate-100 flex items-start justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <div className='w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center'>
                  <ShieldCheck className='w-4 h-4 text-epfo-blue' />
                </div>
                <h2 className='text-base font-bold text-slate-900'>Prerequisite Check</h2>
              </div>
              <p className='text-xs text-slate-500 mt-1'>
                {allMet
                  ? 'All requirements met. You are ready to proceed.'
                  : `${totalMet} of ${checks.length} requirements met. ${criticalMissing.length} critical item${criticalMissing.length > 1 ? 's' : ''} missing.`}
              </p>
            </div>
            <button onClick={onClose} className='p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors'>
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Checklist */}
          <div className='flex-1 overflow-y-auto px-5 py-4 space-y-2'>
            {checks.map((check, idx) => (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-xl border ${
                  check.met
                    ? 'bg-emerald-50/50 border-emerald-200/60'
                    : check.critical
                      ? 'bg-red-50/50 border-red-200/60'
                      : 'bg-amber-50/50 border-amber-200/60'
                }`}
              >
                <div className='flex items-start gap-2.5'>
                  {check.met ? (
                    <CheckCircle2 className='w-4 h-4 text-emerald-500 shrink-0 mt-0.5' />
                  ) : (
                    <XCircle className={`w-4 h-4 shrink-0 mt-0.5 ${check.critical ? 'text-red-500' : 'text-amber-500'}`} />
                  )}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className={`text-sm font-medium ${check.met ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {check.label}
                      </p>
                      {check.critical && !check.met && (
                        <span className='text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase'>Required</span>
                      )}
                    </div>
                    {!check.met && check.fixHint && (
                      <p className='text-xs text-slate-600 mt-1 leading-relaxed'>{check.fixHint}</p>
                    )}
                    {!check.met && check.fixRoute && (
                      <button
                        onClick={() => { onClose(); navigate(check.fixRoute!); }}
                        className='mt-1.5 text-[11px] font-bold text-epfo-blue flex items-center gap-1 hover:underline'
                      >
                        Fix now <ArrowUpRight className='w-3 h-3' />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className='px-5 py-4 border-t border-slate-100 space-y-2'>
            {criticalMissing.length > 0 && (
              <div className='bg-red-50 border border-red-200 p-3 rounded-xl flex gap-2 items-start mb-2'>
                <AlertTriangle className='w-4 h-4 text-red-600 shrink-0 mt-0.5' />
                <p className='text-xs text-red-800 leading-relaxed'>
                  {criticalMissing.length} critical requirement{criticalMissing.length > 1 ? 's' : ''} missing. You must fix {criticalMissing.length > 1 ? 'these' : 'this'} before proceeding.
                </p>
              </div>
            )}

            {allMet ? (
              <Button onClick={onContinue} className='w-full'>
                <span className='flex items-center justify-center gap-2'>Continue <ArrowRight className='w-4 h-4' /></span>
              </Button>
            ) : firstFixable ? (
              <Button onClick={handleFixNow} className='w-full bg-epfo-blue'>
                <span className='flex items-center justify-center gap-2'>
                  Fix: {firstFixable.label.replace(/^./, s => s.toLowerCase())} <ArrowUpRight className='w-4 h-4' />
                </span>
              </Button>
            ) : (
              <Button onClick={onContinue} variant='outline' className='w-full opacity-50'>
                Continue Anyway
              </Button>
            )}

            <button onClick={onClose} className='w-full text-center text-xs text-slate-500 hover:text-slate-700 py-2 font-medium transition-colors'>
              Go Back
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
