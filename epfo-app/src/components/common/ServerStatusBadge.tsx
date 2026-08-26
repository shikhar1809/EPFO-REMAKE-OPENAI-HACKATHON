import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServerStatusStore, type ServerHealthState } from '../../store/useServerStatusStore';

export const ServerStatusBadge: React.FC = () => {
  const navigate = useNavigate();
  const { status, setStatus } = useServerStatusStore();

  // Subtle Demo Load Fluctuation (Randomly toggles between Green and Yellow only, never Red)
  useEffect(() => {
    setStatus('healthy', false);

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextToggle = () => {
      const current = useServerStatusStore.getState().status;
      
      if (current === 'healthy') {
        const healthyDuration = 40000 + Math.random() * 30000;
        timeoutId = setTimeout(() => {
          setStatus('medium', false);
          scheduleNextToggle();
        }, healthyDuration);
      } else {
        const mediumDuration = 10000 + Math.random() * 4000;
        timeoutId = setTimeout(() => {
          setStatus('healthy', false);
          scheduleNextToggle();
        }, mediumDuration);
      }
    };

    scheduleNextToggle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [setStatus]);

  const getStatusConfig = (currentStatus: ServerHealthState) => {
    switch (currentStatus) {
      case 'healthy':
        return {
          dotColor: 'bg-emerald-500',
          pulseColor: 'bg-emerald-400',
          badgeBg: 'text-emerald-800 hover:opacity-75',
          labelText: 'SERVER STATUS: OPTIMAL',
        };
      case 'medium':
        return {
          dotColor: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          badgeBg: 'text-amber-900 hover:opacity-75',
          labelText: 'SERVER STATUS: MEDIUM LOAD',
        };
      case 'heavy':
        return {
          dotColor: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          badgeBg: 'text-rose-900 hover:opacity-75',
          labelText: 'SERVER STATUS: HEAVY LOAD',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="relative group inline-flex items-center">
      <button
        onClick={() => navigate('/status')}
        className={`flex items-center gap-1.5 px-1 py-0.5 transition-all cursor-pointer select-none text-[10px] font-extrabold tracking-tight shrink-0 ${config.badgeBg}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
        </span>
        <span className="tracking-wide uppercase">{config.labelText}</span>
      </button>

      {/* Floating Hover Tooltip */}
      <div className="absolute left-0 top-full mt-1.5 hidden group-hover:flex flex-col items-start z-50 pointer-events-none">
        {/* Subtle Upward Arrow */}
        <div className="w-2 h-2 bg-slate-900 rotate-45 ml-4 -mb-1 border-t border-l border-slate-700/60" />
        <div className="bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1.5 rounded-xl shadow-2xl border border-slate-700/60 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
          Click to check server status and view technical details
        </div>
      </div>
    </div>
  );
};
