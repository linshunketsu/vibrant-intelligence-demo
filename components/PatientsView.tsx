import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Plus, User, Calendar, CreditCard, FileText,
  MapPin, Phone, Mail, Pin, Image as ImageIcon, Clock,
  Package, GitBranch, CheckCheck, Send, MoreVertical,
  Mars, Venus, CheckSquare, ClipboardList, UserCircle2,
  ShoppingCart, Truck, FlaskConical, ClipboardCheck, ArrowRight,
  AlertCircle, Pill, StickyNote, Activity, Bell, CheckCircle2,
  AlertTriangle, XCircle, Zap, RefreshCcw, Check, Feather, MoreHorizontal,
  Copy, ArrowUp, RefreshCw, File, Download, Eye, Link as LinkIcon,
  ChevronDown, ChevronUp, DollarSign, Receipt, Shield, Smartphone,
  BriefcaseMedical, ShieldAlert, Notebook, Move, GripVertical, MessageSquare,
  Tag, X, Sparkles, Target, TrendingUp, CalendarDays, Stethoscope
} from 'lucide-react';
import { EncounterNotesEditor } from './EncounterNotesEditor';
import { NotificationCenter } from './NotificationCenter';
import { SidebarAiAssistant } from './SidebarAiAssistant';
import { OrderDiagnosticTestsModal } from './OrderDiagnosticTestsModal';
import { CreateEventModal } from './CreateEventModal';

// --- Interfaces ---

interface Patient {
  id: string;
  name: string;
  initials: string;
  time: string;
  snippet: string;
  unreadCount?: number;
  gender: 'Male' | 'Female';
  dob: string;
  age: number;
  avatar?: string;
  workflowStatus: 'on-track' | 'exception' | 'completed';
  tags?: string[];
}

interface PinnedItem {
    id: string;
    type: 'demographics' | 'contact' | 'financial' | 'medication' | 'allergy' | 'note' | 'document' | 'calendar' | 'billing' | 'tags' | 'program';
    title: string;
    iconName: string;
    data: any;
}

interface SystemEventCardProps {
    icon: any;
    title: string;
    status?: string;
    date: string;
    variant?: 'neutral' | 'success' | 'info' | 'warning' | 'error';
    details?: string;
    actionLabel?: string;
}

// --- Helper Components ---

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (<div className="flex items-center justify-center py-4"><span className="text-[10px] font-medium text-gray-400 bg-slate-100 px-3 py-1 rounded-full">{date}</span></div>);

