import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquareWarning, Search, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Grievance: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'register' | 'track'>('register');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusResult, setStatusResult] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusResult('Your grievance (TKT-9921) is currently Under Review by the regional office. Expected resolution in 3 days.');
  };

  return (
    <div className='flex-1 flex flex-col bg-white overflow-hidden relative'>
      {/* Header */}
      <div className='px-6 py-5 flex items-center border-b border-slate-100 z-10 bg-white/80 backdrop-blur-md'>
        <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-transparent transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </button>
        <h1 className='text-lg font-semibold ml-2'>Grievance Redressal</h1>
      </div>

      {/* Tabs */}
      <div className='flex p-2 bg-transparent m-6 rounded-xl relative'>
        <div 
          className='absolute inset-y-2 w-[calc(50%-8px)] bg-white rounded-lg shadow-sm transition-all duration-300'
          style={{ left: activeTab === 'register' ? '8px' : 'calc(50% + 0px)' }}
        />
        <button 
          onClick={() => setActiveTab('register')}
          className={'flex-1 py-3 text-sm font-medium z-10 transition-colors ' + (activeTab === 'register' ? 'text-slate-900' : 'text-slate-500')}
        >
          Register
        </button>
        <button 
          onClick={() => setActiveTab('track')}
          className={'flex-1 py-3 text-sm font-medium z-10 transition-colors ' + (activeTab === 'track' ? 'text-slate-900' : 'text-slate-500')}
        >
          Track Status
        </button>
      </div>

      <div className='flex-1 overflow-y-auto px-6 pb-24'>
        <AnimatePresence mode='wait'>
          {activeTab === 'register' && (
            <motion.div
              key='register'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!isSubmitted ? (
                <form onSubmit={handleRegister} className='space-y-5'>
                  <div className='bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 mb-2'>
                    <MessageSquareWarning className='w-5 h-5 text-blue-600 shrink-0 mt-0.5' />
                    <p className='text-sm text-blue-800 leading-relaxed'>
                      File a complaint regarding PF withdrawal, pension, or transfer delays. No login required.
                    </p>
                  </div>
                  
                  <Input type='text' placeholder='Full Name' required />
                  <Input type='tel' placeholder='Mobile Number' required />
                  <Input type='text' placeholder='UAN (Optional)' />
                  
                  <div className='space-y-1.5'>
                    <label className='text-sm font-medium text-slate-700 ml-1'>Description</label>
                    <textarea 
                      className='w-full bg-transparent border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-4 focus:outline-none focus:border-epfo-blue focus:ring-1 focus:ring-epfo-blue transition-all min-h-[120px] resize-none'
                      placeholder='Describe your issue clearly...'
                      required
                    />
                  </div>

                  <Button type='submit' className='w-full mt-4'>Submit Grievance</Button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='text-center py-12 space-y-4'
                >
                  <div className='w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <CheckCircle2 className='w-10 h-10 text-green-500' />
                  </div>
                  <h2 className='text-2xl font-semibold'>Grievance Registered</h2>
                  <p className='text-slate-500'>Your ticket number is <span className='font-bold text-slate-900'>TKT-9921</span>. You will receive an SMS confirmation shortly.</p>
                  <Button variant='outline' className='w-full mt-8' onClick={() => { setIsSubmitted(false); setActiveTab('track'); }}>
                    Track this Ticket
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div
              key='track'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleTrack} className='space-y-5'>
                <Input type='text' placeholder='Ticket Number (e.g., TKT-9921)' required />
                <Input type='tel' placeholder='Mobile Number' required />
                
                <Button type='submit' className='w-full'>
                  <Search className='w-4 h-4 mr-2' /> Check Status
                </Button>
              </form>

              {statusResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='mt-8 p-5 bg-transparent border border-slate-200 rounded-2xl'
                >
                  <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2'>Current Status</h3>
                  <p className='text-slate-800 leading-relaxed'>{statusResult}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
