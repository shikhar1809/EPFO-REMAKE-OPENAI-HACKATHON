import React from 'react';
import { History, Play, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { WorkflowTask } from '../../store/useWorkflowStore';

interface Props {
  sessions: WorkflowTask[];
  flowChoice: 'agentic' | 'traditional';
  onResume: (taskId: string) => void;
  onStartFresh: () => void;
  onCancel: () => void;
  onDelete: (taskId: string) => void;
}

export const ActiveSessionsPrompt: React.FC<Props> = ({
  sessions,
  flowChoice,
  onResume,
  onStartFresh,
  onCancel,
  onDelete,
}) => {
  if (sessions.length === 0) return null;

  const flowName = flowChoice === 'agentic' ? 'Smart Flow' : 'Traditional Flow';
  const count = sessions.length;

  return (
    <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl w-full max-w-[400px] max-h-[88vh] overflow-y-auto p-6 shadow-2xl space-y-5'>
        <div className='flex items-start gap-3'>
          <div className='w-9 h-9 rounded-xl bg-epfo-blue/10 text-epfo-blue flex items-center justify-center shrink-0'>
            <History className='!w-5 !h-5' />
          </div>
          <div>
            <h2 className='text-base font-bold text-slate-900 leading-snug'>Active Sessions Found</h2>
            <p className='text-xs text-slate-500 mt-0.5 leading-relaxed'>
              You have {count} active workflow{count !== 1 ? 's' : ''} in progress. Resume one to continue where you left off, or start a fresh {flowName}.
            </p>
          </div>
        </div>

        <div className='space-y-2 max-h-[260px] overflow-y-auto scroll-thin pr-1'>
          {sessions.map(task => (
            <div
              key={task.taskId}
              className='p-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 flex items-start justify-between gap-2'
            >
              <div className='min-w-0'>
                <p className='text-xs font-bold text-slate-900 truncate'>{task.intent}</p>
                <p className='text-[11px] text-slate-500 mt-0.5'>
                  <span className='font-semibold text-orange-600 capitalize'>{task.agentState.replace('_', ' ')}</span>{' '}
                  • Last active{' '}
                  {new Date(task.lastCheckpoint).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className='flex items-center gap-1 shrink-0'>
                <button
                  onClick={() => onDelete(task.taskId)}
                  className='p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                  title='Delete session'
                  aria-label='Delete session'
                >
                  <Trash2 className='!w-4 !h-4' />
                </button>
                <Button
                  onClick={() => onResume(task.taskId)}
                  className='shrink-0 gap-1 text-[11px] py-1.5 px-3 font-bold'
                >
                  <Play className='w-3 h-3 fill-current' /> Resume
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className='space-y-2 pt-1 border-t border-slate-100'>
          <Button className='w-full justify-center gap-1.5' onClick={onStartFresh}>
            Start Fresh in {flowName} <ArrowRight className='w-3.5 h-3.5' />
          </Button>
          <button
            onClick={onCancel}
            className='w-full text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1'
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};