import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { ServerStatusBadge } from '../common/ServerStatusBadge';
import { useServerStatusStore } from '../../store/useServerStatusStore';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { status } = useServerStatusStore();
  const [fontScale, setFontScale] = React.useState(() => parseInt(localStorage.getItem('fontScale') || '16'));

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
    <div className='min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden'>
      {/* Left decorative area */}
      <div className='hidden lg:flex flex-1 items-center justify-center text-slate-500'>
        <div className='max-w-md text-center'>
          <h1 className='text-4xl font-light mb-4 text-white'>EPFO</h1>
          <p className='text-lg'>Simplifying your provident fund experience.</p>
        </div>
      </div>

      {/* Center Mobile App Frame */}
      <div className='w-full max-w-[420px] h-[870px] max-h-[92vh] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col border border-slate-700/30'>
        
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
          
          {/* Top-Left Live Server Health Status */}
          <ServerStatusBadge />

          <div className='flex items-center gap-1.5 shrink-0'>
            <div className='flex items-center bg-slate-100 rounded-full px-1.5 py-0.5 border border-slate-200'>
              <button 
                onClick={() => handleFontSize(-1)}
                className='px-1 py-0.5 text-xs font-bold text-slate-700 hover:text-epfo-blue transition-colors'
              >
                A-
              </button>
              <div className='w-px h-3 bg-slate-300 mx-0.5'></div>
              <button 
                onClick={() => handleFontSize(1)}
                className='px-1 py-0.5 text-xs font-bold text-slate-700 hover:text-epfo-blue transition-colors'
              >
                A+
              </button>
            </div>

            {/* Language Switcher Dropdown */}
            <div className='relative flex items-center bg-slate-100 rounded-full px-2 py-0.5 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors'>
              <Globe className='w-3 h-3 text-slate-500 mr-1 shrink-0' />
              <select 
                value={i18n.language || 'en'} 
                onChange={handleLanguageChange}
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
        
        {/* Children content needs relative z-index to sit above background */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden h-full">
          {children}
        </div>
      </div>

      {/* Right decorative area */}
      <div className='hidden lg:flex flex-1 items-center justify-center text-slate-500'>
        <div className='max-w-md text-center opacity-50'>
          <p>Secure. Fast. Minimal.</p>
        </div>
      </div>
    </div>
  );
};
