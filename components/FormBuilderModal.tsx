import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Sparkles, Plus, Trash2, Settings2
} from 'lucide-react';

interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
}

type FieldType = 
  // Basic - Layout
  | 'section_header' | 'company_header' | 'note' | 'image' | 'rich_text'
  // Basic - Text Inputs
  | 'short_text' | 'long_text' | 'email' | 'phone' | 'number'
  // Basic - Choice
  | 'single_choice' | 'multi_choice' | 'checkbox' | 'dropdown' | 'yes_no'
  // Basic - Date/Time
  | 'date' | 'datetime' | 'time'
  // Basic - Advanced
  | 'rating' | 'signature'
  // Composite
  | 'personal_info' | 'insurance' | 'medication' | 'vitals' | 'payment' | 'agreement' | 'custom';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  rows?: number;
}

const INITIAL_FIELDS: FormField[] = [
  { id: 'f1', type: 'company_header', label: 'Your Company Name' },
  { id: 'f2', type: 'section_header', label: 'Symptom Questionnaire', description: 'Please help us understand your symptoms by answering the questions below.' },
  { id: 'f3', type: 'long_text', label: 'What is the main reason for your visit today? Please describe your primary symptom.', required: true },
  { id: 'f4', type: 'date', label: 'When did your symptoms begin?', required: true, placeholder: 'mm/dd/yyyy' },
  { id: 'f5', type: 'single_choice', label: 'How often do you experience these symptoms?', required: false, options: ['Constant (always present)', 'Frequent (several times a day)', 'Intermittent (comes and goes)', 'Occasional (a few times a week or less)'] },
  { id: 'f6', type: 'vitals', label: 'Vitals Check' } // Demo of new composite
];

