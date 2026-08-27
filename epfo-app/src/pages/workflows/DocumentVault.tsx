import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldCheck, FileText, Vault, Plus, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useVaultStore } from '../../store/useVaultStore';
import { useDemoStore } from '../../store/useDemoStore';

export const DocumentVault: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { documents, addDocument } = useVaultStore();
  const clearScenario = useDemoStore(s => s.clearScenario);

  useEffect(() => { clearScenario(); }, []);
  const [isAdding, setIsAdding] = useState(false);

  const docsList = Object.values(documents);

  const handleMockAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      addDocument({
        type: 'bank_account',
        verificationState: 'verified',
        source: 'npci',
        permissions: { grantedTo: [] },
        maskedData: 'SBI AC *******1234'
      });
      setIsAdding(false);
    }, 1500);
  };

  return (
    <div className='flex-1 flex flex-col bg-transparent overflow-hidden relative'>
      {/* Header */}
      <div className='px-6 py-4 flex items-center justify-between border-b border-slate-200 z-10 bg-white'>
        <div className='flex items-center'>
          <button onClick={() => navigate(-1)} aria-label={t('vault_back')} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-transparent transition-colors'>
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-lg font-semibold ml-2 flex items-center gap-2'>
            <Vault className='w-5 h-5 text-amber-600' />
            {t('vault_title')}
          </h1>
        </div>
        <span className='text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md'>{t('vault_secure')}</span>
      </div>

      <div className='flex-1 overflow-y-auto px-6 py-6 space-y-6'>
        <div className='bg-white p-6 rounded-3xl border border-slate-200 shadow-sm'>
          <ShieldCheck className='w-12 h-12 text-green-500 mb-4' />
          <h2 className='text-xl font-bold text-slate-900 mb-2'>{t('vault_permissioned_storage')}</h2>
          <p className='text-slate-500 text-sm'>
            {t('vault_storage_description')}
          </p>
        </div>

        <div>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-semibold text-slate-800'>{t('vault_stored_documents')}</h3>
            <button onClick={handleMockAdd} disabled={isAdding} aria-label={t('vault_add_doc_aria')} className='text-sm text-epfo-blue font-medium flex items-center gap-1 hover:underline disabled:opacity-50'>
              <Plus className='w-4 h-4' /> {t('vault_add_document')}
            </button>
          </div>

          <div className='space-y-3'>
            {docsList.length === 0 ? (
              <div className='text-center p-8 bg-slate-100 rounded-2xl border border-slate-200 border-dashed'>
                <p className='text-slate-500'>{t('vault_empty')}</p>
              </div>
            ) : (
              <AnimatePresence>
                {docsList.map(doc => (
                  <motion.div 
                    key={doc.refId} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4'
                  >
                    <div className='bg-amber-50 p-3 rounded-xl shrink-0'>
                      <FileText className='w-6 h-6 text-amber-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between items-start'>
                        <h4 className='font-semibold text-slate-900 capitalize'>{doc.type.replace('_', ' ')}</h4>
                        {doc.verificationState === 'verified' ? (
                          <CheckCircle2 className='w-4 h-4 text-green-500 shrink-0' />
                        ) : (
                          <XCircle className='w-4 h-4 text-red-500 shrink-0' />
                        )}
                      </div>
                      <p className='text-sm text-slate-600 font-mono mt-1'>{doc.maskedData}</p>
                      
                      <div className='mt-3 flex flex-wrap gap-2'>
                        <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md'>
                          {t('vault_source', { source: doc.source.toUpperCase() })}
                        </span>
                        {doc.permissions.grantedTo.length > 0 && (
                          <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md'>
                            {t('vault_shared', { count: doc.permissions.grantedTo.length })}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
