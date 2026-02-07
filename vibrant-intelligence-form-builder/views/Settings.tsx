import React, { useState } from 'react';
import { BuildingOfficeIcon } from '../components/icons/BuildingOfficeIcon';
import { UsersIcon } from '../components/icons/UsersIcon';
import { AdjustmentsHorizontalIcon } from '../components/icons/AdjustmentsHorizontalIcon';
import { BellIcon } from '../components/icons/BellIcon';
import { PaintBrushIcon } from '../components/icons/PaintBrushIcon';
import { CurrencyDollarIcon } from '../components/icons/CurrencyDollarIcon';
import { PuzzlePieceIcon } from '../components/icons/PuzzlePieceIcon';

const Settings: React.FC = () => {
    const tabs = [
        { id: 'practiceDetails', name: 'Practice Details', icon: <BuildingOfficeIcon className="h-5 w-5" />, description: "Manage your clinic's name, address, and contact information." },
        { id: 'generalPreference', name: 'General Preference', icon: <AdjustmentsHorizontalIcon className="h-5 w-5" />, description: "Set your default settings for appointments, patient communications, and more." },
        { id: 'notification', name: 'Notification', icon: <BellIcon className="h-5 w-5" />, description: "Control how and when you receive notifications about EHR activity." },
        { id: 'practiceBranding', name: 'Practice Branding', icon: <PaintBrushIcon className="h-5 w-5" />, description: "Customize the look and feel of your patient-facing forms and communications." },
        { id: 'practiceFinancials', name: 'Practice Financials', icon: <CurrencyDollarIcon className="h-5 w-5" />, description: "Manage billing, insurance payers, and financial reporting settings." },
        { id: 'teamAndPermissions', name: 'Team & Permissions', icon: <UsersIcon className="h-5 w-5" />, description: "Invite team members and manage their access levels and permissions." },
        { id: 'thirdPartyIntegrations', name: 'Third-party integrations', icon: <PuzzlePieceIcon className="h-5 w-5" />, description: "Connect your EHR with other tools and services like labs and pharmacies." },
    ];

    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900">Settings</h1>
                <p className="mt-2 text-lg text-slate-500">Manage your practice settings and user preferences.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <aside className="md:col-span-3">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                {tab.icon}
                                <span className="truncate">{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="md:col-span-9">
                    {activeTabData && (
                        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                           <div className="border-b border-slate-200 pb-5 mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">{activeTabData.name}</h2>
                                <p className="mt-1 text-sm text-slate-500">{activeTabData.description}</p>
                           </div>
                           <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                <p className="text-sm font-medium text-slate-600">Settings for "{activeTabData.name}" will be available here.</p>
                                <p className="text-xs text-slate-400 mt-1">This is a placeholder for future functionality.</p>
                           </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Settings;