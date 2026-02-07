import React from 'react';
import { EHRMappingSuggestion } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LinkIcon } from './icons/LinkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { EHR_FIELD_PATHS } from '../constants';

interface SuggestionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: EHRMappingSuggestion | null;
  onAccept: (suggestion: EHRMappingSuggestion) => void;
  onReject: (suggestion: EHRMappingSuggestion) => void;
  getDisplayLabel: (suggestion: EHRMappingSuggestion) => string;
}

const SuggestionReviewModal: React.FC<SuggestionReviewModalProps> = ({ isOpen, onClose, suggestion, onAccept, onReject, getDisplayLabel }) => {
  if (!isOpen || !suggestion) {
    return null;
  }

  const handleAccept = () => {
    onAccept(suggestion);
  };

  const handleReject = () => {
    onReject(suggestion);
  };

  const displayLabel = getDisplayLabel(suggestion);
  
  const ehrFieldInfo = EHR_FIELD_PATHS.find(p => p.value === suggestion.ehrField);
  const ehrFieldCategory = ehrFieldInfo ? ehrFieldInfo.category : 'EHR Record';
  const ehrFieldLabel = ehrFieldInfo ? ehrFieldInfo.label : suggestion.ehrField;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-lg transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-purple-100 text-purple-600 rounded-full"><SparklesIcon /></span>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Automate This Field</h3>
              <p className="text-sm text-slate-500">Connect this form field to the patient's EHR to save time on data entry.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <XIcon />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-4">
            <p className="text-sm text-slate-700 text-center leading-relaxed">
                When a patient fills out the <strong className="text-slate-900">"{displayLabel}"</strong> field on this form, their response will be automatically saved to the <strong className="text-primary-700">{ehrFieldLabel}</strong> field in their EHR profile.
            </p>
            <div className="flex items-center justify-between gap-4 py-4 border-t border-b border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <DocumentTextIcon className="h-6 w-6 text-slate-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Form Field</p>
                  <p className="font-semibold text-slate-800 truncate" title={displayLabel}>{displayLabel}</p>
                </div>
              </div>
              <LinkIcon className="h-6 w-6 text-slate-400 flex-shrink-0" />
              <div className="flex items-center gap-3 min-w-0">
                <DatabaseIcon className="h-6 w-6 text-slate-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{ehrFieldCategory}</p>
                  <p className="font-semibold text-primary-700 truncate" title={ehrFieldLabel}>{ehrFieldLabel}</p>
                </div>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500"><span className="font-semibold text-slate-600">AI Rationale:</span> {suggestion.reason}</p>
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-white border-t border-slate-200 rounded-b-xl flex justify-end gap-3 flex-shrink-0">
          <button onClick={handleReject} className="px-4 py-2 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
            <XIcon /> Reject
          </button>
          <button 
            onClick={handleAccept}
            className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <CheckIcon /> Accept & Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionReviewModal;