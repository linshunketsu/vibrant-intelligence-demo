import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FormField, FormFieldType, PersonalInfoSelection, FormTemplate, MedicationHistorySelection, HealthInsuranceSelection, EHRMapping, VitalsSelection, PaymentDetailsSelection, CustomElement, UniversalAgreementSelection } from '../types';
import { TOOLBOX_CATEGORIES, PRIMITIVE_TOOLBOX_CATEGORIES, personalInfoLabels, medicationHistoryLabels, healthInsuranceLabels, vitalsLabels, paymentDetailsLabels, EHR_FIELD_PATHS, DEFAULT_SUBFIELD_MAPPINGS, DEFAULT_FIELD_TYPE_MAPPINGS } from '../constants';
import { TrashIcon } from '../components/icons/TrashIcon';
import { RenderedFormComponent } from '../components/RenderedFormComponent';
import { generateFormWithAI, suggestEHRMappings, EHRMappingSuggestion } from '../services/geminiService';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { XIcon } from '../components/icons/XIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ClockIcon } from '../components/icons/ClockIcon';
import { LinkIcon } from '../components/icons/LinkIcon';
import SuggestionReviewModal from '../components/SuggestionReviewModal';
import { BuildingOfficeIcon } from '../components/icons/BuildingOfficeIcon';

interface ManualComposerProps {
  initialFields: FormField[];
  onSaveForm: (form: FormTemplate) => void;
  editingFormId: string | null;
  existingForms: FormTemplate[];
  customElements: CustomElement[];
  onSaveCustomElement: (element: CustomElement) => void;
  onDeleteCustomElement: (elementId: string) => void;
}

const DropIndicator: React.FC = () => {
  return <div className="my-1 h-1 w-full rounded-full bg-primary-400" />;
};

interface AiAssistantPanelProps {
    onClose: () => void;
    onGenerated: (fields: FormField[]) => void;
    existingFields: FormField[];
    mode: ComposerMode;
}

