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
  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'Citizen';

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

        {/* Compact Need More Help ? Section */}
        <section className='space-y-2'>
          <div className='px-0.5'>
            <h2 className='text-[11px] font-bold text-slate-800 uppercase tracking-wider'>
              Need More Help?
            </h2>
          </div>

          <div className='grid grid-cols-2 gap-2.5'>
            
            {/* SMART FLOW */}
            <button 
              onClick={handleSmartFlowLaunch}
              className='p-3.5 bg-gradient-to-br from-blue-50/95 via-white to-blue-50/50 border-2 border-epfo-blue/50 hover:border-epfo-blue rounded-2xl flex flex-col justify-between text-left group shadow-2xs hover:shadow-sm transition-all'
            >
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <div className='w-8 h-8 bg-epfo-blue text-white rounded-xl flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform'>
                    <Bot className='w-4 h-4' />
                  </div>
                  <span className='bg-epfo-orange text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase'>
                    {t('recommended')}
                  </span>
                </div>
                <h3 className='font-bold text-sm text-epfo-blue leading-tight'>
                  Smart Flow
                </h3>
                <p className='text-[11px] text-slate-600 mt-1 leading-snug'>
                  AI assistant guides your claims & transfers.
                </p>
              </div>
              <div className='mt-2.5 text-[11px] font-bold text-epfo-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                Launch Smart Flow →
              </div>
            </button>

            {/* TRADITIONAL FLOW */}
            <button 
              onClick={handleTraditionalClick}
              className='p-3.5 bg-white/95 backdrop-blur-md border border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col justify-between text-left group shadow-2xs hover:shadow-sm transition-all'
            >
              <div>
                <div className='w-8 h-8 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform'>
                  <FolderOpen className='w-4 h-4' />
                </div>
                <h3 className='font-bold text-sm text-slate-900 leading-tight group-hover:text-slate-700'>
                  Traditional Flow
                </h3>
                <p className='text-[11px] text-slate-600 mt-1 leading-snug'>
                  Classic portal forms, claims & filing.
                </p>
              </div>
              <div className='mt-2.5 text-[11px] font-bold text-slate-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
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
