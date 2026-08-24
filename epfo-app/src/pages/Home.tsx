import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Wallet, FolderOpen, ArrowRightLeft, LogOut, ShieldAlert, Play, Bot, Mic, CheckCircle2, Trash2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, riskLevel } = useSessionStore();
  const { activeTasks, completedTasks, startTask, resumeTask, clearTask, archiveTask } = useWorkflowStore();
  
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Auto-archive completed tasks that might have been left here by using the back button
  React.useEffect(() => {
    Object.values(activeTasks).forEach(task => {
      if (task.agentState === 'completed') {
        archiveTask(task.taskId);
      }
    });
  }, [activeTasks, archiveTask]);

  const activeTaskValues = Object.values(activeTasks).filter(t => t.agentState !== 'completed');

  const handleAction = (path: string) => {
    navigate(path);
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzePhase, setAnalyzePhase] = useState<'fetching' | 'generating' | 'starting' | null>(null);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate listening for a bit then transcribing
      setTimeout(() => {
        setChatInput(prev => prev ? prev + ' I want to withdraw my PF' : 'I want to withdraw my PF');
        setIsRecording(false);
      }, 2000);
    }
  };

  const handleAgenticStart = (e: React.FormEvent | React.KeyboardEvent) => {
    if ('preventDefault' in e) e.preventDefault();
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
      const taskType = intent.toLowerCase().includes('withdraw') ? 'withdraw_pf' : 
                       intent.toLowerCase().includes('transfer') ? 'transfer_pf' : 'general_inquiry';
      
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

  const [flowChoice, setFlowChoice] = useState<'none' | 'agentic' | 'traditional'>('none');

  return (
    <div className='flex-1 flex flex-col bg-slate-50 overflow-y-auto'>
      <div className='p-6 pt-12 pb-6 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
            {isAuthenticated ? `Welcome back, ${user?.name || 'Citizen'}` : 'EPFO Portal'}
          </h1>
          {isAuthenticated && user?.uan && (
            <p className='text-sm text-slate-500 font-mono mt-1'>UAN: {user.uan}</p>
          )}
        </div>
        <div className='flex items-center gap-3'>
          {isAnalyzing && (
            <div className='flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-epfo-blue rounded-full text-xs font-medium animate-pulse'>
              <Bot className='w-3.5 h-3.5' />
              Processing
            </div>
          )}
          <button onClick={() => { logout(); navigate('/onboarding', { replace: true }); }} className='p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-sm'>
            <LogOut className='w-4 h-4' />
          </button>
        </div>
      </div>

      <div className='p-6 space-y-8 max-w-2xl mx-auto w-full'>
        
        {flowChoice === 'none' && (
          <section className='space-y-4'>
            <h2 className='text-xl font-semibold mb-6'>How would you like to proceed?</h2>
            
            <button 
              onClick={() => setFlowChoice('agentic')} 
              className='w-full p-6 bg-white border border-epfo-blue rounded-2xl flex items-start gap-4 hover:bg-blue-50 transition-all text-left group shadow-sm'
            >
              <div className='bg-blue-100 p-3 rounded-full'>
                <Bot className='w-8 h-8 text-epfo-blue' />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-lg text-epfo-blue flex items-center gap-2'>
                  Use Smart Agent
                  <span className='bg-epfo-orange text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide'>Recommended</span>
                </h3>
                <p className='text-slate-600 text-sm mt-1'>Simply tell us what you want to do in plain English. The agent will handle the complex forms and steps for you.</p>
              </div>
            </button>

            <button 
              onClick={() => setFlowChoice('traditional')} 
              className='w-full p-6 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 hover:border-slate-300 hover:bg-slate-50 transition-all text-left shadow-sm'
            >
              <div className='bg-slate-100 p-3 rounded-full'>
                <FolderOpen className='w-8 h-8 text-slate-600' />
              </div>
              <div className='flex-1'>
                <h3 className='font-semibold text-lg text-slate-800'>Use Traditional Self-Service</h3>
                <p className='text-slate-600 text-sm mt-1'>Navigate through the standard menus and forms yourself, just like the classic portal.</p>
              </div>
            </button>
          </section>
        )}

        {flowChoice === 'agentic' && (
          <>
            <button onClick={() => setFlowChoice('none')} className='text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2'>
              ← Back to choices
            </button>
            <section>
              <h2 className='text-lg font-semibold mb-3'>What would you like to do today?</h2>
              {isAnalyzing ? (
                <div className='bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center space-y-6 shadow-sm min-h-[220px]'>
                  <div className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2'>
                    <Bot className='w-6 h-6 text-epfo-blue animate-pulse' />
                  </div>
                  
                  <div className='w-full max-w-sm space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`text-sm font-medium ${analyzePhase === 'fetching' || analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Fetching Query</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`text-sm font-medium ${analyzePhase === 'generating' || analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Generating Steps</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-colors ${analyzePhase === 'starting' ? 'bg-epfo-blue' : 'bg-slate-200'}`} />
                      <span className={`text-sm font-medium ${analyzePhase === 'starting' ? 'text-slate-900' : 'text-slate-400'}`}>Starting Session</span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAgenticStart} className='relative bg-white rounded-3xl border-2 border-epfo-blue/30 focus-within:border-epfo-blue shadow-sm overflow-hidden transition-all'>
                  <div className='absolute left-4 top-4'>
                    <Bot className='w-6 h-6 text-epfo-blue' />
                  </div>
                  <textarea 
                    className='w-full bg-transparent text-slate-900 placeholder-slate-400 pl-12 pr-4 pt-4 pb-16 min-h-[140px] resize-none focus:outline-none'
                    placeholder='Try "I want to withdraw my PF" or tap the mic to speak...'
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAnalyzing}
                    autoFocus
                  />
                  
                  <div className='absolute bottom-3 left-4 right-3 flex justify-between items-center'>
                    <button 
                      type="button"
                      onClick={toggleRecording}
                      className={`p-3 rounded-full flex items-center gap-2 transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <Mic className='w-5 h-5' />
                      {isRecording && <span className='text-sm font-medium'>Listening...</span>}
                    </button>

                    <button 
                      type='submit' 
                      disabled={!chatInput.trim() || isAnalyzing}
                      className='bg-epfo-blue text-white rounded-full px-6 py-2.5 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]'
                    >
                      Send
                    </button>
                  </div>
                </form>
              )}
            </section>
          </>
        )}



        {flowChoice === 'traditional' && (
          <>
            <button onClick={() => setFlowChoice('none')} className='text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2'>
              ← Back to choices
            </button>
            <section>
              <h2 className='text-lg font-semibold mb-3 text-slate-800'>Self-Service</h2>
              <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className='grid grid-cols-2 gap-3'>
                <motion.button variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/passbook')} className='p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-sm'>
                  <Wallet className='w-6 h-6 text-epfo-blue' />
                  <span className='font-medium text-sm'>Passbook</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/claim')} className='p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-sm'>
                  <FileText className='w-6 h-6 text-epfo-blue' />
                  <span className='font-medium text-sm'>Claim</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/transfer')} className='p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-sm'>
                  <ArrowRightLeft className='w-6 h-6 text-epfo-blue' />
                  <span className='font-medium text-sm'>Transfer</span>
                </motion.button>
                <motion.button variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} whileTap={{ scale: 0.95 }} onClick={() => handleAction('/documents')} className='p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-epfo-blue hover:bg-blue-50 transition-colors shadow-sm'>
                  <FolderOpen className='w-6 h-6 text-epfo-blue' />
                  <span className='font-medium text-sm'>Vault</span>
                </motion.button>
              </motion.div>
            </section>
          </>
        )}

        {/* Active Tasks / Crash Recovery */}
        {flowChoice === 'none' && activeTaskValues.length > 0 && (
          <section>
            <h2 className='text-lg font-semibold mb-3 text-slate-800 flex items-center gap-2'>
              Active Tasks
              <span className='bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold'>{activeTaskValues.length}</span>
            </h2>
            <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className='space-y-3'>
              {activeTaskValues.map(task => (
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} key={task.taskId} className='bg-white p-4 rounded-2xl border border-orange-200 shadow-sm flex justify-between items-center'>
                  <div>
                    <p className='font-medium text-slate-900'>{task.intent}</p>
                    <p className='text-xs text-slate-500 mt-1'>Status: {task.agentState.replace('_', ' ')} • Last updated: {new Date(task.lastCheckpoint).toLocaleTimeString()}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button onClick={() => handleResume(task.taskId)} className='shrink-0 gap-2 pl-3'>
                      <Play className='w-4 h-4 fill-current' /> Resume
                    </Button>
                    <button onClick={() => clearTask(task.taskId)} className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* History / Completed Tasks */}
        {flowChoice === 'none' && completedTasks && completedTasks.length > 0 && (
          <section>
            <h2 className='text-lg font-semibold mb-3 text-slate-800 flex items-center gap-2'>
              Past Requests
              <span className='bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold'>{completedTasks.length}</span>
            </h2>
            <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className='space-y-3'>
              {completedTasks.slice(0, 3).map(task => (
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} key={task.taskId} className='bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-green-50 p-2 rounded-full text-green-600'>
                      <CheckCircle2 className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='font-medium text-slate-900'>{task.intent}</p>
                      <p className='text-xs text-slate-500 mt-0.5'>Completed on {new Date(task.lastCheckpoint).toLocaleDateString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {completedTasks.length > 3 && (
                <button onClick={() => navigate('/history')} className='w-full py-3 mt-1 text-sm font-medium text-epfo-blue bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors flex justify-center items-center gap-2'>
                  View all {completedTasks.length} past requests <ArrowRight className="w-4 h-4"/>
                </button>
              )}
            </motion.div>
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
                className='w-full p-4 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-epfo-blue' 
              />
              {resumeError && <p className='text-red-500 text-xs'>Incorrect answer.</p>}
            </div>

            <div className='flex gap-3'>
              <Button variant='outline' className='flex-1' onClick={() => setResumeTaskId(null)}>Cancel</Button>
              <Button className='flex-1' onClick={confirmResume}>Verify & Resume</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
