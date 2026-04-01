// app/components/Modal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  type?: 'default' | 'danger';
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  type = 'default' 
}: ModalProps) => {
  if (!isOpen) return null;

  // Handle Escape key press
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Add/remove event listener for Escape key
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-neutral-light-heading/50 dark:bg-black/70 backdrop-blur-sm" 
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Spacer for centering */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal Panel */}
        <div className="inline-block w-full max-w-lg overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-neutral-dark-surface rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-neutral-light-border dark:border-neutral-dark-border">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 
                    className={`text-lg font-medium leading-6 ${type === 'danger' ? 'text-red-600' : 'text-neutral-light-heading dark:text-neutral-dark-heading'}`} 
                    id="modal-title"
                  >
                    {title}
                  </h3>
                  <button 
                    onClick={onClose} 
                    className="text-neutral-light-text dark:text-neutral-dark-text hover:text-neutral-light-heading dark:hover:text-neutral-dark-heading focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-neutral-light-text dark:text-neutral-dark-text">
                  {children}
                </div>
              </div>
            </div>
          </div>
          {footer && (
            <div className="px-4 py-3 bg-neutral-light-bg/50 dark:bg-neutral-dark-bg/50 sm:px-6 sm:flex sm:flex-row-reverse border-t border-neutral-light-border dark:border-neutral-dark-border">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};