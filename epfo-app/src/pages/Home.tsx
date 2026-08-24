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
  Bell
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
  
  // Auto-archive completed tasks
  React.useEffect(() => {
    Object.values(activeTasks).forEach(task => {
      if (task.agentState === 'completed') {
        archiveTask(task.taskId);
      }
    });
  }, [activeTasks, archiveTask]);

  const activeTaskValues = Object.values(activeTasks).filter(t => t.agentState !== 'completed');

  const handleSmartFlowLaunch = () => {
    startTask("EPFO Smart Assistant", "withdraw_pf", [
      { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
      { step: 'check_eligibility', description: 'Check if you are eligible', status: 'pending' as const },
      { step: 'gather_documents', description: 'Get your documents from DigiLocker', status: 'pending' as const },
      { step: 'review_claim', description: 'Review your claim details', status: 'pending' as const },
      { step: 'submit_claim', description: 'Final review and submit', status: 'pending' as const },
    ]);
    navigate('/smart-flow');
  };

  const handleTraditionalClick = () => {
    navigate('/claim');
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

        {/* Prominent Center Choice Section: NEED MORE HELP ? */}
        <section className='space-y-3 pt-2'>
          <div className='px-1'>
            <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>
              Need More Help?
            </h2>
            <p className='text-xs text-slate-500 mt-0.5'>
              Choose between guided AI assistance or traditional self-service
            </p>
          </div>

          <div className='grid grid-cols-2 gap-3.5'>
            
            {/* SMART FLOW */}
            <button 
              onClick={handleSmartFlowLaunch}
              className='p-5 bg-gradient-to-br from-blue-50/95 via-white to-blue-50/50 border-2 border-epfo-blue/50 hover:border-epfo-blue rounded-3xl flex flex-col justify-between text-left group shadow-xs hover:shadow-md transition-all hover:scale-[1.02]'
            >
              <div>
                <div className='flex items-center justify-between mb-3'>
                  <div className='w-11 h-11 bg-epfo-blue text-white rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform'>
                    <Bot className='w-6 h-6' />
                  </div>
                  <span className='bg-epfo-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase'>
                    {t('recommended')}
                  </span>
                </div>
                <h3 className='font-bold text-base text-epfo-blue leading-tight'>
                  Smart Flow
                </h3>
                <p className='text-xs text-slate-600 mt-1.5 leading-relaxed'>
                  AI assistant guides your claims, transfers & certificates step-by-step.
                </p>
              </div>
              <div className='mt-4 text-xs font-bold text-epfo-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                Launch Smart Flow →
              </div>
            </button>

            {/* TRADITIONAL FLOW */}
            <button 
              onClick={handleTraditionalClick}
              className='p-5 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-slate-400 rounded-3xl flex flex-col justify-between text-left group shadow-xs hover:shadow-md transition-all hover:scale-[1.02]'
            >
              <div>
                <div className='w-11 h-11 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform'>
                  <FolderOpen className='w-6 h-6' />
                </div>
                <h3 className='font-bold text-base text-slate-900 leading-tight group-hover:text-slate-700'>
                  Traditional Flow
                </h3>
                <p className='text-xs text-slate-600 mt-1.5 leading-relaxed'>
                  Direct access to classic self-service portal, forms & filing.
                </p>
              </div>
              <div className='mt-4 text-xs font-bold text-slate-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                Open Traditional Portal →
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
