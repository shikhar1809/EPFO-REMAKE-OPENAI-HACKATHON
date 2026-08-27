import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Server, AlertTriangle, Clock, Smartphone, Headphones } from 'lucide-react';
import { useServerStatusStore } from '../store/useServerStatusStore';
import { useTranslation } from 'react-i18next';

export const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { status, latencyMs } = useServerStatusStore();
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          label: t('status_operational', 'Operational'),
          dotColor: 'bg-emerald-500',
          pulseColor: 'bg-emerald-400',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          desc: t('stp_desc_healthy'),
          uptime: '99.98%'
        };
      case 'medium':
        return {
          label: t('status_degraded', 'Degraded'),
          dotColor: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          desc: t('stp_desc_medium'),
          uptime: '99.85%'
        };
      case 'heavy':
        return {
          label: t('status_down', 'Down'),
          dotColor: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          desc: t('stp_desc_heavy'),
          uptime: '99.12%'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-hidden relative'>
      {/* Hero Header */}
      <div className='bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-5 pb-10 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-0 w-48 h-48 bg-blue-300 rounded-full blur-3xl' />
        </div>
        <div className='relative z-10'>
          <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-white/80 rounded-full hover:bg-white/10 transition-colors mb-3'>
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div className='text-center'>
            <div className='w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20'>
              <Activity className='w-7 h-7 text-white' />
            </div>
            <h1 className='text-xl font-bold text-white'>{t('status_page_title', 'System Status')}</h1>
            <p className='text-sm text-blue-100 mt-1'>{t('status_page_subtitle', 'Real-time EPFO infrastructure health')}</p>
          </div>
        </div>
        <div className='absolute bottom-0 left-0 right-0 h-6 bg-slate-50 rounded-t-3xl' />
      </div>

      <div className='flex-1 flex flex-col p-6 space-y-4 overflow-y-auto -mt-2'>
        {/* Overall Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`p-4 rounded-2xl border ${config.badgeClass} shadow-xs`}>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='relative flex h-3 w-3 shrink-0'>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dotColor}`}></span>
                </span>
                <span className='font-black text-sm tracking-wide'>{config.label}</span>
              </div>
              <span className='text-xs font-mono font-bold px-2 py-0.5 bg-white/90 rounded-lg shadow-2xs'>
                {latencyMs}ms
              </span>
            </div>
            <p className='text-xs opacity-90 leading-relaxed mt-2'>{config.desc}</p>
            <div className='grid grid-cols-2 gap-2 pt-3 border-t border-black/5 mt-3 text-center'>
              <div className='p-2 bg-white/80 rounded-xl'>
                <p className='text-[9px] uppercase font-bold text-slate-400'>{t('stp_uptime_30d')}</p>
                <p className='text-xs font-black text-slate-900'>{config.uptime}</p>
              </div>
              <div className='p-2 bg-white/80 rounded-xl'>
                <p className='text-[9px] uppercase font-bold text-slate-400'>{t('stp_region')}</p>
                <p className='text-xs font-black text-slate-900'>ap-south-1</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subsystems */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className='bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5'>
            <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
              <Server className='w-3.5 h-3.5 text-slate-500' /> {t('stp_subsystem_health')}
            </h2>
            <div className='space-y-2 text-xs'>
              {[
                { nameKey: 'stp_sys_member_portal', latency: "38ms", statusKey: 'stp_sys_operational' },
                { nameKey: 'stp_sys_aadhaar_gateway', latency: "74ms", statusKey: 'stp_sys_operational' },
                { nameKey: 'stp_sys_npci_settlement', latency: "112ms", statusKey: 'stp_sys_operational' },
                { nameKey: 'stp_sys_digilocker_bridge', latency: "86ms", statusKey: 'stp_sys_operational' }
              ].map((sys, idx) => (
                <div key={idx} className='p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between'>
                  <p className='font-bold text-slate-900'>{t(sys.nameKey)}</p>
                  <span className='inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px] shrink-0 ml-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span> {t(sys.statusKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Peak Load Advisory */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className='bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='w-4 h-4 text-amber-600 shrink-0' />
              <h3 className='text-xs font-bold text-amber-900 uppercase tracking-wider'>{t('stp_peak_advisory_title')}</h3>
            </div>
            <p className='text-xs text-amber-800 leading-relaxed'>
              {t('status_peak_advisory', 'Expect higher traffic during 1st–7th of every month (salary credit cycle) and month-end KYC filing deadlines. Try off-peak hours for best experience.')}
            </p>
          </div>
        </motion.div>

        {/* UMANG Alternative */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className='bg-blue-50 border border-blue-200 p-4 rounded-2xl flex gap-3 items-start'>
            <div className='bg-blue-100 p-2 rounded-xl text-blue-600 shrink-0'>
              <Smartphone className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-sm font-bold text-blue-900'>{t('status_umang_alt', 'Server busy?')}</h3>
              <p className='text-xs text-blue-800 mt-1 leading-relaxed'>
                {t('stp_umang_desc_prefix')} <span className='font-bold'>UMANG</span> {t('stp_umang_desc_suffix')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Maintenance Window */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className='bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2'>
            <div className='flex items-center gap-2'>
              <Clock className='w-3.5 h-3.5 text-slate-500' />
              <h3 className='text-xs font-bold text-slate-800 uppercase tracking-wider'>{t('stp_maint_title')}</h3>
            </div>
            <p className='text-xs text-slate-600 leading-relaxed'>
              {t('stp_maint_desc')}
            </p>
          </div>
        </motion.div>

        {/* Need Support */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button
            onClick={() => navigate('/grievance')}
            className='w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl flex gap-3 items-start hover:bg-slate-100 transition-colors text-left'
          >
            <div className='bg-slate-200 p-2 rounded-xl text-slate-600 shrink-0'>
              <Headphones className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-sm font-bold text-slate-900'>{t('stp_support_title')}</h3>
              <p className='text-xs text-slate-600 mt-1 leading-relaxed'>
                {t('stp_support_desc')}
              </p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
