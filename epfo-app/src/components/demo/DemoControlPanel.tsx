import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useDemoStore, DEMO_SCENARIOS } from '../../store/useDemoStore';
import { useDataStore } from '../../store/useDataStore';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { buildMultiPhaseTaskAt } from '../../agents/compound';
import { generatePlan } from '../../agents/registry';
import { resetDemoBaseline } from '../../lib/demoReset';

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

  const applyScenario = (id: string) => {
    setScenario(id);
    resetDemoBaseline();

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
          wfStore.startTask('PF Withdrawal for medical', 'withdraw_pf', generatePlan('withdraw_pf').map(p => ({ ...p, status: 'completed' as const })));
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
        const { phases, combinedPlan } = buildMultiPhaseTaskAt(['kyc_mismatch', 'withdraw_pf'], 0, 3);
        wfStore.startTask('Fix my KYC mismatch and then withdraw PF', 'multi_phase', combinedPlan, phases);
        navigate('/smart-flow');
        break;
      }
      case 'multi_phase_exit': {
        const wfStore = useWorkflowStore.getState();
        wfStore.clearAllTasks();
        const { phases, combinedPlan } = buildMultiPhaseTaskAt(['mark_exit', 'withdraw_pf'], 0, 2);
        wfStore.startTask('Mark my exit date and then withdraw my PF', 'multi_phase', combinedPlan, phases);
        navigate('/smart-flow');
        break;
      }
      case 'multi_phase_merge': {
        const wfStore = useWorkflowStore.getState();
        wfStore.clearAllTasks();
        const { phases, combinedPlan } = buildMultiPhaseTaskAt(['merge_accounts', 'transfer_pf', 'withdraw_pf'], 0, 2);
        wfStore.startTask('Merge my old PF accounts, transfer balance, and then withdraw', 'multi_phase', combinedPlan, phases);
        navigate('/smart-flow');
        break;
      }
      case 'multi_phase_aadhaar': {
        const wfStore = useWorkflowStore.getState();
        wfStore.clearAllTasks();
        const { phases, combinedPlan } = buildMultiPhaseTaskAt(['kyc_mismatch', 'kyc_mismatch', 'withdraw_pf'], 0, 1);
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
