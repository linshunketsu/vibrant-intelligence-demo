
import React, { useState, useMemo, useEffect } from 'react';
import { Patient, VitalsEntry, PatientFieldDefinition } from '../types';
import { CogIcon } from '../components/icons/CogIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { XIcon } from '../components/icons/XIcon';
import { CheckIcon } from '../components/icons/CheckIcon';

const DetailItem: React.FC<{ label: string; value?: string | number | string[] | null | boolean }> = ({ label, value }) => {
  if (value === null || value === undefined) return null;

  const displayValue = Array.isArray(value) 
    ? value.join(', ') 
    : typeof value === 'boolean' 
        ? (value ? 'Yes' : 'No') 
        : value.toString();
        
  if (displayValue.trim() === '') return null;

  return (
    <div className="group">
      <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary-600 transition-colors">{label}</dt>
      <dd className="mt-1 text-base font-medium text-slate-800 break-words">{displayValue}</dd>
    </div>
  );
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode; color?: string }> = ({ title, children, action, color = "bg-white" }) => (
    <div className={`${color} p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300`}>
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            {action}
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

type ChartMetric = 'weight' | 'bmi' | 'bp' | 'hr' | 'temp' | 'rr' | 'spo2';

const VitalsChart: React.FC<{ data: VitalsEntry[], metric: ChartMetric }> = ({ data, metric }) => {
    const chartHeight = 240;
    const chartWidth = 600;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const relevantData = useMemo(() => {
        return data
            .map(d => ({ ...d, dateObj: new Date(d.date) }))
            .filter(d => {
                switch (metric) {
                    case 'weight': return d.weightKg != null;
                    case 'bmi': return d.bmi != null;
                    case 'bp': return d.bloodPressure != null;
                    case 'hr': return d.heartRateBpm != null;
                    case 'temp': return d.temperatureCelsius != null;
                    case 'rr': return d.respiratoryRateBpm != null;
                    case 'spo2': return d.oxygenSaturationPercent != null;
                    default: return false;
                }
            })
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [data, metric]);

    const valueDomain = useMemo(() => {
        if (relevantData.length === 0) return [0, 100];

        if (metric === 'bp') {
            const allValues = relevantData.flatMap(d => [d.bloodPressure!.systolic, d.bloodPressure!.diastolic]);
            return [Math.min(...allValues) - 10, Math.max(...allValues) + 10];
        }
        
        const values = relevantData.map(d => {
            switch (metric) {
                case 'weight': return d.weightKg!;
                case 'bmi': return d.bmi!;
                case 'hr': return d.heartRateBpm!;
                case 'temp': return d.temperatureCelsius!;
                case 'rr': return d.respiratoryRateBpm!;
                case 'spo2': return d.oxygenSaturationPercent!;
                default: return 0;
            }
        });

        if (values.length === 0) return [0, 100];
        const min = Math.min(...values);
        const max = Math.max(...values);
         if (min === max) {
            return [min - 5, max + 5];
        }
        return [min - (max-min)*0.2, max + (max-min)*0.2];
    }, [relevantData, metric]);


    if (relevantData.length < 2) {
        return (
            <div style={{ height: `${chartHeight}px` }} className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                <span className="text-4xl mb-2">📊</span>
                <span className="text-sm font-semibold">Not enough data for a chart</span>
            </div>
        );
    }

    const timeDomain = [relevantData[0].dateObj.getTime(), relevantData[relevantData.length - 1].dateObj.getTime()];
    const xScale = (time: number) => {
        const domainWidth = timeDomain[1] - timeDomain[0];
        if (domainWidth === 0) return margin.left + innerWidth / 2;
        return margin.left + ((time - timeDomain[0]) / domainWidth) * innerWidth;
    }

    const yScale = (value: number) => {
        const domainHeight = valueDomain[1] - valueDomain[0];
        if (domainHeight === 0) return margin.top + innerHeight / 2;
        return margin.top + innerHeight - ((value - valueDomain[0]) / domainHeight) * innerHeight;
    }

    const valueExtractor = (d: VitalsEntry): number | undefined => {
        switch (metric) {
            case 'weight': return d.weightKg;
            case 'bmi': return d.bmi;
            case 'hr': return d.heartRateBpm;
            case 'temp': return d.temperatureCelsius;
            case 'rr': return d.respiratoryRateBpm;
            case 'spo2': return d.oxygenSaturationPercent;
            default: return undefined;
        }
    };

    const createPath = (extractor: (d: VitalsEntry) => number | undefined) => {
        return relevantData
            .map((d, i) => {
                const value = extractor(d);
                if (value === undefined) return '';
                const x = xScale(d.dateObj.getTime());
                const y = yScale(value);
                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
            })
            .join(' ');
    };

    const createAreaPath = (extractor: (d: VitalsEntry) => number | undefined) => {
        const linePath = createPath(extractor);
        if (!linePath) return '';
        
        const firstX = xScale(relevantData[0].dateObj.getTime());
        const lastX = xScale(relevantData[relevantData.length - 1].dateObj.getTime());
        const bottomY = margin.top + innerHeight;

        return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
    };

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = valueDomain[0] + (i / 4) * (valueDomain[1] - valueDomain[0]);
        return { value: Math.round(value * 10) / 10, y: yScale(value) };
    });

    const xAxisLabels = relevantData.map(d => ({
        label: d.date.slice(5), // MM-DD
        x: xScale(d.dateObj.getTime()),
    }));

    // Generate fewer x-labels if too many data points
    const visibleXLabels = xAxisLabels.length > 6 
        ? xAxisLabels.filter((_, i) => i % Math.ceil(xAxisLabels.length / 6) === 0) 
        : xAxisLabels;

    const pathSystolic = metric === 'bp' ? createPath(d => d.bloodPressure?.systolic) : '';
    const areaSystolic = metric === 'bp' ? createAreaPath(d => d.bloodPressure?.systolic) : '';
    const pathDiastolic = metric === 'bp' ? createPath(d => d.bloodPressure?.diastolic) : '';
    const areaDiastolic = metric === 'bp' ? createAreaPath(d => d.bloodPressure?.diastolic) : '';
    
    const pathSingle = metric !== 'bp' ? createPath(valueExtractor) : '';
    const areaSingle = metric !== 'bp' ? createAreaPath(valueExtractor) : '';

    return (
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none font-sans">
            <defs>
                <linearGradient id="gradientSingle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradientSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradientDia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Grid Lines */}
            {yAxisLabels.map(({ value, y }) => (
                <g key={value} className="text-xs text-slate-400">
                    <line x1={margin.left} y1={y} x2={chartWidth - margin.right} y2={y} stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4,4" />
                    <text x={margin.left - 12} y={y + 4} textAnchor="end" className="font-semibold fill-slate-400">{value}</text>
                </g>
            ))}
            
            {/* X-Axis Labels */}
            {visibleXLabels.map(({ label, x }, index) => (
                 <g key={`${label}-${index}`} className="text-xs text-slate-400">
                    <text x={x} y={chartHeight - margin.bottom + 24} textAnchor="middle" className="font-semibold fill-slate-400">{label}</text>
                    <line x1={x} y1={chartHeight - margin.bottom} x2={x} y2={chartHeight - margin.bottom + 6} stroke="#cbd5e1" strokeWidth="2" strokeLinecap='round' />
                </g>
            ))}

            {/* Data Rendering */}
            {metric === 'bp' ? (
                <>
                    {/* Systolic */}
                    <path d={areaSystolic} fill="url(#gradientSys)" />
                    <path d={pathSystolic} fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Diastolic */}
                    <path d={areaDiastolic} fill="url(#gradientDia)" />
                    <path d={pathDiastolic} fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Dots */}
                    {relevantData.map(d => (
                       <g key={d.date}>
                           {d.bloodPressure?.systolic != null && 
                                <circle cx={xScale(d.dateObj.getTime())} cy={yScale(d.bloodPressure.systolic)} r="6" fill="#f43f5e" stroke="white" strokeWidth="3" className="hover:scale-125 transition-transform origin-center duration-300" />
                           }
                           {d.bloodPressure?.diastolic != null && 
                                <circle cx={xScale(d.dateObj.getTime())} cy={yScale(d.bloodPressure.diastolic)} r="6" fill="#0ea5e9" stroke="white" strokeWidth="3" className="hover:scale-125 transition-transform origin-center duration-300" />
                           }
                       </g>
                    ))}
                </>
            ) : (
                <g>
                    <path d={areaSingle} fill="url(#gradientSingle)" />
                    <path d={pathSingle} fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {relevantData.map(d => {
                        const value = valueExtractor(d);
                        if (value == null) return null;
                        return (
                            <circle 
                                key={d.date} 
                                cx={xScale(d.dateObj.getTime())} 
                                cy={yScale(value)} 
                                r="6" 
                                fill="#8b5cf6" 
                                stroke="white" 
                                strokeWidth="3"
                                className="hover:scale-125 transition-transform origin-center duration-300"
                            />
                        );
                    })}
                </g>
            )}
        </svg>
    );
};