export const FormBuilderModal: React.FC<FormBuilderModalProps> = ({ isOpen, onClose, documentName }) => {
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('f5');
  const [activeTab, setActiveTab] = useState<'properties' | 'mappings'>('properties');

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: getDefaultLabel(type),
      options: ['single_choice', 'multi_choice', 'dropdown'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const getDefaultLabel = (type: FieldType): string => {
    switch(type) {
        case 'section_header': return 'New Section';
        case 'company_header': return 'Company Header';
        case 'note': return 'Information Note';
        case 'rich_text': return 'Instructions';
        case 'short_text': return 'Short Answer';
        case 'long_text': return 'Long Answer';
        case 'yes_no': return 'Yes/No Question';
        case 'agreement': return 'Universal Agreement';
        case 'personal_info': return 'Personal Information';
        case 'insurance': return 'Health Insurance';
        case 'vitals': return 'Vitals';
        default: return `New ${type.replace(/_/g, ' ')}`;
    }
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDeleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleOptionChange = (idx: number, val: string) => {
    if (!selectedField || !selectedField.options) return;
    const newOptions = [...selectedField.options];
    newOptions[idx] = val;
    handleUpdateField(selectedField.id, { options: newOptions });
  };

  const handleAddOption = () => {
    if (!selectedField || !selectedField.options) return;
    handleUpdateField(selectedField.id, { options: [...selectedField.options, `Option ${selectedField.options.length + 1}`] });
  };

  const handleDeleteOption = (idx: number) => {
    if (!selectedField || !selectedField.options) return;
    const newOptions = selectedField.options.filter((_, i) => i !== idx);
    handleUpdateField(selectedField.id, { options: newOptions });
  };

  const checkReducedMotion = () => {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: checkReducedMotion() ? 0 : 0.2 }}
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            duration: checkReducedMotion() ? 0 : undefined
          }}
          className="bg-slate-50 w-full max-w-[1400px] h-[90vh] rounded-xl shadow-2xl flex overflow-hidden border border-slate-200"
        >
        
        {/* LEFT SIDEBAR: ELEMENTS */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
           <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Custom Elements</h3>
              <button 
                onClick={() => handleAddField('custom')}
                className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Plus size={16} /> Create Custom Bundle
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <Section title="Basic Elements">
                 <div className="space-y-4">
                    <Group title="Layout & Static">
                       <ElementButton emoji="📌" label="Section Header" onClick={() => handleAddField('section_header')} />
                       <ElementButton emoji="🏢" label="Company Header" onClick={() => handleAddField('company_header')} />
                       <ElementButton emoji="ℹ️" label="Note" onClick={() => handleAddField('note')} />
                       <ElementButton emoji="🖼️" label="Image" onClick={() => handleAddField('image')} />
                       <ElementButton emoji="📄" label="Rich Text Block" onClick={() => handleAddField('rich_text')} />
                    </Group>
                    <Group title="Text Inputs">
                       <ElementButton emoji="✏️" label="Short Response" onClick={() => handleAddField('short_text')} />
                       <ElementButton emoji="📝" label="Long Response" onClick={() => handleAddField('long_text')} />
                       <ElementButton emoji="📧" label="Email" onClick={() => handleAddField('email')} />
                       <ElementButton emoji="📱" label="Phone Number" onClick={() => handleAddField('phone')} />
                       <ElementButton emoji="🔢" label="Numeric Field" onClick={() => handleAddField('number')} />
                    </Group>
                    <Group title="Choice & Selection">
                       <ElementButton emoji="🔘" label="Single Choice" onClick={() => handleAddField('single_choice')} />
                       <ElementButton emoji="☑️" label="Multi Choice" onClick={() => handleAddField('multi_choice')} />
                       <ElementButton emoji="✅" label="Checkbox" onClick={() => handleAddField('checkbox')} />
                       <ElementButton emoji="🔽" label="Dropdown" onClick={() => handleAddField('dropdown')} />
                       <ElementButton emoji="☯️" label="Yes/No Question" onClick={() => handleAddField('yes_no')} />
                    </Group>
                    <Group title="Date & Time">
                       <ElementButton emoji="📅" label="Date Picker" onClick={() => handleAddField('date')} />
                       <ElementButton emoji="📆" label="DateTime Picker" onClick={() => handleAddField('datetime')} />
                       <ElementButton emoji="⏰" label="Time Picker" onClick={() => handleAddField('time')} />
                    </Group>
                    <Group title="Advanced">
                       <ElementButton emoji="⭐" label="Rating Scale" onClick={() => handleAddField('rating')} />
                       <ElementButton emoji="✍️" label="Signature" onClick={() => handleAddField('signature')} />
                    </Group>
                 </div>
              </Section>

              <Section title="Composite Elements">
                 <div className="space-y-4">
                    <Group title="Clinical & Admin">
                       <ElementButton emoji="👤" label="Personal Info" onClick={() => handleAddField('personal_info')} />
                       <ElementButton emoji="💳" label="Health Insurance" onClick={() => handleAddField('insurance')} />
                       <ElementButton emoji="💊" label="Medication History" onClick={() => handleAddField('medication')} />
                       <ElementButton emoji="🩺" label="Vitals" onClick={() => handleAddField('vitals')} />
                       <ElementButton emoji="💲" label="Payment Details" onClick={() => handleAddField('payment')} />
                       <ElementButton emoji="📜" label="Universal Agreement" onClick={() => handleAddField('agreement')} />
                    </Group>
                 </div>
              </Section>
           </div>
        </div>

        {/* CENTER: CANVAS */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100/50">
           {/* Header */}
           <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{documentName || 'Untitled Form'}</h2>
              <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                    <Sparkles size={16} /> AI Assistant
                 </button>
                 <button 
                    onClick={onClose}
                    className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                 >
                    Save
                 </button>
              </div>
           </div>

           {/* Form Rendering Area */}
           <div className="flex-1 overflow-y-auto p-8">
              <div className="w-full max-w-3xl mx-auto bg-white min-h-[800px] shadow-sm border border-gray-200 rounded-lg p-8 space-y-6">
                 {fields.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                     <p>Click elements on the left to add them to your form</p>
                   </div>
                 )}
                 {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedFieldId(field.id)}
                      layout
                      className={`
                        relative group rounded-lg p-4 -mx-4 cursor-pointer transition-all border-2
                        ${selectedFieldId === field.id ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-gray-50'}
                      `}
                    >
                       <RenderField field={field} />
                       
                       {selectedFieldId === field.id && (
                         <div className="absolute right-2 top-2 flex gap-1">
                            <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteField(field.id); }}
                               className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                       )}
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT SIDEBAR: PROPERTIES */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
           <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('properties')}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Properties
              </button>
              <button 
                onClick={() => setActiveTab('mappings')}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'mappings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Mappings
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-6">
              {selectedField ? (
                 <div className="space-y-6">
                    {/* Common Properties */}
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Label</label>
                       <input 
                         type="text" 
                         value={selectedField.label}
                         onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                    
                    {['section_header', 'company_header'].includes(selectedField.type) && (
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description / Subtitle</label>
                          <textarea 
                            value={selectedField.description || ''}
                            onChange={(e) => handleUpdateField(selectedField.id, { description: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none h-20"
                          />
                       </div>
                    )}

                    {!['section_header', 'company_header', 'note', 'image', 'rich_text', 'agreement', 'vitals'].includes(selectedField.type) && (
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Help Text / Placeholder</label>
                           <input 
                             type="text" 
                             value={selectedField.placeholder || ''}
                             onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                             placeholder="Optional instructions for the user"
                             className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                    )}

                    {/* Options Editor */}
                    {(['single_choice', 'multi_choice', 'dropdown'].includes(selectedField.type)) && (
                       <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Options</label>
                          <div className="space-y-2">
                             {selectedField.options?.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                   <input 
                                      type="text"
                                      value={opt}
                                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-500 outline-none"
                                   />
                                   <button 
                                      onClick={() => handleDeleteOption(idx)}
                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             ))}
                             <button 
                                onClick={handleAddOption}
                                className="text-sm font-semibold text-blue-600 flex items-center gap-1 mt-2 hover:text-blue-800"
                             >
                                <Plus size={14} /> Add Option
                             </button>
                          </div>
                       </div>
                    )}

                    {/* Validation */}
                    {!['section_header', 'company_header', 'note', 'rich_text', 'image'].includes(selectedField.type) && (
                       <div className="pt-4 border-t border-gray-100">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input 
                                type="checkbox" 
                                checked={selectedField.required || false} 
                                onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" 
                             />
                             <span className="text-sm text-gray-700">Required Field</span>
                          </label>
                       </div>
                    )}
                 </div>
              ) : (
                 <div className="text-center text-gray-400 mt-10">
                    <Settings2 size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Select an element on the canvas to edit its properties</p>
                 </div>
              )}
           </div>
        </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Helper Components ---

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
     <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
     {children}
  </div>
);

