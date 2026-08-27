import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquareWarning, Search, CheckCircle2, HeadphonesIcon, LifeBuoy, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useTranslation } from 'react-i18next';

export const Grievance: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completedTasks } = useWorkflowStore();
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
    setStatusResult('gr_epfo_response');
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
            aria-label={t('home_aria_back_dashboard')}
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
          <h1 className='text-2xl font-bold text-white mb-1'>{t('gr_title')}</h1>
          <p className='text-sm text-blue-100 max-w-xs leading-relaxed'>
            {t('gr_subtitle')}
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
              {t('gr_tab_register')}
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'track'
                  ? 'bg-white text-epfo-blue shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {t('gr_tab_track')}
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
                      {t('gr_info_desc')}
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className='space-y-3' role="form">
                    <Input type='text' placeholder={t('gr_full_name')} required aria-label={t('gr_aria_full_name')} />
                    <Input type='tel' placeholder={t('gr_mobile')} required aria-label={t('gr_aria_mobile')} />
                    <Input type='text' placeholder={t('gr_uan_optional')} aria-label={t('gr_aria_uan')} />
                    <div className='space-y-1.5'>
                      <label htmlFor="grievance-desc" className='text-sm font-medium text-slate-700 ml-1'>{t('gr_description')}</label>
                      <textarea
                        id="grievance-desc"
                        className='w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-epfo-blue focus:ring-2 focus:ring-epfo-blue/20 transition-all min-h-[110px] resize-none shadow-sm'
                        placeholder={t('gr_desc_placeholder')}
                        required
                      />
                    </div>
                    <Button type='submit' className='w-full py-3.5 text-base font-semibold shadow-md' aria-label={t('gr_aria_submit')}>
                      {t('gr_submit')}
                    </Button>
                  </form>

                  {/* Contact alternatives */}
                  <div className='mt-4'>
                    <p className='text-xs text-slate-400 text-center mb-3 font-medium uppercase tracking-wider'>{t('gr_or_reach')}</p>
                    <div className='grid grid-cols-2 gap-3'>
                      <a href='tel:18001180026' className='flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0'>
                          <Phone className='w-4 h-4 text-green-600' />
                        </div>
                        <div>
                          <p className='text-[10px] text-slate-400 font-medium'>{t('gr_toll_free')}</p>
                          <p className='text-xs font-bold text-slate-800'>1800-118-0026</p>
                        </div>
                      </a>
                      <a href='mailto:grievance@epfindia.gov.in' className='flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-shadow'>
                        <div className='w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0'>
                          <Mail className='w-4 h-4 text-blue-600' />
                        </div>
                        <div>
                          <p className='text-[10px] text-slate-400 font-medium'>{t('gr_email')}</p>
                          <p className='text-xs font-bold text-slate-800 truncate'>{t('gr_email_label')}</p>
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
                  <h2 className='text-2xl font-bold text-slate-900'>{t('gr_registered_title')}</h2>
                  <p className='text-slate-500 leading-relaxed px-4'>
                    {t('gr_registered_prefix')}{' '}
                    <span className='font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg'>TKT-9921</span>.
                    {' '}{t('gr_registered_suffix')}
                  </p>
                  <Button
                    variant='outline'
                    className='w-full mt-4'
                    onClick={() => { setIsSubmitted(false); setActiveTab('track'); }}
                  >
                    {t('gr_track_this_ticket')}
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
                  <span className='text-sm font-semibold text-slate-800'>{t('gr_track_your_ticket')}</span>
                </div>
                <form onSubmit={handleTrack} className='space-y-3' role="form">
                  <Input type='text' placeholder={t('gr_ticket_placeholder')} required aria-label={t('gr_aria_ticket')} />
                  <Input type='tel' placeholder={t('gr_mobile_placeholder')} required aria-label={t('gr_aria_registered_mobile')} />
                  <Button type='submit' className='w-full' aria-label={t('gr_aria_check')}>
                    <Search className='w-4 h-4 mr-2' /> {t('gr_check_status')}
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
                      {t('gr_status_resolved')}
                    </h3>
                    <p className='text-slate-800 leading-relaxed text-sm font-medium'>{t(statusResult)}</p>
                  </div>

                  {(() => {
                    const recentGrievance = completedTasks.find(t => t.taskType === 'grievance' && t.grievanceType);
                    if (!recentGrievance) return null;
                    if (recentGrievance.grievanceType === 'employer_not_depositing') {
                      return (
                        <div className='bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start'>
                          <AlertTriangle className='w-5 h-5 text-amber-600 shrink-0 mt-0.5' />
                          <div>
                            <p className='text-xs font-bold text-amber-900'>{t('gr_non_deposit_title')}</p>
                            <p className='text-xs text-amber-800 mt-1'>{t('gr_non_deposit_desc')}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {isResolvedByEPFO && userClosedTicket === null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-blue-50 border border-blue-200 p-5 rounded-2xl'>
                      <h4 className='text-blue-900 font-bold mb-1'>{t('gr_issue_solved')}</h4>
                      <p className='text-sm text-blue-700 mb-4'>{t('gr_issue_solved_desc')}</p>
                      <div className='flex gap-3'>
                        <Button className='flex-1 bg-green-600 hover:bg-green-700 text-white' onClick={() => setUserClosedTicket(true)}>
                          {t('gr_yes_fixed')}
                        </Button>
                        <Button className='flex-1 bg-white text-slate-700 border-slate-300 hover:bg-slate-50 border' onClick={() => setUserClosedTicket(false)}>
                          {t('gr_no_reopen')}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {userClosedTicket === true && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center gap-3'>
                      <CheckCircle2 className='w-5 h-5 text-green-600 shrink-0' />
                      <p className='text-sm text-green-800 font-semibold'>{t('gr_closed')}</p>
                    </motion.div>
                  )}

                  {userClosedTicket === false && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-orange-50 border border-orange-200 p-4 rounded-2xl flex flex-col gap-3'>
                      <p className='text-sm text-orange-800 font-semibold'>{t('gr_reopened')}</p>
                      <textarea id="grievance-escalation" className='w-full p-3 rounded-xl border border-orange-200 text-sm bg-white' placeholder={t('gr_escalation_placeholder')} />
                      <Button className='bg-orange-600 hover:bg-orange-700 text-white' aria-label={t('gr_aria_submit_escalation')}>{t('gr_submit_escalation')}</Button>
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