interface ConfigureFieldsModalProps {
    isOpen: boolean;
    onClose: () => void;
    definitions: PatientFieldDefinition[];
    onSave: (defs: PatientFieldDefinition[]) => void;
}

const ConfigureFieldsModal: React.FC<ConfigureFieldsModalProps> = ({ isOpen, onClose, definitions, onSave }) => {
    const [localDefs, setLocalDefs] = useState<PatientFieldDefinition[]>([]);

    useEffect(() => {
        if (isOpen) setLocalDefs([...definitions]);
    }, [isOpen, definitions]);

    if (!isOpen) return null;

    const handleAdd = () => {
        const newId = `custom_field_${Date.now()}`;
        setLocalDefs([...localDefs, { id: newId, label: 'New Field', type: 'TEXT' }]);
    };

    const handleChange = (index: number, key: keyof PatientFieldDefinition, value: any) => {
        const newDefs = [...localDefs];
        newDefs[index] = { ...newDefs[index], [key]: value };
        setLocalDefs(newDefs);
    };

    const handleDelete = (index: number) => {
        setLocalDefs(localDefs.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Configure Patient Profile Fields</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><XIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow bg-slate-50/50">
                    <p className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-wide">Custom Fields</p>
                    <div className="space-y-4">
                        {localDefs.map((def, index) => (
                            <div key={def.id} className="flex gap-3 items-start p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary-300 transition-colors">
                                <div className="flex-grow space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input 
                                            type="text" 
                                            value={def.label} 
                                            onChange={(e) => handleChange(index, 'label', e.target.value)}
                                            placeholder="Field Label"
                                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-shadow"
                                        />
                                        <select 
                                            value={def.type} 
                                            onChange={(e) => handleChange(index, 'type', e.target.value)}
                                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-shadow"
                                        >
                                            <option value="TEXT">Text</option>
                                            <option value="NUMBER">Number</option>
                                            <option value="DATE">Date</option>
                                            <option value="BOOLEAN">Yes/No</option>
                                            <option value="SELECT">Dropdown</option>
                                        </select>
                                    </div>
                                    {def.type === 'SELECT' && (
                                        <input 
                                            type="text" 
                                            value={def.options?.join(', ') || ''} 
                                            onChange={(e) => handleChange(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                                            placeholder="Options (comma separated)"
                                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-shadow"
                                        />
                                    )}
                                </div>
                                <button onClick={() => handleDelete(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} className="mt-6 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary-300 rounded-xl text-sm font-bold text-primary-600 hover:bg-primary-50 hover:border-primary-400 transition-all">
                        <PlusIcon className="h-5 w-5" /> Add New Field
                    </button>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button onClick={() => { onSave(localDefs); onClose(); }} className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-0.5">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

interface EditPatientDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    definitions: PatientFieldDefinition[];
    onSave: (data: Record<string, any>) => void;
}

const EditPatientDataModal: React.FC<EditPatientDataModalProps> = ({ isOpen, onClose, patient, definitions, onSave }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isOpen) setFormData({ ...patient.customData });
    }, [isOpen, patient]);

    if (!isOpen) return null;

    const handleChange = (id: string, value: any) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Edit Additional Information</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><XIcon /></button>
                </div>
                <div className="p-6 space-y-5">
                    {definitions.length === 0 ? (
                        <p className="text-slate-500 text-sm">No custom fields defined. Please configure fields first.</p>
                    ) : (
                        definitions.map(def => (
                            <div key={def.id}>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{def.label}</label>
                                {def.type === 'TEXT' && (
                                    <input type="text" value={formData[def.id] || ''} onChange={(e) => handleChange(def.id, e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                                )}
                                {def.type === 'NUMBER' && (
                                    <input type="number" value={formData[def.id] || ''} onChange={(e) => handleChange(def.id, parseFloat(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                                )}
                                {def.type === 'DATE' && (
                                    <input type="date" value={formData[def.id] || ''} onChange={(e) => handleChange(def.id, e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none" />
                                )}
                                {def.type === 'BOOLEAN' && (
                                    <select value={formData[def.id] === true ? 'true' : formData[def.id] === false ? 'false' : ''} onChange={(e) => handleChange(def.id, e.target.value === 'true')} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none">
                                        <option value="">Select...</option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                )}
                                {def.type === 'SELECT' && (
                                    <select value={formData[def.id] || ''} onChange={(e) => handleChange(def.id, e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none">
                                        <option value="">Select...</option>
                                        {def.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button onClick={() => { onSave(formData); onClose(); }} className="px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-0.5">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

interface PatientsProps {
    patients: Patient[];
    fieldDefinitions: PatientFieldDefinition[];
    onUpdateFieldDefinitions: (defs: PatientFieldDefinition[]) => void;
    onUpdatePatientData: (patientId: string, data: Record<string, any>) => void;
}

const Patients: React.FC<PatientsProps> = ({ patients, fieldDefinitions, onUpdateFieldDefinitions, onUpdatePatientData }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChartMetric, setActiveChartMetric] = useState<ChartMetric>('weight');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isEditDataModalOpen, setIsEditDataModalOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return patients.filter(p => p.ehrData.demographics.name.full.toLowerCase().includes(query));
  }, [patients, searchQuery]);

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);
  
  const sortedVitals = useMemo(() => {
    if (!selectedPatient?.ehrData.vitals) return [];
    // Create a copy before sorting to avoid mutating props
    return [...selectedPatient.ehrData.vitals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedPatient]);

  const latestVitals = sortedVitals.length > 0 ? [...sortedVitals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : undefined;

  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const chartFilters: { key: ChartMetric, label: string }[] = [
      { key: 'weight', label: 'Weight' },
      { key: 'bmi', label: 'BMI' },
      { key: 'bp', label: 'BP' },
      { key: 'hr', label: 'Heart Rate' },
      { key: 'temp', label: 'Temp' },
      { key: 'rr', label: 'Resp. Rate' },
      { key: 'spo2', label: 'SpO2' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Panel: Patient List */}
      <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
        <h2 className="text-2xl font-black text-slate-800 mb-6">Patient Roster</h2>
        <div className="relative mb-6">
            <input 
                type="search"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 text-sm outline-none transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
        <div className="max-h-[calc(100vh-22rem)] overflow-y-auto pr-1 space-y-2">
            {filteredPatients.map(patient => (
                <button
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 group border ${
                        selectedPatientId === patient.id
                        ? 'bg-primary-50 border-primary-200 shadow-md transform scale-[1.02]'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${selectedPatientId === patient.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-primary-600'}`}>
                            {patient.ehrData.demographics.name.first[0]}{patient.ehrData.demographics.name.last[0]}
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${selectedPatientId === patient.id ? 'text-primary-900' : 'text-slate-700'}`}>{patient.ehrData.demographics.name.full}</p>
                            <p className="text-xs text-slate-500">
                                {patient.ehrData.demographics.gender} &bull; {getAge(patient.ehrData.demographics.dob)} yo
                            </p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Right Panel: Patient Details */}
      <div className="lg:col-span-8">
        {selectedPatient ? (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#2563eb" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.2C93.5,8.9,82,22.1,70.9,33.1C59.8,44.1,49.1,52.9,37.6,60.8C26.1,68.7,13.8,75.7,0.7,74.5C-12.4,73.3,-26.1,63.9,-38.6,54.2C-51.1,44.5,-62.4,34.5,-70.6,22.2C-78.8,9.9,-83.9,-4.7,-80.6,-18.2C-77.3,-31.7,-65.6,-44.1,-52.7,-51.9C-39.8,-59.7,-25.7,-62.9,-12.3,-65.4C1.1,-67.9,14.5,-69.7,30.5,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="h-24 w-24 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-4xl font-black rounded-3xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        {selectedPatient.ehrData.demographics.name.first[0]}
                        {selectedPatient.ehrData.demographics.name.last[0]}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{selectedPatient.ehrData.demographics.name.full}</h1>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                {getAge(selectedPatient.ehrData.demographics.dob)} years old
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                {selectedPatient.ehrData.demographics.gender}
                            </span>
                            {selectedPatient.ehrData.demographics.pronouns && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {selectedPatient.ehrData.demographics.pronouns}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DetailSection title="Demographics">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                    <DetailItem label="Full Name" value={selectedPatient.ehrData.demographics.name.full} />
                    <DetailItem label="Date of Birth" value={selectedPatient.ehrData.demographics.dob} />
                    <DetailItem label="Gender" value={selectedPatient.ehrData.demographics.gender} />
                    <DetailItem label="Pronouns" value={selectedPatient.ehrData.demographics.pronouns} />
                    <DetailItem label="Occupation" value={selectedPatient.ehrData.demographics.occupation} />
                    <DetailItem label="Relationship Status" value={selectedPatient.ehrData.demographics.relationshipStatus} />
                </dl>
            </DetailSection>

            <DetailSection 
                title="Additional Information"
                color="bg-violet-50/50"
                action={
                    <div className="flex gap-2">
                        <button onClick={() => setIsConfigModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors uppercase tracking-wide">
                            <CogIcon className="h-4 w-4" /> Configure
                        </button>
                        <button onClick={() => setIsEditDataModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg shadow-sm shadow-violet-200 transition-colors uppercase tracking-wide">
                            <PencilIcon className="h-4 w-4" /> Edit
                        </button>
                    </div>
                }
            >
                {fieldDefinitions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-sm italic">No custom fields configured yet.</p>
                    </div>
                ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                        {fieldDefinitions.map(def => (
                            <DetailItem key={def.id} label={def.label} value={selectedPatient.customData?.[def.id]} />
                        ))}
                    </dl>
                )}
            </DetailSection>

            <DetailSection title="Contact Information">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                    <DetailItem label="Email" value={selectedPatient.ehrData.demographics.contact.email} />
                    <DetailItem label="Phone" value={selectedPatient.ehrData.demographics.contact.phone} />
                    {selectedPatient.ehrData.demographics.address &&
                        <div className="sm:col-span-2">
                            <DetailItem label="Address" value={`${selectedPatient.ehrData.demographics.address.street}, ${selectedPatient.ehrData.demographics.address.city}, ${selectedPatient.ehrData.demographics.address.state} ${selectedPatient.ehrData.demographics.address.zip}`} />
                        </div>
                    }
                </dl>
            </DetailSection>
            
            {(latestVitals || (sortedVitals && sortedVitals.length > 0)) && (
                 <DetailSection title="Vitals & Measurements">
                    {latestVitals &&
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest Reading ({latestVitals.date})</h4>
                            </div>
                            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6">
                                <DetailItem label="Height" value={latestVitals.heightCm != null ? `${latestVitals.heightCm} cm` : '–'} />
                                <DetailItem label="Weight" value={latestVitals.weightKg != null ? `${latestVitals.weightKg} kg` : '–'} />
                                <DetailItem label="BMI" value={latestVitals.bmi ?? '–'} />
                                <DetailItem label="Blood Pressure" value={latestVitals.bloodPressure ? `${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic} mmHg` : '–'} />
                                <DetailItem label="Heart Rate" value={latestVitals.heartRateBpm != null ? `${latestVitals.heartRateBpm} bpm` : '–'} />
                                <DetailItem label="Temperature" value={latestVitals.temperatureCelsius != null ? `${latestVitals.temperatureCelsius} °C` : '–'} />
                                <DetailItem label="Respiratory Rate" value={latestVitals.respiratoryRateBpm != null ? `${latestVitals.respiratoryRateBpm} bpm` : '–'} />
                                <DetailItem label="Oxygen Saturation" value={latestVitals.oxygenSaturationPercent != null ? `${latestVitals.oxygenSaturationPercent}%` : '–'} />
                            </dl>
                        </div>
                    }

                    {/* Trend Chart */}
                    <div className="mt-8">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h4 className="text-lg font-bold text-slate-800">Trends Analysis</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                                {chartFilters.map(filter => (
                                     <button 
                                        key={filter.key}
                                        onClick={() => setActiveChartMetric(filter.key)} 
                                        className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all transform hover:scale-105 ${
                                            activeChartMetric === filter.key 
                                            ? 'bg-slate-800 text-white shadow-lg' 
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
                            <VitalsChart data={sortedVitals} metric={activeChartMetric} />
                        </div>
                         {activeChartMetric === 'bp' && (
                            <div className="flex justify-center items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-500 mt-4">
                                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-500"></span> Systolic</div>
                                <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-sky-500"></span> Diastolic</div>
                            </div>
                        )}
                    </div>

                    {/* Historical Log */}
                    {sortedVitals.length > 0 && (
                        <div className="mt-10">
                            <h4 className="text-lg font-bold text-slate-800 mb-4">Historical Log</h4>
                            <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-sm">
                                <table className="min-w-full divide-y divide-slate-100 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Date</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Height</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">Weight</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs">BMI</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs" title="Blood Pressure">BP</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs" title="Heart Rate">HR</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs" title="Temperature">Temp</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs" title="Respiratory Rate">RR</th>
                                            <th scope="col" className="px-4 py-3 text-left font-bold text-slate-400 uppercase tracking-wider text-xs" title="Oxygen Saturation">SpO2</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {[...sortedVitals].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                            <tr key={entry.date} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-700">{entry.date}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.heightCm != null ? `${entry.heightCm} cm` : '–'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.weightKg != null ? `${entry.weightKg} kg` : '–'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.bmi ?? '–'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.bloodPressure ? `${entry.bloodPressure.systolic}/${entry.bloodPressure.diastolic}` : '–'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.heartRateBpm != null ? `${entry.heartRateBpm} bpm` : '–'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.temperatureCelsius != null ? `${entry.temperatureCelsius} °C` : '–'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.respiratoryRateBpm != null ? `${entry.respiratoryRateBpm} bpm` : '–'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{entry.oxygenSaturationPercent != null ? `${entry.oxygenSaturationPercent}%` : '–'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </DetailSection>
            )}
            
            {selectedPatient.ehrData.clinical && (
                 <DetailSection title="Clinical Details">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                        <DetailItem label="Chief Complaint" value={selectedPatient.ehrData.clinical.chiefComplaint} />
                        <DetailItem label="Smoking Status" value={selectedPatient.ehrData.clinical.riskFactors?.smokingStatus} />
                        <div className="sm:col-span-2">
                            <DetailItem label="Allergies" value={selectedPatient.ehrData.clinical.allergies?.list} />
                        </div>
                        <div className="sm:col-span-2">
                            <DetailItem label="Current Medications" value={selectedPatient.ehrData.clinical.medications?.current} />
                        </div>
                    </dl>
                </DetailSection>
            )}

            {selectedPatient.ehrData.insurance && (
                <DetailSection title="Insurance Information">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                        <DetailItem label="Provider" value={selectedPatient.ehrData.insurance.providerName} />
                        <DetailItem label="Member ID" value={selectedPatient.ehrData.insurance.memberId} />
                        <DetailItem label="Group ID" value={selectedPatient.ehrData.insurance.groupId} />
                    </dl>
                </DetailSection>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-center items-center">
             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
             </div>
            <h3 className="text-lg font-bold text-slate-800">No Patient Selected</h3>
            <p className="mt-2 text-slate-500">Select a patient from the roster to view their full medical profile.</p>
          </div>
        )}
      </div>

      <ConfigureFieldsModal 
          isOpen={isConfigModalOpen} 
          onClose={() => setIsConfigModalOpen(false)} 
          definitions={fieldDefinitions} 
          onSave={onUpdateFieldDefinitions} 
      />

      {selectedPatient && (
          <EditPatientDataModal 
              isOpen={isEditDataModalOpen} 
              onClose={() => setIsEditDataModalOpen(false)} 
              patient={selectedPatient} 
              definitions={fieldDefinitions} 
              onSave={(data) => onUpdatePatientData(selectedPatient.id, data)} 
          />
      )}
    </div>
  );
};

export default Patients;
