import React from 'react';
import { motion } from 'framer-motion';
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

  const checkReducedMotion = () => {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  return (
    <div className="h-14 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between px-6 shrink-0 z-30">
      <div className="flex items-center gap-3">
         <img src={vibrantLogo} alt="Vibrant Wellness" className="w-auto h-6 drop-shadow-sm" />
         <motion.span
           whileHover={{ x: checkReducedMotion() ? 0 : 2 }}
           className="text-sm font-medium text-slate-500 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
         >
            Back to Portal <ChevronRight size={14} className="text-slate-400"/>
         </motion.span>
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
                     relative h-full px-6 flex items-center gap-2 text-sm font-medium transition-colors
                     ${isActive
                        ? 'text-[#0F4C81]'
                        : 'text-slate-600 hover:text-slate-900'
                     }
                  `}
               >
                  <Icon size={17} className={isActive ? 'stroke-[2.5]' : ''} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#0F4C81]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
               </button>
            );
         })}
      </div>

      <div className="flex items-center">
         <motion.div
           whileHover={{ scale: checkReducedMotion() ? 1 : 1.02 }}
           whileTap={{ scale: checkReducedMotion() ? 1 : 0.98 }}
           className="flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100/80 rounded-full cursor-pointer hover:from-slate-100 hover:to-slate-200/80 transition-colors shadow-sm border border-slate-200/50"
         >
            <div className="w-7 h-7 bg-gradient-to-br from-[#0F4C81] to-[#1673A8] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white/50">
               IH
            </div>
            <span className="text-sm font-medium text-slate-700 pr-1">My Account</span>
            <ChevronRight size={14} className="text-slate-400 rotate-90"/>
         </motion.div>
      </div>
    </div>
  );
};
