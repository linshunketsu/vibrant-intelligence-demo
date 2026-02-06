import React, { useState } from 'react';
import { X, Search, Check, User } from 'lucide-react';

interface AddAssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedIds: string[]) => void;
  existingPatientIds: string[];
}

// Mock patients for search - Exported for use in ManageUsageModal
export const ALL_PATIENTS = [
  { id: '1006', name: 'James Wilson', email: 'james.w@example.com' },
  { id: '1007', name: 'Patricia Moore', email: 'p.moore@example.com' },
  { id: '1008', name: 'Jennifer Taylor', email: 'j.taylor@example.com' },
  { id: '1009', name: 'Michael Brown', email: 'm.brown@example.com' },
  { id: '1010', name: 'Elizabeth Anderson', email: 'liz.a@example.com' },
  { id: '1001', name: 'Harrier Du Bois', email: 'h.dubois@example.com' }, // Already exists in mock
];

export const AddAssigneeModal: React.FC<AddAssigneeModalProps> = ({ isOpen, onClose, onAdd, existingPatientIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [autoApply, setAutoApply] = useState(false);

  if (!isOpen) return null;

  const filteredPatients = ALL_PATIENTS.filter(p => 
    !existingPatientIds.includes(p.id) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.id.includes(searchTerm))
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onAdd(selectedIds);
    setSelectedIds([]);
    setSearchTerm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#0F4C81] px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User size={20} />
            Add New Workflow Assignees
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Select Patients</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            {/* Results List */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg mt-2 bg-gray-50">
               {filteredPatients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No matching patients found.</div>
               ) : (
                  filteredPatients.map(patient => {
                     const isSelected = selectedIds.includes(patient.id);
                     return (
                        <div 
                           key={patient.id}
                           onClick={() => toggleSelection(patient.id)}
                           className={`p-3 flex items-center justify-between cursor-pointer hover:bg-white border-b border-gray-100 last:border-0 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                 {patient.name.charAt(0)}
                              </div>
                              <div>
                                 <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                 <div className="text-xs text-gray-500">ID: #{patient.id}</div>
                              </div>
                           </div>
                           {isSelected && <Check size={16} className="text-blue-600" />}
                        </div>
                     );
                  })
               )}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${autoApply ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
               <input 
                  type="checkbox" 
                  checked={autoApply}
                  onChange={(e) => setAutoApply(e.target.checked)}
                  className="hidden"
               />
               {autoApply && <Check size={14} className="text-white" />}
            </div>
            <span className="text-sm text-gray-700 font-medium">Automatically apply to new patients</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 text-white font-bold rounded-lg shadow-sm text-sm transition-colors ${selectedIds.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0F4C81] hover:bg-[#09355E]'}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};