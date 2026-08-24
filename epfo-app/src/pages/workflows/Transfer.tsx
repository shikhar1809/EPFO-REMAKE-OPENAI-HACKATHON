import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CircleDashed, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Transfer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className='flex-1 flex flex-col bg-slate-50'>
      <div className='bg-white px-4 py-4 flex items-center sticky top-0 z-10'>
        <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-50'>
          <ArrowLeft className='w-5 h-5' />
        </button>
        <h1 className='text-lg font-medium ml-2'>Job Switch / Transfer</h1>
      </div>

      <div className='p-6 flex-1 overflow-y-auto'>
        <div className='bg-blue-50 text-blue-800 p-4 rounded-2xl mb-6 text-sm leading-relaxed'>
          Good news! Since your UAN is Aadhaar-linked, your PF balance transfers automatically to your new employer. You don't need to submit a manual request.
        </div>

        <h3 className='font-medium text-slate-800 mb-4'>Transfer Status Tracker</h3>
        
        <div className='bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6'>
          <div className='flex justify-between items-center mb-8'>
            <div className='text-center flex-1'>
              <p className='text-xs text-slate-500 mb-1'>Previous</p>
              <p className='font-medium text-sm truncate px-2'>Tech Solutions</p>
            </div>
            <ArrowRight className='w-5 h-5 text-slate-300' />
            <div className='text-center flex-1'>
              <p className='text-xs text-slate-500 mb-1'>Current</p>
              <p className='font-medium text-sm truncate px-2'>Global Inc</p>
            </div>
          </div>

          <div className='relative'>
            <div className='absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100'></div>
            
            <div className='space-y-6'>
              <div className='relative flex gap-4'>
                <div className='bg-white relative z-10'><CheckCircle2 className='w-8 h-8 text-green-500' /></div>
                <div>
                  <h4 className='font-medium text-slate-800'>Auto-Merge Initiated</h4>
                  <p className='text-xs text-slate-500'>We detected your new employment.</p>
                </div>
              </div>
              
              <div className='relative flex gap-4'>
                <div className='bg-white relative z-10'><CircleDashed className='w-8 h-8 text-blue-500 animate-[spin_3s_linear_infinite]' /></div>
                <div>
                  <h4 className='font-medium text-slate-800'>Employer Verification</h4>
                  <p className='text-xs text-slate-500'>Waiting for Global Inc to verify details. They usually take 3-5 days.</p>
                </div>
              </div>

              <div className='relative flex gap-4 opacity-40'>
                <div className='bg-white relative z-10'><CircleDashed className='w-8 h-8 text-slate-300' /></div>
                <div>
                  <h4 className='font-medium text-slate-800'>Funds Merged</h4>
                  <p className='text-xs text-slate-500'>Your previous balance will reflect here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
