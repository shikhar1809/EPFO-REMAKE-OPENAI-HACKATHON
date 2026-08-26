import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import toast from 'react-hot-toast';

interface OtpFallbackOptionsProps {
  variant?: 'compact' | 'full';
  onFaceRD?: () => void;
}

export const OtpFallbackOptions: React.FC<OtpFallbackOptionsProps> = ({ variant = 'full', onFaceRD }) => {
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className='space-y-2 pt-1'
      >
        <Button
          variant='outline'
          className='w-full py-2.5 text-xs font-semibold border-dashed border-amber-300 bg-amber-50/50 text-amber-800 hover:bg-amber-50'
          onClick={() => {
            onFaceRD?.();
            toast.success('Launching Aadhaar FaceRD...');
          }}
        >
          <Fingerprint className='w-3.5 h-3.5 mr-2' />
          Verify via Aadhaar FaceRD
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className='space-y-3 pt-2'
    >
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-slate-200' />
        </div>
        <div className='relative flex justify-center text-xs'>
          <span className='px-2 bg-transparent text-slate-400 font-medium'>Other Options</span>
        </div>
      </div>

      <Button
        variant='outline'
        className='w-full py-3 text-sm font-semibold border-amber-300 bg-amber-50/60 text-amber-800 hover:bg-amber-100'
        onClick={() => {
          onFaceRD?.();
          toast.success('Launching Aadhaar FaceRD...');
        }}
      >
        <Fingerprint className='w-4 h-4 mr-2' />
        Aadhaar FaceRD (No OTP Needed)
      </Button>

      <div className='grid grid-cols-2 gap-2'>
        <Button
          variant='outline'
          className='py-2 text-xs'
          onClick={() => toast.success('OTP resent via SMS')}
        >
          <MessageCircle className='w-3 h-3 mr-1.5' />
          Resend SMS
        </Button>
        <Button
          variant='outline'
          className='py-2 text-xs'
          onClick={() => toast.success('OTP sent via WhatsApp')}
        >
          <RefreshCw className='w-3 h-3 mr-1.5' />
          WhatsApp
        </Button>
      </div>

      <Button
        variant='ghost'
        className='w-full py-2 text-xs text-slate-500 hover:text-slate-700'
        onClick={() => toast.success('Initiating voice call...')}
      >
        <Phone className='w-3 h-3 mr-1.5' />
        Request Voice Call
      </Button>
    </motion.div>
  );
};
