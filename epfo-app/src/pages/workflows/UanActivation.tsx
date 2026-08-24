import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const UanActivation: React.FC = () => {
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
              <h1 className='text-2xl font-semibold mb-2'>Let's activate your UAN</h1>
              <p className='text-slate-500 text-sm'>
                Activating your UAN links your Aadhaar to your PF account. This allows you to check your balance and withdraw money easily online, without visiting any office.
              </p>
            </div>
            
            <div className='space-y-4 mt-8'>
              <Input placeholder='Enter your 12-digit UAN' type='number' />
              <Input placeholder='Enter your Aadhaar Number' type='number' />
            </div>

            <Button className='w-full mt-8' onClick={handleNext}>Continue to Verification</Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-6'>
            <div className='bg-green-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
              <User className='w-8 h-8 text-green-600' />
            </div>
            <div>
              <h1 className='text-2xl font-semibold mb-2'>Verify it's you</h1>
              <p className='text-slate-500 text-sm'>
                We've sent a 6-digit OTP to your Aadhaar-linked mobile number.
              </p>
            </div>
            
            <div className='mt-8'>
              <Input placeholder='Enter OTP' type='number' maxLength={6} className='text-center text-xl tracking-widest' />
            </div>

            <Button className='w-full mt-8' onClick={handleNext} isLoading={loading}>Activate Account</Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
