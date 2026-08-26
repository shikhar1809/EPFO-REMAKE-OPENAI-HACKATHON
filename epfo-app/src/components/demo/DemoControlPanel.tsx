import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useDemoStore, DEMO_SCENARIOS } from '../../store/useDemoStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useDataStore } from '../../store/useDataStore';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import type { Phase } from '../../store/useWorkflowStore';

const SCENARIO_HINTS: Record<string, string> = {
  happy: 'All checks pass.',
  no_kyc: 'Prerequisite check blocks claim.',
  kyc_wrong: 'EPFO vs Aadhaar diff shown.',
  claim_denied: 'Rejected claim + appeal option.',
  employer_hold: 'Pending employer SLA card.',
  no_exit: 'Mark Exit page shown.',
  multi_uan: 'Merge banner on dashboard.',
  no_nominee: 'e-Nomination warning on dashboard.',
  pension_cert: 'Pension cert issue on Life Certificate page.',
  advance_rejected: 'Advance claim rejected, eligibility blocked.',
  bank_not_seeded: 'Bank verification fails on claim.',
  aadhaar_conflict: 'Aadhaar already linked to another UAN.',
  multi_phase: 'Two-phase compound workflow: KYC → Withdraw.',
  multi_phase_exit: 'Two-phase compound workflow: Mark Exit → Withdraw.',
  multi_phase_merge: 'Three-phase compound workflow: Merge → Transfer → Withdraw.',
  multi_phase_aadhaar: 'Three-phase compound workflow: Aadhaar Fix → KYC → Withdraw.',
};

