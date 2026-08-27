import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { OtpFallbackOptions } from '../../components/ui/OtpFallbackOptions';
import { useSessionStore } from '../../store/useSessionStore';
import toast from 'react-hot-toast';

// Mock EPFO records vs Aadhaar records
const epfoRecords = {
  name: 'RAJESH KUMAR',
  dob: '15/08/1990',
  gender: 'Male',
  fatherName: 'SURESH KUMAR',
};

const aadhaarRecords = {
  name: 'Rajesh Kumar Sharma',
  dob: '15/08/1992',
  gender: 'Male',
  fatherName: 'Suresh Kumar Sharma',
};

type FieldKey = 'name' | 'dob' | 'gender' | 'fatherName';

interface DiffField {
  key: FieldKey;
  label: string;
  epfoValue: string;
  aadhaarValue: string;
  mismatch: boolean;
}

function getDiffFields(): DiffField[] {
  const keys: FieldKey[] = ['name', 'dob', 'gender', 'fatherName'];

  return keys.map(key => ({
    key,
    label: key,
    epfoValue: epfoRecords[key],
    aadhaarValue: aadhaarRecords[key],
    mismatch: epfoRecords[key] !== aadhaarRecords[key],
  }));
}

export const KycMismatch: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { stepUpAuth } = useSessionStore();

  const [step, setStep] = useState<'diff' | 'otp' | 'success'>('diff');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);

  const diffFields = getDiffFields();
  const mismatchFields = diffFields.filter(f => f.mismatch);
  const [selectedFields, setSelectedFields] = useState<FieldKey[]>(mismatchFields.map(f => f.key));

  const toggleField = (key: FieldKey) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleProceed = () => {
    if (selectedFields.length === 0) {
      toast.error(t('kym_toast_select_field'));
      return;
    }
    setStep('otp');
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const verified = await stepUpAuth(otp || '1234');
    setIsSubmitting(false);

    if (verified) {
      setAuthError(false);
      setStep('success');
      toast.success(t('kym_toast_submitted'));
    } else {
      setAuthError(true);
      toast.error(t('kym_toast_invalid_otp'));
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent relative overflow-y-auto pb-12'>
      {/* Header */}
      <div className='bg-white/90 backdrop-blur-md px-4 py-4 flex items-center sticky top-0 z-20 border-b border-slate-100 shadow-sm'>
        <button
          onClick={() => {
            if (step === 'diff') navigate(-1);
            else if (step === 'otp') setStep('diff');
            else navigate(-1);
          }}
          aria-label={t('kym_aria_go_back')}
          className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>
        <div className='ml-2 flex-1'>
          <h1 className='text-lg font-bold text-slate-900 leading-tight'>{t('kym_title')}</h1>
          <p className='text-xs text-slate-500 font-medium'>{t('kym_subtitle')}</p>
        </div>
      </div>

      <div className='p-5 space-y-5 max-w-md mx-auto w-full'>

        {/* STEP 1: DIFF TABLE */}
        {step === 'diff' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            <div className='bg-blue-50/90 backdrop-blur-sm border border-blue-200/80 rounded-2xl p-4 flex gap-3 items-start shadow-sm'>
              <Info className='w-5 h-5 text-epfo-blue shrink-0 mt-0.5' />
              <div className='text-xs text-blue-950 leading-relaxed'>
                <p className='font-bold text-blue-900 mb-0.5'>{t('kym_comparison_title')}</p>
                <p>{t('kym_comparison_body')}</p>
              </div>
            </div>

            {/* Diff Table */}
            <div className='bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden shadow-sm'>
              {/* Table Header */}
              <div className='grid grid-cols-[1fr_1fr_1fr_auto] gap-0 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider'>
                <div className='px-3 py-2.5'>{t('kym_table_field')}</div>
                <div className='px-3 py-2.5'>{t('kym_table_epfo')}</div>
                <div className='px-3 py-2.5'>{t('kym_table_aadhaar')}</div>
                <div className='px-3 py-2.5 w-8'></div>
              </div>

              {/* Table Rows */}
              {diffFields.map((field, idx) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => field.mismatch && toggleField(field.key)}
                  className={`grid grid-cols-[1fr_1fr_1fr_auto] gap-0 border-b border-slate-100 last:border-b-0 text-xs ${
                    field.mismatch ? 'cursor-pointer' : ''
                  } ${
                    field.mismatch && selectedFields.includes(field.key)
                      ? 'bg-blue-50/80'
                      : field.mismatch
                        ? 'bg-red-50/40'
                        : 'bg-emerald-50/30'
                  }`}
                >
                  <div className='px-3 py-3 font-bold text-slate-700 flex items-center gap-1.5'>
                    {t(`kym_field_${field.label}`)}
                    {field.mismatch && (
                      <span className='text-[8px] font-bold bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase'>{t('kym_field_mismatch')}</span>
                    )}
                  </div>
                  <div className='px-3 py-3 text-slate-600 font-medium'>
                    {field.epfoValue}
                  </div>
                  <div className={`px-3 py-3 font-medium ${field.mismatch ? 'text-epfo-blue' : 'text-slate-600'}`}>
                    {field.aadhaarValue}
                  </div>
                  <div className='px-3 py-3 w-8 flex items-center justify-center'>
                    {field.mismatch ? (
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        selectedFields.includes(field.key) ? 'bg-epfo-blue border-epfo-blue' : 'border-red-300'
                      }`}>
                        {selectedFields.includes(field.key) && <CheckCircle2 className='w-3 h-3 text-white' />}
                      </div>
                    ) : (
                      <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            {mismatchFields.length > 0 ? (
              <div className='bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start'>
                <AlertTriangle className='w-5 h-5 text-amber-600 shrink-0 mt-0.5' />
                <div className='text-xs text-amber-900 leading-relaxed'>
                  <p className='font-bold mb-0.5'>{t('kym_summary_diff_count', { count: mismatchFields.length })}</p>
                  <p>{t('kym_summary_diff_body')}</p>
                </div>
              </div>
            ) : (
              <div className='bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start'>
                <CheckCircle2 className='w-5 h-5 text-emerald-600 shrink-0 mt-0.5' />
                <div className='text-xs text-emerald-900 leading-relaxed'>
                  <p className='font-bold'>{t('kym_summary_match_title')}</p>
                  <p>{t('kym_summary_match_body')}</p>
                </div>
              </div>
            )}

            {/* What you need */}
            <div className='bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2'>
              <p className='text-[10px] font-bold text-slate-500 uppercase tracking-wider'>{t('kym_what_you_need_title')}</p>
              <div className='space-y-1.5 text-xs text-slate-700'>
                <p className='flex items-start gap-2'><span className='text-epfo-blue font-bold shrink-0'>1.</span> {t('kym_what_you_need_1')}</p>
                <p className='flex items-start gap-2'><span className='text-epfo-blue font-bold shrink-0'>2.</span> {t('kym_what_you_need_2')}</p>
                <p className='flex items-start gap-2'><span className='text-epfo-blue font-bold shrink-0'>3.</span> {t('kym_what_you_need_3')}</p>
              </div>
            </div>

            <Button
              onClick={handleProceed}
              className='w-full py-3.5 font-semibold text-sm'
              disabled={selectedFields.length === 0}
              aria-label={t('kym_aria_proceed')}
            >
              {t('kym_proceed_btn')} <ArrowRight className='w-4 h-4 ml-1' />
            </Button>
          </motion.div>
        )}

        {/* STEP 2: AADHAAR OTP VERIFICATION */}
        {step === 'otp' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-md text-center space-y-4'>
              <div className='w-14 h-14 bg-blue-50 text-epfo-blue rounded-full mx-auto flex items-center justify-center'>
                <Lock className='w-7 h-7' />
              </div>

              <div>
                <h2 className='text-lg font-bold text-slate-900'>{t('kym_otp_title')}</h2>
                <p className='text-xs text-slate-500 mt-1'>
                  {t('kym_otp_sign_intro', {
                    count: selectedFields.length,
                    names: selectedFields.map(f => t(`kym_field_${f}`)).join(', '),
                  })}
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className='space-y-4 pt-2'>
                <input
                  id="kyc-otp"
                  type='text'
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder='1234'
                  aria-label={t('kym_aria_otp')}
                  className='w-40 mx-auto text-center tracking-widest text-2xl font-bold p-3 border-2 border-epfo-blue/40 rounded-2xl focus:border-epfo-blue outline-none bg-slate-50'
                  autoFocus
                  required
                />

                <p className='text-[11px] text-slate-400'>
                  {t('kym_otp_hint', { otp: '1234' })}
                </p>

                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full py-3.5 font-semibold'
                >
                  {isSubmitting ? t('kym_otp_signing') : t('kym_otp_submit')}
                </Button>
                {authError && <OtpFallbackOptions variant='compact' />}
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-emerald-200 rounded-3xl p-6 shadow-xl text-center space-y-4'>
              <div className='w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-sm'>
                <CheckCircle2 className='w-10 h-10' />
              </div>

              <div>
                <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200'>
                  {t('kym_success_badge')}
                </span>
                <h2 className='text-xl font-bold text-slate-900 mt-2'>{t('kym_success_title')}</h2>
                <p className='text-xs text-slate-500 mt-1'>
                  {t('kym_success_body')}
                </p>
              </div>

              <div className='bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('kym_success_fields_corrected')}</span>
                  <span className='font-bold text-slate-900'>{selectedFields.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('kym_success_sign_mode')}</span>
                  <span className='font-bold text-slate-900'>{t('kym_success_sign_mode_value')}</span>
                </div>
                <div className='flex justify-between pt-1 border-t border-slate-200'>
                  <span className='text-slate-500'>{t('kym_success_processing_time')}</span>
                  <span className='font-semibold text-amber-700'>{t('kym_success_processing_time_value')}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                aria-label={t('kym_aria_back_dashboard')}
                className='w-full py-2 text-slate-500 text-xs hover:text-slate-800'
              >
                {t('kym_back_dashboard')}
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
