import React, { useState } from 'react';
import { useServerStatusStore, type ServerHealthState } from '../../store/useServerStatusStore';
import { Activity, Server, Zap, ShieldCheck, X } from 'lucide-react';

export const ServerStatusBadge: React.FC = () => {
  const { status, latencyMs, setStatus } = useServerStatusStore();
  const [isOpen, setIsOpen] = useState(false);

  const getStatusConfig = (currentStatus: ServerHealthState) => {
    switch (currentStatus) {
      case 'healthy':
        return {
          dotColor: 'bg-emerald-500',
          pulseColor: 'bg-emerald-400',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
          shortLabel: 'Healthy • No Lag',
          fullTitle: 'Server: Healthy (Optimal)',
          desc: 'Green • No load, zero lag (Instant API responses)',
          latency: `${latencyMs}ms`,
        };
      case 'medium':
        return {
          dotColor: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
          shortLabel: 'Med Load • Delay',
          fullTitle: 'Server: Moderate Load',
          desc: 'Yellow • Medium traffic load with mild latency delays',
          latency: `${latencyMs}ms`,
        };
      case 'heavy':
        return {
          dotColor: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
          shortLabel: 'Heavy Load • Lag',
          fullTitle: 'Server: Heavy Congestion',
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
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all cursor-pointer select-none text-[10px] font-bold ${config.badgeBg}`}
        title="Click to view EPFO Live Server Telemetry"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
        </span>
        <span className="tracking-tight">{config.shortLabel}</span>
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
                  <p className="text-[11px] text-slate-500">Live Gateway & Load Status</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active Status Card */}
            <div className={`p-3.5 rounded-2xl border ${config.badgeBg} flex items-center justify-between`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`}></span>
                  {config.fullTitle}
                </div>
                <p className="text-[11px] opacity-90">{config.desc}</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 bg-white/80 rounded-lg shadow-2xs">
                {config.latency}
              </span>
            </div>

            {/* Switch Server Load Mode (Simulation & Testing) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Simulate Server Load Condition:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Green */}
                <button
                  onClick={() => setStatus('healthy')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                    status === 'healthy'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50/50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-500 mb-1.5"></span>
                  <span className="text-xs font-bold leading-tight">Healthy</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">No Lag</span>
                </button>

                {/* 2. Yellow */}
                <button
                  onClick={() => setStatus('medium')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                    status === 'medium'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50/50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-500 mb-1.5"></span>
                  <span className="text-xs font-bold leading-tight">Medium</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Mild Delay</span>
                </button>

                {/* 3. Red */}
                <button
                  onClick={() => setStatus('heavy')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                    status === 'heavy'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-rose-50/50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-rose-500 mb-1.5"></span>
                  <span className="text-xs font-bold leading-tight">Heavy</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">High Delay</span>
                </button>
              </div>
            </div>

            {/* Subsystem Health Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Server className="w-3.5 h-3.5 text-slate-500" /> EPFO Member Gateway
                </span>
                <span className={`font-bold ${status === 'heavy' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {status === 'heavy' ? 'High Traffic' : '99.99% Online'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> UIDAI Aadhaar Auth Engine
                </span>
                <span className="font-bold text-emerald-600">Connected</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Zap className="w-3.5 h-3.5 text-slate-500" /> NPCI Direct Settlement
                </span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Telemetry
            </button>

          </div>
        </div>
      )}
    </>
  );
};
