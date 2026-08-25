import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Activity, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Bug, 
  Lightbulb, 
  Send, 
  Radio,
  Cpu
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { useServerStatusStore, type ServerHealthState } from './store/useServerStatusStore';
import toast from 'react-hot-toast';

export default function App() {
  const { status, latencyMs, setStatus } = useServerStatusStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'report_bug' | 'feature_req'>('overview');

  // Bug Report Form State
  const [bugCategory, setBugCategory] = useState('Gateway Timeout / Delay');
  const [bugDescription, setBugDescription] = useState('');
  const [bugEmail, setBugEmail] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Feature Request Form State
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureCategory, setFeatureCategory] = useState('Smart AI Assistant');
  const [featureDescription, setFeatureDescription] = useState('');
  const [submittedFeature, setSubmittedFeature] = useState(false);

  const getStatusConfig = (currentStatus: ServerHealthState) => {
    switch (currentStatus) {
      case 'healthy':
        return {
          title: 'OPTIMAL',
          dotColor: 'bg-emerald-500',
          pulseColor: 'bg-emerald-400',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          desc: 'All systems normal. High throughput, zero dropped packets.',
          latency: `${latencyMs}ms`,
          colorName: 'text-emerald-600',
          uptime: '99.98%'
        };
      case 'medium':
        return {
          title: 'MEDIUM LOAD',
          dotColor: 'bg-amber-500',
          pulseColor: 'bg-amber-400',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          desc: 'Elevated concurrent traffic. Slight queue delays on heavy forms.',
          latency: `${latencyMs}ms`,
          colorName: 'text-amber-600',
          uptime: '99.85%'
        };
      case 'heavy':
        return {
          title: 'HEAVY LOAD',
          dotColor: 'bg-rose-500',
          pulseColor: 'bg-rose-400',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          desc: 'Peak load congestion. Rate-limiting and intelligent step caching active.',
          latency: `${latencyMs}ms`,
          colorName: 'text-rose-600',
          uptime: '99.12%'
        };
    }
  };

  const config = getStatusConfig(status);

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDescription.trim()) {
      toast.error('Please describe the technical problem.');
      return;
    }
    const ticketId = `EPFO-BUG-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicket(ticketId);
    toast.success(`Technical issue submitted! Ticket: #${ticketId}`);
  };

  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureTitle.trim() || !featureDescription.trim()) {
      toast.error('Please provide a title and description for your feature request.');
      return;
    }
    setSubmittedFeature(true);
    toast.success('Feature suggestion submitted to EPFO Product Team!');
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-y-auto relative pb-12 select-none'>
      
      {/* Top Header */}
      <div className='px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-10 shadow-xs'>
        <div className='flex items-center gap-2'>
          <button 
            onClick={() => window.location.href = 'https://epfo-remake-openai.vercel.app'} 
            className='p-1.5 -ml-1 text-slate-600 rounded-full hover:bg-slate-100 transition-colors'
            title='Back'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-base font-bold text-slate-900 leading-snug flex items-center gap-1.5'>
              <Activity className='w-4 h-4 text-epfo-blue' />
              Server Status & Telemetry
            </h1>
            <p className='text-[10px] text-slate-500'>Official EPFO Infrastructure Monitoring</p>
          </div>
        </div>

        {/* Live Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold shadow-2xs ${config.badgeClass}`}>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulseColor}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}></span>
          </span>
          <span>{config.title}</span>
        </div>
      </div>

      <div className='p-4 space-y-4 max-w-2xl mx-auto w-full'>
        
        {/* Navigation Tabs */}
        <div className='flex bg-slate-200/80 p-1 rounded-2xl gap-1 text-xs font-bold'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className='w-3.5 h-3.5' /> Overview & Logs
          </button>
          <button
            onClick={() => setActiveTab('report_bug')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'report_bug' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bug className='w-3.5 h-3.5' /> Report Issue
          </button>
          <button
            onClick={() => setActiveTab('feature_req')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'feature_req' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className='w-3.5 h-3.5' /> Request Feature
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW, UPTIME, CRASHES & KNOWN ISSUES                          */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            
            {/* Live Telemetry Card */}
            <section className={`p-4 rounded-3xl border ${config.badgeClass} shadow-xs space-y-3`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Radio className='w-4 h-4 animate-pulse' />
                  <span className='font-black text-sm tracking-wide'>{config.title}</span>
                </div>
                <span className='text-xs font-mono font-bold px-2 py-0.5 bg-white/90 rounded-lg shadow-2xs'>
                  {config.latency}
                </span>
              </div>
              <p className='text-xs opacity-90 leading-relaxed'>{config.desc}</p>
              
              <div className='grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-center'>
                <div className='p-2 bg-white/80 rounded-xl'>
                  <p className='text-[9px] uppercase font-bold text-slate-400'>30-Day Uptime</p>
                  <p className='text-xs font-black text-slate-900'>{config.uptime}</p>
                </div>
                <div className='p-2 bg-white/80 rounded-xl'>
                  <p className='text-[9px] uppercase font-bold text-slate-400'>Region Node</p>
                  <p className='text-xs font-black text-slate-900'>ap-south-1</p>
                </div>
                <div className='p-2 bg-white/80 rounded-xl'>
                  <p className='text-[9px] uppercase font-bold text-slate-400'>Packet Loss</p>
                  <p className='text-xs font-black text-emerald-600'>0.00%</p>
                </div>
              </div>
            </section>

            {/* Core Subsystem Breakdown */}
            <section className='bg-white/95 rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-2.5'>
              <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider px-0.5'>
                Subsystem Health Breakdown
              </h2>

              <div className='space-y-2 text-xs'>
                {[
                  { name: "EPFO Unified Member Portal", desc: "Form filing & claims engine", latency: "38ms", uptime: "99.99%", status: "Operational" },
                  { name: "UIDAI Aadhaar eKYC Gateway", desc: "Biometric & OTP authentication pipeline", latency: "74ms", uptime: "99.95%", status: "Operational" },
                  { name: "NPCI Direct Benefit Settlement", desc: "Instant bank account seeding & DBT transfer", latency: "112ms", uptime: "99.98%", status: "Operational" },
                  { name: "Government DigiLocker KYC Bridge", desc: "Aadhaar, PAN & passbook document vault", latency: "86ms", uptime: "99.92%", status: "Operational" }
                ].map((sys, idx) => (
                  <div key={idx} className='p-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <p className='font-bold text-slate-900'>{sys.name}</p>
                      <p className='text-[10px] text-slate-500'>{sys.desc}</p>
                    </div>
                    <div className='text-right shrink-0 ml-2'>
                      <span className='inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]'>
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span> {sys.status}
                      </span>
                      <p className='text-[9px] text-slate-400 font-mono'>{sys.latency} • {sys.uptime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Known Issues & Active Advisories */}
            <section className='bg-white/95 rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-2.5'>
              <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider px-0.5 flex items-center gap-1.5'>
                <AlertTriangle className='w-3.5 h-3.5 text-amber-500' /> Known Issues & Advisories
              </h2>

              <div className='space-y-2 text-xs'>
                <div className='p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-amber-900 space-y-1'>
                  <p className='font-bold text-xs'>High Traffic Advisory (Salary Credit Cycle)</p>
                  <p className='text-[11px] text-amber-800 leading-relaxed'>
                    Expect increased concurrency during the 1st to 7th of every month. The system employs intelligent background queuing to prevent submission failures.
                  </p>
                </div>
                <div className='p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-blue-900 space-y-1'>
                  <p className='font-bold text-xs'>Scheduled Maintenance Window</p>
                  <p className='text-[11px] text-blue-800 leading-relaxed'>
                    Routine database re-indexing and security key rotation occurs on Sundays between 02:00 AM – 03:30 AM IST.
                  </p>
                </div>
              </div>
            </section>

            {/* Last Crashes & Incident History */}
            <section className='bg-white/95 rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-2.5'>
              <div className='flex items-center justify-between px-0.5'>
                <h2 className='text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5 text-slate-500' /> Incident & Crash History
                </h2>
                <span className='text-[10px] text-slate-400 font-bold'>Last 30 Days</span>
              </div>

              <div className='space-y-2 text-xs'>
                {[
                  {
                    date: "Aug 21, 2026 • 14:12 IST",
                    title: "Transient Latency Spike in Form 31 Auto-Settlement",
                    cause: "Sudden spike of 85,000 requests/sec during regional wage filing.",
                    resolution: "Auto-scaled 12 secondary Kubernetes pods. Resolved in 6 mins.",
                    duration: "6 mins",
                    impact: "Mild delay (No data loss)"
                  },
                  {
                    date: "Aug 08, 2026 • 02:30 IST",
                    title: "Scheduled Maintenance & Security Patching",
                    cause: "Routine kernel updates & UIDAI certificate renewal.",
                    resolution: "Completed smoothly with rolling deployment.",
                    duration: "14 mins",
                    impact: "Zero downtime"
                  }
                ].map((inc, idx) => (
                  <div key={idx} className='p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <span className='text-[10px] font-bold text-slate-500'>{inc.date}</span>
                      <span className='text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full'>
                        Resolved
                      </span>
                    </div>
                    <p className='font-bold text-xs text-slate-900'>{inc.title}</p>
                    <p className='text-[11px] text-slate-600 leading-snug'>{inc.cause}</p>
                    <div className='pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 font-mono'>
                      <span>Resolution: {inc.resolution}</span>
                      <span className='font-bold text-slate-700'>{inc.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Live Hackathon Demo Simulation Controls */}
            <section className='bg-slate-900 text-white rounded-3xl p-4 shadow-md space-y-2.5'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5'>
                  <Cpu className='w-3.5 h-3.5 text-blue-400' /> Live Demo Simulator
                </h2>
                <span className='text-[9px] text-blue-400 font-mono'>Judge / Demo Control</span>
              </div>
              <p className='text-[11px] text-slate-400 leading-snug'>
                Manually switch server load states to simulate how the application handles heavy traffic, delays, or optimal conditions:
              </p>

              <div className='grid grid-cols-3 gap-2 pt-1'>
                <button
                  onClick={() => { setStatus('healthy', true); toast.success('Server status set to OPTIMAL'); }}
                  className={`p-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    status === 'healthy' ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs' : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  🟢 OPTIMAL
                </button>
                <button
                  onClick={() => { setStatus('medium', true); toast('Server status set to MEDIUM LOAD', { icon: '🟡' }); }}
                  className={`p-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    status === 'medium' ? 'bg-amber-500 text-white border-amber-400 shadow-xs' : 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  🟡 MEDIUM
                </button>
                <button
                  onClick={() => { setStatus('heavy', true); toast.error('Server status set to HEAVY LOAD'); }}
                  className={`p-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    status === 'heavy' ? 'bg-rose-500 text-white border-rose-400 shadow-xs' : 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  🔴 HEAVY
                </button>
              </div>
            </section>

          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REPORT A TECHNICAL PROBLEM                                        */}
        {/* ========================================================================= */}
        {activeTab === 'report_bug' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            <div className='bg-white/95 rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0'>
                  <Bug className='w-5 h-5' />
                </div>
                <div>
                  <h2 className='text-sm font-bold text-slate-900'>Report a Technical Problem</h2>
                  <p className='text-xs text-slate-500'>Direct priority escalation to EPFO Systems Team</p>
                </div>
              </div>

              {submittedTicket ? (
                <div className='p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3'>
                  <CheckCircle2 className='w-10 h-10 text-emerald-600 mx-auto' />
                  <div>
                    <h3 className='font-bold text-emerald-900 text-sm'>Report Submitted Successfully!</h3>
                    <p className='text-xs text-emerald-700 mt-1'>
                      Ticket Number: <span className='font-mono font-bold text-emerald-900'>#{submittedTicket}</span>
                    </p>
                    <p className='text-[11px] text-emerald-600 mt-1'>
                      Our infrastructure engineering team has received your telemetry bundle and will investigate.
                    </p>
                  </div>
                  <Button 
                    variant='outline' 
                    className='text-xs py-2 px-4'
                    onClick={() => { setSubmittedTicket(null); setBugDescription(''); }}
                  >
                    Submit Another Issue
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleBugSubmit} className='space-y-3.5'>
                  <div>
                    <label className='block text-xs font-bold text-slate-700 mb-1'>Problem Category</label>
                    <select
                      value={bugCategory}
                      onChange={(e) => setBugCategory(e.target.value)}
                      className='w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-epfo-blue'
                    >
                      <option value='Gateway Timeout / Delay'>Gateway Timeout / Delay</option>
                      <option value='Aadhaar OTP Failure'>Aadhaar OTP Failure / Rejection</option>
                      <option value='Passbook Not Fetching'>Passbook Not Fetching / Sync Error</option>
                      <option value='Smart Assistant Loop'>Smart Assistant Step Error</option>
                      <option value='Session Dropped'>Session Unexpectedly Dropped</option>
                      <option value='Other Technical Error'>Other Technical Error</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-slate-700 mb-1'>Detailed Description *</label>
                    <textarea
                      rows={4}
                      value={bugDescription}
                      onChange={(e) => setBugDescription(e.target.value)}
                      placeholder='Please describe what happened, the error message, or where you encountered lag...'
                      className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-epfo-blue resize-none'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-slate-700 mb-1'>Your Contact Email / Mobile (Optional)</label>
                    <input
                      type='text'
                      value={bugEmail}
                      onChange={(e) => setBugEmail(e.target.value)}
                      placeholder='citizen@example.com or +91 98765 43210'
                      className='w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-epfo-blue'
                    />
                  </div>

                  <label className='flex items-center gap-2.5 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-700 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={includeDiagnostics}
                      onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                      className='w-4 h-4 text-epfo-blue rounded border-slate-300'
                    />
                    <span>Automatically include client telemetry logs & network latency metrics</span>
                  </label>

                  <Button type='submit' className='w-full py-3 font-bold text-xs gap-1.5'>
                    <Send className='w-3.5 h-3.5' /> Submit Technical Issue
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SUBMIT FEATURE REQUEST                                            */}
        {/* ========================================================================= */}
        {activeTab === 'feature_req' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className='space-y-4'>
            <div className='bg-white/95 rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0'>
                  <Lightbulb className='w-5 h-5' />
                </div>
                <div>
                  <h2 className='text-sm font-bold text-slate-900'>Suggest a New Feature</h2>
                  <p className='text-xs text-slate-500'>Help shape the future of modern EPFO services</p>
                </div>
              </div>

              {submittedFeature ? (
                <div className='p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3'>
                  <CheckCircle2 className='w-10 h-10 text-emerald-600 mx-auto' />
                  <div>
                    <h3 className='font-bold text-emerald-900 text-sm'>Thank You For Your Feedback!</h3>
                    <p className='text-xs text-emerald-700 mt-1'>
                      Your idea has been shared with the EPFO Digital Transformation initiative.
                    </p>
                  </div>
                  <Button 
                    variant='outline' 
                    className='text-xs py-2 px-4'
                    onClick={() => { setSubmittedFeature(false); setFeatureTitle(''); setFeatureDescription(''); }}
                  >
                    Submit Another Idea
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFeatureSubmit} className='space-y-3.5'>
                  <div>
                    <label className='block text-xs font-bold text-slate-700 mb-1'>Feature Title *</label>
                    <input
                      type='text'
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      placeholder='e.g., WhatsApp Notification for Claim Approved'
                      className='w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-epfo-blue'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-slate-700 mb-1'>Category</label>
                    <select
                      value={featureCategory}
                      onChange={(e) => setFeatureCategory(e.target.value)}
                      className='w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-epfo-blue'
                    >
                      <option value='Smart AI Assistant'>Smart AI Assistant & Voice Flow</option>
                      <option value='Member Passbook & Tax'>Member Passbook & Tax Calculator</option>
                      <option value='Claims & Fast Settlement'>Claims & Fast Settlement</option>
                      <option value='Notifications & Alerts'>WhatsApp & SMS Alerts</option>
                      <option value='Senior Citizen & Pension'>Senior Citizen & Pension Ease</option>
                      <option value='Other'>Other Innovation</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-slate-700 mb-1'>How would this feature help you? *</label>
                    <textarea
                      rows={4}
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      placeholder='Describe the user flow or how you envision this feature working...'
                      className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-epfo-blue resize-none'
                    />
                  </div>

                  <Button type='submit' className='w-full py-3 font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs'>
                    <Send className='w-3.5 h-3.5' /> Submit Feature Request
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
