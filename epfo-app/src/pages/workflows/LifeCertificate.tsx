import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Truck, 
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { FlowInfoCard } from '../../components/ui/FlowInfoCard';
import { useDemoStore } from '../../store/useDemoStore';

export const LifeCertificate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearScenario = useDemoStore(s => s.clearScenario);

  useEffect(() => { clearScenario(); }, []);
  
  const [step, setStep] = useState<'status' | 'face_auth' | 'processing' | 'success' | 'doorstep'>('status');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPrompt, setScanPrompt] = useState(t('dlc_position_face_in_frame'));
  const [pramaanId, setPramaanId] = useState<string | null>(null);
  
  // Pensioner Profile Data (Mocked from Aadhaar / PPO Store)
  const pensioner = {
    name: 'Rameshwar Lal Sharma',
    ppoNumber: 'DL/CPM/00098412/EPS',
    pensionType: 'EPS-95 (Monthly Pension)',
    bankName: 'State Bank of India',
    accountLast4: '4892',
    lastSubmitted: '14 Nov 2025',
    dueDate: '30 Nov 2026',
    status: 'ACTIVE'
  };

  // Face auth scanning sequence
  useEffect(() => {
    if (step === 'face_auth' && cameraActive) {
      const prompts = [
        { progress: 25, text: t('dlc_keep_head_straight') },
        { progress: 50, text: t('dlc_blink_eyes') },
        { progress: 75, text: t('dlc_hold_still_verifying') },
        { progress: 100, text: `${t('dlc_face_matched')} 🎉` }
      ];

      let idx = 0;
      const interval = setInterval(() => {
        if (idx < prompts.length) {
          setScanProgress(prompts[idx].progress);
          setScanPrompt(prompts[idx].text);
          idx++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setCameraActive(false);
            setStep('processing');
            setTimeout(() => {
              const generatedId = `JP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
              setPramaanId(generatedId);
              setStep('success');
              toast.success(t('dlc_submitted_success'));
            }, 2500);
          }, 800);
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [step, cameraActive]);

  const startFaceAuth = () => {
    setStep('face_auth');
    setScanProgress(0);
    setScanPrompt(t('dlc_position_face_in_frame'));
    setTimeout(() => {
      setCameraActive(true);
    }, 600);
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent relative overflow-y-auto pb-12'>
      {/* Top Navigation Bar */}
      <div className='bg-white/90 backdrop-blur-md px-4 py-4 flex items-center sticky top-0 z-20 border-b border-slate-100 shadow-sm'>
        <button 
          onClick={() => {
            if (step === 'status') navigate(-1);
            else setStep('status');
          }} 
          aria-label={t('dlc_go_back_label')}
          className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
        </button>
        <div className='ml-2 flex-1'>
          <h1 className='text-lg font-bold text-slate-900 leading-tight'>{t('dlc_title')}</h1>
          <p className='text-xs text-slate-500 font-medium'>{t('dlc_subtitle')}</p>
        </div>
      </div>

      <div className='p-5 space-y-5 max-w-md mx-auto w-full'>
        {step === 'status' && <FlowInfoCard flowType="life_certificate" />}
        
        {/* STEP 1: PPO STATUS OVERVIEW */}
        {step === 'status' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            
            {/* Pension Status Banner */}
            <div className='bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden'>
              <div className='absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none' />
              
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <ShieldCheck className='w-5 h-5 text-emerald-300' />
                  <span className='text-xs uppercase tracking-wider font-bold text-emerald-100'>{t('pension_status')}</span>
                </div>
                <span className='bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white'>
                  {t('dlc_status_active')}
                </span>
              </div>

              <div className='mt-4'>
                <p className='text-xs text-emerald-100'>{t('pensioner_name')}</p>
                <p className='text-xl font-bold mt-0.5 tracking-tight'>{pensioner.name}</p>
                <p className='text-xs font-mono text-emerald-200 mt-1'>{t('dlc_ppo_prefix')}: {pensioner.ppoNumber}</p>
              </div>

              <div className='grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/20 text-xs'>
                <div>
                  <p className='text-emerald-200'>{t('disbursing_bank')}</p>
                  <p className='font-semibold text-white mt-0.5'>{pensioner.bankName} (••{pensioner.accountLast4})</p>
                </div>
                <div>
                  <p className='text-emerald-200'>{t('next_due_date')}</p>
                  <p className='font-semibold text-white mt-0.5'>{pensioner.dueDate}</p>
                </div>
              </div>
            </div>

            {/* EPFO Policy Clarification Card (Addressing Confusion about Deadlines) */}
            <div className='bg-blue-50/90 backdrop-blur-sm border border-blue-200/80 rounded-2xl p-4 flex gap-3 items-start shadow-sm'>
              <AlertCircle className='w-5 h-5 text-epfo-blue shrink-0 mt-0.5' />
              <div className='text-xs text-blue-950 leading-relaxed'>
                <p className='font-bold text-blue-900 mb-1'>{t('dlc_good_news_title')}</p>
                {t('dlc_policy_note_body')}
              </div>
            </div>

            {/* Action Cards */}
            <div className='space-y-3 pt-2'>
              <h2 className='text-sm font-bold text-slate-800 uppercase tracking-wider px-1'>{t('dlc_choose_method_title')}</h2>

              {/* Method 1: Face-Auth on Mobile (Recommended) */}
              <button
                onClick={startFaceAuth}
                aria-label={t('dlc_scan_face_aria')}
                className='w-full bg-white/90 backdrop-blur-sm border-2 border-epfo-blue/40 hover:border-epfo-blue p-4 rounded-2xl shadow-sm text-left transition-all hover:shadow-md flex items-center gap-4 group'
              >
                <div className='w-12 h-12 bg-blue-100 text-epfo-blue rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                  <Camera className='w-6 h-6' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-slate-900 text-base'>{t('face_auth_title')}</span>
                    <span className='bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full'>
                      {t('recommended')}
                    </span>
                  </div>
                  <p className='text-xs text-slate-500 mt-1'>
                    {t('face_auth_desc')}
                  </p>
                </div>
              </button>

              {/* Method 2: Doorstep Service via Postman */}
              <button
                onClick={() => setStep('doorstep')}
                className='w-full bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-slate-300 p-4 rounded-2xl shadow-sm text-left transition-all flex items-center gap-4 group'
              >
                <div className='w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center shrink-0'>
                  <Truck className='w-6 h-6' />
                </div>
                <div className='flex-1'>
                  <span className='font-bold text-slate-900 text-base'>{t('doorstep_title')}</span>
                  <p className='text-xs text-slate-500 mt-1'>
                    {t('doorstep_desc')}
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: FACE AUTH CAMERA SIMULATION */}
        {step === 'face_auth' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4 text-center'>
            <div className='bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-md'>
              <h2 className='text-lg font-bold text-slate-900'>{t('dlc_facial_liveness_title')}</h2>
              <p className='text-xs text-slate-500 mt-1'>
                {t('dlc_camera_look_direct')}
              </p>

              {/* Interactive Camera Viewport */}
              <div className='relative w-64 h-64 mx-auto my-6 rounded-full overflow-hidden border-4 border-epfo-blue shadow-inner bg-slate-900 flex items-center justify-center'>
                {/* Background Silhouette / Face Preview */}
                <div className='absolute inset-0 flex items-center justify-center opacity-70'>
                  <UserCheck className='w-40 h-40 text-blue-200/50' />
                </div>

                {/* Animated Scan Line */}
                <motion.div 
                  animate={{ y: [-110, 110, -110] }} 
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className='absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]'
                />

                {/* Progress Overlay */}
                <div className='absolute bottom-3 bg-black/60 backdrop-blur-sm text-cyan-300 text-xs font-mono px-3 py-1 rounded-full'>
                  {scanProgress}% {t('dlc_verified')}
                </div>
              </div>

              {/* Live Instruction Pill */}
              <div className='inline-flex items-center gap-2 bg-blue-50 text-epfo-blue px-4 py-2 rounded-full text-xs font-semibold border border-blue-100 shadow-sm'>
                <Sparkles className='w-4 h-4 animate-spin' />
                {scanPrompt}
              </div>
            </div>

            <button 
              onClick={() => setStep('status')} 
              className='text-xs text-slate-500 hover:text-slate-700 font-medium underline'
            >
              {t('dlc_cancel_go_back')}
            </button>
          </motion.div>
        )}

        {/* STEP 3: PROCESSING / AADHAAR VERIFICATION */}
        {step === 'processing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-white/90 backdrop-blur-md rounded-3xl p-8 text-center space-y-4 shadow-lg my-auto'>
            <div className='w-16 h-16 bg-blue-50 text-epfo-blue rounded-full mx-auto flex items-center justify-center animate-spin'>
              <RefreshCw className='w-8 h-8' />
            </div>
            <h2 className='text-lg font-bold text-slate-900'>{t('dlc_generating_id')}</h2>
            <p className='text-xs text-slate-500 max-w-xs mx-auto'>
              {t('dlc_matching_biometric')}
            </p>
          </motion.div>
        )}

        {/* STEP 4: SUCCESS ACKNOWLEDGEMENT */}
        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-emerald-200 rounded-3xl p-6 shadow-xl text-center space-y-4'>
              <div className='w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-sm'>
                <CheckCircle2 className='w-10 h-10' />
              </div>

              <div>
                <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200'>
                  {t('dlc_certificate_accepted')}
                </span>
                <h2 className='text-xl font-bold text-slate-900 mt-2'>{t('dlc_jeevan_pramaan_submitted')}</h2>
                <p className='text-xs text-slate-500 mt-1'>
                  {t('dlc_pension_uninterrupted_before')} <strong>{new Date().getDate()} {new Date().toLocaleString('default', { month: 'short' })} {new Date().getFullYear() + 1}</strong>.
                </p>
              </div>

              {/* Digital Certificate Receipt Card */}
              <div className='bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs'>
                <div className='flex justify-between items-center pb-2 border-b border-slate-200 font-bold'>
                  <span className='text-slate-600'>{t('dlc_pramaan_id_label')}</span>
                  <span className='font-mono text-epfo-blue text-sm'>{pramaanId}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('dlc_pensioner_name_label')}</span>
                  <span className='font-medium text-slate-900'>{pensioner.name}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('dlc_ppo_number_label')}</span>
                  <span className='font-mono font-medium text-slate-900'>{pensioner.ppoNumber}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-500'>{t('dlc_auth_mode_label')}</span>
                  <span className='font-medium text-emerald-700'>{t('dlc_aadhaar_face_rd')}</span>
                </div>
                <div className='flex justify-between pt-1 border-t border-slate-200'>
                  <span className='text-slate-500'>{t('dlc_submission_timestamp_label')}</span>
                  <span className='font-medium text-slate-900'>{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className='space-y-2 pt-2'>
                <Button 
                  onClick={() => {
                    toast.success(t('dlc_cert_downloaded'));
                  }}
                  className='w-full py-3.5 flex items-center justify-center gap-2 font-semibold'
                >
                  <Download className='w-4 h-4' /> {t('dlc_download_certificate')}
                </Button>

                <button 
                  onClick={() => navigate('/')}
                  aria-label={t('dlc_return_dashboard_aria')}
                  className='w-full py-3 text-slate-600 font-medium text-xs hover:text-slate-900 transition-colors'
                >
                  {t('dlc_return_to_dashboard')}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: IPPB DOORSTEP SERVICE BOOKING */}
        {step === 'doorstep' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            <div className='bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-md space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0'>
                  <Truck className='w-5 h-5' />
                </div>
                <div>
                  <h2 className='text-base font-bold text-slate-900'>{t('dlc_book_postman_visit')}</h2>
                  <p className='text-xs text-slate-500'>{t('dlc_ippb_subtitle')}</p>
                </div>
              </div>

              <div className='bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-900'>
                {t('dlc_agent_note_prefix')} <strong>₹70</strong> {t('dlc_agent_note_suffix')}
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success(t('dlc_doorstep_registered'));
                setStep('status');
              }} className='space-y-3 pt-2 text-xs'>
                <div>
                  <label htmlFor="lc-address" className='font-semibold text-slate-700 block mb-1'>{t('dlc_delivery_address_label')}</label>
                  <textarea 
                    id="lc-address"
                    defaultValue="Flat 402, Shanti Vihar, Sector 14, Dwarka, New Delhi - 110078"
                    className='w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-epfo-blue outline-none resize-none h-20'
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lc-phone" className='font-semibold text-slate-700 block mb-1'>{t('dlc_contact_mobile_label')}</label>
                  <input 
                    id="lc-phone"
                    type="tel" 
                    defaultValue="+91 98765 43210"
                    className='w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-epfo-blue outline-none'
                    required
                  />
                </div>

                <div className='pt-2 flex gap-2'>
                  <Button type='submit' className='flex-1 py-3 bg-amber-600 hover:bg-amber-700'>
                    {t('dlc_confirm_booking')}
                  </Button>
                  <button 
                    type='button' 
                    onClick={() => setStep('status')}
                    className='px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium'
                  >
                    {t('dlc_back')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
