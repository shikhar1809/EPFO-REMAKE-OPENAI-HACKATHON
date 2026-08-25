import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle2, History as HistoryIcon, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { completedTasks } = useWorkflowStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = completedTasks.filter(task => 
    task.intent.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {searchQuery === '' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='mb-6'>
            <h2 className='text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1'>Active Requests</h2>
            <div className='bg-white p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden'>
              <div className='absolute top-0 left-0 w-1 h-full bg-blue-500'></div>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='font-bold text-slate-900 text-lg'>PF Transfer Request</h3>
                  <p className='text-sm text-slate-500'>TKT-9921 • Initiated 3 days ago</p>
                </div>
                <span className='bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide'>
                  Pending Employer
                </span>
              </div>
              
              {/* Timeline (Problem #4 / #9) */}
              <div className='mt-5 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent'>
                
                <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-green-500 text-white shadow shrink-0 z-10'>
                    <CheckCircle2 className='w-4 h-4' />
                  </div>
                  <div className='w-[calc(100%-2.5rem)] ml-4'>
                    <div className='flex flex-col'>
                      <span className='text-sm font-bold text-slate-900'>Member Submitted</span>
                      <span className='text-xs text-slate-500'>Completed immediately</span>
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
                      <span className='text-xs text-blue-800 block mt-1'>TCS (Tata Consultancy Services) needs to approve this transfer.</span>
                      <button className='text-xs bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg mt-2 font-medium hover:bg-blue-50'>
                        Send Automatic Reminder
                      </button>
                    </div>
                  </div>
                </div>

                <div className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-4'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-slate-200 shadow shrink-0 z-10'>
                  </div>
                  <div className='w-[calc(100%-2.5rem)] ml-4 opacity-50'>
                    <div className='flex flex-col'>
                      <span className='text-sm font-bold text-slate-700'>EPFO Field Office</span>
                      <span className='text-xs text-slate-500'>Waiting for Employer Approval</span>
                    </div>
                  </div>
                </div>

              </div>
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
