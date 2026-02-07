
import React, { useState, useCallback } from 'react';
import { FormField, FormTemplate, Patient, CustomElement, PatientFieldDefinition } from './types';
import Home from './views/Home';
import ManualComposer from './views/ManualComposer';
import Patients from './views/Patients';
import Header from './components/Header';
import { INITIAL_FORM_TEMPLATES, EXISTING_FORMS, MOCK_PATIENTS } from './constants';

export type View = 'home' | 'manual' | 'patients';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [initialFields, setInitialFields] = useState<FormField[]>([]);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [templates] = useState<FormTemplate[]>(INITIAL_FORM_TEMPLATES);
  const [existingForms, setExistingForms] = useState<FormTemplate[]>(EXISTING_FORMS);
  
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [patientFieldDefinitions, setPatientFieldDefinitions] = useState<PatientFieldDefinition[]>([
      { id: 'cust_pharmacy', label: 'Preferred Pharmacy', type: 'TEXT' },
      { id: 'cust_transport', label: 'Transportation Needs', type: 'SELECT', options: ['None', 'Wheelchair', 'Ambulance'] }
  ]);

  const [customElements, setCustomElements] = useState<CustomElement[]>([]);

  const handleSaveForm = useCallback((form: FormTemplate) => {
    setExistingForms(prev => {
        if (editingFormId) {
            // Update existing form
            return prev.map(f => (f.id === editingFormId ? { ...f, title: form.title, fields: form.fields, mappings: form.mappings } : f));
        } else {
            // Add new form to the top of the list
            return [form, ...prev];
        }
    });
    setCurrentView('home');
  }, [editingFormId]);

  const handleDeleteForm = useCallback((formId: string) => {
    setExistingForms(prev => prev.filter(f => f.id !== formId));
  }, []);

  const handleNavigate = useCallback((view: View, fields: FormField[] = [], formId: string | null = null) => {
    // When navigating to the composer, set its initial state
    if (view === 'manual') {
      setInitialFields(fields);
      setEditingFormId(formId);
    }
    // When navigating away from the composer, reset its state
    if (currentView === 'manual' && view !== 'manual') {
      setInitialFields([]);
      setEditingFormId(null);
    }
    setCurrentView(view);
  }, [currentView]);

  const handleSaveCustomElement = useCallback((element: CustomElement) => {
    setCustomElements(prev => {
        const existingIndex = prev.findIndex(e => e.id === element.id);
        if (existingIndex > -1) {
            const newElements = [...prev];
            newElements[existingIndex] = element;
            return newElements;
        }
        return [element, ...prev];
    });
  }, []);

  const handleDeleteCustomElement = useCallback((elementId: string) => {
    setCustomElements(prev => prev.filter(e => e.id !== elementId));
  }, []);

  const handleUpdatePatientData = (patientId: string, data: Record<string, any>) => {
    setPatients(prev => prev.map(p => 
        p.id === patientId ? { ...p, customData: { ...p.customData, ...data } } : p
    ));
  };

  const handleUpdateFieldDefinitions = (defs: PatientFieldDefinition[]) => {
      setPatientFieldDefinitions(defs);
  };

  const renderView = () => {
    switch (currentView) {
      case 'manual':
        return <ManualComposer
            initialFields={initialFields}
            onSaveForm={handleSaveForm}
            editingFormId={editingFormId}
            existingForms={existingForms}
            customElements={customElements}
            onSaveCustomElement={handleSaveCustomElement}
            onDeleteCustomElement={handleDeleteCustomElement}
        />;
      case 'patients':
        return <Patients 
            patients={patients} 
            fieldDefinitions={patientFieldDefinitions}
            onUpdateFieldDefinitions={handleUpdateFieldDefinitions}
            onUpdatePatientData={handleUpdatePatientData}
        />;
      case 'home':
      default:
        return <Home 
            onNavigate={handleNavigate} 
            existingForms={existingForms} 
            onDeleteForm={handleDeleteForm}
            templates={templates} 
        />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      <Header currentView={currentView} onNavigate={handleNavigate} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
