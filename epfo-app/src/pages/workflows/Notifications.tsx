import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle2, ShieldCheck, CalendarX2, AlertTriangle, Wallet, ArrowRightLeft, ShieldAlert, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, NOTIFICATION_CATEGORIES, type NotificationCategory, type NotificationItem } from '../../store/useNotificationStore';
import { useDemoStore } from '../../store/useDemoStore';
import { mergeNotifications } from '../../lib/scenarioNotifications';
import { useTranslation } from 'react-i18next';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  CalendarX2,
  AlertTriangle,
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  ShieldAlert,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200/80' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200/80' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200/80' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200/80' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200/80' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200/80' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200/80' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200/80' },
};

const NotificationCard: React.FC<{ item: NotificationItem; onTap: () => void }> = ({ item, onTap }) => {
  const { t } = useTranslation();
  const Icon = ICON_MAP[item.icon] || Bell;
  const colors = COLOR_MAP[item.color] || COLOR_MAP.blue;
  const catMeta = NOTIFICATION_CATEGORIES[item.category];

  return (
    <motion.button
      onClick={onTap}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left bg-gradient-to-r ${
        item.color === 'blue' ? 'from-blue-50 to-indigo-50' :
        item.color === 'teal' ? 'from-teal-50 to-emerald-50' :
        item.color === 'amber' ? 'from-amber-50 to-orange-50' :
        item.color === 'emerald' ? 'from-emerald-50 to-teal-50' :
        item.color === 'indigo' ? 'from-indigo-50 to-violet-50' :
        item.color === 'violet' ? 'from-violet-50 to-purple-50' :
        item.color === 'rose' ? 'from-rose-50 to-pink-50' :
        'from-orange-50 to-amber-50'
      } border ${colors.border} rounded-2xl p-3.5 shadow-xs transition-all ${
        !item.read ? 'ring-2 ring-epfo-blue/20' : ''
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`${colors.bg} p-1.5 rounded-lg ${colors.text} shrink-0 mt-0.5`}>
          <Icon className="!w-4 !h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-xs font-bold ${catMeta.color.replace('text-', 'text-').replace('-700', '-900')}`}>
              {item.title}
            </p>
            {!item.read && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-epfo-blue" aria-label={t('ntf_unread')} />
            )}
          </div>
          <p className={`text-[11px] mt-0.5 leading-snug ${catMeta.color.replace('-700', '-700')}`}>
            {item.body}
          </p>
          <span className="inline-block mt-1.5 text-[9px] font-semibold uppercase tracking-wider opacity-60">
            {catMeta.label} · {t('ntf_due')} {item.date}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead } = useNotificationStore();
  const activeScenario = useDemoStore(s => s.activeScenario);
  const merged = useMemo(() => mergeNotifications(notifications, activeScenario), [notifications, activeScenario]);
  const unreadCount = merged.filter(n => !n.read).length;

  const grouped = useMemo(() => {
    const groups: Record<NotificationCategory, NotificationItem[]> = {
      deadlines: [],
      claims: [],
      contributions: [],
      alerts: [],
    };
    merged.forEach(n => groups[n.category].push(n));
    return groups;
  }, [merged]);

  const categoryOrder: NotificationCategory[] = ['deadlines', 'claims', 'contributions', 'alerts'];

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          aria-label={t('ntf_go_back')}
        >
          <ArrowLeft className="!w-5 !h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-900">{t('ntf_title')}</h1>
          <p className="text-[10px] text-slate-500">
            {unreadCount > 0 ? t('ntf_unread_count', { count: unreadCount }) : t('ntf_all_caught_up')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-epfo-blue hover:text-epfo-blue/80 transition-colors"
          >
            <CheckCheck className="!w-3.5 !h-3.5" />
            {t('ntf_mark_all_read')}
          </button>
        )}
      </div>

      {/* Notification Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        <AnimatePresence>
          {categoryOrder.map(cat => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            const meta = NOTIFICATION_CATEGORIES[cat];

            return (
              <motion.section
                key={cat}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                <h2 className={`text-[11px] font-bold uppercase tracking-wider ${meta.color} flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.color.replace('text-', 'bg-')}`} />
                  {meta.label}
                  <span className="text-[9px] font-normal opacity-50 ml-auto">{items.length}</span>
                </h2>
                <div className="space-y-2">
                  {items.map(item => (
                    <NotificationCard
                      key={item.id}
                      item={item}
                      onTap={() => {
                        markRead(item.id);
                        if (item.actionPath) navigate(item.actionPath);
                      }}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
