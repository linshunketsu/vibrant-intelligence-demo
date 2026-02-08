import React, { useState, useRef, useEffect } from 'react';
import { 
  Filter, CheckSquare, XSquare, ArrowRight, MoreHorizontal, 
  MessageSquare, Send, Sparkles, AlertCircle, AlertTriangle, 
  Info, Check, CheckCircle2, X, ChevronDown, Bot, Bell,
  FileDiff, ArrowLeftRight
} from 'lucide-react';

interface Notification {
  id: string;
  patientName: string;
  patientDetails: string; // e.g. "(F, 45)"
  avatar?: string;
  title: string;
  description: string;
  time: string;
  type: 'blocker' | 'warning' | 'info';
  status: 'pending' | 'approved' | 'rejected';
  diffData?: {
    original: string;
    proposed: string;
  };
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientDetails: '(F, 45)',
    title: 'Order Approval Required',
    description: 'Comprehensive Blood Panel order needs approval before processing ($199).',
    time: '10 min ago',
    type: 'blocker',
    status: 'pending',
    diffData: {
        original: "Status: Draft\nAuthorized By: Pending",
        proposed: "Status: Approved\nAuthorized By: Dr. Smith"
    }
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientDetails: '(M, 38)',
    title: 'Lab Results Review',
    description: 'Thyroid panel results flagged for physician review. TSH levels elevated (5.2 mIU/L).',
    time: '25 min ago',
    type: 'blocker',
    status: 'pending',
    diffData: {
        original: "Protocol: Standard Maintenance\nMedication: Levothyroxine 50mcg",
        proposed: "Protocol: Elevated TSH Intervention\nMedication: Levothyroxine 75mcg"
    }
  },
  {
    id: '3',
    patientName: 'Emily Davis',
    patientDetails: '(F, 32)',
    title: 'Program Milestone Pending',
    description: 'Weight Management Program Week 4 check-in overdue by 2 days.',
    time: '1 hour ago',
    type: 'warning',
    status: 'pending'
  },
  {
    id: '4',
    patientName: 'Robert Wilson',
    patientDetails: '(M, 52)',
    title: 'Workflow Escalation',
    description: 'Automated follow-up workflow requires manual intervention due to missing insurance info.',
    time: '2 hours ago',
    type: 'warning',
    status: 'pending'
  },
  {
    id: '5',
    patientName: 'Thomas Garcia',
    patientDetails: '(M, 58)',
    title: 'Prescription Renewal',
    description: 'Medication renewal request requires physician signature.',
    time: '6 hours ago',
    type: 'blocker',
    status: 'pending'
  },
  {
    id: '6',
    patientName: 'Jennifer Martinez',
    patientDetails: '(F, 28)',
    title: 'New Form Submission',
    description: 'Health questionnaire completed and ready for review.',
    time: '3 hours ago',
    type: 'info',
    status: 'pending'
  },
  {
    id: '7',
    patientName: 'David Brown',
    patientDetails: '(M, 41)',
    title: 'Appointment Confirmed',
    description: 'Follow-up appointment confirmed for Dec 18, 2025.',
    time: '4 hours ago',
    type: 'info',
    status: 'pending'
  },
  {
    id: '8',
    patientName: 'Lisa Anderson',
    patientDetails: '(F, 35)',
    title: 'Payment Received',
    description: 'Payment of $299 processed for Gut Health Program.',
    time: '5 hours ago',
    type: 'info',
    status: 'pending'
  }
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  timestamp: string;
}

