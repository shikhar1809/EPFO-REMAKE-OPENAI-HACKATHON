import React, { useState } from 'react';
import { FileText, CheckCircle2, Clock, ChevronRight, AlertCircle, Send, X, Scale } from 'lucide-react';
import { useDemoStore } from '../../store/useDemoStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const ClaimTrackerCard: React.FC = () => {
  const activeScenario = useDemoStore((s) => s.activeScenario);
  const navigate = useNavigate();
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealFiled, setAppealFiled] = useState(false);

  let status = 'processing';
  if (activeScenario === 'claim_denied' || activeScenario === 'advance_rejected') {
    status = 'rejected';
  } else if (activeScenario === 'employer_hold') {
    status = 'employer';
  } else if (activeScenario === 'happy' || activeScenario.includes('multi_phase')) {
    status = 'field_office';
  }

  const canAppeal = status === 'rejected' || status === 'employer';
  const isDelayed = status === 'employer';

  const getStepStatus = (step: number) => {
    if (status === 'rejected') {
      if (step === 1) return 'done';
      if (step === 2) return 'rejected';
      return 'pending';
    }
    if (status === 'employer') {
      if (step === 1) return 'done';
      if (step === 2) return 'active';
      return 'pending';
    }
    if (status === 'field_office') {
      if (step <= 2) return 'done';
      if (step === 3) return 'active';
      return 'pending';
    }
    return 'pending';
  };

  const handleFileAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    setAppealFiled(true);
    toast.success('Appeal filed! Reference: APP-2026-08-4821', {
      icon: String.fromCodePoint(0x2696),
      duration: 4000,
    });
    setTimeout(() => setAppealOpen(false), 1500);
  };

  const Step = ({ title, date, state, isLast }: { title: string, date: string, state: 'done' | 'active' | 'pending' | 'rejected', isLast?: boolean }) => (
    <div className="flex gap-2.5 relative">
      {!isLast && (
        <div className={`absolute left-[7px] top-4 bottom-[-8px] w-0.5 ${state === 'done' ? 'bg-emerald-500' : 'bg-slate-100'}`} />
      )}
      <div className="relative z-10 shrink-0 mt-0.5">
        {state === 'done' ? (
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
          </div>
        ) : state === 'active' ? (
          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center ring-2 ring-amber-100">
            <Clock className="w-2.5 h-2.5 text-white" />
          </div>
        ) : state === 'rejected' ? (
          <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold inline-block leading-none">!</span>
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200" />
        )}
      </div>
      <div className="pb-2.5">
        <p className={`text-[11px] font-semibold ${state === 'active' ? 'text-amber-700' : state === 'rejected' ? 'text-rose-700' : state === 'done' ? 'text-slate-800' : 'text-slate-400'}`}>
          {title}
        </p>
        <p className="text-[9px] text-slate-500">{date}</p>
      </div>
    </div>
  );

  const appealReasons = isDelayed
    ? ['Employer not responding', 'Urgent medical need', 'Company closure']
    : ['Documents were submitted', 'Wrong rejection reason', 'Technical error at portal'];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div
        className="px-3 pt-2.5 pb-2 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => !appealOpen && navigate('/claim')}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <FileText className="!w-3.5 !h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Track Application</span>
          </div>
          <div className="text-[9px] font-bold text-epfo-blue hover:underline flex items-center">
            Form 31 <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="pl-1 mt-2.5">
          <Step title="Claim Submitted at Portal" date="24 Aug 2026, 10:30 AM" state={getStepStatus(1)} />
          <Step
            title={status === 'employer' ? 'Pending with Employer (SLA: Day 3/5)' : status === 'rejected' ? 'Claim Rejected by EPFO' : 'Sent to Field Office'}
            date={status === 'rejected' ? '25 Aug 2026, 02:15 PM' : (getStepStatus(1) === 'done' ? '24 Aug 2026, 10:35 AM' : '--')}
            state={getStepStatus(2)}
          />
          <Step title="Under Process at Field Office" date={getStepStatus(3) === 'active' ? '26 Aug 2026, 11:20 AM' : '--'} state={getStepStatus(3)} />
          <Step title="Settled" date="--" state={getStepStatus(4)} isLast />
        </div>

        {canAppeal && !appealFiled && (
          <div
            className={`mt-2 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 cursor-pointer ${isDelayed ? 'bg-amber-50 border border-amber-200' : 'bg-rose-50 border border-rose-200'}`}
            onClick={(e) => { e.stopPropagation(); setAppealOpen(true); }}
          >
            <div className="flex items-center gap-1.5">
              <AlertCircle className={`w-3 h-3 ${isDelayed ? 'text-amber-600' : 'text-rose-600'}`} />
              <p className={`text-[9px] font-bold ${isDelayed ? 'text-amber-700' : 'text-rose-700'}`}>
                {isDelayed ? 'Employer delayed 3+ days — file SLA appeal' : 'Rejected — file an appeal with EPFO'}
              </p>
            </div>
            <div className={`flex items-center gap-0.5 text-[9px] font-bold ${isDelayed ? 'text-amber-600' : 'text-rose-600'} whitespace-nowrap`}>
              <Scale className="w-3 h-3" /> File Appeal
            </div>
          </div>
        )}
        {appealFiled && (
          <div className="mt-2 rounded-xl px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <p className="text-[9px] font-bold text-emerald-700">Appeal filed — Ref: APP-2026-08-4821</p>
          </div>
        )}
      </div>

      {appealOpen && (
        <div className="border-t border-slate-100 px-3 py-2.5 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-epfo-blue" />
              <p className="text-[10px] font-bold text-slate-800">File Appeal</p>
            </div>
            <button onClick={() => setAppealOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 px-2.5 py-2 mb-2">
            <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Claim Reference</p>
            <p className="text-[10px] font-bold text-slate-800">#CLM-2026-08-4521 · Form 31 · Advance</p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              {isDelayed
                ? 'Employer: Infosys Ltd · SLA: 3 of 5 working days elapsed'
                : 'Reason: Insufficient documents provided'}
            </p>
          </div>

          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-1">Reason for Appeal</p>
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {appealReasons.map((r) => (
              <button
                key={r}
                onClick={() => setAppealReason(r)}
                className={`text-[9px] px-2 py-1 rounded-full border font-semibold transition-colors ${appealReason === r ? 'bg-epfo-blue text-white border-epfo-blue' : 'bg-white text-slate-600 border-slate-200 hover:border-epfo-blue'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleFileAppeal}
            disabled={!appealReason}
            className="mt-2 w-full flex items-center justify-center gap-1.5 bg-epfo-blue text-white text-[10px] font-bold py-2 rounded-lg disabled:opacity-40 transition-opacity"
          >
            <Send className="w-3 h-3" /> Submit Appeal to EPFO Grievance Cell
          </button>
          <p className="text-[8px] text-slate-400 text-center mt-1">
            Appeals under Sec. 7A EPF Act — Resolved within 30 days
          </p>
        </div>
      )}
    </div>
  );
};
