import React, { useState, useEffect } from 'react';
import { 
  X, Save, Plus, Type, Info, Eye, Edit3, User, 
  Calendar, Mail, Bold, Italic, Underline, Link, 
  List, ListOrdered, AlignLeft, AlignCenter, MoreHorizontal,
  Smartphone, Monitor, ChevronLeft, Hexagon
} from 'lucide-react';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: { subject: string; content: string }) => void;
  initialSubject: string;
  initialContent: string;
}

const VARIABLES = [
  { label: 'Patient Name', value: '{patient_name}', icon: User },
  { label: 'Order ID', value: '{order_id}', icon: List },
  { label: 'Appointment Date', value: '{appointment_date}', icon: Calendar },
  { label: 'Portal Link', value: '{portal_link}', icon: Link },
  { label: 'Provider Name', value: '{provider_name}', icon: User },
  { label: 'Clinic Name', value: '{clinic_name}', icon: Type },
  { label: 'Action Link', value: '{link}', icon: Link },
];

const DUMMY_DATA: Record<string, string> = {
  '{patient_name}': 'Sarah Jenkins',
  '{order_id}': '2024102401',
  '{appointment_date}': 'October 24, 2024 at 2:00 PM',
  '{portal_link}': 'https://portal.vibrant.com/patient/login',
  '{provider_name}': 'Dr. Emily Chen',
  '{clinic_name}': 'Vibrant Health Clinic',
  '{link}': 'https://vibrant.com/forms/q/882'
};

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
  initialContent
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Reset state when modal opens with new props
  useEffect(() => {
    if (isOpen) {
      setSubject(initialSubject);
      setContent(initialContent);
      setViewMode('edit');
    }
  }, [isOpen, initialSubject, initialContent]);

  const handleInsertVariable = (variable: string) => {
    setContent(prev => prev + ' ' + variable);
  };

  const getPreviewText = (text: string) => {
    let preview = text;
    Object.entries(DUMMY_DATA).forEach(([key, value]) => {
      // Escape braces for regex
      const regex = new RegExp(key, 'g');
      preview = preview.replace(regex, value);
    });
    return preview;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
        
        {/* Header - Improved */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-indigo-100">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Email Template Editor</h2>
              <p className="text-xs text-slate-500 font-medium">Design automated patient communications</p>
            </div>
          </div>
          
          {/* Segmented Control for View Toggle */}
          <div className="bg-slate-100/80 p-1 rounded-lg flex items-center border border-slate-200/50">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'edit' 
                  ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Edit3 size={14} /> Editor
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'preview' 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Eye size={14} /> Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden bg-slate-50/50 relative">
          
          {viewMode === 'edit' ? (
            <>
              {/* Main Editor Area */}
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                
                {/* Subject Line */}
                <div className="px-8 pt-8 pb-4 shrink-0">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 text-base font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow placeholder-slate-300"
                    placeholder="e.g. Your Test Results are Ready"
                  />
                </div>

                {/* Rich Text Editor Simulation */}
                <div className="flex-1 px-8 pb-8 flex flex-col min-h-0">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Email Content
                  </label>
                  
                  <div className="flex-1 border border-slate-200 rounded-lg flex flex-col bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
                    {/* Toolbar */}
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1 shrink-0">
                        <ToolbarButton icon={Bold} />
                        <ToolbarButton icon={Italic} />
                        <ToolbarButton icon={Underline} />
                        <div className="w-px h-4 bg-slate-300 mx-2" />
                        <ToolbarButton icon={AlignLeft} active />
                        <ToolbarButton icon={AlignCenter} />
                        <div className="w-px h-4 bg-slate-300 mx-2" />
                        <ToolbarButton icon={List} />
                        <ToolbarButton icon={ListOrdered} />
                        <div className="w-px h-4 bg-slate-300 mx-2" />
                        <ToolbarButton icon={Link} />
                        <div className="flex-1" />
                        <span className="text-xs text-slate-400 font-medium px-2">Rich Text</span>
                    </div>

                    {/* Textarea */}
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="flex-1 w-full p-4 text-sm outline-none resize-none font-sans text-slate-700 leading-relaxed"
                      placeholder="Type your email content here..."
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar: Variables */}
              <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0">
                <div className="p-5 border-b border-slate-200/60">
                   <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <Type size={16} className="text-indigo-500"/>
                     Dynamic Variables
                   </h3>
                   <p className="text-xs text-slate-500 mt-1">
                     Click to insert patient-specific data placeholders.
                   </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {VARIABLES.map((v) => {
                    const Icon = v.icon;
                    return (
                        <button
                        key={v.value}
                        onClick={() => handleInsertVariable(v.value)}
                        className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm hover:bg-indigo-50/30 transition-all group text-left"
                        >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                <Icon size={14} />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-slate-700 block">{v.label}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{v.value}</span>
                            </div>
                        </div>
                        <Plus size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110" />
                        </button>
                    )
                  })}

                  <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="flex gap-2">
                        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-blue-800 mb-1">Did you know?</h4>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Variables are replaced with real data when the email is sent. Always preview to verify formatting.
                            </p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // PREVIEW MODE
            <div className="flex-1 flex flex-col items-center bg-slate-100 relative overflow-hidden">
               
               {/* Device Toggle */}
               <div className="absolute top-6 flex items-center bg-white rounded-full p-1 shadow-sm border border-slate-200 z-10">
                  <button 
                     onClick={() => setPreviewDevice('desktop')}
                     className={`p-2 rounded-full transition-all ${previewDevice === 'desktop' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <Monitor size={18} />
                  </button>
                  <button 
                     onClick={() => setPreviewDevice('mobile')}
                     className={`p-2 rounded-full transition-all ${previewDevice === 'mobile' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <Smartphone size={18} />
                  </button>
               </div>

               <div className="flex-1 w-full overflow-y-auto p-4 md:p-8 flex justify-center pt-20">
                  <div className={`
                      bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300
                      ${previewDevice === 'mobile' ? 'w-[375px] min-h-[600px] max-h-[750px]' : 'w-full max-w-4xl min-h-[600px] h-fit'}
                  `}>
                      {/* Fake Email Client Header */}
                      <div className="bg-white border-b border-slate-100 p-5 space-y-4 z-10 relative">
                         <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                               <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  VH
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-slate-900">Vibrant Health Clinic</div>
                                  <div className="text-xs text-slate-500">to Sarah Jenkins &lt;s.jenkins@example.com&gt;</div>
                               </div>
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                               {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>
                         
                         <div className="pt-1">
                            <div className="text-lg font-bold text-slate-900 leading-tight">
                               {getPreviewText(subject) || <span className="text-slate-300 italic">No subject line</span>}
                            </div>
                         </div>
                      </div>

                      {/* Transactional Email Body Simulation */}
                      <div className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto">
                        <div className="max-w-[600px] mx-auto bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            {/* Brand Header */}
                            <div className="bg-[#0F4C81] px-8 py-6 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg text-white mb-2">
                                  <Hexagon size={24} fill="currentColor" className="text-white"/>
                                </div>
                                <h3 className="text-white font-bold text-lg tracking-wide">Vibrant Health</h3>
                            </div>

                            {/* Main Content */}
                            <div className="p-8 text-slate-700 text-[15px] leading-7 whitespace-pre-wrap font-sans">
                              {content ? getPreviewText(content) : <span className="text-slate-300 italic">No content entered...</span>}
                              
                              {/* Smart Button - Shown if link variables exist */}
                              {(content.includes('{link}') || content.includes('{portal_link}')) && (
                                  <div className="mt-8 text-center">
                                      <button className="bg-[#0F4C81] text-white font-bold py-3 px-8 rounded-md shadow-sm hover:bg-[#09355E] text-sm pointer-events-none transition-colors">
                                          View Details &rarr;
                                      </button>
                                      <p className="text-xs text-slate-400 mt-4 max-w-xs mx-auto">
                                          If the button doesn't work, verify the link in your patient portal.
                                      </p>
                                  </div>
                              )}
                            </div>

                            {/* Transactional Footer */}
                            <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
                                <p className="text-xs text-slate-500 mb-4">
                                    Questions? Contact our support team at <span className="text-[#0F4C81] font-medium">support@vibrant.com</span>
                                </p>
                                <div className="flex justify-center gap-4 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                    <span>Unsubscribe</span>
                                    <span>Privacy Policy</span>
                                    <span>Help Center</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                                    &copy; {new Date().getFullYear()} Vibrant Health Clinic.<br/>
                                    This email was sent to you regarding your recent activity.
                                </p>
                            </div>
                        </div>
                      </div>
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0 z-20">
           <div className="text-xs text-slate-400 font-medium">
              {viewMode === 'edit' ? 'Unsaved changes' : 'Preview Mode - Not actual email'}
           </div>
           <div className="flex gap-3">
            <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={() => {
                onSave({ subject, content });
                onClose();
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
                <Save size={16} />
                Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const ToolbarButton: React.FC<{ icon: any, active?: boolean }> = ({ icon: Icon, active }) => (
    <button className={`
        p-1.5 rounded hover:bg-slate-200 text-slate-500 transition-colors
        ${active ? 'bg-slate-200 text-slate-800' : ''}
    `}>
        <Icon size={14} strokeWidth={2.5} />
    </button>
);
