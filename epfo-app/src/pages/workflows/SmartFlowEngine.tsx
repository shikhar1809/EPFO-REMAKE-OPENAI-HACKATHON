import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FlowInfoCard } from '../../components/ui/FlowInfoCard';
import { ThinkingAnimation } from '../../components/ui/ThinkingAnimation';
import { TypewriterText } from '../../components/ui/TypewriterText';
import { EmployerApprovalStatus } from '../../components/ui/EmployerApprovalStatus';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import type { Phase } from '../../store/useWorkflowStore';
import { PhaseTransition } from '../../components/ui/PhaseTransition';
import { useSessionStore } from '../../store/useSessionStore';

import { getAgentColors, getStepConfig, getAgent, generatePlan } from '../../agents/registry';
import { buildMultiPhaseTask } from '../../agents/compound';
import toast from 'react-hot-toast';
import { AssistantAvatar } from '../../components/ui/AssistantAvatar';
import { AgentSpawnAnimation } from '../../components/animations/AgentSpawnAnimation';
import { StepForms } from '../../components/workflow/StepForms';

interface AgentMessage {
  id: string;
  text: string;
  type: 'agent' | 'system';
  timestamp: number;
}

const STEP_I18N_MAP: Record<string, string> = {
  'Check Bank & Eligibility': 'step_check_eligibility',
  'Gather Documents from Vault': 'step_gather_docs',
  'Review Claim Details': 'step_review_claim',
  'Submit Claim with Aadhaar OTP': 'step_submit_claim',
  'Verify Identity & UAN': 'step_verify_identity',
};

const USER_MESSAGES: Record<string, string> = {
  check_eligibility: "I need you to verify the last 4 digits of your bank account. This confirms the account linked to your UAN matches your records.",
  review_claim: "Your Aadhaar is linked and KYC is verified. Please select the withdrawal type and amount.",
  capture_face: "Position your face within the frame. The camera will match against your Aadhaar photo.",
  select_exit_reason: "Select the reason that best describes why you left this employer.",
  analyze_passbook: "Here's your full contribution history. I've highlighted the key numbers.",
  fetch_linked_accounts: "I discovered duplicate UANs under your Aadhaar. Let me show you the details.",
  select_accounts_to_merge: "Please confirm which inactive account balance should transfer to your active UAN.",
  select_grievance_type: "Categorizing your grievance helps route it to the right department with the correct SLA.",
  register_grievance: "Describe your issue in detail. The more specific you are, the faster the resolution.",
  generate_reference: "Your grievance has been filed. Save this ticket number for tracking.",
  analyze_mismatch: "I've analyzed the mismatch between your EPFO records and Aadhaar.",
  draft_declaration: "Here is the drafted Joint Declaration to fix the mismatch.",
  initiate_transfer: "Found your previous accounts. Please review and confirm which ones to transfer.",
};

const NEEDS_USER_STEPS = new Set([
  'check_eligibility', 'review_claim', 'capture_face', 'select_exit_reason',
  'register_grievance', 'generate_reference', 'analyze_passbook', 'analyze_mismatch',
  'draft_declaration', 'fetch_linked_accounts', 'select_accounts_to_merge',
  'select_grievance_type', 'initiate_transfer', 'detect_conflict',
]);

const SENSITIVE_STEPS = new Set([
  'submit_claim', 'submit_transfer', 'submit_certificate', 'submit_exit',
  'submit_declaration', 'submit_merge_request', 'delink_aadhaar',
]);

const EMPLOYER_APPROVAL_FLOWS: Record<string, string> = {
  submit_declaration: 'kyc_mismatch',
};

