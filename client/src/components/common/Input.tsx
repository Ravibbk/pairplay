import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-plum-900 tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 bg-white border border-cream-300 rounded-2xl text-sm text-plum-950 placeholder:text-plum-300 shadow-sm transition-all duration-200',
            'focus:outline-none focus:border-plum-500 focus:ring-2 focus:ring-plum-200',
            'disabled:bg-cream-100 disabled:opacity-60 disabled:cursor-not-allowed',
            error && 'border-coral-500 focus:border-coral-500 focus:ring-coral-100',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-coral-600 font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-plum-400">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
