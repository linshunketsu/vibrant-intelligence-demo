import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Settings, Calendar as CalendarIcon, 
  Clock, Check, X, HelpCircle, MoreHorizontal, Info 
} from 'lucide-react';
import { CreateEventModal } from './CreateEventModal';
import { CalendarSettings } from './CalendarSettings';

// Mock Data
const REQUESTS = [
  { id: 1, name: 'Daniel Anderson', time: 'Sep 12, 2025 10:00AM - 10:15AM', status: 'Available' },
  { id: 2, name: 'Michael Johnson', time: 'Sep 14, 2025 11:00AM - 11:15AM', status: 'Time Conflict' },
  { id: 3, name: 'Emily Thompson', time: 'Sep 15, 2025 10:00AM - 10:15AM', status: 'Available' },
];

interface CalendarEvent {
  id: string | number;
  title: string;
  start?: string;
  end?: string;
  date: string; // YYYY-MM-DD
  allDay?: boolean;
  color: string;
}

const WEEK_EVENTS: CalendarEvent[] = [
  // --- All Day ---
  { id: 'ad1', title: 'Labor Day', date: '2025-09-01', allDay: true, color: 'bg-[#1e3a5f]' },
  { id: 'ad2', title: 'Medical Conference', date: '2025-09-02', allDay: true, color: 'bg-[#1e3a5f]' },
  { id: 'ad3', title: 'Staff Training', date: '2025-09-03', allDay: true, color: 'bg-[#1e3a5f]' },

  // --- Monday 9/1 ---
  { id: 101, title: 'Morning Rounds', start: '8:00 AM', end: '9:00 AM', date: '2025-09-01', color: 'bg-[#1e3a5f]' },
  { id: 102, title: 'Acute Visit - J. Doe', start: '10:30 AM', end: '11:00 AM', date: '2025-09-01', color: 'bg-[#d97706]' },
  { id: 103, title: 'Telehealth Block', start: '1:00 PM', end: '3:00 PM', date: '2025-09-01', color: 'bg-[#60a5fa]' },
  { id: 104, title: 'Wrap up', start: '4:45 PM', end: '5:15 PM', date: '2025-09-01', color: 'bg-[#2dd4bf]' },

  // --- Tuesday 9/2 ---
  { id: 201, title: 'New Patient - S. Smith', start: '9:00 AM', end: '10:00 AM', date: '2025-09-02', color: 'bg-[#c084fc]' },
  { id: 202, title: 'Lab Review', start: '11:00 AM', end: '11:30 AM', date: '2025-09-02', color: 'bg-[#2dd4bf]' },
  { id: 203, title: 'Lunch w/ Dr. Lee', start: '12:00 PM', end: '1:00 PM', date: '2025-09-02', color: 'bg-slate-400' },
  { id: 204, title: 'Follow-up', start: '2:30 PM', end: '2:45 PM', date: '2025-09-02', color: 'bg-[#2dd4bf]' },
  { id: 205, title: 'Urgent Care Slot', start: '3:00 PM', end: '4:00 PM', date: '2025-09-02', color: 'bg-[#d97706]' },

  // --- Wednesday 9/3 ---
  { id: 1, title: 'Checkup - Daniel A.', start: '10:00 AM', end: '10:15 AM', date: '2025-09-03', color: 'bg-[#60a5fa]' },
  { id: 3, title: 'Follow-up - Michael', start: '12:00 PM', end: '12:15 PM', date: '2025-09-03', color: 'bg-[#2dd4bf]' },
  { id: 301, title: 'Admin Time', start: '12:30 PM', end: '1:30 PM', date: '2025-09-03', color: 'bg-slate-400' },
  { id: 5, title: 'Initial Cons - Emily', start: '2:00 PM', end: '2:45 PM', date: '2025-09-03', color: 'bg-[#c084fc]' },
  { id: 302, title: 'Pediatric Check', start: '3:30 PM', end: '4:00 PM', date: '2025-09-03', color: 'bg-[#60a5fa]' },

  // --- Thursday 9/4 ---
  { id: 401, title: 'Team Huddle', start: '8:30 AM', end: '9:00 AM', date: '2025-09-04', color: 'bg-[#1e3a5f]' },
  { id: 2, title: 'Follow-up', start: '10:30 AM', end: '11:00 AM', date: '2025-09-04', color: 'bg-[#2dd4bf]' },
  { id: 4, title: 'General Checkup', start: '1:00 PM', end: '1:30 PM', date: '2025-09-04', color: 'bg-[#d97706]' },
  { id: 402, title: 'Vaccination Block', start: '2:00 PM', end: '4:00 PM', date: '2025-09-04', color: 'bg-[#60a5fa]' },
  { id: 7, title: 'Update diagnosis for...', start: '5:00 PM', end: '6:00 PM', date: '2025-09-04', color: 'bg-[#1e3a5f]' },

  // --- Friday 9/5 ---
  { id: 501, title: 'Procedure - Minor', start: '9:00 AM', end: '10:30 AM', date: '2025-09-05', color: 'bg-[#1e3a5f]' },
  { id: 502, title: 'Post-op Check', start: '11:00 AM', end: '11:15 AM', date: '2025-09-05', color: 'bg-[#2dd4bf]' },
  { id: 503, title: 'Sick Visit', start: '1:15 PM', end: '1:45 PM', date: '2025-09-05', color: 'bg-[#d97706]' },
  { id: 6, title: 'Review patient logs', start: '4:00 PM', end: '4:30 PM', date: '2025-09-05', color: 'bg-[#1e3a5f]' },

  // --- Saturday 9/6 ---
  { id: 601, title: 'On Call - Urgent Only', start: '9:00 AM', end: '1:00 PM', date: '2025-09-06', color: 'bg-[#d97706]' },
];

