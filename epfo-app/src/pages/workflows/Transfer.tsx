import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  CircleDashed, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const Transfer: React.FC = () => {
  const navigate = useNavigate();

  // Discovered unmerged accounts linked to the user's Aadhaar/PAN
  const [unmergedAccounts, setUnmergedAccounts] = useState([
    {
      id: 'ACC-2019',
      establishment: 'Zenith Retail Services Pvt Ltd',
      memberId: 'GNBAN0048190000003192',
      period: '2019 - 2021',
      balance: '₹42,300',
      status: 'UNMERGED',
      annexureK: 'Pending Transfer'
    },
    {
      id: 'ACC-2022',
      establishment: 'QuickLogistics Express Ltd',
      memberId: 'DLCPM0091820000008471',
      period: '2022 - 2024',
      balance: '₹68,150',
      status: 'UNMERGED',
      annexureK: 'Pending Transfer'
    }
  ]);

  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidationDone, setConsolidationDone] = useState(false);

  const handle1TapConsolidate = () => {
    setIsConsolidating(true);
    setTimeout(() => {
      setIsConsolidating(false);
      setConsolidationDone(true);
      setUnmergedAccounts(prev => prev.map(acc => ({
        ...acc,
        status: 'MERGED_PROCESSING',
        annexureK: 'Annexure K Generated'
      })));
      toast.success('One Member - One EPF transfer request placed for all accounts!');
    }, 2500);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className='flex-1 flex flex-col bg-transparent overflow-y-auto pb-12'>
      {/* Top Bar */}
      <div className='bg-white/90 backdrop-blur-md px-4 py-4 flex items-center sticky top-0 z-20 border-b border-slate-100 shadow-sm'>
        <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </button>
        <div className='ml-2 flex-1'>
          <h1 className='text-lg font-bold text-slate-900 leading-tight'>Transfer & Service Merge</h1>
          <p className='text-xs text-slate-500 font-medium'>One Member - One EPF Consolidation</p>
        </div>
      </div>

      <div className='p-5 space-y-5 max-w-md mx-auto w-full'>
        
        {/* ONE MEMBER - ONE EPF DISCOVERY CARD */}
        <div className='bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden'>
          <div className='absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none' />
          
          <div className='flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider'>
            <Layers className='w-4 h-4 text-cyan-300' />
            Multi-Account Discovery
          </div>

          <h2 className='text-xl font-bold text-white mt-2'>
            {consolidationDone ? 'Consolidation in Progress' : '2 Past PF Accounts Found!'}
          </h2>
          
          <p className='text-xs text-indigo-100 mt-1 leading-relaxed'>
            {consolidationDone 
              ? 'Transfer requests submitted. All service years and ₹1,10,450 are merging into your active UAN.'
              : 'Our scanner found ₹1,10,450 in past unmerged accounts linked to your Aadhaar. Merge them to protect your pension service years.'}
          </p>

          {!consolidationDone ? (
            <div className='mt-4 pt-4 border-t border-white/20 flex items-center justify-between'>
              <div>
                <p className='text-[10px] text-indigo-200 uppercase font-semibold'>Total Unmerged Funds</p>
                <p className='text-xl font-extrabold text-cyan-300 font-mono'>₹1,10,450</p>
              </div>
              <Button 
                onClick={handle1TapConsolidate}
                disabled={isConsolidating}
                className='bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5'
              >
                {isConsolidating ? (
                  <>
                    <RefreshCw className='w-3.5 h-3.5 animate-spin' /> Merging...
                  </>
                ) : (
                  <>
                    <Sparkles className='w-3.5 h-3.5' /> 1-Tap Merge All
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className='mt-4 pt-3 border-t border-white/20 flex items-center gap-2 text-xs font-semibold text-emerald-300'>
              <CheckCircle2 className='w-4 h-4' />
              <span>Transfers Tracked under EPF Scheme 1952</span>
            </div>
          )}
        </div>

        {/* UNMERGED / CONSOLIDATED ACCOUNTS LIST */}
        <div className='space-y-3'>
          <h3 className='text-xs font-bold text-slate-800 uppercase tracking-wider px-1'>
            {consolidationDone ? 'Transferring Establishments' : 'Discovered Past Establishments'}
          </h3>

          {unmergedAccounts.map(acc => (
            <div key={acc.id} className='bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <Building2 className='w-4 h-4 text-epfo-blue shrink-0' />
                  <h4 className='font-bold text-slate-900 text-sm leading-tight'>{acc.establishment}</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  acc.status === 'UNMERGED' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {acc.status === 'UNMERGED' ? 'Unmerged' : 'Transferring'}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1'>
                <div>
                  <p className='text-[10px] text-slate-400'>Service Period</p>
                  <p className='font-medium text-slate-700'>{acc.period}</p>
                </div>
                <div>
                  <p className='text-[10px] text-slate-400'>Unclaimed Balance</p>
                  <p className='font-bold text-slate-900 font-mono'>{acc.balance}</p>
                </div>
              </div>

              <div className='pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500'>
                <span className='font-mono truncate max-w-[180px]'>{acc.memberId}</span>
                <span className='flex items-center gap-1 text-epfo-blue font-medium'>
                  <FileSpreadsheet className='w-3.5 h-3.5' /> {acc.annexureK}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ACTIVE TRANSFER STATUS TRACKER */}
        <div className='space-y-3 pt-2'>
          <h3 className='text-xs font-bold text-slate-800 uppercase tracking-wider px-1'>
            Active Job-Switch Transfer
          </h3>
          
          <div className='bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-200'>
            <div className='flex justify-between items-center mb-6 pb-4 border-b border-slate-100'>
              <div className='text-center flex-1'>
                <p className='text-[10px] uppercase font-bold text-slate-400 mb-0.5'>Previous Employer</p>
                <p className='font-bold text-xs text-slate-800 truncate px-1'>Tech Solutions</p>
              </div>
              <ArrowRight className='w-4 h-4 text-epfo-blue shrink-0' />
              <div className='text-center flex-1'>
                <p className='text-[10px] uppercase font-bold text-slate-400 mb-0.5'>Current Employer</p>
                <p className='font-bold text-xs text-slate-800 truncate px-1'>Global Inc</p>
              </div>
            </div>

            <div className='relative pl-2'>
              <div className='absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200'></div>
              
              <div className='space-y-5'>
                <div className='relative flex gap-3'>
                  <div className='bg-white relative z-10 rounded-full shadow-sm'>
                    <CheckCircle2 className='w-6 h-6 text-green-600' />
                  </div>
                  <div>
                    <h4 className='font-bold text-xs text-slate-800'>Auto-Merge Initiated</h4>
                    <p className='text-[11px] text-slate-500 mt-0.5'>Detected new employment contribution.</p>
                  </div>
                </div>
                
                <div className='relative flex gap-3'>
                  <div className='bg-white relative z-10 rounded-full shadow-sm'>
                    <CircleDashed className='w-6 h-6 text-blue-600 animate-[spin_3s_linear_infinite]' />
                  </div>
                  <div>
                    <h4 className='font-bold text-xs text-slate-800'>Attestation & Annexure K</h4>
                    <p className='text-[11px] text-slate-500 mt-0.5'>Field office reconciling ledger balance.</p>
                  </div>
                </div>

                <div className='relative flex gap-3 opacity-40'>
                  <div className='bg-white relative z-10 rounded-full'>
                    <CircleDashed className='w-6 h-6 text-slate-400' />
                  </div>
                  <div>
                    <h4 className='font-bold text-xs text-slate-800'>Final Credit to Passbook</h4>
                    <p className='text-[11px] text-slate-500 mt-0.5'>Funds reflected in active balance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
