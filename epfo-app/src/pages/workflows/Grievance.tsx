import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquareWarning, Search, CheckCircle2, HeadphonesIcon, LifeBuoy, Phone, Mail } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Grievance: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'register' | 'track'>('register');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusResult, setStatusResult] = useState<string | null>(null);
  const [isResolvedByEPFO, setIsResolvedByEPFO] = useState(false);
  const [userClosedTicket, setUserClosedTicket] = useState<boolean | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusResult('EPFO Response: "Dear Member, your KYC has been successfully updated in our system. Ticket closed."');
    setIsResolvedByEPFO(true);
    setUserClosedTicket(null);
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-hidden relative'>

      {/* Hero Header — same style as the rest of the app */}
      <div className='relative shrink-0 overflow-hidden'>
        {/* Gradient background */}
        <div className='absolute inset-0 bg-gradient-to-br from-epfo-blue via-blue-600 to-indigo-700' />
        {/* Decorative blobs */}
        <div className='absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl' />
        <div className='absolute -bottom-4 -left-6 w-32 h-32 bg-blue-300/20 rounded-full blur-xl' />

        {/* Back button */}
        <div className='relative z-10 px-4 pt-4 pb-0 flex items-center'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 -ml-1 text-white/80 rounded-full hover:bg-white/10 transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
        </div>

        {/* Hero content */}
        <div className='relative z-10 px-6 pt-2 pb-8 flex flex-col items-center text-center'>
          <div className='w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 border border-white/20 shadow-lg'>
            <HeadphonesIcon className='w-7 h-7 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-white mb-1'>Support & Grievance</h1>
          <p className='text-sm text-blue-100 max-w-xs leading-relaxed'>
            File a complaint or track your existing ticket. We're here to help.
          </p>
        </div>

        {/* Tab switcher embedded in the hero bottom */}
        <div className='relative z-10 px-4 pb-0'>
          <div className='bg-white/15 backdrop-blur-sm rounded-2xl p-1 flex border border-white/20'>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white text-epfo-blue shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'track'
                  ? 'bg-white text-epfo-blue shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Track Status
            </button>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className='relative z-10 h-5 bg-slate-50 rounded-t-3xl mt-3' />
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto px-5 pb-10 -mt-1 bg-slate-50'>
        <AnimatePresence mode='wait'>
          {activeTab === 'register' && (
            <motion.div
              key='register'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='space-y-4'
            >
              {!isSubmitted ? (
                <>
                  {/* Info card */}
                  <div className='bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3'>
                    <MessageSquareWarning className='w-5 h-5 text-blue-600 shrink-0 mt-0.5' />
                    <p className='text-sm text-blue-800 leading-relaxed'>
                      File a complaint regarding PF withdrawal, pension, or transfer delays. No login required.
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className='space-y-3'>
                    <Input type='text' placeholder='Full Name' required />
                    <Input type='tel' placeholder='Mobile Number' required />
                    <Input type='text' placeholder='UAN (Optional)' />
                    <div className='space-y-1.5'>
                      <label className='text-sm font-medium text-slate-700 ml-1'>Description</label>
                      <textarea
                        className='w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-epfo-blue focus:ring-2 focus:ring-epfo-blue/20 transition-all min-h-[110px] resize-none shadow-sm'
                        placeholder='Describe your issue clearly...'
                        required
                      />
                    </div>
                    <Button type='submit' className='w-full py-3.5 text-base font-semibold shadow-md'>
                      Submit Grievance
                    </Button>
                  </form>

                  {/* Contact alternatives */}
                  <div className='mt-4'>
                    <p className='text-xs text-slate-400 text-center mb-3 font-medium uppercase tracking-wider'>Or reach us via</p>
                    <div className='grid grid-cols-2 gap-3'>
                      <a href='tel:18001180026' className='flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0'>
                          <Phone className='w-4 h-4 text-green-600' />
                        </div>
                        <div>
                          <p className='text-[10px] text-slate-400 font-medium'>Toll Free</p>
                          <p className='text-xs font-bold text-slate-800'>1800-118-0026</p>
                        </div>
                      </a>
                      <a href='mailto:grievance@epfindia.gov.in' className='flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0'>
                          <Mail className='w-4 h-4 text-blue-600' />
                        </div>
                        <div>
                          <p className='text-[10px] text-slate-400 font-medium'>Email</p>
                          <p className='text-xs font-bold text-slate-800 truncate'>EPFO Mail</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='text-center py-10 space-y-4'
                >
                  <div className='w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-100'>
                    <CheckCircle2 className='w-10 h-10 text-green-500' />
                  </div>
                  <h2 className='text-2xl font-bold text-slate-900'>Grievance Registered!</h2>
                  <p className='text-slate-500 leading-relaxed px-4'>
                    Your ticket number is{' '}
                    <span className='font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg'>TKT-9921</span>.
                    {' '}You will receive an SMS confirmation shortly.
                  </p>
                  <Button
                    variant='outline'
                    className='w-full mt-4'
                    onClick={() => { setIsSubmitted(false); setActiveTab('track'); }}
                  >
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
              className='space-y-4'
            >
              <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3'>
                <div className='flex items-center gap-2 mb-1'>
                  <LifeBuoy className='w-4 h-4 text-epfo-blue' />
                  <span className='text-sm font-semibold text-slate-800'>Track your ticket</span>
                </div>
                <form onSubmit={handleTrack} className='space-y-3'>
                  <Input type='text' placeholder='Ticket Number (e.g., TKT-9921)' required />
                  <Input type='tel' placeholder='Registered Mobile Number' required />
                  <Button type='submit' className='w-full'>
                    <Search className='w-4 h-4 mr-2' /> Check Status
                  </Button>
                </form>
              </div>

              {statusResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex flex-col gap-3'
                >
                  <div className='p-5 bg-white border border-slate-200 shadow-sm rounded-2xl'>
                    <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2'>
                      <CheckCircle2 className='w-4 h-4 text-green-500' />
                      Status: Resolved by EPFO
                    </h3>
                    <p className='text-slate-800 leading-relaxed text-sm font-medium'>{statusResult}</p>
                  </div>

                  {isResolvedByEPFO && userClosedTicket === null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-blue-50 border border-blue-200 p-5 rounded-2xl'>
                      <h4 className='text-blue-900 font-bold mb-1'>Did this actually solve your issue?</h4>
                      <p className='text-sm text-blue-700 mb-4'>Tickets are no longer auto-closed. You must confirm the issue is fixed.</p>
                      <div className='flex gap-3'>
                        <Button className='flex-1 bg-green-600 hover:bg-green-700 text-white' onClick={() => setUserClosedTicket(true)}>
                          Yes, it's fixed
                        </Button>
                        <Button className='flex-1 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 border' onClick={() => setUserClosedTicket(false)}>
                          No, Reopen
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {userClosedTicket === true && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center gap-3'>
                      <CheckCircle2 className='w-5 h-5 text-green-600 shrink-0' />
                      <p className='text-sm text-green-800 font-semibold'>Ticket permanently closed. Thank you for confirming!</p>
                    </motion.div>
                  )}

                  {userClosedTicket === false && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-orange-50 border border-orange-200 p-4 rounded-2xl flex flex-col gap-3'>
                      <p className='text-sm text-orange-800 font-semibold'>Ticket reopened and escalated to Level 2 Support.</p>
                      <textarea className='w-full p-3 rounded-xl border border-orange-200 text-sm bg-white' placeholder='Please explain what is still not working...' />
                      <Button className='bg-orange-600 hover:bg-orange-700 text-white'>Submit Escalation</Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
