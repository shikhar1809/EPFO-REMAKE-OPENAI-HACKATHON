import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Globe, ArrowLeft, User, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSessionStore } from '../store/useSessionStore';
import toast from 'react-hot-toast';

type Step = 'network_check' | 'language' | 'scam_awareness' | 'user_type' | 'returning_login' | 'identity' | 'verify_uan' | 'mobile_login' | 'profile_setup' | 'prerequisites' | 'vault_intro';

import { useTranslation } from 'react-i18next';
import { CheckCircle2, Lock } from 'lucide-react';
import { ProfileSuccessAnim, VaultSuccessAnim } from '../components/ui/SuccessAnimations';
import { SyncAnimation } from '../components/ui/SyncAnimation';
import { VaultIntroAnimation } from '../components/animations/VaultIntroAnimation';
import { ScamAwarenessAnimation } from '../components/animations/ScamAwarenessAnimation';
import { OtpFallbackOptions } from '../components/ui/OtpFallbackOptions';
import { applyLowInternetMode, connectionQuality, probeLatency, LOW_INTERNET_LATENCY_MS } from '../lib/networkQuality';

const VaultSetup = ({ finishOnboarding }: { finishOnboarding: () => void }) => {
  const { t } = useTranslation();
  const [vaultState, setVaultState] = useState<'intro' | 'fetching' | 'done'>('intro');
  const [fetchedDocs, setFetchedDocs] = useState<string[]>([]);

  const startDigiLockerFetch = () => {
    setVaultState('fetching');
    
    setTimeout(() => setFetchedDocs(prev => [...prev, t('ob_doc_aadhaar')]), 1000);
    setTimeout(() => setFetchedDocs(prev => [...prev, t('ob_doc_pan')]), 2000);
    setTimeout(() => setFetchedDocs(prev => [...prev, t('ob_doc_bank')]), 3000);
    setTimeout(() => setVaultState('done'), 4000);
  };

  return (
    <motion.div key="vault_intro" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-4 my-auto'>
      
      {/* Animated 3D Keyhole Vault Hero */}
      {vaultState === 'intro' && (
        <VaultIntroAnimation />
      )}

      {vaultState !== 'intro' && (
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>{t('ob_vault_title')}</h1>
          <p className='text-xs text-slate-500 mt-0.5'>
            {t('ob_vault_subtitle')}
          </p>
        </div>
      )}
      
      {vaultState === 'intro' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-3'>
          <p className='text-xs text-slate-600 text-center leading-relaxed px-2'>
            {t('ob_vault_desc')}
          </p>
          <div className='bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs'>
            <Lock className='w-4 h-4 text-slate-500 shrink-0 mt-0.5' />
            <p className='text-[11px] text-slate-600 leading-snug'>
              {t('ob_vault_encryption_note')}
            </p>
          </div>
          <div className='pt-1'>
            <Button className='w-full py-3.5 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-sm' onClick={startDigiLockerFetch}>
              {t('ob_vault_connect')} →
            </Button>
          </div>
        </motion.div>
      )}

      {vaultState === 'fetching' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-6 py-4'>
          <SyncAnimation />
          <p className='text-epfo-blue font-medium text-center'>
            {t('ob_vault_syncing')}
          </p>
          <div className='space-y-3'>
            {[t('ob_doc_aadhaar'), t('ob_doc_pan'), t('ob_doc_bank')].map((doc) => {
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
              <p className='font-semibold'>{t('ob_vault_ready')}</p>
              <p className='text-sm mt-1'>{t('ob_vault_success')}</p>
            </div>
          </div>
          <div className='space-y-3'>
            {[t('ob_doc_aadhaar'), t('ob_doc_pan'), t('ob_doc_bank')].map(doc => (
              <div key={doc} className='flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50'>
                <CheckCircle2 className='w-5 h-5 text-green-600' />
                <span className='font-medium text-green-800'>{doc}</span>
              </div>
            ))}
          </div>
          <div className='pt-4'>
            <Button className='w-full py-4 text-lg' onClick={finishOnboarding}>
              {t('ob_vault_go_dashboard')}
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
  const [step, setStep] = useState<Step>('network_check');
  
  const { verifyUAN, loginWithPhone, completeProfile, user } = useSessionStore();

  React.useEffect(() => {
    if (step === 'network_check') {
      const runNetworkCheck = async () => {
        const medianLatency = await probeLatency();
        const isLow = connectionQuality() === 'low' || medianLatency > LOW_INTERNET_LATENCY_MS;
        applyLowInternetMode(isLow);
      };
      runNetworkCheck();
      const nextStep = localStorage.getItem('onboarded') === 'true' ? 'returning_login' : 'language';
      const timer = setTimeout(() => setStep(nextStep), 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);
  
  const [uanInput, setUanInput] = useState('101234567890');
  const [phoneInput, setPhoneInput] = useState('9876543210');
  const [otpInput, setOtpInput] = useState('1234');
  const [showOtp, setShowOtp] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [profileName, setProfileName] = useState('Rameshwar Sharma');
  const [mpinInput, setMpinInput] = useState('1234');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code).then(() => {
        toast.success(t('lang_changed_toast', 'Language changed'));
    });
    localStorage.setItem('language', code);
    setStep('scam_awareness');
  };

  const handleUanVerification = async () => {
    if (!showOtp) {
      if (uanInput.length === 12) {
        setIsVerifying(true);
        await new Promise(r => setTimeout(r, 800)); // Simulate sending OTP
        setIsVerifying(false);
        setShowOtp(true);
        setShowFallback(false);
      } else {
        alert(t('ob_invalid_uan'));
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
      } else {
        setFailedAttempts(prev => {
          const next = prev + 1;
          if (next >= 3) setIsLocked(true);
          return next;
        });
        setShowFallback(true);
        toast.error(t('ob_invalid_otp'));
      }
    } else {
      setFailedAttempts(prev => {
        const next = prev + 1;
        if (next >= 3) setIsLocked(true);
        return next;
      });
      setShowFallback(true);
      toast.error(t('ob_invalid_otp_attempt', { attempt: failedAttempts + 1 }));
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
      setShowFallback(true);
      toast.error(t('ob_invalid_otp'));
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
              if (step === 'scam_awareness') setStep('language');
              else if (step === 'user_type') setStep('scam_awareness');
              else if (step === 'returning_login') setStep('user_type');
              else if (step === 'identity') setStep('user_type');
              else if (step === 'verify_uan' || step === 'mobile_login') setStep('identity');
              else if (step === 'profile_setup') setStep('verify_uan');
              else if (step === 'prerequisites') setStep('profile_setup');
              else if (step === 'vault_intro') setStep('prerequisites');
            }} 
            aria-label={t('ob_go_back')}
            className='p-2 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 rounded-full shadow-sm hover:bg-transparent transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
          </button>
        </div>
      )}
      <div className='flex-1 p-6 flex flex-col pb-12 max-w-md mx-auto w-full min-h-[min-content]'>
        <AnimatePresence mode='wait'>
          
          {step === 'network_check' && (
            <motion.div key="network_check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='space-y-6 my-auto text-center'>
              <div className='flex items-center justify-center mb-4'>
                <div className='animate-spin w-12 h-12 border-4 border-epfo-blue border-t-transparent rounded-full' />
              </div>
              <h1 className='text-2xl font-semibold mb-2 text-slate-900'>{t('ob_network_check_title')}</h1>
              <p className='text-slate-500 text-sm'>{t('ob_network_check_subtitle')}</p>
            </motion.div>
          )}

          {step === 'language' && (
            <motion.div key="language" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <Globe className='w-8 h-8 text-epfo-blue' />
              </div>
              <div>
                <h1 className='text-3xl font-semibold mb-2 text-slate-900'>{t('onboarding_title')}</h1>
                <p className='text-slate-500 text-sm'>{t('onboarding_subtitle')}</p>
              </div>
              <div className='space-y-3 mt-8' role="listbox" aria-label={t('ob_select_language')}>
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => handleLanguageSelect(lang.code)} aria-label={t('ob_select_language_name', { name: lang.name })} className='w-full p-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm text-left hover:border-epfo-blue transition-colors'>
                    <span className='font-medium text-lg'>{lang.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'scam_awareness' && (
            <motion.div key="scam_awareness" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-3 my-auto'>
              <ScamAwarenessAnimation />
              
              <div>
                <div className='flex items-center gap-2 mb-0.5'>
                  <AlertTriangle className='w-4 h-4 text-amber-500 shrink-0' />
                  <h1 className='text-xl font-bold text-slate-900'>{t('scam_awareness_title')}</h1>
                </div>
                <p className='text-slate-500 text-[11px] leading-snug'>{t('scam_awareness_subtitle')}</p>
              </div>

              <div className='bg-white border border-slate-200/80 rounded-xl p-3 space-y-2'>
                <p className='text-[11px] text-slate-600 leading-snug'><span className='font-semibold text-red-600'>1.</span> {t('scam_awareness_point_1')}</p>
                <p className='text-[11px] text-slate-600 leading-snug'><span className='font-semibold text-red-600'>2.</span> {t('scam_awareness_point_2')}</p>
                <p className='text-[11px] text-slate-600 leading-snug'><span className='font-semibold text-amber-600'>3.</span> {t('scam_awareness_point_3')}</p>
                <p className='text-[11px] text-slate-600 leading-snug'><span className='font-semibold text-green-600'>4.</span> {t('scam_awareness_point_4')}</p>
              </div>

              <div className='pt-1'>
                <Button className='w-full py-3.5 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-sm' onClick={() => setStep('user_type')}>
                  {t('scam_awareness_button')} →
                </Button>
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
              
              {!isLocked ? (
                <>
                  <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                    <ShieldCheck className='w-8 h-8 text-epfo-blue' />
                  </div>
                  <div>
                    <h1 className='text-3xl font-semibold mb-2'>{t('ob_welcome_back')}</h1>
                    <p className='text-slate-500'>{t('ob_enter_uan_continue')}</p>
                  </div>
                  
                  <div className='space-y-4 mt-8'>
                    <input 
                      id="onboard-uan"
                      type="text"
                      maxLength={12}
                      className='w-full p-4 rounded-xl border border-slate-200 text-lg outline-none focus:ring-2 focus:ring-epfo-blue transition-all'
                      placeholder={t('enter_uan')}
                      value={uanInput}
                      onChange={(e) => setUanInput(e.target.value.replace(/\D/g, ''))}
                      disabled={showOtp}
                    />

                    {showOtp && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <input 
                          id="onboard-otp"
                          type="text"
                          className='w-full p-4 rounded-xl border border-slate-200 text-lg outline-none focus:ring-2 focus:ring-epfo-blue transition-all mt-4'
                          placeholder={t('ob_enter_otp_hint')}
                          aria-label={t('ob_otp_aria')}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        />
                        {showFallback ? (
                          <OtpFallbackOptions />
                        ) : (
                          <div className='flex justify-between items-center mt-3 px-1'>
                            <p className='text-xs text-slate-500'>{t('ob_no_otp')}</p>
                            <div className='flex gap-3'>
                              <button className='text-xs font-semibold text-epfo-blue hover:underline' onClick={() => toast.success(t('ob_otp_whatsapp'))}>{t('ob_whatsapp')}</button>
                              <button className='text-xs font-semibold text-epfo-blue hover:underline' onClick={() => toast.success(t('ob_voice_call_init'))}>{t('ob_voice_call')}</button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    <Button 
                      className='w-full py-4 text-lg' 
                      onClick={handleUanVerification}
                      disabled={(uanInput.length !== 12) || (showOtp && otpInput.length < 4) || isVerifying}
                      isLoading={isVerifying}
                    >
                      {showOtp ? t('ob_verify_otp_login') : t('get_otp')}
                    </Button>

                    <div className='pt-6 relative'>
                      <div className='absolute inset-0 flex items-center'><div className='w-full border-t border-slate-200'></div></div>
                      <div className='relative flex justify-center text-sm'><span className='px-2 bg-slate-50 text-slate-500'>{t('ob_or')}</span></div>
                    </div>
                    
                    <Button variant='outline' className='w-full py-4' onClick={() => setStep('mobile_login')}>
                      {t('ob_login_mobile_otp')}
                    </Button>
                    <div className='pt-2 border-t border-slate-100'>
                      <Button variant='outline' className='w-full py-4' onClick={() => navigate('/uan-activation')}>
                        {t('ob_activate_uan')}
                      </Button>
                    </div>
                    <p className='text-xs text-center text-slate-500'>{t('ob_mobile_login_hint')}</p>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-6 text-center pt-8'>
                  <div className='bg-red-50 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto'>
                    <Lock className='w-12 h-12 text-red-500' />
                  </div>
                  <div>
                    <h1 className='text-2xl font-bold mb-2 text-slate-900'>{t('ob_account_locked')}</h1>
                    <p className='text-slate-500 px-4'>
                      {t('ob_locked_desc')}
                    </p>
                  </div>
                  
                  <div className='bg-orange-50 border border-orange-200 p-5 rounded-2xl text-left mt-6'>
                    <h3 className='font-semibold text-orange-900 mb-2'>{t('ob_unlock_options')}</h3>
                    <p className='text-sm text-orange-800 mb-4'>
                      {t('ob_unlock_desc')}
                    </p>
                    <div className='space-y-3'>
                      <Button className='w-full bg-orange-600 hover:bg-orange-700' onClick={() => {setIsLocked(false); setFailedAttempts(0); toast.success(t('ob_unlocked'));}}>
                        {t('ob_unlock_btn')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'identity' && (
            <motion.div key="identity" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <User className='w-8 h-8 text-epfo-blue' />
              </div>
              <div>
                <h1 className='text-3xl font-semibold mb-2'>{t('ob_identity_discovery')}</h1>
                <p className='text-slate-500'>
                  {t('ob_identity_recommend')}
                </p>
              </div>

              <div className='bg-transparent p-4 rounded-xl border border-slate-200 mt-4 space-y-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <CheckCircle2 className='w-4 h-4 text-epfo-blue' />
                  <h3 className='font-semibold text-slate-800 text-sm'>{t('ob_why_uan')}</h3>
                </div>
                <p className='text-xs text-slate-600'>{t('ob_why_uan_desc')}</p>
              </div>

              <div className='space-y-4 pt-4'>
                <Button className='w-full py-4 text-lg' onClick={() => setStep('verify_uan')}>
                  {t('ob_yes_login_uan')}
                </Button>
                <Button variant='outline' className='w-full py-4 text-lg' onClick={() => setStep('mobile_login')}>
                  {t('ob_continue_without_uan')}
                </Button>
                <div className="pt-2 text-center">
                  <button onClick={() => setStep('mobile_login')} className="text-sm text-epfo-blue hover:underline font-medium">
                    {t('ob_dont_know_uan')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'verify_uan' && (
            <motion.div key="verify_uan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <h1 className='text-3xl font-semibold mb-2'>{t('ob_verify_uan')}</h1>
              <div className='space-y-4'>
                <input 
                  id="onboard-verify-uan"
                  type="text" 
                  placeholder={t('enter_uan')} 
                  aria-label={t('enter_uan')}
                  className='w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-orange outline-none'
                  value={uanInput}
                  onChange={e => setUanInput(e.target.value.replace(/\D/g, ''))}
                  disabled={showOtp}
                />

                {showOtp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <input 
                      id="onboard-verify-otp"
                      type="text"
                      className='w-full p-4 rounded-xl border border-slate-200 text-lg outline-none focus:ring-2 focus:ring-epfo-orange transition-all mt-4'
                      placeholder={t('ob_enter_otp_hint')}
                      aria-label={t('ob_otp_aria')}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    />
                    {showFallback ? (
                      <OtpFallbackOptions />
                    ) : (
                      <div className='flex justify-between items-center mt-3 px-1'>
                        <p className='text-xs text-slate-500'>{t('ob_no_otp')}</p>
                        <div className='flex gap-3'>
                          <button className='text-xs font-semibold text-epfo-orange hover:underline' onClick={() => toast.success(t('ob_otp_whatsapp'))}>{t('ob_whatsapp')}</button>
                          <button className='text-xs font-semibold text-epfo-orange hover:underline' onClick={() => toast.success(t('ob_voice_call_init'))}>{t('ob_voice_call')}</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <Button className='w-full py-4' disabled={(uanInput.length !== 12) || (showOtp && otpInput.length < 4) || isVerifying} onClick={handleUanVerification}>
                  {isVerifying ? t('ob_verifying') : showOtp ? t('verify_otp') : t('get_otp')}
                </Button>
                <div className='pt-4 border-t border-slate-100'>
                  <p className='text-sm text-center text-slate-500 mb-3'>{t('ob_not_activated')}</p>
                  <Button variant='outline' className='w-full py-3' onClick={() => navigate('/uan-activation')}>
                    {t('ob_activate_uan')}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'mobile_login' && (
            <motion.div key="mobile_login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <h1 className='text-3xl font-semibold mb-2'>{t('ob_mobile_auth')}</h1>
              <p className='text-slate-500'>{t('ob_phone_hint')}</p>
              <div className='space-y-4'>
                <input 
                  id="onboard-phone"
                  type="tel" 
                  placeholder={t('ob_phone_placeholder')} 
                  aria-label={t('ob_phone_aria')}
                  className='w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-orange outline-none'
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                />
                <input 
                  id="onboard-phone-otp"
                  type="text" 
                  placeholder={t('ob_otp_placeholder')} 
                  aria-label={t('ob_phone_otp_aria')}
                  className='w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-orange outline-none'
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                />
                <Button className='w-full py-4' disabled={isVerifying || phoneInput.length < 10} onClick={handlePhoneLogin}>
                  {isVerifying ? t('ob_verifying') : t('ob_login')}
                </Button>
                {showFallback && <OtpFallbackOptions />}
              </div>
            </motion.div>
          )}

          {step === 'profile_setup' && (
            <motion.div key="profile_setup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto text-center'>
              <ProfileSuccessAnim />
              <h1 className='text-3xl font-semibold mb-2'>{t('ob_uan_verified')}</h1>
              <p className='text-slate-500'>{t('ob_uan_verified_desc')}</p>
              
              <div className='pt-6 text-left'>
                <label htmlFor="profile-name" className="text-sm font-medium text-slate-700 block mb-2">{t('full_name')}</label>
                <input 
                  id="profile-name"
                  type="text"
                  placeholder={t('ob_name_placeholder')}
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
                  {t('ob_continue')}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'prerequisites' && (
            <motion.div key="prerequisites" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className='space-y-6 my-auto'>
              <div className='bg-orange-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
                <ShieldCheck className='w-8 h-8 text-orange-600' />
              </div>
              <h1 className='text-3xl font-semibold mb-2'>{t('mpin_setup_title')}</h1>
              <p className='text-slate-500 text-sm'>{t('ob_security_setup_desc')}</p>
              
              <div className='space-y-4 pt-4'>
                <div className='space-y-2'>
                  <label htmlFor="onboard-mobile-verify" className='text-sm font-medium text-slate-700'>{t('ob_mobile_verification')}</label>
                  <input id="onboard-mobile-verify" type="text" value="1234" readOnly className='w-full p-4 border border-slate-200 rounded-xl bg-transparent text-slate-500 outline-none' />
                </div>
                
                <div className='space-y-2'>
                  <label htmlFor="onboard-captcha" className='text-sm font-medium text-slate-700'>{t('ob_captcha_verification')}</label>
                  <div className='flex gap-3'>
                    <div className='p-4 bg-slate-100 border border-slate-200 rounded-xl font-mono text-lg tracking-widest text-slate-700 select-none'>
                      aB3cD
                    </div>
                    <input id="onboard-captcha" type="text" value="aB3cD" readOnly className='flex-1 p-4 border border-slate-200 rounded-xl bg-transparent text-slate-500 outline-none' />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label htmlFor="onboard-mpin" className='text-sm font-medium text-slate-700'>{t('ob_set_mpin')}</label>
                  <input 
                    id="onboard-mpin"
                    type="password" 
                    maxLength={4}
                    value={mpinInput} 
                    onChange={e => setMpinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('ob_enter_mpin')}
                    className='w-full p-4 border border-slate-200 rounded-xl bg-transparent focus:ring-2 focus:ring-epfo-orange outline-none tracking-[1em] text-center text-lg' 
                  />
                  <p className='text-xs text-slate-500 text-center'>{t('mpin_hint')}</p>
                </div>

                <Button className='w-full py-4 text-lg mt-4 bg-orange-600 hover:bg-orange-700' disabled={mpinInput.length !== 4} onClick={() => setStep('vault_intro')}>
                  {t('verify_and_continue')}
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
