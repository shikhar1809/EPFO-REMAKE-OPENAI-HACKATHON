import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  X,
  FileText,
  Wallet,
  ArrowRightLeft,
  Award,
  CalendarX2,
  HelpCircle,
  Lock
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
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSmartFlowOpen, setIsSmartFlowOpen] = useState(false);
  const [isTraditionalOpen, setIsTraditionalOpen] = useState(false);
  
  const [smartPrompt, setSmartPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);

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
        setSmartPrompt("I want to submit my life certificate");
        setIsRecording(false);
      }, 2200);
    } else {
      setIsRecording(false);
    }
  };

  const handleSmartIntent = (intentText: string, specificType?: string) => {
    const query = intentText.trim();
    if (!query) return;

    const lower = query.toLowerCase();

    // Specific direct navigation routes if applicable
    if (lower.includes('life') || lower.includes('certificate') || lower.includes('pramaan')) {
      setIsSmartFlowOpen(false);
      navigate('/life-certificate');
      return;
    }

    if (lower.includes('exit') || lower.includes('leaving') || lower.includes('quit')) {
      setIsSmartFlowOpen(false);
      navigate('/mark-exit');
      return;
    }

    const taskType = specificType || (
      lower.includes('withdraw') || lower.includes('claim') || lower.includes('advance') ? 'withdraw_pf' :
      lower.includes('transfer') || lower.includes('merge') ? 'transfer_pf' : 'general_inquiry'
    );

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
    setIsSmartFlowOpen(false);
    navigate('/smart-flow');
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

      <div className='p-4 space-y-3.5 max-w-2xl mx-auto w-full pb-10'>
        
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

        {/* Spacious Need More Help ? Section */}
        <section className='space-y-2.5 pt-1'>
          <div className='px-0.5'>
            <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>
              Need More Help?
            </h2>
          </div>

          <div className='grid grid-cols-2 gap-3.5'>
            
            {/* 1. SMART FLOW (Opens Interactive AI Intent Chooser) */}
            <button 
              onClick={() => setIsSmartFlowOpen(true)}
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

            {/* 2. TRADITIONAL FLOW (Opens Classic Portal Menu) */}
            <button 
              onClick={() => setIsTraditionalOpen(true)}
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

      {/* 🤖 SMART FLOW MODAL: Ask what the user wants to accomplish */}
      {isSmartFlowOpen && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[150] flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150'>
            
            <div className='flex items-center justify-between pb-2 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-blue-50 text-epfo-blue flex items-center justify-center'>
                  <Bot className='w-5 h-5' />
                </div>
                <div>
                  <h3 className='font-bold text-sm text-slate-900'>EPFO Smart Assistant</h3>
                  <p className='text-[11px] text-slate-500'>What would you like help with?</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSmartFlowOpen(false)}
                className='p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Natural Language Prompt & Voice Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSmartIntent(smartPrompt); }} className='relative'>
              <div className='relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-epfo-blue focus-within:bg-white transition-all overflow-hidden'>
                <div className='pl-3 text-slate-400'>
                  <Search className='w-4 h-4' />
                </div>
                <input 
                  type='text'
                  className='w-full py-3 pl-2.5 pr-20 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-xs font-medium'
                  placeholder='e.g. "Withdraw ₹50,000 for medical"'
                  value={smartPrompt}
                  onChange={(e) => setSmartPrompt(e.target.value)}
                />
                <div className='absolute right-2 flex items-center gap-1'>
                  <button 
                    type='button'
                    onClick={toggleRecording}
                    className={`p-1.5 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                    title='Voice input'
                  >
                    <Mic className='w-3.5 h-3.5' />
                  </button>
                  <button 
                    type='submit'
                    disabled={!smartPrompt.trim()}
                    className='bg-epfo-blue hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold disabled:opacity-40'
                  >
                    Go
                  </button>
                </div>
              </div>
            </form>

            {/* Quick 1-Tap Intent Options */}
            <div className='space-y-1.5 pt-1'>
              <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wider px-0.5'>
                Or choose a quick workflow:
              </p>

              {[
                { title: "Withdraw PF Advance / Final", desc: "Medical, Illness, Housing, Form 31/19", type: "withdraw_pf" },
                { title: "Transfer & Merge PF Accounts", desc: "One Member One EPF auto-merge", type: "transfer_pf" },
                { title: "Submit Digital Life Certificate", desc: "Face-Auth Jeevan Pramaan for Pensioners", type: "life_cert" },
                { title: "Mark Date of Exit", desc: "Self-declaration of leaving employment", type: "mark_exit" },
                { title: "Ask EPFO General Question", desc: "Tax rules, eligibility, passbook help", type: "general_inquiry" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSmartIntent(item.title, item.type)}
                  className='w-full p-2.5 bg-slate-50 hover:bg-blue-50/80 hover:border-epfo-blue border border-slate-200/80 rounded-xl flex items-center justify-between text-left group transition-all'
                >
                  <div>
                    <p className='text-xs font-bold text-slate-800 group-hover:text-epfo-blue'>{item.title}</p>
                    <p className='text-[10px] text-slate-500'>{item.desc}</p>
                  </div>
                  <ArrowRight className='w-3.5 h-3.5 text-slate-400 group-hover:text-epfo-blue group-hover:translate-x-0.5 transition-transform' />
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 📁 TRADITIONAL FLOW MODAL: Classic Portal & Services Directory */}
      {isTraditionalOpen && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[150] flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto'>
            
            <div className='flex items-center justify-between pb-2 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center'>
                  <FolderOpen className='w-5 h-5' />
                </div>
                <div>
                  <h3 className='font-bold text-sm text-slate-900'>Traditional EPFO Portal</h3>
                  <p className='text-[11px] text-slate-500'>Direct access to self-service forms</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTraditionalOpen(false)}
                className='p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Direct Services List */}
            <div className='space-y-2'>
              {[
                { title: "Member Passbook", desc: "Detailed wage deductions & interest credits", path: "/passbook", icon: Wallet, color: "text-blue-600 bg-blue-50" },
                { title: "File Online Claim", desc: "Form 31 Advance / Form 19 Final Withdrawal", path: "/claim", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
                { title: "One Member One EPF", desc: "Transfer previous Member IDs to current account", path: "/transfer", icon: ArrowRightLeft, color: "text-indigo-600 bg-indigo-50" },
                { title: "Digital Life Certificate", desc: "Jeevan Pramaan face authentication for pensioners", path: "/life-certificate", icon: Award, color: "text-teal-600 bg-teal-50" },
                { title: "Mark Date of Exit", desc: "Declare leaving date (60+ days post exit)", path: "/mark-exit", icon: CalendarX2, color: "text-amber-600 bg-amber-50" },
                { title: "DigiLocker Document Vault", desc: "Encrypted Aadhaar & Bank KYC references", path: "/documents", icon: Lock, color: "text-purple-600 bg-purple-50" },
                { title: "EPFiGMS Grievance Portal", desc: "Register or track official EPFO complaints", path: "/grievance", icon: HelpCircle, color: "text-rose-600 bg-rose-50" }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => { setIsTraditionalOpen(false); navigate(item.path); }}
                    className='w-full p-2.5 bg-slate-50 hover:bg-white hover:border-slate-300 border border-slate-200/80 rounded-xl flex items-center gap-3 text-left transition-all shadow-2xs hover:shadow-xs group'
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <IconComponent className='w-4 h-4' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-bold text-slate-800 group-hover:text-epfo-blue'>{item.title}</p>
                      <p className='text-[10px] text-slate-500 truncate'>{item.desc}</p>
                    </div>
                    <ArrowRight className='w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform' />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

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
