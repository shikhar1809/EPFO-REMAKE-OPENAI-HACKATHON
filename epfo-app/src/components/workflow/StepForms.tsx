import React from 'react';
import { ShieldAlert, Lock, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OtpFallbackOptions } from '../ui/OtpFallbackOptions';

interface StepFormsProps {
  stepName: string;
  agentState: string;
  bankDigits: string;
  purpose: string;
  amount: string;
  otpInput: string;
  authError: boolean;
  otpTimer: number;
  sessionTimer: number;
  grievanceType: string;
  employerName: string;
  onBankDigitsChange: (v: string) => void;
  onPurposeChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onOtpInputChange: (v: string) => void;
  onGrievanceTypeChange: (v: string) => void;
  onEmployerNameChange: (v: string) => void;
  onSubmitDetails: (e: React.FormEvent) => void;
  onSensitiveAction: () => void;
  onScanFace: () => void;
  onProceed: () => void;
  onGrievanceSubmit: (e: React.FormEvent) => void;
}

export const StepForms: React.FC<StepFormsProps> = ({
  stepName,
  agentState,
  bankDigits,
  purpose,
  amount,
  otpInput,
  authError,
  otpTimer,
  sessionTimer,
  grievanceType,
  employerName,
  onBankDigitsChange,
  onPurposeChange,
  onAmountChange,
  onOtpInputChange,
  onGrievanceTypeChange,
  onEmployerNameChange,
  onSubmitDetails,
  onSensitiveAction,
  onScanFace,
  onProceed,
  onGrievanceSubmit,
}) => {
  const needsUser = agentState === 'needs_user';
  const sensitive = agentState === 'sensitive_action';

  // check_eligibility
  if (needsUser && stepName === 'check_eligibility') {
    return (
      <form onSubmit={onSubmitDetails} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
        <div className='text-sm text-slate-700 font-medium'>To determine eligibility, verify the last 4 digits of your bank account.</div>
        <div className='flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm'>
          <CreditCard className='w-5 h-5 text-slate-400' />
          <div className='tracking-widest text-slate-500 font-mono'>•••• •••• ••••</div>
          <input type='text' maxLength={4} required placeholder='XXXX' className='w-16 font-mono font-bold tracking-widest border-b-2 border-slate-300 focus:border-epfo-blue outline-none text-center bg-transparent' value={bankDigits} onChange={e => onBankDigitsChange(e.target.value)} />
        </div>
        <Button type='submit' className='w-full'>Verify & Continue</Button>
      </form>
    );
  }

  // review_claim
  if (needsUser && stepName === 'review_claim') {
    return (
      <form onSubmit={onSubmitDetails} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
        <div className='text-sm text-slate-700 font-medium mb-2'>We found your verified Cheque/Passbook in the Vault. Please provide the withdrawal details:</div>
        <select className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' value={purpose} onChange={e => onPurposeChange(e.target.value)} required>
          <option value="">Select Purpose of Advance</option>
          <option value="illness">Illness</option>
          <option value="education">Higher Education</option>
          <option value="marriage">Marriage</option>
        </select>
        <div className='relative'>
          <span className='absolute left-4 top-3.5 text-slate-500 font-medium'>₹</span>
          <Input type='number' className='pl-8 bg-white shadow-sm' placeholder='Amount Required' value={amount} onChange={e => onAmountChange(e.target.value)} required />
        </div>
        <Button type='submit' className='w-full'>Prepare Claim</Button>
      </form>
    );
  }

  // capture_face
  if (needsUser && stepName === 'capture_face') {
    return (
      <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
        <div className='text-sm text-slate-700 font-medium mb-2'>We need to verify your identity using facial recognition for the Digital Life Certificate.</div>
        <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md' onClick={onScanFace}>Scan Face</Button>
      </div>
    );
  }

  // select_exit_reason
  if (needsUser && stepName === 'select_exit_reason') {
    return (
      <form onSubmit={(e) => { e.preventDefault(); onProceed(); }} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
        <div className='text-sm text-slate-700 font-medium mb-2'>Please select the reason for your exit from employment:</div>
        <select className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' required>
          <option value="">Select Reason</option>
          <option value="cessation">Cessation (Short Service / Resignation)</option>
          <option value="illness">Ill Health / Medical Reason</option>
          <option value="closure">Closure of Establishment</option>
        </select>
        <Button type='submit' className='w-full'>Confirm Reason</Button>
      </form>
    );
  }

  // select_grievance_type
  if (needsUser && stepName === 'select_grievance_type') {
    return (
      <form onSubmit={onGrievanceSubmit} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
        <div className='text-sm text-slate-700 font-medium mb-2'>What is the nature of your grievance?</div>
        <select className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' value={grievanceType} onChange={e => onGrievanceTypeChange(e.target.value)} required>
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
    );
  }

  // register_grievance
  if (needsUser && stepName === 'register_grievance') {
    return (
      <form onSubmit={(e) => { e.preventDefault(); onProceed(); }} className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
        <div className='text-sm text-slate-700 font-medium mb-2'>Please describe your grievance in detail:</div>
        {grievanceType === 'employer_not_depositing' && (
          <input type='text' placeholder='Employer / Establishment Name' value={employerName} onChange={e => onEmployerNameChange(e.target.value)} className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm' required />
        )}
        <textarea className='w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm bg-white shadow-sm min-h-[100px] resize-none' placeholder='Explain your issue here...' required />
        <Button type='submit' className='w-full'>Submit Details</Button>
      </form>
    );
  }

  // generate_reference
  if (needsUser && stepName === 'generate_reference') {
    return (
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
        <Button onClick={onProceed} className='w-full'>Done</Button>
      </div>
    );
  }

  // analyze_passbook
  if (needsUser && stepName === 'analyze_passbook') {
    return (
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
        <Button onClick={onProceed} className='w-full'>Done Viewing Passbook</Button>
      </div>
    );
  }

  // fetch_linked_accounts
  if (needsUser && stepName === 'fetch_linked_accounts') {
    return (
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
        <Button onClick={onProceed} className='w-full'>Confirm & Continue</Button>
      </div>
    );
  }

  // select_accounts_to_merge
  if (needsUser && stepName === 'select_accounts_to_merge') {
    return (
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
        <Button onClick={onProceed} className='w-full'>Confirm Merge</Button>
      </div>
    );
  }

  // sensitive_action (OTP)
  if (sensitive) {
    return (
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
            {stepName === 'submit_transfer' ? 'Submitting this will initiate an automatic transfer of your funds. Please authenticate to sign.' :
             stepName === 'submit_certificate' ? 'This will cryptographically sign and submit your Digital Life Certificate to the government.' :
             stepName === 'submit_exit' ? 'This will officially mark your exit from the selected establishment.' :
             stepName === 'submit_merge_request' ? 'This will submit a One Employee One EPF merge request to consolidate your duplicate UANs.' :
             'Submitting this claim will initiate a funds transfer. Please authenticate to sign.'}
          </p>
        </div>
        <Input type="text" className='bg-white shadow-sm text-center tracking-widest font-mono text-lg' placeholder="Enter Aadhaar OTP (1234)" value={otpInput} onChange={(e) => onOtpInputChange(e.target.value)} />
        {authError && <p className='text-red-600 text-xs text-center font-medium'>Invalid OTP. Please try again.</p>}
        {authError && <OtpFallbackOptions variant='compact' />}
        <div className='pt-2 flex flex-col items-center gap-3'>
          {otpTimer > 0 ? (
            <p className='text-xs text-slate-500'>Resend OTP in <span className='font-mono font-medium'>{otpTimer}s</span></p>
          ) : (
            <OtpFallbackOptions />
          )}
        </div>
        <Button className='w-full bg-red-600 hover:bg-red-700 text-white shadow-md' onClick={onSensitiveAction}>
          <Lock className='w-4 h-4 mr-2' /> Sign & Submit {
            stepName === 'submit_transfer' ? 'Transfer' : 
            stepName === 'submit_certificate' ? 'Certificate' :
            stepName === 'submit_exit' ? 'Exit Request' :
            stepName === 'submit_merge_request' ? 'Merge Request' : 'Claim'
          }
        </Button>
      </div>
    );
  }

  return null;
};