export const SmartFlowEngine: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getCurrentTask, updateTaskState, checkpointTask, archiveTask, completeCurrentPhase } = useWorkflowStore();
  const { stepUpAuth } = useSessionStore();
  const task = getCurrentTask();

  const [bankDigits, setBankDigits] = useState('1234');
  const [purpose, setPurpose] = useState('Medical Emergency (Illness)');
  const [amount, setAmount] = useState('50000');
  const [otpInput, setOtpInput] = useState('1234');
  const [authError, setAuthError] = useState(false);
  const [hasStartedFlow, setHasStartedFlow] = useState(false);
  const [flowStartTime, setFlowStartTime] = useState<number | null>(null);
  const [flowEndTime, setFlowEndTime] = useState<number | null>(null);
  const [consentGiven, setConsentGiven] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [grievanceType, setGrievanceType] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);
  const prevPhaseIndexRef = useRef<number | undefined>(task?.currentPhaseIndex);
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showSpawn, setShowSpawn] = useState(true);

  const isInitializing = showSpawn && task?.agentState === 'planned' && task?.plan[0]?.status === 'active' && !hasStartedFlow;

  const activeFlowType =
    task?.phases?.length
      ? task.phases[task.currentPhaseIndex ?? 0].taskType
      : task?.taskType || '';

  const colors = getAgentColors(activeFlowType);
  const agentConfig = getAgent(activeFlowType);

  const addMessage = useCallback((text: string, type: AgentMessage['type'] = 'agent') => {
    const id = `msg-${++msgIdRef.current}`;
    setMessages(prev => [...prev, { id, text, type, timestamp: Date.now() }]);
    setIsTyping(true);
    return id;
  }, []);

  const scrollToBottom = useCallback(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (!task?.phases || task.currentPhaseIndex === undefined) return;
    if (prevPhaseIndexRef.current !== undefined && task.currentPhaseIndex > prevPhaseIndexRef.current) {
      setShowPhaseTransition(true);
      addMessage(t('sf_phase_complete_msg', { prev: task.phases[prevPhaseIndexRef.current]?.label, next: task.phases[task.currentPhaseIndex]?.label }));
    }
    prevPhaseIndexRef.current = task.currentPhaseIndex;
  }, [task?.currentPhaseIndex, task?.phases]);

  const prevStateRef = useRef('');
  useEffect(() => {
    if (!task || !hasStartedFlow) return;
    const bareStep = (activeStep?.step || '').replace(/^phase\d+_/, '');
    const stateKey = `${task.agentState}:${bareStep}`;
    if (stateKey === prevStateRef.current) return;
    prevStateRef.current = stateKey;
    const isUserState = task.agentState === 'needs_user';
    const msg = isUserState ? USER_MESSAGES[bareStep] : null;
    if (msg) addMessage(msg);
  }, [task?.agentState, task?.plan, hasStartedFlow]);

  useEffect(() => {
    if (!task) navigate('/', { replace: true });
  }, [task, navigate]);

  const lastToastKey = React.useRef<string>('');
  useEffect(() => {
    if (!task) return;
    const activeIdx = task.plan.findIndex((p: any) => p.status === 'active');
    const step = task.plan[activeIdx];
    const key = `${task.agentState}:${step?.step || ''}`;
    if (key === lastToastKey.current) return;
    lastToastKey.current = key;
    if (task.agentState === 'needs_user' && step?.step === 'check_eligibility') {
      toast.dismiss(); toast(t('sf_toast_security_check'), { id: 'step_toast', duration: 3000, icon: '🔐' });
    } else if (task.agentState === 'needs_user' && step?.step === 'review_claim') {
      toast.dismiss(); toast(t('sf_toast_required_info'), { id: 'step_toast', duration: 3000, icon: '📋' });
    } else if (task.agentState === 'sensitive_action') {
      toast.dismiss(); toast(t('sf_toast_final_step'), { id: 'step_toast', duration: 3000, icon: '🔒' });
    }
  }, [task?.agentState, task?.plan]);

  const [otpTimer, setOtpTimer] = useState(60);
  const [sessionTimer, setSessionTimer] = useState(600);
  useEffect(() => {
    let interval: any;
    if (task?.agentState === 'sensitive_action') {
      interval = setInterval(() => {
        setOtpTimer(p => (p > 0 ? p - 1 : 0));
        setSessionTimer(p => (p > 0 ? p - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [task?.agentState]);

  if (!task) return null;

  const currentStepIndex = task.plan.findIndex((p: any) => p.status === 'active');
  const activeStep = task.plan[currentStepIndex];
  const isDone = task.agentState === 'completed';
  const isPendingEmployer = task.agentState === 'pending_employer';

  const proceedToNextStep = () => {
    const isLastStepOfPlan = currentStepIndex === task.plan.length - 1;
    const isCompoundFlow = task.phases && task.phases.length > 1;

    if (isLastStepOfPlan) {
      const bareStep = activeStep.step.replace(/^phase\d+_/, '');
      const empFlow = EMPLOYER_APPROVAL_FLOWS[bareStep];
      const currentFlowType = isCompoundFlow
        ? task.phases![task.currentPhaseIndex!].taskType
        : task.taskType;

      // Employer approval only fires for standalone single-phase flows.
      // Compound flows always complete cleanly on the last step.
      if (!isCompoundFlow && empFlow && currentFlowType === empFlow) {
        checkpointTask(task.taskId, activeStep.step, '');
        updateTaskState(task.taskId, {
          agentState: 'pending_employer',
          employerApproval: {
            submittedAt: Date.now(), slaDays: 5,
            employerName: 'TCS (Tata Consultancy Services)',
            escalated: false, taskReference: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          },
        });
      } else {
        checkpointTask(task.taskId, activeStep.step, '');
        updateTaskState(task.taskId, { agentState: 'completed' });
        setFlowEndTime(Date.now());
      }
    } else {
      const nextStep = task.plan[currentStepIndex + 1].step;
      const currentPhaseMatch = activeStep.step.match(/^phase(\d+)_/);
      const nextPhaseMatch = nextStep.match(/^phase(\d+)_/);

      const isPhaseTransition = isCompoundFlow && currentPhaseMatch && nextPhaseMatch && currentPhaseMatch[1] !== nextPhaseMatch[1];

      if (isPhaseTransition) {
        // FIX: pass nextStep (not '') so currentCheckpoint stays valid after transition
        checkpointTask(task.taskId, activeStep.step, nextStep);
        completeCurrentPhase(task.taskId);

        const bareStep = nextStep.replace(/^phase\d+_/, '');
        let nextState = 'planned';
        if (NEEDS_USER_STEPS.has(bareStep)) nextState = 'needs_user';
        else if (SENSITIVE_STEPS.has(bareStep)) nextState = 'sensitive_action';
        updateTaskState(task.taskId, { agentState: nextState as any });
      } else {
        const bareStep = nextStep.replace(/^phase\d+_/, '');
        let nextState = 'planned';
        if (NEEDS_USER_STEPS.has(bareStep)) nextState = 'needs_user';
        else if (SENSITIVE_STEPS.has(bareStep)) nextState = 'sensitive_action';
        checkpointTask(task.taskId, activeStep.step, nextStep);
        updateTaskState(task.taskId, { agentState: nextState as any });
      }
    }
  };

  const handleAgentAction = () => {
    updateTaskState(task.taskId, { agentState: 'in_progress' });
    setTimeout(proceedToNextStep, 1500);
  };

  const handleUserProvideDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep?.step === 'check_eligibility' && bankDigits !== '1234') { alert(t('sf_invalid_digits')); return; }
    proceedToNextStep();
  };

  const handleSensitiveAction = async () => {
    const success = await stepUpAuth(otpInput || '1234');
    if (success) { setAuthError(false); proceedToNextStep(); } else { setAuthError(true); }
  };

  const handleFinish = () => { archiveTask(task.taskId); navigate('/'); };

  const handleStartFlow = () => {
    setHasStartedFlow(true);
    setFlowStartTime(Date.now());
    updateTaskState(task.taskId, { agentState: 'in_progress' });
    if (task.phases && task.currentPhaseIndex !== undefined) {
      addMessage(t('sf_analyzed_phases', { intent: task.intent, count: task.phases.length, phases: task.phases.map(p => p.label).join(' → '), first: task.phases[0].label }));
    } else {
      addMessage(t('sf_analyzed_plan', { intent: task.intent, count: task.plan.length }));
    }
    setTimeout(() => {
      const step = task.plan[currentStepIndex];
      if (NEEDS_USER_STEPS.has(step?.step)) updateTaskState(task.taskId, { agentState: 'needs_user' });
      else proceedToNextStep();
    }, 1500);
  };

  const handleRefineIntent = async () => {
    const query = refineInput.trim();
    if (!query) return;
    setIsRefining(true);
    
    try {
      const { analyzeIntentWithGroq } = await import('../../lib/llm');
      const result = await analyzeIntentWithGroq(query);

      if (result.matched) {
        const detectedFlows = result.flows;
        if (detectedFlows.length >= 2) {
          const { phases, combinedPlan } = buildMultiPhaseTask(detectedFlows);
          updateTaskState(task.taskId, { intent: query, taskType: 'multi_phase', plan: combinedPlan, phases, currentPhaseIndex: 0, currentStep: combinedPlan[0].step, completedSteps: [], agentState: 'planned' });
          toast.success(t('sf_detected_compound', { count: detectedFlows.length }), { duration: 3000 });
        } else {
          const taskType = detectedFlows[0];
          const plan = generatePlan(taskType);
          updateTaskState(task.taskId, { intent: query, taskType, plan, phases: undefined, currentPhaseIndex: undefined, currentStep: plan[0].step, completedSteps: [], agentState: 'planned' });
          toast.success(t('sf_updated_to', { type: taskType.replace(/_/g, ' ') }), { duration: 3000 });
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("no cant help use traditional flow");
    } finally {
      setIsRefining(false);
      setRefineInput('');
    }
  };

  const formatTimeTaken = () => {
    if (!flowStartTime || !flowEndTime) return t('sf_under_minute');
    const seconds = Math.floor((flowEndTime - flowStartTime) / 1000);
    return seconds < 60 ? `${seconds} seconds` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const goBackStep = () => {
    if (currentStepIndex === 0) return;
    const prev = task.plan[currentStepIndex - 1].step;
    updateTaskState(task.taskId, {
      plan: task.plan.map((p: any, i: number) => i === currentStepIndex ? { ...p, status: 'pending' } : i === currentStepIndex - 1 ? { ...p, status: 'active' } : p),
      completedSteps: task.completedSteps.filter((s: string) => s !== prev),
      currentStep: prev, agentState: 'planned',
    });
  };

  const bareStep = activeStep?.step?.replace(/^phase\d+_/, '') || '';
  const stepConfig = getStepConfig(activeFlowType, bareStep);
  const avatarState = (() => {
    if (!hasStartedFlow) return 'success';
    if (task.agentState === 'sensitive_action') return 'authenticating';
    if (task.agentState === 'needs_user') return stepConfig?.avatarState || 'speaking';
    if (task.agentState === 'in_progress') return stepConfig?.avatarState || 'processing';
    if (task.agentState === 'planned') return 'idle';
    return 'idle';
  })();

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-hidden relative'>
      {task.phases && showPhaseTransition && task.currentPhaseIndex !== undefined && (
        <PhaseTransition phases={task.phases} currentPhaseIndex={task.currentPhaseIndex} onDismiss={() => setShowPhaseTransition(false)} onProceed={handleAgentAction} primaryRgb={colors.primaryRgb} />
      )}

      {/* Header */}
      <div className='bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/80 z-10'>
        <div className='flex items-center'>
          <button onClick={() => navigate(-1)} aria-label={t('sf_back_to_dashboard')} className='p-1.5 -ml-1 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'>
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-base font-bold text-slate-900 ml-1.5 flex items-center gap-2'>
            <AssistantAvatar className='!w-6 !h-6 shadow-sm mr-1' ringColor={colors.ring} />
            {hasStartedFlow ? (task.phases && task.phases.length > 1 && task.currentPhaseIndex !== undefined ? task.phases[task.currentPhaseIndex]?.label || t('sf_executing_flow') : t('sf_executing_flow')) : t('sf_agent_workflow')}
          </h1>
        </div>
        <div className='flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] shadow-2xs select-none'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-[10px] text-slate-400 font-sans uppercase font-bold tracking-tight'>{t('sf_session')}:</span>
          <span className='font-bold text-slate-900 tracking-wider'>#{task.taskId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}</span>
        </div>
      </div>

      <div className='flex-1 flex flex-col p-6 pb-40 overflow-y-auto relative'>
        {isInitializing ? (
          <AgentSpawnAnimation
            colors={colors}
            initMessages={agentConfig?.initMessages || [t('sf_init_agent'), t('sf_init_processing'), t('sf_init_plan_ready')]}
            onComplete={() => setShowSpawn(false)}
          />
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className='w-full'>

            {/* OVERVIEW MODE */}
            {!hasStartedFlow && !isDone && !isPendingEmployer && (
              <>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-slate-900 mb-2 capitalize'>"{task.intent === 'I want to withdraw PF for medical emergency' ? t('home_faq_withdraw_title', task.intent) : t(task.intent, task.intent)}"</h2>
                  <div className='bg-white p-4 rounded-2xl border shadow-sm flex items-start gap-3 mt-4' style={{ borderColor: `rgba(${colors.primaryRgb}, 0.3)`, backgroundColor: `rgba(${colors.primaryRgb}, 0.03)` }}>
                    <AssistantAvatar state='success' className='!w-6 !h-6 shrink-0' />
                    <div className="flex-1">
                      <p className='font-medium text-slate-800 flex items-center justify-between'>
                        <span className={`capitalize ${colors.textPrimary}`}>{t('sf_plan_ready')}</span>
                      </p>
                      <p className='text-sm text-slate-600 mt-1'>{t('sf_plan_ready_desc')}</p>
                    </div>
                  </div>
                </div>
                <FlowInfoCard flowType={task.taskType} className='mb-4' />

                {/* Insights moved to external portal */}
                {document.getElementById('right-side-portal') && createPortal(
                  <>
                    {agentConfig?.rootCause && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className='p-5 rounded-3xl border border-amber-500/20 bg-slate-900 shadow-2xl'>
                        <p className='text-xs font-bold text-amber-500 uppercase tracking-wider mb-2'>⚠ Why this problem exists</p>
                        <p className='text-sm text-slate-300 leading-relaxed'>{agentConfig.rootCause}</p>
                      </motion.div>
                    )}

                    {(agentConfig?.apiIntegration || agentConfig?.scaleNote) && (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className='p-5 rounded-3xl border border-blue-500/20 bg-slate-900 shadow-2xl'>
                        <p className='text-xs font-bold text-blue-400 uppercase tracking-wider mb-3'>🔌 How this works at scale</p>
                        {agentConfig?.apiIntegration && (
                          <p className='text-sm text-slate-300 leading-relaxed mb-3'><span className='font-semibold text-slate-100'>APIs:</span> {agentConfig.apiIntegration}</p>
                        )}
                        {agentConfig?.scaleNote && (
                          <p className='text-sm text-slate-300 leading-relaxed'><span className='font-semibold text-slate-100'>Scale:</span> {agentConfig.scaleNote}</p>
                        )}
                      </motion.div>
                    )}
                  </>,
                  document.getElementById('right-side-portal')!
                )}

                {/* LLM Powered Disclosure */}
                <div className='mb-4 p-3 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-inner'>
                    <span className='text-lg'>⚡</span>
                  </div>
                  <div>
                    <p className='text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5 flex items-center gap-1.5'>
                      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse'></span>
                      AI Agent Active
                    </p>
                    <p className='text-[11px] text-emerald-800 font-medium'>Powered by <span className='font-mono font-bold bg-emerald-200/50 px-1 py-0.5 rounded border border-emerald-300'>openai/gpt-oss-20b</span></p>
                  </div>
                </div>

                <div className='space-y-3 relative ml-2'>
                  <div className='absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10' />
                  {task.phases ? (
                    task.phases.map((phase, phaseIdx) => {
                      const phaseSteps = task.plan.filter(s => s.step.startsWith(`phase${phaseIdx}_`));
                      return (
                        <div key={phase.id} className='mb-4'>
                          {task.phases!.length > 1 && (
                            <div className='flex items-center gap-2 mb-2 ml-10'>
                              <div className='w-2 h-2 rounded-full' style={{ backgroundColor: phase.status === 'completed' ? '#10b981' : phase.status === 'active' ? `rgb(${colors.primaryRgb})` : '#cbd5e1' }} />
                              <span className='text-xs font-bold text-slate-700 uppercase tracking-wider'>{t('sf_phase_label', { num: phaseIdx + 1 })}: {phase.label}</span>
                            </div>
                          )}
                          <div className='space-y-3 relative ml-2'>
                            {phaseSteps.map((step) => {
                              const globalIdx = task.plan.indexOf(step);
                              return (
                                <div key={step.step} className='relative pl-10'>
                                  <div className='absolute left-0 top-1.5 w-[30px] h-[30px] rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400'>
                                    {globalIdx + 1}
                                  </div>
                                  <div className='bg-white rounded-2xl p-4 border border-slate-200 shadow-sm'>
                                    <h3 className='font-bold text-slate-800'>{String(t(STEP_I18N_MAP[step.description] || step.description, step.description))}</h3>
                                    <p className='text-xs text-slate-500 mt-1'>{String(t(STEP_I18N_MAP[step.description] || step.description, step.description))}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    task.plan.map((step: any, idx: number) => (
                      <div key={idx} className='relative pl-10'>
                        <div className='absolute left-0 top-1.5 w-[30px] h-[30px] rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400'>
                          {idx + 1}
                        </div>
                        <div className='bg-white rounded-2xl p-4 border border-slate-200 shadow-sm'>
                          <h3 className='font-bold text-slate-800'>{String(t(STEP_I18N_MAP[step.title || step.description] || step.title || step.description, step.title || step.description))}</h3>
                          <p className='text-xs text-slate-500 mt-1'>{String(t(STEP_I18N_MAP[step.description] || step.description, step.description))}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Refine Intent */}
                <div className='mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/80 rounded-2xl'>
                  <p className='text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5'>
                    <Sparkles className='w-3.5 h-3.5 text-epfo-blue' />
                    {t('sf_refine_label')}
                  </p>
                  <div className='flex gap-2'>
                    <input type='text' value={refineInput} onChange={(e) => setRefineInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRefineIntent(); }}
                      placeholder={t('sf_refine_placeholder')}
                      className='flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-epfo-blue placeholder-slate-400'
                      disabled={isRefining} aria-label={t('sf_refine_request')} />
                    <button onClick={handleRefineIntent} disabled={!refineInput.trim() || isRefining}
                      className='px-3 py-2 bg-epfo-blue text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40'
                      aria-label={t('sf_parse_intent')}>
                      {isRefining ? t('sf_analyzing') : t('sf_parse')}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* EXECUTION MODE */}
            {hasStartedFlow && !isDone && !isPendingEmployer && (
              <>
                {/* Step progress */}
                <div className='flex items-center justify-between mb-4 pb-3 border-b border-slate-100'>
                  <button onClick={goBackStep} disabled={currentStepIndex === 0}
                    className='flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-epfo-blue transition-colors disabled:opacity-30'>
                    <ArrowLeft className='w-4 h-4' /> {t('sf_back')}
                  </button>
                  <div className='flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full'>
                    {task.phases && task.currentPhaseIndex != null && (() => {
                      const idx = task.currentPhaseIndex!;
                      return (
                        <div className='flex items-center gap-1 mr-3 border-r border-slate-300 pr-3'>
                          {task.phases!.map((phase: Phase, i: number) => (
                            <div key={phase.id} className='flex items-center gap-1'>
                              <div className='w-2.5 h-2.5 rounded-full transition-all' style={{
                                backgroundColor: i < idx ? '#10b981' : i === idx ? `rgb(${colors.primaryRgb})` : '#cbd5e1',
                                boxShadow: i === idx ? `0 0 0 4px rgba(${colors.primaryRgb}, 0.2)` : undefined,
                                transform: i === idx ? 'scale(1.1)' : undefined,
                              }} title={phase.label} />
                              {i < task.phases!.length - 1 && <div className={`w-2 h-0.5 ${i < idx ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                            </div>
                          ))}
                          <span className='text-[10px] font-bold ml-1.5 uppercase tracking-wider' style={{ color: `rgb(${colors.primaryRgb})` }}>
                            {task.phases![idx]?.label}
                          </span>
                        </div>
                      );
                    })()}
                    <div className='flex gap-1.5 mr-2'>
                      {task.plan.map((_: any, i: number) => (
                        <div key={i} className='w-2 h-2 rounded-full' style={{
                          backgroundColor: i === currentStepIndex ? `rgb(${colors.primaryRgb})` : i < currentStepIndex ? '#10b981' : '#cbd5e1',
                          boxShadow: i === currentStepIndex ? `0 0 0 3px rgba(${colors.primaryRgb}, 0.2)` : undefined,
                        }} />
                      ))}
                    </div>
                    <span className='text-xs font-bold text-slate-700 tracking-wide uppercase'>
                      {t('sf_step_of_total', { current: currentStepIndex + 1, total: task.plan.length })}
                    </span>
                  </div>
                  <div className='w-[60px]' />
                </div>

                {/* Chat messages */}
                <div className='space-y-3 mb-4' role="log" aria-label={t('sf_chat_messages')} aria-live="polite">
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}
                        className={`flex items-start gap-2.5 ${msg.type === 'agent' ? '' : 'flex-row-reverse'}`}>
                        {msg.type === 'agent' && (
                          <div className='w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5' style={{ backgroundColor: `rgba(${colors.primaryRgb}, 0.1)` }}>
                            <AssistantAvatar state='speaking' className='!w-5 !h-5' />
                          </div>
                        )}
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.type === 'agent' ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm' : 'text-white rounded-tr-md'
                        }`} style={msg.type !== 'agent' ? { backgroundColor: `rgb(${colors.primaryRgb})` } : undefined}>
                          <TypewriterText text={msg.text} speed={18} onComplete={() => setIsTyping(false)} />
                          {msg.type === 'agent' && idx === 0 && (
                            <div className='mt-2 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider inline-flex items-center gap-1 border border-blue-200 shadow-sm'>
                              <div className='w-1 h-1 rounded-full bg-green-500 animate-pulse'></div>
                              Powered by live Groq API
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isTyping && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className='flex items-start gap-2.5'>
                      <div className='w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5' style={{ backgroundColor: `rgba(${colors.primaryRgb}, 0.1)` }}>
                        <AssistantAvatar state='thinking' className='!w-5 !h-5' />
                      </div>
                      <div className='bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm'>
<ThinkingAnimation color={`rgb(${colors.primaryRgb})`} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Active step card */}
                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={currentStepIndex}
                  className='bg-white p-5 rounded-2xl border mb-6'
                  style={{
                    borderColor: task.agentState === 'needs_user' || task.agentState === 'sensitive_action' ? `rgb(${colors.primaryRgb})` : '#e2e8f0',
                    boxShadow: task.agentState === 'needs_user' || task.agentState === 'sensitive_action' ? `0 4px 12px rgba(${colors.primaryRgb}, 0.08), 0 0 0 4px rgba(${colors.primaryRgb}, 0.05)` : '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `rgba(${colors.primaryRgb}, 0.1)` }}>
                      <AssistantAvatar state={avatarState} className='!w-5 !h-5' />
                    </div>
                    <div className="flex-1">
                      <h3 className='font-bold text-slate-900 text-base flex items-center justify-between'>
                        {activeStep?.description}
                        {task.agentState === 'in_progress' && <ThinkingAnimation color={`rgb(${colors.primaryRgb})`} />}
                      </h3>
                      {task.agentState === 'planned' && <p className='text-xs text-slate-500 mt-1'>{t('sf_ready_to_execute')}</p>}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <StepForms
                      stepName={bareStep}
                      agentState={task.agentState}
                      bankDigits={bankDigits} purpose={purpose} amount={amount} otpInput={otpInput}
                      authError={authError} otpTimer={otpTimer} sessionTimer={sessionTimer}
                      grievanceType={grievanceType} employerName={employerName}
                      onBankDigitsChange={setBankDigits} onPurposeChange={setPurpose} onAmountChange={setAmount}
                      onOtpInputChange={setOtpInput} onGrievanceTypeChange={setGrievanceType} onEmployerNameChange={setEmployerName}
                      onSubmitDetails={handleUserProvideDetails} onSensitiveAction={handleSensitiveAction}
                      onScanFace={() => { toast.success(t('sf_face_matched')); proceedToNextStep(); }}
                      onProceed={proceedToNextStep}
                      onGrievanceSubmit={(e) => { e.preventDefault(); updateTaskState(task.taskId, { grievanceType }); proceedToNextStep(); }}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {isPendingEmployer && task.employerApproval && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mt-8 space-y-4'>
            <EmployerApprovalStatus employerApproval={task.employerApproval} taskId={task.taskId} />
          </motion.div>
        )}

        {isDone && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mt-8 space-y-4'>
            <div className='bg-green-50 border border-green-200 p-6 rounded-2xl flex items-start gap-4'>
              <div className='bg-green-100 p-2 rounded-full shrink-0'>
                <CheckCircle2 className='w-8 h-8 text-green-600' />
              </div>
              <div>
                <h3 className='font-bold text-green-900 text-lg'>{t('sf_all_steps_completed')}</h3>
                <p className='text-green-800 text-sm mt-1'>{t('sf_all_steps_completed_desc')}</p>
              </div>
            </div>

            {!isFeedbackSubmitted ? (
              <div className='bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden'>
                <div className='px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between'>
                  <span className='text-xs font-medium text-slate-500'>{t('sf_process_time')}</span>
                  <span className='text-xs font-bold text-epfo-blue bg-white px-2 py-0.5 rounded-md border border-slate-200'>{formatTimeTaken()}</span>
                </div>
                <div className='p-5 space-y-4'>
                  <div>
                    <h4 className='font-bold text-slate-800 mb-1'>{t('sf_how_was_experience')}</h4>
                    <p className='text-xs text-slate-400 mb-3'>{t('sf_tap_star_to_rate')}</p>
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}>
                          <Star className='w-9 h-9 fill-current' />
                        </button>
                      ))}
                    </div>
                  </div>
                  {rating > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className='space-y-3 overflow-hidden'>
                      <textarea placeholder={t('sf_feedback_placeholder')} className='w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-epfo-blue resize-none' rows={2} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                      <div className='flex items-start gap-2'>
                        <input type='checkbox' id='consent' checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} className='mt-1 shrink-0' />
                        <label htmlFor='consent' className='text-[11px] text-slate-400 leading-tight'>{t('sf_consent_label')}</label>
                      </div>
                    </motion.div>
                  )}
                  <Button onClick={() => { setIsFeedbackSubmitted(true); toast.success(t('sf_feedback_thanks')); }}
                    className='w-full bg-slate-900 text-white hover:bg-slate-800' disabled={rating === 0}>
                    {rating === 0 ? t('sf_rate_to_submit') : t('sf_submit_feedback')}
                  </Button>
                  {rating === 0 && (
                    <p className='text-center text-[11px] text-slate-400'>{t('sf_or')} <button className='underline font-medium' onClick={() => setIsFeedbackSubmitted(true)}>{t('sf_skip_feedback')}</button></p>
                  )}
                </div>
              </div>
            ) : (
              <div className='bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-inner'>
                <AssistantAvatar state='thank_you' className='!w-12 !h-12 mb-2 shadow-md' />
                <p className='font-bold text-blue-900 text-lg'>{t('sf_thank_you')}</p>
                <p className='text-sm text-blue-700'>{t('sf_feedback_recorded')}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom buttons */}
      {(!isInitializing && !isDone && !hasStartedFlow && task.agentState === 'planned') && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleStartFlow} aria-label={t('sf_start_workflow')}>{t('sf_start_flow')}</Button>
        </div>
      )}
      {(!isInitializing && !isDone && hasStartedFlow && task.agentState === 'planned') && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleAgentAction} aria-label={t('sf_execute_next_step')}>{t('sf_execute_next_step_label')}</Button>
        </div>
      )}
      {isDone && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleFinish} aria-label={t('sf_back_to_dashboard')}>{t('sf_return_to_dashboard')}</Button>
        </div>
      )}
      {isPendingEmployer && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={() => navigate('/')} aria-label={t('sf_back_to_dashboard')}>{t('sf_return_to_dashboard')}</Button>
        </div>
      )}
    </div>
  );
};


