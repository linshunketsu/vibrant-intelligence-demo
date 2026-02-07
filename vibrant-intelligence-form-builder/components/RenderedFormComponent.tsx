import React, { useState, useRef, DragEvent } from 'react';
import { FormField, FormFieldType, EHRMapping, EHRMappingSuggestion } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { LinkIcon } from './icons/LinkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { EHR_FIELD_PATHS } from '../constants';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';

interface RenderedFormComponentProps {
  field: FormField;
  confirmedMappings?: EHRMapping[];
  suggestedMappings?: EHRMappingSuggestion[];
  analyzingMappingKeys?: Set<string>;
  onViewMapping?: (fieldId: string, subFieldKey?: string) => void;
  onViewSuggestion?: (suggestion: EHRMappingSuggestion) => void;
}

const getEHRFieldLabel = (ehrField: string) => {
    const fieldInfo = EHR_FIELD_PATHS.find(p => p.value === ehrField);
    return fieldInfo ? fieldInfo.label : ehrField;
};

const MappingIndicator: React.FC<{
    variant: 'mapped' | 'unmapped' | 'suggested' | 'analyzing';
    tooltipText: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ variant, tooltipText, onClick }) => {
    const baseClasses = `p-1 rounded-full shadow-sm transition-all duration-150 focus-within:opacity-100`;
    const hoverClasses = variant === 'analyzing' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';
    
    const variantConfig = {
        mapped: {
            classes: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            icon: <LinkIcon className="h-4 w-4" />
        },
        unmapped: {
            classes: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            icon: <LinkIcon className="h-4 w-4" />
        },
        suggested: {
            classes: 'bg-purple-100 text-purple-600 hover:bg-purple-200 animate-pulse',
            icon: <SparklesIcon className="h-4 w-4" />
        },
        analyzing: {
            classes: 'bg-slate-100 text-slate-500 animate-spin',
            icon: <SpinnerIcon className="h-4 w-4" />
        }
    };
    
    return (
        <button
            onClick={onClick}
            title={tooltipText}
            className={`${baseClasses} ${hoverClasses} ${variantConfig[variant].classes}`}
            aria-label={tooltipText}
            disabled={variant === 'analyzing'}
        >
            {variantConfig[variant].icon}
        </button>
    );
};


const SubField: React.FC<{
    label: string;
    children: React.ReactNode;
    fieldId: string;
    subFieldKey: string;
    confirmedMappings: EHRMapping[];
    suggestedMappings?: EHRMappingSuggestion[];
    analyzingMappingKeys?: Set<string>;
    onViewMapping?: (fieldId: string, subFieldKey: string) => void;
    onViewSuggestion?: (suggestion: EHRMappingSuggestion) => void;
}> = ({ label, children, fieldId, subFieldKey, confirmedMappings, suggestedMappings, analyzingMappingKeys, onViewMapping, onViewSuggestion }) => {
    
    const key = `${fieldId}-${subFieldKey}`;
    const isAnalyzing = analyzingMappingKeys?.has(key);
    const confirmedMapping = confirmedMappings.find(m => m.formFieldId === fieldId && m.subFieldKey === subFieldKey);
    const suggestion = suggestedMappings?.find(s => s.formFieldId === fieldId && s.subFieldKey === subFieldKey);

    let indicator = null;
    if (onViewMapping) {
        if (isAnalyzing) {
             indicator = <MappingIndicator variant="analyzing" tooltipText={`Analyzing: ${label}...`} />;
        } else {
            let variant: 'mapped' | 'unmapped' | 'suggested' = 'unmapped';
            let tooltipText = `Not Mapped: ${label}. Click to configure.`;
            let clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onViewMapping(fieldId, subFieldKey); };

            if (confirmedMapping) {
                variant = 'mapped';
                tooltipText = `Mapped: ${label} -> ${getEHRFieldLabel(confirmedMapping.ehrField)}`;
            } else if (suggestion && onViewSuggestion) {
                variant = 'suggested';
                tooltipText = `AI Suggestion for ${label}. Click to review.`;
                clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onViewSuggestion(suggestion); };
            }
            
            indicator = <MappingIndicator variant={variant} tooltipText={tooltipText} onClick={clickHandler} />;
        }
    }
        
    return (
        <div className="group">
            <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-slate-700">{label}</label>
                {indicator}
            </div>
            {children}
        </div>
    );
};


