import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card.js';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-plum-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className={`relative w-full ${maxWidths[maxWidth]} z-10 animate-slide-up`}>
        <Card className="relative p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-plum-400 hover:text-plum-700 hover:bg-cream-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {title && (
            <div className="mb-5 pr-8">
              <h3 className="text-xl font-bold text-plum-950 font-serif">{title}</h3>
              {description && <p className="text-sm text-plum-500 mt-1">{description}</p>}
            </div>
          )}

          {children}
        </Card>
      </div>
    </div>
  );
};
