import React from 'react';
import { Users, Calendar, Layout, Building2, LogOut, ChevronRight, UserCircle } from 'lucide-react';
import vibrantLogo from '../VibrantWellness_Logo.png';

interface TopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'calendar', label: 'My Calendar', icon: Calendar },
    { id: 'workbench', label: 'My Workbench', icon: Layout },
    { id: 'practice', label: 'My Practice', icon: Building2 },
  ];

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-2">
         <img src={vibrantLogo} alt="Vibrant Wellness" className="w-auto h-5" />
         <span className="font-semibold text-slate-700 text-sm flex items-center gap-1">
            Back to Portal <ChevronRight size={14} className="text-slate-400"/>
         </span>
      </div>

      <div className="flex items-center h-full">
         {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
               <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                     h-full px-6 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors
                     ${isActive 
                        ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                     }
                  `}
               >
                  <Icon size={16} />
                  {tab.label}
               </button>
            );
         })}
      </div>

      <div className="flex items-center gap-3">
         <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">
               IH
            </div>
            <span className="text-sm font-medium text-slate-700">My Account</span>
            <ChevronRight size={14} className="text-slate-400 rotate-90"/>
         </div>
      </div>
    </div>
  );
};