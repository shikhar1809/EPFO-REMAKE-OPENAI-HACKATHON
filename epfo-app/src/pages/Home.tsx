import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  LogOut, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Bell,
  Mic,
  ArrowLeft,
  FileText,
  Wallet,
  ArrowRightLeft,
  Award,
  CalendarX2,
  HelpCircle,
  Vault,
  Sparkles,
  Send,
} from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import { useDemoStore } from '../store/useDemoStore';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { NotificationModal } from '../components/notifications/NotificationModal';
import { NotificationCardStack } from '../components/notifications/NotificationCardStack';
import toast from 'react-hot-toast';
import { AssistantAvatar } from '../components/ui/AssistantAvatar';
import { detectCompoundIntent, classifyIntent } from '../lib/flowDetection';
import { generatePlan } from '../agents/registry';
import { buildMultiPhaseTask } from '../agents/compound';
import { ClaimTrackerCard } from '../components/dashboard/ClaimTrackerCard';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { AccountHealthCard } from '../components/dashboard/AccountHealthCard';
import { RecentActivityCard } from '../components/dashboard/RecentActivityCard';
import { SwappableCards } from '../components/dashboard/SwappableCards';
import { ActiveSessionsPrompt } from '../components/dashboard/ActiveSessionsPrompt';

