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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleDone}>
        <div
          className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Book an Appointment</h2>
            <p className="text-sm text-slate-500 mt-0.5">{clinicianName} · {practiceName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Appointment Type */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Appointment Type</label>
            <div className="flex flex-wrap gap-2">
              {appointmentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedAppointmentType(type)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedAppointmentType?.id === type.id
                      ? `${type.color} text-white`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }
                  `}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar and Time Slots in Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Calendar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} className="text-slate-600" />
                </button>
                <span className="text-sm font-semibold text-slate-700">{monthName} 2026</span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={18} className="text-slate-600" />
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl p-3">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
                      {day}
                    </div>
                  ))}
                  {days.map((day, idx) => (
                    <button
                      key={idx}
                      disabled={!isDateAvailable(day)}
                      onClick={() => day && handleDateSelect(day)}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all
                        ${day === null
                          ? 'invisible'
                          : !isDateAvailable(day)
                          ? 'text-slate-300 cursor-not-allowed'
                          : isSelectedDate(day)
                          ? 'bg-[#0F4C81] text-white'
                          : 'text-slate-700 hover:bg-gray-100 cursor-pointer'
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                {selectedDate ? `Available times · ${monthName} ${selectedDate}` : 'Select a date'}
              </h3>
              {selectedDate === null ? (
                <div className="border border-dashed border-gray-300 rounded-xl h-44 flex items-center justify-center">
                  <p className="text-sm text-slate-400">Choose a date to see times</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        py-3 rounded-lg text-sm font-medium transition-all border
                        ${selectedTime === time
                          ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                          : 'bg-white border-gray-200 text-slate-700 hover:border-[#0F4C81]'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-xl h-44 flex items-center justify-center">
                  <p className="text-sm text-slate-400">No times available</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Info Form */}
          {selectedTime && selectedDate && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Your Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full name"
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Summary and Book Button */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between rounded-b-2xl">
          {selectedTime && selectedDate && selectedAppointmentType ? (
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {monthName} {selectedDate} · {selectedTime}
              </p>
              <p className="text-xs text-slate-500">{selectedAppointmentType.name}</p>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Select date and time to continue</div>
          )}
          <button
            onClick={handleBookAppointment}
            disabled={!selectedTime}
            className={`
              px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${selectedTime
                ? 'bg-[#0F4C81] text-white hover:bg-[#09355E] shadow-sm'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
