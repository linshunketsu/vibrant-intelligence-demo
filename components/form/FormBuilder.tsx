// Form Builder Component
// Main drag-and-drop form builder with AI integration
// Migrated and simplified from vibrant-intelligence-form-builder with Tailwind CSS

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FormField,
  FormFieldType,
  FormTemplate,
  PersonalInfoSelection,
  MedicationHistorySelection,
  HealthInsuranceSelection,
  VitalsSelection,
  UniversalAgreementSelection,
  EHRMapping,
  EHRMappingSuggestion
} from '../../formTypes';
import {
  TOOLBOX_CATEGORIES,
  personalInfoLabels,
  medicationHistoryLabels,
  healthInsuranceLabels,
  vitalsLabels,
  DEFAULT_SUBFIELD_MAPPINGS,
  DEFAULT_FIELD_TYPE_MAPPINGS,
  EHR_FIELD_PATHS
} from '../../formConstants';
import { FormPreview } from './FormPreview';
import { generateFormWithAI, suggestEHRMappings } from '../../services/formGeminiService';
import { EHRMappingModal } from './EHRMappingModal';
import { SuggestionReviewModal } from './SuggestionReviewModal';
import {
  Trash2,
  X,
  Sparkles,
  Check,
  GripVertical,
  Building2,
  Save,
  ArrowLeft,
  Wand2,
  Loader2,
  Link2,
  Database,
  Edit3,
  FileText
} from 'lucide-react';

interface FormBuilderProps {
  initialFields: FormField[];
  onSaveForm: (form: FormTemplate) => void;
  editingFormId: string | null;
  existingForms: FormTemplate[];
  onCancel: () => void;
  geminiApiKey: string;
  onApiKeyRequired?: () => void;
}

const DropIndicator: React.FC = () => {
  return <div className="my-1 h-1 w-full rounded-full bg-blue-400" />;
};

