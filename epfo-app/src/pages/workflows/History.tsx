import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle2, History as HistoryIcon, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { EmployerApprovalStatus } from '../../components/ui/EmployerApprovalStatus';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { completedTasks, activeTasks } = useWorkflowStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = completedTasks.filter(task => 
    task.intent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingEmployerTasks = Object.values(activeTasks).filter(
    t => t.agentState === 'pending_employer' && t.employerApproval
  );

  const filteredPending = searchQuery
    ? pendingEmployerTasks.filter(t => t.intent.toLowerCase().includes(searchQuery.toLowerCase()))
    : pendingEmployerTasks;

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-hidden relative'>
      <div className='bg-white px-6 py-4 flex items-center border-b border-slate-200 z-10'>
        <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-transparent transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </button>
        <h1 className='text-lg font-semibold ml-2 flex items-center gap-2'>
          <HistoryIcon className='w-5 h-5 text-epfo-blue' />
          Past Requests
        </h1>
      </div>

      <div className='flex-1 flex flex-col p-6 overflow-y-auto'>
        {/* Search Bar */}
        <div className='relative mb-6'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
          <input 
            type="text" 
            placeholder="Search past requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-epfo-blue/50 text-slate-700'
          />
          <button className='absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-epfo-blue transition-colors'>
            <SlidersHorizontal className='w-5 h-5' />
          </button>
        </div>

        {searchQuery === '' && filteredPending.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='mb-6'>
            <h2 className='text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1'>Active Requests</h2>
            <div className='space-y-3'>
              {filteredPending.map(task => (
                <EmployerApprovalStatus
                  key={task.taskId}
                  employerApproval={task.employerApproval!}
                  taskId={task.taskId}
                />
              ))}
            </div>
          </motion.div>
        )}

        {filteredTasks.length === 0 ? (
          <div className='flex flex-col items-center justify-center flex-1 text-slate-500 opacity-80'>
            <HistoryIcon className='w-16 h-16 mb-4 text-slate-300' />
            <p className="text-lg font-medium text-slate-600 mb-2">No requests found</p>
            <p className="text-sm text-center mb-6">You haven't made any requests yet, or none match your search.</p>
            <button 
              onClick={() => navigate('/')}
              className='bg-epfo-blue text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md'
            >
              Start your first request →
            </button>
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className='space-y-3'>
            {filteredTasks.map(task => (
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} 
                key={task.taskId} 
                className='bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4'
              >
                <div className='bg-green-50 p-3 rounded-full text-green-600 shrink-0 mt-1'>
                  <CheckCircle2 className='w-6 h-6' />
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-slate-900 text-lg leading-tight'>{task.intent}</p>
                  <div className='flex items-center gap-2 mt-2'>
                    <span className='bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium'>
                      {new Date(task.lastCheckpoint).toLocaleDateString()}
                    </span>
                    <span className='bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium'>
                      Completed
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
