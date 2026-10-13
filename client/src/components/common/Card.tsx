import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'cream' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'white',
  ...props
}) => {
  const variants = {
    white: 'bg-white border border-cream-200/80 shadow-soft',
    cream: 'bg-cream-50 border border-cream-300 shadow-soft',
    elevated: 'bg-white border border-cream-200 shadow-soft-lg',
    glass: 'bg-white/80 backdrop-blur-md border border-white/60 shadow-soft',
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-6 transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
