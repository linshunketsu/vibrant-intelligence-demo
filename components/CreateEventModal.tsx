import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, Users, MapPin, Video, 
  AlignLeft, ChevronDown, Globe, Check 
} from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // YYYY-MM-DD
  initialTime?: string; // e.g. "10:00 AM"
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose, 
  initialDate, 
  initialTime 
}) => {
  const [activeTab, setActiveTab] = useState<'Appointment' | 'Task'>('Appointment');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState(['Jame Miller']);
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [startTime, setStartTime] = useState(initialTime || '10:00 AM');
  const [endTime, setEndTime] = useState('10:15 AM');
  const [isAllDay, setIsAllDay] = useState(false);
  const [addZoom, setAddZoom] = useState(false);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      if (initialDate) setSelectedDate(initialDate);
      if (initialTime) {
        setStartTime(initialTime);
        // Simple logic to add 15 mins for demo end time
        setEndTime(calculateEndTime(initialTime)); 
      }
    }
  }, [isOpen, initialDate, initialTime]);

  const calculateEndTime = (start: string) => {
     // Very basic mock logic for demo purposes
     if (start.includes('10:00 AM')) return '10:15 AM';
     if (start.includes('11:00 AM')) return '11:15 AM';
     return '10:15 AM'; // Default fallback
  };

  const getFormattedHeaderDate = () => {
     if (!selectedDate) return '';
     const d = new Date(selectedDate + 'T00:00:00'); // Simple parse
     const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
     return `${dateStr}, ${startTime.toLowerCase().replace(' ', '')}-${endTime.toLowerCase().replace(' ', '')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
        
        {/* Header Tabs */}
        <div className="flex items-center border-b border-gray-200 px-6 pt-6 gap-6">
           <button 
             onClick={() => setActiveTab('Appointment')}
             className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'Appointment' ? 'border-[#0F4C81] text-[#0F4C81]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
              <Calendar size={16} /> Appointment
           </button>
           <button 
             onClick={() => setActiveTab('Task')}
             className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'Task' ? 'border-[#0F4C81] text-[#0F4C81]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
              <Clock size={16} /> Task
           </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
           
           {/* Date/Time Readout Input */}
           <div className="flex items-center gap-3">
              <div className="mt-1 text-slate-400"><Calendar size={18} /></div>
              <input 
                type="text" 
                value={getFormattedHeaderDate()}
                readOnly
                className="w-full text-base font-semibold text-gray-800 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent cursor-default"
              />
           </div>

           {/* Description */}
           <div className="flex items-start gap-3">
              <div className="mt-1 text-slate-400"><AlignLeft size={18} /></div>
              <input 
                type="text" 
                placeholder="Add a description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent placeholder-slate-400"
              />
           </div>

           {/* Attendees */}
           <div className="flex items-start gap-3">
              <div className="mt-1.5 text-slate-400"><Users size={18} /></div>
              <div className="flex-1">
                 <div className="flex flex-wrap gap-2 mb-2">
                    {attendees.map(att => (
                       <span key={att} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700">
                          {att}
                          <button onClick={() => setAttendees(prev => prev.filter(a => a !== att))} className="hover:text-red-500 ml-1"><X size={12} /></button>
                       </span>
                    ))}
                 </div>
                 <input 
                    type="text" 
                    placeholder="Invite other Providers (Optional)"
                    className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent placeholder-slate-400"
                 />
              </div>
           </div>

           {/* Suggested Times */}
           <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Suggested Times</label>
              <div className="grid grid-cols-3 gap-2">
                 <button className="p-2 border-2 border-blue-500 bg-blue-50 rounded-lg text-left transition-all">
                    <div className="text-[10px] font-bold text-blue-700">Wed 9/3</div>
                    <div className="text-[10px] font-medium text-blue-600">{startTime} - {endTime}</div>
                 </button>
                 <button className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition-all opacity-60 hover:opacity-100">
                    <div className="text-[10px] font-bold text-slate-700">Thu 9/4</div>
                    <div className="text-[10px] font-medium text-slate-500">{startTime} - {endTime}</div>
                 </button>
                 <button className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition-all opacity-60 hover:opacity-100">
                    <div className="text-[10px] font-bold text-slate-700">Fri 9/5</div>
                    <div className="text-[10px] font-medium text-slate-500">{startTime} - {endTime}</div>
                 </button>
              </div>
           </div>

           {/* Date & Time Pickers */}
           <div className="flex items-center gap-3">
              <div className="mt-1 text-slate-400"><Clock size={18} /></div>
              <div className="flex-1 flex items-center gap-2">
                 <div className="relative">
                    <input 
                       type="date" 
                       value={selectedDate} 
                       onChange={(e) => setSelectedDate(e.target.value)}
                       className="bg-slate-100 border-none rounded px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div className="relative">
                    <select 
                       value={startTime}
                       onChange={(e) => setStartTime(e.target.value)}
                       className="bg-slate-100 border-none rounded px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8"
                    >
                       <option>10:00 AM</option>
                       <option>10:30 AM</option>
                       <option>11:00 AM</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                 </div>
                 <span className="text-slate-300">—</span>
                 <div className="relative">
                    <select 
                       value={endTime}
                       onChange={(e) => setEndTime(e.target.value)}
                       className="bg-slate-100 border-none rounded px-3 py-1.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8"
                    >
                       <option>10:15 AM</option>
                       <option>10:45 AM</option>
                       <option>11:15 AM</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                 </div>
                 <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                    <Globe size={16} />
                 </button>
              </div>
           </div>
           
           <div className="pl-8">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                 <input 
                    type="checkbox" 
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81]" 
                 />
                 <span className="text-sm text-slate-600">All Day</span>
              </label>
           </div>

           {/* Appointment Type */}
           <div className="flex items-center gap-3">
              <div className="mt-1 text-slate-400"><div className="w-[18px]"></div></div> {/* Spacer/Icon placeholder */}
              <div className="flex-1 relative">
                 <select className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                    <option>Select Appointment Type</option>
                    <option>Follow-up</option>
                    <option>Initial Consultation</option>
                    <option>Checkup</option>
                 </select>
                 <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
           </div>

           {/* Location */}
           <div className="flex items-center gap-3">
              <div className="mt-1 text-slate-400"><MapPin size={18} /></div>
              <input 
                type="text" 
                placeholder="Add a room or location"
                className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent placeholder-slate-400"
              />
           </div>

           {/* Video Conferencing */}
           <div className="flex items-center gap-3">
              <div className="mt-1 text-slate-400"><Video size={18} className="text-blue-500" /></div>
              <label className="flex items-center gap-2 cursor-pointer w-full py-1">
                 <input 
                    type="checkbox" 
                    checked={addZoom}
                    onChange={(e) => setAddZoom(e.target.checked)}
                    className="rounded border-slate-300 text-blue-500 focus:ring-blue-500" 
                 />
                 <span className="text-sm text-slate-600">Add Zoom Meet video conferencing</span>
              </label>
           </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
           >
              Cancel
           </button>
           <button 
             onClick={onClose}
             className="px-6 py-2 text-sm font-bold text-white bg-[#0F4C81] hover:bg-[#09355E] rounded-lg shadow-sm transition-colors"
           >
              Save
           </button>
        </div>

      </div>
    </div>
  );
};
