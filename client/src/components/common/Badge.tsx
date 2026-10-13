import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'plum' | 'lavender' | 'coral' | 'emerald' | 'amber';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'plum',
  size = 'md',
  ...props
}) => {
  const variants = {
    plum: 'bg-plum-100 text-plum-900 border border-plum-200/50',
    lavender: 'bg-lavender-100 text-lavender-800 border border-lavender-200',
    coral: 'bg-coral-100 text-coral-800 border border-coral-200',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
