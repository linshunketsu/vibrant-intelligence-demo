// Practice Dashboard View migrated from myPractice folder
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TimeRange, UserRole, AtRiskPatient, Transaction, PaymentDetail, PracticeDocument } from '../practiceTypes';
import { PracticeCard } from './practice/PracticeCard';
import { MetricCard } from './practice/MetricCard';
import { PracticeModal } from './practice/PracticeModal';
import {
    FilterIcon, ChevronDownIcon, SparklesIcon, GearIcon, WarningIcon, SendIcon, SearchIcon, DocumentAddIcon, FileIcon, DownloadIcon,
    TruckIcon, CalculatorIcon, BookOpenIcon, CubeIcon, ClipboardIcon, ChevronRightIcon, PlusIcon, CheckCircleIcon, XMarkIcon, TrashIcon,
    PinIcon, CheckIcon, CalendarIcon, CreditCardIcon, BuildingLibraryIcon, WalletIcon, ChatBubbleIcon, ArrowPathIcon, LoadingIcon,
    ArrowUpIcon, ArrowDownIcon, BeakerIcon, InformationCircleIcon, UserIcon
} from './practice/PracticeIcons';
import { MOCK_PRACTICE_WALLET, MOCK_AT_RISK_PATIENTS, MOCK_TRANSACTIONS, MOCK_DOCUMENTS, MOCK_PROVIDERS, METRIC_LIBRARY_DATA } from '../practiceConstants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, LabelList } from 'recharts';
import { analyzeEngagement, queryPracticeInsights } from '../services/practiceGeminiService';