const ExceptionCard: React.FC<{ title: string; reason: string; suggestion: string }> = ({ title, reason, suggestion }) => {
    const [isYolo, setIsYolo] = useState(false);
    const [actionTaken, setActionTaken] = useState<'none' | 'approved' | 'cancelled'>('none');

    const handleApprove = () => {
        setActionTaken('approved');
    };

    if (actionTaken === 'approved') {
        return (
            <div className="flex justify-center w-full my-4">
                <div className="bg-emerald-50 rounded-xl p-6 shadow-sm border border-emerald-100 max-w-2xl w-full flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCheck size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-emerald-900 font-bold">Exception Resolved</h4>
                        <p className="text-emerald-700 text-sm">Redraw order #20260219-RD created successfully. Patient notified.</p>
                        {isYolo && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <Zap size={12} fill="currentColor" /> AI Autonomy preference saved for future TNP events.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full my-6">
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-amber-500 max-w-2xl w-full overflow-hidden ring-1 ring-black/5">
                {/* Header */}
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={20} />
                    <div className="flex-1">
                        <h3 className="text-amber-900 font-bold text-lg">{title}</h3>
                        <p className="text-amber-700 text-sm mt-1">{reason}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex gap-4 items-start mb-6">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 font-bold text-xs mt-0.5">AI</div>
                        <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-200 text-sm text-slate-700 leading-relaxed">
                            <span className="font-semibold block mb-1">Recommended Action:</span>
                            {suggestion}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        
                        {/* YOLO Toggle */}
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsYolo(!isYolo)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${isYolo ? 'bg-amber-500' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform transition duration-200 ease-in-out bg-white rounded-full shadow translate-x-1 mt-1 ${isYolo ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold flex items-center gap-1 ${isYolo ? 'text-amber-600' : 'text-gray-500'}`}>
                                    YOLO Mode <Zap size={14} fill={isYolo ? "currentColor" : "none"} />
                                </span>
                                <span className="text-[10px] text-gray-400">Auto-approve future TNP redraws</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 text-gray-600 font-semibold text-sm hover:bg-gray-50 rounded-lg transition-colors">
                                Cancel Order
                            </button>
                            <button 
                                onClick={handleApprove}
                                className="px-6 py-2 bg-[#0F4C81] hover:bg-[#09355E] text-white font-bold text-sm rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                            >
                                <RefreshCcw size={16} /> Approve Redraw
                            </button>
                        </div>
                    </div>
                </div>
                {isYolo && (
                    <div className="px-6 py-2 bg-amber-500 text-white text-[10px] font-bold text-center tracking-wide uppercase animate-in slide-in-from-bottom-2">
                        AI Autonomy Enabled for this Workflow
                    </div>
                )}
            </div>
        </div>
    );
};

const WorkflowProgressBar: React.FC<{ status: 'on-track' | 'exception' | 'completed' }> = ({ status }) => {
    const steps = [
        { label: 'Order Placed', state: 'completed', shortLabel: 'Order' },
        { label: 'Kit Shipped', state: 'completed', shortLabel: 'Shipped' },
        { label: 'Sample Received', state: 'completed', shortLabel: 'Received' },
        { label: 'Lab Processing', state: status === 'completed' ? 'completed' : (status === 'exception' ? 'error' : 'active'), shortLabel: 'Processing' },
        { label: 'Results Ready', state: status === 'completed' ? 'completed' : 'pending', shortLabel: 'Results' }
    ];

    // Calculate progress: 3 steps are always completed (60%)
    const getProgressConfig = () => {
        if (status === 'completed') return { width: '100%', color: 'bg-emerald-500' };
        if (status === 'exception') return { width: '60%', color: 'bg-emerald-500' };
        return { width: '60%', color: 'bg-emerald-500' }; // on-track
    };

    const progressConfig = getProgressConfig();

    return (
        <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="relative">
                {/* Progress bar background */}
                <div className="absolute top-4 left-0 right-0 h-1.5 bg-gray-100 rounded-full"></div>
                {/* Progress bar fill */}
                <div
                    className={`absolute top-4 left-0 h-1.5 rounded-full transition-all duration-700 ease-out ${progressConfig.color}`}
                    style={{ width: progressConfig.width }}
                ></div>

                {/* Step indicators */}
                <div className="flex justify-between relative z-10">
                    {steps.map((step, i) => {
                         let icon = <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />;
                         let circleClasses = "w-9 h-9 rounded-full flex items-center justify-center border-2.5 transition-all duration-500 bg-white border-gray-200";
                         let labelClasses = "text-[11px] font-medium mt-2.5 transition-colors duration-500 text-gray-400";

                         if (step.state === 'completed') {
                             circleClasses = "w-9 h-9 rounded-full flex items-center justify-center border-2.5 transition-all duration-500 bg-emerald-500 border-emerald-500 text-white shadow-sm";
                             icon = <Check size={16} strokeWidth={2.5} />;
                             labelClasses = "text-[11px] font-medium mt-2.5 transition-colors duration-500 text-emerald-600";
                         } else if (step.state === 'active') {
                             circleClasses = "w-9 h-9 rounded-full flex items-center justify-center border-2.5 transition-all duration-500 bg-white border-blue-500 text-blue-500 ring-3 ring-blue-100";
                             icon = <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />;
                             labelClasses = "text-[11px] font-medium mt-2.5 transition-colors duration-500 text-blue-600 font-semibold";
                         } else if (step.state === 'error') {
                             circleClasses = "w-9 h-9 rounded-full flex items-center justify-center border-2.5 transition-all duration-500 bg-red-500 border-red-500 text-white shadow-sm";
                             icon = <X size={16} strokeWidth={2.5} />;
                             labelClasses = "text-[11px] font-medium mt-2.5 transition-colors duration-500 text-red-600 font-semibold";
                         }

                         return (
                             <div key={i} className="flex flex-col items-center">
                                 <div className={circleClasses}>
                                     {icon}
                                 </div>
                                 <span className={labelClasses}>{step.shortLabel}</span>
                             </div>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

const SystemEventCard: React.FC<SystemEventCardProps> = ({ icon: Icon, title, status, date, variant = 'neutral', details, actionLabel }) => { const styles = { neutral: { bg: 'bg-white', border: 'border-gray-200', iconBg: 'bg-gray-100', iconColor: 'text-gray-500', title: 'text-gray-900', text: 'text-gray-600' }, success: { bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', title: 'text-emerald-900', text: 'text-emerald-700' }, info: { bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', title: 'text-blue-900', text: 'text-blue-700' }, warning: { bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', title: 'text-amber-900', text: 'text-amber-700' }, error: { bg: 'bg-red-50', border: 'border-red-100', iconBg: 'bg-red-100', iconColor: 'text-red-600', title: 'text-red-900', text: 'text-red-700' }, }; const s = styles[variant] || styles.neutral; return (<div className="flex justify-center w-full"><div className={`rounded-xl p-4 border max-w-2xl w-full flex items-start gap-4 shadow-sm transition-all ${s.bg} ${s.border}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.iconBg} ${s.iconColor}`}><Icon size={20} /></div><div className="flex-1 min-w-0"><div className="flex justify-between items-start"><h4 className={`font-bold text-sm ${s.title}`}>{title}</h4><span className={`text-[10px] opacity-70 ml-2 whitespace-nowrap ${s.text}`}>{date}</span></div>{details && <p className={`text-xs mt-1 leading-relaxed ${s.text}`}>{details}</p>}{actionLabel && (<button className="mt-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1">{actionLabel} <ArrowRight size={12} /></button>)}</div></div></div>); };

const TabButton = React.forwardRef<HTMLButtonElement, { label: string, icon: any, active?: boolean, onClick?: () => void, isDropdown?: boolean }>(({ label, icon: Icon, active, onClick, isDropdown }, ref) => (<button ref={ref} onClick={onClick} className={`flex items-center gap-2 py-3 text-sm font-bold transition-all relative rounded-t-lg ${active ? 'text-[#0F4C81] px-10 bg-slate-50 border-b-2 border-[#0F4C81]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-6'}`}><Icon size={16} className={active ? "text-[#0F4C81]" : "text-gray-400"} /> {label}{isDropdown && (<ChevronDown size={12} className={`transition-transform duration-200 ${active ? 'rotate-180 text-[#0F4C81]' : 'text-gray-400'}`} />)}</button>));

const MenuOption = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (<button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all text-left animate-in slide-in-from-bottom-1 fade-in duration-200"><Icon size={16} className="text-gray-500" />{label}</button>);

const ToolbarIcon = ({ icon: Icon }: { icon: any }) => (<button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Icon size={18} /></button>);

const PinIcon = ({ onClick }: { onClick?: () => void }) => (<button onClick={(e) => { if (onClick) { e.stopPropagation(); onClick(); } }} className={`absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center z-10 transform rotate-12 transition-transform ${onClick ? 'hover:scale-110 cursor-pointer hover:border-red-200' : 'cursor-default'}`}><Pin size={12} className="text-red-500 fill-red-500" /></button>);

const PinnedCardRenderer: React.FC<{ item: PinnedItem; onUnpin: () => void }> = ({ item, onUnpin }) => {
    let Icon = Activity;
    if (item.type === 'medication') Icon = Pill;
    if (item.type === 'demographics') Icon = Calendar;
    if (item.type === 'contact') Icon = Phone;
    if (item.type === 'financial') Icon = CreditCard;
    if (item.type === 'allergy') Icon = ShieldAlert;
    if (item.type === 'note') Icon = Notebook;
    if (item.type === 'document') Icon = FileText;
    if (item.type === 'calendar') Icon = Clock;
    if (item.type === 'billing') Icon = DollarSign;
    if (item.type === 'tags') Icon = Tag;
    if (item.type === 'program') Icon = Target;

    return (
        <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
           <PinIcon onClick={onUnpin} />
           <div className="flex items-start gap-3">
              <div className="pt-0.5"><Icon size={16} className="text-gray-500" /></div>
              <div className="min-w-0 flex-1">
                 <div className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase">{item.title}:</div>
                 {item.type === 'medication' && (<div className="space-y-1">{item.data.items.map((m: string, i: number) => (<div key={i} className="text-sm font-bold text-gray-900 leading-tight">{m}</div>))}</div>)}
                 {item.type === 'demographics' && (<div className="space-y-1 mt-1"><div className="flex items-center gap-2 text-xs text-gray-700 font-medium">{item.data.dob} ({item.data.age} yrs)</div><div className="flex items-center gap-2 text-xs text-gray-700 font-medium">{item.data.gender}</div></div>)}
                 {item.type === 'contact' && (<div className="space-y-1 mt-1"><div className="text-xs text-gray-700 font-bold">{item.data.phone}</div><div className="text-xs text-gray-500 truncate">{item.data.email}</div></div>)}
                 {item.type === 'financial' && (<div className="space-y-1 mt-1"><div className="text-xs text-gray-700">Bill: <span className="font-bold">{item.data.card}</span></div><div className="text-xs text-gray-700">Ship: <span className="font-bold">{item.data.shipping}</span></div></div>)}
                 {item.type === 'allergy' && (<div className="space-y-1 mt-1">{item.data.items.map((a: any, i: number) => (<div key={i} className="flex gap-1 text-xs"><span className="font-bold text-gray-900">{a.name}</span><span className={`px-1 py-0.5 rounded text-[9px] font-bold ${a.severity === 'Severe' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.severity}</span></div>))}</div>)}
                 {item.type === 'note' && (<div className="mt-1"><div className="text-xs text-gray-500 mb-1">{item.data.date}</div><p className="text-xs text-gray-700 italic line-clamp-2 leading-relaxed">"{item.data.preview}"</p></div>)}
                 {item.type === 'document' && (<div className="mt-1 space-y-0.5"><div className="text-sm font-bold text-gray-900">{item.data.count} Files</div>{item.data.types.slice(0, 2).map((t: string, i: number) => (<div key={i} className="text-[10px] text-gray-500">{t}</div>))}</div>)}
                 {item.type === 'calendar' && (<div className="mt-1"><div className="text-sm font-bold text-gray-900">{item.data.event}</div><div className="text-xs text-gray-500 mt-0.5">{item.data.date}</div></div>)}
                 {item.type === 'billing' && (<div className="mt-1">{item.data.amount && <div className="text-lg font-bold text-gray-900">{item.data.amount}</div>}{item.data.invoice && <div className="text-sm font-bold text-gray-900">{item.data.invoice}</div>}<div className="text-[10px] text-red-500 font-bold mt-0.5">{item.data.status || 'Due Now'}</div></div>)}
                 {item.type === 'tags' && (<div className="mt-1 flex flex-wrap gap-1">{item.data.tags?.slice(0, 5).map((tag: string, i: number) => (<span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[9px] font-bold">{tag}</span>))}{(item.data.tags?.length || 0) > 5 && (<span className="text-[9px] text-gray-400 font-medium">+{item.data.tags.length - 5}</span>)}</div>)}
                 {item.type === 'program' && (<div className="mt-1 space-y-1.5"><div className="text-sm font-bold text-gray-900 leading-tight">{item.data.name}</div><div className="text-[10px] text-gray-500">{item.data.subtitle}</div><div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-gradient-to-r from-[#0F4C81] to-blue-500 rounded-full" style={{ width: `${item.data.progress}%` }}></div></div><div className="flex justify-between items-center"><span className="text-[9px] text-gray-400">{item.data.progress}% complete</span><TrendingUp size={10} className="text-emerald-500" /></div></div>)}
              </div>
           </div>
        </div>
    );
};

// --- Mock Data ---

const PATIENTS: Patient[] = [
  { 
    id: '3', 
    name: 'Kevin Johnson', 
    initials: 'KJ', 
    time: 'Just now', 
    snippet: 'Action Required: Lab sample exception',
    unreadCount: 1,
    gender: 'Male',
    dob: 'Aug-10-1982',
    age: 42,
    workflowStatus: 'exception',
    tags: ['VIP', 'High Risk', 'Returning']
  },
  { 
    id: '1', 
    name: 'Amanda Lee', 
    initials: 'AL', 
    time: '2 hours ago', 
    snippet: 'Results reviewed. Protocol updated.',
    gender: 'Female',
    dob: 'Jun-21-1985',
    age: 39,
    workflowStatus: 'completed',
    tags: ['New Patient', 'Thyroid']
  },
  { 
    id: '2', 
    name: 'Jessica Patel', 
    initials: 'JP', 
    time: 'Yesterday', 
    snippet: 'Can we reschedule the appointment?',
    unreadCount: 0,
    gender: 'Female',
    dob: 'Apr-12-1990',
    age: 34,
    workflowStatus: 'on-track',
    tags: ['Telehealth', 'Busy Professional']
  },
  {
    id: '4',
    name: 'Michael Chen',
    initials: 'MC',
    time: 'Yesterday',
    snippet: 'Questionnaire completed.',
    gender: 'Male',
    dob: 'Mar-15-1978',
    age: 46,
    workflowStatus: 'on-track',
    tags: ['Weight Management']
  },
  {
    id: '5',
    name: 'Sarah Connor',
    initials: 'SC',
    time: '2 days ago',
    snippet: 'Kit delivered to patient.',
    gender: 'Female',
    dob: 'Nov-29-1984',
    age: 40,
    workflowStatus: 'on-track',
    tags: ['Prenatal', 'Supplements']
  },
  {
    id: '6',
    name: 'Robert Davis',
    initials: 'RD',
    time: '3 days ago',
    snippet: 'Waiting for lab results.',
    gender: 'Male',
    dob: 'Jan-05-1965',
    age: 59,
    workflowStatus: 'on-track',
    tags: ['Cardiac History']
  },
  {
    id: '7',
    name: 'Emily Wilson',
    initials: 'EW',
    time: '3 days ago',
    snippet: 'Insurance verification failed.',
    gender: 'Female',
    dob: 'Jul-22-1992',
    age: 32,
    workflowStatus: 'exception',
    tags: ['Insurance Issue']
  },
  {
    id: '8',
    name: 'David Miller',
    initials: 'DM',
    time: '4 days ago',
    snippet: 'New patient onboarding started.',
    gender: 'Male',
    dob: 'Sep-10-1988',
    age: 36,
    workflowStatus: 'on-track',
    tags: ['Onboarding']
  },
  {
    id: '9',
    name: 'Jennifer Garcia',
    initials: 'JG',
    time: '5 days ago',
    snippet: 'Follow-up scheduled.',
    gender: 'Female',
    dob: 'May-03-1975',
    age: 49,
    workflowStatus: 'completed',
    tags: ['Menopause', 'Hormone Panel']
  },
  {
    id: '10',
    name: 'James Martinez',
    initials: 'JM',
    time: '1 week ago',
    snippet: 'Payment processed successfully.',
    gender: 'Male',
    dob: 'Dec-12-1980',
    age: 44,
    workflowStatus: 'completed',
    tags: ['Wellness']
  },
  {
    id: '11',
    name: 'Linda Rodriguez',
    initials: 'LR',
    time: '1 week ago',
    snippet: 'Lab sample received.',
    gender: 'Female',
    dob: 'Feb-28-1970',
    age: 54,
    workflowStatus: 'on-track',
    tags: ['Diabetes T2']
  },
  {
    id: '12',
    name: 'William Anderson',
    initials: 'WA',
    time: '2 weeks ago',
    snippet: 'Action Required: Missing intake form',
    gender: 'Male',
    dob: 'Oct-08-1955',
    age: 69,
    workflowStatus: 'exception',
    tags: ['Geriatric', 'Missing Forms']
  },
  {
    id: '13',
    name: 'Elizabeth Thomas',
    initials: 'ET',
    time: '2 weeks ago',
    snippet: 'Protocol completed.',
    gender: 'Female',
    dob: 'Aug-14-1983',
    age: 41,
    workflowStatus: 'completed',
    tags: ['Fertility']
  },
];

const MOCK_DETAILS: Record<string, any> = {
    '3': {
        contact: { phone: '+1 123-456-7890', email: 'skaufman@outlook.com', address: '911 Schoolhouse Dr. Nanuet, NY' },
        financial: { billing: 'As Default', card: '***1111', shipping: 'Ship to Patient' },
        medications: ['Lisinopril 10mg - Daily', 'Metformin 500mg - BID'],
        allergies: [{name: 'Penicillin', severity: 'Severe'}, {name: 'Sulfa', severity: 'Moderate'}],
        notes: { date: 'Feb-01-2026', preview: 'The patient passed by and came in to say hi, patient mentioned feeling much better after the new protocol.' },
        docs: { count: 11, types: ['3 Medical Reports', '4 Encounter Notes'] },
        upcoming: { event: 'Follow-up Consultation', date: 'Feb 27, 2026 at 2:00 PM' },
        past: { event: 'Initial Consultation', date: 'Jan 15, 2026' },
        billing: { balance: '$150.00', date: 'Feb 10', invoice: 'INV-2026-003', status: 'Due Now' },
        pinned: ['med-active', 'basics-demo', 'med-tags'],
        program: {
            name: 'Signature Program - Body Sculpt 90',
            subtitle: '12-Week Lifestyle Reset',
            joinedDate: 'Jan-01-2026',
            progress: 66,
            nextCheckIn: 'Feb-20-2026',
            paymentPlan: 'Paid in Full',
            phases: [
                { name: 'Baseline Testing', touchpoints: 5, dateRange: 'Jan 1-7', status: 'completed' },
                { name: 'Results Debrief', touchpoints: 3, dateRange: 'Jan 15-18', status: 'completed' },
                { name: 'Training Sprint', touchpoints: 8, dateRange: 'Jan 22 - Feb 13', status: 'in-progress' },
                { name: 'Supplement Fulfillment', touchpoints: 4, dateRange: 'Feb 14-26', status: 'pending' }
            ]
        }
    },
    '1': {
        contact: { phone: '(555) 123-4567', email: 'amanda.lee@example.com', address: '42 Pine St, Austin, TX' },
        financial: { billing: 'Insurance', card: '***4421', shipping: 'Home' },
        medications: ['Levothyroxine 50mcg'],
        allergies: [{ name: 'Peanuts', severity: 'Mild' }],
        notes: { date: 'Feb 10, 2026', preview: 'Review of systems negative. Patient reports feeling energetic. TSH levels normalized.' },
        docs: { count: 5, types: ['Lab Report', 'Consent Form'] },
        upcoming: null,
        past: { event: 'Results Review', date: 'Feb 12, 2026' },
        billing: { balance: '$0.00', date: 'Feb 12', invoice: 'INV-2026-001', status: 'Paid' },
        pinned: ['basics-demo', 'med-docs', 'cal-past'],
        program: null
    },
    '2': {
        contact: { phone: '(555) 987-6543', email: 'jess.patel@example.com', address: '88 Oak Ave, Dallas, TX' },
        financial: { billing: 'Self-Pay', card: '***9988', shipping: 'Office' },
        medications: [],
        allergies: [],
        notes: { date: 'Feb 14, 2026', preview: 'Requesting reschedule due to work conflict. Patient has limited availability.' },
        docs: { count: 2, types: ['Intake Form'] },
        upcoming: { event: 'Physical Exam', date: 'Feb 25, 2026 at 9:00 AM' },
        past: { event: 'Intro Call', date: 'Feb 01, 2026' },
        billing: { balance: '$50.00', date: 'Feb 01', invoice: 'INV-2026-009', status: 'Unpaid' },
        pinned: ['cal-upcoming', 'basics-contact'],
        program: null
    }
};

const getPatientDetails = (id: string, patient: Patient) => {
    if (MOCK_DETAILS[id]) return MOCK_DETAILS[id];
    return {
        contact: { phone: `(555) 000-00${id.padStart(2,'0')}`, email: `patient${id}@example.com`, address: `${id} Main St, Springfield` },
        financial: { billing: 'Default', card: `***${1000 + parseInt(id)}`, shipping: 'Home' },
        medications: [],
        allergies: [],
        notes: { date: 'Jan 20, 2026', preview: 'Routine check-up. No major complaints reported.' },
        docs: { count: 1, types: ['Intake Form'] },
        upcoming: null,
        past: { event: 'Initial Visit', date: 'Jan 05, 2026' },
        billing: { balance: '$0.00', date: 'Jan 05', invoice: `INV-2026-0${id}`, status: 'Paid' },
        pinned: ['basics-demo', 'med-tags']
    };
};

export const PatientsView: React.FC = () => {
  const [activePatientId, setActivePatientId] = useState('3');
  const [chatInput, setChatInput] = useState('');
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'encounter_note' | 'notifications'>('dashboard');
  const [activeTab, setActiveTab] = useState<'basics' | 'health' | 'calendar' | 'billing' | null>(null);
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Right Sidebar State
  const [pegBoardTab, setPegBoardTab] = useState<'cards' | 'ai'>('cards');
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; text: React.ReactNode }[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: string[] }>({
      basics: ['basics-demo', 'basics-contact', 'basics-financial'],
      health: ['med-program', 'med-tags', 'med-active', 'med-allergies', 'med-notes', 'med-docs'],
      calendar: ['cal-upcoming', 'cal-past'],
      billing: ['bill-balance', 'bill-invoices']
  });

  const [selectedChannel, setSelectedChannel] = useState<'portal' | 'email' | 'sms'>('portal');
  const [isChannelMenuOpen, setIsChannelMenuOpen] = useState(false);

  const channelConfig = {
      portal: { label: 'Portal Chat', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
      email: { label: 'Email', icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
      sms: { label: 'SMS', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
  };

  const CurrentChannelIcon = channelConfig[selectedChannel].icon;

  const centerContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [panelLeft, setPanelLeft] = useState(24);

  const dragTabCard = useRef<number>(0);
  const dragOverTabCard = useRef<number>(0);

  const activePatient = PATIENTS.find(p => p.id === activePatientId) || PATIENTS[0];
  const patientDetails = getPatientDetails(activePatientId, activePatient);

  useEffect(() => {
      // Reset AI chat when patient changes
      setAiChatHistory([]);
      setPegBoardTab('cards');

      const newPinned: PinnedItem[] = [];
      const pinnedKeys = patientDetails.pinned || [];

      pinnedKeys.forEach((key: string) => {
          if (key === 'basics-demo') newPinned.push({ id: 'basics-demo', type: 'demographics', title: 'Demographics', iconName: 'User', data: { dob: activePatient.dob, age: activePatient.age, gender: activePatient.gender } });
          else if (key === 'basics-contact') newPinned.push({ id: 'basics-contact', type: 'contact', title: 'Contact Info', iconName: 'Phone', data: patientDetails.contact });
          else if (key === 'basics-financial') newPinned.push({ id: 'basics-financial', type: 'financial', title: 'Financial', iconName: 'CreditCard', data: patientDetails.financial });
          else if (key === 'med-active' && patientDetails.medications?.length > 0) newPinned.push({ id: 'med-active', type: 'medication', title: 'Active Medication', iconName: 'Pill', data: { items: patientDetails.medications } });
          else if (key === 'med-allergies' && patientDetails.allergies?.length > 0) newPinned.push({ id: 'med-allergies', type: 'allergy', title: 'Allergies', iconName: 'ShieldAlert', data: { items: patientDetails.allergies } });
          else if (key === 'med-notes' && patientDetails.notes) newPinned.push({ id: 'med-notes', type: 'note', title: 'Encounter Note', iconName: 'Notebook', data: patientDetails.notes });
          else if (key === 'med-docs') newPinned.push({ id: 'med-docs', type: 'document', title: 'Documents', iconName: 'FileText', data: patientDetails.docs });
          else if (key === 'cal-upcoming' && patientDetails.upcoming) newPinned.push({ id: 'cal-upcoming', type: 'calendar', title: 'Upcoming', iconName: 'Clock', data: patientDetails.upcoming });
          else if (key === 'cal-past' && patientDetails.past) newPinned.push({ id: 'cal-past', type: 'calendar', title: 'Past Events', iconName: 'CheckCircle2', data: patientDetails.past });
          else if (key === 'bill-balance' && patientDetails.billing) newPinned.push({ id: 'bill-balance', type: 'billing', title: 'Outstanding Balance', iconName: 'DollarSign', data: { amount: patientDetails.billing.balance, date: patientDetails.billing.date, status: patientDetails.billing.status } });
          else if (key === 'med-tags' && activePatient.tags && activePatient.tags.length > 0) newPinned.push({ id: 'med-tags', type: 'tags', title: 'Patient Tags', iconName: 'Tag', data: { tags: activePatient.tags } });
          else if (key === 'med-program' && patientDetails.program) newPinned.push({ id: 'med-program', type: 'program', title: 'Program Progress', iconName: 'Target', data: patientDetails.program });
      });

      setPinnedItems(newPinned);
  }, [activePatientId]);

  const togglePin = (item: PinnedItem) => {
      setPinnedItems(prev => {
          const exists = prev.find(i => i.id === item.id);
          if (exists) {
              return prev.filter(i => i.id !== item.id);
          }
          return [...prev, item];
      });
  };

  const isPinned = (id: string) => pinnedItems.some(i => i.id === id);

  const handleOpenEncounterNote = () => {
    setViewMode('encounter_note');
    setIsActionMenuOpen(false);
  };

  const handleTabToggle = (tab: 'basics' | 'health' | 'calendar' | 'billing') => {
      if (activeTab === tab) {
          setActiveTab(null);
      } else {
          setActiveTab(tab);
          if (tabRefs.current[tab] && centerContainerRef.current) {
              const btnRect = tabRefs.current[tab]!.getBoundingClientRect();
              const containerRect = centerContainerRef.current.getBoundingClientRect();
              setPanelLeft(btnRect.left - containerRect.left);
          }
      }
  };

  const handleTabDragStart = (e: React.DragEvent, index: number) => {
      dragTabCard.current = index;
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDragEnter = (e: React.DragEvent, index: number) => {
      if (!activeTab) return;
      const currentList = tabLayouts[activeTab];
      if (!currentList) return;
      dragOverTabCard.current = index;
      if (dragTabCard.current === index) return;
      const newList = [...currentList];
      const draggedItem = newList[dragTabCard.current];
      newList.splice(dragTabCard.current, 1);
      newList.splice(dragOverTabCard.current, 0, draggedItem);
      dragTabCard.current = index;
      setTabLayouts(prev => ({ ...prev, [activeTab]: newList }));
  };

  const handleTabDragEnd = (e: React.DragEvent) => {
      dragTabCard.current = 0;
      dragOverTabCard.current = 0;
  };

  // --- AI Diff Logic ---

  // Interactive diff view component with structured content
  const AiDiffCard: React.FC<{ original?: string, modified: string, onAccept: () => void, onReject?: () => void, onModify?: () => void }> = ({ original, modified, onAccept, onReject, onModify }) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // Icon component helper that safely handles undefined icons
    const getIconForSection = (title: string) => {
      const upperTitle = title.toUpperCase();
      if (upperTitle.includes('PATIENT')) return User;
      if (upperTitle.includes('TEST') || upperTitle.includes('LAB')) return FlaskConical;
      if (upperTitle.includes('SPECIMEN')) return Package;
      if (upperTitle.includes('DIAGNOSIS') || upperTitle.includes('INDICATION')) return Stethoscope;
      if (upperTitle.includes('BILLING')) return DollarSign;
      if (upperTitle.includes('FOLLOW')) return Calendar;
      if (upperTitle.includes('PLAN')) return ClipboardCheck;
      if (upperTitle.includes('CHIEF') || upperTitle.includes('COMPLAINT')) return Activity;
      if (upperTitle.includes('VITALS')) return Activity;
      if (upperTitle.includes('ASSESSMENT')) return FileText;
      if (upperTitle.includes('HISTORY')) return Notebook;
      if (upperTitle.includes('DATE') || upperTitle.includes('SERVICE')) return Clock;
      return FileText; // Default fallback
    };

    // Parse content into structured sections
    const parseContent = (text: string) => {
      const sections: { title: string; items: string[]; icon?: any }[] = [];
      const lines = text.split('\n');
      let currentSection: { title: string; items: string[]; icon?: any } | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if this is a section header (ends with colon and not a bullet)
        if (trimmed.endsWith(':') && !trimmed.startsWith('•')) {
          if (currentSection) {
            sections.push(currentSection);
          }
          const sectionTitle = trimmed.replace(':', '');
          currentSection = {
            title: sectionTitle,
            items: [],
            icon: getIconForSection(sectionTitle)
          };
        } else if (trimmed.startsWith('•') || /^\d+\./.test(trimmed)) {
          const itemText = trimmed.replace(/^[•\d+\.]\s*/, '');
          if (currentSection) {
            currentSection.items.push(itemText);
          }
        } else if (currentSection) {
          // Add non-bullet lines to current section
          currentSection.items.push(trimmed);
        } else {
          // Create default section for content before first header
          currentSection = { title: 'Details', items: [trimmed], icon: FileText };
        }
      }
      if (currentSection) {
        sections.push(currentSection);
      }
      return sections;
    };

    const sections = parseContent(modified);

    return (
      <div className="mt-3 border border-slate-200 rounded-2xl bg-white overflow-hidden w-full shadow-lg shadow-slate-200/50">
        {/* Header with status indicator */}
        <div className="bg-gradient-to-r from-[#0F4C81] to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles size={16} className="text-white animate-pulse" />
                </div>
                <div>
                    <span className="text-[12px] font-bold text-white block">Proposed Action</span>
                    <span className="text-[9px] text-blue-100">AI Generated - Ready for Review</span>
                </div>
            </div>
            <button
                onClick={() => setExpandedSection(expandedSection === 'all' ? null : 'all')}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
                {expandedSection === 'all' ? <ChevronUp size={16} className="text-white" /> : <ChevronDown size={16} className="text-white" />}
            </button>
        </div>

        {/* Interactive sections */}
        <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {sections.map((section, idx) => {
                const Icon = section.icon;
                const isExpanded = expandedSection === `section-${idx}` || expandedSection === 'all';
                const sectionId = `section-${idx}`;

                return (
                    <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={() => setExpandedSection(isExpanded ? null : sectionId)}
                            className="w-full px-3 py-2.5 bg-gradient-to-r from-slate-50 to-white hover:from-blue-50 hover:to-white flex items-center justify-between transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <Icon size={12} className="text-blue-600" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-700">{section.title}</span>
                                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-bold rounded-full">{section.items.length}</span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isExpanded && (
                            <div className="px-3 py-2.5 bg-white border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
                                {section.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-start gap-2 py-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                        <span className="text-[11px] text-slate-600 leading-snug">{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Action Buttons - Fixed padding and spacing */}
        <div className="p-3 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
            <div className="flex gap-2 mb-2">
                <button onClick={onReject} className="flex-1 py-2.5 px-3 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl flex items-center justify-center gap-2 group shadow-sm">
                    <div className="p-1 bg-slate-100 group-hover:bg-red-100 rounded-md transition-colors">
                        <X size={12} />
                    </div>
                    Discard
                </button>
                <button onClick={onModify} className="flex-1 py-2.5 px-3 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl flex items-center justify-center gap-2 group shadow-sm">
                    <div className="p-1 bg-slate-100 group-hover:bg-blue-100 rounded-md transition-colors">
                        <FileText size={12} />
                    </div>
                    Edit
                </button>
            </div>
            <button onClick={onAccept} className="w-full py-3 px-3 text-[11px] font-bold text-white bg-gradient-to-r from-[#0F4C81] to-blue-600 hover:from-[#09355E] hover:to-blue-700 transition-all rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20">
                <div className="p-1 bg-white/20 rounded-md">
                    <Check size={12} />
                </div>
                Approve
            </button>
        </div>
      </div>
    );
  };

  const handleAiAction = (action: 'accept' | 'reject' | 'modify') => {
      // Demo logic: Show appropriate response
      if (action === 'accept') {
          setAiChatHistory(prev => [...prev, {
              role: 'assistant',
              text: (
                  <div className="flex items-center gap-2 text-emerald-700">
                      <div className="p-1.5 bg-emerald-100 rounded-full">
                          <Check size={14} />
                      </div>
                      <span>
                          <span className="font-bold">Draft accepted!</span> Saved to Encounter Notes.
                      </span>
                  </div>
              )
          }]);
      } else if (action === 'reject') {
          setAiChatHistory(prev => [...prev, {
              role: 'assistant',
              text: (
                  <div className="flex items-center gap-2 text-slate-500">
                      <div className="p-1.5 bg-slate-100 rounded-full">
                          <X size={14} />
                      </div>
                      <span>Draft discarded. Let me know if you'd like me to try again.</span>
                  </div>
              )
          }]);
      } else {
          setAiChatHistory(prev => [...prev, {
              role: 'assistant',
              text: (
                  <div className="flex items-center gap-2 text-blue-700">
                      <FileText size={14} />
                      <span>Opening editor for modification...</span>
                  </div>
              )
          }]);
      }
  };

  const handleAiMessage = (msg: string) => {
    // Safety check: ensure msg is a valid string
    const safeMsg = msg || '';
    setAiChatHistory(prev => [...prev, { role: 'user', text: safeMsg }]);
    setIsAiProcessing(true);

    // DEMO TRIGGER: Enhanced demo scenarios
    const lowerMsg = safeMsg.toLowerCase();

    // Scenario 1: Diabetes consultation follow-up note
    const isDiabetesDemo = (lowerMsg.includes('diabetes') || lowerMsg.includes('a1c')) && (lowerMsg.includes('follow-up') || lowerMsg.includes('consultation') || lowerMsg.includes('note'));

    // Scenario 2: Send message/follow-up
    const isFollowUpMsg = (lowerMsg.includes('send') || lowerMsg.includes('message')) && (lowerMsg.includes('follow-up') || lowerMsg.includes('patient'));

    // Scenario 3: Summarize visit
    const isSummarizeDemo = lowerMsg.includes('summarize') || (lowerMsg.includes('summary') && lowerMsg.includes('visit'));

    // Scenario 4: Order lab test
    const isOrderLabDemo = (lowerMsg.includes('order') && (lowerMsg.includes('lab') || lowerMsg.includes('test') || lowerMsg.includes('gut')));

    setTimeout(() => {
        setIsAiProcessing(false);

        if (isOrderLabDemo) {
            const labOrder = `LAB ORDER REQUEST
Patient: ${activePatient?.name || 'Patient'}
DOB: ${activePatient?.dob || 'N/A'}
Ordering Provider: Dr. Johnson

Test Details:
• Test: Gut Zoomer 3.0
• CPT Code: 87491
• ICD-10: R19.8 (Other specified symptoms and signs involving the digestive system)

Specimen: Stool
Collection Method: At-home kit
Fasting Required: No
Special Instructions: Ship within 24 hours of collection

Diagnosis/Indication:
Patient presents with gastrointestinal symptoms including bloating and irregular bowel habits. Comprehensive gut microbiome analysis recommended.

Billing:
• Test Cost: $399.00
• Insurance: Will be billed to patient's insurance on file
• Patient Responsibility: Per insurance benefits

Follow-up:
Results expected in 10-14 business days. Schedule follow-up telehealth visit to review results.`;

            const diffContent = (
                <AiDiffCard
                   modified={labOrder}
                   onAccept={() => handleAiAction('accept')}
                   onReject={() => handleAiAction('reject')}
                   onModify={() => handleAiAction('modify')}
                />
            );

            setAiChatHistory(prev => [...prev, {
                role: 'assistant',
                text: (
                   <div>
                       <span className="font-medium text-blue-800">I've prepared the Gut Zoomer 3.0 lab order for your review:</span>
                       {diffContent}
                   </div>
                )
            }]);

        } else if (isDiabetesDemo) {
            const draftedNote = `Subject: Diabetes Consultation - Follow-Up Visit

Date of Service: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Chief Complaint:
Routine diabetes management follow-up.

History of Present Illness:
Patient presents for 3-month diabetes follow-up. Reports good adherence to medication regimen and dietary recommendations. No hypoglycemic episodes reported.

Vitals:
BP: 120/80 mmHg
HR: 72 bpm
Weight: 185 lbs (↓3 lbs from last visit)
BMI: 26.4

Lab Results:
• A1C: 7.2% (↓ from 7.8% - Excellent progress!)
• Fasting Glucose: 105 mg/dL (Normal)
• Lipid Panel: TC 185, LDL 98, HDL 52, TG 128

Assessment:
Type 2 Diabetes Mellitus - Well controlled
Showing excellent improvement in glycemic control.

Plan:
1. Continue Metformin 1000mg BID
2. Maintain current diabetic diet
3. Continue home glucose monitoring 2x weekly
4. Dietary counseling referral sent
5. Follow-up in 3 months with repeat A1C
6. Patient encouraged to continue weight loss efforts

Follow-up: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

            const diffContent = (
                <AiDiffCard
                   modified={draftedNote}
                   onAccept={() => handleAiAction('accept')}
                   onReject={() => handleAiAction('reject')}
                   onModify={() => handleAiAction('modify')}
                />
            );

            setAiChatHistory(prev => [...prev, {
                role: 'assistant',
                text: (
                   <div>
                       <span className="font-medium text-blue-800">I've drafted a comprehensive encounter note based on today's consultation. Please review:</span>
                       {diffContent}
                   </div>
                )
            }]);
        } else if (isFollowUpMsg) {
            const patientMessage = `Subject: Following Up on Your Recent Visit

Dear ${activePatient?.name?.split(' ')[0] || 'Patient'},

Thank you for visiting Vibrant Wellness Center today. I wanted to follow up on our discussion about your care plan.

Key Takeaways:
• Your A1C has improved to 7.2% - great progress!
• Continue with your current medication
• Schedule lab work in 3 months

If you have any questions between visits, don't hesitate to reach out through the patient portal.

Best regards,
Dr. Johnson

---

📅 Action Required: Please schedule your next follow-up visit for ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} via the patient portal.`;

            const diffContent = (
                <AiDiffCard
                   modified={patientMessage}
                   onAccept={() => handleAiAction('accept')}
                   onReject={() => handleAiAction('reject')}
                   onModify={() => handleAiAction('modify')}
                />
            );

            setAiChatHistory(prev => [...prev, {
                role: 'assistant',
                text: (
                   <div>
                       <span className="font-medium text-blue-800">I've prepared a patient follow-up message. Review and send:</span>
                       {diffContent}
                   </div>
                )
            }]);
        } else if (isSummarizeDemo) {
            setAiChatHistory(prev => [...prev, {
                role: 'assistant',
                text: (
                    <div className="space-y-2">
                        <div className="font-medium text-blue-800">Visit Summary for {activePatient?.name || 'Patient'}:</div>
                        <div className="space-y-1.5 text-slate-700">
                            <div>• <span className="font-semibold">Patient:</span> {activePatient?.age ?? '-'}yo {activePatient?.gender ?? '-'}</div>
                            <div>• <span className="font-semibold">Status:</span> {activePatient?.workflowStatus === 'completed' ? 'Results Ready' : activePatient?.workflowStatus ?? 'Unknown'}</div>
                            <div>• <span className="font-semibold">Recent Activity:</span></div>
                            <div className="pl-4 space-y-1">
                                <div>– Lab results completed and reviewed</div>
                                <div>– Medications updated as needed</div>
                                <div>– Follow-up scheduled for 3 months</div>
                            </div>
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg text-blue-800 text-[11px]">
                                <span className="font-semibold">Quick Action:</span> Would you like me to draft the encounter note?
                            </div>
                        </div>
                    </div>
                )
            }]);
        } else {
            // Standard fallback response logic - use JSX to avoid newline issues
            let response: React.ReactNode = "";
            if (lowerMsg.includes('status') || lowerMsg.includes('workflow')) {
                response = (
                    <div className="space-y-2">
                        <p className="text-slate-700"><strong>Current workflow status:</strong> {activePatient?.workflowStatus?.toUpperCase() ?? 'UNKNOWN'}</p>
                        <p className="text-slate-600 text-sm">Recent activity:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>• Lab order #2026020101 processed</li>
                            <li>• Kit delivered and returned</li>
                            <li>• Sample received at lab intake</li>
                        </ul>
                    </div>
                );
            } else if (lowerMsg.includes('lab') || lowerMsg.includes('test')) {
                response = (
                    <div className="space-y-2">
                        <p className="text-slate-700"><strong>Latest Lab Results:</strong></p>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>• Gut Zoomer 3.0 - Completed</li>
                            <li>• Pending review and action</li>
                        </ul>
                        <p className="text-slate-700 mt-2">Would you like me to draft a summary of the results for the patient?</p>
                    </div>
                );
            } else if (lowerMsg.includes('schedule') || lowerMsg.includes('appointment')) {
                response = (
                    <div className="space-y-2">
                        <p className="text-slate-700">I can help schedule an appointment. Would you like me to:</p>
                        <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                            <li>Draft a message to the patient about scheduling</li>
                            <li>Check available time slots</li>
                        </ol>
                        <p className="text-slate-600 text-sm mt-2">Just let me know!</p>
                    </div>
                );
            } else {
                response = (
                    <div className="space-y-2">
                        <p className="text-slate-700">I have access to {activePatient?.name || 'this patient'}'s entire chart. I can help you:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>• Draft encounter notes</li>
                            <li>• Send patient messages</li>
                            <li>• Summarize visit history</li>
                            <li>• Review lab results</li>
                            <li>• Check workflow status</li>
                        </ul>
                        <p className="text-slate-600 text-sm mt-2">Try asking me to "draft a follow-up note" or "summarize today's visit".</p>
                    </div>
                );
            }
            setAiChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
        }
    }, 1800);
  };

  const renderCard = (cardId: string) => {
      const createPinProps = (type: any, title: string, iconName: string, data: any) => ({
          id: cardId, type, title, iconName, data
      });
      switch (cardId) {
          case 'basics-demo': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg"><User size={14} /></div><span className="text-xs font-bold text-gray-600">Demographics</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('demographics', 'Demographics', 'User', { dob: activePatient.dob, age: activePatient.age, gender: activePatient.gender }))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9 space-y-2"><div className="flex items-center gap-2 text-sm text-gray-700"><Calendar size={14} className="text-gray-400" /><span>{activePatient.dob} ({activePatient.age} yrs)</span></div><div className="flex items-center gap-2 text-sm text-gray-700"><Mars size={14} className="text-gray-400" /><span>{activePatient.gender}</span></div></div></>);
          case 'basics-contact': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-violet-50 text-violet-500 rounded-lg"><Phone size={14} /></div><span className="text-xs font-bold text-gray-600">Contact Info</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('contact', 'Contact Info', 'Phone', patientDetails.contact))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9 space-y-3"><div className="flex items-start gap-3"><Smartphone size={14} className="text-gray-400 mt-0.5" /><span className="text-sm text-gray-700">{patientDetails.contact.phone}</span></div><div className="flex items-start gap-3"><Mail size={14} className="text-gray-400 mt-0.5" /><span className="text-sm text-gray-700 break-all">{patientDetails.contact.email}</span></div><div className="flex items-start gap-3"><MapPin size={14} className="text-gray-400 mt-0.5" /><span className="text-sm text-gray-700 leading-tight">{patientDetails.contact.address}</span></div></div></>);
          case 'basics-financial': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><CreditCard size={14} /></div><span className="text-xs font-bold text-gray-600">Financial & Shipping</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('financial', 'Financial', 'CreditCard', patientDetails.financial))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9 space-y-3"><div className="flex items-start gap-2"><DollarSign size={14} className="text-gray-400 mt-0.5" /><div><span className="text-xs text-gray-400 block mb-0.5">Billing Preference:</span><div className="flex items-center gap-2"><span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">{patientDetails.financial.billing}</span><span className="text-sm text-gray-700">Card {patientDetails.financial.card}</span></div></div></div><div className="flex items-start gap-2"><Truck size={14} className="text-gray-400 mt-0.5" /><div><span className="text-xs text-gray-400 block mb-0.5">Shipping Pref:</span><span className="text-sm text-gray-700">{patientDetails.financial.shipping}</span></div></div></div></>);
          case 'med-tags': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg"><Tag size={14} /></div><span className="text-xs font-bold text-gray-600">Patient Tags</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('tags', 'Patient Tags', 'Tag', { tags: activePatient.tags }))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9"><div className="flex flex-wrap items-center gap-2">{(activePatient.tags || []).slice(0, 7).map((tag, i) => (<span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold whitespace-nowrap">{tag}</span>))}{(activePatient.tags?.length || 0) > 7 && (<span className="text-[10px] font-medium text-blue-600 whitespace-nowrap hover:underline cursor-pointer">... {(activePatient.tags?.length || 0) - 7} more</span>)}<button className="flex items-center gap-1 px-2.5 py-0.5 border border-[#0F4C81] text-[#0F4C81] rounded-full text-[10px] font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"><Plus size={10} strokeWidth={3} /> Add Tag</button></div></div></>);
          case 'med-active': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Pill size={14} /></div><span className="text-xs font-bold text-gray-600">Active Medication</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('medication', 'Active Medication', 'Pill', { items: patientDetails.medications }))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9">{patientDetails.medications.length > 0 ? (<div className="space-y-2">{patientDetails.medications.map((med: string, i: number) => (<div key={i} className="text-sm text-gray-700">{med}</div>))}</div>) : (<p className="text-xs text-gray-400 italic">No active medications.</p>)}</div></>);
          case 'med-allergies': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-cyan-50 text-cyan-500 rounded-lg"><ShieldAlert size={14} /></div><span className="text-xs font-bold text-gray-600">Allergies:</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('allergy', 'Allergies', 'ShieldAlert', { items: patientDetails.allergies }))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9 space-y-3">{patientDetails.allergies.length > 0 ? (patientDetails.allergies.map((alg: any, i: number) => (<div key={i}><div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-800">{alg.name}</span><span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${alg.severity === 'Severe' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{alg.severity}</span></div></div>))) : (<p className="text-xs text-gray-400 italic">No known allergies.</p>)}</div></>);
          case 'med-notes': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><Notebook size={14} /></div><span className="text-xs font-bold text-gray-600">Encounter Notes:</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('note', 'Encounter Note', 'Notebook', patientDetails.notes))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9">{patientDetails.notes ? (<><p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{patientDetails.notes.preview}</p><div className="text-[10px] text-gray-400 mt-2">{patientDetails.notes.date}</div></>) : (<p className="text-xs text-gray-400 italic">No recent notes.</p>)}</div></>);
          case 'med-docs': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><FileText size={14} /></div><span className="text-xs font-bold text-gray-600">All Documents:</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('document', 'Documents', 'FileText', patientDetails.docs))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9"><div className="text-sm font-medium text-gray-800 mb-1">{patientDetails.docs.count} documents in total</div><div className="text-xs text-gray-500 space-y-0.5">{patientDetails.docs.types.map((type: string, i: number) => <div key={i}>{type}</div>)}</div></div></>);
          case 'cal-upcoming': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Clock size={14} /></div><span className="text-xs font-bold text-gray-600">Upcoming</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('calendar', 'Upcoming', 'Clock', patientDetails.upcoming))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9">{patientDetails.upcoming ? (<><div className="font-bold text-gray-900 text-sm">{patientDetails.upcoming.event}</div><div className="text-xs text-gray-600 flex items-center gap-2 mt-1"><Calendar size={12} /> {patientDetails.upcoming.date}</div><div className="mt-2"><button className="px-3 py-1.5 text-[10px] border border-gray-200 rounded hover:bg-gray-50 font-medium transition-colors">Reschedule</button></div></>) : (<p className="text-xs text-gray-400 italic">No upcoming events.</p>)}</div></>);
          case 'cal-past': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-gray-200 text-gray-500 rounded-lg"><CheckCircle2 size={14} /></div><span className="text-xs font-bold text-gray-500">Past Events</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('calendar', 'Past Events', 'CheckCircle2', patientDetails.past))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9"><div className="font-bold text-gray-800 text-sm">{patientDetails.past.event}</div><div className="text-xs text-gray-500 mt-1">{patientDetails.past.date}</div><div className="text-[10px] text-green-600 font-medium mt-1 flex items-center gap-1"><CheckCheck size={10}/> Completed</div></div></>);
          case 'bill-balance': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg"><DollarSign size={14} /></div><span className="text-xs font-bold text-gray-600">Outstanding Balance</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('billing', 'Outstanding Balance', 'DollarSign', { amount: patientDetails.billing.balance, date: patientDetails.billing.date, status: patientDetails.billing.status }))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9 pb-1"><div className="text-2xl font-bold text-gray-900">{patientDetails.billing.balance}</div><div className="text-[10px] text-red-500 mt-1 font-medium mb-3">{patientDetails.billing.status || 'Payment Due'}</div><button className="w-full px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Pay Now</button></div></>);
          case 'bill-invoices': return (<><div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><div className="p-1.5 bg-slate-50 text-slate-500 rounded-lg"><Receipt size={14} /></div><span className="text-xs font-bold text-gray-600">Recent Invoices</span></div><div className="flex gap-1 items-center"><button onClick={() => togglePin(createPinProps('billing', 'Invoices', 'Receipt', { invoice: patientDetails.billing.invoice, status: patientDetails.billing.status }))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button><div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div></div></div><div className="pl-9 space-y-3"><div className="flex justify-between items-center"><div><div className="text-xs font-bold text-gray-700">{patientDetails.billing.invoice}</div><div className="text-[10px] text-gray-500">{patientDetails.billing.date}</div></div><div className="text-right"><div className="text-xs font-bold text-gray-900">{patientDetails.billing.balance}</div><span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded">{patientDetails.billing.status}</span></div></div></div></>);
          case 'med-program': return (
              patientDetails.program ? (
                  <>
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gradient-to-br from-[#0F4C81] to-blue-600 text-white rounded-lg shadow-sm">
                              <Target size={14} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">Program Progress</span>
                      </div>
                      <div className="flex gap-1 items-center">
                          <button onClick={() => togglePin(createPinProps('program', 'Program Progress', 'Target', patientDetails.program))} className={`${isPinned(cardId) ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}><Pin size={14} fill={isPinned(cardId) ? "currentColor" : "none"} /></button>
                          <div className="text-gray-400 hover:text-gray-600 cursor-move drag-handle p-1"><Move size={14} /></div>
                      </div>
                  </div>
                  <div className="pl-9 space-y-2">
                      {/* Program Header */}
                      <div className="flex items-start justify-between">
                          <div>
                              <div className="font-bold text-gray-900 text-xs">{patientDetails.program.name}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{patientDetails.program.subtitle}</div>
                          </div>
                          <div className="text-right">
                              <div className="text-lg font-bold text-[#0F4C81]">{patientDetails.program.progress}%</div>
                              <div className="text-[9px] text-gray-400 font-medium">Complete</div>
                          </div>
                      </div>

                      {/* Bar Chart - Phase Visualization */}
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-2.5 border border-gray-100/80">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-semibold text-gray-700">Phase Progress</span>
                              <span className="text-[8px] text-gray-400">Height = touchpoints</span>
                          </div>

                          {/* Bar Chart */}
                          <div className="relative h-12 w-full flex items-end justify-center gap-2 px-1">
                              {patientDetails.program.phases.map((phase: any, idx: number) => {
                                  const isCompleted = phase.status === 'completed';
                                  const isInProgress = phase.status === 'in-progress';
                                  const maxTouchpoints = 8;
                                  // Completed phases are 100% full, in-progress based on touchpoints, pending minimal
                                  const barHeight = isCompleted ? 100 : phase.status === 'pending' ? 8 : (phase.touchpoints / maxTouchpoints) * 85;

                                  // Color based on status
                                  const barColor = isCompleted ? 'bg-emerald-400' : isInProgress ? 'bg-[#0F4C81]' : 'bg-gray-300';

                                  return (
                                      <div key={idx} className="flex flex-col items-center gap-1 flex-1 max-w-12">
                                          {/* Bar container */}
                                          <div className="w-full h-9 bg-gray-100 rounded-t-md relative flex items-end overflow-hidden">
                                              {/* The bar */}
                                              <div
                                                  className={`w-full ${barColor} rounded-t-sm transition-all duration-500`}
                                                  style={{ height: `${barHeight}%` }}
                                              >
                                                  {/* Highlight effect for in-progress */}
                                                  {isInProgress && (
                                                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/50 animate-pulse"></div>
                                                  )}
                                              </div>
                                              {/* Touchpoints count inside bar */}
                                              <span className={`absolute bottom-0.5 left-0 right-0 text-center text-[7px] font-bold ${
                                                  isInProgress ? 'text-white' : isCompleted ? 'text-emerald-700' : 'text-gray-500'
                                              }`}>
                                                  {phase.touchpoints}
                                              </span>
                                          </div>
                                          {/* Phase name */}
                                          <span className={`text-[7px] font-medium text-center leading-tight ${isInProgress ? 'text-[#0F4C81] font-semibold' : isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                                              {phase.name.split(' ')[0]}
                                          </span>
                                      </div>
                                  );
                              })}
                          </div>

                          {/* Legend */}
                          <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-gray-200/60">
                              <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded bg-emerald-400"></div>
                                  <span className="text-[8px] text-gray-600 font-medium">Done</span>
                              </div>
                              <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded bg-[#0F4C81]"></div>
                                  <span className="text-[8px] text-gray-600 font-medium">Active</span>
                              </div>
                              <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded bg-gray-300"></div>
                                  <span className="text-[8px] text-gray-600 font-medium">Pending</span>
                              </div>
                          </div>
                      </div>

                      {/* Phase Details - Compact Timeline */}
                      <div className="space-y-1">
                          {patientDetails.program.phases.map((phase: any, idx: number) => {
                              const isCompleted = phase.status === 'completed';
                              const isInProgress = phase.status === 'in-progress';

                              return (
                                  <div key={idx} className="flex items-center gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-[#0F4C81]' : 'bg-gray-300'
                                      }`}></div>
                                      <div className="flex-1 flex items-center justify-between">
                                          <span className={`text-[10px] ${isCompleted ? 'text-gray-400' : isInProgress ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                              {phase.name}
                                          </span>
                                          <span className="text-[9px] text-gray-400">{phase.dateRange}</span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>

                      {/* Next Check-in */}
                      {patientDetails.program.nextCheckIn && (
                          <div className="flex items-center gap-2 px-2 py-1.5 bg-gradient-to-r from-blue-50 to-sky-50 rounded-md border border-blue-100">
                              <div className="p-0.5 bg-[#0F4C81] rounded-md">
                                  <CalendarDays size={10} className="text-white" />
                              </div>
                              <div className="flex-1">
                                  <span className="text-[9px] text-gray-500 block">Next Check-in</span>
                                  <span className="text-[10px] font-semibold text-gray-800">{patientDetails.program.nextCheckIn}</span>
                              </div>
                          </div>
                      )}
                  </div>
                  </>
              ) : (
                  <>
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 text-gray-400 rounded-lg">
                              <Target size={14} />
                          </div>
                          <span className="text-xs font-bold text-gray-500">Program Progress</span>
                      </div>
                      <div className="flex gap-1 items-center">
                          <div className="text-gray-300 cursor-not-allowed p-1"><Move size={14} /></div>
                      </div>
                  </div>
                  <div className="pl-9">
                      <p className="text-xs text-gray-400 italic">No active program enrolled.</p>
                  </div>
                  </>
              )
          );
          default: return <div className="text-xs text-gray-400">{cardId}</div>;
      }
  };

  const getPatientHistory = (id: string) => {
      const defaultFlow = [{ type: 'separator', date: '02-01-2026' }, { type: 'event', icon: ShoppingCart, title: 'Order Created: Gut Zoomer 3.0', variant: 'success', date: '02-01-2026 09:15 AM', details: 'Order placed via Portal. Workflow instantiated.' }, { type: 'event', icon: Truck, title: 'Kit Delivered', variant: 'success', date: '02-05-2026 02:22 PM', details: 'Delivered to front porch.' }, { type: 'separator', date: 'Today' }, { type: 'event', icon: Package, title: 'Kit Returned to Lab', variant: 'neutral', date: '10:05 AM', details: 'Sample received at intake.' }];
      if (id === '3') return [{ type: 'separator', date: '02-01-2026' }, { type: 'event', icon: ShoppingCart, title: 'Order Created: Gut Zoomer 3.0', variant: 'success', date: '02-01-2026 09:15 AM', details: 'Order #2026020101 placed.' }, { type: 'separator', date: '02-05-2026' }, { type: 'event', icon: Truck, title: 'Kit Delivered', variant: 'success', date: '02-05-2026 02:22 PM', details: 'FedEx Tracking #1Z999...' }, { type: 'separator', date: '02-08-2026' }, { type: 'event', icon: Package, title: 'Kit Returned to Lab', variant: 'success', date: '02-08-2026 11:05 AM', details: 'Sample scanned at Lab Intake.' }, { type: 'separator', date: 'Today' }, { type: 'event', icon: FlaskConical, title: 'Lab Processing Started', variant: 'neutral', date: '10:30 AM', details: 'Sample prepared for analysis.' }, { type: 'exception', title: 'Test Not Performed (TNP)', reason: 'Sample Rejected: Gross Hemolysis detected during centrifugation.', suggestion: 'A redraw is required to proceed with this workflow.' }];
      if (id === '1') return [{ type: 'separator', date: '02-01-2026' }, { type: 'event', icon: ShoppingCart, title: 'Order Created', variant: 'success', date: '09:00 AM', details: 'Standard Panel' }, { type: 'separator', date: '02-10-2026' }, { type: 'event', icon: FlaskConical, title: 'Lab Processing Started', variant: 'success', date: '08:30 AM', details: 'Analysis in progress.' }, { type: 'separator', date: 'Today' }, { type: 'event', icon: ClipboardCheck, title: 'Report Ready', variant: 'success', date: '10:30 AM', details: 'Results released to patient portal.' }, { type: 'event', icon: Activity, title: 'Next Step: Follow-up Appointment', variant: 'info', date: '', details: 'Scheduled for Feb 27, 2026 at 2:00 PM', actionLabel: 'View Details' }];
      return defaultFlow;
  };

  const renderActivityStream = () => {
    const history = getPatientHistory(activePatientId);
    return (
        <>
            {history.map((item: any, idx: number) => {
                if (item.type === 'separator') return <DateSeparator key={idx} date={item.date} />;
                if (item.type === 'exception') return <ExceptionCard key={idx} title={item.title} reason={item.reason} suggestion={item.suggestion} />;
                if (item.type === 'event') return <SystemEventCard key={idx} icon={item.icon} title={item.title} variant={item.variant} date={item.date} details={item.details} actionLabel={item.actionLabel} />;
                return null;
            })}
        </>
    );
  };

  const renderDropdownContent = () => {
      const currentTab = activeTab;
      if (!currentTab) return null;
      const cardIds = tabLayouts[currentTab] || [];
      return (
          <>
            <div className="text-center mb-4 mt-1"><h3 className="text-sm font-bold text-gray-700 flex items-center justify-center gap-2">{currentTab === 'basics' && <UserCircle2 size={18} className="text-gray-500" />}{currentTab === 'health' && <BriefcaseMedical size={18} className="text-gray-500" />}{currentTab === 'calendar' && <Calendar size={18} className="text-gray-500" />}{currentTab === 'billing' && <DollarSign size={18} className="text-gray-500" />}{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}</h3></div>
            {cardIds.map((cardId, index) => (<div key={cardId} draggable onDragStart={(e) => handleTabDragStart(e, index)} onDragEnter={(e) => handleTabDragEnter(e, index)} onDragEnd={handleTabDragEnd} onDragOver={(e) => e.preventDefault()} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative group mb-3 cursor-default transition-all hover:border-blue-200">{renderCard(cardId)}</div>))}
            {currentTab === 'calendar' && (<button className="w-full mt-2 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-bold hover:bg-[#09355E] transition-colors flex items-center justify-center gap-2 shadow-sm"><Plus size={12} /> Schedule New</button>)}
          </>
      );
  };

  if (viewMode === 'encounter_note') {
    return <EncounterNotesEditor onBack={() => setViewMode('dashboard')} patient={activePatient} />;
  }

  return (
    <>
    <div className="flex h-full bg-white">
      
      {/* 1. Left Sidebar: Patient List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
         <div className="px-4 pt-4 pb-2 border-b border-gray-100">
             <button 
                onClick={() => setViewMode(viewMode === 'notifications' ? 'dashboard' : 'notifications')}
                className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${viewMode === 'notifications' ? 'bg-blue-50 text-[#0F4C81] border border-blue-100' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
             >
                <Bell size={16} className={viewMode === 'notifications' ? 'fill-current' : ''} />
                Notifications <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem]">3</span>
             </button>
         </div>
         <div className="p-4 space-y-3 border-b border-gray-100">
            <div className="relative"><input type="text" placeholder="Search patient..." className="w-full pl-3 pr-16 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 shadow-sm" /><div className="absolute right-2 top-2 flex items-center gap-2"><Search className="text-gray-400" size={16} /></div></div>
            <button className="w-full py-2.5 bg-[#0F4C81] hover:bg-[#09355E] text-white rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"><Plus size={18} /> Add New Patient</button>
         </div>
         <div className="flex-1 overflow-y-auto">
            {PATIENTS.map(patient => {
               const isActive = activePatientId === patient.id && viewMode !== 'notifications';
               return (
                  <div key={patient.id} onClick={() => { setActivePatientId(patient.id); if (viewMode === 'notifications') setViewMode('dashboard'); }} className={`flex items-start gap-3 p-4 cursor-pointer border-l-4 transition-all relative group ${isActive ? 'border-[#0F4C81] bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}>
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 relative ${isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                        {patient.initials}
                        {patient.workflowStatus === 'exception' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center"><AlertTriangle size={8} className="text-white" fill="currentColor" /></div>}
                        {patient.workflowStatus === 'completed' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"><Check size={8} className="text-white" strokeWidth={4} /></div>}
                     </div>
                     <div className="flex-1 min-w-0 pr-6">
                        <div className="flex justify-between items-baseline mb-0.5"><h4 className={`text-sm font-bold truncate ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>{patient.name}</h4></div>
                        <div className="text-[11px] text-gray-400 mb-1">{patient.time}</div>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${patient.workflowStatus === 'exception' ? 'text-amber-600 font-medium' : patient.workflowStatus === 'completed' ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>{patient.snippet}</p>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* 2. Main Content Area Switcher */}
      {viewMode === 'notifications' ? (
          <NotificationCenter />
      ) : (
          <>
            {/* Center: Detail Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0 relative">

                {/* Patient Header */}
                <div className="px-8 pt-6 pb-0 shrink-0 bg-white z-40 relative shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-slate-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-sm">{activePatient?.avatar ? <img src={activePatient.avatar} className="w-full h-full object-cover"/> : activePatient?.initials ?? '??'}</div>
                        <div><h2 className="text-xl font-bold text-gray-900">{activePatient?.name ?? 'Patient'}</h2><div className="flex items-center gap-3 text-xs text-gray-500 mt-1"><span className="flex items-center gap-1">Bio Gender: <span className="font-medium text-gray-700">{activePatient?.gender ?? '-'}</span></span><span className="text-gray-300">|</span><span className="flex items-center gap-1">DOB: <span className="font-medium text-gray-700">{activePatient?.dob ?? '-'}</span></span></div></div>
                    </div>
                    <div className="flex items-center gap-2 border-b border-gray-200">
                        <TabButton ref={el => tabRefs.current['basics'] = el} label="Basics" icon={User} active={activeTab === 'basics'} onClick={() => handleTabToggle('basics')} isDropdown />
                        <TabButton ref={el => tabRefs.current['health'] = el} label="Health" icon={Activity} active={activeTab === 'health'} onClick={() => handleTabToggle('health')} isDropdown />
                        <TabButton ref={el => tabRefs.current['calendar'] = el} label="Calendar" icon={Calendar} active={activeTab === 'calendar'} onClick={() => handleTabToggle('calendar')} isDropdown />
                        <TabButton ref={el => tabRefs.current['billing'] = el} label="Billing" icon={DollarSign} active={activeTab === 'billing'} onClick={() => handleTabToggle('billing')} isDropdown />
                    </div>
                </div>

                {/* Container for content below header */}
                <div className="flex-1 flex flex-col relative min-h-0" ref={centerContainerRef}>
                    <div className={`absolute top-0 z-50 mt-2 transition duration-200 ease-out origin-top-left ${activeTab ? 'scale-100 opacity-100' : 'scale-95 opacity-0 invisible pointer-events-none'}`} style={{ left: panelLeft }}><div className="w-[520px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[calc(100vh-250px)]"><div className="h-1 bg-[#0F4C81] w-full shrink-0"></div> <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3 custom-scrollbar">{renderDropdownContent()}</div></div></div>
                    <WorkflowProgressBar status={activePatient.workflowStatus} />
                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 bg-slate-50/50">{renderActivityStream()}</div>
                    <div className="p-4 pt-3 shrink-0 bg-white border-t border-gray-200 z-10 relative">
                        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-visible focus-within:ring-2 focus-within:ring-[#0F4C81] transition-all relative">
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-gray-200 rounded-t-xl">
                                <div className="flex items-center gap-1 relative">
                                    <div className="relative"><button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className="p-1.5 rounded transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"><Copy size={18} /></button>{isActionMenuOpen && <div className="absolute bottom-full left-0 mb-3 flex flex-col gap-2 min-w-[200px] z-50 animate-in slide-in-from-bottom-2 fade-in duration-200"><MenuOption icon={FileText} label="Encounter Notes" onClick={handleOpenEncounterNote} /><MenuOption icon={Pill} label="eRx" /><MenuOption icon={StickyNote} label="Internal Notes" /><MenuOption icon={MoreHorizontal} label="Other" /></div>}</div><ToolbarIcon icon={Clock} /><button onClick={() => setShowScheduleModal(true)} className="p-1.5 rounded transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Schedule Appointment"><Calendar size={18} /></button><button onClick={() => setShowOrderModal(true)} className="p-1.5 rounded transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Order Tests"><Package size={18} /></button><ToolbarIcon icon={FileText} /><ToolbarIcon icon={GitBranch} />
                                </div>
                                <button className="flex items-center gap-1.5 text-xs font-semibold text-[#0F4C81] hover:text-[#09355E] px-2 py-1 rounded hover:bg-blue-50 transition-colors"><CheckCheck size={14} /> Mark as replied</button>
                            </div>
                            <div className="relative p-2 rounded-b-xl"><textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={`Type here to reply via ${channelConfig[selectedChannel].label}...`} className="w-full text-sm focus:outline-none resize-none h-10 text-gray-700 placeholder-gray-400 bg-transparent" /><div className="flex justify-between items-center mt-2 px-1"><div className="text-xs text-gray-400 font-medium">Press ⌘+Enter to send</div><div className="flex items-center gap-2"><div className="relative"><button onClick={() => setIsChannelMenuOpen(!isChannelMenuOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${channelConfig[selectedChannel].bg} ${channelConfig[selectedChannel].border} ${channelConfig[selectedChannel].color} hover:shadow-sm`}><CurrentChannelIcon size={14} />{channelConfig[selectedChannel].label}<ChevronDown size={12} className="opacity-50" /></button>{isChannelMenuOpen && <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-1 duration-150">{Object.entries(channelConfig).map(([key, config]) => { const Icon = config.icon; return (<button key={key} onClick={() => { setSelectedChannel(key as any); setIsChannelMenuOpen(false); }} className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-left transition-colors hover:bg-gray-50 ${selectedChannel === key ? 'bg-gray-50 text-gray-900' : 'text-gray-600'}`}><Icon size={14} className={config.color} />{config.label}{selectedChannel === key && <Check size={12} className="ml-auto text-gray-400" />}</button>); })}</div>}</div><button className="px-5 py-2 bg-[#0F4C81] text-white rounded-lg text-sm font-bold hover:bg-[#09355E] flex items-center gap-2 transition-colors shadow-sm"><ArrowUp size={16} /> Send</button></div></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Right Sidebar: Peg Board - TABBED INTERFACE */}
            <div className="w-80 bg-[#0F4C81] flex flex-col shrink-0 text-slate-800 border-l border-[#0a355c] relative z-0">
                
                {/* Tabs */}
                <div className="flex bg-[#0a355c]/40 shrink-0">
                    <button onClick={() => setPegBoardTab('cards')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${pegBoardTab === 'cards' ? 'bg-[#0F4C81] text-white border-b-2 border-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Pin Board</button>
                    <button onClick={() => setPegBoardTab('ai')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${pegBoardTab === 'ai' ? 'bg-[#0F4C81] text-white border-b-2 border-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Sparkles size={12} className={pegBoardTab === 'ai' ? 'animate-pulse' : ''} /> AI Composer</button>
                </div>

                {pegBoardTab === 'cards' ? (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {/* Active Exception Pin */}
                        {activePatient.workflowStatus === 'exception' && (
                            <div className="bg-amber-50 rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow border-l-4 border-amber-500">
                                <PinIcon />
                                <div className="flex items-start gap-3">
                                    <div className="pt-0.5"><AlertTriangle size={16} className="text-amber-600" /></div>
                                    <div>
                                        <div className="text-[10px] text-amber-600 mb-0.5 font-bold uppercase">Action Required</div>
                                        <div className="text-sm font-bold text-gray-900">Lab Exception</div>
                                        <div className="text-[10px] text-gray-500 mt-1">TNP - Redraw Needed</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completed Pin */}
                        {activePatient.workflowStatus === 'completed' && (
                            <div className="bg-emerald-50 rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow border-l-4 border-emerald-500">
                                <PinIcon />
                                <div className="flex items-start gap-3">
                                    <div className="pt-0.5"><CheckCheck size={16} className="text-emerald-600" /></div>
                                    <div>
                                        <div className="text-[10px] text-emerald-600 mb-0.5 font-bold uppercase">Status Update</div>
                                        <div className="text-sm font-bold text-gray-900">Workflow Complete</div>
                                        <div className="text-[10px] text-gray-500 mt-1">Results sent & Reviewed</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {pinnedItems.map(item => (
                            <PinnedCardRenderer 
                                key={item.id} 
                                item={item} 
                                onUnpin={() => togglePin(item)} 
                            />
                        ))}

                        {activePatientId === '3' && !pinnedItems.find(p => p.id === 'sample-gut') && (
                            <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                            <PinIcon />
                            <div className="flex items-start gap-3">
                                <div className="pt-0.5"><FlaskConical size={16} className="text-gray-500" /></div>
                                <div>
                                    <div className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase">Sample:</div>
                                    <div className="text-sm font-bold text-gray-900">Gut Zoomer</div>
                                    <div className="text-[10px] text-gray-500 mt-1">Service Date: Dec-08-2025</div>
                                    {activePatient.workflowStatus === 'exception' && <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded mt-1">Exception</span>}
                                    {activePatient.workflowStatus === 'completed' && <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded mt-1">Results Ready</span>}
                                </div>
                            </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <SidebarAiAssistant
                        history={aiChatHistory}
                        isProcessing={isAiProcessing}
                        onSendMessage={handleAiMessage}
                        emptyStateMessage={`I have access to ${activePatient?.name || 'this patient'}'s entire chart. Ask me to check workflow status, summarize history, or review latest labs.`}
                    />
                )}
            </div>
          </>
      )}

    </div>

    {/* Order Diagnostic Tests Modal */}
    <OrderDiagnosticTestsModal
      isOpen={showOrderModal}
      onClose={() => setShowOrderModal(false)}
      onOrder={(tests) => {
        console.log('Ordered tests:', tests);
        // Add system event for the order
        const newEvent: SystemEventCardProps = {
          icon: FlaskConical,
          title: 'Lab Tests Ordered',
          status: 'Pending',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          variant: 'info',
          details: `${tests.length} test${tests.length > 1 ? 's' : ''} ordered: ${tests.map(t => t.name).join(', ')}`
        };
      }}
      patient={{
        name: activePatient?.name ?? 'Patient',
        dob: activePatient?.dob ?? '',
        age: activePatient?.age ?? 0,
        gender: activePatient?.gender ?? 'Male'
      }}
    />

    {/* Schedule Appointment Modal - reuses CreateEventModal from Calendar */}
    <CreateEventModal
      isOpen={showScheduleModal}
      onClose={() => setShowScheduleModal(false)}
      initialDate={new Date().toISOString().split('T')[0]}
      patient={{
        name: activePatient?.name ?? '',
        initials: activePatient?.initials ?? ''
      }}
      appointmentType="Follow-up"
    />
  </>
  );
};