export const Home: React.FC = () => {
  const { t } = useTranslation();
    const sc = useDemoStore(s => s.activeScenario);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, riskLevel } = useSessionStore();
  const { activeTasks, startTask, resumeTask, clearTask, archiveTask } = useWorkflowStore();
  const { enabled: notificationsEnabled } = useNotificationStore();
  
  const [flowChoice, setFlowChoice] = useState<'none' | 'agentic' | 'traditional'>('none');
  const [pendingFlowChoice, setPendingFlowChoice] = useState<'agentic' | 'traditional' | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzePhase, setAnalyzePhase] = useState<'fetching' | 'generating' | 'starting' | null>(null);

  // Auto-archive completed tasks
  React.useEffect(() => {
    Object.values(activeTasks).forEach(task => {
      if (task.agentState === 'completed') {
        archiveTask(task.taskId);
      }
    });
  }, [activeTasks, archiveTask]);

  // Remind users to setup notifications if not enabled
  React.useEffect(() => {
    if (isAuthenticated && !notificationsEnabled) {
      const hasSeenToast = sessionStorage.getItem('epfo_notif_toast_seen');
      if (!hasSeenToast) {
        sessionStorage.setItem('epfo_notif_toast_seen', 'true');
        setTimeout(() => {
          toast(
            (toastInstance) => (
              <div className="flex flex-col gap-2 p-1">
                <span className="text-xs font-semibold text-slate-800">
                  {t('home_notif_toast_title')}
                </span>
                <span className="text-[11px] text-slate-600 leading-tight">
                  {t('home_notif_toast_desc')}
                </span>
                <button
                  onClick={() => {
                    toast.dismiss(toastInstance.id);
                    setIsNotificationOpen(true);
                  }}
                  aria-label={t('home_notif_setup_button')}
                  className="mt-1 bg-epfo-blue text-white py-1.5 rounded-lg text-[11px] font-bold shadow-xs hover:bg-blue-800 transition-colors w-full"
                >
                  {t('home_notif_setup_button')}
                </button>
              </div>
            ),
            { duration: 8000, position: 'bottom-center' }
          );
        }, 800);
      }
    }
  }, [isAuthenticated, notificationsEnabled]);

  const activeTaskValues = Object.values(activeTasks).filter(t => t.agentState !== 'completed');
  const firstName = user?.name ? user.name.trim().split(' ')[0] : t('home_citizen');

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setChatInput("I want to submit my life certificate");
        setIsRecording(false);
      }, 2200);
    } else {
      setIsRecording(false);
    }
  };

  const handleAgenticStart = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || chatInput).trim();
    if (!query) return;

    setIsAnalyzing(true);
    setAnalyzePhase('fetching');
    
    setTimeout(() => setAnalyzePhase('generating'), 1000);
    setTimeout(() => setAnalyzePhase('starting'), 2000);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzePhase(null);

      const detectedFlows = detectCompoundIntent(query);

      if (detectedFlows && detectedFlows.length >= 2) {
        const { phases, combinedPlan } = buildMultiPhaseTask(detectedFlows);
        startTask(query, 'multi_phase', combinedPlan, phases);
      } else {
        const taskType = classifyIntent(query);
        const plan = generatePlan(taskType);
        startTask(query, taskType, plan);
      }

      setChatInput('');
      navigate('/smart-flow');
    }, 2800);
  };

  const [resumeTaskId, setResumeTaskId] = useState<string | null>(null);
  const [resumeSecurityAnswer, setResumeSecurityAnswer] = useState('Fluffy');
  const [resumeError, setResumeError] = useState(false);

  const handleResume = (taskId: string) => {
    setResumeTaskId(taskId);
  };

  const confirmResume = () => {
    if (resumeSecurityAnswer.toLowerCase() === 'fluffy') {
      if (resumeTaskId) {
        resumeTask(resumeTaskId);
        setPendingFlowChoice(null);
        setFlowChoice('none');
        navigate(`/smart-flow`);
      }
    } else {
      setResumeError(true);
    }
  };

  const goToFlow = (choice: 'agentic' | 'traditional') => {
    setPendingFlowChoice(null);
    setFlowChoice(choice);
  };

  const requestFlow = (choice: 'agentic' | 'traditional') => {
    if (activeTaskValues.length > 0) {
      setPendingFlowChoice(choice);
    } else {
      goToFlow(choice);
    }
  };

  const handleDeleteSession = (taskId: string) => {
    clearTask(taskId);
    const remaining = Object.values(useWorkflowStore.getState().activeTasks)
      .filter(t => t.agentState !== 'completed').length;
    if (remaining === 0 && pendingFlowChoice) {
      goToFlow(pendingFlowChoice);
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-y-auto relative'>
      
      {/* Compact Clean Header */}
      <div className='px-4 py-2 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex justify-between items-center sticky top-0 z-10 shadow-xs'>
        <div>
          <h1 className='text-base font-bold tracking-tight text-slate-900 leading-snug'>
            {isAuthenticated ? t('welcome_back', { name: firstName }) : t('portal_title')}
          </h1>
          {isAuthenticated && user?.uan && (
            <p className='text-[11px] text-slate-500 font-mono'>
              UAN: <span className='font-bold text-slate-700'>{user.uan}</span>
            </p>
          )}
        </div>
        <div className='flex items-center gap-1.5'>
          <button 
            onClick={() => setIsNotificationOpen(true)}
            aria-label={t('home_aria_open_notifications')}
            className={`p-2 rounded-full transition-all shadow-2xs relative ${
              notificationsEnabled 
                ? 'bg-blue-50 text-epfo-blue hover:bg-blue-100' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={t('notifications')}
          >
            <Bell className='!w-4 !h-4' />
            {notificationsEnabled && (
              <span className='absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white'></span>
            )}
          </button>
          <button 
            onClick={() => { logout(); navigate('/onboarding', { replace: true }); }} 
            className='p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-2xs' 
            aria-label={t('logout')}
            title={t('logout')}
          >
            <LogOut className='!w-4 !h-4' />
          </button>
        </div>
      </div>

<div className='p-3 space-y-2 max-w-2xl mx-auto w-full pb-4'>

        {/* Global Analyzing Overlay — shows during handleAgenticStart from any view */}
        {isAnalyzing && (
          <div className='bg-slate-50 rounded-2xl border border-blue-100 p-6 flex flex-col items-center justify-center space-y-4 shadow-inner min-h-[180px]'>
            <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
              <AssistantAvatar 
                state={analyzePhase === 'fetching' ? 'reading' : analyzePhase === 'generating' ? 'generating' : 'processing'} 
                className='!w-8 !h-8 text-epfo-blue shadow-md' 
              />
            </div>
            <div className='w-full max-w-xs space-y-2 text-xs'>
              <div className='flex items-center gap-2.5'>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                <span className={`font-medium ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>{t('home_analyze_1')}</span>
              </div>
              <div className='flex items-center gap-2.5'>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                <span className={`font-medium ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>{t('home_analyze_2')}</span>
              </div>
              <div className='flex items-center gap-2.5'>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                <span className={`font-medium ${analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>{t('home_analyze_3')}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 1: MAIN DASHBOARD VIEW (flowChoice === 'none')       */}
        {/* ========================================================= */}
        {!isAnalyzing && flowChoice === 'none' && (
          <>
            {/* PF Details ⇄ Account Details ⇄ Recent Activity (auto-swapping) */}
            {isAuthenticated && (
              <SwappableCards intervalMs={5000}>
                <ClaimTrackerCard />
                <BalanceCard />
                <AccountHealthCard />
                <RecentActivityCard />
              </SwappableCards>
            )}

            {/* Smart Notifications — Card Stack */}
            {isAuthenticated && <NotificationCardStack />}



            {/* NEED MORE HELP ? (Smart Flow vs Traditional Flow) */}
            <section className='space-y-2 pt-0.5'>
              <div className='px-0.5'>
                <h2 className='text-[11px] font-bold text-slate-500 uppercase tracking-wider'>
                  {t('home_need_more_help')}
                </h2>
              </div>

              <div className='grid grid-cols-2 gap-2.5'>
                
                {/* 1. SMART FLOW (Opens Dedicated Smart Agent View) */}
                <button 
                  onClick={() => requestFlow('agentic')}
                  className='p-2.5 bg-gradient-to-br from-blue-50/95 via-white to-blue-50/50 border border-epfo-blue/40 hover:border-epfo-blue rounded-2xl flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs transition-all'
                >
                  <div className='flex items-center justify-between mb-1'>
                    <div className='w-6 h-6 bg-epfo-blue text-white rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform'>
                      <AssistantAvatar className='!w-4 !h-4' />
                    </div>
                    <span className='bg-epfo-orange text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase'>
                      {t('recommended')}
                    </span>
                  </div>
                  <h3 className='font-bold text-xs text-epfo-blue leading-tight'>
                    {t('home_smart_flow_title')}
                  </h3>
                  <p className='text-[10px] text-slate-600 mt-0.5 leading-relaxed'>
                    {t('home_smart_flow_desc')}
                  </p>
                  <div className='mt-1.5 text-[10px] font-bold text-epfo-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                    {t('home_smart_flow_launch')}
                  </div>
                </button>

                {/* 2. TRADITIONAL FLOW (Opens Dedicated Traditional View) */}
                <button 
                  onClick={() => requestFlow('traditional')}
                  className='p-2.5 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs transition-all'
                >
                  <div className='w-6 h-6 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mb-1 group-hover:scale-105 transition-transform'>
                    <FolderOpen className='!w-4 !h-4' />
                  </div>
                  <h3 className='font-bold text-xs text-slate-900 leading-tight group-hover:text-slate-700'>
                    {t('home_traditional_flow_title')}
                  </h3>
                  <p className='text-[10px] text-slate-600 mt-0.5 leading-relaxed'>
                    {t('home_traditional_flow_desc')}
                  </p>
                  <div className='mt-1.5 text-[10px] font-bold text-slate-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                    {t('home_open_portal')}
                  </div>
                </button>

              </div>
            </section>
          </>
        )}

        {/* ========================================================= */}
        {/* MODE 2: SMART FLOW AGENT PAGE (flowChoice === 'agentic')   */}
        {/* ========================================================= */}
        {flowChoice === 'agentic' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            className='space-y-4'
          >
            {/* Back Button to Dashboard */}
            <button 
              onClick={() => setFlowChoice('none')} 
              aria-label={t('home_aria_back_dashboard')}
              className='text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors'
            >
              <ArrowLeft className='!w-4 !h-4' /> {t('back_to_choices')}
            </button>

            {/* Smart Agent Greeting & Prompt Section */}
            <section className='bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4'>
              {/* Chatbox Textarea with Voice & Action */}
              <form onSubmit={handleAgenticStart} className='space-y-3'>
                  <div className='relative bg-slate-50 rounded-3xl border border-slate-200 focus-within:border-epfo-blue focus-within:bg-white transition-all shadow-md focus-within:shadow-lg overflow-hidden'>
                    <div className='flex items-start p-3'>
                      <AssistantAvatar state={isAnalyzing ? 'thinking' : 'listening'} className='mt-1 mr-2 shadow-sm' />
                      <textarea 
                        className='w-full p-2 pb-8 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-xs font-medium resize-none min-h-[90px]'
                        placeholder={t('home_chat_placeholder')}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAgenticStart(e);
                          }
                        }}
                      />
                    </div>
                    
                    <div className='absolute bottom-2.5 right-2.5 flex items-center gap-1.5'>
                      <button 
                        type="button"
                        onClick={toggleRecording}
                        aria-label={t('home_aria_toggle_voice')}
                        className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                        title={t('home_voice_input')}
                      >
                        <Mic className='w-4 h-4' />
                      </button>
                      <button 
                        type='submit' 
                        disabled={!chatInput.trim()}
                        aria-label={t('home_aria_send')}
                        className='bg-epfo-blue hover:bg-blue-700 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow-xs'
                      >
                        <Send className='w-3 h-3' />
                        {t('send')}
                      </button>
                    </div>
                  </div>
                </form>
            </section>

            {/* Frequently Asked Questions / Quick Intents (FAQs) */}
            <section className='space-y-2 pt-1'>
              <div className='flex items-center gap-1.5 px-1'>
                <Sparkles className='!w-4 !h-4 text-epfo-blue' />
                <h3 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>
                  {t('home_common_questions')}
                </h3>
              </div>

              <div className='space-y-2'>
                {[
                    {
                      titleKey: 'home_faq_withdraw_title',
                      descKey: 'home_faq_withdraw_desc',
                      query: "I want to withdraw ₹150,000 for medical emergency",
                      sc: ['happy', 'advance_rejected', 'no_kyc']
                    },
                    {
                      titleKey: 'home_faq_life_title',
                      descKey: 'home_faq_life_desc',
                      query: "I want to submit my life certificate",
                      sc: ['happy', 'pension_cert']
                    },
                    {
                      titleKey: 'home_faq_merge_title',
                      descKey: 'home_faq_merge_desc',
                      query: "Transfer and merge my previous PF accounts",
                      sc: ['happy', 'multi_uan']
                    },
                    {
                      titleKey: 'home_faq_exit_title',
                      descKey: 'home_faq_exit_desc',
                      query: "I want to mark my date of exit",
                      sc: ['no_exit']
                    },
                    {
                      titleKey: 'home_faq_rejected_title',
                      descKey: 'home_faq_rejected_desc',
                      query: "Why was my claim rejected?",
                      sc: ['claim_denied', 'employer_hold', 'advance_rejected']
                    }
                  ].filter(f => f.sc.includes(sc) || (f.sc.includes('happy') && sc === 'happy')).slice(0, 3).map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleAgenticStart(e, faq.query)}
                    aria-label={t(faq.titleKey)}
                    className='w-full p-3 bg-white/95 hover:bg-blue-50/80 hover:border-epfo-blue border border-slate-200/90 rounded-2xl flex items-center justify-between text-left transition-all shadow-2xs group'
                  >
                    <div>
                      <p className='text-xs font-bold text-slate-800 group-hover:text-epfo-blue'>
                        {t(faq.titleKey)}
                      </p>
                      <p className='text-[11px] text-slate-500 mt-0.5'>
                        {t(faq.descKey)}
                      </p>
                    </div>
                    <ArrowRight className='w-4 h-4 text-slate-400 group-hover:text-epfo-blue group-hover:translate-x-1 transition-transform shrink-0 ml-2' />
                  </button>
                ))}
              </div>

              {/* Compound Multi-Phase Intents */}
              <div className='mt-4 space-y-2' role="region" aria-label={t('home_multi_step_workflows')}>
                <div className='flex items-center gap-1.5 px-1'>
                  <div className='w-1.5 h-1.5 rounded-full bg-epfo-orange' />
                  <h3 className='text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                    {t('home_multi_step_workflows')}
                  </h3>
                  <span className='bg-epfo-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ml-1'>{t('home_new_badge')}</span>
                </div>
                {[
                  {
                    titleKey: 'home_compound_kyc_title',
                    descKey: 'home_compound_kyc_desc',
                    query: "Fix my KYC mismatch and then withdraw PF",
                    sc: ['happy', 'kyc_wrong', 'no_kyc', 'multi_phase']
                  },
                  {
                    titleKey: 'home_compound_exit_title',
                    descKey: 'home_compound_exit_desc',
                    query: "Mark my exit date and then claim my PF",
                    sc: ['happy', 'multi_phase_exit', 'pension_cert']
                  },
                  {
                    titleKey: 'home_compound_merge_title',
                    descKey: 'home_compound_merge_desc',
                    query: "Merge my old PF account and then transfer the balance",
                    sc: ['multi_uan']
                  },
                  {
                    titleKey: 'home_compound_nominee_title',
                    descKey: 'home_compound_nominee_desc',
                    query: "Update my nominee and then withdraw PF",
                    sc: ['no_nominee']
                  },
                  {
                    titleKey: 'home_compound_aadhaar_title',
                    descKey: 'home_compound_aadhaar_desc',
                    query: "Fix my Aadhaar conflict and then update my KYC",
                    sc: ['aadhaar_conflict', 'multi_phase_aadhaar']
                  },
                  {
                    titleKey: 'home_compound_3phase_title',
                    descKey: 'home_compound_3phase_desc',
                    query: "Fix my KYC mismatch, mark my exit date, and then withdraw my PF",
                    sc: ['multi_phase']
                  },
                  {
                    titleKey: 'home_compound_super_title',
                    descKey: 'home_compound_super_desc',
                    query: "Merge my old PF accounts, update my nominee, and then withdraw PF",
                    sc: ['multi_phase_merge']
                  }
                ].filter(f => f.sc.includes(sc)).slice(0, 1).map((faq, idx) => (
                  <button
                    key={`compound-${idx}`}
                    onClick={(e) => handleAgenticStart(e, faq.query)}
                    aria-label={t(faq.titleKey)}
                    className='w-full p-3 bg-gradient-to-r from-orange-50/80 to-amber-50/60 hover:from-orange-100 hover:to-amber-100 border border-orange-200/80 hover:border-orange-300 rounded-2xl flex items-center justify-between text-left transition-all shadow-2xs group'
                  >
                    <div>
                      <p className='text-xs font-bold text-slate-800 group-hover:text-orange-700 flex items-center gap-1.5'>
                        {t(faq.titleKey)}
                        <span className='text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold'>
                          {faq.query.split(' and ').length >= 3 ? t('home_phase_3') : t('home_multi_phase')}
                        </span>
                      </p>
                      <p className='text-[11px] text-slate-500 mt-0.5'>
                        {t(faq.descKey)}
                      </p>
                    </div>
                    <ArrowRight className='w-4 h-4 text-orange-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2' />
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: TRADITIONAL PORTAL VIEW (flowChoice === 'traditional') */}
        {/* ========================================================= */}
        {flowChoice === 'traditional' && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            className='space-y-4'
          >
            {/* Back Button to Dashboard */}
            <button 
              onClick={() => setFlowChoice('none')} 
              aria-label={t('home_aria_back_dashboard')}
              className='text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors'
            >
              <ArrowLeft className='!w-4 !h-4' /> {t('back_to_choices')}
            </button>

            <div className='px-1'>
              <h2 className='text-base font-bold text-slate-900'>
                {t('traditional_service')}
              </h2>
              <p className='text-xs text-slate-500 mt-0.5'>
                {t('home_traditional_service_subtitle')}
              </p>
            </div>

            {/* Direct Services List */}
            <div className='grid grid-cols-2 gap-3'>
              {[
                { titleKey: 'home_services_passbook_title', descKey: 'home_services_passbook_desc', path: "/passbook", icon: Wallet, color: "text-blue-600 bg-blue-50" },
                { titleKey: 'home_services_claim_title', descKey: 'home_services_claim_desc', path: "/claim", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
                { titleKey: 'home_services_transfer_title', descKey: 'home_services_transfer_desc', path: "/transfer", icon: ArrowRightLeft, color: "text-indigo-600 bg-indigo-50" },
                { titleKey: 'home_services_life_title', descKey: 'home_services_life_desc', path: "/life-certificate", icon: Award, color: "text-teal-600 bg-teal-50" },
                { titleKey: 'home_services_exit_title', descKey: 'home_services_exit_desc', path: "/mark-exit", icon: CalendarX2, color: "text-amber-600 bg-amber-50" },
                { titleKey: 'home_services_vault_title', descKey: 'home_services_vault_desc', path: "/documents", icon: Vault, color: "text-purple-600 bg-purple-50" },
                { titleKey: 'home_services_grievance_title', descKey: 'home_services_grievance_desc', path: "/grievance", icon: HelpCircle, color: "text-rose-600 bg-rose-50" }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className='p-3.5 bg-white/95 hover:border-epfo-blue border border-slate-200/90 rounded-2xl flex flex-col justify-between text-left transition-all shadow-2xs hover:shadow-xs group min-h-[110px]'
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mb-2 ${item.color}`}>
                      <IconComponent className='w-4 h-4' />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-slate-800 group-hover:text-epfo-blue leading-tight'>{t(item.titleKey)}</p>
                      <p className='text-[10px] text-slate-500 mt-1 leading-snug'>{t(item.descKey)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Security Alert (Step-up Auth / Hijacking prevention) */}
        {riskLevel !== 'low' && (
          <section>
            <div className='bg-red-50 border border-red-200 p-4 rounded-2xl flex gap-3 items-start'>
              <ShieldAlert className='!w-7 !h-7 text-red-600 shrink-0 mt-0.5' />
              <div>
                <h3 className='font-medium text-red-900'>{t('home_security_notice_title')}</h3>
                <p className='text-sm text-red-700 mt-1'>{t('home_security_notice_desc')}</p>
              </div>
            </div>
          </section>
        )}

      </div>

      {pendingFlowChoice && activeTaskValues.length > 0 && (
        <ActiveSessionsPrompt
          sessions={activeTaskValues}
          flowChoice={pendingFlowChoice}
          onResume={handleResume}
          onStartFresh={() => goToFlow(pendingFlowChoice)}
          onCancel={() => setPendingFlowChoice(null)}
          onDelete={handleDeleteSession}
        />
      )}

      {resumeTaskId && (
        <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6'>
            <div className='flex items-center gap-3 text-epfo-blue'>
              <ShieldCheck className='!w-8 !h-8' />
              <h2 className='text-xl font-bold'>{t('home_security_check_title')}</h2>
            </div>
            <p className='text-sm text-slate-600'>{t('home_security_check_desc')}</p>
            
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>{t('home_security_question')}</label>
              <input 
                type="text" 
                value={resumeSecurityAnswer}
                onChange={e => {
                  setResumeSecurityAnswer(e.target.value);
                  setResumeError(false);
                }}
                className='w-full p-4 border border-slate-200 rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-epfo-blue' 
              />
              {resumeError && <p className='text-red-500 text-xs'>{t('home_incorrect_answer')}</p>}
            </div>

            <div className='flex gap-3'>
              <Button variant='outline' className='flex-1' onClick={() => setResumeTaskId(null)}>{t('cancel')}</Button>
              <Button className='flex-1' onClick={confirmResume}>{t('verify_and_continue')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings & DPDP Consent Modal */}
      <NotificationModal 
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