export const NotificationCenter: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'blocker' | 'warning' | 'info'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<{original: string, proposed: string} | null>(null);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
        id: 'welcome',
        role: 'assistant',
        content: (
            <div>
                <p className="mb-2">Good morning! You have <strong>8 pending notifications</strong> today:</p>
                <ul className="space-y-1 text-xs mb-3">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"/> 3 blockers requiring immediate attention</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/> 2 warnings to review</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> 3 informational updates</li>
                </ul>
                <p>Would you like me to help you process these? I can batch approve low-risk items or summarize the critical ones.</p>
            </div>
        ),
        timestamp: '9:00 AM'
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const filteredNotifications = notifications.filter(n => {
      if (filter === 'all') return true;
      return n.type === filter;
  });

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredNotifications.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredNotifications.map(n => n.id));
      }
  };

  const toggleSelect = (id: string) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(prev => prev.filter(i => i !== id));
      } else {
          setSelectedIds(prev => [...prev, id]);
      }
  };

  const handleApprove = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleOpenDiff = (notification: Notification) => {
      if (notification.diffData) {
          setSelectedDiff(notification.diffData);
          setDiffModalOpen(true);
      }
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: chatInput,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, userMsg]);
      setChatInput('');

      // Simple Mock Response Logic
      setTimeout(() => {
          let aiResponse: React.ReactNode = "I'm processing that request...";
          
          if (chatInput.toLowerCase().includes('blocker')) {
              setFilter('blocker');
              aiResponse = (
                  <div>
                      <p className="mb-2">I've filtered the list to show only blockers. There are 3 items requiring your attention:</p>
                      <div className="space-y-2 mb-3">
                          {notifications.filter(n => n.type === 'blocker').map(n => (
                              <div key={n.id} className="bg-red-50 p-2 rounded border border-red-100 text-xs">
                                  <div className="font-bold text-red-800">
                                      {n.id}. {n.patientName} - {n.title}
                                  </div>
                                  <div className="text-red-600 truncate">{n.description}</div>
                              </div>
                          ))}
                      </div>
                      <p>Do you want me to approve all standard orders, or review each individually?</p>
                  </div>
              );
          } else if (chatInput.toLowerCase().includes('approve')) {
              aiResponse = "I've batched approved the selected low-risk items. The queue has been updated.";
          }

          const aiMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: aiResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatHistory(prev => [...prev, aiMsg]);
      }, 1000);
  };

  const handleChipClick = (text: string) => {
      setChatInput(text);
      // Ideally trigger submit immediately or focus input
  };

  return (
    <div className="flex-1 flex flex-row h-full bg-white relative overflow-hidden">
        
        {/* --- LEFT PANEL: NOTIFICATIONS LIST --- */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 bg-white">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">Notifications Center</h2>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {notifications.length} pending
                    </span>
                </div>
                
                <div className="flex gap-2">
                    {[
                        { id: 'all', label: 'All', bg: 'bg-gray-800 text-white', hover: 'hover:bg-gray-700' },
                        { id: 'blocker', label: 'Blockers', dot: 'bg-red-500', bg: 'bg-red-50 text-red-700', hover: 'hover:bg-red-100' },
                        { id: 'warning', label: 'Warnings', dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700', hover: 'hover:bg-amber-100' },
                        { id: 'info', label: 'Info', dot: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700', hover: 'hover:bg-blue-100' },
                    ].map(f => (
                        <button 
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2
                                ${filter === f.id ? f.bg : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}
                            `}
                        >
                            {f.dot && <div className={`w-2 h-2 rounded-full ${f.dot}`} />}
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="px-6 py-3 bg-[#f8f8f8] border-b border-gray-200 flex items-center justify-between text-sm shrink-0">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedIds.length > 0 && selectedIds.length === filteredNotifications.length}
                            onChange={toggleSelectAll}
                        />
                        <span className="font-medium text-slate-600">Select All</span>
                    </label>
                    {selectedIds.length > 0 && (
                        <span className="text-slate-400">|</span>
                    )}
                    {selectedIds.length > 0 && (
                        <span className="text-slate-600 font-medium">{selectedIds.length} selected</span>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md font-bold text-xs hover:bg-emerald-200 disabled:opacity-50 transition-colors">
                        Approve Selected
                    </button>
                    <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md font-bold text-xs hover:bg-gray-300 disabled:opacity-50 transition-colors">
                        Reject Selected
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f8f8]/30">
                {filteredNotifications.map(notification => (
                    <div 
                        key={notification.id}
                        className={`
                            group bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative
                            ${notification.type === 'blocker' ? 'border-l-4 border-l-red-500 border-gray-200' : 
                              notification.type === 'warning' ? 'border-l-4 border-l-amber-500 border-gray-200' : 
                              'border-l-4 border-l-blue-500 border-gray-200'}
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className="pt-1">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                    checked={selectedIds.includes(notification.id)}
                                    onChange={() => toggleSelect(notification.id)}
                                />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            notification.type === 'blocker' ? 'bg-red-500' : 
                                            notification.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                        <h3 className="text-sm font-bold text-gray-900">{notification.title}</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                    <span className="font-semibold text-gray-800">{notification.patientName} <span className="text-gray-500 font-normal">{notification.patientDetails}</span></span> - {notification.description}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleApprove(notification.id)}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
                                    >
                                        Approve
                                    </button>
                                    <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors shadow-sm">
                                        Reject
                                    </button>
                                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition-colors">
                                        Forward
                                    </button>
                                    <button className="px-3 py-1 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors">
                                        + Note
                                    </button>
                                    
                                    {notification.diffData && (
                                        <button 
                                            onClick={() => handleOpenDiff(notification)}
                                            className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                                        >
                                            <FileDiff size={14} /> Review Changes
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredNotifications.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-200" />
                        <p>No notifications found.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- RIGHT PANEL: AI COMPOSER (ASSISTANT) --- */}
        <div className="w-[400px] flex flex-col bg-white border-l border-gray-200 shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)] z-10">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-[#f8f8f8]/50">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Bot size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">AI Assistant</h3>
                    <p className="text-[10px] text-gray-500">Help you manage notifications efficiently</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mr-2 shrink-0 mt-1">
                                <Bot size={14} />
                            </div>
                        )}
                        <div 
                            className={`
                                max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-[#5e5ce6] text-white rounded-br-none' 
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}
                            `}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {/* Simulated Loading/Thinking would go here */}
                
                <div ref={chatEndRef} />
            </div>

            {/* Quick Actions & Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mask-fade-right">
                    {['Approve all low-risk', 'Summarize blockers', 'Forward to team'].map(action => (
                        <button 
                            key={action}
                            onClick={() => handleChipClick(action)}
                            className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-full transition-colors"
                        >
                            {action}
                        </button>
                    ))}
                </div>
                
                <form onSubmit={handleSendMessage} className="relative">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask AI to help manage notifications..."
                        className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    />
                    <button 
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-[#5e5ce6] hover:bg-[#4b4ac9] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>

        {/* --- DIFF MODAL --- */}
        {diffModalOpen && selectedDiff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#f8f8f8]">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileDiff size={18} className="text-blue-600"/> 
                            Review Proposed Changes
                        </h3>
                        <button onClick={() => setDiffModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-0 relative">
                        {/* Original */}
                        <div className="pr-6 border-r border-gray-200">
                            <div className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span> Original
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 whitespace-pre-wrap font-mono">
                                {selectedDiff.original}
                            </div>
                        </div>

                        {/* Arrow Icon Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 p-1.5 rounded-full shadow-sm z-10">
                            <ArrowLeftRight size={16} className="text-gray-400" />
                        </div>

                        {/* Proposed */}
                        <div className="pl-6">
                            <div className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Proposed
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-sm text-emerald-800 whitespace-pre-wrap font-mono relative">
                                {selectedDiff.proposed}
                                <div className="absolute top-2 right-2 text-emerald-500">
                                    <Sparkles size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <button onClick={() => setDiffModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg text-sm hover:bg-white transition-colors">
                            Cancel
                        </button>
                        <button onClick={() => { setDiffModalOpen(false); /* Trigger approve logic */ }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-sm transition-colors">
                            Approve Change
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};
