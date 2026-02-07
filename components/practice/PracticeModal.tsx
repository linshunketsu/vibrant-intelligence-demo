// Practice Modal component migrated from myPractice folder
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  const checkReducedMotion = () => {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: checkReducedMotion() ? 0 : 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              duration: checkReducedMotion() ? 0 : undefined
            }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4 pointer-events-none"
          >
            <div
              className={`bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200/60">
                <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
                <motion.button
                  whileHover={{ scale: checkReducedMotion() ? 1 : 1.1, rotate: checkReducedMotion() ? 0 : 90 }}
                  whileTap={{ scale: checkReducedMotion() ? 1 : 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} strokeWidth={2} />
                </motion.button>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
