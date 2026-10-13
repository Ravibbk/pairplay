import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'coral';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-plum-800 text-white hover:bg-plum-700 active:bg-plum-900 focus:ring-plum-500 shadow-sm shadow-plum-900/10',
    secondary:
      'bg-lavender-100 text-plum-900 hover:bg-lavender-200 focus:ring-lavender-400 border border-lavender-200/60',
    outline:
      'border border-plum-200 bg-white text-plum-900 hover:bg-cream-100 focus:ring-plum-400 shadow-sm',
    ghost:
      'bg-transparent text-plum-800 hover:bg-plum-50 focus:ring-plum-300',
    coral:
      'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 focus:ring-coral-400 shadow-sm shadow-coral-500/20',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-2xl gap-2',
    lg: 'text-base px-6 py-3 rounded-2xl gap-2.5 font-semibold',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
};
