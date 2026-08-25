import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-epfo-blue text-white hover:bg-slate-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
      ghost: 'text-slate-600 hover:bg-slate-100',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl px-4 py-3.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        <span className={cn(isLoading && 'opacity-0')}>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';