// Input component that preserves focus during parent re-renders
// Uses a ref-based approach to maintain state independently
const StableInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  fieldId: string;
  inputType: string;
}> = ({ value, onChange, className, placeholder, fieldId, inputType }) => {
  const instanceKey = `${fieldId}-${inputType}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const internalStateRef = useRef<{ value: string; isFocused: boolean } | null>(null);

  // Initialize internal state on first render
  if (internalStateRef.current === null) {
    internalStateRef.current = { value, isFocused: false };
  }

  // Update internal value from props only when not focused
  if (!internalStateRef.current.isFocused && internalStateRef.current.value !== value) {
    internalStateRef.current.value = value;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (internalStateRef.current) {
      internalStateRef.current.value = e.target.value;
    }
    onChange(e.target.value);
  };

  const handleFocus = () => {
    if (internalStateRef.current) {
      internalStateRef.current.isFocused = true;
    }
  };

  const handleBlur = () => {
    if (internalStateRef.current) {
      internalStateRef.current.isFocused = false;
      internalStateRef.current.value = value; // Sync with external value on blur
    }
  };

  const displayValue = internalStateRef.current?.isFocused
    ? internalStateRef.current.value
    : value;

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};

// Properties Panel Component - defined outside to prevent recreation
interface PropertiesPanelProps {
  selectedField: FormField | null;
  updateField: (id: string, props: Partial<FormField>) => void;
  setFormMappings: React.Dispatch<React.SetStateAction<EHRMapping[]>>;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = React.memo(({ selectedField, updateField, setFormMappings }) => {
  if (!selectedField) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
        <p className="text-sm text-slate-500 text-center py-8">
          Select a field to edit its properties
        </p>
      </div>
    );
  }

  const handleSubFieldToggle = (
    subFieldKey: string,
    isTurningOn: boolean,
    updatePayload: Partial<FormField>
  ) => {
    updateField(selectedField.id, updatePayload);

    const ehrField = DEFAULT_SUBFIELD_MAPPINGS[subFieldKey];
    if (ehrField) {
      if (isTurningOn) {
        setFormMappings(prev => [...prev, { formFieldId: selectedField.id, subFieldKey, ehrField }]);
      } else {
        setFormMappings(prev => prev.filter(m => !(m.formFieldId === selectedField.id && m.subFieldKey === subFieldKey)));
      }
    }
  };

  // Personal Info Properties
  if (selectedField.type === FormFieldType.PERSONAL_INFO && selectedField.personalInfo) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <h3 className="font-bold text-slate-800 mb-4">Personal Info Fields</h3>
        <div className="space-y-2">
          {Object.entries(personalInfoLabels).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedField.personalInfo![key as keyof PersonalInfoSelection]}
                onChange={e => {
                  const updated = { ...selectedField.personalInfo, [key]: e.target.checked };
                  handleSubFieldToggle(key, e.target.checked, { personalInfo: updated });
                }}
                className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
            <StableInput
              fieldId={selectedField.id}
              inputType="label"
              value={selectedField.label}
              onChange={(value: string) => updateField(selectedField.id, { label: value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedField.required || false}
              onChange={e => updateField(selectedField.id, { required: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Required</span>
          </label>
        </div>
      </div>
    );
  }

  // Health Insurance Properties
  if (selectedField.type === FormFieldType.HEALTH_INSURANCE && selectedField.healthInsurance) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <h3 className="font-bold text-slate-800 mb-4">Health Insurance Fields</h3>
        <div className="space-y-2">
          {Object.entries(healthInsuranceLabels).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedField.healthInsurance![key as keyof HealthInsuranceSelection]}
                onChange={e => {
                  const updated = { ...selectedField.healthInsurance, [key]: e.target.checked };
                  handleSubFieldToggle(key, e.target.checked, { healthInsurance: updated });
                }}
                className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
            <StableInput
              fieldId={selectedField.id}
              inputType="label"
              value={selectedField.label}
              onChange={(value: string) => updateField(selectedField.id, { label: value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedField.required || false}
              onChange={e => updateField(selectedField.id, { required: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Required</span>
          </label>
        </div>
      </div>
    );
  }

  // Vitals Properties
  if (selectedField.type === FormFieldType.VITALS && selectedField.vitals) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <h3 className="font-bold text-slate-800 mb-4">Vitals Fields</h3>
        <div className="space-y-2">
          {Object.entries(vitalsLabels).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedField.vitals![key as keyof VitalsSelection]}
                onChange={e => {
                  const updated = { ...selectedField.vitals, [key]: e.target.checked };
                  handleSubFieldToggle(key, e.target.checked, { vitals: updated });
                }}
                className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
            <StableInput
              fieldId={selectedField.id}
              inputType="label"
              value={selectedField.label}
              onChange={(value: string) => updateField(selectedField.id, { label: value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedField.required || false}
              onChange={e => updateField(selectedField.id, { required: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Required</span>
          </label>
        </div>
      </div>
    );
  }

  // Universal Agreement Properties
  if (selectedField.type === FormFieldType.UNIVERSAL_AGREEMENT && selectedField.universalAgreement) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <h3 className="font-bold text-slate-800 mb-4">Agreement Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={selectedField.label}
              onChange={e => updateField(selectedField.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Agreement Text</label>
            <textarea
              rows={6}
              value={selectedField.agreementText || ''}
              onChange={e => updateField(selectedField.id, { agreementText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Include Fields:</p>
            {Object.entries({ includePrintedName: 'Printed Name', includeDate: 'Date' }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedField.universalAgreement![key as keyof UniversalAgreementSelection]}
                  onChange={e => {
                    const updated = { ...selectedField.universalAgreement, [key]: e.target.checked };
                    updateField(selectedField.id, { universalAgreement: updated });
                  }}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Rich Text Properties
  if (selectedField.type === FormFieldType.RICH_TEXT) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <h3 className="font-bold text-slate-800 mb-4">Rich Text Content</h3>
        <RichTextEditor
          content={selectedField.label}
          onChange={newContent => updateField(selectedField.id, { label: newContent })}
        />
      </div>
    );
  }

  // Default Properties
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <h3 className="font-bold text-slate-800 mb-4">Field Properties</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
          <input
            type="text"
            value={selectedField.label}
            onChange={e => updateField(selectedField.id, { label: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedField.placeholder !== undefined && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Placeholder</label>
            <input
              type="text"
              value={selectedField.placeholder || ''}
              onChange={e => updateField(selectedField.id, { placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {selectedField.helpText !== undefined && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Help Text</label>
            <input
              type="text"
              value={selectedField.helpText || ''}
              onChange={e => updateField(selectedField.id, { helpText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {selectedField.options && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Options (one per line)</label>
            <textarea
              rows={4}
              value={selectedField.options.join('\n')}
              onChange={e => updateField(selectedField.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        {selectedField.rows !== undefined && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rows</label>
            <input
              type="number"
              min={1}
              max={10}
              value={selectedField.rows}
              onChange={e => updateField(selectedField.id, { rows: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {selectedField.ratingScale !== undefined && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rating Scale (1-N)</label>
            <input
              type="number"
              min={3}
              max={10}
              value={selectedField.ratingScale}
              onChange={e => updateField(selectedField.id, { ratingScale: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {selectedField.required !== undefined && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedField.required}
              onChange={e => updateField(selectedField.id, { required: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Required</span>
          </label>
        )}
      </div>
    </div>
  );
});
PropertiesPanel.displayName = 'PropertiesPanel';

// AI Assistant Panel
interface AiAssistantPanelProps {
  onClose: () => void;
  onGenerated: (fields: FormField[]) => void;
  existingFields: FormField[];
  apiKey: string;
  onApiKeyRequired?: () => void;
}

const purposeOptions = [
  { value: 'New Patient Intake', label: 'Intake', emoji: '👤' },
  { value: 'Telehealth Consent', label: 'Consent', emoji: '🛡️' },
  { value: 'Medical History Update', label: 'Update', emoji: '🕐' },
  { value: 'Custom', label: 'Custom', emoji: '✨' },
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

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  onClose,
  onGenerated,
  existingFields,
  apiKey,
  onApiKeyRequired
}) => {
  const [formPurpose, setFormPurpose] = useState<string>('New Patient Intake');
  const [formDescription, setFormDescription] = useState<string>(
    'A standard form for new patients. It should include sections for personal information (name, DOB, address), medical history (allergies, current medications), and insurance details.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!apiKey) {
      onApiKeyRequired?.();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fields = await generateFormWithAI(apiKey, formPurpose, formDescription, existingFields);
      onGenerated(fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 sticky top-4 max-h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" /> AI Assistant
        </h3>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            1. What&apos;s the purpose of the form?
          </label>
          <div className="flex flex-wrap gap-2">
            {purposeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFormPurpose(option.value)}
                className={`flex items-center gap-2 p-2 px-3 rounded-full border text-sm font-semibold transition-colors ${
                  formPurpose === option.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="form-description" className="block text-sm font-semibold text-slate-800 mb-2">
            2. Describe the form in detail
          </label>
          <textarea
            id="form-description"
            rows={6}
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="e.g., A post-operative follow-up for a knee replacement. Include fields for pain level, swelling, and any new symptoms."
          />
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
      </div>

      <div className="pt-4 border-t mt-auto flex-shrink-0">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !formPurpose || !formDescription}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate Fields
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// AI Action Bar
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
        <span className="flex-shrink-0 bg-blue-100 text-blue-600 p-2 rounded-full">
          <Sparkles className="h-4 w-4" />
        </span>
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
          <Check className="h-4 w-4" /> Accept
        </button>
        <button onClick={onReject} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm flex items-center gap-2 hover:bg-slate-300 transition-colors">
          <X className="h-4 w-4" /> Reject
        </button>
      </div>
    </div>
  );
};

