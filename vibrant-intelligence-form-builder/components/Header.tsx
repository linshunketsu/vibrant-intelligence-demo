import React from 'react';
import type { View } from '../App';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: 'home', label: 'Forms', icon: <DocumentTextIcon className="h-5 w-5" /> },
    { view: 'patients', label: 'Patients', icon: <UsersIcon className="h-5 w-5" /> },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Left Side: Title */}
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
              Vibrant Intelligence <span className="text-primary-600">EHR Suite</span>
            </h1>
          </div>
          
          {/* Center: Navigation */}
          <nav className="absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200">
              {navItems.map(item => (
                <li key={item.view}>
                  <button
                    onClick={() => onNavigate(item.view as View)}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                      currentView === item.view
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side: Placeholder */}
          <div className="w-48 hidden sm:block">
            {/* Can be used for user profile, etc. */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;