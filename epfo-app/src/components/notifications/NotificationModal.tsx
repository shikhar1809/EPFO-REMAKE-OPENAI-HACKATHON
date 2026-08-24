import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Calendar, 
  FileCheck2, 
  Coins, 
  Send, 
  Lock 
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { 
    enabled, 
    email, 
    whatsapp, 
    notifyDeadlines, 
    notifyClaimUpdates, 
    notifyMonthlyCredits,
    consentGiven,
    consentTimestamp,
    updateSettings,
    toggleNotifications,
    giveConsent,
    revokeConsent
  } = useNotificationStore();

  const [localEmail, setLocalEmail] = useState(email);
  const [localWhatsapp, setLocalWhatsapp] = useState(whatsapp);
  const [showConsentPopup, setShowConsentPopup] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven && enabled) {
      setShowConsentPopup(true);
      return;
    }
    updateSettings({
      email: localEmail,
      whatsapp: localWhatsapp
    });
    toast.success('Notification settings saved successfully!');
    onClose();
  };

  const handleToggle = (checked: boolean) => {
    if (checked && !consentGiven) {
      setShowConsentPopup(true);
    } else {
      toggleNotifications(checked);
      if (!checked) {
        toast('Notifications turned off', { icon: '🔕' });
      } else {
        toast.success('Notifications enabled');
      }
    }
  };

  const handleAcceptConsent = () => {
    giveConsent();
    updateSettings({
      email: localEmail,
      whatsapp: localWhatsapp
    });
    setShowConsentPopup(false);
    toast.success('Consent recorded & notifications activated!');
  };

  const handleRevokeConsent = () => {
    revokeConsent();
    setShowConsentPopup(false);
    toast('Consent revoked. All statutory notifications disabled.', { icon: '🛡️' });
  };

  const sendTestNotification = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900 text-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
        <div className="flex-1 w-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <MessageSquare className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                EPFO WhatsApp Alert
              </p>
              <p className="mt-1 text-xs text-slate-200">
                Dear Rameshwar Sharma, your PF claim of ₹50,000 is under settlement. Track live in EPFO App.
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 4000 });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className='bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[85vh] overflow-y-auto relative'
      >
        {/* Modal Header */}
        <div className='sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 bg-blue-50 text-epfo-blue rounded-xl flex items-center justify-center'>
              <Bell className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-base font-bold text-slate-900'>Notification Center</h2>
              <p className='text-[11px] text-slate-500'>Deadlines, Claim Updates & Alerts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-5 space-y-5'>
          
          {/* Master Toggle Banner */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
            enabled 
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-950' 
              : 'bg-slate-100/80 border-slate-200 text-slate-600'
          }`}>
            <div>
              <p className='font-bold text-sm'>
                {enabled ? 'Notifications are Active' : 'Notifications are Off'}
              </p>
              <p className='text-xs text-slate-500 mt-0.5'>
                {enabled ? 'You will receive reminders on WhatsApp & Email' : 'Turn on to avoid missing annual deadlines'}
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enabled} 
                onChange={(e) => handleToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-epfo-blue"></div>
            </label>
          </div>

          <form onSubmit={handleSave} className='space-y-4 text-xs'>
            
            {/* Contact Channels */}
            <div className='space-y-3'>
              <h3 className='font-bold text-slate-800 uppercase tracking-wider text-[11px]'>
                Alert Channels
              </h3>

              {/* WhatsApp Input */}
              <div className='space-y-1.5'>
                <label className='font-semibold text-slate-700 flex items-center gap-1.5'>
                  <MessageSquare className='w-4 h-4 text-emerald-600' /> WhatsApp Mobile Number
                </label>
                <input 
                  type='tel'
                  value={localWhatsapp}
                  onChange={(e) => setLocalWhatsapp(e.target.value)}
                  placeholder='+91 98765 43210'
                  className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-blue outline-none text-slate-900 font-medium'
                  required
                />
              </div>

              {/* Email Input */}
              <div className='space-y-1.5'>
                <label className='font-semibold text-slate-700 flex items-center gap-1.5'>
                  <Mail className='w-4 h-4 text-blue-600' /> Email Address for PDF Statements
                </label>
                <input 
                  type='email'
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  placeholder='your.name@example.com'
                  className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-epfo-blue outline-none text-slate-900 font-medium'
                  required
                />
              </div>
            </div>

            {/* Notification Topics */}
            <div className='space-y-2.5 pt-2 border-t border-slate-100'>
              <h3 className='font-bold text-slate-800 uppercase tracking-wider text-[11px]'>
                Notification Topics
              </h3>

              <label className='flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors'>
                <input 
                  type='checkbox' 
                  checked={notifyDeadlines}
                  onChange={(e) => updateSettings({ notifyDeadlines: e.target.checked })}
                  className='w-4 h-4 mt-0.5 text-epfo-blue rounded border-slate-300 focus:ring-epfo-blue'
                />
                <div>
                  <p className='font-bold text-slate-800 text-xs flex items-center gap-1.5'>
                    <Calendar className='w-3.5 h-3.5 text-epfo-blue' />
                    Annual Life Certificate & Policy Deadlines
                  </p>
                  <p className='text-[11px] text-slate-500 mt-0.5'>
                    Reminders 30 days before Jeevan Pramaan submission expires to prevent pension pause.
                  </p>
                </div>
              </label>

              <label className='flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors'>
                <input 
                  type='checkbox' 
                  checked={notifyClaimUpdates}
                  onChange={(e) => updateSettings({ notifyClaimUpdates: e.target.checked })}
                  className='w-4 h-4 mt-0.5 text-epfo-blue rounded border-slate-300 focus:ring-epfo-blue'
                />
                <div>
                  <p className='font-bold text-slate-800 text-xs flex items-center gap-1.5'>
                    <FileCheck2 className='w-3.5 h-3.5 text-emerald-600' />
                    Live Claim Settlement & Transfer Status
                  </p>
                  <p className='text-[11px] text-slate-500 mt-0.5'>
                    Instant WhatsApp notifications whenever an employer or field office processes your claim.
                  </p>
                </div>
              </label>

              <label className='flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors'>
                <input 
                  type='checkbox' 
                  checked={notifyMonthlyCredits}
                  onChange={(e) => updateSettings({ notifyMonthlyCredits: e.target.checked })}
                  className='w-4 h-4 mt-0.5 text-epfo-blue rounded border-slate-300 focus:ring-epfo-blue'
                />
                <div>
                  <p className='font-bold text-slate-800 text-xs flex items-center gap-1.5'>
                    <Coins className='w-3.5 h-3.5 text-amber-600' />
                    Monthly Employer PF Contribution Credits
                  </p>
                  <p className='text-[11px] text-slate-500 mt-0.5'>
                    SMS/Email receipt as soon as your employer deposits monthly PF into your passbook.
                  </p>
                </div>
              </label>
            </div>

            {/* Consent & Privacy Status */}
            <div className='p-3 bg-slate-100 rounded-xl text-xs space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-slate-700 flex items-center gap-1'>
                  <ShieldCheck className='w-4 h-4 text-emerald-600' /> DPDP Act 2023 Consent
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  consentGiven ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {consentGiven ? 'Consent Granted' : 'Pending Consent'}
                </span>
              </div>
              <p className='text-[11px] text-slate-500 leading-relaxed'>
                {consentGiven && consentTimestamp 
                  ? `Consent granted on ${new Date(consentTimestamp).toLocaleDateString()}. Data is strictly used for statutory alerts.`
                  : 'You can review and grant personal data consent for alerts.'}
              </p>
              {consentGiven && (
                <button
                  type='button'
                  onClick={handleRevokeConsent}
                  className='text-[11px] text-red-600 hover:text-red-700 underline font-medium'
                >
                  Revoke Consent & Disable Alerts
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className='pt-2 space-y-2'>
              <div className='flex gap-2'>
                <Button type='submit' className='flex-1 py-3 font-semibold'>
                  Save Notification Preferences
                </Button>
                <button
                  type='button'
                  onClick={sendTestNotification}
                  className='px-3 py-3 border border-slate-200 hover:border-epfo-blue text-slate-700 hover:text-epfo-blue rounded-xl flex items-center gap-1.5 transition-colors font-medium text-xs'
                  title='Send mock WhatsApp alert'
                >
                  <Send className='w-3.5 h-3.5' /> Test Alert
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* DPDP CONSENT POPUP MODAL */}
        <AnimatePresence>
          {showConsentPopup && (
            <div className='absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 p-5 flex items-center justify-center'>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className='bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-w-sm w-full text-center'
              >
                <div className='w-14 h-14 bg-blue-50 text-epfo-blue rounded-full mx-auto flex items-center justify-center shadow-inner'>
                  <Lock className='w-7 h-7' />
                </div>

                <div>
                  <h3 className='text-base font-bold text-slate-900'>
                    Digital Personal Data Protection Consent
                  </h3>
                  <p className='text-xs text-slate-500 mt-1 font-medium'>
                    (In compliance with DPDP Act, 2023)
                  </p>
                </div>

                <div className='bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left text-xs text-slate-600 space-y-2 leading-relaxed'>
                  <p>
                    By proceeding, you give explicit opt-in consent to <strong>EPFO (Employees' Provident Fund Organisation)</strong> to:
                  </p>
                  <ul className='list-disc pl-4 space-y-1 text-[11px] text-slate-700'>
                    <li>Send statutory claim status and settlement notifications via <strong>WhatsApp & Email</strong>.</li>
                    <li>Send annual Digital Life Certificate (Jeevan Pramaan) deadline reminders.</li>
                    <li>Notify when monthly employer PF contributions are credited.</li>
                  </ul>
                  <p className='text-[10px] text-slate-500 italic pt-1 border-t border-slate-200'>
                    🔒 Your contact details will never be sold or shared with any third party for marketing purposes. You may revoke consent anytime from this screen.
                  </p>
                </div>

                <div className='space-y-2 pt-2'>
                  <Button 
                    onClick={handleAcceptConsent}
                    className='w-full py-3.5 font-bold text-xs bg-epfo-blue hover:bg-blue-700'
                  >
                    I Agree & Enable Alerts
                  </Button>
                  <button 
                    onClick={() => setShowConsentPopup(false)}
                    className='w-full py-2 text-slate-500 text-xs hover:text-slate-800'
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
