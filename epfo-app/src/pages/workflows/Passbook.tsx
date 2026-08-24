import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import { ArrowLeft, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export const Passbook: React.FC = () => {
  const navigate = useNavigate();
  const { passbook } = useDataStore();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className='flex-1 flex flex-col bg-transparent'>
      <div className='bg-white px-4 py-4 flex items-center sticky top-0 z-10'>
        <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-transparent'>
          <ArrowLeft className='w-5 h-5' />
        </button>
        <h1 className='text-lg font-medium ml-2'>Passbook</h1>
      </div>

      <div className='p-6 flex-1 overflow-y-auto'>
        <div className='bg-white rounded-3xl p-6 shadow-sm mb-6 text-center border border-slate-100'>
          <p className='text-slate-500 text-sm mb-1'>Last updated: Today, 09:30 AM</p>
          <h2 className='text-4xl font-bold text-slate-800 mb-6'>₹ 3,42,500</h2>

          <div className='flex gap-2 mb-2'>
            <div className='flex-1 bg-green-500 h-2 rounded-l-full'></div>
            <div className='flex-1 bg-blue-500 h-2'></div>
            <div className='flex-1 bg-orange-500 h-2 rounded-r-full'></div>
          </div>
          
          <div className='flex justify-between text-xs text-slate-600 mt-4'>
            <div className='text-left'>
              <div className='flex items-center gap-1'><div className='w-2 h-2 rounded-full bg-green-500'></div>Your Money</div>
              <p className='font-semibold text-slate-800 mt-1'>₹ 1,50,000</p>
            </div>
            <div className='text-center'>
              <div className='flex items-center gap-1 justify-center'><div className='w-2 h-2 rounded-full bg-blue-500'></div>Employer</div>
              <p className='font-semibold text-slate-800 mt-1'>₹ 1,42,500</p>
            </div>
            <div className='text-right'>
              <div className='flex items-center gap-1 justify-end'><div className='w-2 h-2 rounded-full bg-orange-500'></div>Interest</div>
              <p className='font-semibold text-slate-800 mt-1'>₹ 50,000</p>
            </div>
          </div>
        </div>

        <div className='mb-4 flex justify-between items-end'>
          <h3 className='font-medium text-slate-800'>Recent Contributions</h3>
          <button className='text-epfo-blue text-sm flex items-center gap-1 font-medium'>
            <Download className='w-4 h-4' /> PDF
          </button>
        </div>

        <div className='space-y-3'>
          {passbook.map((entry) => (
            <div key={entry.id} className='bg-white p-4 rounded-2xl shadow-sm border border-slate-100'>
              <div className='flex justify-between mb-2'>
                <span className='font-medium'>{entry.month}</span>
                <span className='font-semibold text-green-600'>+₹ {entry.employeeShare + entry.employerShare}</span>
              </div>
              <div className='text-xs text-slate-500 flex justify-between'>
                <span>You: ₹{entry.employeeShare}</span>
                <span>Employer: ₹{entry.employerShare}</span>
                <span>Pension: ₹{entry.pensionShare}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