// Helper function to render markdown-like responses with rich UI
const renderMarkdownResponse = (text: string) => {
    const lines = text.split('\n');
    const sections: JSX.Element[] = [];
    let currentListItems: string[] = [];

    // Helper to flush accumulated list items
    const flushList = () => {
        if (currentListItems.length > 0) {
            sections.push(
                <ul className="space-y-2 my-3">
                    {currentListItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5"></span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            );
            currentListItems = [];
        }
    };

    let currentTable: { rows: string[][], headers: string[] } | null = null;

    // Helper to flush table
    const flushTable = () => {
        if (currentTable) {
            sections.push(
                <div className="my-4 rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {currentTable.headers.map((header, idx) => (
                                    <th key={idx} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentTable.rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                                    {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="px-3 py-2.5 text-slate-700">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            currentTable = null;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Empty line - reset state
        if (!trimmed) {
            flushList();
            flushTable();
            continue;
        }

        // Headers (## or ###)
        if (trimmed.startsWith('##')) {
            flushList();
            flushTable();
            const headerText = trimmed.replace(/^#+\s*/, '');
            const level = trimmed.startsWith('###') ? 'text-base' : 'text-lg';
            sections.push(
                <h3 className={`font-bold text-slate-800 ${level} mt-5 mb-3 flex items-center gap-2`}>
                    <span className="w-1 h-6 bg-brand-primary rounded-full"></span>
                    {headerText}
                </h3>
            );
        }
        // Numbered list (1., 2., etc.)
        else if (/^\d+\./.test(trimmed)) {
            flushList();
            flushTable();
            const itemText = trimmed.replace(/^\d+\.\s*/, '');
            currentListItems.push(itemText);
        }
        // Bullet points with • or -
        else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            flushTable();
            const itemText = trimmed.replace(/^[\s•-]+\s*/, '');
            currentListItems.push(itemText);
        }
        // Table rows
        else if (trimmed.includes('|') && trimmed.includes('---')) {
            // Table separator line - start new table
            flushList();
            if (i > 0 && lines[i-1].includes('|')) {
                // Get headers from previous line
                const headers = lines[i-1].split('|').map(h => h.trim()).filter(h => h);
                currentTable = { rows: [], headers };
            }
        }
        else if (trimmed.includes('|') && currentTable) {
            const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
            currentTable.rows.push(cells);
        }
        // Bold text with **text**
        else if (trimmed.includes('**')) {
            flushList();
            flushTable();
            const parts = trimmed.split(/\*\*(.+?)\*\*/g);
            sections.push(
                <p className="text-sm text-slate-700 my-2">
                    {parts.map((part, idx) => (
                        <span key={idx} className={idx % 2 === 1 ? 'font-bold text-slate-800' : ''}>
                            {part}
                        </span>
                    ))}
                </p>
            );
        }
        // Regular paragraph
        else {
            flushList();
            flushTable();
            sections.push(<p className="text-sm text-slate-700 my-2">{trimmed}</p>);
        }
    }

    // Flush any remaining content
    flushList();
    flushTable();

    return <div className="space-y-1">{sections}</div>;
};

interface DashboardProps {
  onOpenSettings: () => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
}

interface SidePanelProps {
    title?: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ title, isOpen, onClose, children, className = "max-w-md", footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-30" onClick={onClose}>
            <div
                className={`fixed top-0 right-0 h-full w-full ${className} bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out`}
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
                <div className="flex-grow overflow-y-auto bg-slate-50">
                    {children}
                </div>
                {footer && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-white border ${isOpen ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-slate-300 hover:border-slate-400'} rounded-lg py-2 pl-3 pr-2 text-xs font-medium text-slate-700 shadow-sm transition-all`}
            >
                <span className="truncate mr-2">{value}</span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-lg shadow-xl ring-1 ring-black/5 border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left relative py-2 pl-9 pr-4 text-xs font-medium transition-colors ${value === option ? 'text-brand-primary bg-slate-50' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            {value === option && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary">
                                    <CheckIcon className="h-3.5 w-3.5" />
                                </div>
                            )}
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const UploadDocumentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setTitle('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <PracticeModal isOpen={isOpen} onClose={onClose} title="Upload Document" size="2xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload File</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
            {file ? (
              <div className="flex items-center justify-between w-full max-w-md bg-brand-light/30 p-4 rounded-lg border border-brand-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileIcon className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="h-12 w-12 bg-brand-light/50 rounded-full flex items-center justify-center mb-3">
                  <DocumentAddIcon className="h-6 w-6 text-brand-primary" />
                </div>
                <p className="text-sm text-slate-900 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PDF, DOCX, JPG up to 10MB</p>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                  }}
                />
                <button className="mt-4 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 shadow-sm pointer-events-none">
                  Choose File
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Patient Intake v2"
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm py-2.5 px-3"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-slate-200 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-xl">
        <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-all flex items-center ${file && title ? 'bg-brand-primary hover:bg-brand-primary/90' : 'bg-slate-300 cursor-not-allowed'}`}
          disabled={!file || !title}
        >
          {file ? 'Upload Document' : 'Select File to Upload'}
        </button>
      </div>
    </PracticeModal>
  );
};

const getFinancialDataForRange = (range: TimeRange, scope: string = 'all') => {
    let count = 4;
    let labelPrefix = 'Wk ';
    let modifier = scope === 'all' ? 1 : 0.4;

    switch(range) {
        case TimeRange.Last7Days:
            count = 7;
            labelPrefix = 'Day ';
            modifier *= 0.25;
            break;
        case TimeRange.Last30Days:
            count = 4;
            labelPrefix = 'Week ';
            break;
        case TimeRange.LastQuarter:
            count = 12;
            labelPrefix = 'Week ';
            break;
        case TimeRange.LastYear:
            count = 12;
            labelPrefix = 'Month ';
            modifier *= 4;
            break;
    }

    return Array.from({ length: count }).map((_, i) => {
        const seed = (i + 1) * 1234;
        const randomFactor = (seed % 100) / 100 + 0.5;
        const labPatientPay = Math.round(4000 * modifier * randomFactor);
        const labProviderPay = Math.round(3500 * modifier * randomFactor);
        const labMarkup = Math.round(500 * modifier * randomFactor);
        const practiceProducts = Math.round(900 * modifier * randomFactor);
        const quickBill = Math.round(1400 * modifier * randomFactor);
        const subscriptions = Math.round(1500 * modifier * randomFactor);
        const serviceFees = Math.round(2200 * modifier * randomFactor);
        const clinicRevenue = labMarkup + practiceProducts + quickBill + subscriptions + serviceFees;
        const vibrantPayments = labPatientPay + labProviderPay;
        const totalRevenue = clinicRevenue + vibrantPayments;
        return {
            name: `${labelPrefix}${i + 1}`,
            labPatientPay,
            labProviderPay,
            labMarkup,
            practiceProducts,
            quickBill,
            subscriptions,
            serviceFees,
            clinicRevenue,
            vibrantPayments,
            totalRevenue,
        };
    });
};

const getGrowthDataForRange = (range: TimeRange, scope: string = 'all') => {
    let count = 4;
    let labelPrefix = 'Week ';
    let multiplier = scope === 'all' ? 1 : 0.3;
    if (range === TimeRange.Last7Days) { count = 7; labelPrefix = 'Day '; }
    else if (range === TimeRange.LastYear) { count = 12; labelPrefix = 'Month '; }
    else if (range === TimeRange.LastQuarter) { count = 12; labelPrefix = 'Week '; }
    return Array.from({ length: count }).map((_, i) => ({
        name: `${labelPrefix}${i + 1}`,
        total: Math.floor((Math.random() * 10 + 5) * multiplier)
    }));
};

const getEngagementDataForRange = (range: TimeRange, scope: string = 'all') => {
    let count = 4;
    let labelPrefix = 'Week ';
    let multiplier = scope === 'all' ? 1 : 0.3;
    if (range === TimeRange.Last7Days) { count = 7; labelPrefix = 'Day '; }
    else if (range === TimeRange.LastYear) { count = 12; labelPrefix = 'Month '; }
    else if (range === TimeRange.LastQuarter) { count = 12; labelPrefix = 'Week '; }
    return Array.from({ length: count }).map((_, i) => {
        const total = Math.floor((Math.random() * 40 + 20) * multiplier);
        const engaged = Math.floor(total * 0.8);
        return {
            name: `${labelPrefix}${i + 1}`,
            engaged,
            notEngaged: total - engaged,
            total
        };
    });
};

export const PracticeView: React.FC<DashboardProps> = ({ onOpenSettings, currentUserRole, setCurrentUserRole }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.Last30Days);
  const [atRiskPatients, setAtRiskPatients] = useState<AtRiskPatient[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeFollowUpTab, setActiveFollowUpTab] = useState<'Active' | 'Archived'>('Active');
  const [resolvedPatientIds, setResolvedPatientIds] = useState<string[]>([]);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);

  const [activeProviderId, setActiveProviderId] = useState<string | 'all'>(
    currentUserRole === UserRole.Provider ? '1' : 'all'
  );

  const [pinnedIds, setPinnedIds] = useState<string[]>(['5', '6', '1']);
  const [keyMetricIds, setKeyMetricIds] = useState<string[]>(['2', '3', '4', '7']);

  const [askAiQuery, setAskAiQuery] = useState('');
  const [aiDeepDiveResponse, setAiDeepDiveResponse] = useState<string | null>(null);
  const [isAiDeepDiveLoading, setIsAiDeepDiveLoading] = useState(false);

  const [docs, setDocs] = useState<PracticeDocument[]>(MOCK_DOCUMENTS);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('All Documents');
  const [docSortOrder, setDocSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteDocModalOpen, setIsDeleteDocModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<PracticeDocument | null>(null);

  const [txTypeFilter, setTxTypeFilter] = useState('All Transaction Types');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All Payment Methods');
  const [payerFilter, setPayerFilter] = useState('All Payers');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [expandedTxIds, setExpandedTxIds] = useState<Set<string>>(new Set());

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [tempProviderId, setTempProviderId] = useState<string | 'all'>(activeProviderId);

  const combinedFinancialData = useMemo(() => getFinancialDataForRange(timeRange, activeProviderId), [timeRange, activeProviderId]);
  const totalGrowthData = useMemo(() => getGrowthDataForRange(timeRange, activeProviderId), [timeRange, activeProviderId]);
  const engagementData = useMemo(() => getEngagementDataForRange(timeRange, activeProviderId), [timeRange, activeProviderId]);

  const activeProvider = useMemo(() =>
    activeProviderId === 'all' ? null : MOCK_PROVIDERS.find(p => p.id === activeProviderId)
  , [activeProviderId]);

  const activeScopeLabel = useMemo(() =>
    activeProvider ? activeProvider.name : 'Practice View'
  , [activeProvider]);

  useEffect(() => {
    analyzeEngagement({ timeRange }).then(result => {
        let filteredPatients = result.atRiskPatients;
        if (activeProviderId !== 'all') {
            const providerName = MOCK_PROVIDERS.find(p => p.id === activeProviderId)?.name;
            if (providerName) {
                filteredPatients = result.atRiskPatients.filter(p => p.assignedProvider === providerName);
            }
        }
        setAtRiskPatients(filteredPatients);
    });
  }, [timeRange, activeProviderId]);

  const statusColor: Record<string, string> = {
    Completed: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Failed: 'bg-red-50 text-red-700 border-red-200',
  };

  const FULL_METRIC_LIBRARY = useMemo(() => {
    const metrics = Object.values(METRIC_LIBRARY_DATA).flat();
    return metrics.map(m => {
        const baseValue = parseFloat(m.value.replace(/[^0-9.]/g, ''));
        const unit = m.value.includes('%') ? '%' : m.value.includes('h') ? 'h' : '';
        const val = activeProviderId === 'all' ? baseValue : baseValue * 0.3;
        return {
            ...m,
            value: `${val.toFixed(m.value.includes('.') ? 1 : 0)}${unit}`,
            change: Math.floor(Math.random() * 20) - 10,
            description: m.description,
        };
    });
  }, [activeProviderId]);

  const pinnedMetrics = useMemo(() =>
    FULL_METRIC_LIBRARY.filter(m => pinnedIds.includes(m.id))
      .sort((a, b) => pinnedIds.indexOf(a.id) - pinnedIds.indexOf(b.id))
  , [FULL_METRIC_LIBRARY, pinnedIds]);

  const displayedKeyMetrics = useMemo(() =>
    FULL_METRIC_LIBRARY.filter(m => keyMetricIds.includes(m.id))
      .sort((a, b) => keyMetricIds.indexOf(a.id) - keyMetricIds.indexOf(b.id))
  , [FULL_METRIC_LIBRARY, keyMetricIds]);

  const swapCandidateIds = useMemo(() => {
    const allIds = FULL_METRIC_LIBRARY.map(m => m.id);
    return allIds.filter(id => !pinnedIds.includes(id) && !keyMetricIds.includes(id));
  }, [FULL_METRIC_LIBRARY, pinnedIds, keyMetricIds]);

  const handleUnpin = (id: string) => {
    setPinnedIds(prev => prev.filter(mid => mid !== id));
    if (keyMetricIds.length < 4) {
        setKeyMetricIds(prev => [...prev, id]);
    }
  };

  const handlePin = (id: string) => {
    if (pinnedIds.length < 3) {
        setPinnedIds(prev => [...prev, id]);
        setKeyMetricIds(prev => prev.filter(mid => mid !== id));
    }
  };

  const handleSwapRandom = (targetId: string) => {
    if (swapCandidateIds.length === 0) return;
    const randomIndex = Math.floor(Math.random() * swapCandidateIds.length);
    const newId = swapCandidateIds[randomIndex];
    setKeyMetricIds(prev => prev.map(id => id === targetId ? newId : id));
  };

  const handleExport = () => alert("Exporting data to CSV for " + timeRange + "...");
  const handleDownloadSelected = () => {
      alert(`Downloading receipts for ${selectedTxIds.size} selected transactions...`);
      setSelectedTxIds(new Set());
  };
  const handleDownloadSingle = (id: string) => alert(`Downloading receipt for Transaction #${id}...`);
  const handleDateSelect = (range: TimeRange) => {
      if (range !== TimeRange.CustomRange) {
          setTimeRange(range);
          setIsDateFilterOpen(false);
      }
  };
  const handleApplyProviderFilter = () => {
      setActiveProviderId(tempProviderId);
      setIsFilterDrawerOpen(false);
  };
  const handleClearProviderFilter = () => {
      setTempProviderId('all');
      setActiveProviderId('all');
      setIsFilterDrawerOpen(false);
  };
  const handleResolvePatient = (id: string) => setResolvedPatientIds([...resolvedPatientIds, id]);

  const getPaymentIcon = (method: string) => {
      if (method === 'Card') return <CreditCardIcon className="h-4 w-4 text-slate-500" />;
      if (method === 'Bank Transfer') return <BuildingLibraryIcon className="h-4 w-4 text-slate-500" />;
      if (method === 'Wallet Credit') return <WalletIcon className="h-4 w-4 text-slate-500" />;
      return <div className="h-4 w-4 rounded-full bg-slate-200" />;
  };

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
  };

  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => {
      const matchSearch = t.id.toLowerCase().includes(txSearchQuery.toLowerCase()) || t.patientName.toLowerCase().includes(txSearchQuery.toLowerCase());
      const matchType = txTypeFilter === 'All Transaction Types' || t.type === txTypeFilter;
      const matchMethod = paymentMethodFilter === 'All Payment Methods' || t.paymentMethod === paymentMethodFilter;
      const matchPayer = payerFilter === 'All Payers' || t.payer === payerFilter;
      const matchScope = activeProviderId === 'all' || (activeProvider && t.patientName === activeProvider.name);
      return matchSearch && matchType && matchMethod && matchPayer && matchScope;
  });

  const handleSelectAllTransactions = (checked: boolean) => {
    if (checked) {
      setSelectedTxIds(new Set(filteredTransactions.map(t => t.id)));
    } else {
      setSelectedTxIds(new Set());
    }
  };

  const toggleTxSelection = (id: string) => {
    const newSelected = new Set(selectedTxIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTxIds(newSelected);
  };

  const toggleTxExpansion = (id: string) => {
    const newExpanded = new Set(expandedTxIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTxIds(newExpanded);
  };

  const filteredDocuments = docs.filter(doc => {
      const matchSearch = doc.title.toLowerCase().includes(docSearchQuery.toLowerCase());
      const matchType = docTypeFilter === 'All Documents' || doc.type === docTypeFilter;
      return matchSearch && matchType;
  });

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return docSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredDocuments, docSortOrder]);

  const handleInitiateDeleteDoc = (doc: PracticeDocument) => {
    setDocToDelete(doc);
    setIsDeleteDocModalOpen(true);
  };

  const handleConfirmDeleteDoc = () => {
    if (docToDelete) {
        setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
        setDocToDelete(null);
        setIsDeleteDocModalOpen(false);
    }
  };

  const financialSummaryText = useMemo(() => {
    if (!combinedFinancialData.length || combinedFinancialData.length < 2) return "Collecting more transaction data to identify trends.";
    const last = combinedFinancialData[combinedFinancialData.length - 1];
    const prev = combinedFinancialData[combinedFinancialData.length - 2];
    const volDiff = ((last.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100;
    const volTrend = volDiff > 0 ? "increased" : "decreased";
    const keepsRatio = last.clinicRevenue / last.totalRevenue;
    const keepsTrend = keepsRatio > 0.5 ? "primarily retained" : "primarily allocated to lab services";
    return `Total transaction volume for this scope ${volTrend} by ${Math.abs(Math.round(volDiff))}% in the last period. Revenue is currently ${keepsTrend}. Major drivers remain Quick Bill and Subscriptions within this scope.`;
  }, [combinedFinancialData]);

  const aiExecutiveSummary = useMemo(() => `${activeScopeLabel} performance is trending up with a +12% shift in revenue for the selected scope. acquisitions and engagement remain strong areas of stability.`, [activeScopeLabel]);

  const displayedFollowUps = useMemo(() => activeFollowUpTab === 'Active' ? atRiskPatients.filter(p => !resolvedPatientIds.includes(p.id)) : atRiskPatients.filter(p => resolvedPatientIds.includes(p.id)), [atRiskPatients, activeFollowUpTab, resolvedPatientIds]);

  const handleAiDeepDiveSubmit = async () => {
    if (!askAiQuery.trim()) return;
    setIsAiDeepDiveLoading(true);
    setAiDeepDiveResponse(null);
    try {
        const result = await queryPracticeInsights(askAiQuery, timeRange, activeScopeLabel);
        setAiDeepDiveResponse(result);
    } catch (e) {
        setAiDeepDiveResponse("An error occurred while analyzing metrics for this scope.");
    } finally {
        setIsAiDeepDiveLoading(false);
    }
  };

  const SectionHeader = ({ title }: { title: string }) => {
    return (
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Practice Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
                <div className="bg-brand-light h-12 w-12 rounded-lg flex items-center justify-center"><span className="text-2xl font-bold text-brand-primary">W</span></div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Oakside Wellness Center</h2>
                    <p className="text-sm text-slate-500">123 Health St, Wellville, CA &bull; (555) 123-4567 &bull; Integrative Medicine</p>
                </div>
            </div>
            <button onClick={onOpenSettings} className="flex items-center space-x-2 bg-white text-brand-primary border border-brand-primary font-semibold py-2 px-4 rounded-lg hover:bg-brand-light transition-colors">
                <GearIcon /><span>Practice Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 pb-12">

          <header>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Clinic Charting</h1>
                <p className="text-slate-500 mt-1">Overview of engagement, financial performance, and provider activity.</p>
              </div>
              <div className="flex items-center space-x-4">
                 {/* Dashboard Scope Selector */}
                 <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dashboard Scope:</span>
                    <div className="relative">
                        <button
                            onClick={() => setIsScopeDropdownOpen(!isScopeDropdownOpen)}
                            className={`flex items-center space-x-2 bg-white border ${isScopeDropdownOpen ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-slate-300 hover:border-slate-400'} rounded-lg py-1.5 pl-3 pr-2 text-xs font-semibold text-slate-700 shadow-sm transition-all min-w-[160px]`}
                        >
                            <UserIcon className="h-3.5 w-3.5 text-brand-primary" />
                            <span className="truncate">{activeScopeLabel}</span>
                            <ChevronDownIcon className={`h-3 w-3 text-slate-400 transition-transform ${isScopeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isScopeDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsScopeDropdownOpen(false)}></div>
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                    {currentUserRole === UserRole.Admin && (
                                        <>
                                            <button
                                                onClick={() => { setActiveProviderId('all'); setTempProviderId('all'); setIsScopeDropdownOpen(false); }}
                                                className={`w-full text-left relative py-2.5 pl-10 pr-4 text-xs font-semibold transition-colors ${activeProviderId === 'all' ? 'text-brand-primary bg-brand-light/20' : 'text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                {activeProviderId === 'all' && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary"><CheckIcon className="h-4 w-4" /></div>}
                                                Practice View (All Providers)
                                            </button>
                                            <div className="my-1 border-t border-slate-100"></div>
                                            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Individual Providers</div>
                                        </>
                                    )}

                                    {MOCK_PROVIDERS.filter(p => currentUserRole === UserRole.Admin || p.id === '1').map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => { setActiveProviderId(p.id); setTempProviderId(p.id); setIsScopeDropdownOpen(false); }}
                                            className={`w-full text-left relative py-2.5 pl-10 pr-4 text-xs font-semibold transition-colors ${activeProviderId === p.id ? 'text-brand-primary bg-brand-light/20' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            {activeProviderId === p.id && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary"><CheckIcon className="h-4 w-4" /></div>}
                                            <div className="flex items-center space-x-2">
                                                <img src={p.avatar} className="h-4 w-4 rounded-full" alt="" />
                                                <span>{p.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                 </div>

                 {/* Role Shortcut Selector for Prototype Visibility */}
                 <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 ml-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">View As:</span>
                    <div className="relative">
                        <select
                            value={currentUserRole}
                            onChange={e => {
                                const newRole = e.target.value as UserRole;
                                setCurrentUserRole(newRole);
                                // Lock scope if switching to provider
                                if (newRole === UserRole.Provider) setActiveProviderId('1');
                            }}
                            className="appearance-none bg-slate-100 border-none rounded-md py-1 px-2 text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                            <option value={UserRole.Admin}>Admin</option>
                            <option value={UserRole.Provider}>Provider</option>
                        </select>
                    </div>
                 </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center border-t border-b border-slate-200 py-2">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            {isDateFilterOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setIsDateFilterOpen(false)}></div>
                            )}
                            <button
                                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                                className={`group flex items-center justify-between bg-white border ${isDateFilterOpen ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-slate-200 hover:border-slate-300'} py-2.5 pl-4 pr-3 rounded-lg text-sm font-medium text-slate-700 focus:outline-none transition-all shadow-sm min-w-[200px]`}
                            >
                                <span className="truncate">{timeRange}</span>
                                <ChevronDownIcon className={`text-slate-400 h-4 w-4 transition-transform duration-200 ${isDateFilterOpen ? 'transform rotate-180' : ''}`} />
                            </button>

                            {isDateFilterOpen && (
                                <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] bg-white rounded-lg shadow-xl ring-1 ring-black/5 border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                                    {Object.values(TimeRange).map((option) => (
                                        <div key={option}>
                                            {option === TimeRange.CustomRange ? (
                                                 <div className="p-2 border-t border-slate-100">
                                                    <div className="text-xs font-semibold text-slate-500 mb-1 px-2">Custom Range</div>
                                                    <input
                                                        type="date"
                                                        className="w-full text-xs border border-slate-200 rounded px-2 py-1 mb-1 focus:ring-brand-primary focus:border-brand-primary"
                                                    />
                                                    <button onClick={() => { setTimeRange(TimeRange.CustomRange); setIsDateFilterOpen(false); }} className="w-full text-xs bg-brand-primary text-white rounded py-1">Apply</button>
                                                 </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDateSelect(option)}
                                                    className={`w-full text-left relative py-2 pl-9 pr-4 text-sm font-medium transition-colors ${timeRange === option ? 'text-slate-900 bg-slate-50' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                                                >
                                                    {timeRange === option && (
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary">
                                                            <CheckIcon className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <span>{option}</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {currentUserRole === UserRole.Admin && (
                            <button
                                onClick={() => setIsFilterDrawerOpen(true)}
                                className={`flex items-center space-x-2 border-l border-slate-200 pl-4 text-sm font-medium transition-colors ${activeProviderId !== 'all' ? 'text-brand-primary' : 'text-slate-700 hover:text-brand-primary'}`}
                            >
                                <FilterIcon /><span>Provider Filter</span>
                                {activeProviderId !== 'all' && (
                                    <span className="ml-1 h-2 w-2 rounded-full bg-brand-primary"></span>
                                )}
                            </button>
                        )}
                    </div>

                    <button onClick={handleExport} className="flex items-center space-x-2 bg-white border border-brand-primary text-brand-primary px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-light transition-colors">
                        <DownloadIcon className="h-4 w-4" />
                        <span>Export Data</span>
                    </button>
              </div>

              {activeProviderId !== 'all' && activeProvider && (
                  <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-slate-500">Currently Viewing:</span>
                      <div className="inline-flex items-center bg-brand-light text-brand-primary rounded-full px-3 py-1 text-xs font-semibold border border-brand-primary/20 shadow-sm">
                          Provider Scoped: {activeProvider.name}
                          {currentUserRole === UserRole.Admin && (
                            <button onClick={handleClearProviderFilter} className="ml-2 hover:bg-white/50 rounded-full p-0.5">
                                <XMarkIcon className="h-3 w-3" />
                            </button>
                          )}
                      </div>
                  </div>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <section className="space-y-4">
                    <SectionHeader title="Top KPIs" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                        {pinnedMetrics.map((metric) => (
                            <div key={metric.id} className="relative group">
                                <button
                                    onClick={() => handleUnpin(metric.id)}
                                    className="absolute top-4 right-4 z-10 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                                    title="Unpin from Top KPIs"
                                >
                                    <div className="relative">
                                        <PinIcon className="h-3.5 w-3.5" filled />
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                            <XMarkIcon className="h-2 w-2" />
                                        </div>
                                    </div>
                                </button>
                                <MetricCard
                                    title={metric.label}
                                    value={metric.value}
                                    change={metric.change}
                                    changePeriod={`vs. prev ${timeRange}`}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                  <SectionHeader title="Patient Growth Over Time" />
                  <Card className="animate-in slide-in-from-top-2 duration-300">
                      <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={totalGrowthData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                  <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                                  <YAxis tick={{fontSize: 12}} stroke="#94a3b8"/>
                                  <Tooltip />
                                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: '20px'}} />
                                  <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} name={`Total Patients (${activeScopeLabel})`} dot={{r: 4}} activeDot={{r: 6}} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </Card>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-4">
                        <SectionHeader title="Patient Engagement Over Time" />
                        <Card className="animate-in slide-in-from-top-2 duration-300">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={engagementData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            cursor={{fill: '#f8fafc'}}
                                            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6 -1px rgba(0, 0, 0, 0.1)'}}
                                            formatter={(value: number, name: string) => {
                                                if (name === 'Engaged') return [value, 'Engaged (provider replied)'];
                                                if (name === 'Not Engaged') return [value, "Not Engaged (provider didn't reply)"];
                                                return [value, name];
                                            }}
                                            labelFormatter={(label, payload) => {
                                                if (payload && payload.length > 0) {
                                                    const data = payload[0].payload;
                                                    return `${label} (Total: ${data.total})`;
                                                }
                                                return label;
                                            }}
                                        />
                                        <Legend iconType="circle" iconSize={8} />
                                        <Bar dataKey="engaged" fill="#4f46e5" name="Engaged" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="notEngaged" fill="#94a3b8" name="Not Engaged" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 italic text-center">
                                *Engagement Rate for {activeScopeLabel}
                            </div>
                        </Card>
                    </div>
                    <div className="space-y-4">
                        <SectionHeader title="Engagement Quality" />
                        <Card className="animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Summarizes overall engagement quality based on chat responsiveness and sentiment signals.
                                </p>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-2xl" role="img" aria-label="Overall sentiment indicator">🙂</span>
                                    <span className="text-sm font-bold text-slate-800">Overall Engagement: Healthy</span>
                                </div>
                                <div className="pt-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sentiment Strategy</p>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Recent conversations for this scope indicate stable engagement with no major risk signals. Continue monitoring threads.
                                    </p>
                                </div>
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
                                     <WarningIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                     <div>
                                         <p className="text-sm font-semibold text-red-800">Risk Alerts</p>
                                         <p className="text-xs text-red-600 mt-1">Chat signals: Frustration detected in {activeScopeLabel} patients.</p>
                                     </div>
                                </div>
                                <button onClick={() => setIsPanelOpen(true)} className="w-full py-2 text-sm font-semibold text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-light transition-colors">
                                    View Scoped Follow-ups
                                </button>
                            </div>
                        </Card>
                    </div>
                </section>

                <section>
                    <Card title={`${activeScopeLabel} Transaction Breakdown`}>
                        <div className="mb-6 p-4 bg-brand-light/30 border border-brand-primary/10 rounded-xl flex items-start space-x-3 shadow-sm">
                            <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                                <InformationCircleIcon className="h-5 w-5 text-brand-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{activeScopeLabel} Movement Insight</p>
                                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{financialSummaryText}</p>
                            </div>
                        </div>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={combinedFinancialData} margin={{ top: 20, right: 10, bottom: 20, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={{stroke: '#e2e8f0'}} tickLine={false} dy={10} />
                                    <YAxis tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 text-xs min-w-[240px]">
                                                        <p className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 text-sm">{label} Breakdown ({activeScopeLabel})</p>
                                                        <div className="mb-4">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-green-700">Clinic Revenue</span>
                                                                <span className="font-bold text-green-700">${data.clinicRevenue.toLocaleString()}</span>
                                                            </div>
                                                            <div className="space-y-1 pl-3 text-slate-600 border-l-2 border-green-100">
                                                                <div className="flex justify-between"><span>Lab Markup</span><span className="font-medium">${data.labMarkup}</span></div>
                                                                <div className="flex justify-between"><span>Practice Products</span><span className="font-medium">${data.practiceProducts}</span></div>
                                                                <div className="flex justify-between"><span>Quick Bill</span><span className="font-medium">${data.quickBill}</span></div>
                                                                <div className="flex justify-between"><span>Service Fees</span><span className="font-medium">${data.serviceFees}</span></div>
                                                                <div className="flex justify-between"><span>Subscriptions</span><span className="font-medium">${data.subscriptions}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="mb-4">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-blue-700">Payments to Vibrant</span>
                                                                <span className="font-bold text-blue-700">${data.vibrantPayments.toLocaleString()}</span>
                                                            </div>
                                                            <div className="space-y-1 pl-3 text-slate-600 border-l-2 border-blue-100">
                                                                <div className="flex justify-between"><span>Lab (Patient Pay)</span><span className="font-medium">${data.labPatientPay}</span></div>
                                                                <div className="flex justify-between"><span>Lab (Provider Pay)</span><span className="font-medium">${data.labProviderPay}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-xl">
                                                            <span className="font-bold text-slate-900">Total Scoped Volume</span>
                                                            <span className="font-bold text-slate-900">${data.totalRevenue.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{paddingTop: '30px', fontSize: '11px', fontWeight: 600}} verticalAlign="bottom" />
                                    <Bar dataKey="labMarkup" stackId="volume" fill="#065f46" name="Lab Markup" />
                                    <Bar dataKey="practiceProducts" stackId="volume" fill="#059669" name="Practice Products" />
                                    <Bar dataKey="quickBill" stackId="volume" fill="#10b981" name="Quick Bill" />
                                    <Bar dataKey="serviceFees" stackId="volume" fill="#34d399" name="Service Fees" />
                                    <Bar dataKey="subscriptions" stackId="volume" fill="#6ee7b7" name="Subscriptions" />
                                    <Bar dataKey="labPatientPay" stackId="volume" fill="#1d4ed8" name="Lab Patient Pay" />
                                    <Bar dataKey="labProviderPay" stackId="volume" fill="#60a5fa" name="Lab Provider Pay" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="totalRevenue" stroke="#1e293b" strokeWidth={1.5} dot={{r: 2, fill: '#1e293b', strokeWidth: 0}} activeDot={{r: 4}} name="Total Volume Trend" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </section>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card title={`${activeScopeLabel} Insights (AI)`}>
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-brand-light/50 to-white border border-brand-primary/10 p-4 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-brand-primary/5 rounded-full blur-xl"></div>
                            <div className="flex items-center space-x-2 mb-3 relative z-10">
                                <SparklesIcon className="h-5 w-5 text-brand-secondary" />
                                <h4 className="font-bold text-slate-800">Executive Summary</h4>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed relative z-10">{aiExecutiveSummary}</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-slate-700 text-sm">Key Metrics</h4>
                            </div>
                            <div className="space-y-3 relative">
                                {displayedKeyMetrics.map((metric) => {
                                    const isFull = pinnedIds.length >= 3;
                                    const canSwap = swapCandidateIds.length > 0;
                                    return (
                                        <div key={metric.id} className="group relative p-4 rounded-xl border transition-all bg-white border-slate-200 hover:border-brand-primary/40">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        disabled={!canSwap}
                                                        onClick={() => handleSwapRandom(metric.id)}
                                                        className={`p-1 rounded-md transition-colors ${canSwap ? 'text-slate-400 hover:text-brand-primary hover:bg-brand-light/50' : 'text-slate-200 cursor-not-allowed'}`}
                                                        title="Swap this metric with a random metric from the library"
                                                    >
                                                        <ArrowPathIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        disabled={isFull}
                                                        onClick={() => handlePin(metric.id)}
                                                        className={`p-1 rounded-md transition-colors relative group/pin ${isFull ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-brand-primary hover:bg-brand-light/50'}`}
                                                        title="Pin to Top KPIs"
                                                    >
                                                        <PinIcon className="h-4 w-4" />
                                                        {isFull && (
                                                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] font-medium rounded shadow-xl opacity-0 group-hover/pin:opacity-100 pointer-events-none transition-opacity z-50 text-center">
                                                                Unpin a Top KPI to pin a new metric here.
                                                            </div>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-baseline space-x-2">
                                                <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
                                                {metric.change !== 0 && (
                                                    <span className={`text-xs font-bold ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {metric.change > 0 ? '+' : ''}{metric.change}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs mt-1 text-slate-400">{metric.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 space-y-4">
                            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Deep Dive AI Assistant</label>
                            {(isAiDeepDiveLoading || aiDeepDiveResponse) && (
                                <div className={`p-4 rounded-xl text-sm leading-relaxed border animate-in fade-in slide-in-from-top-2 duration-300 ${isAiDeepDiveLoading ? 'bg-slate-50 border-slate-100 text-slate-400 italic' : 'bg-brand-light/30 border-brand-primary/20 text-slate-700'}`}>
                                    {isAiDeepDiveLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <LoadingIcon className="h-4 w-4 animate-spin text-brand-primary" />
                                            <span>Analyzing practice data...</span>
                                        </div>
                                    ) : (
                                        <div className="relative group/response">
                                            <button onClick={() => setAiDeepDiveResponse(null)} className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover/response:opacity-100"><XMarkIcon className="h-3 w-3" /></button>
                                            {renderMarkdownResponse(aiDeepDiveResponse)}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ChatBubbleIcon className="h-5 w-5 text-brand-primary/60 group-focus-within:text-brand-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Ask about ${activeScopeLabel} metrics...`}
                                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
                                    value={askAiQuery}
                                    onChange={(e) => setAskAiQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiDeepDiveSubmit()}
                                />
                                <button onClick={handleAiDeepDiveSubmit} disabled={isAiDeepDiveLoading || !askAiQuery.trim()} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><SendIcon className="h-4 w-4" /></button>
                            </div>
                            {!aiDeepDiveResponse && (
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { query: 'Show me no-show rates for the past month', icon: '📅' },
                                        { query: 'What are my top revenue sources?', icon: '💰' },
                                        { query: 'Patient engagement summary', icon: '📊' },
                                        { query: 'Analyze financial performance', icon: '📈' }
                                    ].map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setAskAiQuery(prompt.query);
                                                // Auto-submit after setting
                                                setTimeout(() => {
                                                    handleAiDeepDiveSubmit();
                                                }, 100);
                                            }}
                                            disabled={isAiDeepDiveLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-light/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>{prompt.icon}</span>
                                            <span>{prompt.query}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="!p-0 overflow-hidden border border-slate-200 shadow-sm rounded-xl">
                  <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">Practice Documents</h3>
                          <p className="text-sm text-slate-500 mt-1">View and manage clinical document templates</p>
                      </div>
                      <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-all shadow-sm">
                          <DocumentAddIcon className="h-4 w-4" />
                          <span>Upload Document</span>
                      </button>
                  </div>
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <div className="flex flex-col md:flex-row gap-4">
                          <div className="relative flex-grow">
                              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                              <input type="text" placeholder="Search documents..." value={docSearchQuery} onChange={(e) => setDocSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-brand-primary focus:border-brand-primary shadow-sm" />
                          </div>
                          <div className="w-full md:w-56">
                              <FilterDropdown label="Type" value={docTypeFilter} onChange={setDocTypeFilter} options={["All Documents", "Template", "Uploaded"]} />
                          </div>
                      </div>
                  </div>
                  <div className="overflow-x-auto overflow-visible">
                      <table className="min-w-full divide-y divide-slate-100">
                          <thead className="bg-slate-50/50">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Document Title</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Uploaded By</th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/50 transition-colors group/sort" onClick={() => setDocSortOrder(docSortOrder === 'desc' ? 'asc' : 'desc')}>
                                      <div className="flex items-center">Date {docSortOrder === 'desc' ? <ArrowDownIcon className="ml-1 h-3 w-3 text-slate-400 group-hover/sort:text-brand-primary" /> : <ArrowUpIcon className="ml-1 h-3 w-3 text-slate-400 group-hover/sort:text-brand-primary" />}</div>
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-100">
                              {sortedDocuments.map((doc) => (
                                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group relative">
                                      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><FileIcon className="h-5 w-5 text-slate-400 group-hover:text-brand-primary mr-3" /><span className="text-sm font-semibold text-slate-900 group-hover:text-brand-primary">{doc.title}</span></div></td>
                                      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><img className="h-6 w-6 rounded-full border border-slate-200" src={doc.uploadedByAvatar} alt="" /><span className="ml-2.5 text-sm font-medium text-slate-700">{doc.uploadedBy}</span></div></td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(doc.date)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right">
                                          {currentUserRole === UserRole.Admin && (
                                              <button
                                                  onClick={() => handleInitiateDeleteDoc(doc)}
                                                  className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50"
                                              >
                                                  <TrashIcon className="h-3.5 w-3.5 mr-1" />
                                                  Delete
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                              {sortedDocuments.length === 0 && (<tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500 italic">No documents found.</td></tr>)}
                          </tbody>
                      </table>
                  </div>
              </Card>

              <Card title="Resources & Tools">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                          { title: "FedEx Pickup", desc: "Schedule a pickup", icon: TruckIcon, color: "text-blue-600", bg: "bg-blue-100" },
                          { title: "Price Calculator", desc: "Estimate lab costs", icon: CalculatorIcon, color: "text-green-600", bg: "bg-green-100" },
                          { title: "Blood Draw Center", desc: "Find a phlebotomy location", icon: BeakerIcon, color: "text-blue-600", bg: "bg-blue-100" },
                          { title: "Unassigned Orders", desc: "Review pending orders", icon: ClipboardIcon, color: "text-red-600", bg: "bg-red-100" },
                      ].map((item) => (
                          <div key={item.title} onClick={() => alert(`Navigating to ${item.title} page...`)} className="group relative flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all cursor-pointer">
                              <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}><item.icon className={`h-6 w-6 ${item.color}`} /></div>
                              <div className="ml-4 flex-grow"><h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-primary">{item.title}</h3><p className="text-xs text-slate-500">{item.desc}</p></div>
                              <ChevronRightIcon className="text-slate-300 group-hover:text-brand-primary" />
                          </div>
                      ))}
                  </div>
              </Card>
          </div>

          <Card className="!p-0 overflow-visible border border-slate-200 shadow-sm rounded-xl">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h3 className="text-lg font-bold text-slate-900">{activeScopeLabel} Transactions</h3><p className="text-sm text-slate-500 mt-1">Review financial activity for this scope</p></div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleExport} className="flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"><DownloadIcon className="h-4 w-4" /><span>Export CSV</span></button>
                    <button disabled={selectedTxIds.size === 0} onClick={handleDownloadSelected} className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${selectedTxIds.size > 0 ? 'bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}><DownloadIcon className="h-4 w-4" /><span>Download {selectedTxIds.size > 0 ? `(${selectedTxIds.size})` : 'Selected'}</span></button>
                </div>
            </div>
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative"><SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input type="text" placeholder="Search transactions..." value={txSearchQuery} onChange={(e) => setTxSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-brand-primary focus:border-brand-primary shadow-sm" /></div>
                    <FilterDropdown label="Transaction Type" value={txTypeFilter} onChange={setTxTypeFilter} options={["All Transaction Types", "Lab Tests", "Practice Products", "Quick Bill", "Top Up", "Cash Out", "Refund to Card", "Refund to Wallet", "Subscription"]} />
                    <FilterDropdown label="Method" value={paymentMethodFilter} onChange={setPaymentMethodFilter} options={["All Payment Methods", "Card", "Bank Transfer", "Wallet Credit"]} />
                    <FilterDropdown label="Payer" value={payerFilter} onChange={setPayerFilter} options={["All Payers", "Patient", "Provider", "System"]} />
                    <div className="relative"><button className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"><span className="truncate">05/01/2024 – 05/31/2024</span><CalendarIcon className="h-4 w-4 text-slate-400" /></button></div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left w-10"><input type="checkbox" className="rounded text-brand-primary focus:ring-brand-primary border-slate-300 h-4 w-4 cursor-pointer" checked={filteredTransactions.length > 0 && selectedTxIds.size === filteredTransactions.length} onChange={(e) => handleSelectAllTransactions(e.target.checked)} /></th>
                            <th scope="col" className="w-10"></th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date / Time</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient / Provider</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid Amount</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filteredTransactions.map((t) => {
                            const isExpanded = expandedTxIds.has(t.id);
                            return (
                                <React.Fragment key={t.id}>
                                    <tr className={`group transition-colors ${selectedTxIds.has(t.id) ? 'bg-brand-light/20' : 'hover:bg-slate-50/80'} ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                                        <td className="px-4 py-4 whitespace-nowrap"><input type="checkbox" className="rounded text-brand-primary focus:ring-brand-primary border-slate-300 h-4 w-4 cursor-pointer" checked={selectedTxIds.has(t.id)} onChange={() => toggleTxSelection(t.id)} /></td>
                                        <td className="px-2 py-4 whitespace-nowrap"><button onClick={() => toggleTxExpansion(t.id)} className="p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 transition-all"><ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button></td>
                                        <td className="px-4 py-4 whitespace-nowrap text-[11px] text-slate-500 font-medium">{t.date}</td>
                                        <td className="px-4 py-4 whitespace-nowrap"><span className="text-xs font-semibold text-slate-700">#{t.id.toUpperCase().replace('TX_', '')}</span></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><div className="flex items-center"><img className="h-7 w-7 rounded-full border border-slate-100 object-cover" src={t.patientAvatar} alt="" /><div className="ml-3"><div className="text-sm font-semibold text-slate-900 leading-none mb-1">{t.patientName}</div><div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{t.payer}</div></div></div></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-bold text-slate-900">${t.amount.toFixed(2)}</div></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><div className="text-sm font-medium text-green-600">${t.paidAmount.toFixed(2)}</div></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><div className={`text-sm font-medium ${t.remainingBalance > 0 ? 'text-red-600' : 'text-slate-400'}`}>${t.remainingBalance.toFixed(2)}</div></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><div className="flex items-center space-x-2">{getPaymentIcon(t.paymentMethod)}<span className="text-[11px] font-medium text-slate-700">{t.paymentMethod}</span></div></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><span className="text-[11px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-1 rounded border border-slate-200">{t.type}</span></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor[t.status]}`}>{t.status}</span></td>
                                        <td className="px-4 py-4 whitespace-nowrap"><button onClick={() => handleDownloadSingle(t.id)} className="text-xs font-semibold text-brand-primary hover:text-brand-secondary hover:underline transition-colors">Download</button></td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50/30">
                                            <td colSpan={12} className="px-12 py-4 border-l-4 border-brand-primary">
                                                <div className="animate-in slide-in-from-top-2 duration-300">
                                                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center"><CreditCardIcon className="h-3.5 w-3.5 mr-2 text-brand-primary" />Payment Breakdown</h5>
                                                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm max-w-4xl">
                                                        <table className="min-w-full divide-y divide-slate-50">
                                                            <thead className="bg-slate-50"><tr><th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Payment Date</th><th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Amount</th><th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Method</th><th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">Status</th></tr></thead>
                                                            <tbody className="divide-y divide-slate-50">{t.payments.map(p => (<tr key={p.id}><td className="px-4 py-2 text-xs text-slate-600">{p.date}</td><td className="px-4 py-2 text-xs font-bold text-slate-900">${p.amount.toFixed(2)}</td><td className="px-4 py-2 text-xs text-slate-600"><div className="flex items-center space-x-2">{getPaymentIcon(p.method)}<span>{p.method}</span></div></td><td className="px-4 py-2"><span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] leading-4 font-bold uppercase border ${statusColor[p.status]}`}>{p.status}</span></td></tr>))}</tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
          </Card>

          <SidePanel title="Follow-ups" isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} className="max-w-lg" footer={<div className="text-xs text-slate-500">{displayedFollowUps.length} items for this scope</div>}>
            <div className="flex flex-col h-full"><div className="px-6 pt-4 border-b border-slate-200"><div className="flex space-x-6"><button onClick={() => setActiveFollowUpTab('Active')} className={`pb-3 text-sm font-medium border-b-2 ${activeFollowUpTab === 'Active' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500'}`}>Active</button><button onClick={() => setActiveFollowUpTab('Archived')} className={`pb-3 text-sm font-medium border-b-2 ${activeFollowUpTab === 'Archived' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500'}`}>Archived</button></div></div><div className="p-6 space-y-4">{displayedFollowUps.map(p => (<div key={p.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"><div className="flex justify-between items-start"><h4 className="font-bold text-slate-900">{p.name}</h4><span className="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-600 border border-red-100 uppercase">Alert</span></div><p className="text-sm text-slate-700">{p.reason}</p><div className="flex gap-2"><button className="flex-1 py-1.5 border border-slate-200 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">Chat</button><button onClick={() => handleResolvePatient(p.id)} className="flex-1 py-1.5 bg-brand-primary text-white rounded text-xs font-semibold hover:bg-brand-primary/90 shadow-sm transition-colors">Resolve</button></div></div>))}</div></div>
          </SidePanel>

          <SidePanel title="Select Provider Scope" isOpen={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} footer={<div className="flex space-x-3"><button onClick={handleClearProviderFilter} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700">Practice View</button><button onClick={handleApplyProviderFilter} className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium shadow-sm">Apply Scope</button></div>}>
            <div className="p-6">
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        <input type="radio" checked={tempProviderId === 'all'} onChange={() => setTempProviderId('all')} className="text-brand-primary focus:ring-brand-primary" />
                        <span className="text-sm font-semibold">Entire Practice View</span>
                    </label>
                    <div className="my-2 border-t border-slate-100"></div>
                    {MOCK_PROVIDERS.map(p => (
                        <label key={p.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                            <input type="radio" checked={tempProviderId === p.id} onChange={() => setTempProviderId(p.id)} className="text-brand-primary focus:ring-brand-primary" />
                            <div className="flex items-center space-x-3">
                                <img src={p.avatar} alt="" className="w-8 h-8 rounded-full border border-white shadow-sm" />
                                <span className="text-sm font-medium">{p.name}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
          </SidePanel>

          <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />

          {/* Delete Document Confirmation Modal */}
          <Modal
            isOpen={isDeleteDocModalOpen}
            onClose={() => setIsDeleteDocModalOpen(false)}
            title="Delete document?"
            size="md"
          >
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                 <div className="h-14 w-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                   <TrashIcon className="h-7 w-7 text-red-600" />
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed">
                   This action will permanently delete this document and cannot be undone.
                 </p>
              </div>

              {docToDelete && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Document Name</p>
                   <p className="text-sm font-bold text-slate-900 break-all">{docToDelete.title}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                 <button
                    onClick={() => setIsDeleteDocModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                 >
                   Cancel
                 </button>
                 <button
                    onClick={handleConfirmDeleteDoc}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
                 >
                   Delete
                 </button>
              </div>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
};

// Re-export Card for convenience
const Card = PracticeCard;
const Modal = PracticeModal;
