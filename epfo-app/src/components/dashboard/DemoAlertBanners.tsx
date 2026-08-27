import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, UserX, FileWarning, CreditCard, ShieldAlert } from 'lucide-react';
import { useDemoStore } from '../../store/useDemoStore';

interface Props {
  onAgenticStart: (query: string) => void;
}

export const DemoAlertBanners: React.FC<Props> = ({ onAgenticStart }) => {
  const navigate = useNavigate();
  const { isKycMissing, isClaimRejected, isEmployerPending, hasMultipleUans, isAdvanceRejected, isNomineeMissing, isPensionCertIssue, isBankNotSeeded, isAadhaarConflict } = useDemoStore();

  const banners: Array<{
    key: string;
    show: boolean;
    color: string;
    iconColor: string;
    icon: typeof AlertTriangle;
    title: string;
    desc: string;
    actions: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' }>;
  }> = [
    {
      key: 'kyc',
      show: isKycMissing(),
      color: 'bg-amber-50 border-amber-200',
      iconColor: 'bg-amber-100 text-amber-600',
      icon: AlertTriangle,
      title: 'KYC Not Completed',
      desc: 'Your KYC (Aadhaar + Bank + PAN) is not linked. You cannot file claims, transfers, or exit dates until KYC is complete.',
      actions: [
        { label: 'Complete KYC Now', onClick: () => navigate('/documents'), variant: 'primary' },
      ],
    },
    {
      key: 'multi-uan',
      show: hasMultipleUans(),
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'bg-orange-100 text-orange-600',
      icon: AlertTriangle,
      title: 'Action Required: Multiple Accounts',
      desc: 'We found ₹45,000 in an old UAN. Merge it to your current account to earn maximum interest.',
      actions: [
        { label: 'Merge with Smart Flow', onClick: () => onAgenticStart('I want to merge my old PF account'), variant: 'primary' },
      ],
    },
    {
      key: 'claim-rejected',
      show: isClaimRejected(),
      color: 'bg-red-50 border-red-200',
      iconColor: 'bg-red-100 text-red-600',
      icon: AlertTriangle,
      title: 'PF Claim Rejected',
      desc: 'Your PF claim (Form 31 Advance) was rejected. EPFO says insufficient documents. You can appeal or re-file with correct documents.',
      actions: [
        { label: 'Appeal via Smart Flow', onClick: () => onAgenticStart('My PF advance claim was rejected, I want to appeal'), variant: 'primary' },
        { label: 'File Grievance', onClick: () => navigate('/grievance'), variant: 'secondary' },
      ],
    },
    {
      key: 'employer-pending',
      show: isEmployerPending(),
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'bg-blue-100 text-blue-600',
      icon: AlertTriangle,
      title: 'Waiting for Employer Approval',
      desc: 'Your PF withdrawal request is pending employer approval. SLA: 5 business days. 3 / 5 days elapsed.',
      actions: [
        { label: 'Escalate to EPFO', onClick: () => onAgenticStart('My employer has not approved my PF withdrawal, escalate the request'), variant: 'primary' },
      ],
    },
    {
      key: 'advance-rejected',
      show: isAdvanceRejected(),
      color: 'bg-red-50 border-red-200',
      iconColor: 'bg-red-100 text-red-600',
      icon: AlertTriangle,
      title: 'PF Advance Rejected',
      desc: 'Your PF advance claim (Form 31) was rejected due to insufficient service years. You need at least 5 years of service for education/illness advance.',
      actions: [
        { label: 'Check Eligibility', onClick: () => onAgenticStart('My PF advance was rejected, I have less than 5 years of service'), variant: 'primary' },
        { label: 'Learn Rules', onClick: () => onAgenticStart('What are the eligibility rules for PF advance withdrawal'), variant: 'secondary' },
      ],
    },
    {
      key: 'nominee',
      show: isNomineeMissing(),
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'bg-purple-100 text-purple-600',
      icon: UserX,
      title: 'e-Nomination Not Filed',
      desc: 'Your claim is pending because e-nomination is not updated. Without it, your family cannot claim PF in case of death.',
      actions: [
        { label: 'File e-Nomination', onClick: () => onAgenticStart('I need to update my e-nomination for PF'), variant: 'primary' },
        { label: 'Why is this needed?', onClick: () => onAgenticStart('Why is e-nomination required for PF claim'), variant: 'secondary' },
      ],
    },
    {
      key: 'pension-cert',
      show: isPensionCertIssue(),
      color: 'bg-teal-50 border-teal-200',
      iconColor: 'bg-teal-100 text-teal-600',
      icon: FileWarning,
      title: 'Pension Certificate Mismatch',
      desc: 'Your Scheme Certificate / Form 10D failed due to service-history mismatch. Check your employment records.',
      actions: [
        { label: 'Resolve via Smart Flow', onClick: () => onAgenticStart('My pension scheme certificate failed due to service history mismatch'), variant: 'primary' },
      ],
    },
    {
      key: 'bank',
      show: isBankNotSeeded(),
      color: 'bg-indigo-50 border-indigo-200',
      iconColor: 'bg-indigo-100 text-indigo-600',
      icon: CreditCard,
      title: 'Bank Account Not Verified',
      desc: 'Your claim was approved but disbursement failed. The linked bank account is not verified or IFSC is outdated.',
      actions: [
        { label: 'Update Bank Details', onClick: () => navigate('/documents'), variant: 'primary' },
        { label: 'Get Help', onClick: () => onAgenticStart('My bank account IFSC is outdated, how to update'), variant: 'secondary' },
      ],
    },
    {
      key: 'aadhaar',
      show: isAadhaarConflict(),
      color: 'bg-rose-50 border-rose-200',
      iconColor: 'bg-rose-100 text-rose-600',
      icon: ShieldAlert,
      title: 'Aadhaar Linked to Wrong UAN',
      desc: 'Your Aadhaar is already linked to another UAN. This blocks activation of your current UAN. You need to merge or de-link.',
      actions: [
        { label: 'Fix via Smart Flow', onClick: () => onAgenticStart('My Aadhaar is linked to wrong UAN, need to de-link'), variant: 'primary' },
        { label: 'File Grievance', onClick: () => navigate('/grievance'), variant: 'secondary' },
      ],
    },
  ];

  const visible = banners.filter(b => b.show);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((banner) => {
        const Icon = banner.icon;
        return (
          <section key={banner.key} className={`${banner.color} border rounded-2xl p-4 shadow-sm`}>
            <div className='flex items-start gap-3'>
              <div className={`${banner.iconColor} p-2 rounded-xl shrink-0`}>
                <Icon className='!w-7 !h-7' />
              </div>
              <div className='flex-1'>
                <h3 className='font-bold text-sm text-slate-900'>{banner.title}</h3>
                <p className='text-xs text-slate-700 mt-1 leading-snug'>{banner.desc}</p>
                <div className='flex gap-2 mt-3'>
                  {banner.actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className={`font-bold px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        action.variant === 'secondary'
                          ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                          : `${banner.color.split(' ')[0].replace('50', '600')} text-white hover:opacity-90`
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};