// Helper to get mappable items
const getMappableItems = (fields: FormField[]): { formFieldId: string; subFieldKey?: string; label: string }[] => {
  const items: { formFieldId: string; subFieldKey?: string; label: string }[] = [];

  fields.forEach(field => {
    if (field.type === FormFieldType.PERSONAL_INFO && field.personalInfo) {
      Object.keys(field.personalInfo).forEach(key => {
        if (field.personalInfo![key as keyof PersonalInfoSelection]) {
          items.push({
            formFieldId: field.id,
            subFieldKey: key,
            label: personalInfoLabels[key as keyof PersonalInfoSelection] || key
          });
        }
      });
    } else if (field.type === FormFieldType.HEALTH_INSURANCE && field.healthInsurance) {
      Object.keys(field.healthInsurance).forEach(key => {
        if (field.healthInsurance![key as keyof HealthInsuranceSelection]) {
          items.push({
            formFieldId: field.id,
            subFieldKey: key,
            label: healthInsuranceLabels[key as keyof HealthInsuranceSelection] || key
          });
        }
      });
    } else if (field.type === FormFieldType.MEDICATION_HISTORY && field.medicationHistory) {
      Object.keys(field.medicationHistory).forEach(key => {
        if (field.medicationHistory![key as keyof MedicationHistorySelection]) {
          items.push({
            formFieldId: field.id,
            subFieldKey: key,
            label: medicationHistoryLabels[key as keyof MedicationHistorySelection] || key
          });
        }
      });
    } else if (field.type === FormFieldType.VITALS && field.vitals) {
      Object.keys(field.vitals).forEach(key => {
        if (field.vitals![key as keyof VitalsSelection]) {
          items.push({
            formFieldId: field.id,
            subFieldKey: key,
            label: vitalsLabels[key as keyof VitalsSelection] || key
          });
        }
      });
    } else if (
      ![
        FormFieldType.SECTION_HEADER,
        FormFieldType.NOTE,
        FormFieldType.IMAGE,
        FormFieldType.SIGNATURE,
        FormFieldType.RICH_TEXT,
        FormFieldType.PAYMENT_DETAILS
      ].includes(field.type)
    ) {
      items.push({ formFieldId: field.id, label: field.label });
    }
  });

  return items;
};

