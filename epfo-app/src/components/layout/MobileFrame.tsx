import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

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
      const next = Math.max(14, Math.min(22, prev + (dir * 2)));
      localStorage.setItem('fontScale', next.toString());
      return next;
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

      {/* Center Mobile App Frame (9:16 approx) */}
      <div className='w-full max-w-[400px] h-[850px] max-h-[90vh] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col'>
        
        {/* Global Faded Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <img 
            src="/epfo-bg.png" 
            alt="EPFO Background" 
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        
        {/* Children content needs relative z-index to sit above background */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden h-full">
          {children}
        </div>
        
        {/* Global Header & Language Switcher */}
        <div className='absolute top-4 right-4 z-[100] flex gap-2'>
          <div className='flex items-center bg-white/80 backdrop-blur-md border border-slate-200 rounded-full px-2 py-1 shadow-sm'>
            <button 
              onClick={() => handleFontSize(-1)}
              className='px-2 py-0.5 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors'
            >
              A-
            </button>
            <div className='w-px h-4 bg-slate-300 mx-1'></div>
            <button 
              onClick={() => handleFontSize(1)}
              className='px-2 py-0.5 text-base font-bold text-slate-700 hover:text-blue-600 transition-colors'
            >
              A+
            </button>
          </div>

          <div className='flex items-center bg-white/80 backdrop-blur-md border border-slate-200 rounded-full px-3 py-1.5 shadow-sm'>
            <Globe className='w-3.5 h-3.5 text-slate-500 mr-1.5' />
            <select 
              className='bg-transparent text-xs font-medium text-slate-700 focus:outline-none appearance-none cursor-pointer pr-2'
              value={i18n.language || 'en'}
              onChange={handleLanguageChange}
            >
              <option value='en'>EN</option>
              <option value='hi'>HI</option>
              <option value='mr'>MR</option>
              <option value='bn'>BN</option>
              <option value='te'>TE</option>
              <option value='ta'>TA</option>
            </select>
          </div>
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
