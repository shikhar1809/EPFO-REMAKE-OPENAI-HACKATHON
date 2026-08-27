import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const UanActivation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else {
      setLoading(true);
      await new Promise(r => setTimeout(r, 2000));
      setLoading(false);
      navigate('/login');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='flex-1 flex flex-col bg-transparent'>
      <div className='px-4 py-4 flex items-center sticky top-0 z-10'>
        <button onClick={() => navigate(-1)} className='p-2 -ml-2 text-slate-600 rounded-full hover:bg-transparent'>
          <ArrowLeft className='w-5 h-5' />
        </button>
      </div>

      <div className='p-8 flex-1 flex flex-col justify-center'>
        {step === 1 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-6'>
            <div className='bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
              <ShieldCheck className='w-8 h-8 text-epfo-blue' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold mb-2'>{t('uan_activate_title')}</h1>
              <p className='text-slate-500 text-sm'>
                {t('uan_activate_desc')}
              </p>
            </div>
            
            <div className='space-y-4 mt-8'>
              <Input placeholder={t('uan_placeholder')} defaultValue='101234567890' />
              <Input placeholder={t('uan_aadhaar_placeholder')} defaultValue='987654321098' />
            </div>

            <Button className='w-full mt-8' onClick={handleNext}>{t('uan_continue_verification')}</Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-6'>
            <div className='bg-green-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
              <User className='w-8 h-8 text-green-600' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold mb-2'>{t('uan_verify_title')}</h1>
              <p className='text-slate-500 text-sm'>
                {t('uan_verify_desc')}
              </p>
            </div>
            
            <div className='mt-8'>
              <Input placeholder={t('uan_otp_placeholder')} defaultValue='123456' maxLength={6} className='text-center text-xl tracking-widest' />
            </div>

            <div className='mt-4 flex flex-col gap-3'>
              <button className='text-sm text-epfo-blue font-medium hover:underline text-left'>
                {t('uan_resend_whatsapp')}
              </button>
              <div className='bg-orange-50 border border-orange-200 p-3 rounded-lg mt-2'>
                <p className='text-xs text-orange-800 mb-2 font-medium'>{t('uan_sms_gateway_down')}</p>
                <button className='text-sm bg-white text-orange-700 border border-orange-200 px-3 py-1.5 rounded w-full hover:bg-orange-100 transition-colors'>
                  {t('uan_facerd')}
                </button>
              </div>
            </div>

            <Button className='w-full mt-8 py-4 text-lg' onClick={handleNext} isLoading={loading}>{t('uan_activate_account')}</Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
