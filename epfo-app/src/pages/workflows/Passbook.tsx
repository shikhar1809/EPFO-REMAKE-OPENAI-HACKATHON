import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import { ArrowLeft, Download, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export const Passbook: React.FC = () => {
  const navigate = useNavigate();
  const { passbook } = useDataStore();
  const [filterYear, setFilterYear] = useState('All');

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

        <div className='mb-4 flex flex-col gap-3'>
          <div className='flex justify-between items-center'>
            <h3 className='font-bold text-slate-900'>Transaction History</h3>
            <button className='text-epfo-blue text-xs flex items-center gap-1 font-bold bg-blue-50 px-2 py-1 rounded-lg'>
              <Download className='w-3.5 h-3.5' /> Statement
            </button>
          </div>
          
          <div className='flex items-center gap-2'>
            <Filter className='w-4 h-4 text-slate-400' />
            <select 
              className='bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-epfo-blue font-medium'
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="All">All Time</option>
              <option value="2026">Financial Year 2026</option>
              <option value="2025">Financial Year 2025</option>
            </select>
          </div>
        </div>

        <div className='space-y-3 pb-8'>
          {passbook
            .filter(entry => filterYear === 'All' || entry.month.includes(filterYear))
            .map((entry) => (
            <div key={entry.id} className='bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center gap-4'>
              <div className='bg-green-50 text-green-600 p-2.5 rounded-xl shrink-0'>
                <Calendar className='w-5 h-5' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-start mb-0.5'>
                  <span className='font-bold text-slate-900 text-sm truncate'>{entry.month} Contribution</span>
                  <span className='font-bold text-green-600 text-sm'>+₹ {(entry.employeeShare + entry.employerShare).toLocaleString()}</span>
                </div>
                <div className='text-[10px] text-slate-400 mb-2'>
                  Credited on: <span className='font-medium text-slate-500'>{entry.date || `15 ${entry.month}`}</span>
                </div>
                <div className='flex items-center gap-3 text-[10px] text-slate-500'>
                  <div className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                    You: ₹{entry.employeeShare}
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 rounded-full bg-blue-500'></div>
                    Emp: ₹{entry.employerShare}
                  </div>
                  <div className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 rounded-full bg-orange-400'></div>
                    Pen: ₹{entry.pensionShare}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {passbook.filter(entry => filterYear === 'All' || entry.month.includes(filterYear)).length === 0 && (
            <div className='text-center text-slate-400 py-8 text-sm'>
              No transactions found for {filterYear}.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
