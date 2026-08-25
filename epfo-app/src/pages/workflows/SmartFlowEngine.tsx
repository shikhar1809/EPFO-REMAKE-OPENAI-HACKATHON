import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert, CheckCircle2, Lock, CreditCard, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ThinkingAnimation } from '../../components/ui/ThinkingAnimation';
import { Input } from '../../components/ui/Input';

import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useSessionStore } from '../../store/useSessionStore';
import toast from 'react-hot-toast';
import { AssistantAvatar } from '../../components/ui/AssistantAvatar';

export const SmartFlowEngine: React.FC = () => {
  const navigate = useNavigate();
  const { getCurrentTask, updateTaskState, checkpointTask, archiveTask } = useWorkflowStore();
  const { stepUpAuth } = useSessionStore();
  
  const task = getCurrentTask();
  
  const [bankDigits, setBankDigits] = useState('1234');
  const [purpose, setPurpose] = useState('Medical Emergency (Illness)');
  const [amount, setAmount] = useState('50000');
  const [otpInput, setOtpInput] = useState('1234');
  const [authError, setAuthError] = useState(false);
  const [operationId, setOperationId] = useState<string | null>(null);

  const [isInitializing, setIsInitializing] = useState(() => {
    // Only initialize if we are at the very start of the workflow
    return task?.agentState === 'planned' && task?.plan[0]?.status === 'active';
  });
  const [initStage, setInitStage] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

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

  useEffect(() => {
    if (!task) return;
    
    // Determine if we need to show a toast for the current step
    const currentStepIndex = task.plan.findIndex((p: any) => p.status === 'active');
    const activeStep = task.plan[currentStepIndex];

    if (task.agentState === 'needs_user' && activeStep?.step === 'check_eligibility') {
      toast('Security Check: We need to verify it is you before checking your PF balance.', { icon: '🛡️', id: 'check_eligibility_toast', duration: 4000 });
    } else if (task.agentState === 'needs_user' && activeStep?.step === 'review_claim') {
      toast('Required Info: The government needs to know why you are withdrawing funds.', { icon: '📋', id: 'review_claim_toast', duration: 4000 });
    } else if (task.agentState === 'sensitive_action' && (activeStep?.step === 'submit_claim' || activeStep?.step === 'submit_transfer')) {
      toast('Final Step: You must authorize this action to proceed.', { icon: '🔒', id: 'sensitive_action_toast', duration: 4000 });
    }
  }, [task?.agentState, task?.plan]);

  if (!task) return null;

  const currentStepIndex = task.plan.findIndex((p: any) => p.status === 'active');
  const activeStep = task.plan[currentStepIndex];
  const isDone = task.agentState === 'completed';

  const proceedToNextStep = () => {
    if (currentStepIndex === task.plan.length - 1) {
      checkpointTask(task.taskId, activeStep.step, '');
      updateTaskState(task.taskId, { agentState: 'completed' });
    } else {
      const nextStep = task.plan[currentStepIndex + 1].step;
      
      let nextState = 'planned';
      if (nextStep === 'check_eligibility') {
        nextState = 'needs_user'; // Need bank verification
      } else if (nextStep === 'review_claim') {
        nextState = 'needs_user'; // Need claim details (Form 31)
      } else if (nextStep === 'submit_claim' || nextStep === 'submit_transfer') {
        nextState = 'sensitive_action'; // Need OTP
      }

      checkpointTask(task.taskId, activeStep.step, nextStep);
      updateTaskState(task.taskId, { agentState: nextState as any });
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
      alert('Invalid digits. Use 1234 for demo.');
      return;
    }
    proceedToNextStep();
  };

  const handleSensitiveAction = async () => {
    const success = await stepUpAuth(otpInput || '1234');
    if (success) {
      setAuthError(false);
      setOperationId(`OP-CLM-${Math.floor(Math.random() * 1000000)}`);
      proceedToNextStep();
    } else {
      setAuthError(true);
    }
  };

  const handleFinish = () => {
    archiveTask(task.taskId);
    navigate('/');
  };

  const getAgentMessage = () => {
    switch (task.agentState) {
      case 'planned': return `I made ${task.plan.length} steps for your issue. Follow this step by step.`;
      case 'in_progress': return "Working on this step...";
      case 'needs_user': 
        if (activeStep?.step === 'check_eligibility') return "Please verify your bank account details.";
        if (activeStep?.step === 'review_claim') return "Please provide the details for your claim.";
        return "Please review the gathered documents before we proceed.";
      case 'sensitive_action': return "This will submit your claim. Review and authenticate before continuing.";
      case 'completed': return `Task completed successfully. Reference ID: ${operationId}`;
      default: return "";
    }
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-hidden relative'>
      
      <div className='bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/80 z-10'>
        <div className='flex items-center'>
          <button onClick={() => navigate(-1)} className='p-1.5 -ml-1 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'>
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-base font-bold text-slate-900 ml-1.5 flex items-center gap-2'>
            <AssistantAvatar className='!w-6 !h-6 shadow-sm mr-1' />
            Agent Workflow
          </h1>
        </div>

        {/* Live Session ID Badge */}
        <div className='flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] shadow-2xs select-none'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-[10px] text-slate-400 font-sans uppercase font-bold tracking-tight'>SESSION ID:</span>
          <span className='font-bold text-slate-900 tracking-wider'>#{task.taskId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}</span>
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
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-slate-900 mb-2 capitalize'>"{task.intent}"</h2>
              <motion.div 
                initial={{ scale: 0.98 }} 
                animate={task.agentState === 'needs_user' || task.agentState === 'sensitive_action' ? { scale: [1, 1.02, 1], boxShadow: ['0px 0px 0px rgba(0,0,0,0)', '0px 4px 20px rgba(59, 130, 246, 0.2)', '0px 0px 0px rgba(0,0,0,0)'] } : { scale: 1 }}
                transition={{ duration: 2, repeat: (task.agentState === 'needs_user' || task.agentState === 'sensitive_action') ? Infinity : 0 }}
                className={`bg-white p-4 rounded-2xl border ${task.agentState === 'needs_user' ? 'border-epfo-blue bg-blue-50/30' : 'border-slate-200'} shadow-sm flex items-start gap-3 mt-4`}
              >
                <AssistantAvatar 
                  state={task.agentState === 'in_progress' ? 'thinking' : task.agentState === 'needs_user' ? 'speaking' : 'idle'}
                  className={`!w-6 !h-6 shrink-0 ${task.agentState === 'needs_user' ? 'text-epfo-blue' : 'text-slate-500'}`} 
                />
                <div className="flex-1">
                  <p className='font-medium text-slate-800 flex items-center justify-between'>
                    <span className='capitalize text-epfo-blue'>{task.agentState.replace('_', ' ')}</span>
                    {task.agentState === 'in_progress' && <ThinkingAnimation />}
                  </p>
                  <p className='text-sm text-slate-600 mt-1'>{getAgentMessage()}</p>
                </div>
              </motion.div>
            </div>

            <div className='space-y-3 relative ml-2'>
              <div className='absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10' />
              {task.plan.map((step: any, idx: number) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'active';

                return (
                  <motion.div key={step.step} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                    className={`flex gap-4 p-4 rounded-2xl transition-all bg-white border ${isCurrent ? 'border-epfo-blue shadow-sm ring-1 ring-epfo-blue/20' : isCompleted ? 'border-slate-100 opacity-60' : 'border-slate-100 opacity-40'}`}
                  >
                <div className={'w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm z-10 ' + (isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-epfo-blue text-white shadow-md' : 'bg-slate-200 text-slate-500')}>
                  {isCompleted ? <CheckCircle2 className='w-5 h-5' /> : idx + 1}
                </div>
                <div className='flex-1'>
                  <h3 className={'font-semibold ' + (isCurrent ? 'text-epfo-blue' : 'text-slate-800')}>{step.description}</h3>
                  
                  {isCurrent && task.agentState === 'needs_user' && step.step === 'check_eligibility' && (
                    <form onSubmit={handleUserProvideDetails} className='mt-3 space-y-3'>
                      <div className='text-sm text-slate-600'>To determine eligibility, verify the last 4 digits of your bank account.</div>
                      <div className='flex items-center gap-3 bg-transparent p-3 rounded-xl border border-slate-200'>
                        <CreditCard className='w-5 h-5 text-slate-400' />
                        <div className='tracking-widest text-slate-500'>•••• •••• ••••</div>
                        <input type='text' maxLength={4} required placeholder='XXXX' className='w-16 font-bold tracking-widest border-b-2 border-slate-300 focus:border-epfo-blue outline-none text-center bg-transparent' value={bankDigits} onChange={e => setBankDigits(e.target.value)} />
                      </div>
                      <Button type='submit' className='w-full'>Verify & Continue</Button>
                    </form>
                  )}

                  {isCurrent && task.agentState === 'needs_user' && step.step === 'review_claim' && (
                    <form onSubmit={handleUserProvideDetails} className='mt-3 space-y-3'>
                      <div className='text-sm text-slate-600 mb-2'>We found your verified Cheque/Passbook in the Vault. Please provide the withdrawal details:</div>
                      <select className='w-full p-3 border border-slate-200 rounded-xl outline-none text-sm' value={purpose} onChange={e => setPurpose(e.target.value)} required>
                        <option value="">Select Purpose of Advance</option>
                        <option value="illness">Illness</option>
                        <option value="education">Higher Education</option>
                        <option value="marriage">Marriage</option>
                      </select>
                      <Input type='number' placeholder='Amount Required (₹)' value={amount} onChange={e => setAmount(e.target.value)} required />
                      <Button type='submit' className='w-full'>Prepare Claim</Button>
                    </form>
                  )}

                  {isCurrent && task.agentState === 'sensitive_action' && (
                    <div className='mt-3 space-y-3'>
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm space-y-2'>
                        <div className='flex items-start gap-2 text-orange-900 font-medium'>
                          <ShieldAlert className='w-4 h-4 shrink-0 mt-0.5'/>
                          Extra Security Check Required
                        </div>
                        <p className='text-orange-800 text-xs'>
                          {step.step === 'submit_transfer' 
                            ? 'Submitting this will initiate an automatic transfer of your funds. Please authenticate to sign.'
                            : 'Submitting this claim will initiate a funds transfer. Please authenticate to sign.'}
                        </p>
                      </div>
                      <Input type="text" placeholder="Enter Aadhaar OTP (use 1234)" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
                      {authError && <p className='text-red-600 text-xs'>Invalid OTP. Try again.</p>}
                      <Button className='w-full bg-red-600 hover:bg-red-700' onClick={handleSensitiveAction}>
                        <Lock className='w-4 h-4 mr-2' /> Sign & Submit {step.step === 'submit_transfer' ? 'Transfer' : 'Claim'}
                      </Button>
                    </div>
                  )}

                  {isCompleted && (step.step === 'submit_claim' || step.step === 'submit_transfer') && (
                    <div className='mt-3 p-3 bg-green-50 rounded-lg border border-green-200 text-sm'>
                      <div className='text-green-800 font-medium mb-1'>Tracking Number:</div>
                      <div className='font-mono text-green-900'>{operationId}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
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
              <div className='bg-white border border-slate-200 p-5 rounded-2xl shadow-sm'>
                <h4 className='font-bold text-slate-800 mb-2'>How was your experience?</h4>
                <p className='text-xs text-slate-500 mb-4'>Your feedback helps us improve the Smart Flow experience.</p>
                
                <div className='flex gap-2 mb-4'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                    >
                      <Star className='w-8 h-8 fill-current' />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className='space-y-3 overflow-hidden'>
                    <textarea 
                      placeholder='Did you face any difficulty during this process? (Optional)'
                      className='w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-epfo-blue resize-none'
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <Button 
                      onClick={() => {
                        setIsFeedbackSubmitted(true);
                        toast.success('Thank you for your valuable feedback!');
                      }}
                      className='w-full bg-slate-900 text-white hover:bg-slate-800'
                    >
                      Submit Feedback
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className='bg-blue-50 border border-blue-100 p-5 rounded-2xl text-center'>
                <p className='font-bold text-blue-900'>Thank you! 🎉</p>
                <p className='text-xs text-blue-700 mt-1'>Your feedback has been recorded.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {(!isInitializing && !isDone && task.agentState === 'planned') && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleAgentAction}>Let Agent Execute Step</Button>
        </div>
      )}
      {isDone && (
        <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50'>
          <Button className='w-full py-4 text-lg' onClick={handleFinish}>Return to Dashboard</Button>
        </div>
      )}
    </div>
  );
};
