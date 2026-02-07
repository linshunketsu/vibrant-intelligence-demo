// Practice Settings Modal migrated from myPractice folder
import React, { useState } from 'react';
import { PracticeModal } from './practice/PracticeModal';
import { FinancialMode, Provider, UserRole, Transaction } from '../practiceTypes';
import { MOCK_PROVIDERS, MOCK_BANK_ACCOUNTS, MOCK_PRACTICE_WALLET, MOCK_TRANSACTIONS } from '../practiceConstants';
import { InformationCircleIcon, ChevronDownIcon, PencilIcon, TrashIcon, CreditCardIcon, BuildingLibraryIcon, FilterIcon, DownloadIcon, PlusIcon, WalletIcon, DotsHorizontalIcon, CalendarIcon, XMarkIcon } from './practice/PracticeIcons';

interface PracticeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
}

const NAV_ITEMS = [
    'Practice Details', 'General Preference', 'Notification',
    'Practice Branding', 'Practice Financials', 'Team & Permissions', 'Third-Party Integration'
];

export const PracticeSettings: React.FC<PracticeSettingsProps> = ({ isOpen, onClose, currentUserRole }) => {
    const [activeTab, setActiveTab] = useState('Practice Financials');
    const [financialMode, setFinancialMode] = useState<FinancialMode>(FinancialMode.Shared);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

    const renderContent = () => {
        switch (activeTab) {
            case 'Practice Details':
                return <PracticeDetailsTab />;
            case 'Practice Financials':
                return <PracticeFinancialsTab
                            mode={financialMode}
                            setMode={setFinancialMode}
                            onViewProvider={setSelectedProvider}
                            currentUserRole={currentUserRole}
                        />;
            default:
                return <div className="text-center text-slate-500 py-20">Settings for "{activeTab}" coming soon.</div>;
        }
    };

    return (
        <>
        <PracticeModal isOpen={isOpen} onClose={onClose} title="Practice Settings" size="4xl">
            <div className="flex flex-grow min-h-[600px] max-h-[80vh]">
                <nav className="w-64 pr-6 border-r border-slate-200 flex-shrink-0 overflow-y-auto py-2">
                    <ul className="space-y-1">
                        {NAV_ITEMS.map(item => (
                            <li key={item}>
                                <button
                                    onClick={() => setActiveTab(item)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item ? 'bg-brand-light text-brand-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="flex-grow pl-8 pb-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
             <div className="px-8 py-4 border-t border-slate-200 bg-white rounded-b-xl flex justify-end space-x-3">
                <button onClick={onClose} className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={onClose} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm">Save Changes</button>
            </div>
        </PracticeModal>
        <ProviderFinancialsPanel provider={selectedProvider} isOpen={!!selectedProvider} onClose={() => setSelectedProvider(null)} />
        </>
    );
};

const PracticeDetailsTab: React.FC = () => (
    <div className="space-y-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-4 mb-6">Practice Details</h3>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Practice Name</label>
            <input type="text" defaultValue="Oakside Wellness Center" className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
        </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" defaultValue="contact@oaksidewellness.com" className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input type="text" defaultValue="123 Health St, Wellville, CA" className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm" />
        </div>
    </div>
);

interface PracticeFinancialsTabProps {
    mode: FinancialMode;
    setMode: (mode: FinancialMode) => void;
    onViewProvider: (provider: Provider) => void;
    currentUserRole: UserRole;
}

const PracticeFinancialsTab: React.FC<PracticeFinancialsTabProps> = ({ mode, setMode, onViewProvider, currentUserRole }) => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Practice Financials</h3>
                    <p className="text-sm text-slate-500 mt-1">Manage payouts, withdrawals, and financial settings.</p>
                </div>
                <div className="mt-4 sm:mt-0 inline-flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMode(FinancialMode.Personal)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === FinancialMode.Personal ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Personal Mode
                    </button>
                    <button
                        onClick={() => setMode(FinancialMode.Shared)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${mode === FinancialMode.Shared ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Shared Mode
                    </button>
                </div>
            </div>

            {mode === FinancialMode.Shared ? <SharedMode /> : <PersonalMode onViewProvider={onViewProvider} currentUserRole={currentUserRole} />}
        </div>
    );
};

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    balance: number;
    withdrawable: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, title = "Withdraw Funds", subtitle = "Transfer money from your wallet to your bank account.", balance, withdrawable }) => {
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState(MOCK_BANK_ACCOUNTS[0].id);

    if (!isOpen) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmount(val);
        if (parseFloat(val) > withdrawable) {
            setError('Amount exceeds withdrawable balance');
        } else {
            setError(null);
        }
    };

    const handleConfirm = () => {
        if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > withdrawable) {
            setError('Please enter a valid amount');
            return;
        }
        onClose();
        alert(`Successfully withdrew $${amount} to ${MOCK_BANK_ACCOUNTS.find(b => b.id === selectedAccount)?.bankName}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Available to Withdraw</p>
                            <p className="text-2xl font-bold text-green-600">${withdrawable.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Total Balance</p>
                            <p className="text-sm font-medium text-slate-700">${balance.toLocaleString()}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Withdrawal Amount</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                className={`block w-full pl-7 pr-12 py-2.5 border rounded-lg shadow-sm ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-primary focus:border-brand-primary'}`}
                                placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-slate-500 sm:text-sm">USD</span>
                            </div>
                        </div>
                        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payout Account</label>
                        <div className="relative">
                             <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="appearance-none w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-800"
                             >
                                {MOCK_BANK_ACCOUNTS.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.bankName} (****{account.accountLast4})
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"><ChevronDownIcon /></div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex space-x-3">
                    <button onClick={onClose} className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={handleConfirm} className="flex-1 bg-brand-primary text-white font-semibold py-2.5 rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm">Confirm Withdraw</button>
                </div>
            </div>
        </div>
    );
};

const SharedMode: React.FC = () => {
    const [autoWithdraw, setAutoWithdraw] = useState(false);
    const [refundMethod, setRefundMethod] = useState('original');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const [paymentMethods, setPaymentMethods] = useState([
        { id: 1, type: 'wallet', label: 'Practice Wallet', icon: WalletIcon, last4: '', brand: 'Vibrant', isDefault: true },
        { id: 2, type: 'card', label: 'Amex', icon: CreditCardIcon, last4: '2034', brand: 'Amex', isDefault: false },
        { id: 3, type: 'bank', label: 'Chase Bank', icon: BuildingLibraryIcon, last4: '1478', brand: 'Chase', isDefault: false },
    ]);

    const handleSetDefault = (id: number) => {
        setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    };

    const handleDelete = (id: number) => {
        setPaymentMethods(prev => prev.filter(m => m.id !== id));
    };

    return (
    <div className="space-y-8">
        <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            balance={MOCK_PRACTICE_WALLET.total}
            withdrawable={MOCK_PRACTICE_WALLET.withdrawable}
        />

        <div className="relative overflow-hidden p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
                <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <WalletIcon className="h-5 w-5 text-brand-primary" />
                        <h4 className="font-bold text-slate-900 text-lg">Practice Wallet</h4>
                    </div>
                    <p className="text-sm text-slate-500">Centralized funds for all practice operations.</p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                    <p className="text-sm text-slate-500 mb-1">Total Balance</p>
                    <p className="text-4xl font-bold text-slate-900">${MOCK_PRACTICE_WALLET.total.toLocaleString()}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">Available: ${MOCK_PRACTICE_WALLET.withdrawable.toLocaleString()}</p>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex space-x-3 relative z-10">
                <button className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50 transition-colors">Top Up Wallet</button>
                <button onClick={() => setIsWithdrawModalOpen(true)} className="bg-brand-primary text-white font-semibold py-2 px-6 rounded-lg text-sm hover:bg-brand-primary/90 transition-colors shadow-sm">Withdraw Funds</button>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-brand-light/30 rounded-full blur-2xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                    <CreditCardIcon className="h-4 w-4 mr-2 text-slate-400" />
                    Payment Methods
                </h4>
                <div className="space-y-3">
                    {paymentMethods.map((method) => (
                        <div key={method.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-brand-primary/30 hover:shadow-sm transition-all">
                            <div className="flex items-center space-x-4">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${method.type === 'wallet' ? 'bg-brand-light text-brand-primary' : 'bg-slate-50 text-slate-600'}`}>
                                    <method.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-semibold text-slate-800">{method.label} {method.last4 && `••• ${method.last4}`}</p>
                                        {method.isDefault && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">DEFAULT</span>}
                                    </div>
                                    <p className="text-xs text-slate-500 capitalize">{method.brand}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!method.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(method.id)}
                                        className="text-xs font-medium text-brand-primary hover:underline px-2"
                                    >
                                        Set Default
                                    </button>
                                )}
                                {method.type !== 'wallet' && (
                                    <button onClick={() => handleDelete(method.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-md hover:bg-red-50">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                         <h4 className="text-sm font-bold text-slate-900 flex items-center">
                            <BuildingLibraryIcon className="h-4 w-4 mr-2 text-slate-400" />
                            Withdraw Account
                         </h4>
                         <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500 font-medium">Auto-withdraw</span>
                            <button role="switch" aria-checked={autoWithdraw} onClick={() => setAutoWithdraw(!autoWithdraw)} className={`relative inline-flex items-center h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${autoWithdraw ? 'bg-brand-primary' : 'bg-slate-200'}`} ><span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoWithdraw ? 'translate-x-4' : 'translate-x-0'}`}/></button>
                         </div>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                             <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                                    <BuildingLibraryIcon className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">Chase Bank</p>
                                    <p className="text-xs text-slate-500">**** 6789</p>
                                </div>
                             </div>
                             <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-900 mb-1">Refund Method</h4>
                     <p className="text-xs text-slate-500 mb-4">Choose how provider-paid bills are refunded.</p>
                     <div className="space-y-3">
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${refundMethod === 'original' ? 'bg-brand-light/20 border-brand-primary' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                            <input type="radio" name="refund-method" value="original" checked={refundMethod === 'original'} onChange={(e) => setRefundMethod(e.target.value)} className="text-brand-primary focus:ring-brand-primary" />
                            <span className="ml-3 text-sm font-medium text-slate-700">Original payment method</span>
                        </label>
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${refundMethod === 'wallet' ? 'bg-brand-light/20 border-brand-primary' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                            <input type="radio" name="refund-method" value="wallet" checked={refundMethod === 'wallet'} onChange={(e) => setRefundMethod(e.target.value)} className="text-brand-primary focus:ring-brand-primary" />
                            <span className="ml-3 text-sm font-medium text-slate-700">Wallet Credit</span>
                        </label>
                     </div>
                </div>
            </div>
        </div>
    </div>
)};

const PersonalMode = ({ onViewProvider, currentUserRole }: { onViewProvider: (provider: Provider) => void, currentUserRole: UserRole }) => {
    const [withdrawModalProvider, setWithdrawModalProvider] = useState<Provider | null>(null);

    const displayedProviders = currentUserRole === UserRole.Admin
        ? MOCK_PROVIDERS
        : MOCK_PROVIDERS.filter(p => p.id === '1');

    return (
    <div className="space-y-4">
        <WithdrawModal
            isOpen={!!withdrawModalProvider}
            onClose={() => setWithdrawModalProvider(null)}
            balance={withdrawModalProvider?.wallet.total || 0}
            withdrawable={withdrawModalProvider?.wallet.withdrawable || 0}
        />

        <div className="flex justify-between items-center mb-2">
             <p className="text-sm text-slate-500">
                {currentUserRole === UserRole.Admin
                    ? `Managing financials for ${displayedProviders.length} providers.`
                    : "Manage your personal wallet and payouts."}
             </p>
        </div>

        {displayedProviders.map(p => (
            <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-brand-primary/30 transition-all">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <img src={p.avatar} alt={p.name} className="h-12 w-12 rounded-full border-2 border-white shadow-sm" />
                    <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-sm text-slate-500">{p.role}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-8">
                    <div className="text-right">
                        <p className="font-bold text-slate-900 text-lg">${p.wallet.total.toLocaleString()}</p>
                        <div className="flex items-center space-x-1 justify-end group relative cursor-help">
                            <p className="text-xs text-slate-500">Withdrawable: ${p.wallet.withdrawable.toLocaleString()}</p>
                            <InformationCircleIcon className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex space-x-2 pl-4 border-l border-slate-100">
                        <button
                            onClick={() => onViewProvider(p)}
                            className="px-3 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setWithdrawModalProvider(p)}
                            className="px-3 py-2 bg-brand-primary text-white font-semibold rounded-lg text-sm hover:bg-brand-primary/90 transition-colors shadow-sm"
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
)};

const ProviderFinancialsPanel = ({ provider, isOpen, onClose }: { provider: Provider | null, isOpen: boolean, onClose: () => void }) => {
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [transactionsFilter, setTransactionsFilter] = useState('All Types');

    const [paymentMethods, setPaymentMethods] = useState([
        { id: 'pm1', type: 'Visa', last4: '4242', exp: '12/25', isDefault: true },
        { id: 'pm2', type: 'Amex', last4: '1002', exp: '09/26', isDefault: false },
    ]);

    if (!isOpen || !provider) return null;

    const statusColor: Record<string, string> = {
        Completed: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Failed: 'bg-red-100 text-red-800',
    };

    const filteredTransactions = transactionsFilter === 'All Types'
        ? MOCK_TRANSACTIONS
        : MOCK_TRANSACTIONS.filter(t => t.status === transactionsFilter);

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-30 z-[60]" onClick={onClose}>
            <div
                className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white z-10 sticky top-0">
                    <div className="flex items-center space-x-4">
                        <img src={provider.avatar} className="h-12 w-12 rounded-full border border-slate-200" alt="" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">{provider.name}</h3>
                            <p className="text-sm text-slate-500">{provider.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto bg-white">
                    <div className="p-6 border-b border-slate-100">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
                                <p className="text-xl font-bold text-slate-900">${provider.wallet.total.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Withdrawable</p>
                                <p className="text-xl font-bold text-green-600">${provider.wallet.withdrawable.toLocaleString()}</p>
                            </div>
                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">This Period</p>
                                <p className="text-xl font-bold text-brand-primary">+ $1,240</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
                            <h4 className="font-bold text-slate-900 text-sm">Transaction History</h4>
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <select className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg pl-8 pr-8 py-2 focus:ring-brand-primary focus:border-brand-primary shadow-sm cursor-pointer hover:bg-slate-50">
                                        <option>Last 30 Days</option>
                                        <option>Last 90 Days</option>
                                        <option>Last Year</option>
                                    </select>
                                    <CalendarIcon className="absolute left-2.5 top-2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><ChevronDownIcon /></div>
                                </div>
                                <div className="relative">
                                    <select
                                        value={transactionsFilter}
                                        onChange={(e) => setTransactionsFilter(e.target.value)}
                                        className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:ring-brand-primary focus:border-brand-primary shadow-sm cursor-pointer hover:bg-slate-50"
                                    >
                                        <option>All Types</option>
                                        <option>Completed</option>
                                        <option>Pending</option>
                                        <option>Failed</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"><ChevronDownIcon /></div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-100">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                        <th scope="col" className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-xs font-medium text-slate-900">{t.date.split(' ')[0]}</div>
                                                <div className="text-[10px] text-slate-400">#{t.id.toUpperCase()}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-xs text-slate-700 font-medium">Payout from {t.patientName}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-900 whitespace-nowrap text-right">${t.amount.toFixed(2)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase ${statusColor[t.status]}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No transactions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};