// Rich Text Editor Component
const RichTextEditor: React.FC<{ content: string; onChange: (newContent: string) => void }> = ({ content, onChange }) => {
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

  const ToolbarButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    title: string
  }> = ({ onClick, children, title }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
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

// Main FormBuilder Component
export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialFields,
  onSaveForm,
  editingFormId,
  existingForms,
  onCancel,
  geminiApiKey,
  onApiKeyRequired
}) => {
  const existingForm = editingFormId ? existingForms.find(f => f.id === editingFormId) : null;

  // State
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [proposedAiFields, setProposedAiFields] = useState<FormField[] | null>(null);
  const [activeSidePanelTab, setActiveSidePanelTab] = useState<'properties' | 'mappings'>('properties');

  // Form state
  const [formFields, setFormFields] = useState<FormField[]>(initialFields);
  const [formName, setFormName] = useState<string>(existingForm ? existingForm.title : 'Untitled Form');
  const [formMappings, setFormMappings] = useState<EHRMapping[]>(existingForm?.mappings || []);

  const [suggestedMappings, setSuggestedMappings] = useState<EHRMappingSuggestion[]>([]);
  const [dismissedSuggestionKeys, setDismissedSuggestionKeys] = useState<Set<string>>(new Set());
  const [analyzingMappingKeys, setAnalyzingMappingKeys] = useState<Set<string>>(new Set());

  // EHR Mapping Modal state
  const [showEHRMappingModal, setShowEHRMappingModal] = useState(false);
  const [isFetchingMappingSuggestions, setIsFetchingMappingSuggestions] = useState(false);
  const [pendingSaveMappings, setPendingSaveMappings] = useState<EHRMappingSuggestion[]>([]);

  // Suggestion Review Modal state
  const [showSuggestionReviewModal, setShowSuggestionReviewModal] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<EHRMappingSuggestion | null>(null);

  const allToolboxElements = TOOLBOX_CATEGORIES.flatMap(category => category.elements);
  const debouncedFields = useDebounce(formFields, 1000);
  const previousDebouncedFields = useRef<FormField[]>([]);

  useEffect(() => {
    if (selectedFieldId) {
      // Check if this field has any pending suggestions
      const selectedField = formFields.find(f => f.id === selectedFieldId);
      if (selectedField) {
        const fieldMappableItems = getMappableItems([selectedField]);
        const hasSuggestions = fieldMappableItems.some(item => {
          const mappingKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
          return suggestedMappings.some(s => {
            const sKey = s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId;
            return sKey === mappingKey;
          });
        });

        // If field has suggestions, show Mappings tab, otherwise show Properties
        setActiveSidePanelTab(hasSuggestions ? 'mappings' : 'properties');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId, suggestedMappings]);

  // Real-time mapping suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const prevFieldsMap = new Map<string, FormField>(previousDebouncedFields.current.map(f => [f.id, f]));
      const currentFieldsMap = new Map<string, FormField>(debouncedFields.map(f => [f.id, f]));

      const fieldsToAnalyze: FormField[] = [];

      for (const [id, currentField] of currentFieldsMap.entries()) {
        const prevField = prevFieldsMap.get(id);

        if (!prevField) {
          fieldsToAnalyze.push(currentField);
          continue;
        }

        let needsAnalysis = false;
        if (prevField.label !== currentField.label) {
          needsAnalysis = true;
        } else {
          const compositeFieldConfigs: (keyof FormField)[] = ['personalInfo', 'healthInsurance', 'medicationHistory', 'vitals'];
          for (const key of compositeFieldConfigs) {
            if (JSON.stringify(prevField[key]) !== JSON.stringify(currentField[key])) {
              needsAnalysis = true;
              break;
            }
          }
        }

        if (needsAnalysis) {
          fieldsToAnalyze.push(currentField);
        }
      }

      previousDebouncedFields.current = debouncedFields;

      if (debouncedFields.length < prevFieldsMap.size) {
        setSuggestedMappings(prev => prev.filter(sug => currentFieldsMap.has(sug.formFieldId)));
      }

      if (fieldsToAnalyze.length === 0) return;

      const confirmedMappingKeys = new Set(formMappings.map(m => m.subFieldKey ? `${m.formFieldId}-${m.subFieldKey}` : m.formFieldId));
      const existingSuggestionKeys = new Set(suggestedMappings.map(s => s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId));

      const fieldsToSuggestFor = fieldsToAnalyze.filter(field => {
        const fieldMappableItems = getMappableItems([field]);
        if (fieldMappableItems.length === 0) return false;

        return fieldMappableItems.some(item => {
          const key = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
          return !confirmedMappingKeys.has(key) && !dismissedSuggestionKeys.has(key) && !existingSuggestionKeys.has(key);
        });
      });

      if (fieldsToSuggestFor.length === 0) return;

      console.log('[DEBUG] Fields to suggest for:', fieldsToSuggestFor.map(f => ({ id: f.id, type: f.type })));

      const keysToAnalyze = new Set<string>();
      const mappableItemsToAnalyze = getMappableItems(fieldsToSuggestFor);
      mappableItemsToAnalyze.forEach(item => {
        const key = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
        if (!confirmedMappingKeys.has(key) && !dismissedSuggestionKeys.has(key) && !existingSuggestionKeys.has(key)) {
          keysToAnalyze.add(key);
        }
      });
      setAnalyzingMappingKeys(prev => new Set([...prev, ...keysToAnalyze]));

      // Generate fallback suggestions using DEFAULT_SUBFIELD_MAPPINGS
      const generateFallbackSuggestions = (): EHRMappingSuggestion[] => {
        const fallbackSuggestions: EHRMappingSuggestion[] = [];

        console.log('[DEBUG] Generating fallback suggestions for fields:', fieldsToSuggestFor.map(f => ({ id: f.id, type: f.type, label: f.label })));

        for (const field of fieldsToSuggestFor) {
          const fieldMappableItems = getMappableItems([field]);
          console.log('[DEBUG] Field', field.id, 'mappable items:', fieldMappableItems);

          for (const item of fieldMappableItems) {
            const mappingKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;

            // Skip if already has mapping or suggestion
            if (confirmedMappingKeys.has(mappingKey) ||
                existingSuggestionKeys.has(mappingKey) ||
                dismissedSuggestionKeys.has(mappingKey)) {
              console.log('[DEBUG] Skipping', mappingKey, '- already mapped/suggested/dismissed');
              continue;
            }

            // Check if we have a default mapping for this subfield
            if (item.subFieldKey && DEFAULT_SUBFIELD_MAPPINGS[item.subFieldKey]) {
              console.log('[DEBUG] Adding suggestion for', item.subFieldKey, '->', DEFAULT_SUBFIELD_MAPPINGS[item.subFieldKey]);
              fallbackSuggestions.push({
                formFieldId: item.formFieldId,
                subFieldKey: item.subFieldKey,
                ehrField: DEFAULT_SUBFIELD_MAPPINGS[item.subFieldKey],
                reason: `Default mapping for "${item.label}" based on field type.`
              });
            } else if (!item.subFieldKey) {
              // Check for default field type mappings
              const field = formFields.find(f => f.id === item.formFieldId);
              if (field) {
                const defaultMapping = DEFAULT_FIELD_TYPE_MAPPINGS[field.type];
                if (defaultMapping) {
                  console.log('[DEBUG] Adding suggestion for field type', field.type, '->', defaultMapping);
                  fallbackSuggestions.push({
                    formFieldId: item.formFieldId,
                    ehrField: defaultMapping,
                    reason: `Default mapping for ${field.type} field.`
                  });
                }
              }
            }
          }
        }

        console.log('[DEBUG] Generated fallback suggestions:', fallbackSuggestions);
        return fallbackSuggestions;
      };

      try {
        let newSuggestions: EHRMappingSuggestion[] = [];

        console.log('[DEBUG] fetchSuggestions called - fieldsToSuggestFor:', fieldsToSuggestFor.length, 'geminiApiKey:', !!geminiApiKey);

        if (geminiApiKey) {
          // Use AI for suggestions
          console.log('[DEBUG] Calling suggestEHRMappings...');
          try {
            newSuggestions = await suggestEHRMappings(geminiApiKey, fieldsToSuggestFor);
            console.log('[DEBUG] AI suggestions returned:', newSuggestions);
          } catch (aiError) {
            console.error('[DEBUG] AI call failed:', aiError);
            throw aiError; // Re-throw to use fallback
          }
        } else {
          // Use fallback suggestions when no API key
          newSuggestions = generateFallbackSuggestions();
        }

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
        // On AI error, fall back to default suggestions
        const fallbackSuggestions = generateFallbackSuggestions();
        setSuggestedMappings(prev => {
          const updatedSuggestions = [...prev];
          const currentSuggestionKeys = new Set(prev.map(s => s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId));

          fallbackSuggestions.forEach(newSug => {
            const key = newSug.subFieldKey ? `${newSug.formFieldId}-${newSug.subFieldKey}` : newSug.formFieldId;
            if (!currentSuggestionKeys.has(key) && !dismissedSuggestionKeys.has(key) && !confirmedMappingKeys.has(key)) {
              updatedSuggestions.push(newSug);
            }
          });
          return updatedSuggestions.filter(sug => currentFieldsMap.has(sug.formFieldId));
        });
      } finally {
        setAnalyzingMappingKeys(prev => {
          const newSet = new Set(prev);
          keysToAnalyze.forEach(key => newSet.delete(key));
          return newSet;
        });
      }
    };

    fetchSuggestions();
  }, [debouncedFields, formMappings, geminiApiKey, dismissedSuggestionKeys]);

  const canDragAndDrop = !proposedAiFields;

  const { fieldsToAdd, fieldIdsToRemove } = useMemo(() => {
    if (!proposedAiFields) {
      return { fieldsToAdd: [], fieldIdsToRemove: new Set<string>() };
    }

    const existingFieldIds = new Set(formFields.map(f => f.id));
    const newFieldIds = new Set(proposedAiFields.map(f => f.id));

    const toAdd = proposedAiFields.filter(f => !existingFieldIds.has(f.id));
    const toRemove = new Set(formFields.filter(f => !newFieldIds.has(f.id)).map(f => f.id));

    return { fieldsToAdd: toAdd, fieldIdsToRemove: toRemove };
  }, [formFields, proposedAiFields]);

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
      case FormFieldType.RATING_SCALE:
        newField.ratingScale = 5;
        break;
      case FormFieldType.NOTE:
        newField.label = 'This is an instructional note for the user.';
        break;
      case FormFieldType.PERSONAL_INFO:
        newField.label = 'Patient Information';
        newField.personalInfo = {
          includeFullName: true, includePreferredName: true, includeMiddleName: true,
          includeGender: true, includePronouns: true, includeAddress: true,
          includeDOB: true, includeOccupation: true, includeReferralSource: true,
          includeRelationshipStatus: true, includeContactInfo: true,
        };
        break;
      case FormFieldType.HEALTH_INSURANCE:
        newField.label = 'Health Insurance Information';
        newField.healthInsurance = {
          includePolicyHolder: true, includePayerId: true, includeName: true,
          includeCoverageType: true, includeGender: true, includeMemberId: true,
          includeDob: true, includePlanId: true, includePhoneNumber: true,
          includeGroupId: true, includeAddress: true, includeCopay: true,
          includePayerName: true, includeDeductible: true,
        };
        break;
      case FormFieldType.VITALS:
        newField.label = 'Vitals & Measurements';
        newField.vitals = {
          includeHeight: true, includeWeight: true, includeBmi: true,
          includeBloodPressure: true, includeHeartRate: true,
          includeTemperature: true, includeRespiratoryRate: true,
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
      case FormFieldType.UNIVERSAL_AGREEMENT:
        newField.label = 'Agreement Title';
        newField.agreementText = 'Please paste your terms, conditions, or agreement text here.';
        newField.universalAgreement = {
          includePrintedName: true,
          includeDate: true,
        };
        newField.required = true;
        break;
      case FormFieldType.NUMERIC:
        newField.minValue = 0;
        newField.maxValue = 100;
        break;
    }

    // Add default mappings
    const newMappings: EHRMapping[] = [];

    // Handle composite field sub-field mappings
    if (type === FormFieldType.PERSONAL_INFO && newField.personalInfo) {
      Object.keys(newField.personalInfo).forEach(key => {
        if (newField.personalInfo![key as keyof PersonalInfoSelection]) {
          const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
          if (ehrField) {
            newMappings.push({
              formFieldId: newField.id,
              subFieldKey: key,
              ehrField
            });
          }
        }
      });
    } else if (type === FormFieldType.HEALTH_INSURANCE && newField.healthInsurance) {
      Object.keys(newField.healthInsurance).forEach(key => {
        if (newField.healthInsurance![key as keyof HealthInsuranceSelection]) {
          const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
          if (ehrField) {
            newMappings.push({
              formFieldId: newField.id,
              subFieldKey: key,
              ehrField
            });
          }
        }
      });
    } else if (type === FormFieldType.VITALS && newField.vitals) {
      Object.keys(newField.vitals).forEach(key => {
        if (newField.vitals![key as keyof VitalsSelection]) {
          const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
          if (ehrField) {
            newMappings.push({
              formFieldId: newField.id,
              subFieldKey: key,
              ehrField
            });
          }
        }
      });
    } else if (type === FormFieldType.MEDICATION_HISTORY && newField.medicationHistory) {
      Object.keys(newField.medicationHistory).forEach(key => {
        if (newField.medicationHistory![key as keyof MedicationHistorySelection]) {
          const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
          if (ehrField) {
            newMappings.push({
              formFieldId: newField.id,
              subFieldKey: key,
              ehrField
            });
          }
        }
      });
    } else {
      // Handle simple field type mappings
      const defaultMapping = DEFAULT_FIELD_TYPE_MAPPINGS[type];
      if (defaultMapping) {
        newMappings.push({ formFieldId: newField.id, ehrField: defaultMapping });
      }
    }

    if (newMappings.length > 0) {
      setFormMappings(prev => [...prev, ...newMappings]);
    }

    setFormFields(prev => {
      const newFields = [...prev];
      newFields.splice(index, 0, newField);
      return newFields;
    });
    setSelectedFieldId(newField.id);
  };

  const removeField = (id: string) => {
    setFormFields(prev => prev.filter(field => field.id !== id));
    setFormMappings(prev => prev.filter(m => m.formFieldId !== id));
    setSuggestedMappings(prev => prev.filter(s => s.formFieldId !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const updateField = useCallback((id: string, newProps: Partial<FormField>) => {
    setFormFields(prev => prev.map(field => field.id === id ? { ...field, ...newProps } : field));
  }, []);

  const handleDragStart = (e: React.DragEvent, item: { type: FormFieldType } | { id: string }) => {
    setIsDragging(true);
    if ('id' in item) {
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
      const index = formFields.findIndex(f => f.id === id);
      if (index === -1) return;

      const rect = fieldElement.getBoundingClientRect();
      const isAbove = e.clientY < rect.top + rect.height / 2;
      setDropIndicator(isAbove ? index : index + 1);
    } else if (formFields.length === 0) {
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

    if (newFieldType) {
      const tool = allToolboxElements.find(t => t.type === newFieldType);
      if (tool) {
        addFieldAtIndex(newFieldType, tool.label, targetIndex);
      }
    } else if (fieldId) {
      const draggedIndex = formFields.findIndex(f => f.id === fieldId);
      if (draggedIndex === -1) return;

      const newFields = [...formFields];
      const [draggedItem] = newFields.splice(draggedIndex, 1);
      const adjustedIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
      newFields.splice(adjustedIndex, 0, draggedItem);
      setFormFields(newFields);
    }
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      alert('Please enter a name for the form before saving.');
      return;
    }

    // Check if we have API key for AI mapping suggestions
    if (geminiApiKey && formFields.length > 0) {
      setIsFetchingMappingSuggestions(true);
      try {
        // Get AI mapping suggestions
        const suggestions = await suggestEHRMappings(geminiApiKey, formFields);

        // Filter out already mapped items
        const mappedKeys = new Set(formMappings.map(m => m.subFieldKey ? `${m.formFieldId}-${m.subFieldKey}` : m.formFieldId));
        const newSuggestions = suggestions.filter(s => {
          const key = s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId;
          return !mappedKeys.has(key);
        });

        setPendingSaveMappings(newSuggestions);
        setShowEHRMappingModal(true);
      } catch (error) {
        console.error('Failed to get mapping suggestions:', error);
        // If AI fails, just save directly
        performSave();
      } finally {
        setIsFetchingMappingSuggestions(false);
      }
    } else {
      // No API key or no fields, save directly
      performSave();
    }
  };

  const performSave = (additionalMappings: EHRMapping[] = []) => {
    const form: FormTemplate = {
      id: editingFormId || `form_custom_${formName.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}`,
      title: formName.trim(),
      description: existingForm ? existingForm.description : 'A custom form created in the composer.',
      category: existingForm ? existingForm.category : 'Practice Forms',
      fields: formFields,
      mappings: [...formMappings, ...additionalMappings],
    };

    onSaveForm(form);
    setShowEHRMappingModal(false);
  };

  // Helper function to get display label for suggestions
  const getDisplayLabelForSuggestion = (suggestion: EHRMappingSuggestion): string => {
    const originalField = formFields.find(f => f.id === suggestion.formFieldId);
    if (!originalField) return 'Unknown Field';

    let displayLabel = originalField.label;
    if (suggestion.subFieldKey) {
      const key = suggestion.subFieldKey;
      const labelMaps: Record<FormFieldType, Record<string, string>> = {
        [FormFieldType.PERSONAL_INFO]: personalInfoLabels,
        [FormFieldType.HEALTH_INSURANCE]: healthInsuranceLabels,
        [FormFieldType.MEDICATION_HISTORY]: medicationHistoryLabels,
        [FormFieldType.VITALS]: vitalsLabels,
        [FormFieldType.SECTION_HEADER]: {},
        [FormFieldType.NOTE]: {},
        [FormFieldType.IMAGE]: {},
        [FormFieldType.COMPANY_HEADER]: {},
        [FormFieldType.TEXT_INPUT]: {},
        [FormFieldType.TEXTAREA]: {},
        [FormFieldType.EMAIL]: {},
        [FormFieldType.PHONE]: {},
        [FormFieldType.RADIO_GROUP]: {},
        [FormFieldType.CHECKBOX_GROUP]: {},
        [FormFieldType.CHECKBOX]: {},
        [FormFieldType.DROPDOWN]: {},
        [FormFieldType.YES_NO]: {},
        [FormFieldType.DATE_PICKER]: {},
        [FormFieldType.DATETIME_PICKER]: {},
        [FormFieldType.TIME_PICKER]: {},
        [FormFieldType.NUMERIC]: {},
        [FormFieldType.RATING_SCALE]: {},
        [FormFieldType.SIGNATURE]: {},
        [FormFieldType.RICH_TEXT]: {},
        [FormFieldType.PAYMENT_DETAILS]: {},
        [FormFieldType.UNIVERSAL_AGREEMENT]: {},
      };
      const map = labelMaps[originalField.type];
      if (map && key in map) {
        displayLabel = (map as any)[key];
      }
    }
    return displayLabel;
  };

  const handleAcceptAiSuggestions = () => {
    if (proposedAiFields) {
      // Generate automatic mappings for composite fields
      const newMappings: EHRMapping[] = [];

      proposedAiFields.forEach((field: FormField) => {
        if (field.type === FormFieldType.PERSONAL_INFO && field.personalInfo) {
          Object.keys(field.personalInfo).forEach(key => {
            if (field.personalInfo![key as keyof PersonalInfoSelection]) {
              const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
              if (ehrField) {
                newMappings.push({
                  formFieldId: field.id,
                  subFieldKey: key,
                  ehrField
                });
              }
            }
          });
        } else if (field.type === FormFieldType.HEALTH_INSURANCE && field.healthInsurance) {
          Object.keys(field.healthInsurance).forEach(key => {
            if (field.healthInsurance![key as keyof HealthInsuranceSelection]) {
              const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
              if (ehrField) {
                newMappings.push({
                  formFieldId: field.id,
                  subFieldKey: key,
                  ehrField
                });
              }
            }
          });
        } else if (field.type === FormFieldType.VITALS && field.vitals) {
          Object.keys(field.vitals).forEach(key => {
            if (field.vitals![key as keyof VitalsSelection]) {
              const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
              if (ehrField) {
                newMappings.push({
                  formFieldId: field.id,
                  subFieldKey: key,
                  ehrField
                });
              }
            }
          });
        } else if (field.type === FormFieldType.MEDICATION_HISTORY && field.medicationHistory) {
          Object.keys(field.medicationHistory).forEach(key => {
            if (field.medicationHistory![key as keyof MedicationHistorySelection]) {
              const ehrField = DEFAULT_SUBFIELD_MAPPINGS[key];
              if (ehrField) {
                newMappings.push({
                  formFieldId: field.id,
                  subFieldKey: key,
                  ehrField
                });
              }
            }
          });
        } else {
          // Handle simple field type mappings
          const defaultMapping = DEFAULT_FIELD_TYPE_MAPPINGS[field.type];
          if (defaultMapping) {
            newMappings.push({ formFieldId: field.id, ehrField: defaultMapping });
          }
        }
      });

      setFormMappings(prev => [...prev, ...newMappings]);
      setFormFields(proposedAiFields);
      setProposedAiFields(null);
    }
  };

  const handleRejectAiSuggestions = () => {
    setProposedAiFields(null);
  };

  const selectedField = useMemo(
    () => formFields.find((f: FormField) => f.id === selectedFieldId) || null,
    [formFields, selectedFieldId]
  );

  // Mappings Panel Component
  const MappingsPanel = () => {
    if (!selectedField) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
          <p className="text-sm text-slate-500 text-center py-8">
            Select a field to manage EHR mappings
          </p>
        </div>
      );
    }

    // Get mappable items for this field
    const fieldMappableItems = getMappableItems([selectedField]);

    if (fieldMappableItems.length === 0) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">EHR Mappings</h3>
          <p className="text-sm text-slate-500 text-center py-8">
            This field type cannot be mapped to EHR fields.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Database className="h-4 w-4" />
          EHR Mappings
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Connect form fields to patient EHR data. When a patient submits this form, their responses will automatically update their profile.
        </p>

        <div className="space-y-3">
          {fieldMappableItems.map((item) => {
            const mappingKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
            const existingMapping = formMappings.find(m => {
              const mKey = m.subFieldKey ? `${m.formFieldId}-${m.subFieldKey}` : m.formFieldId;
              return mKey === mappingKey;
            });
            const suggestion = suggestedMappings.find(s => {
              const sKey = s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId;
              return sKey === mappingKey;
            });

            const isAnalyzing = analyzingMappingKeys.has(mappingKey);

            return (
              <div key={mappingKey} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </span>
                  {existingMapping && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      Mapped
                    </span>
                  )}
                  {suggestion && !existingMapping && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Suggested
                    </span>
                  )}
                  {isAnalyzing && !existingMapping && !suggestion && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyzing...
                    </span>
                  )}
                </div>

                {/* Existing mapping display */}
                {existingMapping && (
                  <div className="mb-2 p-2 bg-white rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Database className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-blue-700 truncate" title={existingMapping.ehrField}>
                          {existingMapping.ehrField}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setFormMappings(prev => prev.filter(m => {
                            const mKey = m.subFieldKey ? `${m.formFieldId}-${m.subFieldKey}` : m.formFieldId;
                            return mKey !== mappingKey;
                          }));
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remove mapping"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggestion display with accept/reject */}
                {suggestion && !existingMapping && (
                  <div className="mb-2 p-2 bg-white rounded border border-purple-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Database className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm text-purple-700 truncate" title={suggestion.ehrField}>
                          {suggestion.ehrField}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{suggestion.reason}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFormMappings(prev => [...prev, {
                            formFieldId: suggestion.formFieldId,
                            ehrField: suggestion.ehrField,
                            subFieldKey: suggestion.subFieldKey,
                          }]);
                          setSuggestedMappings(prev => prev.filter(s => {
                            const sKey = s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId;
                            return sKey !== mappingKey;
                          }));
                        }}
                        className="flex-1 text-xs bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const key = suggestion.subFieldKey
                            ? `${suggestion.formFieldId}-${suggestion.subFieldKey}`
                            : suggestion.formFieldId;
                          setDismissedSuggestionKeys(prev => new Set([...prev, key]));
                          setSuggestedMappings(prev => prev.filter(s => {
                            const sKey = s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId;
                            return sKey !== mappingKey;
                          }));
                        }}
                        className="flex-1 text-xs bg-slate-200 text-slate-700 py-1 px-2 rounded hover:bg-slate-300 transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual mapping selector - shown when no existing mapping or suggestion */}
                {!existingMapping && !suggestion && !isAnalyzing && (
                  <div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormMappings(prev => [...prev, {
                            formFieldId: item.formFieldId,
                            ehrField: e.target.value,
                            subFieldKey: item.subFieldKey,
                          }]);
                        }
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Map to EHR field...</option>
                      {EHR_FIELD_PATHS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.category} - {field.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            className="text-xl font-bold text-slate-800 border-none focus:ring-0 focus:outline-none bg-transparent"
            placeholder="Untitled Form"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAiAssistantOpen
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </button>
          <button
            onClick={handleSaveForm}
            disabled={isFetchingMappingSuggestions}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isFetchingMappingSuggestions ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Form
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto">
          {TOOLBOX_CATEGORIES.map(category => (
            <div key={category.name} className="mb-4">
              <h4 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {category.name}
              </h4>
              {category.elements.map(element => (
                <div
                  key={element.type}
                  draggable
                  onDragStart={e => handleDragStart(e, { type: element.type })}
                  className="mx-2 mb-1 p-2 bg-white border border-slate-200 rounded-md hover:border-blue-400 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all flex items-center gap-2"
                >
                  <span className="text-lg">{element.emoji}</span>
                  <span className="text-sm text-slate-700">{element.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div
            className="max-w-2xl mx-auto space-y-2"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {formFields.length === 0 && !proposedAiFields ? (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-500">Drag and drop form fields from the toolbox to get started</p>
                <p className="text-sm text-slate-400 mt-2">Or use the AI Assistant to generate a form automatically</p>
              </div>
            ) : (
              <>
                {/* Render existing fields */}
                {formFields.map((field, index) => {
                  // Get mapping status for this field
                  const fieldMappableItems = getMappableItems([field]);
                  const mappedCount = fieldMappableItems.filter(item => {
                    const mappingKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
                    return formMappings.some(m => {
                      const mKey = m.subFieldKey ? `${m.formFieldId}-${m.subFieldKey}` : m.formFieldId;
                      return mKey === mappingKey;
                    });
                  }).length;

                  const suggestionCount = fieldMappableItems.filter(item => {
                    const mappingKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
                    return suggestedMappings.some(s => {
                      const sKey = s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId;
                      return sKey === mappingKey;
                    });
                  }).length;

                  return (
                    <div key={field.id}>
                      {dropIndicator === index && <DropIndicator />}
                      <div
                        data-field-id={field.id}
                        draggable
                        onDragStart={e => handleDragStart(e, { id: field.id })}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedFieldId(field.id)}
                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedFieldId === field.id
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs font-medium text-slate-500 uppercase">
                                {field.type.replace(/_/g, ' ')}
                              </span>
                              {field.required && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                              )}
                              {mappedCount > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Link2 className="h-3 w-3" />
                                  {mappedCount} Mapped
                                </span>
                              )}
                              {suggestionCount > 0 && mappedCount === 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  {suggestionCount} Suggested
                                </span>
                              )}
                            </div>
                            <FormPreview
                              field={field}
                              confirmedMappings={formMappings}
                              suggestedMappings={suggestedMappings}
                              analyzingMappingKeys={analyzingMappingKeys}
                              onViewMapping={(fieldId: string, _subFieldKey?: string) => {
                                setSelectedFieldId(fieldId);
                                setActiveSidePanelTab('mappings');
                              }}
                              onViewSuggestion={(suggestion: EHRMappingSuggestion) => {
                                setSelectedFieldId(suggestion.formFieldId);
                                setActiveSidePanelTab('mappings');
                              }}
                            />
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); removeField(field.id); }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Render proposed AI fields with highlight/preview styling */}
                {proposedAiFields && proposedAiFields.map((field, index) => {
                  const displayIndex = formFields.length + index;
                  const fieldMappableItems = getMappableItems([field]);
                  const mappedCount = fieldMappableItems.filter(item => {
                    const mappingKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
                    return formMappings.some(m => {
                      const mKey = m.subFieldKey ? `${m.formFieldId}-${m.subFieldKey}` : m.formFieldId;
                      return mKey === mappingKey;
                    });
                  }).length;

                  const suggestionCount = fieldMappableItems.filter(item => {
                    const mappingKey = item.subFieldKey ? `${item.formFieldId}-${item.subFieldKey}` : item.formFieldId;
                    return suggestedMappings.some(s => {
                      const sKey = s.subFieldKey ? `${s.formFieldId}-${s.subFieldKey}` : s.formFieldId;
                      return sKey === mappingKey;
                    });
                  }).length;

                  return (
                    <div key={`proposed-${field.id}`}>
                      {dropIndicator === displayIndex && <DropIndicator />}
                      <div
                        data-field-id={field.id}
                        draggable={false}
                        className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 border-dashed rounded-lg p-4 relative transition-all"
                      >
                        {/* Preview badge */}
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles className="h-3 w-3" />
                          AI Preview
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 text-blue-400 mt-1">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs font-medium text-blue-600 uppercase">
                                {field.type.replace(/_/g, ' ')}
                              </span>
                              {field.required && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                              )}
                              {mappedCount > 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Link2 className="h-3 w-3" />
                                  {mappedCount} Mapped
                                </span>
                              )}
                              {suggestionCount > 0 && mappedCount === 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  {suggestionCount} Suggested
                                </span>
                              )}
                            </div>
                            <FormPreview
                              field={field}
                              confirmedMappings={formMappings}
                              suggestedMappings={suggestedMappings}
                              analyzingMappingKeys={analyzingMappingKeys}
                              onViewMapping={(fieldId: string, _subFieldKey?: string) => {
                                setSelectedFieldId(fieldId);
                                setActiveSidePanelTab('mappings');
                              }}
                              onViewSuggestion={(suggestion: EHRMappingSuggestion) => {
                                setSelectedFieldId(suggestion.formFieldId);
                                setActiveSidePanelTab('mappings');
                              }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              // Remove this field from proposed fields
                              setProposedAiFields(prev => prev?.filter(f => f.id !== field.id) || null);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove this field"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {dropIndicator === (formFields.length + (proposedAiFields?.length || 0)) && <DropIndicator />}
          </div>
        </div>

        {/* Properties Panel with Mappings Tab */}
        <div className="w-80 bg-slate-50 border-l border-slate-200 overflow-y-auto">
          <div className="p-4">
            {/* Tab Navigation */}
            {selectedField && (
              <div className="flex border-b border-slate-200 mb-4">
                <button
                  onClick={() => setActiveSidePanelTab('properties')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    activeSidePanelTab === 'properties'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setActiveSidePanelTab('mappings')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    activeSidePanelTab === 'mappings'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Database className="h-3.5 w-3.5" />
                  Mappings
                </button>
              </div>
            )}
            {activeSidePanelTab === 'properties' ? (
              <PropertiesPanel
                key={selectedFieldId || 'none'}
                selectedField={selectedField}
                updateField={updateField}
                setFormMappings={setFormMappings}
              />
            ) : <MappingsPanel />}
          </div>
        </div>

        {/* AI Assistant Panel */}
        {isAiAssistantOpen && (
          <div className="w-80 border-l border-slate-200 overflow-y-auto">
            <div className="p-4">
              <AiAssistantPanel
                onClose={() => setIsAiAssistantOpen(false)}
                onGenerated={setProposedAiFields}
                existingFields={formFields}
                apiKey={geminiApiKey}
                onApiKeyRequired={onApiKeyRequired}
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Action Bar */}
      {proposedAiFields && (
        <AiActionBar
          fieldsToAddCount={fieldsToAdd.length}
          fieldsToRemoveCount={fieldIdsToRemove.size}
          onAccept={handleAcceptAiSuggestions}
          onReject={handleRejectAiSuggestions}
        />
      )}

      {/* EHR Mapping Modal */}
      <EHRMappingModal
        isOpen={showEHRMappingModal}
        onCancel={() => {
          setShowEHRMappingModal(false);
          setPendingSaveMappings([]);
        }}
        onSaveWithoutMappings={() => performSave()}
        suggestions={pendingSaveMappings}
        onConfirm={(mappings) => performSave(mappings)}
        formFields={formFields}
      />

      {/* Suggestion Review Modal */}
      <SuggestionReviewModal
        isOpen={showSuggestionReviewModal}
        onClose={() => {
          setShowSuggestionReviewModal(false);
          setPendingSuggestion(null);
        }}
        suggestion={pendingSuggestion}
        onAccept={(suggestion) => {
          if (suggestion) {
            setFormMappings(prev => [...prev, {
              formFieldId: suggestion.formFieldId,
              ehrField: suggestion.ehrField,
              subFieldKey: suggestion.subFieldKey,
            }]);
          }
          setShowSuggestionReviewModal(false);
          setPendingSuggestion(null);
        }}
        onReject={(suggestion) => {
          if (suggestion) {
            const key = suggestion.subFieldKey
              ? `${suggestion.formFieldId}-${suggestion.subFieldKey}`
              : suggestion.formFieldId;
            setDismissedSuggestionKeys(prev => new Set([...prev, key]));
          }
          setShowSuggestionReviewModal(false);
          setPendingSuggestion(null);
        }}
        getDisplayLabel={getDisplayLabelForSuggestion}
      />
    </div>
  );
};
