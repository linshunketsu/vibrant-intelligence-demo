import React, { useState, useEffect } from 'react';
import { EHRMappingSuggestion } from '../services/geminiService';
import { EHRMapping, FormField, FormFieldType } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LinkIcon } from './icons/LinkIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { personalInfoLabels, healthInsuranceLabels, medicationHistoryLabels, vitalsLabels } from '../constants';

interface EHRMappingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onSaveWithoutMappings: () => void;
  suggestions: EHRMappingSuggestion[];
  onConfirm: (mappings: EHRMapping[]) => void;
  formFields: FormField[];
}

const EHRMappingModal: React.FC<EHRMappingModalProps> = ({ isOpen, onCancel, onSaveWithoutMappings, suggestions, onConfirm, formFields }) => {
  const [activeMappings, setActiveMappings] = useState<EHRMappingSuggestion[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Initialize with all suggestions when the modal opens
      setActiveMappings(suggestions);
    }
  }, [isOpen, suggestions]);

  if (!isOpen) {
    return null;
  }

  const handleRemoveMapping = (indexToRemove: number) => {
    setActiveMappings(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleConfirm = () => {
    const finalMappings: EHRMapping[] = activeMappings.map(s => ({
      formFieldId: s.formFieldId,
      ehrField: s.ehrField,
      subFieldKey: s.subFieldKey,
    }));
    onConfirm(finalMappings);
  };
  
  const getDisplayLabel = (suggestion: EHRMappingSuggestion): string => {
    const originalField = formFields.find(f => f.id === suggestion.formFieldId);
    if (!originalField) return 'Unknown Field';
    
    let displayLabel = originalField.label;
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
            displayLabel = (map as any)[key];
        }
    }
    return displayLabel;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onCancel} aria-modal="true" role="dialog">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary-100 text-primary-600 rounded-full"><SparklesIcon /></span>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Automate Your Data Entry</h3>
                <p className="text-sm text-slate-500">Map fields to patient records to automatically update profiles when a form is completed.</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <XIcon />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
            {activeMappings.length === 0 ? (
                <div className="text-center py-16">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
                         <DatabaseIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-900">No Automatic Connections Found</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Our AI couldn't find any clear connections for this form. You can still save it, and patient responses will be stored with the form submission.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-slate-600 mb-4">
                        Our AI assistant suggests these <span className="font-bold">{activeMappings.length}</span> connection{activeMappings.length !== 1 ? 's' : ''}. Once confirmed, answers from these fields will automatically update the patient's profile, saving you time.
                    </p>
                    {activeMappings.map((suggestion, index) => (
                         <div key={`${suggestion.formFieldId}-${suggestion.subFieldKey || ''}-${index}`} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-grow min-w-0">
                                    {/* Form Field */}
                                    <div className="flex items-center gap-2 w-[45%] min-w-0">
                                        <DocumentTextIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                        <p className="font-semibold text-slate-800 break-words truncate" title={getDisplayLabel(suggestion)}>{getDisplayLabel(suggestion)}</p>
                                    </div>
                                    {/* Arrow */}
                                    <LinkIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                    {/* EHR Field */}
                                    <div className="flex items-center gap-2 w-[45%] min-w-0">
                                        <DatabaseIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                        <p className="font-semibold text-primary-700 break-words truncate" title={suggestion.ehrField}>{suggestion.ehrField}</p>
                                    </div>
                                </div>
                                {/* Remove button */}
                                <button onClick={() => handleRemoveMapping(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full flex-shrink-0" aria-label="Remove suggestion">
                                    <XIcon />
                                </button>
                            </div>
                            {/* Rationale */}
                            <div className="mt-2 pl-1 text-left border-t border-slate-100 pt-2">
                                 <p className="text-xs text-slate-500"><span className="font-semibold text-slate-600">AI Rationale:</span> {suggestion.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <div className="p-5 bg-white border-t border-slate-200 rounded-b-xl flex justify-end gap-3 flex-shrink-0">
            <button onClick={onSaveWithoutMappings} className="px-4 py-2 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors">
                Save Form Only
            </button>
            <button 
                onClick={handleConfirm}
                disabled={activeMappings.length === 0}
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                 <CheckIcon />
                {activeMappings.length > 0
                    ? `Confirm ${activeMappings.length} Connection${activeMappings.length !== 1 ? 's' : ''} & Save`
                    : `Confirm Connections & Save`
                }
            </button>
        </div>
      </div>
    </div>
  );
};

export default EHRMappingModal;