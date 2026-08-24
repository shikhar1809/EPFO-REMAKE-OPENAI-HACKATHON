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
          badgeBg: 'bg-emerald-50/95 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
          labelText: 'OPTIMAL',
        };
      case 'medium':
        return {
          dotColor: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          badgeBg: 'bg-amber-50/95 text-amber-800 border-amber-200 hover:bg-amber-100',
          labelText: 'MEDIUM LOAD',
        };
      case 'heavy':
        return {
          dotColor: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          badgeBg: 'bg-rose-50/95 text-rose-800 border-rose-200 hover:bg-rose-100',
          labelText: 'HEAVY LOAD',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <button
      onClick={() => navigate('/server-status')}
      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all cursor-pointer select-none text-[10px] font-extrabold tracking-tight shrink-0 shadow-2xs ${config.badgeBg}`}
      title="Click to view full Server Status, Uptime, Incidents & Bug Reporting"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
      </span>
      <span className="tracking-wide uppercase">{config.labelText}</span>
    </button>
  );
};
