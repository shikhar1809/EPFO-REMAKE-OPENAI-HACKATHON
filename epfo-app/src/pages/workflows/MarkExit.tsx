import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  FileCheck2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useSessionStore } from '../../store/useSessionStore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const MarkExit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stepUpAuth } = useSessionStore();

  const [step, setStep] = useState<'select' | 'form' | 'otp' | 'success'>('select');
  
  // Mock establishments
  const employments = [
    {
      id: 'EST-DL-481920-001',
      companyName: 'Apex Logistics & Warehousing Pvt Ltd',
      memberId: 'DLCPM0048192000001842',
      doj: '12 Jan 2021',
      lastContribution: '15 Sep 2024',
      daysSinceContribution: 162,
      isEligible: true, // >60 days
      status: 'EXIT_NOT_MARKED'
    },
    {
      id: 'EST-MH-119283-002',
      companyName: 'Tata Consultancy Services Ltd',
      memberId: 'MHBAN0011928300009412',
      doj: '01 Nov 2024',
      lastContribution: '10 Feb 2025',
      daysSinceContribution: 14,
      isEligible: false, // <60 days
      status: 'ACTIVE_EMPLOYMENT'
    }
  ];

  const [selectedEmp, setSelectedEmp] = useState(employments[0]);
  const [exitDate, setExitDate] = useState('2024-09-30');
  const [exitReason, setExitReason] = useState('CESSATION');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectEstablishment = (emp: typeof employments[0]) => {
    if (!emp.isEligible) {
      toast.error('Cannot mark exit: Last contribution was less than 60 days ago.');
      return;
    }
    setSelectedEmp(emp);
    setStep('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitDate) {
      toast.error('Please select your Date of Exit');
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
      setStep('success');
      toast.success('Date of Exit updated successfully in EPFO records!');
    } else {
      toast.error('Invalid OTP. Use 1234 for demo.');
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent relative overflow-y-auto pb-12'>
      {/* Header */}
      <div className='bg-white/90 backdrop-blur-md px-4 py-4 flex items-center sticky top-0 z-20 border-b border-slate-100 shadow-sm'>
        <button 
          onClick={() => {
            if (step === 'select') navigate(-1);
            else if (step === 'form') setStep('select');
            else if (step === 'otp') setStep('form');
            else navigate(-1);
          }} 
          className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>
        <div className='ml-2 flex-1'>
          <h1 className='text-lg font-bold text-slate-900 leading-tight'>{t('mark_exit_title')}</h1>
          <p className='text-xs text-slate-500 font-medium'>{t('mark_exit_subtitle')}</p>
        </div>
      </div>

      <div className='p-5 space-y-5 max-w-md mx-auto w-full'>
        
        {/* STEP 1: SELECT ESTABLISHMENT */}
        {step === 'select' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            
            {/* EPFO Policy Helper Box */}
            <div className='bg-blue-50/90 backdrop-blur-sm border border-blue-200/80 rounded-2xl p-4 flex gap-3 items-start shadow-sm'>
              <Info className='w-5 h-5 text-epfo-blue shrink-0 mt-0.5' />
              <div className='text-xs text-blue-950 leading-relaxed'>
                <p className='font-bold text-blue-900 mb-0.5'>Worker Empowerment Norm</p>
                {t('mark_exit_info')}
              </div>
            </div>

            <h2 className='text-sm font-bold text-slate-800 uppercase tracking-wider px-1'>{t('select_establishment')}</h2>

            <div className='space-y-3'>
              {employments.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => handleSelectEstablishment(emp)}
                  className={`p-4 rounded-2xl border transition-all ${
                    emp.isEligible 
                      ? 'bg-white/90 backdrop-blur-sm border-slate-200 hover:border-epfo-blue hover:shadow-md cursor-pointer' 
                      : 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <Building2 className='w-5 h-5 text-epfo-blue shrink-0' />
                      <h3 className='font-bold text-slate-900 text-sm leading-tight'>{emp.companyName}</h3>
                    </div>
                    {emp.isEligible ? (
                      <span className='bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0'>
                        Exit Unmarked
                      </span>
                    ) : (
                      <span className='bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0'>
                        Active (Current)
                      </span>
                    )}
                  </div>

                  <div className='grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600'>
                    <div>
                      <p className='text-[10px] text-slate-400'>Date of Joining</p>
                      <p className='font-medium text-slate-700'>{emp.doj}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-slate-400'>Last Contribution</p>
                      <p className='font-medium text-slate-700'>{emp.lastContribution}</p>
                    </div>
                  </div>

                  {emp.isEligible ? (
                    <div className='mt-3 flex items-center justify-between text-xs font-semibold text-epfo-blue pt-2 border-t border-slate-100'>
                      <span>Ready for Self-Declaration</span>
                      <ArrowRight className='w-4 h-4' />
                    </div>
                  ) : (
                    <p className='mt-2 text-[11px] text-slate-500 italic'>
                      Less than 60 days since last wage credit ({emp.daysSinceContribution} days).
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: DECLARATION FORM */}
        {step === 'form' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className='space-y-4'>
            <div className='bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4'>
              <div className='border-b border-slate-100 pb-3'>
                <p className='text-xs text-slate-400'>Selected Employer</p>
                <h3 className='font-bold text-slate-900 text-base'>{selectedEmp.companyName}</h3>
                <p className='text-xs font-mono text-slate-500 mt-0.5'>{selectedEmp.memberId}</p>
              </div>

              <form onSubmit={handleFormSubmit} className='space-y-4'>
                <div>
                  <label className='block text-xs font-bold text-slate-700 mb-1.5'>
                    Date of Exit (Last Working Day) *
                  </label>
                  <input 
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    className='w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-blue outline-none text-slate-900 font-medium'
                    required
                  />
                  <p className='text-[11px] text-slate-400 mt-1'>
                    Must be on or after the last contribution wage month ({selectedEmp.lastContribution}).
                  </p>
                </div>

                <div>
                  <label className='block text-xs font-bold text-slate-700 mb-1.5'>
                    Reason for Leaving *
                  </label>
                  <select 
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value)}
                    className='w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-blue outline-none text-slate-900 font-medium'
                    required
                  >
                    <option value="CESSATION">Cessation (Short Service / Resignation)</option>
                    <option value="ILL_HEALTH">Ill Health / Medical Reason</option>
                    <option value="CLOSURE">Closure of Establishment</option>
                    <option value="PERMANENT_DISABILITY">Permanent Disability</option>
                  </select>
                </div>

                <div className='bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex gap-2'>
                  <ShieldAlert className='w-4 h-4 text-amber-600 shrink-0 mt-0.5' />
                  <span>
                    Warning: Once submitted with Aadhaar OTP, the Date of Exit cannot be changed without EPFO Regional Office intervention.
                  </span>
                </div>

                <Button type='submit' className='w-full py-3.5 font-semibold text-sm'>
                  Continue to Aadhaar OTP Sign →
                </Button>
              </form>
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
                <h2 className='text-lg font-bold text-slate-900'>Aadhaar Digital Signature</h2>
                <p className='text-xs text-slate-500 mt-1'>
                  Enter the 4-digit mock OTP sent to your Aadhaar-linked mobile (••• ••• 4819).
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className='space-y-4 pt-2'>
                <input 
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  className='w-40 mx-auto text-center tracking-widest text-2xl font-bold p-3 border-2 border-epfo-blue/40 rounded-2xl focus:border-epfo-blue outline-none bg-slate-50'
                  autoFocus
                  required
                />
                
                <p className='text-[11px] text-slate-400'>
                  Demo Hint: Enter <strong>1234</strong>
                </p>

                <Button 
                  type='submit' 
                  disabled={isSubmitting}
                  className='w-full py-3.5 font-semibold'
                >
                  {isSubmitting ? 'Signing Declaration...' : 'Confirm & Update Exit Date'}
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 4: SUCCESS STATE */}
        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-emerald-200 rounded-3xl p-6 shadow-xl text-center space-y-4'>
              <div className='w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-sm'>
                <CheckCircle2 className='w-10 h-10' />
              </div>

              <div>
                <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200'>
                  Exit Date Recorded
                </span>
                <h2 className='text-xl font-bold text-slate-900 mt-2'>Employment Status Updated!</h2>
                <p className='text-xs text-slate-500 mt-1'>
                  Your leaving date has been permanently updated in the central EPFO database.
                </p>
              </div>

              <div className='bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Establishment</span>
                  <span className='font-bold text-slate-900 text-right'>{selectedEmp.companyName}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Marked Exit Date</span>
                  <span className='font-bold text-slate-900'>{exitDate}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>Reason Code</span>
                  <span className='font-bold text-slate-900'>{exitReason}</span>
                </div>
                <div className='flex justify-between pt-1 border-t border-slate-200'>
                  <span className='text-slate-500'>Sign Mode</span>
                  <span className='font-semibold text-emerald-700'>Aadhaar e-Sign (Self)</span>
                </div>
              </div>

              {/* Unlocked Form 19 CTA */}
              <div className='bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left space-y-2'>
                <div className='flex items-center gap-2 text-epfo-blue font-bold text-xs'>
                  <FileCheck2 className='w-4 h-4' />
                  <span>Full Withdrawal (Form 19) is now Unlocked!</span>
                </div>
                <p className='text-[11px] text-blue-900'>
                  You are now eligible to withdraw your full 100% PF balance and pension contribution.
                </p>
                <Button 
                  onClick={() => navigate('/claim')}
                  className='w-full py-3 bg-epfo-blue hover:bg-blue-700 text-xs font-semibold mt-1'
                >
                  Proceed to File Form 19 Claim →
                </Button>
              </div>

              <button 
                onClick={() => navigate('/')}
                className='w-full py-2 text-slate-500 text-xs hover:text-slate-800'
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
