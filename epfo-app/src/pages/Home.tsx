import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  LogOut, 
  ShieldAlert, 
  Play, 
  
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
  Vault,
  Sparkles,
  Send,
  AlertTriangle,
  UserX,
  FileWarning,
  CreditCard
} from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import { useWorkflowStore } from '../store/useWorkflowStore';
import type { Phase } from '../store/useWorkflowStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useDemoStore } from '../store/useDemoStore';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { NotificationModal } from '../components/notifications/NotificationModal';
import toast from 'react-hot-toast';
import { AssistantAvatar } from '../components/ui/AssistantAvatar';

const PHASE_META: Record<string, { label: string; description: string }> = {
  kyc_mismatch: { label: 'Fix KYC Mismatch', description: 'Correct your name/DOB mismatch between EPFO and Aadhaar' },
  withdraw_pf: { label: 'Withdraw PF', description: 'File your PF withdrawal claim (Form 31/19/10C)' },
  merge_accounts: { label: 'Merge Accounts', description: 'Consolidate duplicate UAN accounts under one UAN' },
  transfer_pf: { label: 'Transfer PF', description: 'Transfer PF balance from old employer to current' },
  mark_exit: { label: 'Mark Exit Date', description: 'Self-declare your date of exit from employment' },
  life_certificate: { label: 'Life Certificate', description: 'Renew your digital life certificate for pension' },
  grievance: { label: 'File Grievance', description: 'Register and track an EPFO grievance' },
};

const COMPOUND_PATTERNS: { pattern: RegExp; flows: string[] }[] = [
  { pattern: /fix.*(kyc|mismatch|aadhaar).*(and|then|also|after).*(withdraw|claim|pf)/i, flows: ['kyc_mismatch', 'withdraw_pf'] },
  { pattern: /(kyc|mismatch|aadhaar).*(and|then|also).*(withdraw|claim|pf)/i, flows: ['kyc_mismatch', 'withdraw_pf'] },
  { pattern: /merge.*(and|then|also).*(transfer|claim)/i, flows: ['merge_accounts', 'transfer_pf'] },
  { pattern: /(mark|set).*exit.*(and|then|also).*(claim|withdraw|transfer)/i, flows: ['mark_exit', 'withdraw_pf'] },
  { pattern: /exit.*(and|then).*(claim|withdraw|transfer)/i, flows: ['mark_exit', 'withdraw_pf'] },
  { pattern: /life.*(certificate|pramaan).*(and|then|also).*(withdraw|pension)/i, flows: ['life_certificate', 'withdraw_pf'] },
  { pattern: /(grievance|complain).*(and|then|also).*(withdraw|claim)/i, flows: ['grievance', 'withdraw_pf'] },
];

function generatePlan(taskType: string): { step: string; description: string; status: 'pending' | 'active' | 'completed' }[] {
  switch (taskType) {
    case 'withdraw_pf':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' },
        { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' },
        { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' },
        { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' },
      ];
    case 'transfer_pf':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'fetch_employment', description: 'Locate previous Member IDs & establishments', status: 'pending' },
        { step: 'initiate_transfer', description: 'Authorize transfer to current account', status: 'pending' },
        { step: 'submit_transfer', description: 'Attestation & OTP submission', status: 'pending' },
      ];
    case 'life_certificate':
      return [
        { step: 'verify_identity', description: 'Verify pensioner identity', status: 'active' },
        { step: 'fetch_pension_details', description: 'Retrieve PPO and bank details', status: 'pending' },
        { step: 'capture_face', description: 'Perform UIDAI face authentication', status: 'pending' },
        { step: 'submit_certificate', description: 'Generate & submit Jeevan Pramaan', status: 'pending' },
      ];
    case 'mark_exit':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'fetch_employment', description: 'Retrieve employment records', status: 'pending' },
        { step: 'select_exit_reason', description: 'Select establishment and reason for exit', status: 'pending' },
        { step: 'submit_exit', description: 'Aadhaar OTP sign & confirm exit', status: 'pending' },
      ];
    case 'grievance':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'analyze_issue', description: 'Analyze rejection reason or delay', status: 'pending' },
        { step: 'register_grievance', description: 'Register EPFiGMS ticket automatically', status: 'pending' },
        { step: 'generate_reference', description: 'Generate tracking reference number', status: 'pending' },
      ];
    case 'kyc_mismatch':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'analyze_mismatch', description: 'Compare EPFO vs Aadhaar records', status: 'pending' },
        { step: 'draft_declaration', description: 'Draft Joint Declaration for correction', status: 'pending' },
        { step: 'submit_declaration', description: 'Aadhaar OTP sign & submit to EPFO', status: 'pending' },
      ];
    case 'merge_accounts':
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'fetch_linked_accounts', description: 'Discover duplicate UANs via Aadhaar', status: 'pending' },
        { step: 'select_accounts_to_merge', description: 'Select accounts to consolidate', status: 'pending' },
        { step: 'submit_merge_request', description: 'Aadhaar OTP sign & submit merge', status: 'pending' },
      ];
    default:
      return [
        { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' },
        { step: 'process_inquiry', description: 'Analyze your request & calculate rules', status: 'pending' },
        { step: 'resolve_inquiry', description: 'Provide accurate guidance or grievance path', status: 'pending' },
      ];
  }
}

