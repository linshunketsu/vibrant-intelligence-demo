import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { WorkbenchView } from './components/WorkbenchView';
import { PatientsView } from './components/PatientsView';
import { CalendarView } from './components/CalendarView';
import { PracticeView } from './components/PracticeView';
import { PracticeSettings } from './components/PracticeSettings';
import { UserRole } from './practiceTypes';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('patients');
  const [isPracticeSettingsOpen, setIsPracticeSettingsOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.Admin);

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-auto relative">
        {activeTab === 'workbench' && <WorkbenchView />}
        {activeTab === 'patients' && <PatientsView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'practice' && (
          <PracticeView
            onOpenSettings={() => setIsPracticeSettingsOpen(true)}
            currentUserRole={currentUserRole}
            setCurrentUserRole={setCurrentUserRole}
          />
        )}
        {(activeTab !== 'workbench' && activeTab !== 'patients' && activeTab !== 'calendar' && activeTab !== 'practice') && (
           <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 flex-col gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p>This module ({activeTab}) is under construction.</p>
           </div>
        )}
      </div>

      <PracticeSettings
        isOpen={isPracticeSettingsOpen}
        onClose={() => setIsPracticeSettingsOpen(false)}
        currentUserRole={currentUserRole}
      />
    </div>
  );
};

export default App;