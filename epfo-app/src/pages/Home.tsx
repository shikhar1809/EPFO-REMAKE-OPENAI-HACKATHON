import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Wallet, 
  FolderOpen, 
  ArrowRightLeft, 
  LogOut, 
  ShieldAlert, 
  Play, 
  Bot, 
  Mic, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  CalendarX2, 
  Bell,
  Search
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
  const { activeTasks, completedTasks, startTask, resumeTask, clearTask, archiveTask } = useWorkflowStore();
  const { enabled: notificationsEnabled } = useNotificationStore();
  
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Auto-archive completed tasks
  React.useEffect(() => {
    Object.values(activeTasks).forEach(task => {
      if (task.agentState === 'completed') {
        archiveTask(task.taskId);
      }
    });
  }, [activeTasks, archiveTask]);

  const activeTaskValues = Object.values(activeTasks).filter(t => t.agentState !== 'completed');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzePhase, setAnalyzePhase] = useState<'fetching' | 'generating' | 'starting' | null>(null);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setChatInput("I want to submit my life certificate");
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleAgenticStart = (e: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault();
    const query = directPrompt || chatInput;
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setAnalyzePhase('fetching');
    
    setTimeout(() => setAnalyzePhase('generating'), 1000);
    setTimeout(() => setAnalyzePhase('starting'), 2000);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzePhase(null);
      const intent = query;
      const lowerIntent = intent.toLowerCase();

      // Quick routes for specialized flows
      if (lowerIntent.includes('life') || lowerIntent.includes('certificate') || lowerIntent.includes('pramaan') || lowerIntent.includes('pension')) {
        setChatInput('');
        navigate('/life-certificate');
        return;
      }

      if (lowerIntent.includes('exit') || lowerIntent.includes('leaving') || lowerIntent.includes('quit') || lowerIntent.includes('closed')) {
        setChatInput('');
        navigate('/mark-exit');
        return;
      }

      const taskType = lowerIntent.includes('withdraw') ? 'withdraw_pf' : 
                       (lowerIntent.includes('transfer') || lowerIntent.includes('merge')) ? 'transfer_pf' : 'general_inquiry';
      
      let plan: any[] = [];
      if (taskType === 'withdraw_pf') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'check_eligibility', description: 'Check if you are eligible', status: 'pending' as const },
          { step: 'gather_documents', description: 'Get your documents from DigiLocker', status: 'pending' as const },
          { step: 'review_claim', description: 'Review your claim details', status: 'pending' as const },
          { step: 'submit_claim', description: 'Final review and submit', status: 'pending' as const },
        ];
      } else if (taskType === 'transfer_pf') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'fetch_employment', description: 'Find your previous employment details', status: 'pending' as const },
          { step: 'initiate_transfer', description: 'Start the transfer to your new employer', status: 'pending' as const },
          { step: 'submit_transfer', description: 'Final review and submit', status: 'pending' as const },
        ];
      } else {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'process_inquiry', description: 'Analyze your request', status: 'pending' as const },
          { step: 'resolve_inquiry', description: 'Provide the right solution', status: 'pending' as const }
        ];
      }

      startTask(intent, taskType, plan);
      setChatInput('');
      navigate(`/smart-flow`);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAgenticStart(e);
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-y-auto relative'>
      
      {/* Spacious Clean Header */}
      <div className='px-5 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex justify-between items-center sticky top-0 z-10 shadow-xs'>
        <div>
          <h1 className='text-xl font-bold tracking-tight text-slate-900'>
            {isAuthenticated ? t('welcome_back', { name: user?.name || 'Citizen' }) : t('portal_title')}
          </h1>
          {isAuthenticated && user?.uan && (
            <p className='text-xs text-slate-500 font-mono mt-0.5'>
              UAN: <span className='font-bold text-slate-700'>{user.uan}</span>
            </p>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <button 
            onClick={() => setIsNotificationOpen(true)}
            className={`p-2.5 rounded-full transition-all shadow-xs relative ${
              notificationsEnabled 
                ? 'bg-blue-50 text-epfo-blue hover:bg-blue-100' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={t('notifications')}
          >
            <Bell className='w-4 h-4' />
            {notificationsEnabled && (
              <span className='absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white'></span>
            )}
          </button>
          <button 
            onClick={() => { logout(); navigate('/onboarding', { replace: true }); }} 
            className='p-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-xs' 
            title={t('logout')}
          >
            <LogOut className='w-4 h-4' />
          </button>
        </div>
      </div>

      <div className='p-5 space-y-6 max-w-2xl mx-auto w-full pb-16'>
        
        {/* Modern Clean PF Balance Hero Card */}
        {isAuthenticated && (
          <section className='bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden'>
            <div className='flex items-center justify-between'>
              <span className='text-slate-500 text-xs font-bold uppercase tracking-wider'>
                {t('total_pf_balance')}
              </span>
              <button 
                onClick={() => navigate('/passbook')}
                className='bg-blue-50 hover:bg-blue-100 text-epfo-blue font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-2xs'
              >
                {t('view_passbook')} <ArrowRight className='w-3.5 h-3.5' />
              </button>
            </div>
            
            <div className='text-3xl font-extrabold my-2 text-slate-900 tracking-tight'>
              ₹2,34,560
            </div>

            {/* Notification Status Footer */}
            <div 
              onClick={() => setIsNotificationOpen(true)}
              className='mt-3 pt-3 border-t border-slate-100 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity'
            >
              <div className='flex items-center gap-2 text-xs'>
                <span className={`w-2.5 h-2.5 rounded-full ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className='text-slate-600 font-medium'>
                  {notificationsEnabled ? 'WhatsApp & Email Alerts Active' : 'Enable WhatsApp & Email Alerts'}
                </span>
              </div>
              <span className='text-epfo-blue text-xs font-semibold hover:underline'>
                Settings ⚙️
              </span>
            </div>
          </section>
        )}

        {/* Smart AI Assistant Container */}
        <section className='bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white/90 backdrop-blur-md rounded-3xl p-5 border border-blue-100 shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-epfo-blue text-white rounded-xl flex items-center justify-center shadow-sm'>
                <Bot className='w-5 h-5' />
              </div>
              <div>
                <h2 className='text-base font-bold text-slate-900 leading-tight'>
                  {t('smart_agent')}
                </h2>
                <p className='text-xs text-slate-500'>
                  Instant guidance & automated form filling
                </p>
              </div>
            </div>
            <span className='bg-epfo-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs'>
              {t('recommended')}
            </span>
          </div>

          {isAnalyzing ? (
            <div className='bg-white rounded-2xl border border-blue-100 p-5 flex flex-col items-center justify-center space-y-3 shadow-inner min-h-[140px]'>
              <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
                <Bot className='w-5 h-5 text-epfo-blue animate-pulse' />
              </div>
              <div className='w-full max-w-xs space-y-2 text-xs'>
                <div className='flex items-center gap-2.5'>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                  <span className={`font-medium ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Understanding request</span>
                </div>
                <div className='flex items-center gap-2.5'>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                  <span className={`font-medium ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Generating steps</span>
                </div>
                <div className='flex items-center gap-2.5'>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                  <span className={`font-medium ${analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Launching workflow</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAgenticStart} className='space-y-3'>
              <div className='relative flex items-center bg-white rounded-2xl border border-slate-200 focus-within:border-epfo-blue shadow-sm overflow-hidden transition-all'>
                <div className='pl-3.5 text-slate-400'>
                  <Search className='w-4 h-4' />
                </div>
                <input 
                  type='text'
                  className='w-full py-3.5 pl-2.5 pr-20 bg-transparent text-slate-900 placeholder-slate-400 outline-none text-xs font-medium'
                  placeholder='e.g. "I want to withdraw ₹50,000 for medical emergency"'
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className='absolute right-2 flex items-center gap-1.5'>
                  <button 
                    type="button"
                    onClick={toggleRecording}
                    className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                    title='Voice input'
                  >
                    <Mic className='w-4 h-4' />
                  </button>
                  <button 
                    type='submit' 
                    disabled={!chatInput.trim()}
                    className='bg-epfo-blue hover:bg-blue-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40 flex items-center justify-center'
                  >
                    {t('send')}
                  </button>
                </div>
              </div>

              {/* 1-Tap Quick Action Chips */}
              <div className='flex flex-wrap gap-2 pt-1'>
                {[
                  { label: "⚡ Withdraw PF", query: "I want to withdraw PF advance" },
                  { label: "🪪 Life Certificate", query: "Submit Digital Life Certificate" },
                  { label: "📅 Mark Exit Date", query: "I want to mark my exit date" },
                  { label: "🔄 Merge Accounts", query: "Merge previous PF accounts" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type='button'
                    onClick={(e) => handleAgenticStart(e, item.query)}
                    className='bg-white/95 border border-slate-200 hover:border-epfo-blue hover:text-epfo-blue text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs'
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </form>
          )}
        </section>

        {/* Self-Service Grid (Clear, Spacious 2-Column Cards) */}
        <section className='space-y-3 pt-1'>
          <h2 className='text-sm font-bold text-slate-800 uppercase tracking-wider px-1'>
            {t('self_service')}
          </h2>

          <div className='grid grid-cols-2 gap-3'>
            
            {/* 1. Passbook */}
            <button 
              onClick={() => navigate('/passbook')} 
              className='p-4 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-epfo-blue rounded-2xl flex items-start gap-3 hover:shadow-md transition-all text-left group shadow-xs'
            >
              <div className='w-10 h-10 bg-blue-50 text-epfo-blue rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                <Wallet className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-epfo-blue'>
                  {t('passbook')}
                </h3>
                <p className='text-xs text-slate-500 mt-1'>
                  Check monthly wages & balance
                </p>
              </div>
            </button>

            {/* 2. Raise Claim */}
            <button 
              onClick={() => navigate('/claim')} 
              className='p-4 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-epfo-blue rounded-2xl flex items-start gap-3 hover:shadow-md transition-all text-left group shadow-xs'
            >
              <div className='w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                <FileText className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-epfo-blue'>
                  {t('claim')}
                </h3>
                <p className='text-xs text-slate-500 mt-1'>
                  Form 31 / 19 / 10C Withdrawal
                </p>
              </div>
            </button>

            {/* 3. Transfer & Merge */}
            <button 
              onClick={() => navigate('/transfer')} 
              className='p-4 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-epfo-blue rounded-2xl flex items-start gap-3 hover:shadow-md transition-all text-left group shadow-xs'
            >
              <div className='w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                <ArrowRightLeft className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-epfo-blue'>
                  {t('transfer_merge')}
                </h3>
                <p className='text-xs text-slate-500 mt-1'>
                  One Member One EPF auto-merge
                </p>
              </div>
            </button>

            {/* 4. Digital Life Certificate */}
            <button 
              onClick={() => navigate('/life-certificate')} 
              className='p-4 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-epfo-blue rounded-2xl flex items-start gap-3 hover:shadow-md transition-all text-left group shadow-xs'
            >
              <div className='w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                <Award className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-epfo-blue'>
                  {t('life_certificate')}
                </h3>
                <p className='text-xs text-slate-500 mt-1'>
                  Face-Auth Jeevan Pramaan
                </p>
              </div>
            </button>

            {/* 5. Mark Exit Date */}
            <button 
              onClick={() => navigate('/mark-exit')} 
              className='p-4 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-epfo-blue rounded-2xl flex items-start gap-3 hover:shadow-md transition-all text-left group shadow-xs'
            >
              <div className='w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                <CalendarX2 className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-epfo-blue'>
                  {t('mark_exit_date')}
                </h3>
                <p className='text-xs text-slate-500 mt-1'>
                  Self-declare leaving date (after 60 days)
                </p>
              </div>
            </button>

            {/* 6. Document Vault */}
            <button 
              onClick={() => navigate('/documents')} 
              className='p-4 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-epfo-blue rounded-2xl flex items-start gap-3 hover:shadow-md transition-all text-left group shadow-xs'
            >
              <div className='w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                <FolderOpen className='w-5 h-5' />
              </div>
              <div>
                <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-epfo-blue'>
                  {t('vault')}
                </h3>
                <p className='text-xs text-slate-500 mt-1'>
                  DigiLocker Aadhaar & Bank KYC
                </p>
              </div>
            </button>

          </div>
        </section>

        {/* Active Tasks & Crash Recovery */}
        {activeTaskValues.length > 0 && (
          <section className='space-y-2 pt-1'>
            <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider px-1 flex items-center gap-1.5'>
              {t('active_tasks')}
              <span className='bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold'>
                {activeTaskValues.length}
              </span>
            </h2>
            <div className='space-y-2.5'>
              {activeTaskValues.map(task => (
                <div key={task.taskId} className='bg-white/95 p-4 rounded-2xl border border-orange-200 shadow-sm flex justify-between items-center'>
                  <div>
                    <p className='font-bold text-sm text-slate-900'>{task.intent}</p>
                    <p className='text-xs text-slate-500 mt-0.5'>
                      Status: <span className='font-semibold text-orange-600 capitalize'>{task.agentState.replace('_', ' ')}</span> • {new Date(task.lastCheckpoint).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button onClick={() => handleResume(task.taskId)} className='shrink-0 gap-1.5 text-xs py-2 px-3.5 font-bold'>
                      <Play className='w-3.5 h-3.5 fill-current' /> {t('resume')}
                    </Button>
                    <button 
                      onClick={() => clearTask(task.taskId)} 
                      className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors'
                      title='Delete task'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past Requests History */}
        <section className='space-y-2 pt-1'>
          <div className='flex items-center justify-between px-1'>
            <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
              {t('past_requests')}
              {completedTasks && completedTasks.length > 0 && (
                <span className='bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold'>
                  {completedTasks.length}
                </span>
              )}
            </h2>
            <button onClick={() => navigate('/history')} className='text-xs text-epfo-blue font-bold flex items-center gap-1 hover:underline'>
              {t('view_all')} <ArrowRight className="w-3.5 h-3.5"/>
            </button>
          </div>
          
          {completedTasks && completedTasks.length > 0 ? (
            <div className='space-y-2'>
              {completedTasks.slice(0, 2).map(task => (
                <div key={task.taskId} className='bg-white/95 p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center cursor-pointer hover:border-slate-300 transition-all' onClick={() => navigate('/history')}>
                  <div className='flex items-center gap-3'>
                    <div className='bg-green-50 p-2 rounded-full text-green-600'>
                      <CheckCircle2 className='w-4 h-4' />
                    </div>
                    <div>
                      <p className='font-bold text-xs text-slate-900'>{task.intent}</p>
                      <p className='text-[11px] text-slate-500 mt-0.5'>Completed on {new Date(task.lastCheckpoint).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={() => navigate('/history')} className='w-full p-3.5 bg-white/90 border border-slate-200 border-dashed rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-epfo-blue hover:border-epfo-blue/50 transition-colors text-xs font-medium'>
              <FolderOpen className='w-4 h-4' />
              <span>{t('no_active_tasks')}</span>
            </button>
          )}
        </section>

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