function detectCompoundIntent(query: string): string[] | null {
  const lower = query.toLowerCase();
  for (const { pattern, flows } of COMPOUND_PATTERNS) {
    if (pattern.test(lower)) return flows;
  }
  return null;
}

function classifyIntent(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('life') || lower.includes('certificate') || lower.includes('pramaan')) return 'life_certificate';
  if (lower.includes('exit') || lower.includes('leaving') || lower.includes('quit')) return 'mark_exit';
  if (lower.includes('withdraw') || lower.includes('advance') || lower.includes('claim')) return 'withdraw_pf';
  if (lower.includes('transfer') || lower.includes('merge')) return 'transfer_pf';
  if (lower.includes('grievance') || lower.includes('complaint') || lower.includes('reject')) return 'grievance';
  return 'general_inquiry';
}

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, riskLevel } = useSessionStore();
  const { activeTasks, startTask, resumeTask, clearTask, archiveTask } = useWorkflowStore();
  const { enabled: notificationsEnabled } = useNotificationStore();
  const { isKycMissing, isClaimRejected, isEmployerPending, hasMultipleUans, isAdvanceRejected, isNomineeMissing, isPensionCertIssue, isBankNotSeeded, isAadhaarConflict } = useDemoStore();
  
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

  // Remind users to setup notifications if not enabled
  React.useEffect(() => {
    if (isAuthenticated && !notificationsEnabled) {
      const hasSeenToast = sessionStorage.getItem('epfo_notif_toast_seen');
      if (!hasSeenToast) {
        sessionStorage.setItem('epfo_notif_toast_seen', 'true');
        setTimeout(() => {
          toast(
            (t) => (
              <div className="flex flex-col gap-2 p-1">
                <span className="text-xs font-semibold text-slate-800">
                  Stay updated on your claims!
                </span>
                <span className="text-[11px] text-slate-600 leading-tight">
                  Enable WhatsApp & Email alerts for instant status updates.
                </span>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    setIsNotificationOpen(true);
                  }}
                  className="mt-1 bg-epfo-blue text-white py-1.5 rounded-lg text-[11px] font-bold shadow-xs hover:bg-blue-800 transition-colors w-full"
                >
                  Setup Notifications
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

      const detectedFlows = detectCompoundIntent(query);

      if (detectedFlows && detectedFlows.length >= 2) {
        const phases: Phase[] = detectedFlows.map((flowType, idx) => ({
          id: `phase-${idx + 1}`,
          label: PHASE_META[flowType]?.label || flowType,
          description: PHASE_META[flowType]?.description || '',
          taskType: flowType,
          plan: generatePlan(flowType),
          status: idx === 0 ? 'active' as const : 'pending' as const,
        }));

        const combinedPlan = phases.flatMap((phase, phaseIdx) =>
          phase.plan.map((step, stepIdx) => ({
            ...step,
            step: `phase${phaseIdx}_${step.step}`,
            status: (phaseIdx === 0 && stepIdx === 0) ? 'active' as const : 'pending' as const,
          }))
        );

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
            <Bell className='!w-4 !h-4' />
            {notificationsEnabled && (
              <span className='absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white'></span>
            )}
          </button>
          <button 
            onClick={() => { logout(); navigate('/onboarding', { replace: true }); }} 
            className='p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-2xs' 
            title={t('logout')}
          >
            <LogOut className='!w-4 !h-4' />
          </button>
        </div>
      </div>

      <div className='p-4 space-y-4 max-w-2xl mx-auto w-full pb-12'>
        
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
        )}

        {/* ========================================================= */}
        {/* MODE 1: MAIN DASHBOARD VIEW (flowChoice === 'none')       */}
        {/* ========================================================= */}
        {!isAnalyzing && flowChoice === 'none' && (
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


              </section>
            )}

            {/* Smart Notifications — Always Visible */}
            {isAuthenticated && (
              <section className='space-y-2'>
                <div className='px-0.5'>
                  <h2 className='text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
                    <Bell className='!w-3.5 !h-3.5 text-epfo-blue' />
                    Smart Notifications
                  </h2>
                </div>

                <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5 shadow-xs'>
                  <div className='flex items-start gap-2.5'>
                    <div className='bg-blue-100 p-1.5 rounded-lg text-blue-600 shrink-0 mt-0.5'>
                      <ShieldCheck className='!w-4 !h-4' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-xs font-bold text-blue-900'>KYC Annual Deadline</h4>
                      <p className='text-[11px] text-blue-700 mt-0.5 leading-snug'>
                        Last date for Aadhaar-Bank seeding verification is <span className='font-bold'>30 Sep 2026</span>. Ensure all documents are updated to avoid claim rejection.
                      </p>
                      <button
                        onClick={() => navigate('/documents')}
                        className='mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2'
                      >
                        Check Vault Status →
                      </button>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-3.5 shadow-xs'>
                  <div className='flex items-start gap-2.5'>
                    <div className='bg-teal-100 p-1.5 rounded-lg text-teal-600 shrink-0 mt-0.5'>
                      <CalendarX2 className='!w-4 !h-4' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-xs font-bold text-teal-900'>Life Certificate Due</h4>
                      <p className='text-[11px] text-teal-700 mt-0.5 leading-snug'>
                        Your annual Digital Life Certificate is due by <span className='font-bold'>30 Nov 2026</span>. Submit early via Face Auth to avoid pension interruption.
                      </p>
                      <button
                        onClick={() => navigate('/life-certificate')}
                        className='mt-2 text-[10px] font-bold text-teal-600 hover:text-teal-800 underline underline-offset-2'
                      >
                        Submit Now →
                      </button>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3.5 shadow-xs'>
                  <div className='flex items-start gap-2.5'>
                    <div className='bg-amber-100 p-1.5 rounded-lg text-amber-600 shrink-0 mt-0.5'>
                      <AlertTriangle className='!w-4 !h-4' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-xs font-bold text-amber-900'>Employer Contribution Filing</h4>
                      <p className='text-[11px] text-amber-700 mt-0.5 leading-snug'>
                        Monthly PF contribution deadline is <span className='font-bold'>15th of each month</span>. Late filing attracts penal damages of up to 25%.
                      </p>
                      <button
                        onClick={() => navigate('/passbook')}
                        className='mt-2 text-[10px] font-bold text-amber-600 hover:text-amber-800 underline underline-offset-2'
                      >
                        View Contributions →
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* KYC Missing (Demo) */}
            {isAuthenticated && isKycMissing() && (
              <section className='bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0'>
                    <AlertTriangle className='!w-7 !h-7' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold text-amber-900 text-sm'>KYC Not Completed</h3>
                    <p className='text-xs text-amber-800 mt-1 leading-snug'>
                      Your KYC (Aadhaar + Bank + PAN) is not linked. You cannot file claims, transfers, or exit dates until KYC is complete.
                    </p>
                    <button
                      onClick={() => navigate('/documents')}
                      className='mt-3 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                    >
                      Complete KYC Now
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Multiple Accounts Action Required */}
            {isAuthenticated && hasMultipleUans() && (
              <section className='bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm relative overflow-hidden'>
                <div className='flex items-start gap-3'>
                  <div className='bg-orange-100 p-2 rounded-xl text-orange-600 shrink-0'>
                    <AlertTriangle className='!w-7 !h-7' />
                  </div>
                  <div>
                    <h3 className='font-bold text-orange-900 text-sm'>Action Required: Multiple Accounts</h3>
                    <p className='text-xs text-orange-800 mt-1 leading-snug'>
                      We found ₹45,000 in an old UAN. Merge it to your current account to earn maximum interest.
                    </p>
                    <button 
                      onClick={() => handleAgenticStart(undefined, 'I want to merge my old PF account')}
                      className='mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                    >
                      Merge with Smart Flow
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Claim Rejected (Demo) */}
            {isAuthenticated && isClaimRejected() && (
              <section className='bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-red-100 p-2 rounded-xl text-red-600 shrink-0'>
                    <AlertTriangle className='!w-7 !h-7' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold text-red-900 text-sm'>PF Claim Rejected</h3>
                    <p className='text-xs text-red-800 mt-1 leading-snug'>
                      Your PF claim (Form 31 Advance) was rejected. EPFO says insufficient documents. You can appeal or re-file with correct documents.
                    </p>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'My PF advance claim was rejected, I want to appeal')}
                        className='bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                      >
                        Appeal via Smart Flow
                      </button>
                      <button
                        onClick={() => navigate('/grievance')}
                        className='bg-white hover:bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-red-200'
                      >
                        File Grievance
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Employer Pending (Demo) */}
            {isAuthenticated && isEmployerPending() && (
              <section className='bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-blue-100 p-2 rounded-xl text-blue-600 shrink-0'>
                    <AlertTriangle className='!w-7 !h-7' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold text-blue-900 text-sm'>Waiting for Employer Approval</h3>
                    <p className='text-xs text-blue-800 mt-1 leading-snug'>
                      Your PF withdrawal request is pending employer approval. SLA: 5 business days. 3 days elapsed.
                    </p>
                    <div className='mt-3 bg-blue-100 rounded-full h-2 overflow-hidden'>
                      <div className='bg-blue-600 h-full rounded-full' style={{ width: '60%' }} />
                    </div>
                    <p className='text-[10px] text-blue-700 mt-1 font-semibold'>3 / 5 days elapsed — TCS (Tata Consultancy Services)</p>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'My employer has not approved my PF withdrawal, escalate the request')}
                        className='bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                      >
                        Escalate to EPFO
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Advance Claim Rejected (Demo) */}
            {isAuthenticated && isAdvanceRejected() && (
              <section className='bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-red-100 p-2 rounded-xl text-red-600 shrink-0'>
                    <AlertTriangle className='!w-7 !h-7' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold text-red-900 text-sm'>PF Advance Rejected</h3>
                    <p className='text-xs text-red-800 mt-1 leading-snug'>
                      Your PF advance claim (Form 31) was rejected due to insufficient service years. You need at least 5 years of service for education/illness advance.
                    </p>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'My PF advance was rejected, I have less than 5 years of service')}
                        className='bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                      >
                        Check Eligibility
                      </button>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'What are the eligibility rules for PF advance withdrawal')}
                        className='bg-white hover:bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-red-200'
                      >
                        Learn Rules
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Nominee Not Updated (Demo) */}
            {isAuthenticated && isNomineeMissing() && (
              <section className='bg-purple-50 border border-purple-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-purple-100 p-2 rounded-xl text-purple-600 shrink-0'>
                    <UserX className='!w-7 !h-7' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold text-purple-900 text-sm'>e-Nomination Not Filed</h3>
                    <p className='text-xs text-purple-800 mt-1 leading-snug'>
                      Your claim is pending because e-nomination is not updated. Without it, your family cannot claim PF in case of death.
                    </p>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'I need to update my e-nomination for PF')}
                        className='bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                      >
                        File e-Nomination
                      </button>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'Why is e-nomination required for PF claim')}
                        className='bg-white hover:bg-purple-50 text-purple-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-purple-200'
                      >
                        Why is this needed?
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Pension Certificate Issue (Demo) */}
            {isAuthenticated && isPensionCertIssue() && (
              <section className='bg-teal-50 border border-teal-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-teal-100 p-2 rounded-xl text-teal-600 shrink-0'>
                    <FileWarning className='!w-7 !h-7' />
                  </div>
                  <div>
                    <h3 className='font-bold text-teal-900 text-sm'>Pension Certificate Mismatch</h3>
                    <p className='text-xs text-teal-800 mt-1 leading-snug'>
                      Your Scheme Certificate / Form 10D failed due to service-history mismatch. Check your employment records.
                    </p>
                    <button
                      onClick={() => handleAgenticStart(undefined, 'My pension scheme certificate failed due to service history mismatch')}
                      className='mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                    >
                      Resolve via Smart Flow
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Bank Account Not Seeded (Demo) */}
            {isAuthenticated && isBankNotSeeded() && (
              <section className='bg-indigo-50 border border-indigo-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-indigo-100 p-2 rounded-xl text-indigo-600 shrink-0'>
                    <CreditCard className='!w-7 !h-7' />
                  </div>
                  <div>
                    <h3 className='font-bold text-indigo-900 text-sm'>Bank Account Not Verified</h3>
                    <p className='text-xs text-indigo-800 mt-1 leading-snug'>
                      Your claim was approved but disbursement failed. The linked bank account is not verified or IFSC is outdated.
                    </p>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => navigate('/documents')}
                        className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                      >
                        Update Bank Details
                      </button>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'My bank account IFSC is outdated, how to update')}
                        className='bg-white hover:bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-indigo-200'
                      >
                        Get Help
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Aadhaar Conflict (Demo) */}
            {isAuthenticated && isAadhaarConflict() && (
              <section className='bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm'>
                <div className='flex items-start gap-3'>
                  <div className='bg-rose-100 p-2 rounded-xl text-rose-600 shrink-0'>
                    <ShieldAlert className='!w-7 !h-7' />
                  </div>
                  <div>
                    <h3 className='font-bold text-rose-900 text-sm'>Aadhaar Linked to Wrong UAN</h3>
                    <p className='text-xs text-rose-800 mt-1 leading-snug'>
                      Your Aadhaar is already linked to another UAN. This blocks activation of your current UAN. You need to merge or de-link.
                    </p>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleAgenticStart(undefined, 'My Aadhaar is linked to wrong UAN, need to de-link')}
                        className='bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors'
                      >
                        Fix via Smart Flow
                      </button>
                      <button
                        onClick={() => navigate('/grievance')}
                        className='bg-white hover:bg-rose-50 text-rose-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-rose-200'
                      >
                        File Grievance
                      </button>
                    </div>
                  </div>
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
                        <AssistantAvatar className='!w-7 !h-7' />
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
                      <FolderOpen className='!w-7 !h-7' />
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
                          <Trash2 className='!w-4 !h-4' />
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
              <ArrowLeft className='!w-4 !h-4' /> {t('back_to_choices') || 'Back to Dashboard'}
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
                        placeholder='Type what you need in simple words (e.g. "I want to withdraw ₹50,000 for medical emergency", "Fix KYC mismatch then withdraw PF", "Reset password")...'
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
            </section>

            {/* Frequently Asked Questions / Quick Intents (FAQs) */}
            <section className='space-y-2 pt-1'>
              <div className='flex items-center gap-1.5 px-1'>
                <Sparkles className='!w-4 !h-4 text-epfo-blue' />
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

              {/* Compound Multi-Phase Intents */}
              <div className='mt-4 space-y-2'>
                <div className='flex items-center gap-1.5 px-1'>
                  <div className='w-1.5 h-1.5 rounded-full bg-epfo-orange' />
                  <h3 className='text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                    Multi-Step Compound Workflows
                  </h3>
                  <span className='bg-epfo-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ml-1'>New</span>
                </div>
                {[
                  {
                    title: "Fix KYC mismatch then withdraw PF",
                    desc: "2-phase: Correct name/DOB → File Form 31 claim (auto-sequenced)",
                    query: "Fix my KYC mismatch and then withdraw PF"
                  },
                  {
                    title: "Mark exit date and withdraw PF balance",
                    desc: "2-phase: Self-declare exit → Submit full settlement claim",
                    query: "Mark my exit date and then claim my PF"
                  },
                  {
                    title: "Merge old PF account and transfer balance",
                    desc: "2-phase: Discover duplicate UANs → Consolidate via One Member One EPF",
                    query: "Merge my old PF account and then transfer the balance"
                  }
                ].map((faq, idx) => (
                  <button
                    key={`compound-${idx}`}
                    onClick={(e) => handleAgenticStart(e, faq.query)}
                    className='w-full p-3 bg-gradient-to-r from-orange-50/80 to-amber-50/60 hover:from-orange-100 hover:to-amber-100 border border-orange-200/80 hover:border-orange-300 rounded-2xl flex items-center justify-between text-left transition-all shadow-2xs group'
                  >
                    <div>
                      <p className='text-xs font-bold text-slate-800 group-hover:text-orange-700 flex items-center gap-1.5'>
                        {faq.title}
                        <span className='text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold'>Multi-Phase</span>
                      </p>
                      <p className='text-[11px] text-slate-500 mt-0.5'>
                        {faq.desc}
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
              className='text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors'
            >
              <ArrowLeft className='!w-4 !h-4' /> {t('back_to_choices') || 'Back to Dashboard'}
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
                { title: "Document Vault", desc: "DigiLocker KYC & Bank references", path: "/documents", icon: Vault, color: "text-purple-600 bg-purple-50" },
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
              <ShieldAlert className='!w-7 !h-7 text-red-600 shrink-0 mt-0.5' />
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
              <ShieldCheck className='!w-8 !h-8' />
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
