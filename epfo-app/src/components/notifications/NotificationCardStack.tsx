import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  ShieldCheck,
  CalendarX2,
  AlertTriangle,
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useDemoStore } from '../../store/useDemoStore';
import { mergeNotifications } from '../../lib/scenarioNotifications';
import { useTranslation } from 'react-i18next';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck, CalendarX2, AlertTriangle, Wallet, ArrowRightLeft, CheckCircle2, ShieldAlert,
};

const GRADIENT_MAP: Record<string, string> = {
  blue: 'from-blue-50 to-indigo-50',
  teal: 'from-teal-50 to-emerald-50',
  amber: 'from-amber-50 to-orange-50',
  emerald: 'from-emerald-50 to-teal-50',
  indigo: 'from-indigo-50 to-violet-50',
  violet: 'from-violet-50 to-purple-50',
  rose: 'from-rose-50 to-pink-50',
  orange: 'from-orange-50 to-amber-50',
};

const BORDER_MAP: Record<string, string> = {
  blue: 'border-blue-200/80', teal: 'border-teal-200/80', amber: 'border-amber-200/80',
  emerald: 'border-emerald-200/80', indigo: 'border-indigo-200/80', violet: 'border-violet-200/80',
  rose: 'border-rose-200/80', orange: 'border-orange-200/80',
};

const TEXT_MAP: Record<string, string> = {
  blue: 'text-blue-600', teal: 'text-teal-600', amber: 'text-amber-600',
  emerald: 'text-emerald-600', indigo: 'text-indigo-600', violet: 'text-violet-600',
  rose: 'text-rose-600', orange: 'text-orange-600',
};

const BG_MAP: Record<string, string> = {
  blue: 'bg-blue-100', teal: 'bg-teal-100', amber: 'bg-amber-100',
  emerald: 'bg-emerald-100', indigo: 'bg-indigo-100', violet: 'bg-violet-100',
  rose: 'bg-rose-100', orange: 'bg-orange-100',
};

const HEADING_MAP: Record<string, string> = {
  blue: 'text-blue-900', teal: 'text-teal-900', amber: 'text-amber-900',
  emerald: 'text-emerald-900', indigo: 'text-indigo-900', violet: 'text-violet-900',
  rose: 'text-rose-900', orange: 'text-orange-900',
};

const BODY_MAP: Record<string, string> = {
  blue: 'text-blue-700', teal: 'text-teal-700', amber: 'text-amber-700',
  emerald: 'text-emerald-700', indigo: 'text-indigo-700', violet: 'text-violet-700',
  rose: 'text-rose-700', orange: 'text-orange-700',
};

const LINK_MAP: Record<string, string> = {
  blue: 'text-blue-600 hover:text-blue-800', teal: 'text-teal-600 hover:text-teal-800', amber: 'text-amber-600 hover:text-amber-800',
  emerald: 'text-emerald-600 hover:text-emerald-800', indigo: 'text-indigo-600 hover:text-indigo-800', violet: 'text-violet-600 hover:text-violet-800',
  rose: 'text-rose-600 hover:text-rose-800', orange: 'text-orange-600 hover:text-orange-800',
};

export const NotificationCardStack: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, activeCardIndex, setActiveCardIndex } = useNotificationStore();
  const activeScenario = useDemoStore(s => s.activeScenario);
  const merged = React.useMemo(() => mergeNotifications(notifications, activeScenario), [notifications, activeScenario]);
  const unreadCards = merged.filter(n => !n.read);
  const cards = unreadCards.length > 0 ? unreadCards : merged.slice(0, 3);
  const current = cards[activeCardIndex % cards.length];

  const c = current?.color || 'blue';
  const CardIcon = ICON_MAP[current?.icon] || ShieldCheck;

  return (
    <section className='space-y-1'>
      <div className='px-0.5 flex items-center justify-between'>
        <h2 className='text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
          <Bell className='!w-3.5 !h-3.5 text-epfo-blue' />
          {t('smart_notifications', 'Smart Notifications')}
          {unreadCards.length > 0 && (
            <span className='ml-1 bg-epfo-blue text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none'>
              {unreadCards.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => navigate('/notifications')}
          className='text-[10px] font-bold text-epfo-blue hover:text-epfo-blue/80 transition-colors underline underline-offset-2'
        >
          {t('view_all', 'View All')}
        </button>
      </div>

      <motion.div
        key={current?.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className={`bg-gradient-to-r ${GRADIENT_MAP[c] || GRADIENT_MAP.blue} border ${BORDER_MAP[c] || BORDER_MAP.blue} rounded-2xl px-3 py-2.5 shadow-xs cursor-pointer`}
        onClick={() => navigate('/notifications')}
      >
        <div className='flex items-start gap-2.5'>
          <div className={`${BG_MAP[c] || BG_MAP.blue} p-1.5 rounded-lg ${TEXT_MAP[c] || TEXT_MAP.blue} shrink-0 mt-0.5`}>
            <CardIcon className='!w-3.5 !h-3.5' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-1.5'>
              <p className={`text-[11px] font-bold ${HEADING_MAP[c] || HEADING_MAP.blue}`}>
                {current ? t(`notif_${current.id.replace(/-/g, '_')}_title`, current.title) : ''}
              </p>
              {!current?.read && <span className='w-1.5 h-1.5 rounded-full bg-epfo-blue shrink-0' />}
            </div>
            <p className={`text-[10px] ${BODY_MAP[c] || BODY_MAP.blue} mt-0.5 leading-snug`}>
              {current ? t(`notif_${current.id.replace(/-/g, '_')}_body`, current.body) : ''}
            </p>
            {current?.actionPath && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(current.actionPath!); }}
                className={`mt-1 text-[10px] font-bold ${LINK_MAP[c] || LINK_MAP.blue} underline underline-offset-2`}
              >
                {t(`notif_${current.id.replace(/-/g, '_')}_action`, current.actionLabel || '')} →
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className='flex items-center justify-center gap-3 -mt-0.5'>
        <button
          onClick={() => setActiveCardIndex((activeCardIndex - 1 + cards.length) % cards.length)}
          className='p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors'
          aria-label='Previous notification'
        >
          <svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}><path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' /></svg>
        </button>
        <div className='flex gap-1.5'>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveCardIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === (activeCardIndex % cards.length) ? 'bg-epfo-blue w-4' : 'bg-slate-300 w-1.5'}`}
              aria-label={`Notification ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setActiveCardIndex((activeCardIndex + 1) % cards.length)}
          className='p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors'
          aria-label='Next notification'
        >
          <svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}><path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' /></svg>
        </button>
      </div>
    </section>
  );
};
