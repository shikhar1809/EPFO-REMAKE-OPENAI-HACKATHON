import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Globe, ArrowLeft, User, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSessionStore } from '../store/useSessionStore';

type Step = 'language' | 'user_type' | 'returning_login' | 'identity' | 'verify_uan' | 'mobile_login' | 'profile_setup' | 'prerequisites' | 'vault_intro';

import { useTranslation } from 'react-i18next';
import { CheckCircle2, Lock } from 'lucide-react';
import { ProfileSuccessAnim, VaultSuccessAnim } from '../components/ui/SuccessAnimations';
import { SyncAnimation } from '../components/ui/SyncAnimation';
import { VaultIntroAnimation } from '../components/animations/VaultIntroAnimation';

const VaultSetup = ({ finishOnboarding }: { finishOnboarding: () => void }) => {
  const [vaultState, setVaultState] = useState<'intro' | 'fetching' | 'done'>('intro');
  const [fetchedDocs, setFetchedDocs] = useState<string[]>([]);

  const startDigiLockerFetch = () => {
    setVaultState('fetching');
    
    setTimeout(() => setFetchedDocs(prev => [...prev, 'Aadhaar Card']), 1000);
    setTimeout(() => setFetchedDocs(prev => [...prev, 'PAN Card']), 2000);
    setTimeout(() => setFetchedDocs(prev => [...prev, 'Bank Passbook']), 3000);
    setTimeout(() => setVaultState('done'), 4000);
  };

  return (
    <motion.div key="vault_intro" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-4 my-auto'>
      
      {/* Animated DigiLocker Vault Hero Animation */}
      {vaultState === 'intro' && (
        <VaultIntroAnimation />
      )}

      {vaultState !== 'intro' && (
        <div className='bg-amber-50 p-3.5 rounded-2xl w-14 h-14 flex items-center justify-center mb-2'>
          <FileText className='w-7 h-7 text-amber-600' />
        </div>
      )}

      <div>
        <h1 className='text-2xl font-bold text-slate-900'>Document Vault</h1>
        <p className='text-xs text-slate-500 mt-1'>
          Government DigiLocker & KYC Integration
        </p>
      </div>
      
      {vaultState === 'intro' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-3.5'>
          <p className='text-xs text-slate-600 leading-relaxed'>
            To provide you with seamless 1-click services, we securely fetch and encrypt your KYC documents from DigiLocker.
          </p>
          <div className='bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3'>
            <Lock className='w-4 h-4 text-slate-500 shrink-0 mt-0.5' />
            <p className='text-[11px] text-slate-600 leading-snug'>
              Your documents (Aadhaar, PAN, Bank Details) are 256-bit encrypted. We only share verified cryptographic hashes when you explicitly approve a claim or transfer.
            </p>
          </div>
          <div className='pt-2'>
            <Button className='w-full py-3.5 text-sm font-bold bg-green-600 hover:bg-green-700 shadow-md' onClick={startDigiLockerFetch}>
              Connect with DigiLocker
            </Button>
          </div>
        </motion.div>
      )}

      {vaultState === 'fetching' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-6 py-4'>
          <SyncAnimation />
          <p className='text-epfo-blue font-medium text-center'>
            Syncing with DigiLocker...
          </p>
          <div className='space-y-3'>
            {['Aadhaar Card', 'PAN Card', 'Bank Passbook'].map((doc) => {
              const isFetched = fetchedDocs.includes(doc);
              return (
                <div key={doc} className={`flex items-center gap-3 p-3 rounded-lg border ${isFetched ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-transparent opacity-50'}`}>
                  {isFetched ? <CheckCircle2 className='w-5 h-5 text-green-600' /> : <div className='w-5 h-5 rounded-full border-2 border-slate-200' />}
                  <span className={`font-medium ${isFetched ? 'text-green-800' : 'text-slate-500'}`}>{doc}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {vaultState === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-6 py-4'>
          <VaultSuccessAnim />
          <div className='bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-start gap-3 text-left'>
            <CheckCircle2 className='w-6 h-6 text-green-600 shrink-0' />
            <div>
              <p className='font-semibold'>Vault Ready!</p>
              <p className='text-sm mt-1'>3 documents successfully fetched and securely stored. You're all set.</p>
            </div>
          </div>
          <div className='space-y-3'>
            {['Aadhaar Card', 'PAN Card', 'Bank Passbook'].map(doc => (
              <div key={doc} className='flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50'>
                <CheckCircle2 className='w-5 h-5 text-green-600' />
                <span className='font-medium text-green-800'>{doc}</span>
              </div>
            ))}
          </div>
          <div className='pt-4'>
            <Button className='w-full py-4 text-lg' onClick={finishOnboarding}>
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
};

export const Onboarding: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('language');
  
  const { verifyUAN, loginWithPhone, completeProfile, user } = useSessionStore();
  
  const [uanInput, setUanInput] = useState('101234567890');
  const [phoneInput, setPhoneInput] = useState('9876543210');
  const [otpInput, setOtpInput] = useState('1234');
  const [showOtp, setShowOtp] = useState(false);
  const [profileName, setProfileName] = useState('Rameshwar Sharma');
  const [mpinInput, setMpinInput] = useState('1234');
  const [isVerifying, setIsVerifying] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setStep('user_type');
  };

  const handleUanVerification = async () => {
    if (!showOtp) {
      if (uanInput.length === 12) {
        setIsVerifying(true);
        await new Promise(r => setTimeout(r, 800)); // Simulate sending OTP
        setIsVerifying(false);
        setShowOtp(true);
      } else {
        alert('Invalid UAN (must be 12 digits)');
      }
      return;
    }

    // Verify OTP
    if (otpInput === '1234') {
      setIsVerifying(true);
      const success = await verifyUAN(uanInput);
      setIsVerifying(false);
      if (success) {
        if (step === 'returning_login') {
          completeProfile({ name: user?.name || 'Citizen' });
          localStorage.setItem('onboarded', 'true');
          navigate('/');
        } else {
          setStep('profile_setup');
        }
      }
    } else {
      alert('Invalid OTP. Please use 1234.');
    }
  };

  const handlePhoneLogin = async () => {
    setIsVerifying(true);
    const success = await loginWithPhone(phoneInput, otpInput || '1234');
    setIsVerifying(false);
    if (success) {
      if (step === 'returning_login') {
        finishOnboarding();
      } else {
        setStep('prerequisites');
      }
    } else {
      alert('Invalid OTP');
    }
  };

  const finishOnboarding = () => {
    completeProfile({ name: profileName.trim() || user?.name || 'Citizen' });
    localStorage.setItem('onboarded', 'true');
    navigate('/');
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-y-auto relative'>
      {step !== 'language' && (
        <div className='sticky top-4 left-4 z-50 self-start ml-4 mt-4 -mb-10'>
          <button 
            onClick={() => {
              if (step === 'user_type') setStep('language');
              else if (step === 'returning_login') setStep('user_type');
              else if (step === 'identity') setStep('user_type');
              else if (step === 'verify_uan' || step === 'mobile_login') setStep('identity');
              else if (step === 'profile_setup') setStep('verify_uan');
              else if (step === 'prerequisites') setStep('profile_setup');
              else if (step === 'vault_intro') setStep('prerequisites');
            }} 
            className='p-2 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full shadow-sm hover:bg-transparent transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
          </button>
        </div>
      )}
      <div className='flex-1 p-6 flex flex-col pb-12 max-w-md mx-auto w-full min-h-[min-content]'>
        <AnimatePresence mode='wait'>
          
          {step === 'language' && (
            <motion.div key="language" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <Globe className='w-8 h-8 text-epfo-blue' />
              </div>
              <div>
                <h1 className='text-3xl font-semibold mb-2 text-slate-900'>{t('onboarding_title')}</h1>
                <p className='text-slate-500 text-sm'>{t('onboarding_subtitle')}</p>
              </div>
              <div className='space-y-3 mt-8'>
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => handleLanguageSelect(lang.code)} className='w-full p-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm text-left hover:border-epfo-blue transition-colors'>
                    <span className='font-medium text-lg'>{lang.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'user_type' && (
            <motion.div key="user_type" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-indigo-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <User className='w-8 h-8 text-indigo-600' />
              </div>
              <div>
                <h1 className='text-3xl font-semibold mb-2 text-slate-900'>{t('user_type_title')}</h1>
                <p className='text-slate-500'>{t('user_type_subtitle')}</p>
              </div>
              <div className='space-y-3 mt-8'>
                <button onClick={() => setStep('identity')} className='w-full p-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm text-left hover:border-epfo-blue transition-colors flex items-center justify-between'>
                  <span className='font-medium text-lg'>{t('new_user')}</span>
                  <ArrowLeft className='w-4 h-4 rotate-180 text-slate-400' />
                </button>
                <button onClick={() => setStep('returning_login')} className='w-full p-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm text-left hover:border-epfo-blue transition-colors flex items-center justify-between'>
                  <span className='font-medium text-lg text-epfo-blue'>{t('returning_user')}</span>
                  <ArrowLeft className='w-4 h-4 rotate-180 text-epfo-blue' />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'returning_login' && (
            <motion.div key="returning_login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <ShieldCheck className='w-8 h-8 text-epfo-blue' />
              </div>
              <div>
                <h1 className='text-3xl font-semibold mb-2'>Welcome Back</h1>
                <p className='text-slate-500'>Enter your 12-digit UAN to continue.</p>
              </div>
              
              <div className='space-y-4 mt-8'>
                <input 
                  type="text"
                  maxLength={12}
                  className='w-full p-4 rounded-xl border border-slate-200 text-lg outline-none focus:ring-2 focus:ring-epfo-blue transition-all'
                  placeholder="Enter 12-digit UAN"
                  value={uanInput}
                  onChange={(e) => setUanInput(e.target.value.replace(/\D/g, ''))}
                  disabled={showOtp}
                />

                {showOtp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <input 
                      type="text"
                      className='w-full p-4 rounded-xl border border-slate-200 text-lg outline-none focus:ring-2 focus:ring-epfo-blue transition-all mt-4'
                      placeholder="Enter OTP (Use 1234)"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    />
                  </motion.div>
                )}
                
                <Button 
                  className='w-full py-4 text-lg' 
                  onClick={handleUanVerification}
                  disabled={(uanInput.length !== 12) || (showOtp && otpInput.length < 4) || isVerifying}
                  isLoading={isVerifying}
                >
                  {showOtp ? 'Verify OTP & Login' : 'Get OTP'}
                </Button>

                <div className='pt-6 relative'>
                  <div className='absolute inset-0 flex items-center'><div className='w-full border-t border-slate-200'></div></div>
                  <div className='relative flex justify-center text-sm'><span className='px-2 bg-slate-50 text-slate-500'>OR</span></div>
                </div>
                
                <Button variant='outline' className='w-full py-4' onClick={() => setStep('mobile_login')}>
                  Login via Mobile OTP
                </Button>
                <div className='pt-2 border-t border-slate-100'>
                  <Button variant='outline' className='w-full py-4' onClick={() => navigate('/uan-activation')}>
                    Activate UAN
                  </Button>
                </div>
                <p className='text-xs text-center text-slate-500'>Use mobile login to access Grievance, Tracking, or to find your UAN.</p>
              </div>
            </motion.div>
          )}

          {step === 'identity' && (
            <motion.div key="identity" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <User className='w-8 h-8 text-epfo-blue' />
              </div>
              <div>
                <h1 className='text-3xl font-semibold mb-2'>Identity Discovery</h1>
                <p className='text-slate-500'>
                  We strongly recommend signing in with your UAN to access all EPFO services.
                </p>
              </div>

              <div className='bg-transparent p-4 rounded-xl border border-slate-200 mt-4 space-y-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <CheckCircle2 className='w-4 h-4 text-epfo-blue' />
                  <h3 className='font-semibold text-slate-800 text-sm'>Why use a UAN?</h3>
                </div>
                <p className='text-xs text-slate-600'>The Universal Account Number (UAN) is a 12-digit number provided by EPFO. It securely links your multiple PF accounts and is required for Withdrawals, Transfers, and Passbook access.</p>
              </div>

              <div className='space-y-4 pt-4'>
                <Button className='w-full py-4 text-lg' onClick={() => setStep('verify_uan')}>
                  Yes, login with UAN
                </Button>
                <Button variant='outline' className='w-full py-4 text-lg' onClick={() => setStep('mobile_login')}>
                  Continue without UAN (Mobile Only)
                </Button>
                <div className="pt-2 text-center">
                  <button onClick={() => setStep('mobile_login')} className="text-sm text-epfo-blue hover:underline font-medium">
                    I don't know my UAN / Help me find it
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'verify_uan' && (
            <motion.div key="verify_uan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <h1 className='text-3xl font-semibold mb-2'>Verify UAN</h1>
              <div className='space-y-4'>
                <input 
                  type="text" 
                  placeholder="Enter 12-digit UAN" 
                  className='w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-orange outline-none'
                  value={uanInput}
                  onChange={e => setUanInput(e.target.value.replace(/\D/g, ''))}
                  disabled={showOtp}
                />

                {showOtp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <input 
                      type="text"
                      className='w-full p-4 rounded-xl border border-slate-200 text-lg outline-none focus:ring-2 focus:ring-epfo-orange transition-all mt-4'
                      placeholder="Enter OTP (Use 1234)"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    />
                  </motion.div>
                )}

                <Button className='w-full py-4' disabled={(uanInput.length !== 12) || (showOtp && otpInput.length < 4) || isVerifying} onClick={handleUanVerification}>
                  {isVerifying ? 'Verifying...' : showOtp ? 'Verify OTP' : 'Get OTP'}
                </Button>
                <div className='pt-4 border-t border-slate-100'>
                  <p className='text-sm text-center text-slate-500 mb-3'>Haven't activated your UAN yet?</p>
                  <Button variant='outline' className='w-full py-3' onClick={() => navigate('/uan-activation')}>
                    Activate UAN
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'mobile_login' && (
            <motion.div key="mobile_login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <h1 className='text-3xl font-semibold mb-2'>Mobile Authentication</h1>
              <p className='text-slate-500'>Enter your Aadhaar-linked phone number. You can use this to find your UAN or access non-UAN services.</p>
              <div className='space-y-4'>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className='w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-orange outline-none'
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                />
                <input 
                  type="text" 
                  placeholder="OTP (use 1234)" 
                  className='w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-orange outline-none'
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                />
                <Button className='w-full py-4' disabled={isVerifying || phoneInput.length < 10} onClick={handlePhoneLogin}>
                  {isVerifying ? 'Verifying...' : 'Login'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'profile_setup' && (
            <motion.div key="profile_setup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto text-center'>
              <ProfileSuccessAnim />
              <h1 className='text-3xl font-semibold mb-2'>UAN Verified</h1>
              <p className='text-slate-500'>We've successfully verified your UAN. What should we call you?</p>
              
              <div className='pt-6 text-left'>
                <label className="text-sm font-medium text-slate-700 block mb-2">Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-4 rounded-xl border border-slate-200 text-lg outline-none focus:ring-2 focus:ring-epfo-blue transition-all"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              <div className='space-y-4 pt-4'>
                <Button className='w-full py-4 text-lg' disabled={!profileName.trim()} onClick={() => {
                  completeProfile({ name: profileName });
                  setStep('prerequisites');
                }}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'prerequisites' && (
            <motion.div key="prerequisites" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-orange-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <ShieldCheck className='w-8 h-8 text-orange-600' />
              </div>
              <h1 className='text-3xl font-semibold mb-2'>One-Time Security Setup</h1>
              <p className='text-slate-500 text-sm'>This is the one and only time you will need to submit this. Your verified status will carry across all your sessions.</p>
              
              <div className='space-y-4 pt-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-700'>Mobile Verification (OTP)</label>
                  <input type="text" value="1234" readOnly className='w-full p-4 border border-slate-200 rounded-xl bg-transparent text-slate-500 outline-none' />
                </div>
                
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-700'>Captcha Verification</label>
                  <div className='flex gap-3'>
                    <div className='p-4 bg-slate-100 border border-slate-200 rounded-xl font-mono text-lg tracking-widest text-slate-700 select-none'>
                      aB3cD
                    </div>
                    <input type="text" value="aB3cD" readOnly className='flex-1 p-4 border border-slate-200 rounded-xl bg-transparent text-slate-500 outline-none' />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-700'>Set a 4-Digit MPIN</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    value={mpinInput} 
                    onChange={e => setMpinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4 digits"
                    className='w-full p-4 border border-slate-200 rounded-xl bg-transparent focus:ring-2 focus:ring-epfo-orange outline-none tracking-[1em] text-center text-lg' 
                  />
                  <p className='text-xs text-slate-500 text-center'>You will use this MPIN to quickly log in to the app next time.</p>
                </div>

                <Button className='w-full py-4 text-lg mt-4 bg-orange-600 hover:bg-orange-700' disabled={mpinInput.length !== 4} onClick={() => setStep('vault_intro')}>
                  Verify & Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'vault_intro' && (
            <VaultSetup finishOnboarding={finishOnboarding} />
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
};