const ElementButton: React.FC<{ emoji: string; label: string; onClick: () => void }> = ({ emoji, label, onClick }) => {
  const checkReducedMotion = () => {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  return (
    <motion.button
      whileHover={{ scale: checkReducedMotion() ? 1 : 1.02, x: checkReducedMotion() ? 0 : 4 }}
      whileTap={{ scale: checkReducedMotion() ? 1 : 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-left bg-gray-50 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-colors group"
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{label}</span>
    </motion.button>
  );
};

const RenderField: React.FC<{ field: FormField }> = ({ field }) => {
  const label = (
    <label className="block text-sm font-medium text-gray-900 mb-1.5">
       {field.label} {field.required && <span className="text-red-500">*</span>}
    </label>
  );

  switch (field.type) {
    // --- Layout & Static ---
    case 'company_header':
      return (
        <div className="text-center py-4 border-b-2 border-gray-100">
           <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">🏥</div>
           <h1 className="text-2xl font-bold text-gray-900">{field.label}</h1>
           <p className="text-sm text-gray-500">123 Health Street, Wellness City</p>
        </div>
      );
    case 'section_header':
      return (
        <div className="py-2 border-b border-gray-200 mb-2 mt-4">
           <h2 className="text-lg font-bold text-blue-700">{field.label}</h2>
           {field.description && <p className="text-sm text-gray-500 mt-1">{field.description}</p>}
        </div>
      );
    case 'note':
       return <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 flex gap-2"><span className="text-lg">ℹ️</span> {field.label}</div>;
    case 'image':
       return (
         <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <span className="text-2xl mb-2">🖼️</span>
            <span className="text-sm">Image Placeholder</span>
         </div>
       );
    case 'rich_text':
        return (
            <div className="border border-gray-200 rounded p-4 bg-gray-50 text-sm text-gray-600">
                <div className="mb-2 border-b border-gray-200 pb-2 flex gap-2 text-xs font-bold text-gray-400">
                    <span>B</span> <span>I</span> <span>U</span>
                </div>
                <p>Rich text content area...</p>
            </div>
        );

    // --- Inputs ---
    case 'short_text':
    case 'email':
    case 'phone':
    case 'number':
      return (
        <div>
           {label}
           <input disabled type="text" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder={field.placeholder || "Short answer text"} />
        </div>
      );
    case 'long_text':
      return (
        <div>
           {label}
           <textarea disabled className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm h-24 resize-none" placeholder={field.placeholder || "Long answer text"} />
        </div>
      );

    // --- Choice ---
    case 'single_choice':
    case 'multi_choice':
       return (
          <div>
             {label}
             <div className="space-y-2 mt-2">
                {field.options?.map((opt, i) => (
                   <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className={`w-4 h-4 border rounded ${field.type === 'single_choice' ? 'rounded-full' : 'rounded-sm'} border-gray-300`} />
                      {opt}
                   </div>
                ))}
             </div>
          </div>
       );
    case 'checkbox':
        return (
            <div className="flex items-center gap-2 pt-4">
                <div className="w-4 h-4 border border-gray-300 rounded bg-white"></div>
                <label className="text-sm font-medium text-gray-900">{field.label}</label>
            </div>
        );
    case 'dropdown':
        return (
            <div>
                {label}
                <div className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm flex justify-between items-center text-gray-500">
                    <span>Select an option...</span>
                    <span>▼</span>
                </div>
            </div>
        );
    case 'yes_no':
        return (
            <div>
                {label}
                <div className="flex gap-2 mt-1">
                    <button className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">Yes</button>
                    <button className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">No</button>
                </div>
            </div>
        );

    // --- Date/Time ---
    case 'date':
    case 'datetime':
    case 'time':
       return (
        <div>
           {label}
           <div className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm flex justify-between items-center text-gray-400">
               <span>{field.placeholder || (field.type === 'time' ? '--:-- --' : 'mm/dd/yyyy')}</span>
               <span>{field.type === 'time' ? '⏰' : '📅'}</span>
           </div>
        </div>
       );
    
    // --- Advanced ---
    case 'rating':
        return (
            <div>
                {label}
                <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm font-medium hover:bg-gray-50 cursor-pointer">{n}</div>
                    ))}
                </div>
            </div>
        );
    case 'signature':
        return (
            <div>
                {label}
                <div className="border border-gray-300 rounded bg-gray-50 h-24 relative mt-1">
                    <div className="absolute bottom-4 left-4 right-4 border-b border-gray-400"></div>
                    <span className="absolute top-2 left-2 text-xs text-gray-400">Sign here</span>
                </div>
            </div>
        );
    
    // --- Composites ---
    case 'personal_info':
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">👤 {field.label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="First Name" />
                    <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Last Name" />
                    <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Date of Birth" />
                    <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Gender" />
                </div>
            </div>
        );
    case 'insurance':
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">💳 {field.label}</h4>
                <div className="space-y-3">
                    <input disabled type="text" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Insurance Provider" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Member ID" />
                        <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Group ID" />
                    </div>
                </div>
            </div>
        );
    case 'medication':
         return (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">💊 {field.label}</h4>
                <div className="bg-white border border-gray-200 rounded p-3 text-center text-sm text-gray-500">
                    + Add Medication Entry
                </div>
            </div>
         );
    case 'vitals':
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">🩺 {field.label}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="text-center"><label className="text-xs block text-gray-500 mb-1">Height (cm)</label><input disabled className="w-full bg-white border border-gray-300 rounded p-1" /></div>
                    <div className="text-center"><label className="text-xs block text-gray-500 mb-1">Weight (kg)</label><input disabled className="w-full bg-white border border-gray-300 rounded p-1" /></div>
                    <div className="text-center"><label className="text-xs block text-gray-500 mb-1">BP (mmHg)</label><input disabled className="w-full bg-white border border-gray-300 rounded p-1" /></div>
                    <div className="text-center"><label className="text-xs block text-gray-500 mb-1">HR (bpm)</label><input disabled className="w-full bg-white border border-gray-300 rounded p-1" /></div>
                    <div className="text-center"><label className="text-xs block text-gray-500 mb-1">Temp (°C)</label><input disabled className="w-full bg-white border border-gray-300 rounded p-1" /></div>
                    <div className="text-center"><label className="text-xs block text-gray-500 mb-1">SpO2 (%)</label><input disabled className="w-full bg-white border border-gray-300 rounded p-1" /></div>
                </div>
            </div>
        );
    case 'payment':
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">💲 {field.label}</h4>
                <div className="space-y-3">
                    <input disabled type="text" className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Card Number" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="MM/YY" />
                        <input disabled type="text" className="bg-white border border-gray-300 rounded px-3 py-2 text-sm" placeholder="CVC" />
                    </div>
                </div>
            </div>
        );
    case 'agreement':
        return (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">📜 {field.label}</h4>
                <div className="h-24 bg-white border border-gray-300 rounded p-2 text-xs text-gray-500 overflow-y-scroll mb-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <input type="checkbox" disabled className="rounded border-gray-300" />
                    <span className="text-sm">I have read and agree to the terms.</span>
                </div>
                <div className="border border-gray-300 rounded bg-white h-16 relative">
                    <span className="absolute bottom-2 left-2 text-xs text-gray-400">Signature</span>
                </div>
            </div>
        );
    case 'custom':
        return (
            <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg p-4 flex items-center justify-center text-blue-600 font-medium">
                🧩 Custom Element Bundle
            </div>
        );

    default:
       return <div>{label}</div>;
  }
};