const purposeOptions = [
    { value: 'New Patient Intake', label: 'Intake', icon: <UserIcon className="h-4 w-4" /> },
    { value: 'Telehealth Consent', label: 'Consent', icon: <ShieldCheckIcon className="h-4 w-4" /> },
    { value: 'Medical History Update', label: 'Update', icon: <ClockIcon className="h-4 w-4" /> },
    { value: 'Custom', label: 'Custom', icon: <SparklesIcon className="h-4 w-4" /> },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ onClose, onGenerated, existingFields, mode }) => {
    const isFormMode = mode === 'form';
    const [formPurpose, setFormPurpose] = useState<string>(isFormMode ? 'New Patient Intake' : 'Reusable component');
    const [formDescription, setFormDescription] = useState<string>(isFormMode ? 'A standard form for new patients. It should include sections for personal information (name, DOB, address), medical history (allergies, current medications), and insurance details.' : 'A component for capturing patient consent with a signature field.');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fields = await generateFormWithAI(formPurpose, formDescription, existingFields);
            onGenerated(fields);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <SparklesIcon /> AI Assistant
                </h3>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                    <XIcon />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                        1. What's the purpose of the {isFormMode ? 'form' : 'component'}?
                    </label>
                    {isFormMode ? (
                        <div className="flex flex-wrap gap-2">
                            {purposeOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setFormPurpose(option.value)}
                                    className={`flex items-center gap-2 p-2 px-3 rounded-full border text-sm font-semibold transition-colors duration-150 ${
                                        formPurpose === option.value
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <input type="text" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm" />
                    )}
                </div>
                <div>
                    <label htmlFor="form-description" className="block text-sm font-semibold text-slate-800 mb-2">
                        2. Describe the {isFormMode ? 'form' : 'component'} in detail
                    </label>
                    <div className="relative">
                        <textarea
                            id="form-description"
                            rows={6}
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
                            placeholder="e.g., A post-operative follow-up for a knee replacement. Include fields for pain level, swelling, and any new symptoms."
                        />
                    </div>
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            </div>
            
            <div className="pt-4 border-t mt-auto flex-shrink-0">
                <button onClick={handleGenerate} disabled={isLoading || !formPurpose || !formDescription} className="w-full flex justify-center py-2 px-4 rounded-md font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400">
                    {isLoading ? 'Generating...' : 'Generate Fields'}
                </button>
            </div>
        </div>
    );
};

interface AiActionBarProps {
  fieldsToAddCount: number;
  fieldsToRemoveCount: number;
  onAccept: () => void;
  onReject: () => void;
}

const AiActionBar: React.FC<AiActionBarProps> = ({ 
    fieldsToAddCount,
    fieldsToRemoveCount,
    onAccept, 
    onReject
}) => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-2xl p-3 flex items-center gap-4 border border-slate-200 z-50">
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
                <span className="flex-shrink-0 bg-primary-100 text-primary-600 p-2 rounded-full"><SparklesIcon /></span>
                <div>
                    <p className="font-semibold text-slate-800">AI Suggestions Ready</p>
                    <p className="text-sm text-slate-500">
                        {fieldsToRemoveCount > 0 && <span className="text-red-600 font-medium">-{fieldsToRemoveCount} fields</span>}
                        {fieldsToRemoveCount > 0 && fieldsToAddCount > 0 && ', '}
                        {fieldsToAddCount > 0 && <span className="text-green-600 font-medium">+{fieldsToAddCount} fields</span>}
                        {fieldsToRemoveCount === 0 && fieldsToAddCount === 0 && 'No changes suggested.'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onAccept} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <CheckIcon className="h-4 w-4" /> Accept
                </button>
                <button onClick={onReject} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm flex items-center gap-2 hover:bg-slate-300 transition-colors">
                    <XIcon /> Reject
                </button>
            </div>
        </div>
    );
};


const RichTextPropertyEditor: React.FC<{ content: string; onChange: (newContent: string) => void }> = ({ content, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleContentChange = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleContentChange();
    };

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode; title: string }> = ({ onClick, children, title }) => (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded"
        >
            {children}
        </button>
    );

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <div className="border border-slate-300 rounded-md shadow-sm">
                <div className="p-1 bg-slate-100 border-b border-slate-300 flex items-center gap-1">
                    <ToolbarButton onClick={() => execCmd('bold')} title="Bold">
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8.21 13c2.1 0 3.42-1.55 3.42-3.65 0-1.32-.6-2.3-1.63-2.72.53-.38.85-1.08.85-1.88 0-1.6-1.03-2.75-2.8-2.75H4.2v11h4.01zm-1.07-4.65h.8c.88 0 1.43.58 1.43 1.4 0 .9-.6 1.5-1.5 1.5h-.73v-2.9zm.04-3.75h.68c.8 0 1.3.48 1.3 1.28 0 .8-.53 1.28-1.32 1.28h-.66V4.6z"></path></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCmd('italic')} title="Italic">
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M9.42 4.2h3.36l-2.74 8.6h-3.36l2.74-8.6z"></path></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCmd('underline')} title="Underline">
                         <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 11.3c2.1 0 3.7-1.42 3.7-3.48V3.2H9.8v4.65c0 .8-.43 1.25-1.25 1.25-.82 0-1.25-.45-1.25-1.25V3.2H5.4v4.62c0 2.06 1.6 3.48 3.7 3.48zM4.2 13.8V12.5h8.6v1.3H4.2z"></path></svg>
                    </ToolbarButton>
                    <div className="w-[1px] h-5 bg-slate-300 mx-1"></div>
                    <ToolbarButton onClick={() => execCmd('insertUnorderedList')} title="Unordered List">
                       <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 4a.5.5 0 100-1 .5.5 0 000 1zm0 4a.5.5 0 100-1 .5.5 0 000 1zm0 4a.5.5 0 100-1 .5.5 0 000 1zm2-8.5h9a.5.5 0 000-1h-9a.5.5 0 000 1zm0 4h9a.5.5 0 000-1h-9a.5.5 0 000 1zm0 4h9a.5.5 0 000-1h-9a.5.5 0 000 1z"></path></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => execCmd('insertOrderedList')} title="Ordered List">
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M2.39 3.14l-1 1.5A.5.5 0 001.5 5h1a.5.5 0 00.4-.8l-1-1.5a.5.5 0 00-.51-.06zM5.5 4.5a.5.5 0 00-1 0v1.64l-1.3-1.3a.5.5 0 00-.6.7l1.5 1.5a.5.5 0 00.8-.4V4.5zM2.5 8.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm-1-1.44a.5.5 0 00.56.06l1.5-1a.5.5 0 00-.56-.87l-1.5 1a.5.5 0 000 .81zM2.5 12.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm-1.06-1.11a.5.5 0 00.56.06l1.5-1a.5.5 0 00-.56-.87l-1.5 1a.5.5 0 000 .81z"></path></svg>
                    </ToolbarButton>
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleContentChange}
                    onBlur={handleContentChange}
                    className="p-3 min-h-[150px] text-sm focus:outline-none"
                />
            </div>
        </div>
    );
};


type MappableItem = {
    formFieldId: string;
    subFieldKey?: string;
    label: string;
};

type ComposerMode = 'form' | 'customElement';

interface LogoUploaderProps {
    logoSrc: string | undefined;
    onChange: (base64: string) => void;
    onRemove: () => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ logoSrc, onChange, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onChange(e.target?.result as string);
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files)}
                accept="image/png, image/jpeg, image/svg+xml, image/gif"
                className="hidden"
            />
            <div className="mt-1 flex items-center gap-4">
                <div className="h-20 w-20 bg-slate-100 rounded-md flex items-center justify-center border border-slate-300">
                    {logoSrc ? (
                        <img src={logoSrc} alt="Logo preview" className="h-full w-full object-contain p-1" />
                    ) : (
                        <BuildingOfficeIcon className="h-10 w-10 text-slate-400" />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={triggerFileSelect}
                        className="text-sm font-semibold bg-white border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-50"
                    >
                        {logoSrc ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    {logoSrc && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ManualComposer: React.FC<ManualComposerProps> = ({ initialFields, onSaveForm, editingFormId, existingForms, customElements, onSaveCustomElement, onDeleteCustomElement }) => {
  const existingForm = editingFormId ? existingForms.find(f => f.id === editingFormId) : null;

  // Global state
  const [composerMode, setComposerMode] = useState<ComposerMode>('form');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [proposedAiFields, setProposedAiFields] = useState<FormField[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSidePanelTab, setActiveSidePanelTab] = useState<'properties' | 'mappings'>('properties');
  const [suggestionToReview, setSuggestionToReview] = useState<EHRMappingSuggestion | null>(null);
  
  // Form-specific state
  const [formFields, setFormFields] = useState<FormField[]>(initialFields);
  const [formName, setFormName] = useState<string>(existingForm ? existingForm.title : 'Untitled Form');
  const [formMappings, setFormMappings] = useState<EHRMapping[]>(existingForm?.mappings || []);
  
  // Custom Element-specific state
  const [customElementFields, setCustomElementFields] = useState<FormField[]>([]);
  const [customElementName, setCustomElementName] = useState('');
  const [customElementEmoji, setCustomElementEmoji] = useState('🧩');
  const [customElementMappings, setCustomElementMappings] = useState<EHRMapping[]>([]);
  
  // Mode-aware variables
  const isFormMode = composerMode === 'form';
  const fields = isFormMode ? formFields : customElementFields;
  const setFields = isFormMode ? setFormFields : setCustomElementFields;
  const currentMappings = isFormMode ? formMappings : customElementMappings;
  const setCurrentMappings = isFormMode ? setFormMappings : setCustomElementMappings;

  const [suggestedMappings, setSuggestedMappings] = useState<EHRMappingSuggestion[]>([]);
  const [dismissedSuggestionKeys, setDismissedSuggestionKeys] = useState<Set<string>>(new Set());
  const [analyzingMappingKeys, setAnalyzingMappingKeys] = useState<Set<string>>(new Set());
  
  const allToolboxElements = (isFormMode ? TOOLBOX_CATEGORIES : PRIMITIVE_TOOLBOX_CATEGORIES).flatMap(category => category.elements);

  const debouncedFields = useDebounce(fields, 1000);
  const previousDebouncedFields = useRef<FormField[]>([]);


  useEffect(() => {
    // When a field is selected, always show its properties
    if (selectedFieldId) {
        setActiveSidePanelTab('properties');
    }
  }, [selectedFieldId]);

  // Optimized real-time mapping suggestions effect
  useEffect(() => {
    const fetchSuggestions = async () => {
        const prevFieldsMap = new Map(previousDebouncedFields.current.map(f => [f.id, f]));
        const currentFieldsMap = new Map(debouncedFields.map(f => [f.id, f]));

        const fieldsToAnalyze: FormField[] = [];

        for (const [id, currentField] of currentFieldsMap.entries()) {
            const prevField = prevFieldsMap.get(id);

            if (!prevField) {
                // Field is new, always analyze.
                fieldsToAnalyze.push(currentField);
                continue;
            }

            // Field exists, check for relevant changes that affect mapping.
            let needsAnalysis = false;
            if (prevField.label !== currentField.label) {
                needsAnalysis = true;
            } else {
                // Check if the selection of sub-fields within a composite field has changed.
                const compositeFieldConfigs: (keyof FormField)[] = ['personalInfo', 'healthInsurance', 'medicationHistory', 'vitals'];
                for (const key of compositeFieldConfigs) {
                    // Use JSON.stringify for a simple deep comparison of the selection objects.
                    if (JSON.stringify(prevField[key]) !== JSON.stringify(currentField[key])) {
                        needsAnalysis = true;
                        break;
                    }
                }
            }

            if (needsAnalysis) {
                fieldsToAnalyze.push(currentField);

                // If a field's mappable properties change, we should allow new suggestions
                // by removing it from the "dismissed" list.
                setDismissedSuggestionKeys(prev => {
                    const newSet = new Set(prev);
                    let changed = false;
                    const items = getMappableItems([currentField]);
                    items.forEach(item => {
                        const itemKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
                        if (newSet.has(itemKey)) {
                            newSet.delete(itemKey);
                            changed = true;
                        }
                    });
                    return changed ? newSet : prev;
                });
            }
        }

        // Update the ref for the next render cycle.
        previousDebouncedFields.current = debouncedFields;

        // Cleanup suggestions for fields that were deleted.
        if (debouncedFields.length < prevFieldsMap.size) {
            setSuggestedMappings(prev => prev.filter(sug => currentFieldsMap.has(sug.formFieldId)));
        }
        
        if (fieldsToAnalyze.length === 0) {
            return;
        }

        const confirmedMappingKeys = new Set(currentMappings.map(m => m.subFieldKey ? `${m.formFieldId}-${m.subFieldKey}` : m.formFieldId));
        const existingSuggestionKeys = new Set(suggestedMappings.map(s => s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId));

        const fieldsToSuggestFor = fieldsToAnalyze.filter(field => {
            const fieldMappableItems = getMappableItems([field]);
            if (fieldMappableItems.length === 0) return false;

            return fieldMappableItems.some(item => {
                const key = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
                return !confirmedMappingKeys.has(key) && !dismissedSuggestionKeys.has(key) && !existingSuggestionKeys.has(key);
            });
        });

        if (fieldsToSuggestFor.length === 0) {
            return;
        }

        const keysToAnalyze = new Set<string>();
        const mappableItemsToAnalyze = getMappableItems(fieldsToSuggestFor);
        mappableItemsToAnalyze.forEach(item => {
            const key = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
            if (!confirmedMappingKeys.has(key) && !dismissedSuggestionKeys.has(key) && !existingSuggestionKeys.has(key)) {
                keysToAnalyze.add(key);
            }
        });
        setAnalyzingMappingKeys(prev => new Set([...prev, ...keysToAnalyze]));

        try {
            const newSuggestions = await suggestEHRMappings(fieldsToSuggestFor);
            setSuggestedMappings(prev => {
                const updatedSuggestions = [...prev];
                const currentSuggestionKeys = new Set(prev.map(s => s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId));

                newSuggestions.forEach(newSug => {
                    const key = newSug.subFieldKey ? `${newSug.formFieldId}-${newSug.subFieldKey}` : newSug.formFieldId;
                    if (!currentSuggestionKeys.has(key) && !dismissedSuggestionKeys.has(key) && !confirmedMappingKeys.has(key)) {
                        updatedSuggestions.push(newSug);
                    }
                });
                return updatedSuggestions.filter(sug => currentFieldsMap.has(sug.formFieldId));
            });
        } catch (error) {
            console.error("Failed to get mapping suggestions:", error);
        } finally {
            setAnalyzingMappingKeys(prev => {
                const newSet = new Set(prev);
                keysToAnalyze.forEach(key => newSet.delete(key));
                return newSet;
            });
        }
    };

    fetchSuggestions();
}, [debouncedFields, currentMappings, composerMode, dismissedSuggestionKeys, suggestedMappings]);


  const canDragAndDrop = !proposedAiFields;

  const { fieldsToAdd, fieldIdsToRemove } = useMemo(() => {
    if (!proposedAiFields) {
      return { fieldsToAdd: [], fieldIdsToRemove: new Set<string>() };
    }

    const existingFieldIds = new Set(fields.map(f => f.id));
    const newFieldIds = new Set(proposedAiFields.map(f => f.id));

    const toAdd = proposedAiFields.filter(f => !existingFieldIds.has(f.id));
    const toRemove = new Set(fields.filter(f => !newFieldIds.has(f.id)).map(f => f.id));

    return { fieldsToAdd: toAdd, fieldIdsToRemove: toRemove };
  }, [fields, proposedAiFields]);

  const addFields = (fieldsToAdd: FormField[], index: number) => {
    setFields(prev => {
      const newFields = [...prev];
      newFields.splice(index, 0, ...fieldsToAdd);
      return newFields;
    });
    setSelectedFieldId(null);
  };

  const addFieldAtIndex = (type: FormFieldType, label: string, index: number) => {
    const newField: FormField = {
      id: `${type.toLowerCase()}_${Date.now()}`,
      type,
      label,
      required: false,
    };

    switch (type) {
      case FormFieldType.COMPANY_HEADER:
        newField.label = 'Your Company Name';
        break;
      case FormFieldType.RADIO_GROUP:
      case FormFieldType.CHECKBOX_GROUP:
      case FormFieldType.DROPDOWN:
        newField.options = ['Option 1', 'Option 2'];
        break;
      case FormFieldType.TEXT_INPUT:
      case FormFieldType.TEXTAREA:
      case FormFieldType.EMAIL:
      case FormFieldType.PHONE:
        newField.placeholder = '';
        break;
      case FormFieldType.RICH_TEXT:
        newField.label = '<p>This is a formatted text block. You can edit this content in the properties panel.</p>';
        newField.required = false;
        break;
      case FormFieldType.RATING_SCALE:
        newField.ratingScale = 5;
        break;
      case FormFieldType.NOTE:
        newField.label = 'This is an instructional note for the user.';
        break;
      case FormFieldType.PERSONAL_INFO:
        newField.label = 'Patient Information';
        newField.personalInfo = {
          includeFullName: true,
          includePreferredName: true,
          includeMiddleName: true,
          includeGender: true,
          includePronouns: true,
          includeAddress: true,
          includeDOB: true,
          includeOccupation: true,
          includeReferralSource: true,
          includeRelationshipStatus: true,
          includeContactInfo: true,
        };
        break;
      case FormFieldType.MEDICATION_HISTORY:
        newField.label = 'Medication History';
        newField.medicationHistory = {
            includeProductName: true,
            includeDateRange: true,
            includeDosage: true,
            includeNotes: true,
        };
        break;
      case FormFieldType.HEALTH_INSURANCE:
        newField.label = 'Health Insurance Information';
        newField.healthInsurance = {
            includePolicyHolder: true,
            includePayerId: true,
            includeName: true,
            includeCoverageType: true,
            includeGender: true,
            includeMemberId: true,
            includeDob: true,
            includePlanId: true,
            includePhoneNumber: true,
            includeGroupId: true,
            includeAddress: true,
            includeCopay: true,
            includePayerName: true,
            includeDeductible: true,
        };
        break;
       case FormFieldType.VITALS:
        newField.label = 'Vitals & Measurements';
        newField.vitals = {
            includeHeight: true,
            includeWeight: true,
            includeBmi: true,
            includeBloodPressure: true,
            includeHeartRate: true,
            includeTemperature: true,
            includeRespiratoryRate: true,
            includeOxygenSaturation: true,
        };
        break;
      case FormFieldType.PAYMENT_DETAILS:
        newField.label = 'Payment Details';
        newField.paymentDetails = {
            includeCardDetails: true,
            includeBillingAddress: true,
        };
        break;
      case FormFieldType.NUMERIC:
        newField.placeholder = '0';
        newField.minValue = 0;
        newField.maxValue = 100;
        break;
      case FormFieldType.UNIVERSAL_AGREEMENT:
        newField.label = 'Agreement Title';
        newField.agreementText = 'Please paste your terms, conditions, or agreement text here. Users will be required to agree to this content before proceeding.';
        newField.universalAgreement = {
            includePrintedName: true,
            includeDate: true,
        };
        newField.required = true; // The checkbox part is always required.
        break;
    }
    
    const newMappings: EHRMapping[] = [];
    const defaultMapping = DEFAULT_FIELD_TYPE_MAPPINGS[type];

    if (defaultMapping) {
        newMappings.push({ formFieldId: newField.id, ehrField: defaultMapping });
    } else if (newField.type === FormFieldType.PERSONAL_INFO && newField.personalInfo) {
        for (const key in newField.personalInfo) {
            if (newField.personalInfo[key as keyof PersonalInfoSelection]) {
                const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
                if (ehrField) {
                    newMappings.push({ formFieldId: newField.id, subFieldKey: key, ehrField });
                }
            }
        }
    } else if (newField.type === FormFieldType.HEALTH_INSURANCE && newField.healthInsurance) {
        for (const key in newField.healthInsurance) {
            if (newField.healthInsurance[key as keyof HealthInsuranceSelection]) {
                const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
                if (ehrField) {
                    newMappings.push({ formFieldId: newField.id, subFieldKey: key, ehrField });
                }
            }
        }
    } else if (newField.type === FormFieldType.VITALS && newField.vitals) {
        for (const key in newField.vitals) {
            if (newField.vitals[key as keyof VitalsSelection]) {
                const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
                if (ehrField) {
                    newMappings.push({ formFieldId: newField.id, subFieldKey: key, ehrField });
                }
            }
        }
    }

    if (newMappings.length > 0) {
        setCurrentMappings(prev => [...prev, ...newMappings]);
    }

    setFields(prev => {
      const newFields = [...prev];
      newFields.splice(index, 0, newField);
      return newFields;
    });
    setSelectedFieldId(newField.id);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(field => field.id !== id));
    setCurrentMappings(prev => prev.filter(m => m.formFieldId !== id));
    setSuggestedMappings(prev => prev.filter(s => s.formFieldId !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };
  
  const updateField = (id: string, newProps: Partial<FormField>) => {
    setFields(prev => prev.map(field => field.id === id ? { ...field, ...newProps } : field));
  };
  
  const handleDragStart = (e: React.DragEvent, item: {type: FormFieldType} | {id: string} | {customElementId: string}) => {
    setIsDragging(true);
    if ('customElementId' in item) {
        e.dataTransfer.setData('customElementId', item.customElementId);
    } else if ('id' in item) {
      e.dataTransfer.setData('fieldId', item.id);
    } else {
      e.dataTransfer.setData('newFieldType', item.type);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging || !canDragAndDrop) return;

    const fieldElement = (e.target as HTMLElement).closest('[data-field-id]');
    
    if (fieldElement) {
        const id = fieldElement.getAttribute('data-field-id');
        const index = fields.findIndex(f => f.id === id);
        if (index === -1) return;

        const rect = fieldElement.getBoundingClientRect();
        const isAbove = e.clientY < rect.top + rect.height / 2;
        setDropIndicator(isAbove ? index : index + 1);
    } else if (fields.length === 0) {
        setDropIndicator(0);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndicator(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canDragAndDrop) return;
    
    const targetIndex = dropIndicator;
    handleDragEnd();

    if (targetIndex === null) return;
    
    const newFieldType = e.dataTransfer.getData('newFieldType') as FormFieldType;
    const fieldId = e.dataTransfer.getData('fieldId');
    const customElementId = e.dataTransfer.getData('customElementId');

    if (isFormMode && customElementId) {
        const customElement = customElements.find(c => c.id === customElementId);
        if (customElement) {
            const oldIdToNewIdMap: Record<string, string> = {};
            const newFieldsWithNewIds = customElement.fields.map(fieldTemplate => {
              // Ensure deep copy and type safety
              const newField = JSON.parse(JSON.stringify(fieldTemplate)) as FormField;
              const oldId = newField.id;
              const newId = `${newField.type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
              newField.id = newId;
              oldIdToNewIdMap[oldId] = newId;
              return newField;
            });

            addFields(newFieldsWithNewIds, targetIndex);
            
            if (customElement.mappings) {
                const newMappings = customElement.mappings.map(mapping => ({
                    ...mapping,
                    formFieldId: oldIdToNewIdMap[mapping.formFieldId],
                }));
                setFormMappings(prev => [...prev, ...newMappings]);
            }
        }
    } else if (newFieldType) {
        const tool = allToolboxElements.find(t => t.type === newFieldType);
        if (tool) {
            addFieldAtIndex(newFieldType, tool.label, targetIndex);
        }
    } else if (fieldId) {
        const draggedIndex = fields.findIndex(f => f.id === fieldId);
        if (draggedIndex === -1) return;

        const newFields = [...fields];
        const [draggedItem] = newFields.splice(draggedIndex, 1);
        const adjustedIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
        newFields.splice(adjustedIndex, 0, draggedItem);
        setFields(newFields);
    }
  };

  const handleTypeChange = (fieldId: string, newType: FormFieldType) => {
    const originalField = fields.find(f => f.id === fieldId);
    if (!originalField) return;

    const newField: FormField = {
      id: originalField.id,
      label: originalField.label,
      type: newType,
      required: originalField.required,
      helpText: originalField.helpText,
    };

    switch (newType) {
      case FormFieldType.RADIO_GROUP:
      case FormFieldType.CHECKBOX_GROUP:
      case FormFieldType.DROPDOWN:
        newField.options = originalField.options && originalField.options.length > 0 ? originalField.options : ['Option 1', 'Option 2'];
        break;
      
      case FormFieldType.TEXT_INPUT:
      case FormFieldType.TEXTAREA:
      case FormFieldType.EMAIL:
      case FormFieldType.PHONE:
        newField.placeholder = originalField.placeholder ?? '';
        break;

      case FormFieldType.RICH_TEXT:
        newField.label = `<p>${originalField.label}</p>`;
        newField.required = false;
        break;

      case FormFieldType.RATING_SCALE:
        newField.ratingScale = originalField.ratingScale ?? 5;
        break;
      
      case FormFieldType.NOTE:
        newField.label = originalField.label || 'This is an instructional note for the user.';
        newField.required = false; 
        break;

      case FormFieldType.PERSONAL_INFO:
        newField.label = originalField.label || 'Patient Information';
        newField.personalInfo = originalField.personalInfo || {
          includeFullName: true, includePreferredName: true, includeMiddleName: true,
          includeGender: true, includePronouns: true, includeAddress: true,
          includeDOB: true, includeOccupation: true, includeReferralSource: true,
          includeRelationshipStatus: true, includeContactInfo: true,
        };
        break;
        
      case FormFieldType.MEDICATION_HISTORY:
        newField.label = originalField.label || 'Medication History';
        newField.medicationHistory = originalField.medicationHistory || {
            includeProductName: true,
            includeDateRange: true,
            includeDosage: true,
            includeNotes: true,
        };
        break;
      
      case FormFieldType.HEALTH_INSURANCE:
        newField.label = originalField.label || 'Health Insurance Information';
        newField.healthInsurance = originalField.healthInsurance || {
            includePolicyHolder: true,
            includePayerId: true,
            includeName: true,
            includeCoverageType: true,
            includeGender: true,
            includeMemberId: true,
            includeDob: true,
            includePlanId: true,
            includePhoneNumber: true,
            includeGroupId: true,
            includeAddress: true,
            includeCopay: true,
            includePayerName: true,
            includeDeductible: true,
        };
        break;

      case FormFieldType.VITALS:
        newField.label = originalField.label || 'Vitals & Measurements';
        newField.vitals = originalField.vitals || {
            includeHeight: true,
            includeWeight: true,
            includeBmi: true,
            includeBloodPressure: true,
            includeHeartRate: true,
            includeTemperature: true,
            includeRespiratoryRate: true,
            includeOxygenSaturation: true,
        };
        break;
      
      case FormFieldType.PAYMENT_DETAILS:
        newField.label = originalField.label || 'Payment Details';
        newField.paymentDetails = originalField.paymentDetails || {
            includeCardDetails: true,
            includeBillingAddress: true,
        };
        break;

      case FormFieldType.NUMERIC:
        newField.placeholder = originalField.placeholder ?? '0';
        newField.minValue = originalField.minValue ?? 0;
        newField.maxValue = originalField.maxValue ?? 100;
        break;
      
      case FormFieldType.COMPANY_HEADER:
        newField.label = originalField.label || 'Your Company Name';
        newField.required = false;
        break;

      case FormFieldType.SECTION_HEADER:
      case FormFieldType.IMAGE:
        newField.required = false;
        break;
      case FormFieldType.UNIVERSAL_AGREEMENT:
        newField.label = originalField.label || 'Agreement Title';
        newField.agreementText = originalField.agreementText || 'Please paste your terms, conditions, or agreement text here.';
        newField.universalAgreement = originalField.universalAgreement || {
            includePrintedName: true,
            includeDate: true,
        };
        newField.required = true;
        break;
    }

    setFields(prev => prev.map(f => (f.id === fieldId ? newField : f)));
  };


  const handleSaveForm = () => {
    if (!formName.trim()) {
      alert('Please enter a name for the form before saving.');
      return;
    }

    setIsSaving(true);
    
    const form: FormTemplate = {
        id: editingFormId || `form_custom_${formName.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}`,
        title: formName.trim(),
        description: existingForm ? existingForm.description : 'A custom form created in the composer.',
        category: existingForm ? existingForm.category : 'Practice Forms',
        fields: formFields,
        mappings: formMappings,
    };

    onSaveForm(form);
  };
  
  const handleSaveCustomElement = () => {
    if (!customElementName.trim() || customElementFields.length === 0) {
      alert('Please provide a name and add at least one field.');
      return;
    }
    const newElement: CustomElement = {
      id: `custom_${Date.now()}`,
      name: customElementName.trim(),
      emoji: customElementEmoji || '🧩',
      fields: customElementFields,
      mappings: customElementMappings,
    };
    onSaveCustomElement(newElement);
    
    handleCancelCustomElement();
  };
  
  const handleCancelCustomElement = () => {
    setComposerMode('form');
    setCustomElementName('');
    setCustomElementEmoji('🧩');
    setCustomElementFields([]);
    setCustomElementMappings([]);
    setSelectedFieldId(null);
  };

  const handleStartCustomElementMode = () => {
    setComposerMode('customElement');
    setCustomElementName('');
    setCustomElementEmoji('🧩');
    setCustomElementFields([]);
    setCustomElementMappings([]);
    setSelectedFieldId(null);
    setIsAiAssistantOpen(false);
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const handleSubFieldToggle = (
    field: FormField,
    subFieldKey: string,
    isTurningOn: boolean,
    updatePayload: Partial<FormField>
  ) => {
    updateField(field.id, updatePayload);
  
    const ehrField = DEFAULT_SUBFIELD_MAPPINGS[subFieldKey];
    if (ehrField) {
      if (isTurningOn) {
        setCurrentMappings(prev => [...prev, { formFieldId: field.id, subFieldKey, ehrField }]);
      } else {
        setCurrentMappings(prev => prev.filter(m => !(m.formFieldId === field.id && m.subFieldKey === subFieldKey)));
      }
    }
  };

  const PersonalInfoProperties: React.FC<{field: FormField}> = ({field}) => {
    const { personalInfo } = field;
    if (!personalInfo) return null;

    const togglePersonalInfo = (key: keyof PersonalInfoSelection) => {
      const isTurningOn = !personalInfo[key];
      handleSubFieldToggle(field, key, isTurningOn, {
        personalInfo: { ...personalInfo, [key]: isTurningOn },
      });
    };

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Included Fields</label>
        <div className="space-y-2">
            {Object.keys(personalInfo).map((key) => {
                const typedKey = key as keyof PersonalInfoSelection;
                const label = personalInfoLabels[typedKey] || key;
                return (
                    <div key={key} className="flex items-center">
                        <input type="checkbox" checked={personalInfo[typedKey]} onChange={() => togglePersonalInfo(typedKey)} className="h-4 w-4 text-primary-600 border-slate-300 rounded" />
                        <label className="ml-2 block text-sm text-slate-900">{label}</label>
                    </div>
                );
            })}
        </div>
      </div>
    );
  };
  
  const MedicationHistoryProperties: React.FC<{field: FormField}> = ({field}) => {
    const { medicationHistory } = field;
    if (!medicationHistory) return null;

    const toggleMedicationHistory = (key: keyof MedicationHistorySelection) => {
      const isTurningOn = !medicationHistory[key];
      handleSubFieldToggle(field, key, isTurningOn, {
        medicationHistory: { ...medicationHistory, [key]: isTurningOn },
      });
    };

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Included Fields</label>
        <div className="space-y-2">
            {Object.keys(medicationHistory).map((key) => {
                const typedKey = key as keyof MedicationHistorySelection;
                const label = medicationHistoryLabels[typedKey] || key;
                return (
                    <div key={key} className="flex items-center">
                        <input type="checkbox" checked={medicationHistory[typedKey]} onChange={() => toggleMedicationHistory(typedKey)} className="h-4 w-4 text-primary-600 border-slate-300 rounded" />
                        <label className="ml-2 block text-sm text-slate-900">{label}</label>
                    </div>
                );
            })}
        </div>
      </div>
    );
  };

  const HealthInsuranceProperties: React.FC<{field: FormField}> = ({field}) => {
    const { healthInsurance } = field;
    if (!healthInsurance) return null;

    const toggleHealthInsurance = (key: keyof HealthInsuranceSelection) => {
      const isTurningOn = !healthInsurance[key];
      handleSubFieldToggle(field, key, isTurningOn, {
        healthInsurance: { ...healthInsurance, [key]: isTurningOn },
      });
    };

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Included Fields</label>
        <div className="space-y-2">
            {Object.keys(healthInsurance).map((key) => {
                const typedKey = key as keyof HealthInsuranceSelection;
                const label = healthInsuranceLabels[typedKey] || key;
                return (
                    <div key={key} className="flex items-center">
                        <input type="checkbox" checked={healthInsurance[typedKey]} onChange={() => toggleHealthInsurance(typedKey)} className="h-4 w-4 text-primary-600 border-slate-300 rounded" />
                        <label className="ml-2 block text-sm text-slate-900">{label}</label>
                    </div>
                );
            })}
        </div>
      </div>
    );
  };
  
  const VitalsProperties: React.FC<{field: FormField}> = ({field}) => {
    const { vitals } = field;
    if (!vitals) return null;

    const toggleVitals = (key: keyof VitalsSelection) => {
      const isTurningOn = !vitals[key];
      handleSubFieldToggle(field, key, isTurningOn, {
        vitals: { ...vitals, [key]: isTurningOn },
      });
    };

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Included Fields</label>
        <div className="space-y-2">
            {Object.keys(vitals).map((key) => {
                const typedKey = key as keyof VitalsSelection;
                const label = vitalsLabels[typedKey] || key;
                return (
                    <div key={key} className="flex items-center">
                        <input type="checkbox" checked={vitals[typedKey]} onChange={() => toggleVitals(typedKey)} className="h-4 w-4 text-primary-600 border-slate-300 rounded" />
                        <label className="ml-2 block text-sm text-slate-900">{label}</label>
                    </div>
                );
            })}
        </div>
      </div>
    );
  };

  const PaymentDetailsProperties: React.FC<{field: FormField}> = ({field}) => {
    const { paymentDetails } = field;
    if (!paymentDetails) return null;

    const togglePaymentDetails = (key: keyof PaymentDetailsSelection) => {
      updateField(field.id, {
        paymentDetails: {
          ...paymentDetails,
          [key]: !paymentDetails[key],
        },
      });
    };

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Included Fields</label>
        <div className="space-y-2">
            {Object.keys(paymentDetails).map((key) => {
                const typedKey = key as keyof PaymentDetailsSelection;
                const label = paymentDetailsLabels[typedKey] || key;
                return (
                    <div key={key} className="flex items-center">
                        <input type="checkbox" checked={paymentDetails[typedKey]} onChange={() => togglePaymentDetails(typedKey)} className="h-4 w-4 text-primary-600 border-slate-300 rounded" />
                        <label className="ml-2 block text-sm text-slate-900">{label}</label>
                    </div>
                );
            })}
        </div>
      </div>
    );
  };
  
  const UniversalAgreementProperties: React.FC<{field: FormField}> = ({field}) => {
    const { universalAgreement, agreementText } = field;
    if (!universalAgreement) return null;

    const toggleUniversalAgreement = (key: keyof UniversalAgreementSelection) => {
      updateField(field.id, {
        universalAgreement: { ...universalAgreement, [key]: !universalAgreement[key] },
      });
    };

    return (
      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-700">Agreement Text</label>
            <textarea 
                value={agreementText || ''} 
                onChange={e => updateField(field.id, { agreementText: e.target.value })} 
                className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" 
                rows={8} 
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Included Fields</label>
            <div className="space-y-2">
                <div className="flex items-center">
                    <input type="checkbox" checked={universalAgreement.includePrintedName} onChange={() => toggleUniversalAgreement('includePrintedName')} className="h-4 w-4 text-primary-600 border-slate-300 rounded" />
                    <label className="ml-2 block text-sm text-slate-900">Printed Name Input</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" checked={universalAgreement.includeDate} onChange={() => toggleUniversalAgreement('includeDate')} className="h-4 w-4 text-primary-600 border-slate-300 rounded" />
                    <label className="ml-2 block text-sm text-slate-900">Date Input</label>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const OptionsProperties: React.FC<{field: FormField}> = ({field}) => {
    const { options = [] } = field;

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        updateField(field.id, { options: newOptions });
    };

    const addOption = () => {
        const newOptions = [...options, `Option ${options.length + 1}`];
        updateField(field.id, { options: newOptions });
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        updateField(field.id, { options: newOptions });
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
            <div className="space-y-2">
                {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={option}
                            onChange={e => handleOptionChange(index, e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                            onClick={() => removeOption(index)}
                            className="p-1.5 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full flex-shrink-0"
                            aria-label={`Remove option`}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={addOption}
                className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Option
            </button>
        </div>
    );
  };
  
  const getMappableItems = (currentFields: FormField[]): MappableItem[] => {
    const items: MappableItem[] = [];
    currentFields.forEach(field => {
        if (field.type === FormFieldType.PERSONAL_INFO && field.personalInfo) {
            Object.keys(field.personalInfo).forEach(key => {
                const typedKey = key as keyof PersonalInfoSelection;
                if (field.personalInfo![typedKey]) {
                    items.push({ formFieldId: field.id, subFieldKey: typedKey, label: personalInfoLabels[typedKey] || typedKey });
                }
            });
        } else if (field.type === FormFieldType.HEALTH_INSURANCE && field.healthInsurance) {
            Object.keys(field.healthInsurance).forEach(key => {
                const typedKey = key as keyof HealthInsuranceSelection;
                if (field.healthInsurance![typedKey]) {
                    items.push({ formFieldId: field.id, subFieldKey: typedKey, label: healthInsuranceLabels[typedKey] || typedKey });
                }
            });
        } else if (field.type === FormFieldType.MEDICATION_HISTORY && field.medicationHistory) {
             Object.keys(field.medicationHistory).forEach(key => {
                const typedKey = key as keyof MedicationHistorySelection;
                if (field.medicationHistory![typedKey]) {
                    items.push({ formFieldId: field.id, subFieldKey: typedKey, label: medicationHistoryLabels[typedKey] || typedKey });
                }
            });
        } else if (field.type === FormFieldType.VITALS && field.vitals) {
             Object.keys(field.vitals).forEach(key => {
                const typedKey = key as keyof VitalsSelection;
                if (field.vitals![typedKey]) {
                    items.push({ formFieldId: field.id, subFieldKey: typedKey, label: vitalsLabels[typedKey] || typedKey });
                }
            });
        } else if (![FormFieldType.SECTION_HEADER, FormFieldType.NOTE, FormFieldType.IMAGE, FormFieldType.SIGNATURE, FormFieldType.RICH_TEXT, FormFieldType.PAYMENT_DETAILS, FormFieldType.COMPANY_HEADER, FormFieldType.UNIVERSAL_AGREEMENT].includes(field.type)) {
            items.push({ formFieldId: field.id, label: field.label });
        }
    });
    return items;
  }
  
  const getDisplayLabelForSuggestion = (suggestion: EHRMappingSuggestion): string => {
    const originalField = fields.find(f => f.id === suggestion.formFieldId);
    if (!originalField) return 'Unknown Field';
    
    if (suggestion.subFieldKey) {
        const key = suggestion.subFieldKey;
        const labelMaps = {
            [FormFieldType.PERSONAL_INFO]: personalInfoLabels,
            [FormFieldType.HEALTH_INSURANCE]: healthInsuranceLabels,
            [FormFieldType.MEDICATION_HISTORY]: medicationHistoryLabels,
            [FormFieldType.VITALS]: vitalsLabels,
        };
        const map = labelMaps[originalField.type as keyof typeof labelMaps];
        if (map && key in map) {
            return (map as any)[key];
        }
    }
    return originalField.label;
  }

  const getDisplayLabel = (item: MappableItem): string => {
    const originalField = fields.find(f => f.id === item.formFieldId);
    if (!originalField) return 'Unknown Field';
    
    let displayLabel = item.label || originalField.label;

    if (item.subFieldKey) {
        const key = item.subFieldKey;
        const labelMaps = {
            [FormFieldType.PERSONAL_INFO]: personalInfoLabels,
            [FormFieldType.HEALTH_INSURANCE]: healthInsuranceLabels,
            [FormFieldType.MEDICATION_HISTORY]: medicationHistoryLabels,
            [FormFieldType.VITALS]: vitalsLabels,
        };
        const map = labelMaps[originalField.type as keyof typeof labelMaps];
        if (map && key in map) {
            return (map as any)[key];
        }
    }
    return displayLabel;
  }

  const handleManualMappingChange = (item: MappableItem, ehrField: string) => {
    setCurrentMappings(prev => {
        const newMappings = prev.filter(m => !(m.formFieldId === item.formFieldId && m.subFieldKey === item.subFieldKey));
        if (ehrField) {
            newMappings.push({ formFieldId: item.formFieldId, subFieldKey: item.subFieldKey, ehrField });
        }
        return newMappings;
    });

    if (ehrField) {
        setSuggestedMappings(prev => prev.filter(s => !(s.formFieldId === item.formFieldId && s.subFieldKey === item.subFieldKey)));
    }
  };

  const handleAcceptSuggestion = (suggestion: EHRMappingSuggestion) => {
    setCurrentMappings(prev => [...prev, {
        formFieldId: suggestion.formFieldId,
        ehrField: suggestion.ehrField,
        subFieldKey: suggestion.subFieldKey,
    }]);
    setSuggestedMappings(prev => prev.filter(s => !(s.formFieldId === suggestion.formFieldId && s.subFieldKey === suggestion.subFieldKey)));
    setSuggestionToReview(null);
  };

  const handleDismissSuggestion = (suggestion: EHRMappingSuggestion) => {
    const key = suggestion.subFieldKey ? `${suggestion.formFieldId}-${suggestion.subFieldKey}` : suggestion.formFieldId;
    setDismissedSuggestionKeys(prev => new Set(prev).add(key));
    setSuggestedMappings(prev => prev.filter(s => !(s.formFieldId === suggestion.formFieldId && s.subFieldKey === suggestion.subFieldKey)));
    setSuggestionToReview(null);
  };

  const groupedEHRPaths = EHR_FIELD_PATHS.reduce((acc, path) => {
    (acc[path.category] = acc[path.category] || []).push(path);
    return acc;
  }, {} as Record<string, typeof EHR_FIELD_PATHS>);

  const getMappingItemId = (formFieldId: string, subFieldKey?: string) => `mapping-item-${formFieldId}-${subFieldKey || 'main'}`;
  
  const handleViewMapping = (fieldId: string, subFieldKey?: string) => {
      setActiveSidePanelTab('mappings');
      // Use timeout to allow the panel to switch and render before we scroll
      setTimeout(() => {
          const elementId = getMappingItemId(fieldId, subFieldKey);
          let element = document.getElementById(elementId);
          
          if (!element) {
            const groupEl = document.getElementById(`mapping-item-group-${fieldId}`);
            if (groupEl) {
                const child = groupEl.querySelector(`[id^='mapping-item-${fieldId}']`);
                if(child) element = child as HTMLElement;
            }
          }

          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('bg-primary-100', 'ring-2', 'ring-primary-300', 'transition-all', 'duration-500');
              setTimeout(() => {
                  element?.classList.remove('bg-primary-100', 'ring-2', 'ring-primary-300');
              }, 2000);
          } else {
             const groupEl = document.getElementById(`mapping-item-group-${fieldId}`);
             if (groupEl) {
                groupEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }
          }
      }, 100);
  };

  const handleViewSuggestion = (suggestion: EHRMappingSuggestion) => {
      setSuggestionToReview(suggestion);
  };
  
  const FieldControls: React.FC<{field: FormField}> = ({field}) => {
    const currentToolbox = isFormMode ? TOOLBOX_CATEGORIES : PRIMITIVE_TOOLBOX_CATEGORIES;
    return (
        <div className="absolute top-4 right-4 z-10 flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Field actions">
            <select
                value={field.type}
                onChange={(e) => handleTypeChange(field.id, e.target.value as FormFieldType)}
                onClick={(e) => e.stopPropagation()} 
                className="text-xs bg-white border border-slate-400 rounded-md shadow-sm px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
                aria-label="Change field type"
            >
                {currentToolbox.map(category => (
                    <optgroup label={category.name} key={category.name}>
                        {category.elements.map(el => (
                            <option key={el.type} value={el.type}>{el.emoji} {el.label}</option>
                        ))}
                    </optgroup>
                ))}
            </select>
            <button
                onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                className="p-1.5 bg-white text-slate-500 rounded-full shadow-sm hover:bg-red-100 hover:text-red-600"
                aria-label="Delete field"
            >
                <TrashIcon />
            </button>
        </div>
    );
  };


  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3">
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
            <div className="mb-4 border-b pb-4">
                <h3 className="text-lg font-bold mb-3">Custom Elements</h3>
                <button onClick={() => {
                    if (!isFormMode && customElementFields.length > 0) {
                        if (window.confirm('Are you sure you want to start over? Your current changes to this custom element will be lost.')) {
                            handleStartCustomElementMode();
                        }
                    } else {
                        handleStartCustomElementMode();
                    }
                }} className={`w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-colors ${!isFormMode ? 'bg-slate-100' : ''}`}>
                    <PlusIcon /> Create New
                </button>
                <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {customElements.map(el => (
                        <div 
                            key={el.id}
                            draggable={isFormMode}
                            onDragStart={(e) => handleDragStart(e, { customElementId: el.id })}
                            onDragEnd={handleDragEnd}
                            className={`p-3 bg-slate-100 text-slate-700 rounded-md text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors text-left group relative ${isFormMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}`}
                        >
                            <span className="text-lg w-6 text-center">{el.emoji}</span>
                            <span className="flex-grow">{el.name}</span>
                            <button 
                                onClick={() => {
                                if (window.confirm(`Delete "${el.name}"? This cannot be undone.`)) {
                                    onDeleteCustomElement(el.id);
                                }
                                }}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <h3 className="text-lg font-bold mb-4 border-b pb-2 flex-shrink-0">{isFormMode ? 'Form Elements' : 'Available Fields'}</h3>
            <div className="space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {(isFormMode ? TOOLBOX_CATEGORIES : PRIMITIVE_TOOLBOX_CATEGORIES).map(category => (
                <div key={category.name}>
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">
                    {category.name}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                    {category.elements.map(({ type, label, emoji }) => (
                        <div
                        key={type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, {type})}
                        onDragEnd={handleDragEnd}
                        className="p-3 bg-slate-100 text-slate-700 rounded-md text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors text-left cursor-grab active:cursor-grabbing flex items-center gap-3"
                        >
                        <span className="text-lg w-6 text-center">{emoji}</span>
                        <span>{label}</span>
                        </div>
                    ))}
                    </div>
                </div>
                ))}
            </div>
        </div>
      </div>

      <div className="lg:col-span-6">
        <div 
          onDragOver={canDragAndDrop ? handleDragOver : undefined}
          onDrop={canDragAndDrop ? handleDrop : undefined}
          onDragLeave={canDragAndDrop ? handleDragLeave : undefined}
          className={`bg-white p-6 rounded-lg shadow-md border border-slate-200 min-h-[500px] transition-colors ${isDragging ? 'bg-primary-50' : ''}`}
        >
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4 gap-4 flex-wrap">
            {isFormMode ? (
                <>
                    <div className="flex-grow">
                    <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Enter Form Name"
                        className="text-2xl font-bold text-slate-800 w-full focus:outline-none p-0 border-0 focus:ring-0"
                    />
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <button 
                        onClick={() => {
                            setIsAiAssistantOpen(prev => !prev);
                            setSelectedFieldId(null);
                        }}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${isAiAssistantOpen ? 'bg-primary-200 text-primary-800' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
                        >
                            <SparklesIcon />
                            AI Assistant
                        </button>
                        <button
                            onClick={handleSaveForm}
                            disabled={fields.length === 0 || !!proposedAiFields || isSaving}
                            className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                        >
                        {isSaving ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (editingFormId ? 'Save' : 'Save')}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex-grow flex items-center gap-4 min-w-[300px]">
                         <input type="text" value={customElementEmoji} onChange={e => setCustomElementEmoji(e.target.value)} maxLength={2} className="w-16 text-center text-2xl px-2 py-1 border border-slate-300 rounded-md shadow-sm" />
                         <input type="text" value={customElementName} onChange={e => setCustomElementName(e.target.value)} placeholder="Enter Element Name" className="text-2xl font-bold text-slate-800 w-full focus:outline-none p-0 border-0 focus:ring-0" />
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                         <button 
                            onClick={() => {
                                setIsAiAssistantOpen(prev => !prev);
                                setSelectedFieldId(null);
                            }}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${isAiAssistantOpen ? 'bg-primary-200 text-primary-800' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
                            >
                                <SparklesIcon />
                                AI Assistant
                            </button>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button onClick={handleCancelCustomElement} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-300 transition-colors">Cancel</button>
                        <button onClick={handleSaveCustomElement} disabled={!customElementName.trim() || customElementFields.length === 0} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 disabled:bg-slate-400">Save Element</button>
                    </div>
                </>
            )}
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => {
                if (proposedAiFields && fieldIdsToRemove.has(field.id)) {
                    return (
                        <div key={field.id} className="border-2 border-dashed border-red-400 rounded-lg p-4 relative bg-red-50/50">
                            <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-red-500 text-white p-1.5 rounded-full shadow-md flex items-center gap-1 text-xs px-2 font-semibold">
                                <TrashIcon className="h-3 w-3" /> REMOVED
                            </div>
                            <div className="opacity-60">
                                <RenderedFormComponent field={field} />
                            </div>
                        </div>
                    );
                }
                return (
                    <React.Fragment key={field.id}>
                        {canDragAndDrop && dropIndicator === index && <DropIndicator />}
                        <div 
                        data-field-id={field.id}
                        draggable={canDragAndDrop}
                        onDragStart={(e) => handleDragStart(e, {id: field.id})}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                            setSelectedFieldId(field.id);
                        }}
                        className={`p-4 rounded-md cursor-pointer transition-all duration-200 relative group ${selectedFieldId === field.id ? 'bg-primary-100 border-2 border-primary-500' : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        >
                            <FieldControls field={field} />
                            <RenderedFormComponent 
                                field={field} 
                                confirmedMappings={currentMappings}
                                suggestedMappings={suggestedMappings}
                                analyzingMappingKeys={analyzingMappingKeys}
                                onViewMapping={handleViewMapping}
                                onViewSuggestion={handleViewSuggestion}
                            />
                        </div>
                    </React.Fragment>
                );
            })}
             
             {fields.length === 0 && !proposedAiFields && (
                 <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-lg">
                     {isDragging && canDragAndDrop ? (
                         <>
                         {dropIndicator === 0 && <DropIndicator />}
                         <p className="font-semibold text-primary-600">Drop here to start building</p>
                         </>
                     ) : (
                         <>
                             <p className="text-slate-500">{isFormMode ? 'Your form is empty.' : 'Your custom element is empty.'}</p>
                             <p className="text-sm text-slate-400">{isFormMode ? 'Drag elements from the left panel or use the AI Assistant.' : 'Drag fields from the left to build your element.'}</p>
                         </>
                     )}
                 </div>
             )}
             {canDragAndDrop && dropIndicator === fields.length && fields.length > 0 && <DropIndicator />}

             {proposedAiFields && fieldsToAdd.length > 0 && (
                <>
                    <div className="relative text-center my-4"><span className="bg-white px-2 text-sm text-slate-400 z-10 relative">AI-generated suggestions</span><hr className="absolute top-1/2 w-full border-dashed border-slate-300 -translate-y-1/2"/></div>
                    <div className="space-y-2">
                        {fieldsToAdd.map(field => (
                            <div key={field.id} className="border-2 border-dashed border-green-400 rounded-lg p-4 relative bg-green-50/50">
                                <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-green-500 text-white p-1.5 rounded-full shadow-md flex items-center gap-1 text-xs px-2 font-semibold">
                                    <PlusIcon className="h-3 w-3" /> ADDED
                                </div>
                                <RenderedFormComponent field={field} />
                            </div>
                        ))}
                    </div>
                </>
             )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {isAiAssistantOpen ? (
            <AiAssistantPanel 
                onClose={() => setIsAiAssistantOpen(false)}
                onGenerated={(newFields) => {
                    setProposedAiFields(newFields);
                    setIsAiAssistantOpen(false);
                }}
                existingFields={fields}
                mode={composerMode}
            />
        ) : (
            <div className="bg-white p-1 rounded-lg shadow-md border border-slate-200 sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
                  <div className="flex p-1 bg-slate-100 rounded-t-md border-b">
                    <button onClick={() => setActiveSidePanelTab('properties')} className={`w-1/2 py-2 text-sm font-semibold rounded-md ${activeSidePanelTab === 'properties' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-600'}`}>Properties</button>
                    <button onClick={() => setActiveSidePanelTab('mappings')} className={`w-1/2 py-2 text-sm font-semibold rounded-md ${activeSidePanelTab === 'mappings' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-600'}`}>Mappings</button>
                  </div>

                <div className="p-3 flex-grow overflow-y-auto">
                    {activeSidePanelTab === 'properties' && (
                        <div>
                            {selectedField ? (
                                <div className="space-y-4">
                                    {selectedField.type === FormFieldType.RICH_TEXT ? (
                                        <RichTextPropertyEditor content={selectedField.label} onChange={(newContent) => updateField(selectedFieldId!, { label: newContent })} />
                                    ) : selectedField.type === FormFieldType.NOTE ? (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Note Content</label>
                                            <textarea value={selectedField.label} onChange={e => updateField(selectedFieldId!, { label: e.target.value })} className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" rows={5} />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">{
                                                selectedField.type === FormFieldType.COMPANY_HEADER
                                                ? 'Company Name'
                                                : [FormFieldType.PERSONAL_INFO, FormFieldType.HEALTH_INSURANCE, FormFieldType.MEDICATION_HISTORY, FormFieldType.VITALS, FormFieldType.PAYMENT_DETAILS, FormFieldType.UNIVERSAL_AGREEMENT].includes(selectedField.type)
                                                ? 'Section Title' : 'Label'
                                            }</label>
                                            <input type="text" value={selectedField.label} onChange={e => updateField(selectedFieldId!, { label: e.target.value })} className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" />
                                        </div>
                                    )}
                                    {selectedField.type === FormFieldType.COMPANY_HEADER && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Logo</label>
                                            <LogoUploader
                                                logoSrc={selectedField.logoSrc}
                                                onChange={(newSrc) => updateField(selectedFieldId!, { logoSrc: newSrc })}
                                                onRemove={() => updateField(selectedFieldId!, { logoSrc: undefined })}
                                            />
                                        </div>
                                    )}

                                    {selectedField.type !== FormFieldType.NOTE && selectedField.type !== FormFieldType.RICH_TEXT && (
                                        <div><label className="block text-sm font-medium text-slate-700">Help Text</label><input type="text" value={selectedField.helpText || ''} onChange={e => updateField(selectedFieldId!, { helpText: e.target.value })} className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" placeholder="Optional instructions for the user" /></div>
                                    )}
                                    {selectedField.type === FormFieldType.PERSONAL_INFO && <PersonalInfoProperties field={selectedField} />}
                                    {selectedField.type === FormFieldType.HEALTH_INSURANCE && <HealthInsuranceProperties field={selectedField} />}
                                    {selectedField.type === FormFieldType.MEDICATION_HISTORY && <MedicationHistoryProperties field={selectedField} />}
                                    {selectedField.type === FormFieldType.VITALS && <VitalsProperties field={selectedField} />}
                                    {selectedField.type === FormFieldType.PAYMENT_DETAILS && <PaymentDetailsProperties field={selectedField} />}
                                    {selectedField.type === FormFieldType.UNIVERSAL_AGREEMENT && <UniversalAgreementProperties field={selectedField} />}
                                    {[FormFieldType.TEXT_INPUT, FormFieldType.TEXTAREA, FormFieldType.EMAIL, FormFieldType.PHONE, FormFieldType.NUMERIC].includes(selectedField.type) && (<div><label className="block text-sm font-medium text-slate-700">Placeholder</label><input type="text" value={selectedField.placeholder} onChange={e => updateField(selectedFieldId!, { placeholder: e.target.value })} className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" /></div>)}
                                    {selectedField.type === FormFieldType.NUMERIC && (<div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700">Min Value</label><input type="number" value={selectedField.minValue ?? ''} onChange={e => updateField(selectedFieldId!, { minValue: e.target.value === '' ? undefined : Number(e.target.value) })} className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" /></div><div><label className="block text-sm font-medium text-slate-700">Max Value</label><input type="number" value={selectedField.maxValue ?? ''} onChange={e => updateField(selectedFieldId!, { maxValue: e.target.value === '' ? undefined : Number(e.target.value) })} className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" /></div></div>)}
                                    {[FormFieldType.RADIO_GROUP, FormFieldType.DROPDOWN, FormFieldType.CHECKBOX_GROUP].includes(selectedField.type) && (<OptionsProperties field={selectedField} />)}
                                    {selectedField.type === FormFieldType.RATING_SCALE && (<div><label className="block text-sm font-medium text-slate-700">Rating Scale (1 to X)</label><input type="number" value={selectedField.ratingScale || 5} onChange={e => updateField(selectedFieldId!, { ratingScale: parseInt(e.target.value, 10) || 5 })} className="mt-1 w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm" min="2" max="10" /></div>)}
                                    {![FormFieldType.SECTION_HEADER, FormFieldType.NOTE, FormFieldType.RICH_TEXT, FormFieldType.IMAGE, FormFieldType.MEDICATION_HISTORY, FormFieldType.HEALTH_INSURANCE, FormFieldType.VITALS, FormFieldType.PAYMENT_DETAILS, FormFieldType.COMPANY_HEADER, FormFieldType.UNIVERSAL_AGREEMENT].includes(selectedField.type) && (<div className="flex items-center"><input type="checkbox" checked={!!selectedField.required} onChange={e => updateField(selectedFieldId!, { required: e.target.checked })} className="h-4 w-4 text-primary-600 border-slate-300 rounded" /><label className="ml-2 block text-sm text-slate-900">Required</label></div>)}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-8">Select a field to see its properties.</p>
                            )}
                        </div>
                    )}
                    {activeSidePanelTab === 'mappings' && (() => {
                        const allMappableItems = getMappableItems(fields);
                        
                        const itemsByField = fields.map(field => {
                            const items = allMappableItems.filter(item => item.formFieldId === field.id);
                            if (items.length === 0) return null;
                            return { field, items };
                        }).filter(Boolean);

                        return (
                            <div className="space-y-6">
                                <div className="h-6">
                                    {analyzingMappingKeys.size > 0 && <p className="text-xs text-slate-500">Checking for EHR connections...</p>}
                                </div>

                                {itemsByField.map(group => {
                                    if (!group) return null;
                                    const { field, items } = group;
                                    const fieldConfirmed = currentMappings.filter(m => m.formFieldId === field.id);
                                    
                                    const confirmedKeys = new Set(fieldConfirmed.map(m => m.subFieldKey || 'main'));
                                    const fieldUnmapped = items.filter(i => !confirmedKeys.has(i.subFieldKey || 'main'));

                                    return (
                                        <div key={field.id} id={`mapping-item-group-${field.id}`} className="p-3 border border-slate-200 rounded-lg space-y-3">
                                            <h4 className="font-bold text-slate-800 text-sm truncate" title={field.label}>{field.label}</h4>

                                            {/* Confirmed Mappings for this field */}
                                            {fieldConfirmed.map((mapping, index) => {
                                                const item = items.find(i => (i.subFieldKey || 'main') === (mapping.subFieldKey || 'main')) || {formFieldId: mapping.formFieldId, subFieldKey: mapping.subFieldKey, label: 'Unknown'};
                                                return (
                                                    <div key={index} id={getMappingItemId(item.formFieldId, item.subFieldKey)} className="p-2 border border-slate-200 rounded-md bg-slate-50 transition-all duration-500">
                                                        <div className="flex justify-between items-start">
                                                          <label className="block text-xs font-semibold text-slate-600 truncate pt-1" title={getDisplayLabel(item)}>{getDisplayLabel(item)}</label>
                                                          <button onClick={() => handleManualMappingChange(item, '')} className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-500 rounded-full"><TrashIcon className="h-4 w-4"/></button>
                                                        </div>
                                                        <select value={mapping.ehrField} onChange={(e) => handleManualMappingChange(item, e.target.value)} className="mt-1 w-full text-xs border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                                                            <option value="">Not Mapped</option>
                                                            {Object.entries(groupedEHRPaths).map(([category, paths]) => (
                                                                <optgroup label={category} key={category}>
                                                                    {paths.map(path => <option key={path.value} value={path.value}>{path.label}</option>)}
                                                                </optgroup>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })}

                                            {/* Unmapped items for this field */}
                                            {fieldUnmapped.map((item, index) => (
                                                 <div key={index} id={getMappingItemId(item.formFieldId, item.subFieldKey)} className="p-2 border border-slate-200 rounded-md transition-all duration-500">
                                                    <label className="block text-xs font-semibold text-slate-600 truncate" title={getDisplayLabel(item)}>{getDisplayLabel(item)}</label>
                                                    <select value="" onChange={(e) => handleManualMappingChange(item, e.target.value)} className="mt-1 w-full text-xs border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                                                        <option value="">Select EHR Field...</option>
                                                        {Object.entries(groupedEHRPaths).map(([category, paths]) => (
                                                            <optgroup label={category} key={category}>
                                                                {paths.map(path => <option key={path.value} value={path.value}>{path.label}</option>)}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}

                                {allMappableItems.length === 0 && <p className="text-xs text-slate-500 text-center py-4">This item has no fields that can be mapped.</p>}
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}
      </div>
      {proposedAiFields && (
        <AiActionBar
            fieldsToAddCount={fieldsToAdd.length}
            fieldsToRemoveCount={fieldIdsToRemove.size}
            onAccept={() => {
                if(proposedAiFields) {
                    setFields(proposedAiFields);
                }
                setProposedAiFields(null);
            }}
            onReject={() => setProposedAiFields(null)}
        />
      )}
    </div>
    <SuggestionReviewModal 
        isOpen={!!suggestionToReview}
        onClose={() => setSuggestionToReview(null)}
        suggestion={suggestionToReview}
        onAccept={handleAcceptSuggestion}
        onReject={handleDismissSuggestion}
        getDisplayLabel={getDisplayLabelForSuggestion}
    />
    </>
  );
};

export default ManualComposer;