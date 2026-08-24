import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  LogOut, 
  ShieldAlert, 
  Play, 
  Bot, 
  Trash2, 
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
  Lock,
  Sparkles,
  Send
} from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { NotificationModal } from '../components/notifications/NotificationModal';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, riskLevel } = useSessionStore();
  const { activeTasks, startTask, resumeTask, clearTask, archiveTask } = useWorkflowStore();
  const { enabled: notificationsEnabled } = useNotificationStore();
  
  const [flowChoice, setFlowChoice] = useState<'none' | 'agentic' | 'traditional'>('none');
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

  const activeTaskValues = Object.values(activeTasks).filter(t => t.agentState !== 'completed');
  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'Citizen';

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
      const lower = query.toLowerCase();

      // Quick routes for specialized flows
      if (lower.includes('life') || lower.includes('certificate') || lower.includes('pramaan')) {
        setChatInput('');
        navigate('/life-certificate');
        return;
      }

      if (lower.includes('exit') || lower.includes('leaving') || lower.includes('quit')) {
        setChatInput('');
        navigate('/mark-exit');
        return;
      }

      const taskType = lower.includes('withdraw') || lower.includes('advance') || lower.includes('claim') ? 'withdraw_pf' : 
                       (lower.includes('transfer') || lower.includes('merge')) ? 'transfer_pf' : 'general_inquiry';
      
      let plan: any[] = [];
      if (taskType === 'withdraw_pf') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' as const },
          { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' as const },
          { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' as const },
          { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' as const },
        ];
      } else if (taskType === 'transfer_pf') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'fetch_employment', description: 'Locate previous Member IDs & establishments', status: 'pending' as const },
          { step: 'initiate_transfer', description: 'Authorize transfer to current account', status: 'pending' as const },
          { step: 'submit_transfer', description: 'Attestation & OTP submission', status: 'pending' as const },
        ];
      } else {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'process_inquiry', description: 'Analyze your request & calculate rules', status: 'pending' as const },
          { step: 'resolve_inquiry', description: 'Provide accurate guidance or grievance path', status: 'pending' as const }
        ];
      }

      startTask(query, taskType, plan);
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
        navigate(`/smart-flow`);
      }
    } else {
      setResumeError(true);
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-y-auto relative'>
      
      {/* Compact Clean Header */}
      <div className='px-4 py-2.5 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex justify-between items-center sticky top-0 z-10 shadow-xs'>
        <div>
          <h1 className='text-base font-bold tracking-tight text-slate-900 leading-snug'>
            {isAuthenticated ? `Welcome back, ${firstName}` : t('portal_title')}
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
            className={`p-2 rounded-full transition-all shadow-2xs relative ${
              notificationsEnabled 
                ? 'bg-blue-50 text-epfo-blue hover:bg-blue-100' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={t('notifications')}
          >
            <Bell className='w-3.5 h-3.5' />
            {notificationsEnabled && (
              <span className='absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white'></span>
            )}
          </button>
          <button 
            onClick={() => { logout(); navigate('/onboarding', { replace: true }); }} 
            className='p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-2xs' 
            title={t('logout')}
          >
            <LogOut className='w-3.5 h-3.5' />
          </button>
        </div>
      </div>

      <div className='p-4 space-y-4 max-w-2xl mx-auto w-full pb-12'>
        
        {/* ========================================================= */}
        {/* MODE 1: MAIN DASHBOARD VIEW (flowChoice === 'none')       */}
        {/* ========================================================= */}
        {flowChoice === 'none' && (
          <>
            {/* Streamlined PF Balance Card */}
            {isAuthenticated && (
              <section className='bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs relative overflow-hidden'>
                <div className='flex items-center justify-between'>
                  <span className='text-slate-500 text-[11px] font-bold uppercase tracking-wider'>
                    {t('total_pf_balance')}
                  </span>
                  <button 
                    onClick={() => navigate('/passbook')}
                    className='bg-blue-50 hover:bg-blue-100 text-epfo-blue font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors flex items-center gap-1'
                  >
                    {t('view_passbook')} <ArrowRight className='w-3 h-3' />
                  </button>
                </div>
                
                <div className='text-2xl font-extrabold my-1 text-slate-900 tracking-tight'>
                  ₹2,34,560
                </div>

                {/* Notification Status Footer */}
                <div 
                  onClick={() => setIsNotificationOpen(true)}
                  className='mt-2 pt-2 border-t border-slate-100 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity'
                >
                  <div className='flex items-center gap-1.5 text-[11px]'>
                    <span className={`w-2 h-2 rounded-full ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className='text-slate-600 font-medium'>
                      {notificationsEnabled ? 'WhatsApp & Email Alerts Active' : 'Enable WhatsApp & Email Alerts'}
                    </span>
                  </div>
                  <span className='text-epfo-blue text-[11px] font-semibold hover:underline'>
                    Settings ⚙️
                  </span>
                </div>
              </section>
            )}

            {/* NEED MORE HELP ? (Smart Flow vs Traditional Flow) */}
            <section className='space-y-2.5 pt-1'>
              <div className='px-0.5'>
                <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>
                  Need More Help?
                </h2>
              </div>

              <div className='grid grid-cols-2 gap-3.5'>
                
                {/* 1. SMART FLOW (Opens Dedicated Smart Agent View) */}
                <button 
                  onClick={() => setFlowChoice('agentic')}
                  className='p-4 sm:p-4.5 bg-gradient-to-br from-blue-50/95 via-white to-blue-50/50 border-2 border-epfo-blue/50 hover:border-epfo-blue rounded-2xl flex flex-col justify-between text-left group shadow-xs hover:shadow-md transition-all min-h-[165px]'
                >
                  <div>
                    <div className='flex items-center justify-between mb-2.5'>
                      <div className='w-9 h-9 bg-epfo-blue text-white rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform'>
                        <Bot className='w-5 h-5' />
                      </div>
                      <span className='bg-epfo-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase'>
                        {t('recommended')}
                      </span>
                    </div>
                    <h3 className='font-bold text-sm text-epfo-blue leading-tight'>
                      Smart Flow
                    </h3>
                    <p className='text-xs text-slate-600 mt-1.5 leading-relaxed'>
                      AI assistant guides your claims, transfers & certificates.
                    </p>
                  </div>
                  <div className='mt-3 text-xs font-bold text-epfo-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                    Launch Smart Flow →
                  </div>
                </button>

                {/* 2. TRADITIONAL FLOW (Opens Dedicated Traditional View) */}
                <button 
                  onClick={() => setFlowChoice('traditional')}
                  className='p-4 sm:p-4.5 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col justify-between text-left group shadow-xs hover:shadow-md transition-all min-h-[165px]'
                >
                  <div>
                    <div className='w-9 h-9 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform'>
                      <FolderOpen className='w-5 h-5' />
                    </div>
                    <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-slate-700'>
                      Traditional Flow
                    </h3>
                    <p className='text-xs text-slate-600 mt-1.5 leading-relaxed'>
                      Direct access to classic portal forms, claims & filing.
                    </p>
                  </div>
                  <div className='mt-3 text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                    Open Portal →
                  </div>
                </button>

              </div>
            </section>

            {/* Active Tasks & Crash Recovery */}
            {activeTaskValues.length > 0 && (
              <section className='space-y-1.5'>
                <h2 className='text-[11px] font-bold text-slate-800 uppercase tracking-wider px-0.5 flex items-center gap-1.5'>
                  {t('active_tasks')}
                  <span className='bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold'>
                    {activeTaskValues.length}
                  </span>
                </h2>
                <div className='space-y-2'>
                  {activeTaskValues.map(task => (
                    <div key={task.taskId} className='bg-white/95 p-3 rounded-2xl border border-orange-200 shadow-2xs flex justify-between items-center'>
                      <div>
                        <p className='font-bold text-xs text-slate-900'>{task.intent}</p>
                        <p className='text-[11px] text-slate-500 mt-0.5'>
                          Status: <span className='font-semibold text-orange-600 capitalize'>{task.agentState.replace('_', ' ')}</span> • {new Date(task.lastCheckpoint).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <Button onClick={() => handleResume(task.taskId)} className='shrink-0 gap-1 text-[11px] py-1.5 px-3 font-bold'>
                          <Play className='w-3 h-3 fill-current' /> {t('resume')}
                        </Button>
                        <button 
                          onClick={() => clearTask(task.taskId)} 
                          className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                          title='Delete task'
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
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
              className='text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors'
            >
              <ArrowLeft className='w-3.5 h-3.5' /> {t('back_to_choices') || 'Back to Dashboard'}
            </button>

            {/* Smart Agent Greeting & Prompt Section */}
            <section className='bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-11 h-11 bg-epfo-blue text-white rounded-2xl flex items-center justify-center shadow-sm shrink-0'>
                  <Bot className='w-6 h-6' />
                </div>
                <div>
                  <h2 className='text-base font-bold text-slate-900'>
                    {t('smart_agent') || 'EPFO Smart Assistant'}
                  </h2>
                  <p className='text-xs text-slate-500'>
                    How can I assist you with your provident fund today?
                  </p>
                </div>
              </div>

              {/* Analyzing / Plan Generation State */}
              {isAnalyzing ? (
                <div className='bg-slate-50 rounded-2xl border border-blue-100 p-6 flex flex-col items-center justify-center space-y-4 shadow-inner min-h-[180px]'>
                  <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
                    <Bot className='w-6 h-6 text-epfo-blue animate-pulse' />
                  </div>
                  <div className='w-full max-w-xs space-y-2 text-xs'>
                    <div className='flex items-center gap-2.5'>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`font-medium ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Analyzing request & rules</span>
                    </div>
                    <div className='flex items-center gap-2.5'>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`font-medium ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Generating step-by-step plan</span>
                    </div>
                    <div className='flex items-center gap-2.5'>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`font-medium ${analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Launching secure workflow</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chatbox Textarea with Voice & Action Button */
                <form onSubmit={handleAgenticStart} className='space-y-3'>
                  <div className='relative bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-epfo-blue focus-within:bg-white transition-all shadow-2xs overflow-hidden'>
                    <textarea 
                      className='w-full p-3.5 pb-12 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-xs font-medium resize-none min-h-[90px]'
                      placeholder='Type what you need in simple words (e.g. "I want to withdraw ₹50,000 for medical emergency", "Submit life certificate", "Merge my old PF accounts")...'
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAgenticStart(e);
                        }
                      }}
                    />
                    
                    <div className='absolute bottom-2.5 right-2.5 flex items-center gap-1.5'>
                      <button 
                        type="button"
                        onClick={toggleRecording}
                        className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                        title='Voice input'
                      >
                        <Mic className='w-4 h-4' />
                      </button>
                      <button 
                        type='submit' 
                        disabled={!chatInput.trim()}
                        className='bg-epfo-blue hover:bg-blue-700 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow-xs'
                      >
                        <Send className='w-3 h-3' />
                        {t('send') || 'Analyze'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </section>

            {/* Frequently Asked Questions / Quick Intents (FAQs) */}
            <section className='space-y-2 pt-1'>
              <div className='flex items-center gap-1.5 px-1'>
                <Sparkles className='w-3.5 h-3.5 text-epfo-blue' />
                <h3 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>
                  Common Questions & Workflows
                </h3>
              </div>

              <div className='space-y-2'>
                {[
                  {
                    title: "I want to withdraw PF for medical emergency",
                    desc: "Auto-selects Form 31 Advance with Illness clause & instant claim check",
                    query: "I want to withdraw ₹50,000 for medical emergency"
                  },
                  {
                    title: "Submit my Digital Life Certificate (Jeevan Pramaan)",
                    desc: "Pensioner face authentication and submission to nodal bank",
                    query: "I want to submit my life certificate"
                  },
                  {
                    title: "Merge previous PF account with current employer",
                    desc: "One Member One EPF auto-merge with online employer attestation",
                    query: "Transfer and merge my previous PF accounts"
                  },
                  {
                    title: "I left my job and want to mark my exit date",
                    desc: "Self-declare date of exit if not updated by previous employer (>60 days)",
                    query: "I want to mark my date of exit"
                  },
                  {
                    title: "Why was my claim rejected or delayed?",
                    desc: "Check reason for rejection and get auto-fix recommendations",
                    query: "Why was my claim rejected?"
                  }
                ].map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleAgenticStart(e, faq.query)}
                    className='w-full p-3 bg-white/95 hover:bg-blue-50/80 hover:border-epfo-blue border border-slate-200/90 rounded-2xl flex items-center justify-between text-left transition-all shadow-2xs group'
                  >
                    <div>
                      <p className='text-xs font-bold text-slate-800 group-hover:text-epfo-blue'>
                        {faq.title}
                      </p>
                      <p className='text-[11px] text-slate-500 mt-0.5'>
                        {faq.desc}
                      </p>
                    </div>
                    <ArrowRight className='w-4 h-4 text-slate-400 group-hover:text-epfo-blue group-hover:translate-x-1 transition-transform shrink-0 ml-2' />
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
              className='text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors'
            >
              <ArrowLeft className='w-3.5 h-3.5' /> {t('back_to_choices') || 'Back to Dashboard'}
            </button>

            <div className='px-1'>
              <h2 className='text-base font-bold text-slate-900'>
                {t('traditional_service') || 'Traditional EPFO Services'}
              </h2>
              <p className='text-xs text-slate-500 mt-0.5'>
                Direct access to classic forms, passbook, claims & grievances
              </p>
            </div>

            {/* Direct Services List */}
            <div className='grid grid-cols-2 gap-3'>
              {[
                { title: "Member Passbook", desc: "Monthly wage deductions & interest", path: "/passbook", icon: Wallet, color: "text-blue-600 bg-blue-50" },
                { title: "File Online Claim", desc: "Form 31 / 19 / 10C Withdrawal", path: "/claim", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
                { title: "Transfer & Merge", desc: "One Member One EPF auto-merge", path: "/transfer", icon: ArrowRightLeft, color: "text-indigo-600 bg-indigo-50" },
                { title: "Life Certificate", desc: "Face-Auth Jeevan Pramaan", path: "/life-certificate", icon: Award, color: "text-teal-600 bg-teal-50" },
                { title: "Mark Exit Date", desc: "Self-declare leaving date (>60d)", path: "/mark-exit", icon: CalendarX2, color: "text-amber-600 bg-amber-50" },
                { title: "Document Vault", desc: "DigiLocker KYC & Bank references", path: "/documents", icon: Lock, color: "text-purple-600 bg-purple-50" },
                { title: "EPFiGMS Grievance", desc: "Register & track official complaints", path: "/grievance", icon: HelpCircle, color: "text-rose-600 bg-rose-50" }
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
                      <p className='text-xs font-bold text-slate-800 group-hover:text-epfo-blue leading-tight'>{item.title}</p>
                      <p className='text-[10px] text-slate-500 mt-1 leading-snug'>{item.desc}</p>
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
              <ShieldAlert className='w-5 h-5 text-red-600 shrink-0 mt-0.5' />
              <div>
                <h3 className='font-medium text-red-900'>Security Notice</h3>
                <p className='text-sm text-red-700 mt-1'>Suspicious activity detected. You may be required to re-authenticate for sensitive actions.</p>
              </div>
            </div>
          </section>
        )}

      </div>

      {resumeTaskId && (
        <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6'>
            <div className='flex items-center gap-3 text-epfo-blue'>
              <ShieldCheck className='w-6 h-6' />
              <h2 className='text-xl font-bold'>Security Check</h2>
            </div>
            <p className='text-sm text-slate-600'>To resume this session, please answer your security question.</p>
            
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>What was the name of your first pet?</label>
              <input 
                type="text" 
                value={resumeSecurityAnswer}
                onChange={e => {
                  setResumeSecurityAnswer(e.target.value);
                  setResumeError(false);
                }}
                className='w-full p-4 border border-slate-200 rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-epfo-blue' 
              />
              {resumeError && <p className='text-red-500 text-xs'>Incorrect answer.</p>}
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
