import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Wallet, FolderOpen, ArrowRightLeft, LogOut, ShieldAlert, Play, Bot, Mic, CheckCircle2, Trash2, ShieldCheck, ArrowRight, Award, CalendarX2, Bell } from 'lucide-react';
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
  const [flowChoice, setFlowChoice] = useState<'none' | 'agentic' | 'traditional'>('none');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const traditionalFlowRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-archive completed tasks that might have been left here by using the back button
  React.useEffect(() => {
    Object.values(activeTasks).forEach(task => {
      if (task.agentState === 'completed') {
        archiveTask(task.taskId);
      }
    });
  }, [activeTasks, archiveTask]);

  React.useEffect(() => {
    if (flowChoice === 'traditional' && traditionalFlowRef.current) {
      traditionalFlowRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [flowChoice]);

  const activeTaskValues = Object.values(activeTasks).filter(t => t.agentState !== 'completed');

  const handleAction = (path: string) => {
    navigate(path);
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzePhase, setAnalyzePhase] = useState<'fetching' | 'generating' | 'starting' | null>(null);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate Voice Transcription
      setTimeout(() => {
        setChatInput("I want to submit my life certificate");
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleAgenticStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsAnalyzing(true);
    setAnalyzePhase('fetching');
    
    // Simulate Agent Intent Understanding & Planning phases
    setTimeout(() => setAnalyzePhase('generating'), 1000);
    setTimeout(() => setAnalyzePhase('starting'), 2000);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzePhase(null);
      const intent = chatInput;
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
    }, 3000);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAgenticStart(e);
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-y-auto relative'>
      
      {/* Sleek Compact Header */}
      <div className='px-4 pt-12 pb-3 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex justify-between items-center sticky top-0 z-10'>
        <div>
          <h1 className='text-lg font-bold tracking-tight text-slate-900 leading-snug'>
            {isAuthenticated ? t('welcome_back', { name: user?.name || 'Citizen' }) : t('portal_title')}
          </h1>
          {isAuthenticated && user?.uan && (
            <p className='text-[11px] text-slate-500 font-mono'>UAN: {user.uan}</p>
          )}
        </div>
        <div className='flex items-center gap-1.5'>
          {isAnalyzing && (
            <div className='flex items-center gap-1 px-2 py-1 bg-blue-50 text-epfo-blue rounded-full text-[10px] font-medium animate-pulse'>
              <Bot className='w-3 h-3' />
              Thinking...
            </div>
          )}
          <button 
            onClick={() => setIsNotificationOpen(true)}
            className={`p-1.5 rounded-full transition-all shadow-sm relative ${
              notificationsEnabled 
                ? 'bg-blue-50 text-epfo-blue hover:bg-blue-100' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={t('notifications')}
          >
            <Bell className='w-4 h-4' />
            {notificationsEnabled && (
              <span className='absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white'></span>
            )}
          </button>
          <button onClick={() => { logout(); navigate('/onboarding', { replace: true }); }} className='p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-sm' title={t('logout')}>
            <LogOut className='w-4 h-4' />
          </button>
        </div>
      </div>

      <div className='p-4 space-y-4 max-w-2xl mx-auto w-full pb-10'>
        
        {/* PF Balance & Integrated Alert Status Hero Widget */}
        {isAuthenticated && flowChoice === 'none' && (
          <section className='bg-gradient-to-br from-epfo-blue via-blue-700 to-indigo-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden'>
            <div className='absolute -right-2 -bottom-2 p-2 opacity-15 pointer-events-none'>
              <Wallet className='w-20 h-20' />
            </div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between'>
                <span className='text-blue-100 text-xs font-medium'>{t('total_pf_balance')}</span>
                <button 
                  onClick={() => navigate('/passbook')}
                  className='bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1'
                >
                  {t('view_passbook')} →
                </button>
              </div>
              <div className='text-2xl font-bold my-1 tracking-tight'>₹2,34,560</div>

              {/* Integrated Compact Notification Bar */}
              <div 
                onClick={() => setIsNotificationOpen(true)}
                className='mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity text-[11px]'
              >
                <div className='flex items-center gap-1.5'>
                  <span className={`w-2 h-2 rounded-full ${notificationsEnabled ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span className='text-blue-100'>
                    {notificationsEnabled ? 'WhatsApp & Email Alerts Active' : 'Enable WhatsApp & Email Alerts'}
                  </span>
                </div>
                <span className='text-blue-200 text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-medium'>
                  Configure ⚙️
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 2-Column Compact Choice Cards */}
        {flowChoice === 'none' && (
          <section className='space-y-2'>
            <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider px-0.5'>{t('how_to_proceed')}</h2>
            
            <div className='grid grid-cols-2 gap-2.5'>
              {/* Option 1: Smart Agent */}
              <button 
                onClick={() => setFlowChoice('agentic')} 
                className='p-3.5 bg-white/95 backdrop-blur-sm border-2 border-epfo-blue/50 hover:border-epfo-blue rounded-2xl flex flex-col justify-between text-left group shadow-sm transition-all hover:bg-blue-50/50'
              >
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-epfo-blue'>
                      <Bot className='w-4 h-4' />
                    </div>
                    <span className='bg-epfo-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase'>
                      {t('recommended')}
                    </span>
                  </div>
                  <h3 className='font-bold text-sm text-epfo-blue leading-tight'>
                    {t('smart_agent')}
                  </h3>
                  <p className='text-slate-500 text-[11px] mt-1 leading-snug'>
                    AI handles complex forms & auto-fills steps.
                  </p>
                </div>
                <div className='mt-2.5 text-[11px] font-bold text-epfo-blue flex items-center gap-0.5'>
                  Launch Agent →
                </div>
              </button>

              {/* Option 2: Traditional Self-Service */}
              <button 
                onClick={() => setFlowChoice('traditional')} 
                className='p-3.5 bg-white/95 backdrop-blur-sm border border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col justify-between text-left shadow-sm transition-all hover:bg-slate-50'
              >
                <div>
                  <div className='w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-2'>
                    <FolderOpen className='w-4 h-4' />
                  </div>
                  <h3 className='font-bold text-sm text-slate-800 leading-tight'>
                    {t('traditional_service')}
                  </h3>
                  <p className='text-slate-500 text-[11px] mt-1 leading-snug'>
                    Direct access to Passbook, Claims & Forms.
                  </p>
                </div>
                <div className='mt-2.5 text-[11px] font-bold text-slate-600 flex items-center gap-0.5'>
                  Open Portal →
                </div>
              </button>
            </div>
          </section>
        )}

        {flowChoice === 'agentic' && (
          <>
            <button onClick={() => setFlowChoice('none')} className='text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1'>
              {t('back_to_choices')}
            </button>
            <section>
              <h2 className='text-base font-bold mb-2.5 text-slate-900'>{t('agent_prompt_title')}</h2>
              {isAnalyzing ? (
                <div className='bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[160px]'>
                  <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
                    <Bot className='w-5 h-5 text-epfo-blue animate-pulse' />
                  </div>
                  
                  <div className='w-full max-w-xs space-y-2 text-xs'>
                    <div className='flex items-center gap-2.5'>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`font-medium ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Fetching Query</span>
                    </div>
                    <div className='flex items-center gap-2.5'>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`font-medium ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Generating Steps</span>
                    </div>
                    <div className='flex items-center gap-2.5'>
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`font-medium ${analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Starting Session</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <form onSubmit={handleAgenticStart} className='relative bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-epfo-blue/30 focus-within:border-epfo-blue shadow-sm overflow-hidden transition-all'>
                    <div className='absolute left-3 top-3'>
                      <Bot className='w-5 h-5 text-epfo-blue' />
                    </div>
                    <textarea 
                      className='w-full bg-transparent text-slate-900 placeholder-slate-500 pl-10 pr-3 pt-3 pb-12 min-h-[90px] resize-none focus:outline-none text-xs leading-relaxed'
                      placeholder={t('agent_placeholder')}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isAnalyzing}
                      autoFocus
                    />
                    
                    <div className='absolute bottom-2 left-3 right-2 flex justify-between items-center'>
                      <button 
                        type="button"
                        onClick={toggleRecording}
                        className={`p-2 rounded-full flex items-center gap-1.5 transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        <Mic className='w-4 h-4' />
                        {isRecording && <span className='text-xs font-medium'>{t('listening')}</span>}
                      </button>

                      <button 
                        type='submit' 
                        disabled={!chatInput.trim() || isAnalyzing}
                        className='bg-epfo-blue text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center'
                      >
                        {t('send')}
                      </button>
                    </div>
                  </form>
                  
                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: t('claim'), val: "Withdraw PF" },
                      { label: t('life_certificate'), val: "Life Certificate" },
                      { label: t('mark_exit_date'), val: "Mark Exit Date" },
                      { label: t('transfer_merge'), val: "Merge PF Accounts" },
                      { label: t('passbook'), val: "Check Balance" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setChatInput(item.val);
                        }}
                        className="bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium hover:border-epfo-blue hover:text-epfo-blue transition-colors shadow-xs"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {flowChoice === 'traditional' && (
          <>
            <button onClick={() => setFlowChoice('none')} className='text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1'>
              {t('back_to_choices')}
            </button>
            <section ref={traditionalFlowRef}>
              <h2 className='text-base font-bold mb-2.5 text-slate-800'>{t('self_service')}</h2>
              <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className='grid grid-cols-3 gap-2'>
                <motion.button variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/passbook')} className='p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-xs'>
                  <Wallet className='w-5 h-5 text-epfo-blue' />
                  <span className='font-semibold text-xs text-slate-800'>{t('passbook')}</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/claim')} className='p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-xs'>
                  <FileText className='w-5 h-5 text-epfo-blue' />
                  <span className='font-semibold text-xs text-slate-800'>{t('claim')}</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/transfer')} className='p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-xs'>
                  <ArrowRightLeft className='w-5 h-5 text-epfo-blue' />
                  <span className='font-semibold text-xs text-slate-800 text-center leading-tight'>{t('transfer_merge')}</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/documents')} className='p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-xs'>
                  <FolderOpen className='w-5 h-5 text-epfo-blue' />
                  <span className='font-semibold text-xs text-slate-800'>{t('vault')}</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/life-certificate')} className='p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-xs'>
                  <Award className='w-5 h-5 text-emerald-600' />
                  <span className='font-semibold text-xs text-slate-800 text-center leading-tight'>{t('life_certificate')}</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/mark-exit')} className='p-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-xs'>
                  <CalendarX2 className='w-5 h-5 text-amber-600' />
                  <span className='font-semibold text-xs text-slate-800 text-center leading-tight'>{t('mark_exit_date')}</span>
                </motion.button>
              </motion.div>
            </section>
          </>
        )}

        {/* Active Tasks / Crash Recovery */}
        {flowChoice === 'none' && activeTaskValues.length > 0 && (
          <section>
            <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5'>
              {t('active_tasks')}
              <span className='bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold'>{activeTaskValues.length}</span>
            </h2>
            <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className='space-y-2'>
              {activeTaskValues.map(task => (
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} key={task.taskId} className='bg-white/95 p-3 rounded-xl border border-orange-200 shadow-xs flex justify-between items-center'>
                  <div>
                    <p className='font-semibold text-xs text-slate-900'>{task.intent}</p>
                    <p className='text-[10px] text-slate-500 mt-0.5'>Status: {task.agentState.replace('_', ' ')} • {new Date(task.lastCheckpoint).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Button onClick={() => handleResume(task.taskId)} className='shrink-0 gap-1 text-xs py-1.5 px-3'>
                      <Play className='w-3 h-3 fill-current' /> {t('resume')}
                    </Button>
                    <button onClick={() => clearTask(task.taskId)} className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* History / Completed Tasks */}
        {flowChoice === 'none' && (
          <section>
            <div className='flex items-center justify-between mb-2'>
              <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
                {t('past_requests')}
                {completedTasks && completedTasks.length > 0 && (
                  <span className='bg-green-100 text-green-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold'>{completedTasks.length}</span>
                )}
              </h2>
              <button onClick={() => navigate('/history')} className='text-xs text-epfo-blue font-medium flex items-center gap-0.5 hover:underline'>
                {t('view_all')} <ArrowRight className="w-3 h-3"/>
              </button>
            </div>
            
            {completedTasks && completedTasks.length > 0 ? (
              <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className='space-y-2'>
                {completedTasks.slice(0, 2).map(task => (
                  <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} key={task.taskId} className='bg-white/95 p-3 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center opacity-85 hover:opacity-100 transition-opacity cursor-pointer' onClick={() => navigate('/history')}>
                    <div className='flex items-center gap-2.5'>
                      <div className='bg-green-50 p-1.5 rounded-full text-green-600'>
                        <CheckCircle2 className='w-4 h-4' />
                      </div>
                      <div>
                        <p className='font-semibold text-xs text-slate-900'>{task.intent}</p>
                        <p className='text-[10px] text-slate-500 mt-0.5'>Completed on {new Date(task.lastCheckpoint).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <button onClick={() => navigate('/history')} className='w-full p-3 bg-white/90 border border-slate-200 border-dashed rounded-xl flex items-center justify-center gap-1.5 text-slate-500 hover:text-epfo-blue hover:border-epfo-blue/50 transition-colors'>
                <FolderOpen className='w-4 h-4' />
                <span className='font-medium text-xs'>{t('no_active_tasks')}</span>
              </button>
            )}
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
