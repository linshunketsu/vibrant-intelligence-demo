
import React, { useState, useCallback } from 'react';
import { View, UserRole } from './types';
import Dashboard from './screens/Dashboard';
import PracticeSettings from './screens/PracticeSettings';


const App: React.FC = () => {
  const [isPracticeSettingsOpen, setIsPracticeSettingsOpen] = useState(false);
  
  // Role-based access state. Financial visibility is now implicit based on role/scope.
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.Admin);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold text-brand-primary">Vibrant</div>
               <nav className="flex items-center space-x-6 pl-4">
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-brand-primary">My Patients</a>
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-brand-primary">My Calendar</a>
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-brand-primary">My Workbench</a>
                  <a href="#" className="text-sm font-medium text-brand-primary border-b-2 border-brand-primary pb-3 px-1">My Practice</a>
                </nav>
            </div>
             <div className="flex items-center space-x-4">
                <span className="text-sm">Oakside Wellness Center</span>
                <img className="h-8 w-8 rounded-full" src="https://picsum.photos/seed/doc1/100/100" alt="User Avatar" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard 
            onOpenSettings={() => setIsPracticeSettingsOpen(true)}
            currentUserRole={currentUserRole}
            setCurrentUserRole={setCurrentUserRole}
        />
      </main>

      <PracticeSettings 
        isOpen={isPracticeSettingsOpen}
        onClose={() => setIsPracticeSettingsOpen(false)}
        currentUserRole={currentUserRole}
      />
    </div>
  );
};

export default App;
