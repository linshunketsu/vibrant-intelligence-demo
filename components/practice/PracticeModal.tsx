// Practice Modal component migrated from myPractice folder
import React from 'react';
import { X } from 'lucide-react';

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const PracticeModal: React.FC<PracticeModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center animate-in fade-in duration-200" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 slide-in-from-bottom-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200/60">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200">
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-gray-200/60 bg-gradient-to-r from-slate-50 to-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