const ImageUploadComponent: React.FC<{ field: FormField }> = ({ field }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { label, required, helpText } = field;

    const renderLabel = () => (
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );

    const renderHelpText = () => {
        if (!helpText) return null;
        return <p className="mt-1 text-xs text-slate-500">{helpText}</p>;
    };

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        const files = e.dataTransfer.files;
        handleFileChange(files);
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div>
            {renderLabel()}
            {renderHelpText()}
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files)}
                accept="image/*"
                className="hidden"
            />
            {imagePreview ? (
                <div className="mt-1 relative group">
                    <img src={imagePreview} alt="Preview" className="w-full aspect-video object-cover rounded-md border border-slate-300" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <button 
                            onClick={handleRemoveImage}
                            className="px-4 py-2 bg-white text-slate-800 text-sm font-semibold rounded-md hover:bg-slate-200 transition-colors"
                        >
                            Change Image
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={triggerFileSelect}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload an image"
                    className={`mt-1 w-full aspect-video border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isDraggingOver ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="mt-2 text-sm text-slate-500">
                        <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">PNG, JPG, or GIF</p>
                </div>
            )}
        </div>
    );
};

export const RenderedFormComponent: React.FC<RenderedFormComponentProps> = ({ field, confirmedMappings = [], suggestedMappings, analyzingMappingKeys, onViewMapping, onViewSuggestion }) => {
  const { type, label, placeholder, options, required, helpText } = field;

  const renderHelpText = () => {
    if (!helpText) return null;
    return <p className="mt-1 text-xs text-slate-500">{helpText}</p>;
  };
  
  const getSimpleFieldIndicator = () => {
      if (!onViewMapping || !confirmedMappings) return null;
      
      const isAnalyzing = analyzingMappingKeys?.has(field.id);
      if (isAnalyzing) {
          return <MappingIndicator variant="analyzing" tooltipText={`Analyzing: ${field.label}...`} />;
      }
      
      const confirmedMapping = confirmedMappings.find(m => m.formFieldId === field.id && !m.subFieldKey);
      const suggestion = suggestedMappings?.find(s => s.formFieldId === field.id && !s.subFieldKey);

      let variant: 'mapped' | 'unmapped' | 'suggested' = 'unmapped';
      let tooltipText = `${field.label}: Not Mapped`;
      let clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onViewMapping(field.id); };

      if (confirmedMapping) {
          variant = 'mapped';
          tooltipText = `${field.label} -> ${getEHRFieldLabel(confirmedMapping.ehrField)}`;
      } else if (suggestion && onViewSuggestion) {
          variant = 'suggested';
          tooltipText = `AI Suggestion for ${field.label}. Click to review.`;
          clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onViewSuggestion(suggestion); };
      }

      return <MappingIndicator variant={variant} tooltipText={tooltipText} onClick={clickHandler} />;
  };

  const renderLabelWithIndicator = (customLabel?: string) => (
      <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-slate-700">
              {customLabel || label}
              {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {getSimpleFieldIndicator()}
      </div>
  );
  
  switch (type) {
    case FormFieldType.TEXT_INPUT:
      return (
        <div className="group">
            {renderLabelWithIndicator()}
            <input
                type="text"
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                disabled
            />
            {renderHelpText()}
        </div>
      );
    case FormFieldType.TEXTAREA:
        return (
            <div className="group">
                {renderLabelWithIndicator()}
                <textarea
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    rows={field.rows || 3}
                    disabled
                />
                {renderHelpText()}
            </div>
        );
    case FormFieldType.CHECKBOX:
        return (
            <div className="group">
                <div className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" disabled />
                    <label className="block text-sm text-slate-900">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
                    {getSimpleFieldIndicator()}
                </div>
                {renderHelpText()}
            </div>
        );
    case FormFieldType.CHECKBOX_GROUP:
        return (
            <div className="group">
                {renderLabelWithIndicator()}
                {renderHelpText()}
                <div className="space-y-2 mt-1">
                    {options?.map((opt, index) => (
                        <div key={index} className="flex items-center">
                            <input type="checkbox" name={`${field.id}-${index}`} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" disabled />
                            <label className="ml-2 block text-sm text-slate-900">{opt}</label>
                        </div>
                    ))}
                </div>
            </div>
        );
    case FormFieldType.RADIO_GROUP:
        return (
            <div className="group">
                {renderLabelWithIndicator()}
                {renderHelpText()}
                <div className="space-y-2 mt-1">
                    {options?.map((opt, index) => (
                        <div key={index} className="flex items-center">
                            <input type="radio" name={field.id} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500" disabled />
                            <label className="ml-2 block text-sm text-slate-900">{opt}</label>
                        </div>
                    ))}
                </div>
            </div>
        );
    case FormFieldType.DROPDOWN:
        return (
            <div className="group">
                {renderLabelWithIndicator()}
                <div className="relative">
                    <select className="w-full appearance-none bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" disabled>
                        {placeholder && <option>{placeholder}</option>}
                        {options?.map((opt, index) => <option key={index}>{opt}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <ChevronDownIcon />
                    </div>
                </div>
                {renderHelpText()}
            </div>
        );
    case FormFieldType.DATE_PICKER:
        return (
            <div className="group">
                {renderLabelWithIndicator()}
                <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    disabled
                />
                {renderHelpText()}
            </div>
        );
    case FormFieldType.SECTION_HEADER:
        return (
            <div className="pb-2 border-b border-slate-200">
                <h2 className="text-lg font-bold text-primary-700">{label}</h2>
                {renderHelpText()}
            </div>
        );
    case FormFieldType.COMPANY_HEADER:
        return (
            <div className="flex flex-col items-center gap-2 p-2">
                {field.logoSrc && (
                    <img src={field.logoSrc} alt={`${field.label} logo`} className="h-16 w-auto max-w-full object-contain" />
                )}
                <h2 className="text-2xl font-bold text-slate-800 text-center">{field.label}</h2>
            </div>
        );
    case FormFieldType.RATING_SCALE:
      return (
          <div className="group">
            {renderLabelWithIndicator()}
            {renderHelpText()}
            <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-slate-500">Low</span>
                {Array.from({ length: field.ratingScale ?? 5 }, (_, i) => i + 1).map(num => (
                    <div key={num} className="flex flex-col items-center">
                        <label className="text-xs text-slate-600">{num}</label>
                        <input type="radio" name={field.id} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500" disabled />
                    </div>
                ))}
                <span className="text-sm text-slate-500">High</span>
            </div>
          </div>
      );
    case FormFieldType.YES_NO:
        return (
            <div className="group">
                {renderLabelWithIndicator()}
                {renderHelpText()}
                <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center">
                        <input type="radio" name={field.id} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500" disabled />
                        <label className="ml-2 block text-sm text-slate-900">Yes</label>
                    </div>
                    <div className="flex items-center">
                        <input type="radio" name={field.id} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500" disabled />
                        <label className="ml-2 block text-sm text-slate-900">No</label>
                    </div>
                </div>
            </div>
        );
    case FormFieldType.NOTE:
        return (
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">{label}</p>
            </div>
        );
    case FormFieldType.SIGNATURE:
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
                {renderHelpText()}
                <div className="mt-1 w-full h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-md flex items-center justify-center">
                    <p className="text-slate-400 italic">Signature Area</p>
                </div>
            </div>
        );
    case FormFieldType.IMAGE:
        return <ImageUploadComponent field={field} />;
    case FormFieldType.EMAIL:
      return (
        <div className="group">
            {renderLabelWithIndicator()}
            <input type="email" placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm" disabled />
            {renderHelpText()}
        </div>
      );
    case FormFieldType.PHONE:
      return (
        <div className="group">
            {renderLabelWithIndicator()}
            <input type="tel" placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm" disabled />
            {renderHelpText()}
        </div>
      );
    case FormFieldType.DATETIME_PICKER:
      return (
        <div className="group">
            {renderLabelWithIndicator()}
            <input type="datetime-local" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm" disabled />
            {renderHelpText()}
        </div>
      );
    case FormFieldType.TIME_PICKER:
      return (
        <div className="group">
            {renderLabelWithIndicator()}
            <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm sm:text-sm" disabled />
            {renderHelpText()}
        </div>
      );
    case FormFieldType.RICH_TEXT:
        return (
            <div
                className="rich-text-content text-sm text-slate-800"
                dangerouslySetInnerHTML={{ __html: field.label }}
            />
        );
    case FormFieldType.PERSONAL_INFO:
        return (
            <div>
                <div className="pb-2 mb-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-primary-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</h2>
                    {renderHelpText()}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field.personalInfo?.includeFullName && <SubField label="Full Name" fieldId={field.id} subFieldKey="includeFullName" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.personalInfo?.includePreferredName && <SubField label="Preferred Name" fieldId={field.id} subFieldKey="includePreferredName" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.personalInfo?.includeMiddleName && <SubField label="Middle Name" fieldId={field.id} subFieldKey="includeMiddleName" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.personalInfo?.includeDOB && <SubField label="Date of Birth" fieldId={field.id} subFieldKey="includeDOB" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.personalInfo?.includeGender && <SubField label="Gender" fieldId={field.id} subFieldKey="includeGender" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><select className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></SubField>}
                    {field.personalInfo?.includePronouns && <SubField label="Pronouns" fieldId={field.id} subFieldKey="includePronouns" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.personalInfo?.includeOccupation && <SubField label="Occupation" fieldId={field.id} subFieldKey="includeOccupation" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.personalInfo?.includeRelationshipStatus && <SubField label="Relationship Status" fieldId={field.id} subFieldKey="includeRelationshipStatus" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.personalInfo?.includeReferralSource && <SubField label="Referral Source" fieldId={field.id} subFieldKey="includeReferralSource" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}

                    {field.personalInfo?.includeAddress && (
                        <div className="sm:col-span-2 space-y-4 p-4 bg-slate-100 rounded-md border border-slate-200">
                            <SubField label="Address Block" fieldId={field.id} subFieldKey="includeAddress" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2"><div><label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div></div>
                                    <div className="sm:col-span-2"><div><label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">State / Province</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Zip / Postal Code</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                </div>
                            </SubField>
                        </div>
                    )}
                    
                    {field.personalInfo?.includeContactInfo && (
                        <div className="sm:col-span-2 space-y-4 p-4 bg-slate-100 rounded-md border border-slate-200">
                             <SubField label="Contact Info Block" fieldId={field.id} subFieldKey="includeContactInfo" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label><input type="email" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label><input type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                </div>
                            </SubField>
                        </div>
                    )}
                </div>
            </div>
        );
    case FormFieldType.MEDICATION_HISTORY:
        return (
            <div>
                <div className="pb-2 mb-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-primary-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</h2>
                    {renderHelpText()}
                </div>
                <div className="space-y-4">
                    {field.medicationHistory?.includeProductName && <SubField label="Product Name" fieldId={field.id} subFieldKey="includeProductName" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.medicationHistory?.includeDateRange && <SubField label="Date Range" fieldId={field.id} subFieldKey="includeDateRange" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label><input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">End Date</label><input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div></div></SubField>}
                    {field.medicationHistory?.includeDosage && <SubField label="Dosage Information" fieldId={field.id} subFieldKey="includeDosage" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.medicationHistory?.includeNotes && <SubField label="Additional Notes" fieldId={field.id} subFieldKey="includeNotes" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><textarea className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" rows={2} disabled /></SubField>}
                </div>
            </div>
        );
    case FormFieldType.HEALTH_INSURANCE:
        return (
            <div>
                <div className="pb-2 mb-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-primary-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</h2>
                    {renderHelpText()}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field.healthInsurance?.includePayerName && <SubField label="Payer Name" fieldId={field.id} subFieldKey="includePayerName" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includePayerId && <SubField label="Payer ID" fieldId={field.id} subFieldKey="includePayerId" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeMemberId && <SubField label="Member ID" fieldId={field.id} subFieldKey="includeMemberId" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeGroupId && <SubField label="Group ID" fieldId={field.id} subFieldKey="includeGroupId" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includePlanId && <SubField label="Plan ID" fieldId={field.id} subFieldKey="includePlanId" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeCoverageType && <SubField label="Coverage Type" fieldId={field.id} subFieldKey="includeCoverageType" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeCopay && <SubField label="Copay" fieldId={field.id} subFieldKey="includeCopay" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeDeductible && <SubField label="Deductible" fieldId={field.id} subFieldKey="includeDeductible" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includePhoneNumber && <SubField label="Insurance Phone Number" fieldId={field.id} subFieldKey="includePhoneNumber" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includePolicyHolder && <SubField label="Relationship to Patient" fieldId={field.id} subFieldKey="includePolicyHolder" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" placeholder="e.g., Self, Spouse, Parent" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeName && <SubField label="Policy Holder Name" fieldId={field.id} subFieldKey="includeName" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeDob && <SubField label="Policy Holder DOB" fieldId={field.id} subFieldKey="includeDob" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.healthInsurance?.includeGender && <SubField label="Policy Holder Gender" fieldId={field.id} subFieldKey="includeGender" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><select className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></SubField>}
                    
                    {field.healthInsurance?.includeAddress && (
                        <div className="sm:col-span-2 space-y-4 p-4 bg-slate-100 rounded-md border border-slate-200">
                             <SubField label="Policy Holder Address" fieldId={field.id} subFieldKey="includeAddress" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2"><div><label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div></div>
                                    <div className="sm:col-span-2"><div><label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">State / Province</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Zip / Postal Code</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                </div>
                            </SubField>
                        </div>
                    )}
                </div>
            </div>
        );
    case FormFieldType.VITALS:
        return (
            <div>
                <div className="pb-2 mb-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-primary-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</h2>
                    {renderHelpText()}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    {field.vitals?.includeHeight && <SubField label="Height (cm)" fieldId={field.id} subFieldKey="includeHeight" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.vitals?.includeWeight && <SubField label="Weight (kg)" fieldId={field.id} subFieldKey="includeWeight" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.vitals?.includeBmi && <SubField label="BMI" fieldId={field.id} subFieldKey="includeBmi" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.vitals?.includeHeartRate && <SubField label="Heart Rate (bpm)" fieldId={field.id} subFieldKey="includeHeartRate" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.vitals?.includeTemperature && <SubField label="Temperature (°C)" fieldId={field.id} subFieldKey="includeTemperature" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.vitals?.includeRespiratoryRate && <SubField label="Respiratory Rate (bpm)" fieldId={field.id} subFieldKey="includeRespiratoryRate" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.vitals?.includeOxygenSaturation && <SubField label="Oxygen Saturation (%)" fieldId={field.id} subFieldKey="includeOxygenSaturation" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></SubField>}
                    {field.vitals?.includeBloodPressure && <div className="sm:col-span-2"><SubField label="Blood Pressure" fieldId={field.id} subFieldKey="includeBloodPressure" confirmedMappings={confirmedMappings} suggestedMappings={suggestedMappings} analyzingMappingKeys={analyzingMappingKeys} onViewMapping={onViewMapping} onViewSuggestion={onViewSuggestion}><div className="flex items-center gap-2"><div><label className="block text-sm font-medium text-slate-700 mb-1">Systolic (mmHg)</label><input type="number" placeholder="Systolic" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div><span className="text-slate-500 pt-6">/</span><div><label className="block text-sm font-medium text-slate-700 mb-1">Diastolic (mmHg)</label><input type="number" placeholder="Diastolic" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div></div></SubField></div>}
                </div>
            </div>
        );
    case FormFieldType.PAYMENT_DETAILS:
        return (
            <div>
                <div className="pb-2 mb-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-primary-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</h2>
                    {renderHelpText()}
                </div>
                 <div className="space-y-4">
                    {field.paymentDetails?.includeCardDetails && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Card Details</label>
                            <div className="flex items-center gap-0 border border-slate-300 rounded-md shadow-sm bg-white">
                                <span className="pl-3 text-slate-400"><CreditCardIcon /></span>
                                <input type="text" placeholder="Card number" className="flex-grow px-3 py-2 border-0 rounded-l-md sm:text-sm focus:ring-0" disabled />
                                <input type="text" placeholder="MM / YY" className="w-24 px-3 py-2 border-0 border-l border-slate-300 text-center sm:text-sm focus:ring-0" disabled />
                                <input type="text" placeholder="CVC" className="w-20 px-3 py-2 border-0 border-l border-slate-300 rounded-r-md text-center sm:text-sm focus:ring-0" disabled />
                            </div>
                        </div>
                    )}

                    {field.paymentDetails?.includeBillingAddress && (
                        <div className="space-y-4 p-4 bg-slate-100 rounded-md border border-slate-200">
                            <h3 className="text-sm font-medium text-slate-800">Billing Address</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2"><div><label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">State / Province</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Zip / Postal Code</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Country</label><input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    case FormFieldType.NUMERIC:
        return (
            <div className="group">
                {renderLabelWithIndicator()}
                <input
                    type="number"
                    placeholder={placeholder}
                    min={field.minValue}
                    max={field.maxValue}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    disabled
                />
                {renderHelpText()}
            </div>
        );
    case FormFieldType.UNIVERSAL_AGREEMENT:
        return (
            <div>
                <div className="pb-2 mb-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-primary-700">{label}</h2>
                    {renderHelpText()}
                </div>
                <div className="text-sm text-slate-700 p-3 bg-slate-100 border border-slate-200 rounded-md max-h-48 overflow-y-auto mb-4 whitespace-pre-wrap">
                    {field.agreementText || 'No agreement text provided.'}
                </div>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <input type="checkbox" id={`${field.id}_agree`} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 mt-0.5" disabled />
                        <label htmlFor={`${field.id}_agree`} className="ml-2 block text-sm text-slate-900">
                            I have read and agree to the terms above.
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                    </div>
                    {field.universalAgreement?.includePrintedName && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Printed Name</label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled />
                        </div>
                    )}
                    {field.universalAgreement?.includeDate && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md sm:text-sm" disabled />
                        </div>
                    )}
                </div>
            </div>
        );
    default:
      return <div className="text-sm text-red-500">Unknown field type</div>;
  }
};