import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Calendar, Clock, Users, MapPin, Video,
  AlignLeft, ChevronDown, Globe
} from 'lucide-react';

interface PatientInfo {
  name: string;
  initials?: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string; // YYYY-MM-DD
  initialTime?: string; // e.g. "10:00 AM"
  patient?: PatientInfo; // Patient info for prefilling
  appointmentType?: string; // Optional appointment type for title
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  patient,
  appointmentType = 'Appointment'
}) => {
  const [activeTab, setActiveTab] = useState<'Appointment' | 'Task'>('Appointment');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [startTime, setStartTime] = useState(initialTime || '10:00 AM');
  const [endTime, setEndTime] = useState('10:15 AM');
  const [isAllDay, setIsAllDay] = useState(false);
  const [addZoom, setAddZoom] = useState(false);

  // Reset and prefill when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialDate) setSelectedDate(initialDate);
      if (initialTime) {
        setStartTime(initialTime);
        setEndTime(calculateEndTime(initialTime));
      }
      // Prefill patient name if provided
      if (patient?.name) {
        setAttendees([patient.name]);
      } else {
        setAttendees([]);
      }
      // Reset description
      setDescription('');
    }
  }, [isOpen, initialDate, initialTime, patient]);

  // Generate title from appointment type and patient initials
  const getModalTitle = () => {
    if (patient?.initials) {
      return `${appointmentType} - ${patient.initials}`;
    }
    return appointmentType;
  };

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

  const checkReducedMotion = () => {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: checkReducedMotion() ? 0 : 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              duration: checkReducedMotion() ? 0 : undefined
            }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-gray-200 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Title */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">{getModalTitle()}</h2>
                <motion.button
                  whileHover={{ scale: checkReducedMotion() ? 1 : 1.1, rotate: checkReducedMotion() ? 0 : 90 }}
                  whileTap={{ scale: checkReducedMotion() ? 1 : 0.9 }}
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-400 transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">

                 {/* Date/Time Readout Input */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.05 }}
                   className="flex items-center gap-3"
                 >
                    <div className="mt-1 text-slate-400"><Calendar size={18} /></div>
                    <input
                      type="text"
                      value={getFormattedHeaderDate()}
                      readOnly
                      className="w-full text-base font-semibold text-gray-800 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent cursor-default"
                    />
                 </motion.div>

                 {/* Description */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.08 }}
                   className="flex items-start gap-3"
                 >
                    <div className="mt-1 text-slate-400"><AlignLeft size={18} /></div>
                    <input
                      type="text"
                      placeholder="Add a description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent placeholder-slate-400"
                    />
                 </motion.div>

                 {/* Attendees / Patient */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.11 }}
                   className="flex items-start gap-3"
                 >
                    <div className="mt-1.5 text-slate-400"><Users size={18} /></div>
                    <div className="flex-1">
                       <div className="flex flex-wrap gap-2 mb-2">
                          {attendees.map((att, i) => (
                            <motion.span
                              key={att}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.15 + (i * 0.03) }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700"
                            >
                               {att}
                               <button
                                 onClick={() => setAttendees(prev => prev.filter(a => a !== att))}
                                 className="hover:text-red-500 ml-1 transition-colors"
                               >
                                 <X size={12} />
                               </button>
                            </motion.span>
                          ))}
                       </div>
                       <input
                          type="text"
                          placeholder="Invite other Providers (Optional)"
                          className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent placeholder-slate-400"
                       />
                    </div>
                 </motion.div>

                 {/* Suggested Times */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.14 }}
                 >
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Suggested Times</label>
                    <div className="grid grid-cols-3 gap-2">
                       <motion.button
                         whileHover={{ scale: checkReducedMotion() ? 1 : 1.02 }}
                         whileTap={{ scale: checkReducedMotion() ? 1 : 0.98 }}
                         className="p-2 border-2 border-blue-500 bg-blue-50 rounded-lg text-left transition-all"
                       >
                          <div className="text-[10px] font-bold text-blue-700">Wed 9/3</div>
                          <div className="text-[10px] font-medium text-blue-600">{startTime} - {endTime}</div>
                       </motion.button>
                       <motion.button
                         whileHover={{ scale: checkReducedMotion() ? 1 : 1.02 }}
                         whileTap={{ scale: checkReducedMotion() ? 1 : 0.98 }}
                         className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition-all opacity-60 hover:opacity-100"
                       >
                          <div className="text-[10px] font-bold text-slate-700">Thu 9/4</div>
                          <div className="text-[10px] font-medium text-slate-500">{startTime} - {endTime}</div>
                       </motion.button>
                       <motion.button
                         whileHover={{ scale: checkReducedMotion() ? 1 : 1.02 }}
                         whileTap={{ scale: checkReducedMotion() ? 1 : 0.98 }}
                         className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition-all opacity-60 hover:opacity-100"
                       >
                          <div className="text-[10px] font-bold text-slate-700">Fri 9/5</div>
                          <div className="text-[10px] font-medium text-slate-500">{startTime} - {endTime}</div>
                       </motion.button>
                    </div>
                 </motion.div>

                 {/* Date & Time Pickers */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.17 }}
                   className="flex items-center gap-3"
                 >
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
                       <motion.button
                         whileHover={{ scale: checkReducedMotion() ? 1 : 1.1, rotate: checkReducedMotion() ? 0 : 15 }}
                         whileTap={{ scale: checkReducedMotion() ? 1 : 0.9 }}
                         className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                       >
                          <Globe size={16} />
                       </motion.button>
                    </div>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="pl-8"
                 >
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                       <input
                          type="checkbox"
                          checked={isAllDay}
                          onChange={(e) => setIsAllDay(e.target.checked)}
                          className="rounded border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81]"
                       />
                       <span className="text-sm text-slate-600">All Day</span>
                    </label>
                 </motion.div>

                 {/* Appointment Type */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.23 }}
                   className="flex items-center gap-3"
                 >
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
                 </motion.div>

                 {/* Location */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.26 }}
                   className="flex items-center gap-3"
                 >
                    <div className="mt-1 text-slate-400"><MapPin size={18} /></div>
                    <input
                      type="text"
                      placeholder="Add a room or location"
                      className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1 bg-transparent placeholder-slate-400"
                    />
                 </motion.div>

                 {/* Video Conferencing */}
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.29 }}
                   className="flex items-center gap-3"
                 >
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
                 </motion.div>

              </div>

              {/* Footer Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3"
              >
                 <motion.button
                   whileHover={{ scale: checkReducedMotion() ? 1 : 1.02 }}
                   whileTap={{ scale: checkReducedMotion() ? 1 : 0.98 }}
                   onClick={onClose}
                   className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                 >
                    Cancel
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: checkReducedMotion() ? 1 : 1.02 }}
                   whileTap={{ scale: checkReducedMotion() ? 1 : 0.98 }}
                   onClick={onClose}
                   className="px-6 py-2 text-sm font-bold text-white bg-[#0F4C81] hover:bg-[#09355E] rounded-lg shadow-sm transition-colors"
                 >
                    Save
                 </motion.button>
              </motion.div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
