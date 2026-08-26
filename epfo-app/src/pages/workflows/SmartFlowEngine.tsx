import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldAlert, CheckCircle2, Lock, CreditCard, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FlowInfoCard } from '../../components/ui/FlowInfoCard';
import { ThinkingAnimation } from '../../components/ui/ThinkingAnimation';
import { TypewriterText } from '../../components/ui/TypewriterText';
import { Input } from '../../components/ui/Input';
import { OtpFallbackOptions } from '../../components/ui/OtpFallbackOptions';
import { EmployerApprovalStatus } from '../../components/ui/EmployerApprovalStatus';

import { useWorkflowStore } from '../../store/useWorkflowStore';
import type { Phase } from '../../store/useWorkflowStore';
import { PhaseTransition } from '../../components/ui/PhaseTransition';
import { useSessionStore } from '../../store/useSessionStore';
import toast from 'react-hot-toast';
import { AssistantAvatar } from '../../components/ui/AssistantAvatar';

interface AgentMessage {
  id: string;
  text: string;
  type: 'agent' | 'system';
  timestamp: number;
}

export const SmartFlowEngine: React.FC = () => {
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

  const [isInitializing, setIsInitializing] = useState(() => {
    // Only initialize if we are at the very start of the workflow
    return task?.agentState === 'planned' && task?.plan[0]?.status === 'active';
  });
  const [initStage, setInitStage] = useState(0);
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

  const addMessage = useCallback((text: string, type: AgentMessage['type'] = 'agent') => {
    const id = `msg-${++msgIdRef.current}`;
    setMessages(prev => [...prev, { id, text, type, timestamp: Date.now() }]);
    setIsTyping(true);
    return id;
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // Detect phase transitions
  useEffect(() => {
    if (!task?.phases || task.currentPhaseIndex === undefined) return;
    if (prevPhaseIndexRef.current !== undefined && task.currentPhaseIndex > prevPhaseIndexRef.current) {
      setShowPhaseTransition(true);
      const completedLabel = task.phases[prevPhaseIndexRef.current]?.label || '';
      const nextLabel = task.phases[task.currentPhaseIndex]?.label || '';
      addMessage(`Phase complete: "${completedLabel}". Moving to "${nextLabel}".`);
    }
    prevPhaseIndexRef.current = task.currentPhaseIndex;
  }, [task?.currentPhaseIndex, task?.phases]);

  // Chat: push agent messages on state transitions
  const prevStateRef = useRef('');
  useEffect(() => {
    if (!task || !hasStartedFlow) return;
    const stateKey = `${task.agentState}:${activeStep?.step || ''}`;
    if (stateKey === prevStateRef.current) return;
    prevStateRef.current = stateKey;

    const ctxMsg = getStepContextMessage(activeStep?.step || '', task.agentState);
    if (ctxMsg) {
      addMessage(ctxMsg);
    }
  }, [task?.agentState, task?.plan, hasStartedFlow]);

  const initMessages = [
    "Tracking User Request...",
    "Checking Available Routes...",
    "Generating Steps...",
    "Completed Step Generation.",
    "Starting Session..."
  ];

  useEffect(() => {
    if (!isInitializing) return;
    
    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage += 1;
      if (currentStage < initMessages.length) {
        setInitStage(currentStage);
      } else {
        clearInterval(interval);
        setIsInitializing(false);
      }
    }, 1200); // 1200ms per stage * 5 stages = 6 seconds total

    return () => clearInterval(interval);
  }, [isInitializing]);

  useEffect(() => {
    if (!task) {
      navigate('/', { replace: true });
    }
  }, [task, navigate]);

  const lastToastKey = React.useRef<string>('');
  useEffect(() => {
    if (!task) return;
    
    const currentStepIndex = task.plan.findIndex((p: any) => p.status === 'active');
    const activeStep = task.plan[currentStepIndex];
    const toastKey = `${task.agentState}:${activeStep?.step || ''}`;

    if (toastKey === lastToastKey.current) return;
    lastToastKey.current = toastKey;

    if (task.agentState === 'needs_user' && activeStep?.step === 'check_eligibility') {
      toast.dismiss();
      toast('Security Check: We need to verify it is you before checking your PF balance.', { id: 'step_toast', duration: 3000, icon: '🔐' });
    } else if (task.agentState === 'needs_user' && activeStep?.step === 'review_claim') {
      toast.dismiss();
      toast('Required Info: The government needs to know why you are withdrawing funds.', { id: 'step_toast', duration: 3000, icon: '📋' });
    } else if (task.agentState === 'sensitive_action') {
      toast.dismiss();
      toast('Final Step: Authorize this action with an OTP to proceed.', { id: 'step_toast', duration: 3000, icon: '🔒' });
    }
  }, [task?.agentState, task?.plan]);

  const [otpTimer, setOtpTimer] = useState(60);
  const [sessionTimer, setSessionTimer] = useState(600); // 10 minutes

  useEffect(() => {
    let interval: any;
    if (task?.agentState === 'sensitive_action') {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setSessionTimer((prev) => (prev > 0 ? prev - 1 : 0));
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
    if (currentStepIndex === task.plan.length - 1) {
      // For withdraw_pf and kyc_mismatch, enter employer approval state instead of completing
      const isEmployerApprovalFlow = 
        (task.taskType === 'withdraw_pf' && activeStep.step === 'submit_claim') ||
        (task.taskType === 'kyc_mismatch' && activeStep.step === 'submit_declaration');
      
      if (isEmployerApprovalFlow) {
        checkpointTask(task.taskId, activeStep.step, '');
        updateTaskState(task.taskId, {
          agentState: 'pending_employer',
          employerApproval: {
            submittedAt: Date.now(),
            slaDays: 5,
            employerName: 'TCS (Tata Consultancy Services)',
            escalated: false,
            taskReference: `TKT-${Math.floor(1000 + Math.random() * 9000)}`
          }
        });
      } else if (task.phases && task.currentPhaseIndex !== undefined && task.currentPhaseIndex < task.phases.length - 1) {
        // Multi-phase: complete current phase and transition to next
        checkpointTask(task.taskId, activeStep.step, '');
        completeCurrentPhase(task.taskId);
      } else {
        checkpointTask(task.taskId, activeStep.step, '');
        updateTaskState(task.taskId, { agentState: 'completed' });
        setFlowEndTime(Date.now());
      }
    } else {
      const nextStep = task.plan[currentStepIndex + 1].step;
      let agentNextState = 'planned';

      // Map steps to required user interaction
      switch (nextStep) {
        case 'check_eligibility':
        case 'review_claim':
        case 'capture_face':
        case 'select_exit_reason':
        case 'register_grievance':
        case 'generate_reference':
        case 'analyze_passbook':
        case 'analyze_mismatch':
        case 'draft_declaration':
        case 'fetch_linked_accounts':
        case 'select_accounts_to_merge':
        case 'select_grievance_type':
          agentNextState = 'needs_user';
          break;
        case 'submit_claim':
        case 'submit_transfer':
        case 'submit_certificate':
        case 'submit_exit':
        case 'submit_declaration':
        case 'submit_merge_request':
          agentNextState = 'sensitive_action';
          break;
        default:
          agentNextState = 'planned';
      }

      checkpointTask(task.taskId, activeStep.step, nextStep);
      updateTaskState(task.taskId, { agentState: agentNextState as any });
    }
  };

  const handleAgentAction = () => {
    updateTaskState(task.taskId, { agentState: 'in_progress' });
    setTimeout(() => {
      proceedToNextStep();
    }, 1500);
  };

  const handleUserProvideDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep?.step === 'check_eligibility' && bankDigits !== '1234') {
      alert('Invalid digits. Use 1234.');
      return;
    }
    proceedToNextStep();
  };

  const handleSensitiveAction = async () => {
    const success = await stepUpAuth(otpInput || '1234');
    if (success) {
      setAuthError(false);
      proceedToNextStep();
    } else {
      setAuthError(true);
    }
  };

  const handleFinish = () => {
    archiveTask(task.taskId);
    navigate('/');
  };

  const handleStartFlow = () => {
    setHasStartedFlow(true);
    setFlowStartTime(Date.now());
    updateTaskState(task.taskId, { agentState: 'in_progress' });
    
    // Add opening agent message
    if (task.phases && task.currentPhaseIndex !== undefined) {
      const phaseLabels = task.phases.map(p => p.label).join(' → ');
      addMessage(`I've analyzed your request: "${task.intent}". This is a ${task.phases.length}-phase workflow: ${phaseLabels}. I'll guide you through each phase step by step. Starting with "${task.phases[0].label}".`);
    } else {
      addMessage(`I've analyzed your request: "${task.intent}". I've prepared a ${task.plan.length}-step plan. Let me walk you through each step.`);
    }

    // Auto-advance the first step if it's agent action
    setTimeout(() => {
      const activeStep = task.plan[currentStepIndex];
      if (activeStep?.step === 'check_eligibility' || activeStep?.step === 'review_claim') {
        updateTaskState(task.taskId, { agentState: 'needs_user' });
      } else {
        proceedToNextStep();
      }
    }, 1500);
  };

  const formatTimeTaken = () => {
    if (!flowStartTime || !flowEndTime) return "under a minute";
    const seconds = Math.floor((flowEndTime - flowStartTime) / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  
  const goBackStep = () => {
    if (currentStepIndex === 0) return;
    
    const previousStep = task.plan[currentStepIndex - 1].step;
    
    const updatedPlan = task.plan.map((p: any, idx: number) => {
      if (idx === currentStepIndex) return { ...p, status: 'pending' };
      if (idx === currentStepIndex - 1) return { ...p, status: 'active' };
      return p;
    });

    const updatedCompletedSteps = task.completedSteps.filter((s: string) => s !== previousStep);

    updateTaskState(task.taskId, { 
      plan: updatedPlan, 
      completedSteps: updatedCompletedSteps,
      currentStep: previousStep,
      agentState: 'planned'
    });
  };



  // Generate step-specific contextual messages for the chat
  const getStepContextMessage = (stepName: string, state: string): string | null => {
    if (state === 'in_progress') {
      switch (stepName) {
        case 'check_eligibility': return "Let me verify your bank account linkage and KYC status first.";
        case 'verify_uan': return "Cross-checking your UAN with Aadhaar records.";
        case 'check_exit_eligibility': return "Checking if you've completed 60+ days since last contribution.";
        case 'fetch_documents': return "Pulling your Aadhaar and bank documents from the secure vault.";
        case 'kyc_check': return "Comparing your EPFO records against Aadhaar data for mismatches.";
        case 'gather_documents': return "Collecting all required documents for this process.";
        case 'fetch_pension_details': return "Retrieving your PPO number and pension account status.";
        case 'analyze_issue': return "Analyzing the rejection reason and available remedies.";
        case 'prepare_claim': return "Drafting your claim application with the correct form type.";
        case 'prepare_exit_declaration': return "Preparing the self-declaration for your exit date.";
        case 'submit_claim': return "Filing your claim with EPFO. This requires Aadhaar authentication.";
        case 'submit_transfer': return "Initiating the inter-account transfer request.";
        case 'submit_exit': return "Submitting your exit date declaration to EPFO records.";
        case 'submit_certificate': return "Digitally signing and submitting your life certificate.";
        default: return null;
      }
    }
    if (state === 'needs_user') {
      switch (stepName) {
        case 'check_eligibility': return "I need you to verify the last 4 digits of your bank account. This confirms the account linked to your UAN matches your records.";
        case 'review_claim': return "Your Aadhaar is linked and KYC is verified. Please select the withdrawal type and amount.";
        case 'capture_face': return "Position your face within the frame. The camera will match against your Aadhaar photo.";
        case 'select_exit_reason': return "Select the reason that best describes why you left this employer.";
        case 'analyze_passbook': return "Here's your full contribution history. I've highlighted the key numbers.";
        case 'fetch_linked_accounts': return "I discovered duplicate UANs under your Aadhaar. Let me show you the details.";
        case 'select_accounts_to_merge': return "Please confirm which inactive account balance should transfer to your active UAN.";
        case 'select_grievance_type': return "Categorizing your grievance helps route it to the right department with the correct SLA.";
        case 'register_grievance': return "Describe your issue in detail. The more specific you are, the faster the resolution.";
        case 'generate_reference': return "Your grievance has been filed. Save this ticket number for tracking.";
        default: return null;
      }
    }
    if (state === 'sensitive_action') return "This is a secure action. Please authenticate with your Aadhaar OTP to proceed.";
    return null;
  };

  // Maps active step + workflow state → specific avatar animation
  const getAvatarState = (): any => {
    if (!hasStartedFlow) return 'success';
    const step = activeStep?.step;
    if (task.agentState === 'sensitive_action') return 'authenticating';
    if (task.agentState === 'needs_user') {
      if (step === 'check_eligibility') return 'checking';
      if (step === 'review_claim' || step === 'register_grievance' || step === 'analyze_passbook') return 'reviewing';
      if (step === 'capture_face') return 'fetching';
      if (step === 'select_exit_reason') return 'speaking';
      return 'speaking';
    }
    if (task.agentState === 'in_progress') {
      if (step === 'check_eligibility' || step === 'verify_uan' || step === 'check_exit_eligibility') return 'checking';
      if (step === 'fetch_documents' || step === 'kyc_check' || step === 'gather_documents') return 'fetching';
      if (step === 'fetch_pension_details' || step === 'analyze_issue') return 'reading';
      if (step === 'review_claim' || step === 'prepare_claim' || step === 'prepare_exit_declaration') return 'generating';
      if (step === 'submit_claim' || step === 'submit_transfer' || step === 'submit_certificate' || step === 'submit_exit' || step === 'submit_grievance') return 'processing';
      return 'processing';
    }
    if (task.agentState === 'planned') return 'idle';
    return 'idle';
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-hidden relative'>
      
      {/* Phase transition overlay */}
      {task.phases && showPhaseTransition && task.currentPhaseIndex !== undefined && (
        <PhaseTransition
          phases={task.phases}
          currentPhaseIndex={task.currentPhaseIndex}
          onDismiss={() => setShowPhaseTransition(false)}
        />
      )}
      
      <div className='bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/80 z-10'>
        <div className='flex items-center'>
          <button onClick={() => navigate(-1)} className='p-1.5 -ml-1 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'>
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-base font-bold text-slate-900 ml-1.5 flex items-center gap-2'>
            <AssistantAvatar className='!w-6 !h-6 shadow-sm mr-1' />
            {hasStartedFlow
              ? (task.phases && task.currentPhaseIndex !== undefined
                  ? task.phases[task.currentPhaseIndex]?.label || 'Executing Flow'
                  : 'Executing Flow')
              : 'Agent Workflow'}
          </h1>
        </div>

        {/* Live Session ID Badge */}
        <div className='flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] shadow-2xs select-none'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-[10px] text-slate-400 font-sans uppercase font-bold tracking-tight'>SESSION:</span>
          <span className='font-bold text-slate-900 tracking-wider'>#{task.taskId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()}</span>
        </div>
      </div>

      <div className='flex-1 flex flex-col p-6 pb-40 overflow-y-auto relative'>
        {isInitializing ? (
          <div className='flex-1 flex flex-col items-center justify-center -mt-20'>
            <div className='w-24 h-24 relative flex items-center justify-center mb-8'>
              <motion.div className='absolute inset-0 border-4 border-epfo-blue/20 rounded-full' />
              <motion.div 
                className='absolute inset-0 border-4 border-epfo-blue border-t-transparent rounded-full'
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              <AssistantAvatar 
                state={initStage < 2 ? 'reading' : initStage === 2 ? 'generating' : initStage === 3 ? 'success' : 'processing'} 
                className='!w-12 !h-12 shadow-xl ring-4 ring-blue-50' 
              />
            </div>
            <motion.div 
              key={initStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='text-lg font-semibold text-slate-800 text-center px-6'
            >
              {initMessages[initStage]}
            </motion.div>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className='w-full'>
            
            {/* OVERVIEW MODE */}
            {!hasStartedFlow && !isDone && !isPendingEmployer && (
              <>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-slate-900 mb-2 capitalize'>"{task.intent}"</h2>
                  <div className={`bg-white p-4 rounded-2xl border border-epfo-blue bg-blue-50/30 shadow-sm flex items-start gap-3 mt-4`}>
                    <AssistantAvatar state='success' className={`!w-6 !h-6 shrink-0 text-epfo-blue`} />
                    <div className="flex-1">
                      <p className='font-medium text-slate-800 flex items-center justify-between'>
                        <span className='capitalize text-epfo-blue'>Plan Ready</span>
                      </p>
                      <p className='text-sm text-slate-600 mt-1'>I've generated a secure step-by-step plan for your request. Review the overview below and start when ready.</p>
                    </div>
                  </div>
                </div>

                <FlowInfoCard flowType={task.taskType} className='mb-4' />

                <div className='space-y-3 relative ml-2'>
                  <div className='absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10' />
                  {task.phases ? (
                    // Multi-phase: group steps by phase
                    task.phases.map((phase, phaseIdx) => {
                      const phaseSteps = task.plan.filter(s => s.step.startsWith(`phase${phaseIdx}_`));
                      return (
                        <div key={phase.id} className='mb-4'>
                          {task.phases!.length > 1 && (
                            <div className='flex items-center gap-2 mb-2 ml-10'>
                              <div className={`w-2 h-2 rounded-full ${phase.status === 'completed' ? 'bg-emerald-500' : phase.status === 'active' ? 'bg-epfo-blue' : 'bg-slate-300'}`} />
                              <span className='text-xs font-bold text-slate-700 uppercase tracking-wider'>Phase {phaseIdx + 1}: {phase.label}</span>
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
                                    <h3 className='font-bold text-slate-800'>{step.description}</h3>
                                    <p className='text-xs text-slate-500 mt-1'>{step.description}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Single task: flat step list
                    task.plan.map((step: any, idx: number) => (
                      <div key={idx} className='relative pl-10'>
                         <div className='absolute left-0 top-1.5 w-[30px] h-[30px] rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400'>
                           {idx + 1}
                         </div>
                         <div className='bg-white rounded-2xl p-4 border border-slate-200 shadow-sm'>
                           <h3 className='font-bold text-slate-800'>{step.title || step.description}</h3>
                           <p className='text-xs text-slate-500 mt-1'>{step.description}</p>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* EXECUTION MODE */}
            {hasStartedFlow && !isDone && !isPendingEmployer && (
              <>
                <div className='flex items-center justify-between mb-4 pb-3 border-b border-slate-100'>
                  <button 
                    onClick={goBackStep} 
                    disabled={currentStepIndex === 0} 
                    className='flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-epfo-blue transition-colors disabled:opacity-30 disabled:hover:text-slate-500'
                  >
                    <ArrowLeft className='w-4 h-4' /> Back
                  </button>
                  
                  <div className='flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full'>
                    {/* Phase progress bar (for multi-phase tasks) */}
                    {task.phases && task.currentPhaseIndex != null && (() => {
                      const phaseIdx = task.currentPhaseIndex!;
                      const phasesArr = task.phases!;
                      return (
                      <div className='flex items-center gap-1 mr-3 border-r border-slate-300 pr-3'>
                        {phasesArr.map((phase: Phase, i: number) => (
                          <div key={phase.id} className='flex items-center gap-1'>
                            <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                              i < phaseIdx ? 'bg-emerald-500' :
                              i === phaseIdx ? 'bg-epfo-blue ring-2 ring-blue-100 scale-110' :
                              'bg-slate-300'
                            }`} title={phase.label} />
                            {i < phasesArr.length - 1 && (
                              <div className={`w-2 h-0.5 ${i < phaseIdx ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                            )}
                          </div>
                        ))}
                        <span className='text-[10px] font-bold text-epfo-blue ml-1.5 uppercase tracking-wider'>
                          {phasesArr[phaseIdx]?.label}
                        </span>
                      </div>
                      );
                    })()}
                    <div className='flex gap-1.5 mr-2'>
                      {task.plan.map((_: any, i: number) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i === currentStepIndex ? 'bg-epfo-blue ring-2 ring-blue-100' : i < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      ))}
                    </div>
                    <span className='text-xs font-bold text-slate-700 tracking-wide uppercase'>
                      Step {currentStepIndex + 1} of {task.plan.length}
                    </span>
                  </div>
                  <div className='w-[60px]' />
                </div>

                {/* Chat message history */}
                <div className='space-y-3 mb-4'>
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className={`flex items-start gap-2.5 ${msg.type === 'agent' ? '' : 'flex-row-reverse'}`}
                      >
                        {msg.type === 'agent' && (
                          <div className='w-6 h-6 rounded-full bg-epfo-blue/10 flex items-center justify-center shrink-0 mt-0.5'>
                            <AssistantAvatar state='speaking' className='!w-5 !h-5' />
                          </div>
                        )}
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.type === 'agent'
                            ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm'
                            : 'bg-epfo-blue text-white rounded-tr-md'
                        }`}>
                          <TypewriterText text={msg.text} speed={18} onComplete={() => setIsTyping(false)} />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='flex items-start gap-2.5'
                    >
                      <div className='w-6 h-6 rounded-full bg-epfo-blue/10 flex items-center justify-center shrink-0 mt-0.5'>
                        <AssistantAvatar state='thinking' className='!w-5 !h-5' />
                      </div>
                      <div className='bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm'>
                        <ThinkingAnimation />
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Active step card with interactive form */}
                <motion.div 
                  initial={{ scale: 0.98, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  key={currentStepIndex}
                  className={`bg-white p-5 rounded-2xl border ${task.agentState === 'needs_user' || task.agentState === 'sensitive_action' ? 'border-epfo-blue bg-blue-50/10 shadow-md ring-4 ring-blue-50' : 'border-slate-200 shadow-sm'} mb-6`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-epfo-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                      <AssistantAvatar 
                        state={getAvatarState()}
                        className='!w-5 !h-5'
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className='font-bold text-slate-900 text-base flex items-center justify-between'>
                        {activeStep?.description}
                        {task.agentState === 'in_progress' && <ThinkingAnimation />}
                      </h3>
                      {task.agentState === 'planned' && (
                        <p className='text-xs text-slate-500 mt-1'>Ready to execute.</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    {task.agentState === 'needs_user' && activeStep?.step === 'check_eligibility' && (
                      <form onSubmit={handleUserProvideDetails} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium'>To determine eligibility, verify the last 4 digits of your bank account.</div>
                        <div className='flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm'>
                          <CreditCard className='w-5 h-5 text-slate-400' />
                          <div className='tracking-widest text-slate-500 font-mono'>•••• •••• ••••</div>
                          <input type='text' maxLength={4} required placeholder='XXXX' className='w-16 font-mono font-bold tracking-widest border-b-2 border-slate-300 focus:border-epfo-blue outline-none text-center bg-transparent' value={bankDigits} onChange={e => setBankDigits(e.target.value)} />
                        </div>
                        <Button type='submit' className='w-full'>Verify & Continue</Button>
                      </form>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'review_claim' && (
                      <form onSubmit={handleUserProvideDetails} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium mb-2'>We found your verified Cheque/Passbook in the Vault. Please provide the withdrawal details:</div>
                        <select className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' value={purpose} onChange={e => setPurpose(e.target.value)} required>
                          <option value="">Select Purpose of Advance</option>
                          <option value="illness">Illness</option>
                          <option value="education">Higher Education</option>
                          <option value="marriage">Marriage</option>
                        </select>
                        <div className='relative'>
                          <span className='absolute left-4 top-3.5 text-slate-500 font-medium'>₹</span>
                          <Input type='number' className='pl-8 bg-white shadow-sm' placeholder='Amount Required' value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>
                        <Button type='submit' className='w-full'>Prepare Claim</Button>
                      </form>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'capture_face' && (
                      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium mb-2'>We need to verify your identity using facial recognition for the Digital Life Certificate.</div>
                        <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md' onClick={() => {
                          toast.success('Face matched successfully with Aadhaar database!');
                          proceedToNextStep();
                        }}>
                          Scan Face
                        </Button>
                      </div>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'select_exit_reason' && (
                      <form onSubmit={(e) => { e.preventDefault(); proceedToNextStep(); }} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium mb-2'>Please select the reason for your exit from employment:</div>
                        <select className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' required>
                          <option value="">Select Reason</option>
                          <option value="cessation">Cessation (Short Service / Resignation)</option>
                          <option value="illness">Ill Health / Medical Reason</option>
                          <option value="closure">Closure of Establishment</option>
                        </select>
                        <Button type='submit' className='w-full'>Confirm Reason</Button>
                      </form>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'select_grievance_type' && (
                      <form onSubmit={(e) => { e.preventDefault(); updateTaskState(task.taskId, { grievanceType }); proceedToNextStep(); }} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium mb-2'>What is the nature of your grievance?</div>
                        <select 
                          className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' 
                          value={grievanceType} 
                          onChange={e => setGrievanceType(e.target.value)}
                          required
                        >
                          <option value="">Select type</option>
                          <option value="employer_not_depositing">Employer not depositing contributions</option>
                          <option value="employer_not_approving">Employer not approving KYC/claim</option>
                          <option value="other">Other</option>
                        </select>
                        {grievanceType === 'employer_not_depositing' && (
                          <div className='bg-amber-50 text-amber-800 p-3 rounded-lg text-xs border border-amber-100'>
                            <span className='font-bold'>Note:</span> EPFO's stated SLA for employer non-deposit grievances is 15 working days with auto-escalation to the Regional PF Commissioner.
                          </div>
                        )}
                        <Button type='submit' className='w-full'>Continue</Button>
                      </form>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'register_grievance' && (
                      <form onSubmit={(e) => { e.preventDefault(); proceedToNextStep(); }} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium mb-2'>Please describe your grievance in detail:</div>
                        {grievanceType === 'employer_not_depositing' && (
                          <input 
                            type='text' 
                            placeholder='Employer / Establishment Name' 
                            value={employerName}
                            onChange={e => setEmployerName(e.target.value)}
                            className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' 
                            required 
                          />
                        )}
                        <textarea className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm min-h-[100px] resize-none' placeholder='Explain your issue here...' required />
                        <Button type='submit' className='w-full'>Submit Details</Button>
                      </form>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'generate_reference' && (
                      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='bg-emerald-50 p-3 rounded-xl border border-emerald-200'>
                          <p className='text-sm font-bold text-emerald-900'>Ticket Generated: TKT-{Math.floor(1000 + Math.random() * 9000)}</p>
                          <p className='text-xs text-emerald-700 mt-1'>SMS confirmation sent to your registered mobile.</p>
                        </div>
                        {grievanceType === 'employer_not_depositing' && (
                          <div className='bg-amber-50 p-3 rounded-xl border border-amber-200'>
                            <p className='text-xs font-bold text-amber-900'>Auto-Escalation Active</p>
                            <p className='text-xs text-amber-800 mt-1'>If no response in 15 working days, this will be auto-escalated to the Regional PF Commissioner. You will receive an SMS update.</p>
                          </div>
                        )}
                        {grievanceType === 'employer_not_approving' && (
                          <div className='bg-blue-50 p-3 rounded-xl border border-blue-100'>
                            <p className='text-xs font-bold text-blue-900'>Employer Action Required</p>
                            <p className='text-xs text-blue-800 mt-1'>The employer has been notified. Expected response within 7 working days.</p>
                          </div>
                        )}
                        <Button onClick={proceedToNextStep} className='w-full'>Done</Button>
                      </div>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'analyze_passbook' && (
                      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='bg-white p-4 rounded-xl border border-slate-200 shadow-sm'>
                          <p className='text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1'>Total PF Balance</p>
                          <p className='text-3xl font-bold text-slate-800 tracking-tight'>₹ 2,45,600</p>
                          <div className='mt-4 space-y-2 border-t border-slate-100 pt-3'>
                            <div className='flex justify-between items-center text-sm'>
                              <span className='text-slate-600'>Employee Share</span>
                              <span className='font-semibold text-slate-800'>₹ 1,12,000</span>
                            </div>
                            <div className='flex justify-between items-center text-sm'>
                              <span className='text-slate-600'>Employer Share</span>
                              <span className='font-semibold text-slate-800'>₹ 1,12,000</span>
                            </div>
                            <div className='flex justify-between items-center text-sm'>
                              <span className='text-slate-600'>Pension Contribution</span>
                              <span className='font-semibold text-slate-800'>₹ 21,600</span>
                            </div>
                          </div>
                        </div>
                        <div className='bg-blue-50 text-blue-800 p-3 rounded-lg text-xs border border-blue-100'>
                          <span className='font-bold'>Note:</span> Last contribution of ₹2,400 received on 15th Sep 2026.
                        </div>
                        <Button onClick={proceedToNextStep} className='w-full'>Done Viewing Passbook</Button>
                      </div>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'fetch_linked_accounts' && (
                      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium mb-2'>We found the following accounts linked to your Aadhaar:</div>
                        <div className='space-y-2'>
                          <div className='bg-white p-3 rounded-xl border-2 border-epfo-blue shadow-sm'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='text-sm font-bold text-slate-900'>UAN: 100XXXXX1234</p>
                                <p className='text-xs text-slate-500 mt-0.5'>Current Active • ABC Company</p>
                              </div>
                              <span className='text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold'>ACTIVE</span>
                            </div>
                          </div>
                          <div className='bg-white p-3 rounded-xl border border-slate-200'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='text-sm font-bold text-slate-900'>UAN: 100XXXXX5678</p>
                                <p className='text-xs text-slate-500 mt-0.5'>Inactive since 2019 • XYZ Corp</p>
                              </div>
                              <span className='text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold'>INACTIVE</span>
                            </div>
                          </div>
                        </div>
                        <div className='bg-amber-50 text-amber-800 p-3 rounded-lg text-xs border border-amber-100'>
                          <span className='font-bold'>Note:</span> Both accounts are linked to the same Aadhaar. You are eligible for auto-merge under One Member One EPF.
                        </div>
                        <Button onClick={proceedToNextStep} className='w-full'>Confirm & Continue</Button>
                      </div>
                    )}

                    {task.agentState === 'needs_user' && activeStep?.step === 'select_accounts_to_merge' && (
                      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='text-sm text-slate-700 font-medium mb-2'>Please confirm the merge details:</div>
                        <div className='bg-white p-3 rounded-xl border border-slate-200 space-y-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-slate-500'>From:</span>
                            <span className='text-xs font-bold text-slate-900'>UAN 100XXXXX5678 (XYZ Corp) — ₹32,400</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-slate-500'>To:</span>
                            <span className='text-xs font-bold text-slate-900'>UAN 100XXXXX1234 (ABC Company)</span>
                          </div>
                        </div>
                        <div className='bg-blue-50 text-blue-800 p-3 rounded-lg text-xs border border-blue-100'>
                          <span className='font-bold'>Note:</span> If auto-merge is not eligible, a Form 13 transfer will be initiated instead. You will be notified of the final path.
                        </div>
                        <Button onClick={proceedToNextStep} className='w-full'>Confirm Merge</Button>
                      </div>
                    )}

                    {task.agentState === 'sensitive_action' && (
                      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='flex items-center justify-between px-1 mb-2'>
                          <span className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>Session expires in</span>
                          <span className={`text-xs font-bold font-mono ${sessionTimer < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                            {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className='p-3.5 bg-orange-50 rounded-xl border border-orange-200 text-sm space-y-2'>
                          <div className='flex items-center gap-2 text-orange-900 font-bold'>
                            <ShieldAlert className='w-5 h-5 shrink-0'/>
                            Authentication Required
                          </div>
                          <p className='text-orange-800 text-xs leading-relaxed'>
                            {activeStep?.step === 'submit_transfer' ? 'Submitting this will initiate an automatic transfer of your funds. Please authenticate to sign.' :
                             activeStep?.step === 'submit_certificate' ? 'This will cryptographically sign and submit your Digital Life Certificate to the government.' :
                             activeStep?.step === 'submit_exit' ? 'This will officially mark your exit from the selected establishment.' :
                             activeStep?.step === 'submit_merge_request' ? 'This will submit a One Employee One EPF merge request to consolidate your duplicate UANs.' :
                             'Submitting this claim will initiate a funds transfer. Please authenticate to sign.'}
                          </p>
                        </div>
                        <Input type="text" className='bg-white shadow-sm text-center tracking-widest font-mono text-lg' placeholder="Enter Aadhaar OTP (1234)" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
                        {authError && <p className='text-red-600 text-xs text-center font-medium'>Invalid OTP. Please try again.</p>}
                        {authError && <OtpFallbackOptions variant='compact' />}
                        
                        <div className='pt-2 flex flex-col items-center gap-3'>
                          {otpTimer > 0 ? (
                            <p className='text-xs text-slate-500'>Resend OTP in <span className='font-mono font-medium'>{otpTimer}s</span></p>
                          ) : (
                            <OtpFallbackOptions />
                          )}
                        </div>

                        <Button className='w-full bg-red-600 hover:bg-red-700 text-white shadow-md' onClick={handleSensitiveAction}>
                          <Lock className='w-4 h-4 mr-2' /> Sign & Submit {
                            activeStep?.step === 'submit_transfer' ? 'Transfer' : 
                            activeStep?.step === 'submit_certificate' ? 'Certificate' :
                            activeStep?.step === 'submit_exit' ? 'Exit Request' :
                            activeStep?.step === 'submit_merge_request' ? 'Merge Request' : 'Claim'
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
      )}

        {isPendingEmployer && task.employerApproval && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mt-8 space-y-4'>
            <EmployerApprovalStatus
              employerApproval={task.employerApproval}
              taskId={task.taskId}
            />
          </motion.div>
        )}

        {isDone && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mt-8 space-y-4'>
            <div className='bg-green-50 border border-green-200 p-6 rounded-2xl flex items-start gap-4'>
              <div className='bg-green-100 p-2 rounded-full shrink-0'>
                <CheckCircle2 className='w-8 h-8 text-green-600' />
              </div>
              <div>
                <h3 className='font-bold text-green-900 text-lg'>All Steps Completed</h3>
                <p className='text-green-800 text-sm mt-1'>Your request has been processed and filed. The agent has successfully completed all necessary actions on your behalf.</p>
              </div>
            </div>

            {/* In-App Feedback Section */}
            {!isFeedbackSubmitted ? (
              <div className='bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden'>
                {/* Time taken — compact bar */}
                <div className='px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between'>
                  <span className='text-xs font-medium text-slate-500'>Process Time via Smart Flow</span>
                  <span className='text-xs font-bold text-epfo-blue bg-white px-2 py-0.5 rounded-md border border-slate-200'>{formatTimeTaken()}</span>
                </div>

                <div className='p-5 space-y-4'>
                  {/* Stars — always visible and prominent */}
                  <div>
                    <h4 className='font-bold text-slate-800 mb-1'>How was your experience?</h4>
                    <p className='text-xs text-slate-400 mb-3'>Tap a star to rate</p>
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                        >
                          <Star className='w-9 h-9 fill-current' />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional comment — only shown after rating */}
                  {rating > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className='space-y-3 overflow-hidden'>
                      <textarea
                        placeholder='Any difficulty or suggestion? (Optional)'
                        className='w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-epfo-blue resize-none'
                        rows={2}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                      <div className='flex items-start gap-2'>
                        <input type='checkbox' id='consent' checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} className='mt-1 shrink-0' />
                        <label htmlFor='consent' className='text-[11px] text-slate-400 leading-tight'>I consent to sharing anonymous feedback to help improve EPFO services.</label>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit — always visible */}
                  <Button
                    onClick={() => {
                      setIsFeedbackSubmitted(true);
                      toast.success('Thank you for your valuable feedback!');
                    }}
                    className='w-full bg-slate-900 text-white hover:bg-slate-800'
                    disabled={rating === 0}
                  >
                    {rating === 0 ? 'Rate to Submit Feedback' : 'Submit Feedback'}
                  </Button>
                  {rating === 0 && (
                    <p className='text-center text-[11px] text-slate-400'>Or <button className='underline font-medium' onClick={() => setIsFeedbackSubmitted(true)}>skip feedback</button></p>
                  )}
                </div>
              </div>
            ) : (
              <div className='bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-inner'>
                <AssistantAvatar state='thank_you' className='!w-12 !h-12 mb-2 shadow-md' />
                <p className='font-bold text-blue-900 text-lg'>Thank you!</p>
                <p className='text-sm text-blue-700'>Your feedback has been recorded.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {(!isInitializing && !isDone && !hasStartedFlow && task.agentState === 'planned') && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleStartFlow}>START FLOW</Button>
        </div>
      )}
      {(!isInitializing && !isDone && hasStartedFlow && task.agentState === 'planned') && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleAgentAction}>EXECUTE NEXT STEP</Button>
        </div>
      )}
      {isDone && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleFinish}>Return to Dashboard</Button>
        </div>
      )}
      {isPendingEmployer && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      )}
    </div>
  );
};
