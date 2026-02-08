import React, { useState, useEffect } from 'react';
import { X, UserPlus, Play, Pause, Trash2, Receipt, Search, User } from 'lucide-react';
import { AddAssigneeModal, ALL_PATIENTS } from './AddAssigneeModal';

interface ManageUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowTitle: string;
}

interface AssignedPatient {
  id: string; // internal id
  patientId: string; // display id
  name: string;
  avatar?: string;
  addedTime: string;
  status: 'active' | 'paused';
}

const MOCK_EXISTING_PATIENTS: AssignedPatient[] = [
  { id: 'p1', patientId: '1001', name: 'Harrier Du Bois', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harrier', addedTime: 'Added 2 days ago', status: 'active' },
  { id: 'p2', patientId: '1002', name: 'Maria Davis', addedTime: 'Added 2 weeks ago', status: 'paused' },
  { id: 'p3', patientId: '1003', name: 'Robert Jones', addedTime: 'Added 1 weeks ago', status: 'paused' },
  { id: 'p4', patientId: '1004', name: 'Noah Ramirez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah', addedTime: 'Added a week ago', status: 'paused' },
  { id: 'p5', patientId: '1005', name: 'Lisa Wilson', addedTime: 'Added 1 weeks ago', status: 'paused' },
];

export const ManageUsageModal: React.FC<ManageUsageModalProps> = ({ isOpen, onClose, workflowTitle }) => {
  const [isActive, setIsActive] = useState(false); // Workflow Global Status
  const [patients, setPatients] = useState<AssignedPatient[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Initialize state based on the workflow context
  useEffect(() => {
    if (isOpen) {
       // Only populate for the specific demo workflow
       if (workflowTitle === 'Patient Purchase') {
          setPatients(MOCK_EXISTING_PATIENTS);
          setIsActive(true);
       } else {
          setPatients([]);
          setIsActive(false);
       }
    }
  }, [isOpen, workflowTitle]);

  if (!isOpen) return null;

  const handleToggleStatus = (id: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'active' ? 'paused' : 'active' };
      }
      return p;
    }));
  };

  const handleRemovePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPatients = (ids: string[]) => {
    const newPatients: AssignedPatient[] = ids.map(id => {
      const patientDef = ALL_PATIENTS.find(p => p.id === id);
      return {
        id: `p-${id}`,
        patientId: id,
        name: patientDef ? patientDef.name : `Patient ${id}`,
        addedTime: 'Just now',
        status: 'active'
      };
    });
    setPatients(prev => [...newPatients, ...prev]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#0F4C81] px-6 py-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Receipt size={20} className="text-white/80" />
            Manage Workflow Usage
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f8f8]">
          
          {/* Workflow Global Status */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-6">
            <span className="text-base font-semibold text-gray-800">Current Workflow Status</span>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${!isActive ? 'text-gray-900' : 'text-gray-400'}`}>Draft</span>
              <button 
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative ${isActive ? 'bg-[#0F4C81]' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>Active</span>
            </div>
          </div>

          {/* Assigned Patients Section */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-700">Assigned Patients</h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
            >
              <UserPlus size={16} />
              Add New Assignee
            </button>
          </div>

          {/* Patients List */}
          <div className="space-y-3">
            {patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <User size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No patients assigned yet</p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">Add patients to start executing this workflow automatically.</p>
              </div>
            ) : (
              patients.map((patient) => (
                <div key={patient.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                    {patient.avatar ? (
                      <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-bold text-sm">{patient.name.split(' ').map(n=>n[0]).join('')}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{patient.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>ID: #{patient.patientId}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span>{patient.addedTime}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleStatus(patient.id)}
                      className={`p-1.5 rounded-full transition-colors ${patient.status === 'active' ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
                      title={patient.status === 'active' ? 'Pause Usage' : 'Resume Usage'}
                    >
                      {patient.status === 'active' ? <Pause size={20} fill="currentColor" className="opacity-20" strokeWidth={2.5}/> : <Play size={20} fill="currentColor" className="opacity-20" strokeWidth={2.5} />}
                    </button>
                    
                    <button 
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Edit Price"
                    >
                      <Receipt size={18} strokeWidth={2.5} />
                    </button>

                    <button 
                      onClick={() => handleRemovePatient(patient.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove Patient"
                    >
                      <X size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
           <button 
            onClick={onClose}
            className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#0F4C81] text-white font-bold rounded-lg hover:bg-[#09355E] transition-colors shadow-sm text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>

      <AddAssigneeModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onAdd={handleAddPatients}
        existingPatientIds={patients.map(p => p.patientId)}
      />
    </div>
  );
};