export const DemoControlPanel: React.FC = () => {
  const { activeScenario, setScenario } = useDemoStore();
  const navigate = useNavigate();

  const resetToBaseline = () => {
    useSessionStore.setState({
      isAuthenticated: true,
      user: { uan: '100904838291', phone: '9876543210', name: 'Rahul Sharma' },
    });
    useDataStore.setState({
      profile: { name: 'Rahul Sharma', uan: '100904838291', pan: 'ABCDE1234F', aadhaar: 'XXXX-XXXX-8921', bankAccount: 'XXXXXX4892' },
    });
    useWorkflowStore.getState().clearAllTasks();
  };

  const applyScenario = (id: string) => {
    setScenario(id);
    resetToBaseline();

    switch (id) {
      case 'happy':
        navigate('/');
        break;
      case 'no_kyc':
        useDataStore.setState({ profile: null });
        navigate('/');
        break;
      case 'kyc_wrong':
        navigate('/kyc-mismatch');
        break;
      case 'claim_denied':
        useDataStore.setState({
          claims: [
            { id: 'CLM-REJ-001', type: 'Form 31 (Advance)', status: 'Rejected', date: '2026-07-20', amount: 50000 },
            { id: 'CLM-001', type: 'Form 19 (Full)', status: 'Approved', date: '2026-05-12', amount: 234560 },
          ],
        });
        navigate('/');
        break;
      case 'employer_hold': {
        const wfStore = useWorkflowStore.getState();
        if (!wfStore.activeTasks['DEMO-EMP']) {
          wfStore.startTask('PF Withdrawal for medical', 'withdraw_pf', [
            { step: 'verify_identity', description: 'Verify your identity securely', status: 'completed' },
            { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'completed' },
            { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'completed' },
            { step: 'review_claim', description: 'Review claim purpose & amount', status: 'completed' },
            { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'completed' },
          ]);
          wfStore.updateTaskState('DEMO-EMP', {
            agentState: 'pending_employer',
            employerApproval: {
              submittedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
              slaDays: 5,
              employerName: 'TCS (Tata Consultancy Services)',
              escalated: false,
              taskReference: 'TKT-4821',
            },
          });
        }
        navigate('/');
        break;
      }
      case 'no_exit':
        navigate('/mark-exit');
        break;
      case 'multi_uan':
        navigate('/');
        break;
      case 'no_nominee':
        navigate('/');
        break;
      case 'pension_cert':
        navigate('/');
        break;
      case 'advance_rejected':
        useDataStore.setState({
          claims: [
            { id: 'CLM-ADV-002', type: 'Form 31 (Advance)', status: 'Rejected', date: '2026-08-10', amount: 75000 },
            { id: 'CLM-001', type: 'Form 19 (Full)', status: 'Approved', date: '2026-05-12', amount: 234560 },
          ],
        });
        navigate('/');
        break;
      case 'bank_not_seeded':
        navigate('/');
        break;
      case 'aadhaar_conflict':
        navigate('/');
        break;
      case 'multi_phase': {
        const wfStore = useWorkflowStore.getState();
        wfStore.clearAllTasks();
        const phases: Phase[] = [
          {
            id: 'phase-1',
            label: 'Fix KYC Mismatch',
            description: 'Correct your name/DOB mismatch between EPFO and Aadhaar',
            taskType: 'kyc_mismatch',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'completed' },
              { step: 'analyze_mismatch', description: 'Compare EPFO vs Aadhaar records', status: 'completed' },
              { step: 'draft_declaration', description: 'Draft Joint Declaration for correction', status: 'completed' },
              { step: 'submit_declaration', description: 'Aadhaar OTP sign & submit to EPFO', status: 'active' },
            ],
            status: 'active',
          },
          {
            id: 'phase-2',
            label: 'Withdraw PF',
            description: 'File your PF withdrawal claim (Form 31/19/10C)',
            taskType: 'withdraw_pf',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'pending' },
              { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' },
              { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' },
              { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' },
              { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' },
            ],
            status: 'pending',
          },
        ];
        const combinedPlan = phases.flatMap((phase, phaseIdx) =>
          phase.plan.map((step, stepIdx) => ({
            ...step,
            step: `phase${phaseIdx}_${step.step}`,
            status: (phaseIdx === 0 && stepIdx === phase.plan.findIndex(s => s.status === 'active')) ? 'active' as const : step.status,
          }))
        );
        wfStore.startTask('Fix my KYC mismatch and then withdraw PF', 'multi_phase', combinedPlan, phases);
        navigate('/smart-flow');
        break;
      }
      case 'multi_phase_exit': {
        const wfStore = useWorkflowStore.getState();
        wfStore.clearAllTasks();
        const phases: Phase[] = [
          {
            id: 'phase-1',
            label: 'Mark Exit Date',
            description: 'Self-declare your date of exit from employment',
            taskType: 'mark_exit',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'completed' },
              { step: 'fetch_employment', description: 'Retrieve employment records', status: 'completed' },
              { step: 'select_exit_reason', description: 'Select establishment and reason for exit', status: 'active' },
              { step: 'submit_exit', description: 'Aadhaar OTP sign & confirm exit', status: 'pending' },
            ],
            status: 'active',
          },
          {
            id: 'phase-2',
            label: 'Withdraw PF',
            description: 'File your PF withdrawal claim (Form 31/19/10C)',
            taskType: 'withdraw_pf',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'pending' },
              { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' },
              { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' },
              { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' },
              { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' },
            ],
            status: 'pending',
          },
        ];
        const combinedPlan = phases.flatMap((phase, phaseIdx) =>
          phase.plan.map((step, stepIdx) => ({
            ...step,
            step: `phase${phaseIdx}_${step.step}`,
            status: (phaseIdx === 0 && stepIdx === phase.plan.findIndex(s => s.status === 'active')) ? 'active' as const : step.status,
          }))
        );
        wfStore.startTask('Mark my exit date and then withdraw my PF', 'multi_phase', combinedPlan, phases);
        navigate('/smart-flow');
        break;
      }
      case 'multi_phase_merge': {
        const wfStore = useWorkflowStore.getState();
        wfStore.clearAllTasks();
        const phases: Phase[] = [
          {
            id: 'phase-1',
            label: 'Merge Accounts',
            description: 'Consolidate duplicate UAN accounts under one UAN',
            taskType: 'merge_accounts',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'completed' },
              { step: 'fetch_linked_accounts', description: 'Discover duplicate UANs via Aadhaar', status: 'completed' },
              { step: 'select_accounts_to_merge', description: 'Select accounts to consolidate', status: 'active' },
              { step: 'submit_merge_request', description: 'Aadhaar OTP sign & submit merge', status: 'pending' },
            ],
            status: 'active',
          },
          {
            id: 'phase-2',
            label: 'Transfer PF',
            description: 'Transfer PF balance from old employer to current',
            taskType: 'transfer_pf',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'pending' },
              { step: 'fetch_employment', description: 'Locate previous Member IDs & establishments', status: 'pending' },
              { step: 'initiate_transfer', description: 'Authorize transfer to current account', status: 'pending' },
              { step: 'submit_transfer', description: 'Attestation & OTP submission', status: 'pending' },
            ],
            status: 'pending',
          },
          {
            id: 'phase-3',
            label: 'Withdraw PF',
            description: 'File your PF withdrawal claim (Form 31/19/10C)',
            taskType: 'withdraw_pf',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'pending' },
              { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' },
              { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' },
              { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' },
              { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' },
            ],
            status: 'pending',
          },
        ];
        const combinedPlan = phases.flatMap((phase, phaseIdx) =>
          phase.plan.map((step, stepIdx) => ({
            ...step,
            step: `phase${phaseIdx}_${step.step}`,
            status: (phaseIdx === 0 && stepIdx === phase.plan.findIndex(s => s.status === 'active')) ? 'active' as const : step.status,
          }))
        );
        wfStore.startTask('Merge my old PF accounts, transfer balance, and then withdraw', 'multi_phase', combinedPlan, phases);
        navigate('/smart-flow');
        break;
      }
      case 'multi_phase_aadhaar': {
        const wfStore = useWorkflowStore.getState();
        wfStore.clearAllTasks();
        const phases: Phase[] = [
          {
            id: 'phase-1',
            label: 'Fix Aadhaar Conflict',
            description: 'De-link Aadhaar from wrong UAN',
            taskType: 'kyc_mismatch',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'completed' },
              { step: 'analyze_mismatch', description: 'Compare EPFO vs Aadhaar records', status: 'active' },
              { step: 'draft_declaration', description: 'Draft Joint Declaration for correction', status: 'pending' },
              { step: 'submit_declaration', description: 'Aadhaar OTP sign & submit to EPFO', status: 'pending' },
            ],
            status: 'active',
          },
          {
            id: 'phase-2',
            label: 'Update KYC',
            description: 'Correct your name/DOB mismatch between EPFO and Aadhaar',
            taskType: 'kyc_mismatch',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'pending' },
              { step: 'analyze_mismatch', description: 'Compare EPFO vs Aadhaar records', status: 'pending' },
              { step: 'draft_declaration', description: 'Draft Joint Declaration for correction', status: 'pending' },
              { step: 'submit_declaration', description: 'Aadhaar OTP sign & submit to EPFO', status: 'pending' },
            ],
            status: 'pending',
          },
          {
            id: 'phase-3',
            label: 'Withdraw PF',
            description: 'File your PF withdrawal claim (Form 31/19/10C)',
            taskType: 'withdraw_pf',
            plan: [
              { step: 'verify_identity', description: 'Verify your identity securely', status: 'pending' },
              { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' },
              { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' },
              { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' },
              { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' },
            ],
            status: 'pending',
          },
        ];
        const combinedPlan = phases.flatMap((phase, phaseIdx) =>
          phase.plan.map((step, stepIdx) => ({
            ...step,
            step: `phase${phaseIdx}_${step.step}`,
            status: (phaseIdx === 0 && stepIdx === phase.plan.findIndex(s => s.status === 'active')) ? 'active' as const : step.status,
          }))
        );
        wfStore.startTask('Fix my Aadhaar conflict, update KYC, and then withdraw PF', 'multi_phase', combinedPlan, phases);
        navigate('/smart-flow');
        break;
      }
      default:
        navigate('/');
        break;
    }
  };

  const stripLabel = (label: string) => label.replace(/^[^\s]+\s/, '');

  return (
    <div className='hidden lg:flex flex-col w-[280px] shrink-0 h-full bg-white border-r border-slate-200 overflow-hidden'>

      <div className='px-4 py-3 border-b border-slate-100'>
        <p className='text-[11px] font-semibold text-slate-400 uppercase tracking-widest'>Try Different Scenarios</p>
      </div>

      <div className='flex-1 overflow-y-auto py-2'>
        {DEMO_SCENARIOS.map(s => {
          const active = activeScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => applyScenario(s.id)}
              className={`w-full px-4 py-2.5 text-left text-[12px] transition-colors ${
                active
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className='block leading-snug'>{stripLabel(s.label)}</span>
              {active && (
                <span className='block text-[10px] text-slate-400 mt-0.5 font-normal'>
                  {SCENARIO_HINTS[s.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className='px-4 py-3 border-t border-slate-100'>
        <button
          onClick={() => applyScenario('happy')}
          className='w-full py-2 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center gap-1.5'
        >
          <RotateCcw className='w-3 h-3' />
          Reset
        </button>
      </div>
    </div>
  );
};
