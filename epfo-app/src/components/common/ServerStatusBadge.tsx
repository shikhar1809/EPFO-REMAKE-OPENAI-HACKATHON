import React, { useState, useEffect } from 'react';
import { useServerStatusStore, type ServerHealthState } from '../../store/useServerStatusStore';
import { Activity, Server, Zap, ShieldCheck, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const ServerStatusBadge: React.FC = () => {
  const { status, latencyMs, isManualOverride, setStatus } = useServerStatusStore();
  const [isOpen, setIsOpen] = useState(false);

  // Subtle Demo Load Fluctuation (Randomly toggles between Green and Yellow only, never Red)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextToggle = () => {
      // If currently healthy, wait 45s - 75s, then switch to medium
      // If currently medium or heavy, stay for 10s - 15s, then switch to healthy
      const current = useServerStatusStore.getState().status;
      
      if (current === 'healthy') {
        const healthyDuration = 45000 + Math.random() * 30000; // 45s to 75s
        timeoutId = setTimeout(() => {
          setStatus('medium', false);
          scheduleNextToggle();
        }, healthyDuration);
      } else {
        const mediumDuration = 10000 + Math.random() * 5000; // 10s to 15s
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
          labelText: 'SERVER STATUS - HEALTHY , NO LAG DETECTED',
          fullTitle: 'EPFO Server: Healthy (Optimal)',
          desc: 'Green • No load, zero lag (Instant API responses)',
          latency: `${latencyMs}ms`,
        };
      case 'medium':
        return {
          dotColor: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          badgeBg: 'bg-amber-50/95 text-amber-800 border-amber-200 hover:bg-amber-100',
          labelText: 'SERVER STATUS - MEDIUM LOAD , MEDIUM DELAY',
          fullTitle: 'EPFO Server: Medium Load',
          desc: 'Yellow • Medium traffic load with moderate latency delay',
          latency: `${latencyMs}ms`,
        };
      case 'heavy':
        return {
          dotColor: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          badgeBg: 'bg-rose-50/95 text-rose-800 border-rose-200 hover:bg-rose-100',
          labelText: 'SERVER STATUS - HEAVY LOAD , HIGH DELAY & SKIPPING',
          fullTitle: 'EPFO Server: Heavy Congestion',
          desc: 'Red • Peak server load, high delay and packet skipping',
          latency: `${latencyMs}ms`,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <>
      {/* Top-Left Live Status Pill */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all cursor-pointer select-none text-[9px] sm:text-[10px] font-extrabold tracking-tight shrink-0 shadow-2xs ${config.badgeBg}`}
        title="Click to view EPFO Live Server Telemetry & Simulator"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
        </span>
        <span className="truncate max-w-[210px] sm:max-w-none">{config.labelText}</span>
      </button>

      {/* Telemetry & Load Simulator Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-epfo-blue flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">EPFO Server Telemetry</h3>
                  <p className="text-[11px] text-slate-500">Live Gateway & Load Monitor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active Status Banner */}
            <div className={`p-3.5 rounded-2xl border ${config.badgeBg} flex items-center justify-between`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`}></span>
                  {config.fullTitle}
                </div>
                <p className="text-[11px] opacity-90">{config.desc}</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 bg-white/80 rounded-lg shadow-2xs shrink-0 ml-2">
                {config.latency}
              </span>
            </div>

            {/* Manual Override & Simulation Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Simulate Server Load (Demo)
                </label>
                {isManualOverride && (
                  <span className="text-[10px] text-blue-600 font-semibold">Manual Active</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* 🟢 HEALTHY */}
                <button
                  onClick={() => setStatus('healthy', true)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    status === 'healthy'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="text-sm">🟢</span>
                  <span className="text-[10px] font-bold leading-tight">HEALTHY</span>
                  <span className="text-[9px] opacity-80 font-mono">No Lag</span>
                </button>

                {/* 🟡 MEDIUM */}
                <button
                  onClick={() => setStatus('medium', true)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    status === 'medium'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="text-sm">🟡</span>
                  <span className="text-[10px] font-bold leading-tight">MEDIUM LOAD</span>
                  <span className="text-[9px] opacity-80 font-mono">Medium Delay</span>
                </button>

                {/* 🔴 HEAVY */}
                <button
                  onClick={() => setStatus('heavy', true)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    status === 'heavy'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className="text-sm">🔴</span>
                  <span className="text-[10px] font-bold leading-tight">HEAVY LOAD</span>
                  <span className="text-[9px] opacity-80 font-mono">High Delay</span>
                </button>
              </div>
            </div>

            {/* Subsystem Telemetry Details */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Subsystems
              </p>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-400" /> EPFO Unified Member Gateway
                  </span>
                  <span className="font-bold text-emerald-600 text-[11px]">99.98% UP</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-slate-400" /> UIDAI Aadhaar eKYC Pipeline
                  </span>
                  <span className={`font-bold text-[11px] ${status === 'heavy' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {status === 'heavy' ? '420ms (Queued)' : 'Operational'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> NPCI Direct Settlement
                  </span>
                  <span className="font-bold text-emerald-600 text-[11px]">Normal</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full py-2 text-xs font-bold text-slate-600"
              onClick={() => setIsOpen(false)}
            >
              Close Telemetry
            </Button>

          </div>
        </div>
      )}
    </>
  );
};
