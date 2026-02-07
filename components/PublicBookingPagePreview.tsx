import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Calendar, Clock, Mail } from 'lucide-react';

interface AppointmentType {
  id: number;
  name: string;
  color: string;
}

interface ScheduleData {
  [key: string]: { active: boolean; slots: { start: string; end: string }[] };
}

interface PublicBookingPagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  clinicianName: string;
  clinicianPhoto?: string;
  practiceName: string;
  schedule: ScheduleData;
  appointmentTypes: AppointmentType[];
}

// Mock avatar if none provided
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face';

// Helper function to parse time string (e.g., "10:00 AM") to minutes
const parseTimeToMinutes = (timeStr: string): number | null => {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;

    const [, hourStr, minStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    const periodUpper = period.toUpperCase();

    // Convert to 24-hour format
    if (periodUpper === 'PM' && hour !== 12) {
      hour += 12;
    } else if (periodUpper === 'AM' && hour === 12) {
      hour = 0;
    }

    return hour * 60 + min;
  } catch {
    return null;
  }
};

// Helper function to convert minutes to time string
const minutesToTimeStr = (minutes: number): string => {
  const hour = Math.floor(minutes / 60) % 24;
  const min = minutes % 60;
  const period = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMin = min === 0 ? '00' : min.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${period}`;
};

export const PublicBookingPagePreview: React.FC<PublicBookingPagePreviewProps> = ({
  isOpen,
  onClose,
  clinicianName,
  clinicianPhoto,
  practiceName,
  schedule,
  appointmentTypes,
}) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentType | null>(
    appointmentTypes?.[0] || null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Set initial month to February 2026 for demo purposes
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Feb 2026

  // Initialize appointment type when data changes
  useEffect(() => {
    if (appointmentTypes && appointmentTypes.length > 0) {
      setSelectedAppointmentType(prev => prev || appointmentTypes[0]);
    }
  }, [appointmentTypes]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedTime(null);
      setShowConfirmation(false);
      setCurrentMonth(new Date(2026, 1, 1)); // Reset to Feb 2026
    }
  }, [isOpen]);

  // Reset selected time when date changes
  const handleDateSelect = useCallback((day: number) => {
    setSelectedDate(day);
    setSelectedTime(null);
  }, []);

  // Generate days for current month
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, []);

  // Get available time slots for a selected day
  const getAvailableSlots = useCallback((day: number | null): string[] => {
    if (day === null) return [];

    try {
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayOfWeek = dateObj.getDay();
      const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayKey = dayKeys[dayOfWeek];
      const daySchedule = schedule[dayKey];

      if (!daySchedule || !daySchedule.active || daySchedule.slots.length === 0) {
        return [];
      }

      const slots: string[] = [];

      daySchedule.slots.forEach(slot => {
        const startMinutes = parseTimeToMinutes(slot.start);
        const endMinutes = parseTimeToMinutes(slot.end);

        // Skip if parsing failed
        if (startMinutes === null || endMinutes === null) {
          return;
        }

        // Generate slots every 30 minutes based on the actual configured range
        const allPossibleSlots: string[] = [];
        for (let currentMin = startMinutes; currentMin + 30 <= endMinutes; currentMin += 30) {
          // Skip lunch hour (12:00 PM - 1:00 PM) for realism
          const hour = Math.floor(currentMin / 60);
          if (hour === 12) continue;

          allPossibleSlots.push(minutesToTimeStr(currentMin));
        }

        // Use the day number as a seed to randomly "book" some slots
        // This makes each day have different availability
        const seed = day; // different for each day
        allPossibleSlots.forEach((slot, idx) => {
          // Simple pseudo-random based on day and index
          // This gives consistent results for the same day while varying across days
          const pseudoRandom = (seed * 13 + idx * 7) % 10;

          // Skip some slots to simulate bookings (30-40% of slots are booked)
          if (pseudoRandom < 3 || pseudoRandom > 7) {
            slots.push(slot);
          }
        });
      });

      // Limit total slots for better UX
      return slots.slice(0, 12);
    } catch (error) {
      console.error('Error generating slots:', error);
      return [];
    }
  }, [currentMonth, schedule]);

  const availableSlots = useMemo(() => getAvailableSlots(selectedDate), [selectedDate, getAvailableSlots]);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedTime && selectedAppointmentType) {
      setShowConfirmation(true);
    }
  };

  const handleDone = () => {
    setShowConfirmation(false);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  const isDateAvailable = useCallback((day: number | null) => {
    if (day === null) return false;

    // Check if the day is in the past (before Feb 12, 2026)
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const cutoffDate = new Date(2026, 1, 12); // Feb 12, 2026 (month is 0-indexed)
    // Reset time to midnight for accurate comparison
    dateObj.setHours(0, 0, 0, 0);
    if (dateObj < cutoffDate) return false;

    const dayOfWeek = dateObj.getDay();
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = dayKeys[dayOfWeek];
    return schedule[dayKey]?.active || false;
  }, [currentMonth, schedule]);

  const isSelectedDate = useCallback((day: number | null) => {
    return day === selectedDate;
  }, [selectedDate]);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth, getDaysInMonth]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  // Confirmation Screen
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleDone}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">Booking Confirmed!</h2>
            <p className="text-green-100 text-sm mt-1">Your appointment has been scheduled</p>
          </div>

          {/* Confirmation Details */}
          <div className="p-6 space-y-4">
            {/* Appointment Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={clinicianPhoto || DEFAULT_AVATAR}
                  alt={clinicianName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <p className="font-semibold text-slate-800">{clinicianName}</p>
                  <p className="text-xs text-slate-500">{practiceName}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-slate-700">
                    <span className="font-medium">{monthName} {selectedDate}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-slate-700">
                    at <span className="font-medium">{selectedTime}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-sm bg-blue-400" />
                  <span className="text-slate-700">
                    <span className="font-medium">{selectedAppointmentType?.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation Notice */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  A confirmation email has been sent to your email address with all the appointment details and calendar invite.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleDone}
              className="w-full px-6 py-3 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#09355E] transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-[#0F4C81] to-[#1673A8] text-white px-4 py-2">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-medium text-blue-100 uppercase tracking-wide">Public Booking Page</p>
              <p className="text-xs font-bold">Preview Mode</p>
            </div>
            <div className="w-5" />
          </div>
        </div>

        {/* Compact Clinician Info Row */}
        <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-3">
          <img
            src={clinicianPhoto || DEFAULT_AVATAR}
            alt={clinicianName}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-800 truncate">{clinicianName}</h2>
            <p className="text-xs text-slate-500 truncate">{practiceName}</p>
          </div>
        </div>

        {/* Appointment Type Selection - Compact Pills */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {appointmentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedAppointmentType(type)}
                className={`
                  px-2.5 py-1 rounded text-xs font-medium transition-all
                  ${selectedAppointmentType?.id === type.id
                    ? `${type.color} text-white shadow-sm`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Calendar and Time Slots Side by Side */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Calendar Section */}
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ChevronLeft size={16} className="text-slate-500" />
                </button>
                <h4 className="text-sm font-semibold text-slate-800">{monthName}</h4>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>

              {/* Calendar Grid - Compact */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-center text-[10px] font-semibold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
                {days.map((day, idx) => (
                  <button
                    key={idx}
                    disabled={!isDateAvailable(day)}
                    onClick={() => day && handleDateSelect(day)}
                    className={`
                      aspect-square rounded text-xs font-medium transition-all
                      ${day === null
                        ? 'invisible'
                        : !isDateAvailable(day)
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                        : isSelectedDate(day)
                        ? 'bg-[#0F4C81] text-white shadow-sm'
                        : 'bg-blue-50 text-[#0F4C81] hover:bg-blue-100 cursor-pointer font-semibold'
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots Section */}
            <div className="p-4">
              <h3 className="text-xs font-bold text-slate-700 mb-2">
                {selectedDate === null ? 'Select a date' : `${monthName} ${selectedDate}`}
              </h3>
              {selectedDate === null ? (
                <p className="text-xs text-slate-400 italic">Choose a date to see available times</p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        px-2 py-1.5 rounded text-xs font-medium transition-all
                        ${selectedTime === time
                          ? 'bg-[#0F4C81] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No available slots</p>
              )}
            </div>
          </div>

          {/* Booking Summary - Compact */}
          {selectedTime && selectedDate && selectedAppointmentType && (
            <div className="mx-4 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0F4C81] rounded-full flex items-center justify-center shrink-0">
                  <Check size={16} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">
                    {monthName} {selectedDate} at {selectedTime}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{selectedAppointmentType.name} with {clinicianName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400">Powered by Vibrant Intelligence</p>
          <button
            onClick={handleBookAppointment}
            disabled={!selectedTime}
            className={`
              px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm
              ${selectedTime
                ? 'bg-[#0F4C81] text-white hover:bg-[#09355E]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};
