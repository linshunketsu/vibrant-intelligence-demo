import React from 'react';
import { Users, Calendar, Layout, Building2, ChevronRight } from 'lucide-react';
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
    <div className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between px-6 shrink-0 z-30">
      <div className="flex items-center gap-3">
         <img src={vibrantLogo} alt="Vibrant Wellness" className="w-auto h-6 drop-shadow-sm" />
         <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
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
                     relative h-full px-6 flex items-center gap-2 text-sm font-medium transition-all duration-200
                     ${isActive
                        ? 'text-[#0F4C81] after:content-[""] after:absolute after:bottom-0 after:left-6 after:right-6 after:h-0.5 after:bg-[#0F4C81]'
                        : 'text-slate-600 hover:text-slate-900'
                     }
                  `}
               >
                  <Icon size={17} className={isActive ? 'stroke-[2.5]' : ''} />
                  {tab.label}
               </button>
            );
         })}
      </div>

      <div className="flex items-center">
         <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100/80 rounded-full cursor-pointer hover:from-slate-100 hover:to-slate-200/80 transition-all duration-200 shadow-sm border border-slate-200/50">
            <div className="w-7 h-7 bg-gradient-to-br from-[#0F4C81] to-[#1673A8] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white/50">
               IH
            </div>
            <span className="text-sm font-medium text-slate-700 pr-1">My Account</span>
            <ChevronRight size={14} className="text-slate-400 rotate-90"/>
         </div>
      </div>
    </div>
  );
};