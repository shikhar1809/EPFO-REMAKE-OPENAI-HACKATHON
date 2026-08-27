import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAccountStore } from '../../store/useAccountStore';
import { useDemoStore } from '../../store/useDemoStore';
import { useTranslation } from 'react-i18next';

export const AccountHealthCard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { serviceMonths } = useAccountStore();
  const { 
    isKycMissing: getIsKycMissing, 
    isKycMismatch: getIsKycMismatch, 
    isAadhaarConflict: getIsAadhaarConflict,
    isBankNotSeeded: getIsBankNotSeeded,
    isNomineeMissing: getIsNomineeMissing,
    isExitNotMarked: getIsExitNotMarked
  } = useDemoStore();

  const isKycMissing = getIsKycMissing();
  const isKycMismatch = getIsKycMismatch();
  const isAadhaarConflict = getIsAadhaarConflict();
  const isBankNotSeeded = getIsBankNotSeeded();
  const isNomineeMissing = getIsNomineeMissing();
  const isExitNotMarked = getIsExitNotMarked();

  const aadhaarOk = !(isKycMissing || isKycMismatch || isAadhaarConflict);
  const panOk = !(isKycMissing || isKycMismatch);
  const bankOk = !(isKycMissing || isBankNotSeeded);
  const nomineeOk = !isNomineeMissing;
  const exitOk = !isExitNotMarked;
  const serviceOk = serviceMonths >= 12;

  const aadhaarDetail = isAadhaarConflict ? 'Linked to wrong UAN' : isKycMismatch ? 'Mismatch detected' : aadhaarOk ? t('sts_linked_verified', 'Linked & verified') : 'Not linked';
  const panDetail = isKycMismatch ? 'Mismatch detected' : panOk ? t('sts_verified', 'Verified') : 'Not linked';

  const items = [
    { label: t('lbl_aadhaar_kyc', 'Aadhaar KYC'), ok: aadhaarOk, detail: aadhaarDetail, actionPath: (isAadhaarConflict || isKycMismatch) ? '/kyc-mismatch' : isKycMissing ? '/documents' : undefined },
    { label: t('lbl_pan_kyc', 'PAN KYC'), ok: panOk, detail: panDetail, actionPath: isKycMismatch ? '/kyc-mismatch' : isKycMissing ? '/documents' : undefined },
    { label: t('lbl_bank_kyc', 'Bank KYC'), ok: bankOk, detail: bankOk ? t('sts_ifsc_verified', 'IFSC verified') : 'Not seeded', actionPath: isBankNotSeeded ? '/documents' : isKycMissing ? '/documents' : undefined },
    { label: t('lbl_e_nomination', 'e-Nomination'), ok: nomineeOk, detail: nomineeOk ? t('sts_filed', 'Filed') : 'Not filed', actionPath: isNomineeMissing ? '/smart-flow' : undefined },
    { label: t('lbl_exit_status', 'Exit Status'), ok: exitOk, detail: exitOk ? t('sts_marked', 'Marked (23 Jul 2026)') : 'Not marked', actionPath: isExitNotMarked ? '/mark-exit' : undefined },
    { label: t('lbl_service', 'Service'), ok: serviceOk, detail: `${serviceMonths} months` },
  ];

  const okCount = items.filter(i => i.ok).length;
  const score = Math.round((okCount / items.length) * 100);

  return (
    <div className='bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-slate-200/90 shadow-2xs'>
      <div className='flex items-center justify-between mb-1.5'>
        <div className='flex items-center gap-1.5'>
          {score === 100 ? (
            <ShieldCheck className='!w-3.5 !h-3.5 text-emerald-600' />
          ) : (
            <ShieldAlert className='!w-3.5 !h-3.5 text-amber-600' />
          )}
          <span className='text-[10px] font-bold text-slate-700 uppercase tracking-wider'>{t('lbl_account_details', 'Account Details')}</span>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          score === 100 ? 'bg-emerald-100 text-emerald-700' :
          score >= 60 ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>{score}%</span>
      </div>

      <div className='space-y-0'>
        {items.map((item) => (
          <div key={item.label} className='flex items-center justify-between py-[3px]'>
            <div className='flex items-center gap-1.5'>
              {item.ok ? (
                <CheckCircle2 className='w-3 h-3 text-emerald-500' />
              ) : (
                <AlertTriangle className='w-3 h-3 text-amber-500' />
              )}
              <span className='text-[11px] text-slate-600'>{item.label}</span>
              {!item.ok && item.actionPath && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(item.actionPath!); }}
                  className='text-[9px] bg-red-50 text-red-600 border border-red-200 font-bold px-1.5 py-[1px] rounded-sm hover:bg-red-100 active:scale-95 transition-all cursor-pointer'
                >
                  {t('btn_fix_inline', 'Fix')}
                </button>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};