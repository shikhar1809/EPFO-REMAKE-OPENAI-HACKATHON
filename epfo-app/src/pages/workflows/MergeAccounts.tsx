import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowRight,
  Info,
  GitMerge,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { OtpFallbackOptions } from '../../components/ui/OtpFallbackOptions';
import { useSessionStore } from '../../store/useSessionStore';
import toast from 'react-hot-toast';
import { FlowInfoCard } from '../../components/ui/FlowInfoCard';

// Mock duplicate UAN accounts
const duplicateAccounts = [
  {
    uan: '100123456789',
    memberId: 'MHBAN0011928300009412',
    establishmentName: 'Tata Consultancy Services Ltd',
    doj: '01 Nov 2022',
    dol: '15 Mar 2024',
    balance: 67230,
    isActive: false,
    aadhaarSeeded: true,
  },
  {
    uan: '100987654321',
    memberId: 'DLDLH0056789000001234',
    establishmentName: 'Apex Logistics & Warehousing Pvt Ltd',
    doj: '12 Jan 2021',
    dol: null,
    balance: 167330,
    isActive: true,
    aadhaarSeeded: true,
  },
];

export const MergeAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { stepUpAuth } = useSessionStore();

  const [step, setStep] = useState<'review' | 'confirm' | 'otp' | 'processing' | 'success'>('review');
  const [selectedToMerge, setSelectedToMerge] = useState<string[]>([duplicateAccounts[0].uan]);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);

  const activeAccount = duplicateAccounts.find(a => a.isActive);
  const inactiveAccounts = duplicateAccounts.filter(a => !a.isActive);
  const totalOldBalance = inactiveAccounts
    .filter(a => selectedToMerge.includes(a.uan))
    .reduce((sum, a) => sum + a.balance, 0);

  const handleToggleAccount = (uan: string) => {
    setSelectedToMerge(prev =>
      prev.includes(uan) ? prev.filter(u => u !== uan) : [...prev, uan]
    );
  };

  const handleProceed = () => {
    if (selectedToMerge.length === 0) {
      toast.error(t('mrg_toast_select_at_least_one'));
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('otp');
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const verified = await stepUpAuth(otp || '1234');
    setIsSubmitting(false);

    if (verified) {
      setAuthError(false);
      setStep('processing');
      // Simulate processing
      setTimeout(() => {
        setOperationId(`OP-MRG-${Math.floor(Math.random() * 1000000)}`);
        setStep('success');
        toast.success(t('mrg_toast_merged_success'));
      }, 3000);
    } else {
      setAuthError(true);
      toast.error(t('mrg_toast_invalid_otp'));
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent relative overflow-y-auto pb-12'>
      {/* Header */}
      <div className='bg-white/90 backdrop-blur-md px-4 py-4 flex items-center sticky top-0 z-20 border-b border-slate-100 shadow-sm'>
        <button
          onClick={() => {
            if (step === 'review') navigate(-1);
            else if (step === 'confirm') setStep('review');
            else if (step === 'otp') setStep('confirm');
            else navigate(-1);
          }}
          aria-label={t('mrg_aria_go_back')}
          className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>
        <div className='ml-2 flex-1'>
          <h1 className='text-lg font-bold text-slate-900 leading-tight'>{t('mrg_title_merge_duplicate')}</h1>
          <p className='text-xs text-slate-500 font-medium'>{t('mrg_subtitle_one_member_one_epf')}</p>
        </div>
      </div>

      <div className='p-5 space-y-5 max-w-md mx-auto w-full'>
        {step === 'review' && <FlowInfoCard flowType="merge_accounts" />}

        {/* STEP 1: REVIEW DUPLICATE ACCOUNTS */}
        {step === 'review' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            <div className='bg-blue-50/90 backdrop-blur-sm border border-blue-200/80 rounded-2xl p-4 flex gap-3 items-start shadow-sm'>
              <Info className='w-5 h-5 text-epfo-blue shrink-0 mt-0.5' />
              <div className='text-xs text-blue-950 leading-relaxed'>
                <p className='font-bold text-blue-900 mb-0.5'>{t('mrg_info_one_member_one_epf')}</p>
                <p>{t('mrg_info_epfo_detected')}</p>
              </div>
            </div>

            {/* Active Account (Target) */}
            <div className='bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <span className='bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase'>{t('mrg_badge_active_target')}</span>
                <CheckCircle2 className='w-4 h-4 text-emerald-500' />
              </div>
              <h3 className='font-bold text-sm text-slate-900'>{activeAccount?.establishmentName}</h3>
              <p className='text-[11px] font-mono text-slate-500 mt-0.5'>UAN: {activeAccount?.uan}</p>
              <div className='grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600'>
                <div>
                  <p className='text-[10px] text-slate-400'>{t('mrg_label_joined')}</p>
                  <p className='font-medium text-slate-700'>{activeAccount?.doj}</p>
                </div>
                <div>
                  <p className='text-[10px] text-slate-400'>{t('mrg_label_pf_balance')}</p>
                  <p className='font-bold text-emerald-700'>₹{activeAccount?.balance.toLocaleString()}</p>
                </div>
              </div>
              <p className='text-[11px] text-slate-500 mt-2 italic'>{t('mrg_active_balances_transferred')}</p>
            </div>

            {/* Inactive Accounts (Select to merge) */}
            <h2 className='text-sm font-bold text-slate-800 uppercase tracking-wider px-1'>{t('mrg_heading_select_accounts')}</h2>

            <div className='space-y-3'>
              {inactiveAccounts.map(acc => {
                const isSelected = selectedToMerge.includes(acc.uan);
                return (
                  <button
                    key={acc.uan}
                    onClick={() => handleToggleAccount(acc.uan)}
                    className={`w-full p-4 bg-white/90 backdrop-blur-sm border rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'border-epfo-blue bg-blue-50/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-epfo-blue border-epfo-blue' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 className='w-3 h-3 text-white' />}
                        </div>
                        <div>
                          <h3 className='font-bold text-sm text-slate-900'>{acc.establishmentName}</h3>
                          <p className='text-[11px] font-mono text-slate-500 mt-0.5'>UAN: {acc.uan}</p>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600'>
                      <div>
                        <p className='text-[10px] text-slate-400'>{t('mrg_label_joined')}</p>
                        <p className='font-medium text-slate-700'>{acc.doj}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-slate-400'>{t('mrg_label_left')}</p>
                        <p className='font-medium text-slate-700'>{acc.dol || t('mrg_na')}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-slate-400'>{t('mrg_label_balance')}</p>
                        <p className='font-bold text-epfo-blue'>₹{acc.balance.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className='mt-2 flex items-center gap-2 text-[10px]'>
                      {acc.aadhaarSeeded ? (
                        <span className='bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold'>{t('mrg_badge_aadhaar_seeded')}</span>
                      ) : (
                        <span className='bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold'>{t('mrg_badge_aadhaar_not_seeded')}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Summary Card */}
            {selectedToMerge.length > 0 && (
              <div className='bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2' role="status" aria-label={t('mrg_aria_merge_summary')}>
                <div className='flex justify-between text-xs'>
                  <span className='text-slate-500'>{t('mrg_summary_accounts_to_merge')}</span>
                  <span className='font-bold text-slate-900'>{selectedToMerge.length}</span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span className='text-slate-500'>{t('mrg_summary_old_balance')}</span>
                  <span className='font-bold text-epfo-blue'>₹{totalOldBalance.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-xs pt-2 border-t border-slate-100'>
                  <span className='text-slate-500'>{t('mrg_summary_projected_total')}</span>
                  <span className='font-bold text-emerald-700'>₹{(activeAccount?.balance || 0 + totalOldBalance).toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button onClick={handleProceed} className='w-full py-3.5 font-semibold text-sm' disabled={selectedToMerge.length === 0}>
              {t('mrg_btn_proceed_to_review')} <ArrowRight className='w-4 h-4 ml-1' />
            </Button>
          </motion.div>
        )}

        {/* STEP 2: CONFIRM MERGE */}
        {step === 'confirm' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className='space-y-4'>
            <div className='bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4'>
              <div className='border-b border-slate-100 pb-3'>
                <h3 className='font-bold text-slate-900 text-base flex items-center gap-2'>
                  <GitMerge className='w-4 h-4 text-epfo-blue' />
                  {t('mrg_heading_confirm_merge')}
                </h3>
              </div>

              <div className='space-y-3 text-xs'>
                <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-3'>
                  <p className='text-[10px] text-emerald-600 font-bold uppercase mb-1'>{t('mrg_label_target_account')}</p>
                  <p className='font-bold text-slate-900'>UAN {activeAccount?.uan}</p>
                  <p className='text-slate-600'>{activeAccount?.establishmentName}</p>
                </div>

                <div className='flex items-center justify-center'>
                  <div className='w-px h-6 bg-slate-200' />
                  <div className='mx-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1'>
                    <span className='text-[10px] font-bold text-epfo-blue'>{t('mrg_accounts_merging', { count: selectedToMerge.length })}</span>
                  </div>
                  <div className='w-px h-6 bg-slate-200' />
                </div>

                {duplicateAccounts.filter(a => selectedToMerge.includes(a.uan)).map(acc => (
                  <div key={acc.uan} className='bg-slate-50 border border-slate-200 rounded-xl p-3'>
                    <p className='text-[10px] text-slate-400 font-bold uppercase mb-1'>{t('mrg_label_source_account')}</p>
                    <p className='font-bold text-slate-900'>UAN {acc.uan}</p>
                    <p className='text-slate-600'>{acc.establishmentName}</p>
                    <p className='font-bold text-epfo-blue mt-1'>₹{acc.balance.toLocaleString()}</p>
                  </div>
                ))}

                <div className='bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2'>
                  <AlertTriangle className='w-4 h-4 text-amber-600 shrink-0 mt-0.5' />
                  <span className='text-amber-900'>
                    {t('mrg_attestation_warning')}
                  </span>
                </div>
              </div>

              <Button onClick={handleConfirm} className='w-full py-3.5 font-semibold text-sm' aria-label={t('mrg_aria_confirm_merge')}>
                {t('mrg_btn_confirm_and_proceed_otp')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: AADHAAR OTP VERIFICATION */}
        {step === 'otp' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-md text-center space-y-4'>
              <div className='w-14 h-14 bg-blue-50 text-epfo-blue rounded-full mx-auto flex items-center justify-center'>
                <Lock className='w-7 h-7' />
              </div>

              <div>
                <h2 className='text-lg font-bold text-slate-900'>{t('mrg_heading_aadhaar_signature')}</h2>
                <p className='text-xs text-slate-500 mt-1'>
                  {t('mrg_aadhaar_otp_instruction')}
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className='space-y-4 pt-2'>
                <input
                  id="merge-otp"
                  type='text'
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder='1234'
                  aria-label={t('mrg_aria_enter_otp')}
                  className='w-40 mx-auto text-center tracking-widest text-2xl font-bold p-3 border-2 border-epfo-blue/40 rounded-2xl focus:border-epfo-blue outline-none bg-slate-50'
                  autoFocus
                  required
                />

                <p className='text-[11px] text-slate-400'>
                  {t('mrg_hint_enter', { otp: '1234' })}
                </p>

                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full py-3.5 font-semibold'
                >
                  {isSubmitting ? t('mrg_btn_signing_request') : t('mrg_btn_sign_submit')}
                </Button>
                {authError && <OtpFallbackOptions variant='compact' />}
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 4: PROCESSING */}
        {step === 'processing' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xl text-center space-y-4'>
              <div className='w-16 h-16 bg-blue-50 text-epfo-blue rounded-full mx-auto flex items-center justify-center'>
                <Loader2 className='w-8 h-8 animate-spin' />
              </div>
              <h2 className='text-lg font-bold text-slate-900'>{t('mrg_heading_merging')}</h2>
              <p className='text-xs text-slate-500'>{t('mrg_processing_submitting')}</p>
              <div className='w-full bg-slate-100 rounded-full h-2 overflow-hidden'>
                <motion.div
                  className='bg-epfo-blue h-full rounded-full'
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: SUCCESS STATE */}
        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-emerald-200 rounded-3xl p-6 shadow-xl text-center space-y-4'>
              <div className='w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-sm'>
                <CheckCircle2 className='w-10 h-10' />
              </div>

              <div>
                <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200'>
                  {t('mrg_badge_request_filed')}
                </span>
                <h2 className='text-xl font-bold text-slate-900 mt-2'>{t('mrg_heading_consolidation_initiated')}</h2>
                <p className='text-xs text-slate-500 mt-1'>
                  {t('mrg_success_description')}
                </p>
              </div>

              <div className='bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('mrg_success_operation_id')}</span>
                  <span className='font-mono font-bold text-slate-900'>{operationId}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('mrg_success_accounts_merged')}</span>
                  <span className='font-bold text-slate-900'>{selectedToMerge.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('mrg_success_balance_transferred')}</span>
                  <span className='font-bold text-epfo-blue'>₹{totalOldBalance.toLocaleString()}</span>
                </div>
                <div className='flex justify-between pt-1 border-t border-slate-200'>
                  <span className='text-slate-500'>{t('mrg_success_next_step')}</span>
                  <span className='font-semibold text-amber-700'>{t('mrg_success_awaiting_attestation')}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                aria-label={t('mrg_aria_back_to_dashboard')}
                className='w-full py-2 text-slate-500 text-xs hover:text-slate-800'
              >
                {t('mrg_btn_back_to_dashboard')}
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
