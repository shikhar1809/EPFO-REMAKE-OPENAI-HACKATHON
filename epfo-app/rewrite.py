import re

with open('src/pages/workflows/SmartFlowEngine.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add goBackStep inside SmartFlowEngine component
go_back_step = """
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
"""
content = content.replace("const getAgentMessage = () => {", go_back_step + "\n  const getAgentMessage = () => {")

# 2. Update Header
content = content.replace("Agent Workflow\n          </h1>", "{hasStartedFlow ? 'Executing Flow' : 'Agent Workflow'}\n          </h1>")
content = content.replace("SESSION ID:", "SESSION:")
content = content.replace("slice(-6)", "slice(-4)")

# 3. Replace the entire content block for overview and execution mode
start_marker = "<motion.div initial=\"hidden\" animate=\"visible\" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className='w-full'>"
end_marker = "        {isDone && ("

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_content_block = """<motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className='w-full'>
            
            {/* OVERVIEW MODE */}
            {!hasStartedFlow && !isDone && (
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

                <div className='space-y-3 relative ml-2'>
                  <div className='absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10' />
                  {task.plan.map((step: any, idx: number) => (
                    <div key={idx} className='relative pl-10'>
                       <div className='absolute left-0 top-1.5 w-[30px] h-[30px] rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400'>
                         {idx + 1}
                       </div>
                       <div className='bg-white rounded-2xl p-4 border border-slate-200 shadow-sm'>
                         <h3 className='font-bold text-slate-800'>{step.title || step.description}</h3>
                         <p className='text-xs text-slate-500 mt-1'>{step.description}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* EXECUTION MODE */}
            {hasStartedFlow && !isDone && (
              <>
                <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-100'>
                  <button 
                    onClick={goBackStep} 
                    disabled={currentStepIndex === 0} 
                    className='flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-epfo-blue transition-colors disabled:opacity-30 disabled:hover:text-slate-500'
                  >
                    <ArrowLeft className='w-4 h-4' /> Back
                  </button>
                  
                  <div className='flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full'>
                    <div className='flex gap-1.5 mr-2'>
                      {task.plan.map((_: any, i: number) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i === currentStepIndex ? 'bg-epfo-blue ring-2 ring-blue-100' : i < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      ))}
                    </div>
                    <span className='text-xs font-bold text-slate-700 tracking-wide uppercase'>
                      Step {currentStepIndex + 1} of {task.plan.length}
                    </span>
                  </div>
                  <div className='w-[60px]' /> {/* Spacer to center the pill */}
                </div>
                
                <motion.div 
                  initial={{ scale: 0.98, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  key={currentStepIndex}
                  className={`bg-white p-5 rounded-2xl border ${task.agentState === 'needs_user' || task.agentState === 'sensitive_action' ? 'border-epfo-blue bg-blue-50/10 shadow-md ring-4 ring-blue-50' : 'border-slate-200 shadow-sm'} mb-6`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <AssistantAvatar 
                      state={task.agentState === 'in_progress' ? 'processing' : task.agentState === 'needs_user' || task.agentState === 'sensitive_action' ? 'speaking' : 'idle'}
                      className={`!w-8 !h-8 shrink-0 ${task.agentState === 'needs_user' || task.agentState === 'sensitive_action' ? 'text-epfo-blue' : 'text-slate-600'}`} 
                    />
                    <div className="flex-1">
                      <h3 className='font-bold text-slate-900 text-lg flex items-center justify-between'>
                        {activeStep?.description}
                        {task.agentState === 'in_progress' && <ThinkingAnimation />}
                      </h3>
                      <p className='text-sm text-slate-600 mt-1 leading-relaxed'>{task.agentState === 'planned' ? 'Ready to execute.' : getAgentMessage()}</p>
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

                    {task.agentState === 'sensitive_action' && (
                      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div className='p-3.5 bg-orange-50 rounded-xl border border-orange-200 text-sm space-y-2'>
                          <div className='flex items-center gap-2 text-orange-900 font-bold'>
                            <ShieldAlert className='w-5 h-5 shrink-0'/>
                            Authentication Required
                          </div>
                          <p className='text-orange-800 text-xs leading-relaxed'>
                            {activeStep?.step === 'submit_transfer' 
                              ? 'Submitting this will initiate an automatic transfer of your funds. Please authenticate to sign.'
                              : 'Submitting this claim will initiate a funds transfer. Please authenticate to sign.'}
                          </p>
                        </div>
                        <Input type="text" className='bg-white shadow-sm text-center tracking-widest font-mono text-lg' placeholder="Enter Aadhaar OTP (1234)" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
                        {authError && <p className='text-red-600 text-xs text-center font-medium'>Invalid OTP. Please try again.</p>}
                        <Button className='w-full bg-red-600 hover:bg-red-700 text-white shadow-md' onClick={handleSensitiveAction}>
                          <Lock className='w-4 h-4 mr-2' /> Sign & Submit {activeStep?.step === 'submit_transfer' ? 'Transfer' : 'Claim'}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
"""

content = content[:start_idx] + new_content_block + "\n" + content[end_idx:]

with open('src/pages/workflows/SmartFlowEngine.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
