import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { ServerStatusBadge } from '../common/ServerStatusBadge';
import { useServerStatusStore } from '../../store/useServerStatusStore';
import { DemoControlPanel } from '../demo/DemoControlPanel';

import { useDemoStore, DEMO_SCENARIOS } from '../../store/useDemoStore';
import { getComparison, getScenarioFeatures, ALL_FEATURES } from '../../data/comparisons';

const ComparisonPanelContent: React.FC<{
  route: string;
  scenario: string;
  scenarioLabel: string;
}> = ({ route, scenario, scenarioLabel }) => {
  const comparison = getComparison(route, scenario);
  const features = getScenarioFeatures(scenario);
  const isScenarioActive = scenario !== 'happy';

  return (
    <div className='flex-1 overflow-y-auto px-4 py-3 space-y-4'>
      <div>
        <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1'>Page</p>
        <p className='text-[13px] font-semibold text-slate-800 font-mono'>{route}</p>
      </div>

      <div>
        <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1'>Scenario</p>
        <AnimatePresence mode='wait'>
          <motion.p
            key={scenario}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className='text-[12px] font-medium text-slate-700'
          >
            {scenarioLabel}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className='h-px bg-slate-100' />

      <AnimatePresence mode='wait'>
        <motion.div
          key={`${route}-${scenario}-old`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2 }}
        >
          <p className='text-[10px] font-medium text-red-500 uppercase tracking-wider mb-1.5'>Current EPFO</p>
          <p className='text-[12px] text-slate-600 leading-relaxed'>{comparison.old}</p>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode='wait'>
        <motion.div
          key={`${route}-${scenario}-new`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <p className='text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-1.5'>Our Remake</p>
          <p className='text-[12px] text-slate-600 leading-relaxed'>{comparison.improved}</p>
        </motion.div>
      </AnimatePresence>

      <div className='h-px bg-slate-100' />

      <div>
        <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2'>Features</p>
        <div className='space-y-1.5'>
          {ALL_FEATURES.map((f, i) => {
            const isActive = features.active.includes(f);
            const isHighlighted = features.highlighted.includes(f);
            return (
              <motion.div
                key={f}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.35 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className={`flex items-center gap-2 text-[11px] transition-colors duration-300 ${
                  isHighlighted ? 'text-emerald-700 font-semibold' : isActive ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                  isHighlighted ? 'bg-emerald-500 ring-2 ring-emerald-200' : isActive ? 'bg-emerald-400' : 'bg-slate-300'
                }`} />
                {f}
                {isHighlighted && isScenarioActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold uppercase ml-auto'
                  >
                    Active
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { status } = useServerStatusStore();
  const location = useLocation();
  const { activeScenario } = useDemoStore();
  const [fontScale, setFontScale] = React.useState(() => parseInt(localStorage.getItem('fontScale') || '16'));
  const [mobileCompareOpen, setMobileCompareOpen] = React.useState(false);

  const scenarioLabel = DEMO_SCENARIOS.find(s => s.id === activeScenario)?.label || 'Happy Path';

  React.useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}px`;
    if (fontScale > 16) {
      document.body.classList.add('senior-mode');
    } else {
      document.body.classList.remove('senior-mode');
    }
  }, [fontScale]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
  };

  const handleFontSize = (dir: number) => {
    setFontScale(prev => {
      const next = prev + dir * 2;
      const clamped = Math.min(Math.max(next, 12), 24);
      localStorage.setItem('fontScale', clamped.toString());
      return clamped;
    });
  };

  const getTopBarBg = () => {
    switch (status) {
      case 'healthy': return 'bg-emerald-50/95 border-emerald-200';
      case 'medium': return 'bg-amber-50/95 border-amber-200';
      case 'heavy': return 'bg-rose-50/95 border-rose-200';
      default: return 'bg-white/90 border-slate-200/70';
    }
  };

  return (
    <div className='min-h-screen bg-slate-900 flex items-stretch overflow-hidden'>

      {/* Left Demo Panel */}
      <DemoControlPanel />

      {/* Center Mobile App Frame */}
      <div className='flex-1 flex flex-col items-center px-4 pt-3 pb-4 min-w-0'>
        <p className='text-[10px] text-slate-500 mb-2 shrink-0'>Submission by Shikhar Shahi, Jigyasa Tiwari</p>
        <div className='w-full max-w-[420px] h-[870px] max-h-[92vh] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col border border-slate-700/30 shrink-0'>

          {/* Global Faded Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            <img
              src="/epfo-bg.png"
              alt="EPFO Background"
              className="w-full h-full object-cover opacity-20"
            />
          </div>

          {/* Dedicated Top App Utility Bar */}
          <div className={`relative z-20 px-3 py-1.5 backdrop-blur-md border-b flex items-center justify-between gap-1.5 shadow-xs shrink-0 transition-colors duration-500 ${getTopBarBg()}`}>
            <ServerStatusBadge />

            <div className='flex items-center gap-1.5 shrink-0'>
              <div className='flex items-center bg-slate-100 rounded-full px-1.5 py-0.5 border border-slate-200'>
                <button
                  onClick={() => handleFontSize(-1)}
                  aria-label="Decrease font size"
                  className='px-1 py-0.5 text-xs font-bold text-slate-700 hover:text-epfo-blue transition-colors'
                >
                  A-
                </button>
                <div className='w-px h-3 bg-slate-300 mx-0.5'></div>
                <button
                  onClick={() => handleFontSize(1)}
                  aria-label="Increase font size"
                  className='px-1 py-0.5 text-xs font-bold text-slate-700 hover:text-epfo-blue transition-colors'
                >
                  A+
                </button>
              </div>

              <div className='relative flex items-center bg-slate-100 rounded-full px-2 py-0.5 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors'>
                <Globe className='w-3 h-3 text-slate-500 mr-1 shrink-0' />
                <select
                  value={i18n.language || 'en'}
                  onChange={handleLanguageChange}
                  aria-label="Language"
                  className='bg-transparent border-none outline-none cursor-pointer pr-1 text-[11px] font-bold'
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="mr">MR</option>
                  <option value="bn">BN</option>
                  <option value="te">TE</option>
                  <option value="ta">TA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skip to main content */}
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:bg-white focus:p-2">Skip to main content</a>

          {/* Children content */}
          <main id="main-content" className="relative z-10 flex-1 flex flex-col overflow-hidden h-full" role="main" aria-label="EPFO Portal content">
            {children}
          </main>
        </div>

        {/* Mobile Compare FAB — visible on small screens */}
        <button
          onClick={() => setMobileCompareOpen(!mobileCompareOpen)}
          aria-label="Toggle comparison panel"
          className='lg:hidden mt-3 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-slate-700 transition-colors'
        >
          {mobileCompareOpen ? <ChevronDown className='w-3.5 h-3.5' /> : <ChevronUp className='w-3.5 h-3.5' />}
          {mobileCompareOpen ? 'Hide Comparison' : 'Compare: EPFO vs Remake'}
        </button>
        <div className='bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 mt-3 text-center shrink-0'>
          <p className='text-[10px] font-bold text-amber-600 uppercase tracking-wider'>⚠ Prototype — Not connected to real EPFO services. All data is simulated.</p>
        </div>
      </div>

      {/* Right Panel — Comparison (Desktop) */}
      <div className='hidden lg:flex flex-col w-[280px] shrink-0 h-full bg-white border-l border-slate-200 overflow-hidden'>
        <div className='px-4 py-3 border-b border-slate-100'>
          <p className='text-[11px] font-semibold text-slate-400 uppercase tracking-widest'>Comparison</p>
        </div>
        <ComparisonPanelContent
          route={location.pathname}
          scenario={activeScenario}
          scenarioLabel={scenarioLabel}
        />
      </div>

      {/* Mobile Compare Drawer */}
      <AnimatePresence>
        {mobileCompareOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Comparison panel"
            className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_30px_rgba(0,0,0,0.15)] z-50 overflow-hidden'
          >
            <div className='px-4 py-3 border-b border-slate-100 flex items-center justify-between'>
              <p className='text-[11px] font-semibold text-slate-400 uppercase tracking-widest'>Comparison</p>
              <button onClick={() => setMobileCompareOpen(false)} className='text-slate-400 hover:text-slate-600'>
                <ChevronDown className='w-4 h-4' />
              </button>
            </div>
            <div className='max-h-[50vh] overflow-y-auto'>
              <ComparisonPanelContent
                route={location.pathname}
                scenario={activeScenario}
                scenarioLabel={scenarioLabel}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
