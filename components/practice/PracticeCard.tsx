// Practice Card component migrated from myPractice folder
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const PracticeCard: React.FC<CardProps> = ({ children, className = '', title, actions }) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-gray-200/60 p-6 transition-shadow duration-300 hover:shadow-md ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-start mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
