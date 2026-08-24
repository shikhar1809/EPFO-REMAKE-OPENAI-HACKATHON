import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { ServerStatusBadge } from '../common/ServerStatusBadge';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
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
        <div className='relative z-20 px-3.5 py-2 bg-white/90 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between shadow-xs shrink-0'>
          
          {/* Top-Left Live Server Health Status */}
          <ServerStatusBadge />

          <div className='flex items-center gap-2'>
            <div className='flex items-center bg-slate-100 rounded-full px-2 py-0.5 border border-slate-200'>
              <button 
                onClick={() => handleFontSize(-1)}
                className='px-1.5 py-0.5 text-xs font-bold text-slate-700 hover:text-epfo-blue transition-colors'
              >
                A-
              </button>
              <div className='w-px h-3 bg-slate-300 mx-0.5'></div>
              <button 
                onClick={() => handleFontSize(1)}
                className='px-1.5 py-0.5 text-xs font-bold text-slate-700 hover:text-epfo-blue transition-colors'
              >
                A+
              </button>
            </div>

            <div className='flex items-center bg-slate-100 rounded-full px-2.5 py-1 border border-slate-200'>
              <Globe className='w-3 h-3 text-slate-500 mr-1' />
              <select 
                className='bg-transparent text-xs font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer'
                value={(i18n.language || 'en').split('-')[0]}
                onChange={handleLanguageChange}
              >
                <option value='en'>EN</option>
                <option value='hi'>हिंदी</option>
                <option value='mr'>मराठी</option>
                <option value='bn'>বাংলা</option>
                <option value='te'>తెలుగు</option>
                <option value='ta'>தமிழ்</option>
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
