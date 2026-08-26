import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ArrowRight, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import toast from 'react-hot-toast';
import type { EmployerApproval } from '../../store/useWorkflowStore';

interface Props {
  employerApproval: EmployerApproval;
  taskId?: string;
}

const WORKING_DAYS_BETWEEN = (startMs: number, endMs: number): number => {
  let count = 0;
  const date = new Date(startMs);
  const end = new Date(endMs);
  while (date < end) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
    date.setDate(date.getDate() + 1);
  }
  return Math.max(count, 1);
};

export const EmployerApprovalStatus: React.FC<Props> = ({ employerApproval }) => {
  const navigate = useNavigate();
  const { startTask } = useWorkflowStore();
  const [reminderSent, setReminderSent] = useState(false);

  const { submittedAt, slaDays, employerName, escalated, taskReference } = employerApproval;
  const elapsedDays = WORKING_DAYS_BETWEEN(submittedAt, Date.now());
  const slaExceeded = elapsedDays > slaDays;
  const progress = Math.min(elapsedDays / slaDays, 1);

  const handleEscalate = () => {
    const plan = [
      { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
      { step: 'analyze_issue', description: 'Analyze rejection reason or delay', status: 'pending' as const },
      { step: 'select_grievance_type', description: 'Select the type of grievance', status: 'pending' as const },
      { step: 'register_grievance', description: 'Register EPFiGMS ticket automatically', status: 'pending' as const },
      { step: 'generate_reference', description: 'Generate tracking reference number', status: 'pending' as const }
    ];
    startTask(
      `Escalate: Employer ${employerName} has not responded to ${taskReference} after ${elapsedDays} working days`,
      'grievance',
      plan
    );
    navigate('/smart-flow');
  };

  const handleSendReminder = () => {
    setReminderSent(true);
    toast.success(`Reminder sent to ${employerName}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
      <div className='bg-white p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-1 h-full bg-blue-500'></div>

        <div className='flex justify-between items-start mb-4'>
          <div>
            <h3 className='font-bold text-slate-900 text-lg'>Pending Employer Approval</h3>
            <p className='text-sm text-slate-500'>Reference: {taskReference}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
            slaExceeded ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {slaExceeded ? 'Overdue' : 'In Progress'}
          </span>
        </div>

        {/* Progress bar */}
        <div className='mb-4'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-xs text-slate-500 font-medium'>
              Day {elapsedDays} of {slaDays} working days
            </span>
            <span className='text-xs text-slate-400'>
              {slaExceeded ? 'SLA exceeded' : `${slaDays - elapsedDays} days remaining`}
            </span>
          </div>
          <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                slaExceeded ? 'bg-red-500' : progress > 0.6 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className='mt-5 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent'>
          <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active'>
            <div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-green-500 text-white shadow shrink-0 z-10'>
              <CheckCircle2 className='w-4 h-4' />
            </div>
            <div className='w-[calc(100%-2.5rem)] ml-4'>
              <div className='flex flex-col'>
                <span className='text-sm font-bold text-slate-900'>Member Submitted</span>
                <span className='text-xs text-slate-500'>Submitted {new Date(submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-4'>
            <div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 shadow shrink-0 z-10'>
              <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
            </div>
            <div className='w-[calc(100%-2.5rem)] ml-4'>
              <div className='bg-blue-50 p-3 rounded-xl border border-blue-100'>
                <span className='text-sm font-bold text-blue-900 block'>Pending with Employer</span>
                <span className='text-xs text-blue-800 block mt-1'>{employerName} needs to approve this request.</span>
                {!reminderSent ? (
                  <button
                    onClick={handleSendReminder}
                    className='text-xs bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg mt-2 font-medium hover:bg-blue-50 flex items-center gap-1'
                  >
                    <Send className='w-3 h-3' /> Send Automatic Reminder
                  </button>
                ) : (
                  <span className='text-xs text-blue-600 mt-2 block font-medium'>Reminder sent</span>
                )}
              </div>
            </div>
          </div>

          <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-4'>
            <div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-slate-200 shadow shrink-0 z-10'></div>
            <div className='w-[calc(100%-2.5rem)] ml-4 opacity-50'>
              <div className='flex flex-col'>
                <span className='text-sm font-bold text-slate-700'>EPFO Field Office</span>
                <span className='text-xs text-slate-500'>Waiting for Employer Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation CTA when SLA exceeded */}
      {slaExceeded && !escalated && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className='bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start'>
            <AlertTriangle className='!w-6 !h-6 text-amber-600 shrink-0 mt-0.5' />
            <div className='flex-1'>
              <h4 className='font-bold text-amber-900 text-sm'>Employer hasn't responded</h4>
              <p className='text-xs text-amber-800 mt-1 leading-snug'>
                The SLA of {slaDays} working days has been exceeded. You can escalate this to the Regional PF Commissioner via EPFiGMS.
              </p>
              <button
                onClick={handleEscalate}
                className='mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1'
              >
                Escalate via Grievance <ArrowRight className='w-3 h-3' />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
