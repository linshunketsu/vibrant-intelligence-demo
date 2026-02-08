import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Video, MapPin, FileText } from 'lucide-react';

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
}

interface PatientInfo {
  name: string;
  avatar?: string;
}

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientInfo;
  onSchedule: (data: {
    type: string;
    date: string;
    time: string;
    location: string;
    title: string;
    zoomLink?: string;
  }) => void;
}

const APPOINTMENT_TYPES: AppointmentType[] = [
  { id: 'consultation', name: 'Initial Consultation', duration: 30 },
  { id: 'followup', name: 'Follow-Up', duration: 15 },
  { id: 'checkup', name: 'Checkup', duration: 20 },
  { id: 'lab-review', name: 'Lab Results Review', duration: 15 },
];

const LOCATIONS = [
  { id: 'video', name: 'Video Call' },
  { id: 'office', name: 'Office' },
  { id: 'phone', name: 'Phone' },
];

const PROVIDERS = [
  { id: 'dr-hoffman', name: 'Irene Hoffman' },
  { id: 'dr-smith', name: 'Dr. Sarah Smith' },
  { id: 'dr-johnson', name: 'Dr. Michael Johnson' },
];

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSchedule,
}) => {
  const [selectedType, setSelectedType] = useState<string>(APPOINTMENT_TYPES[0].id);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>(LOCATIONS[0].id);
  const [selectedProvider, setSelectedProvider] = useState<string>(PROVIDERS[0].id);
  const [title, setTitle] = useState<string>('');
  const [zoomLink, setZoomLink] = useState<string>('');

  // Set default date to today
  React.useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
    }
  }, []);

  const handleSchedule = () => {
    if (selectedType && selectedDate && selectedTime && selectedLocation) {
      onSchedule({
        type: APPOINTMENT_TYPES.find(t => t.id === selectedType)?.name || '',
        date: selectedDate,
        time: selectedTime,
        location: LOCATIONS.find(l => l.id === selectedLocation)?.name || '',
        title: title || `${APPOINTMENT_TYPES.find(t => t.id === selectedType)?.name} - ${patient.name}`,
        zoomLink,
      });
      // Reset form
      setTitle('');
      setZoomLink('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const isFormValid = selectedType && selectedDate && selectedTime && selectedLocation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl ring-1 ring-black/10 w-full max-w-md animate-in zoom-in-95 duration-200 slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#1a73e8]" />
            <h2 className="text-base font-semibold text-gray-900">New Appointment</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Patient Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <User size={13} />
              Patient
            </label>
            <input
              type="text"
              value={patient.name}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-default"
            />
          </div>

          {/* Provider Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <User size={13} />
              Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
            >
              {PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <FileText size={13} />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Appointment title (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <CalendarIcon size={13} />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <Clock size={13} />
              Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
            >
              <option value="">Select time</option>
              {['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
                '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
                '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
                '5:00 PM', '5:30 PM'].map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Appointment Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
            >
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.name} ({type.duration} min)</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <MapPin size={13} />
              Location
            </label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    selectedLocation === location.id
                      ? 'bg-[#1a73e8] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom/Video Link */}
          {selectedLocation === 'video' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <Video size={13} />
                Video Call Link
              </label>
              <input
                type="url"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent placeholder:text-gray-400"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!isFormValid}
            className="px-4 py-2 bg-[#1a73e8] text-white text-sm font-medium rounded-lg hover:bg-[#1557b0] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