const DAYS_HEADER = [
  { day: 'Sun', date: '8/31', fullDate: '2025-08-31' },
  { day: 'Mon', date: '9/1', fullDate: '2025-09-01' },
  { day: 'Tue', date: '9/2', fullDate: '2025-09-02' },
  { day: 'Wed', date: '9/3', fullDate: '2025-09-03' },
  { day: 'Thu', date: '9/4', fullDate: '2025-09-04' },
  { day: 'Fri', date: '9/5', fullDate: '2025-09-05' },
  { day: 'Sat', date: '9/6', fullDate: '2025-09-06' },
];

export const CalendarView: React.FC = () => {
  const [view, setView] = useState<'Month' | 'Week' | 'Day'>('Week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{ date: string, time: string }>({ date: '', time: '' });
  const [showSettings, setShowSettings] = useState(false);

  // Helper for grid generation
  const hours = [
    '6am', '7am', '8am', '9am', '10am', '11am', '12pm', 
    '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
  ];

  const getEventsForDay = (dateStr: string) => {
    return WEEK_EVENTS.filter(e => e.date === dateStr && !e.allDay);
  };

  const getAllDayEventsForDay = (dateStr: string) => {
    return WEEK_EVENTS.filter(e => e.date === dateStr && e.allDay);
  };

  const handleCellClick = (date: string, hourRaw: string) => {
     const suffix = hourRaw.slice(-2).toUpperCase(); // AM or PM
     const timeNum = hourRaw.slice(0, -2);
     const formattedTime = `${timeNum}:00 ${suffix}`;
     
     setModalInitialData({ date, time: formattedTime });
     setIsModalOpen(true);
  };

  if (showSettings) {
    return <CalendarSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white shrink-0">
        {/* Mini Calendar */}
        <div className="p-4 border-b border-gray-100">
           <div className="flex items-center justify-between mb-4">
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
              <span className="font-bold text-slate-700">September 2025</span>
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
           </div>
           {/* Simple Grid for Mini Calendar */}
           <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              <span className="text-gray-400">S</span>
              <span className="text-gray-400">M</span>
              <span className="text-gray-400">T</span>
              <span className="text-gray-400">W</span>
              <span className="text-gray-400">T</span>
              <span className="text-gray-400">F</span>
              <span className="text-gray-400">S</span>
           </div>
           <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {/* Padding days */}
              <span className="p-1"></span>
              {[1, 2].map(d => <span key={d} className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50 rounded-full cursor-pointer mx-auto">{d}</span>)}
              <span className="w-8 h-8 flex items-center justify-center bg-[#0F4C81] text-white rounded-full font-bold mx-auto shadow-md">3</span>
              {Array.from({length: 27}, (_, i) => i + 4).map(d => (
                 <span key={d} className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50 rounded-full cursor-pointer mx-auto">{d}</span>
              ))}
           </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
           <div className="p-4">
              <div className="flex items-center justify-between mb-3 cursor-pointer">
                 <h3 className="text-sm font-bold text-slate-700">Patient Meeting Requests ({REQUESTS.length + 7})</h3>
                 <ChevronLeft size={16} className="-rotate-90 text-slate-400" />
              </div>
              
              {/* Info Alert */}
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 mb-4 border border-blue-100 shadow-sm">
                  <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-700 leading-relaxed">
                      <span className="font-bold">3 time slots available</span> due to patient cancellation. <span className="underline cursor-pointer font-bold hover:text-blue-800">See Detail</span>
                  </div>
              </div>

              {/* Request Cards */}
              <div className="space-y-3">
                  {REQUESTS.map(req => (
                      <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium text-slate-500">{req.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  req.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                  {req.status}
                              </span>
                          </div>
                          <div className="text-xs font-bold text-slate-800 mb-3 tracking-tight">
                              {req.time}
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                              <button className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                                  <X size={12} strokeWidth={3} /> Decline
                              </button>
                              <button className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded transition-colors">
                                  <HelpCircle size={12} strokeWidth={3} /> Reschedule
                              </button>
                              <button className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">
                                  <Check size={12} strokeWidth={3} /> Accept
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Top Control Bar */}
         <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
            <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 text-sm font-bold text-[#0F4C81] hover:text-[#09355E] transition-colors"
            >
               <Settings size={18} /> Settings
            </button>
            <div className="flex bg-slate-100 p-1 rounded-lg">
               <button className="px-4 py-1.5 bg-[#0F4C81] text-white text-sm font-bold rounded shadow-sm flex items-center gap-2">
                  <CalendarIcon size={14} /> Switch to Calendar
               </button>
               <button className="px-4 py-1.5 text-slate-500 text-sm font-bold hover:bg-white/60 hover:text-slate-700 rounded flex items-center gap-2 transition-all">
                  Switch to Task <Clock size={14} />
               </button>
            </div>
         </div>

         {/* Calendar Toolbar */}
         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronLeft size={18} className="text-gray-600"/></button>
                  <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronRight size={18} className="text-gray-600"/></button>
               </div>
               <button className="px-4 py-2 border border-[#0F4C81] bg-[#0F4C81] text-white rounded-lg text-sm font-bold transition-colors shadow-sm">Today</button>
               <h2 className="text-2xl font-medium text-slate-700">
                  {view === 'Week' ? 'Aug 31 - Sep 6, 2025' : 'September 3, 2025'}
               </h2>
            </div>
            
            <div className="flex bg-[#0F4C81] rounded-lg p-0.5 font-bold overflow-hidden shadow-sm">
               <button onClick={() => setView('Month')} className={`px-5 py-1.5 text-sm transition-all ${view === 'Month' ? 'bg-[#1e3a5f] text-white shadow-inner' : 'text-white/80 hover:bg-white/10'}`}>Month</button>
               <button onClick={() => setView('Week')} className={`px-5 py-1.5 text-sm transition-all ${view === 'Week' ? 'bg-[#1e3a5f] text-white shadow-inner' : 'text-white/80 hover:bg-white/10'}`}>Week</button>
               <button onClick={() => setView('Day')} className={`px-5 py-1.5 text-sm transition-all ${view === 'Day' ? 'bg-[#1e3a5f] text-white shadow-inner' : 'text-white/80 hover:bg-white/10'}`}>Day</button>
            </div>
         </div>

         {/* Scrollable Calendar Grid */}
         <div className="flex-1 overflow-y-auto bg-white relative custom-scrollbar">
            
            {/* --- HEADER --- */}
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
               <div className="w-16 border-r border-gray-200 bg-white shrink-0"></div>
               {/* Week Header Columns */}
               <div className="flex-1 flex">
                  {DAYS_HEADER.map((d, i) => (
                     <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0 py-2 text-center">
                        <div className="text-xs text-slate-500 font-medium">{d.day} {d.date}</div>
                     </div>
                  ))}
               </div>
            </div>

            {/* --- ALL DAY ROW --- */}
            <div className="flex border-b border-gray-200 min-h-[40px] sticky z-10 bg-white" style={{ top: '33px' }}>
               <div className="w-16 border-r border-gray-200 bg-white flex items-center justify-center text-xs text-gray-500 shrink-0">
                  all-day
               </div>
               <div className="flex-1 flex relative">
                  {DAYS_HEADER.map((d, i) => {
                     const events = getAllDayEventsForDay(d.fullDate);
                     return (
                        <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0 p-1 relative">
                           {events.map((ev, idx) => (
                              <div key={idx} className={`${ev.color} text-white text-[10px] font-semibold px-2 py-1 rounded w-full shadow-sm mb-1 truncate`}>
                                 {ev.title}
                              </div>
                           ))}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* --- TIME GRID --- */}
            <div className="relative pb-10">
               {hours.map((hour, index) => (
                  <div key={hour} className="flex h-16 border-b border-gray-100 group">
                     {/* Time Label */}
                     <div className="w-16 border-r border-gray-200 bg-white text-right pr-2 pt-1 text-xs text-gray-400 font-medium shrink-0 group-hover:text-gray-600 relative">
                        <span className="-top-2.5 relative bg-white pl-1">{hour}</span>
                     </div>
                     {/* Grid Cells */}
                     <div className="flex-1 flex relative group-hover:bg-slate-50/10 transition-colors">
                        {DAYS_HEADER.map((d, i) => (
                           <div 
                              key={i} 
                              className="flex-1 border-r border-gray-100 last:border-r-0 relative cursor-pointer hover:bg-blue-50/20 active:bg-blue-50/40 transition-colors"
                              onClick={() => handleCellClick(d.fullDate, hour)}
                           ></div>
                        ))}
                        {/* Half hour line */}
                        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-100 w-full pointer-events-none"></div>
                     </div>
                  </div>
               ))}

               {/* Absolute Events Overlay */}
               <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
                  <div className="flex h-full w-full">
                     {DAYS_HEADER.map((d, i) => {
                        const events = getEventsForDay(d.fullDate);
                        return (
                           <div key={i} className="flex-1 h-full relative">
                              {events.map(event => (
                                 <div 
                                    key={event.id}
                                    className={`absolute left-0.5 right-1 rounded-sm px-1.5 py-0.5 flex flex-col justify-start text-white text-[10px] font-semibold pointer-events-auto cursor-pointer hover:brightness-110 shadow-sm border-l-2 border-white/20 ${event.color} transition-all hover:shadow-md z-10`}
                                    style={{ 
                                       top: calculateTop(event.start || ''), 
                                       height: calculateHeight(event.start || '', event.end || '') 
                                    }}
                                 >
                                    <div className="flex items-center gap-1 truncate">
                                       <span className="truncate">{event.start}-{event.end} {event.title}</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <CreateEventModal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)}
         initialDate={modalInitialData.date}
         initialTime={modalInitialData.time}
      />
    </div>
  );
};

// Simple helper to calculate position based on time string (e.g. "10:00 AM")
// Assuming grid starts at 6am. 1 hour = 64px (h-16)
function calculateTop(timeStr: string): string {
   const startHour = 6;
   const pixelsPerHour = 64;
   
   const [time, period] = timeStr.split(' ');
   let [hours, minutes] = time.split(':').map(Number);
   
   if (period === 'PM' && hours !== 12) hours += 12;
   if (period === 'AM' && hours === 12) hours = 0;
   
   const totalMinutesFromStart = (hours * 60 + minutes) - (startHour * 60);
   const pixels = (totalMinutesFromStart / 60) * pixelsPerHour;
   
   return `${pixels}px`;
}

function calculateHeight(start: string, end: string): string {
   const pixelsPerHour = 64;
   
   const parse = (t: string) => {
      const [time, period] = t.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
   };
   
   const diffMinutes = parse(end) - parse(start);
   const height = (diffMinutes / 60) * pixelsPerHour;
   
   // Minimum height for visibility
   return `${Math.max(height, 20)}px`;
}
