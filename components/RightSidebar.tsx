import React, { useState, useEffect, useRef } from 'react';
import { WorkflowNode, NodeType, BlockType } from '../types';
import { Blocks, Sparkles, Send, Trash2, Check, ChevronDown, AlertTriangle, Settings, Info, FileText, Paperclip, ExternalLink, Bot, User, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { generateAIResponse } from '../services/geminiService';
import { ICON_MAP } from '../constants';

interface RightSidebarProps {
  selectedNode: WorkflowNode | null;
  workflowNodes: WorkflowNode[];
  onDeleteNode: (id: string) => void;
  onUpdateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  onOpenTemplateEditor?: () => void;
  onOpenFormBuilder?: (docId: string, docName: string) => void;
  onGenerateWorkflow?: () => void;
  isReviewing?: boolean;
  onAcceptAi?: () => void;
  onRejectAi?: () => void;
  onAiLoading?: (isLoading: boolean) => void;
}

enum Tab {
  EDITOR = 'EDITOR',
  AI = 'AI'
}

const ORDER_EVENTS = [
  'Order Created', 'Order Modified', 'Order Redrawn', 
  'Payment Complete', 'Payment Failed', 'Payment Refund',
  'Lab Shipped', 'Kit Delivered', 'Kit Returned',
  'Questionnaire Assigned', 'Missing Information',
  'Test Not Performed', 'Order Canceled'
];

const REPORT_EVENTS = [
  'Report Ready', 'Report Amended', 'Critical Result', 'Preliminary Result'
];

const AVAILABLE_DOCUMENTS = [
  { id: 'doc_intake', name: 'General Intake Form' },
  { id: 'doc_nutrition', name: 'Nutritional Assessment' },
  { id: 'doc_history', name: 'Medical History Questionnaire' },
  { id: 'doc_consent', name: 'Telehealth Consent Form' },
  { id: 'doc_insurance', name: 'Insurance Verification' }
];

const EMAIL_TEMPLATES = [
  { 
    id: 'tpl_order_conf', 
    name: 'Order Confirmation', 
    subject: 'Order Confirmation #{order_id}', 
    content: `Hi {patient_name},

Thank you for your order. We have received your request and it is currently being processed by our lab team.

Order Details:
----------------
Order Number: {order_id}
Date: {appointment_date}

What happens next?
1. We will ship your test kit within 24 hours.
2. You will receive a tracking number via email.
3. Once received, please follow the instructions inside the kit.

Access your patient portal to view full details:
{portal_link}

Best regards,
The Team at {clinic_name}`
  },
  { 
    id: 'tpl_kit_instr', 
    name: 'Kit Instructions', 
    subject: 'Action Required: Your Test Kit Instructions', 
    content: `Hello {patient_name},

Your test kit has been delivered! To ensure the most accurate results, please carefully review the attached instructions before you begin.

Important Reminders:
- Do not eat or drink 30 minutes prior to the test.
- Mail your sample back on the same day if possible.

If you have questions, please reply to this email or visit our help center.

Sincerely,
{clinic_name}`
  },
  { 
    id: 'tpl_results', 
    name: 'Results Ready', 
    subject: 'Your Lab Results are Ready', 
    content: `Good news {patient_name},

Your lab results have been processed and are now available for review.

Please log in to your secure patient portal to view your report and any provider notes.

View Results: {portal_link}

If you need to discuss these results, please schedule a follow-up appointment.

Best,
{clinic_name}`
  },
  { 
    id: 'tpl_appt_reminder', 
    name: 'Appointment Reminder', 
    subject: 'Reminder: Upcoming Appointment on {appointment_date}', 
    content: `Hello {patient_name},

This is a friendly reminder for your upcoming appointment with {provider_name}.

Date & Time: {appointment_date}
Location: {clinic_name} (or Virtual Link)

Please arrive 10 minutes early to complete any necessary check-in forms. If you need to reschedule, please let us know at least 24 hours in advance.

See you soon,
{clinic_name}`
  },
  { 
    id: 'tpl_action_req', 
    name: 'Action Required', 
    subject: 'Action Required: Please complete your health profile', 
    content: `Dear {patient_name},

We noticed you haven't completed your health questionnaire yet. This information is vital for {provider_name} to provide the best care possible.

Please take a moment to complete it here:
{link}

Thank you for your cooperation.

Warmly,
{clinic_name}`
  },
  { 
    id: 'tpl_appt_req', 
    name: 'Appointment Request', 
    subject: 'Please Schedule Your Follow-up Appointment', 
    content: `Dear {patient_name},

It is time to schedule your follow-up appointment to discuss your recent progress.

Please use the secure link below to choose a time that works best for you:
{link}

We look forward to seeing you.

Sincerely,
{clinic_name}`
  }
];

export const RightSidebar: React.FC<RightSidebarProps> = ({ 
  selectedNode, 
  workflowNodes,
  onDeleteNode,
  onUpdateNode,
  onOpenTemplateEditor,
  onOpenFormBuilder,
  onGenerateWorkflow,
  isReviewing,
  onAcceptAi,
  onRejectAi,
  onAiLoading
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.EDITOR);
  const [aiInput, setAiInput] = useState('');
  const [aiHistory, setAiHistory] = useState<{role: string, content: string}[]>([
    { role: 'model', content: "Hi! I'm your Clinical Workflow Assistant. I can help you build automated care pathways. Describe what you need, like 'Create a post-lab result follow-up'." }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Switch to Editor tab automatically when a node is selected
  useEffect(() => {
    if (selectedNode) {
      setActiveTab(Tab.EDITOR);
    }
  }, [selectedNode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiHistory, isAiLoading, thinkingTime, isReviewing]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = aiInput;
    setAiInput('');
    setAiHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);
    if (onAiLoading) onAiLoading(true);
    setThinkingTime(0);

    const startTime = Date.now();
    // Update every 100ms for smooth decimal counting
    const timerInterval = setInterval(() => {
        setThinkingTime((Date.now() - startTime) / 1000);
    }, 100);

    // DEMO IMPLEMENTATION: Always generate the specific workflow regardless of input
    // Increased delay to ~14.5 seconds for a more realistic/natural feel
    setTimeout(() => {
        clearInterval(timerInterval);
        
        if (onGenerateWorkflow) {
            onGenerateWorkflow();
            
            setAiHistory(prev => [...prev, { 
                role: 'model', 
                content: "I've drafted a workflow for you. Please review the highlighted nodes on the canvas. You can Accept to keep them or Reject to discard." 
            }]);
        } else {
            // Fallback if no handler provided (shouldn't happen in this specific setup)
             setAiHistory(prev => [...prev, { role: 'model', content: "I've analyzed your request, but I'm currently in demo mode. Please try dragging blocks manually." }]);
        }
        setIsAiLoading(false);
        if (onAiLoading) onAiLoading(false);
        setThinkingTime(0);
    }, 14500); 
  };

  const getThinkingMessage = (seconds: number) => {
     if (seconds < 4) return "Analyzing requirements...";
     if (seconds < 8) return "Designing logic pathways...";
     if (seconds < 11) return "Integrating best practices...";
     if (seconds < 14) return "Configuring parameters...";
     return "Finalizing generation...";
  };

  const handleEventToggle = (event: string) => {
    if (!selectedNode) return;
    const currentEvents = selectedNode.config?.events || [];
    const newEvents = currentEvents.includes(event)
      ? currentEvents.filter((e: string) => e !== event)
      : [...currentEvents, event];
    
    onUpdateNode(selectedNode.id, {
      config: { ...selectedNode.config, events: newEvents },
      tags: newEvents 
    });
  };

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template && selectedNode) {
      onUpdateNode(selectedNode.id, {
        config: { 
          ...selectedNode.config, 
          subject: template.subject,
          messageContent: template.content,
          selectedTemplateId: templateId
        }
      });
    } else if (templateId === '' && selectedNode) {
         onUpdateNode(selectedNode.id, {
            config: { 
              ...selectedNode.config, 
              selectedTemplateId: ''
            }
         });
    }
  };

  const updateConfig = (key: string, value: any) => {
    if (!selectedNode) return;
    onUpdateNode(selectedNode.id, {
      config: { ...selectedNode.config, [key]: value }
    });
  };

  const getMessageTypes = (node: WorkflowNode): string[] => {
    const val = node.config?.messageType;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val) return [val];
    return [];
  };

  const renderBanner = () => {
    if (!selectedNode) return null;
    
    const isTrigger = selectedNode.type === NodeType.TRIGGER;
    const bgClass = isTrigger ? 'bg-emerald-50' : 'bg-blue-50';
    const textClass = isTrigger ? 'text-teal-900' : 'text-blue-900';
    const borderClass = isTrigger ? 'border-teal-100' : 'border-blue-100';

    // Icon handling
    let Icon = Blocks;
    if (selectedNode.blockType === BlockType.ORDER_UPDATE) Icon = ICON_MAP['ShoppingCart'];
    else if (selectedNode.blockType === BlockType.SEND_MESSAGE) Icon = ICON_MAP['Mail'];
    else if (selectedNode.blockType === BlockType.REVIEW_APPROVAL) Icon = ICON_MAP['ShieldCheck'];
    else if (selectedNode.blockType === BlockType.APPOINTMENT) Icon = ICON_MAP['Calendar'];
    
    return (
      <div className={`p-4 rounded-lg border ${bgClass} ${borderClass} mb-6`}>
        <div className="flex gap-3">
          <Icon className={`w-5 h-5 ${textClass} mt-0.5`} />
          <div>
            <h3 className={`font-bold ${textClass}`}>
              {selectedNode.blockType}
            </h3>
            <p className={`text-xs mt-1 ${textClass} opacity-80 leading-relaxed`}>
              {selectedNode.type === NodeType.TRIGGER 
                 ? "triggers when order status changes occur in your system."
                 : "Configure properties for this action block."
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderConfiguration = () => {
    if (!selectedNode) return null;

    // 1. Trigger Configuration (Events)
    if (selectedNode.type === NodeType.TRIGGER && (selectedNode.blockType === BlockType.ORDER_UPDATE || selectedNode.blockType === BlockType.REPORT_UPDATE)) {
      const EVENTS = selectedNode.blockType === BlockType.ORDER_UPDATE ? ORDER_EVENTS : REPORT_EVENTS;
      
      return (
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900">Select Event to monitor:</h4>
          <div className="space-y-3">
            {EVENTS.map(event => {
              const checked = (selectedNode.config?.events || []).includes(event);
              return (
                <label key={event} className="flex items-center gap-3 cursor-pointer group select-none">
                  <div 
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      checked 
                        ? 'bg-[#0F4C81] border-[#0F4C81]' // Dark blue like screenshot
                        : 'bg-white border-gray-400 group-hover:border-[#0F4C81]'
                    }`}
                    onClick={(e) => {
                      e.preventDefault(); 
                      handleEventToggle(event);
                    }}
                  >
                    {checked && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-sm text-gray-700">{event}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    // 2. Send Message Action Configuration
    if (selectedNode.blockType === BlockType.SEND_MESSAGE) {
      const messageTypes = getMessageTypes(selectedNode);
      const isEmail = messageTypes.includes('email');
      
      const toggleType = (type: string) => {
          const newTypes = messageTypes.includes(type) 
              ? messageTypes.filter(t => t !== type)
              : [...messageTypes, type];
          updateConfig('messageType', newTypes);
      };

      return (
        <div className="space-y-5">
          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">
               Communication Channels <span className="text-red-500">*</span>
             </label>
             <div className="space-y-2 bg-[#f8f8f8] p-3 rounded-lg border border-slate-200">
                {[
                    { id: 'email', label: 'Email' },
                    { id: 'sms', label: 'SMS' },
                    { id: 'portal', label: 'Portal Chat' }
                ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${messageTypes.includes(opt.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                            {messageTypes.includes(opt.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                         </div>
                         <input type="checkbox" className="hidden" checked={messageTypes.includes(opt.id)} onChange={() => toggleType(opt.id)} />
                         <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                ))}
             </div>
          </div>

          {isEmail && (
             <div className="bg-[#f8f8f8] p-3 rounded-lg border border-slate-200 space-y-3">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">
                     Email Template
                  </label>
                  <div className="relative">
                    <select 
                       className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                       value={selectedNode.config?.selectedTemplateId || ''}
                       onChange={(e) => handleTemplateChange(e.target.value)}
                    >
                       <option value="">-- Select a template --</option>
                       {EMAIL_TEMPLATES.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                       ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>
                
                <button 
                  onClick={onOpenTemplateEditor}
                  className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                >
                   <Settings size={14} /> Open Template Editor
                </button>

                {/* Read-only Preview */}
                <div className="pt-2 border-t border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700">Subject: </span>
                      {selectedNode.config?.subject || '(Empty)'}
                    </div>
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 block mb-0.5">Body Preview: </span>
                      <span className="italic opacity-80 line-clamp-3 bg-white p-2 rounded border border-slate-100 block">
                        {selectedNode.config?.messageContent || '(Empty)'}
                      </span>
                    </div>
                 </div>
             </div>
          )}

          {!isEmail && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Subject (if applicable)"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedNode.config?.subject || ''}
                    onChange={(e) => updateConfig('subject', e.target.value)}
                  />
                  <button 
                    className="absolute right-2 top-2.5 text-xs text-gray-500 hover:text-gray-700 underline px-1"
                    onClick={() => updateConfig('subject', '')}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Message Content <span className="text-red-500">(Required)</span>
                </label>
                <textarea 
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y font-mono text-slate-600 leading-relaxed"
                  placeholder="Type your message here..."
                  value={selectedNode.config?.messageContent || ''}
                  onChange={(e) => updateConfig('messageContent', e.target.value)}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-slate-400">Supports variable tags like &#123;patient_name&#125;</p>
                </div>
              </div>
            </>
          )}

          {/* Document Attachment Section */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Paperclip size={16} className="text-blue-600"/>
                Attach Document / Questionnaire
            </label>
            <div className="relative">
                <select 
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={selectedNode.config?.attachedDocumentId || ''}
                    onChange={(e) => updateConfig('attachedDocumentId', e.target.value)}
                >
                    <option value="">-- No Document Attached --</option>
                    {AVAILABLE_DOCUMENTS.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
            </div>
            {selectedNode.config?.attachedDocumentId && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md flex flex-col gap-2">
                    <div className="text-xs text-blue-700 flex items-start gap-2">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <span>
                            A unique link for <strong>{AVAILABLE_DOCUMENTS.find(d => d.id === selectedNode.config?.attachedDocumentId)?.name}</strong> will be appended.
                        </span>
                    </div>
                    {onOpenFormBuilder && (
                      <button 
                        onClick={() => {
                          const doc = AVAILABLE_DOCUMENTS.find(d => d.id === selectedNode.config?.attachedDocumentId);
                          if (doc) onOpenFormBuilder(doc.id, doc.name);
                        }}
                        className="w-full py-2 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                         Edit Form <ExternalLink size={12} />
                      </button>
                    )}
                </div>
            )}
          </div>
        </div>
      );
    }
    
    // 3. Appointment Configuration
    if (selectedNode.blockType === BlockType.APPOINTMENT) {
       const messageTypes = getMessageTypes(selectedNode);
       const isEmail = messageTypes.includes('email');
       
       const toggleType = (type: string) => {
           const newTypes = messageTypes.includes(type) 
               ? messageTypes.filter(t => t !== type)
               : [...messageTypes, type];
           updateConfig('messageType', newTypes);
       };

       return (
         <div className="space-y-5">
            <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">Appointment Request Settings</h4>
            
            {/* Message Type Selection */}
            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2">
                 Communication Channels
               </label>
               <div className="space-y-2 bg-[#f8f8f8] p-3 rounded-lg border border-slate-200">
                    {[
                        { id: 'email', label: 'Email' },
                        { id: 'sms', label: 'SMS' },
                        { id: 'portal', label: 'Portal Chat' }
                    ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${messageTypes.includes(opt.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                {messageTypes.includes(opt.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                             </div>
                             <input type="checkbox" className="hidden" checked={messageTypes.includes(opt.id)} onChange={() => toggleType(opt.id)} />
                             <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                    ))}
                 </div>
            </div>

            {/* If Email -> Template Selection */}
            {isEmail && (
               <div className="bg-[#f8f8f8] p-3 rounded-lg border border-slate-200 space-y-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">
                       Message Template
                    </label>
                    <div className="relative">
                      <select 
                         className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                         value={selectedNode.config?.selectedTemplateId || ''}
                         onChange={(e) => handleTemplateChange(e.target.value)}
                      >
                         <option value="">-- Select a template --</option>
                         {EMAIL_TEMPLATES.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                  
                  <button 
                    onClick={onOpenTemplateEditor}
                    className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                  >
                     <Settings size={14} /> Open Template Editor
                  </button>
               </div>
            )}

            {/* Content Preview / Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Message Content <span className="text-red-500">*</span>
              </label>
              <textarea 
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y font-mono text-slate-600 leading-relaxed"
                placeholder="Message content..."
                value={selectedNode.config?.messageContent || ''}
                onChange={(e) => updateConfig('messageContent', e.target.value)}
              />
            </div>
         </div>
       );
    }
    
    // 4. Logic: Review & Approval
    if (selectedNode.blockType === BlockType.REVIEW_APPROVAL) {
      return (
         <div className="space-y-5">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
               <strong>Review & Approval</strong> will allow the Actions to be executed when you reviewed and approved to process even if the Trigger grants the connected actions.
            </div>
            
            <div className="border-t border-gray-200 pt-4">
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Primary Reviewer</label>
               <div className="relative">
                 <select className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-700">
                    <option>Me (Current User)</option>
                    <option>Department Head</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
               </div>
            </div>
            
             <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                   <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
                   <div className="text-sm">
                      <span className="font-medium text-gray-700 block">Enable escalated Approval</span>
                      <span className="text-gray-500 text-xs">Set a two-tier approval process with another reviewer</span>
                   </div>
                </label>
             </div>
         </div>
      );
    }

    // Default
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Block Name</label>
          <input 
            type="text" 
            value={selectedNode.title}
            onChange={(e) => onUpdateNode(selectedNode.id, { title: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        <button
          onClick={() => setActiveTab(Tab.EDITOR)}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative ${
            activeTab === Tab.EDITOR ? 'text-[#0F4C81] bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Blocks size={16} />
          Block Editor
          {activeTab === Tab.EDITOR && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F4C81]" />}
        </button>
        <button
          onClick={() => setActiveTab(Tab.AI)}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
            activeTab === Tab.AI ? 'text-[#0F4C81] bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Sparkles size={16} />
          AI Assistant
          {activeTab === Tab.AI && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F4C81]" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col h-full">
        {activeTab === Tab.EDITOR ? (
          selectedNode ? (
            <div className="flex flex-col min-h-full">
              <div className="p-6 flex-1">
                {renderBanner()}
                {renderConfiguration()}
              </div>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
                <button 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F4C81] text-white rounded-lg text-sm font-bold hover:bg-[#09355E] transition-colors shadow-sm"
                  onClick={() => {/* Mock save action */}}
                >
                  <Settings size={16} />
                  Save Configuration
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50/50">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mb-4 transform rotate-12">
                <Blocks size={40} className="text-gray-400 -rotate-12" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No building block selected.</h3>
              <p className="text-sm">Select a building block from the block panel on the left to set its properties here.</p>
            </div>
          )
        ) : (
          /* AI Chat Tab */
          <div className="flex flex-col h-full bg-[#f8f8f8]">
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {aiHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed
                            ${msg.role === 'user' 
                                ? 'bg-[#0F4C81] text-white rounded-br-none' 
                                : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'
                            }
                        `}>
                            {msg.role === 'model' && (
                                <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                    <Bot size={14} />
                                    <span className="text-xs font-bold uppercase">AI Assistant</span>
                                </div>
                            )}
                            {msg.content}
                        </div>
                    </div>
                 ))}
                 {isAiLoading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-bl-none shadow-sm p-3.5 flex items-center gap-3">
                             <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                                <Loader2 size={16} className="animate-spin text-[#0F4C81]" />
                             </div>
                             <div className="flex flex-col min-w-[200px]">
                                 <span className="text-sm font-medium text-gray-800 transition-all duration-300">
                                    {getThinkingMessage(thinkingTime)}
                                 </span>
                                 <span className="text-xs text-gray-400">
                                    Processing request...
                                 </span>
                             </div>
                        </div>
                    </div>
                 )}
                 <div ref={chatEndRef} />
             </div>
             
             {/* Input Area / Review Actions */}
             {!isReviewing && (
             <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                  <form onSubmit={handleAiSubmit} className="relative">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Describe a workflow to build..."
                      className="w-full pl-4 pr-12 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C81] shadow-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!aiInput.trim() || isAiLoading}
                      className="absolute right-2 top-2 p-1.5 bg-[#0F4C81] text-white rounded-lg hover:bg-[#09355E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                       <Send size={16} />
                    </button>
                  </form>
                   <div className="mt-2 text-xs text-center text-gray-400">
                       AI can make mistakes. Please review generated workflows.
                   </div>
             </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};