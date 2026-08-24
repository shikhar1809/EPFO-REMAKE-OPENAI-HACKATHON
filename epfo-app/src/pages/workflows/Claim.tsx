import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldCheck, Lock, CreditCard, Home as HomeIcon, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useVaultStore } from '../../store/useVaultStore';
import { useSessionStore } from '../../store/useSessionStore';

import { useTranslation } from 'react-i18next';

export const Claim: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getDocumentsByType } = useVaultStore();
  const { stepUpAuth } = useSessionStore();
  
  const [step, setStep] = useState(1);
  const [bankDigits, setBankDigits] = useState('1234');
  const [claimType, setClaimType] = useState('31'); // 31 = Advance, 19 = Full
  const [purpose, setPurpose] = useState('illness');
  const [amount, setAmount] = useState('50000');
  const [address, setAddress] = useState('Flat 402, Shanti Vihar, Sector 14, Dwarka, New Delhi - 110078');
  const [otp, setOtp] = useState('1234');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);

  // Check vault for prerequisites
  const aadhaar = getDocumentsByType('aadhaar')[0];
  const bank = getDocumentsByType('bank_account')[0];

  const handleBankVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (bankDigits === '1234') { // Mock verification
      setStep(2);
    } else {
      alert('Invalid bank digits. Use 1234 for demo.');
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Real EPFO flow requires Aadhaar OTP (Step-Up Auth) here
    const authSuccess = await stepUpAuth(otp || '1234');
    setIsSubmitting(false);
    
    if (authSuccess) {
      // Idempotency: Generate a unique Operation ID for the submission
      setOperationId(`OP-CLM-${Math.floor(Math.random() * 1000000)}`);
      setStep(4);
    } else {
      alert('Invalid OTP. Use 1234.');
    }
  };

  if (!aadhaar || !bank) {
    return (
      <div className='flex-1 flex flex-col bg-transparent p-6 justify-center items-center text-center'>
        <XCircle className='w-16 h-16 text-red-500 mb-4' />
        <h2 className='text-xl font-semibold mb-2'>Missing Prerequisites</h2>
        <p className='text-slate-500 mb-8'>You must have a verified Aadhaar and Bank Account in your Document Vault before filing a claim.</p>
        <Button onClick={() => navigate('/documents')}>Go to Document Vault</Button>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col bg-transparent relative'>
      <div className='bg-white px-4 py-4 flex items-center sticky top-0 z-10 border-b border-slate-100'>
        <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-transparent'>
          <ArrowLeft className='w-5 h-5' />
        </button>
        <h1 className='text-lg font-medium ml-2'>{t('claim_heading')}</h1>
      </div>

      <div className='p-6 flex-1 overflow-y-auto pb-24'>
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
            <div className='bg-blue-50 border border-blue-100 p-4 rounded-2xl'>
              <h3 className='font-semibold text-blue-900'>{t('bank_verify_title')}</h3>
              <p className='text-sm text-blue-800 mt-1'>{t('bank_verify_desc')}</p>
            </div>
            <form onSubmit={handleBankVerify} className='space-y-4'>
              <div className='flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm'>
                <CreditCard className='w-5 h-5 text-slate-400' />
                <div className='text-lg tracking-widest text-slate-500'>•••• •••• ••••</div>
                <input 
                  type='text' 
                  maxLength={4}
                  className='w-16 text-lg font-bold tracking-widest border-b-2 border-slate-300 focus:border-epfo-blue outline-none text-center bg-transparent'
                  placeholder='XXXX'
                  value={bankDigits}
                  onChange={e => setBankDigits(e.target.value)}
                  required
                />
              </div>
              <Button type='submit' className='w-full py-4 text-lg'>{t('verify')}</Button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
            <h2 className='text-xl font-semibold'>{t('claim_type_label')}</h2>
            <form onSubmit={handleDetailsSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>{t('claim_type_label')}</label>
                <select 
                  className='w-full p-4 border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-epfo-blue outline-none text-slate-800 shadow-sm font-medium'
                  value={claimType}
                  onChange={e => setClaimType(e.target.value)}
                >
                  <option value="31">{t('form_31')}</option>
                  <option value="19">{t('form_19')}</option>
                  <option value="10C">{t('form_10c')}</option>
                </select>
              </div>

              {claimType === '31' && (
                <>
                  <div className='space-y-2 mt-4'>
                    <label className='text-sm font-medium text-slate-700'>{t('purpose_label')}</label>
                    <select 
                      className='w-full p-4 border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-epfo-blue outline-none text-slate-800 shadow-sm'
                      value={purpose}
                      onChange={e => setPurpose(e.target.value)}
                      required
                    >
                      <option value="">Select Purpose</option>
                      <option value="illness">Illness</option>
                      <option value="education">Higher Education</option>
                      <option value="marriage">Marriage</option>
                      <option value="house">Purchase of House/Flat</option>
                    </select>
                  </div>
                  <div className='space-y-2 mt-4'>
                    <label className='text-sm font-medium text-slate-700'>{t('amount_label')}</label>
                    <input 
                      className="w-full p-4 border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-epfo-blue outline-none shadow-sm"
                      type='number' 
                      placeholder='Enter amount' 
                      value={amount} 
                      onChange={e => setAmount(e.target.value)} 
                      required 
                    />
                  </div>
                </>
              )}

              <div className='space-y-2 mt-4'>
                <label className='text-sm font-medium text-slate-700 flex items-center gap-2'><HomeIcon className='w-4 h-4' /> {t('address_label')}</label>
                <textarea 
                  className='w-full p-4 border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-epfo-blue outline-none resize-none h-24 shadow-sm'
                  placeholder='Full residential address'
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className='bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3 items-start mt-2'>
                <CheckCircle2 className='w-5 h-5 text-green-600 shrink-0' />
                <p className='text-sm text-green-800'>Bank Passbook/Cheque is already verified in your Document Vault.</p>
              </div>

              <Button type='submit' className='w-full mt-4 py-4 text-lg'>Proceed to Review</Button>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-6'>
            <h2 className='text-xl font-semibold'>Review & Authenticate</h2>
            <div className='bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4'>
              <div className='flex justify-between border-b border-slate-100 pb-3'>
                <span className='text-slate-500'>Claim Type</span>
                <span className='font-medium text-right'>{claimType === '31' ? 'PF Advance (Form 31)' : 'PF Withdrawal (Form 19)'}</span>
              </div>
              {claimType === '31' && (
                <>
                  <div className='flex justify-between border-b border-slate-100 pb-3'>
                    <span className='text-slate-500'>Purpose</span>
                    <span className='font-medium capitalize text-right'>{purpose}</span>
                  </div>
                  <div className='flex justify-between border-b border-slate-100 pb-3'>
                    <span className='text-slate-500'>Amount</span>
                    <span className='font-medium text-right'>₹{amount}</span>
                  </div>
                </>
              )}
              <div className='bg-orange-50 p-4 rounded-xl flex flex-col gap-3 mt-4 border border-orange-100'>
                <div className='flex gap-2 items-center'>
                  <ShieldCheck className='w-5 h-5 text-orange-600 shrink-0' />
                  <p className='text-sm font-bold text-orange-800'>Aadhaar OTP Required</p>
                </div>
                <p className='text-xs text-orange-800 mb-2'>
                  Filing a claim is a sensitive action. Please sign this request.
                </p>
                <Input type='text' placeholder='Enter Aadhaar OTP (1234)' value={otp} onChange={e => setOtp(e.target.value)} className='bg-white' />
              </div>
            </div>

            <Button onClick={handleSubmit} isLoading={isSubmitting} className='w-full py-4 text-lg'>
              <Lock className='w-4 h-4 mr-2' /> Sign & Submit Claim
            </Button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='text-center py-10 space-y-4'>
            <div className='w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircle2 className='w-10 h-10 text-green-500' />
            </div>
            <h2 className='text-2xl font-bold text-slate-900'>Claim Submitted Successfully</h2>
            <p className='text-slate-500'>Your claim has been forwarded to the field office.</p>
            
            <div className='bg-white p-4 rounded-xl border border-slate-200 mt-6 text-left'>
              <p className='text-xs text-slate-500 uppercase tracking-wider mb-1'>Operation Ledger ID</p>
              <p className='font-mono font-medium text-slate-900'>{operationId}</p>
              <p className='text-xs text-slate-400 mt-2'>Store this ID. It guarantees your submission is recorded uniquely, preventing duplicate claims.</p>
            </div>

            <Button className='w-full mt-6 py-4 text-lg' onClick={() => navigate('/')}>Return to Dashboard</Button>
          </motion.div>
        )}

      </div>
    </div>
  );
};
