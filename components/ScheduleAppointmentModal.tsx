import React, { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Video, MapPin } from 'lucide-react';

interface AppointmentType {
  id: string;
  name: string;
  duration: number; // in minutes
  color: string;
}

interface PatientInfo {
  name: string;
  avatar?: string;
}

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientInfo;
  onSchedule: (data: { type: string; date: string; time: string; location: string }) => void;
}

const APPOINTMENT_TYPES: AppointmentType[] = [
  { id: 'consultation', name: 'Initial Consultation', duration: 30, color: 'bg-blue-500' },
  { id: 'followup', name: 'Follow-Up', duration: 15, color: 'bg-teal-500' },
  { id: 'checkup', name: 'Checkup', duration: 20, color: 'bg-emerald-500' },
  { id: 'lab-review', name: 'Lab Results Review', duration: 15, color: 'bg-purple-500' },
];

const LOCATIONS = [
  { id: 'office', name: 'Office - Main Street', icon: MapPin },
  { id: 'video', name: 'Video Call', icon: Video },
  { id: 'phone', name: 'Phone Call', icon: User },
];

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM',
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
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null); // Empty cells for days before the 1st
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleSchedule = () => {
    if (selectedType && selectedDate && selectedTime && selectedLocation) {
      onSchedule({
        type: APPOINTMENT_TYPES.find(t => t.id === selectedType)?.name || '',
        date: `${monthNames[currentMonth.getMonth()]} ${selectedDate}, ${currentMonth.getFullYear()}`,
        time: selectedTime,
        location: LOCATIONS.find(l => l.id === selectedLocation)?.name || '',
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const isFormValid = selectedType && selectedDate && selectedTime && selectedLocation;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-white to-slate-50/30">
          <h2 className="text-lg font-semibold text-slate-800">Schedule Appointment</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 text-gray-400 hover:text-gray-600"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Patient Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-[#0F4C81] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{patient.name}</p>
              <p className="text-xs text-gray-500">Patient</p>
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Appointment Type</label>
            <div className="grid grid-cols-2 gap-2">
              {APPOINTMENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedType === type.id
                      ? `${type.color} border-current bg-white shadow-sm`
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <p className={`font-medium text-sm ${selectedType === type.id ? 'text-gray-900' : 'text-gray-700'}`}>
                    {type.name}
                  </p>
                  <p className={`text-xs mt-1 ${selectedType === type.id ? 'text-gray-600' : 'text-gray-400'}`}>
                    {type.duration} min
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
            <div className="border border-gray-200/80 rounded-xl p-4 bg-white shadow-sm">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold text-slate-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => day && setSelectedDate(day.toString())}
                    disabled={!day}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 ${
                      !day
                        ? 'invisible'
                        : selectedDate === day.toString()
                        ? 'bg-[#0F4C81] text-white shadow-sm'
                        : 'hover:bg-slate-100 text-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Time</label>
              <div className="border border-gray-200/80 rounded-xl p-3 bg-white max-h-48 overflow-y-auto shadow-sm">
                <div className="grid grid-cols-2 gap-1">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-[#0F4C81] text-white shadow-sm'
                          : 'hover:bg-slate-100 text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <div className="border border-gray-200/80 rounded-xl divide-y divide-gray-100/60 bg-white shadow-sm">
                {LOCATIONS.map((location) => {
                  const Icon = location.icon;
                  return (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`w-full flex items-center gap-3 p-3 transition-all duration-200 ${
                        selectedLocation === location.id ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${
                        selectedLocation === location.id ? 'bg-[#0F4C81] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className={`text-sm font-medium ${
                        selectedLocation === location.id ? 'text-[#0F4C81]' : 'text-gray-700'
                      }`}>
                        {location.name}
                      </span>
                      {selectedLocation === location.id && (
                        <svg className="w-4 h-4 text-[#0F4C81] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          {isFormValid && (
            <div className="bg-gradient-to-r from-blue-50 to-sky-50/80 rounded-xl p-4 border border-blue-100/80 shadow-sm">
              <p className="text-sm font-bold text-blue-900 mb-2">Appointment Summary</p>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-medium">Type:</span> {APPOINTMENT_TYPES.find(t => t.id === selectedType)?.name}</p>
                <p><span className="font-medium">Date:</span> {monthNames[currentMonth.getMonth()]} {selectedDate}, {currentMonth.getFullYear()}</p>
                <p><span className="font-medium">Time:</span> {selectedTime}</p>
                <p><span className="font-medium">Location:</span> {LOCATIONS.find(l => l.id === selectedLocation)?.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/60 bg-gradient-to-r from-white to-slate-50/30 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={!isFormValid}
            className="px-6 py-2.5 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#09355E] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CalendarIcon size={18} />
            Schedule Appointment
          </button>
        </div>
      </div>
    </div>
  );
};
