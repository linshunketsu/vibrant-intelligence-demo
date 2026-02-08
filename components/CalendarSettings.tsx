import React, { useState, useEffect } from 'react';
import {
  Globe, Plus, X, Copy, Edit2, Trash2, Calendar,
  Clock, Check, ChevronDown, Monitor, Mail, ArrowLeft,
  Briefcase, Eye
} from 'lucide-react';
import { PublicBookingPagePreview } from './PublicBookingPagePreview';
import googleCalendarIcon from '../Google_Calendar_icon.svg.png';
import outlookIcon from '../128px-Microsoft_Outlook_Icon_(2025–present).svg.png';
import zoomIcon from '../zoom.jpeg';

interface CalendarSettingsProps {
  onBack: () => void;
}

const APPOINTMENT_TYPES = [
  { id: 1, name: 'Checkup', color: 'bg-blue-400' },
  { id: 2, name: 'Follow-Up', color: 'bg-teal-400' },
  { id: 3, name: 'Initial Consultation', color: 'bg-purple-400' },
  { id: 4, name: 'General', color: 'bg-amber-500' },
];

const DAYS = [
  { id: 'sun', label: 'S', name: 'Sunday' },
  { id: 'mon', label: 'M', name: 'Monday' },
  { id: 'tue', label: 'T', name: 'Tuesday' },
  { id: 'wed', label: 'W', name: 'Wednesday' },
  { id: 'thu', label: 'T', name: 'Thursday' },
  { id: 'fri', label: 'F', name: 'Friday' },
  { id: 'sat', label: 'S', name: 'Saturday' },
];

export const CalendarSettings: React.FC<CalendarSettingsProps> = ({ onBack }) => {
  // Weekly Hours State - More realistic schedule
  const [schedule, setSchedule] = useState<{
    [key: string]: { active: boolean; slots: { start: string; end: string }[] }
  }>({
    sun: { active: false, slots: [] },
    mon: { active: true, slots: [{ start: '09:00 AM', end: '05:00 PM' }] }, // Full day
    tue: { active: true, slots: [{ start: '09:00 AM', end: '05:00 PM' }] },
    wed: { active: true, slots: [{ start: '09:00 AM', end: '05:00 PM' }] }, // Available now
    thu: { active: true, slots: [{ start: '10:00 AM', end: '06:00 PM' }] }, // Late start, late end
    fri: { active: true, slots: [{ start: '09:00 AM', end: '03:00 PM' }] }, // Half day
    sat: { active: false, slots: [] }, // Not available
  });

  // Scheduling Window State
  const [sooner, setSooner] = useState({ val: 24, unit: 'Hours' });
  const [furthest, setFurthest] = useState({ val: 30, unit: 'Days' });

  // Public Booking Page Preview State
  const [showPublicPagePreview, setShowPublicPagePreview] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Handle copy link with toast
  const handleCopyLink = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleDay = (dayId: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        active: !prev[dayId].active,
        slots: !prev[dayId].active ? [{ start: '09:00 AM', end: '05:00 PM' }] : []
      }
    }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto custom-scrollbar relative">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-8 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">Calendar Settings</h1>
        </div>
      </div>

      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8 pb-20">
        
        {/* Time Zone */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-soft">
          <div className="flex items-start gap-3 mb-4">
            <Globe className="text-slate-400 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-800">Time Zone Settings</h3>
              <p className="text-xs text-slate-500 mt-1">Your calendar and appointment times will follow this time zone.</p>
            </div>
          </div>
          
          <div className="ml-8 max-w-md">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Display my calendar in time zone:</label>
            <div className="relative">
              <select className="w-full appearance-none bg-slate-50 border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-slate-700 focus:ring-2 focus:ring-[#0F4C81] outline-none">
                <option>Auto update</option>
                <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Public Booking Page Preview */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <Eye className="text-slate-400 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-800">Public Booking Page</h3>
              <p className="text-xs text-slate-500 mt-1">Preview and share your public scheduling page with patients.</p>
            </div>
          </div>
          <div className="ml-8 mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowPublicPagePreview(true)}
              className="px-4 py-2 bg-[#0F4C81] text-white text-sm font-semibold rounded-lg hover:bg-[#09355E] transition-all duration-200 shadow-sm"
            >
              View Public Booking Page
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
            >
              <Copy size={14} />
              Copy Link
            </button>
          </div>
        </div>

        {/* Weekly Hours & Overrides Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Weekly Hours */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-soft">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-slate-400"><Clock size={20} /></div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Weekly hours</h3>
                  <p className="text-xs text-slate-500 mt-1">Set when you are typically available for appointment</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-[#0F4C81] text-white text-sm font-semibold rounded-lg hover:bg-[#09355E] transition-all duration-200 shadow-sm">
                Save
              </button>
            </div>

            <div className="space-y-4">
              {DAYS.map(day => {
                const dayState = schedule[day.id];
                return (
                  <div key={day.id} className="flex items-start gap-4 py-1">
                    {/* Day Label */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dayState.active ? 'bg-[#0F4C81] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {day.label}
                    </div>

                    <div className="flex-1">
                      {!dayState.active ? (
                        <div className="flex items-center gap-3 h-8">
                          <span className="text-sm text-slate-400 italic">Unavailable</span>
                          <button onClick={() => toggleDay(day.id)} className="text-slate-400 hover:text-[#0F4C81] transition-colors">
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {dayState.slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="relative">
                                <select className="appearance-none bg-slate-50 border border-gray-200 rounded px-2 py-1.5 text-sm text-slate-700 w-24 focus:border-[#0F4C81] outline-none">
                                  <option>{slot.start}</option>
                                  <option>09:00 AM</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                              </div>
                              <span className="text-slate-400">-</span>
                              <div className="relative">
                                <select className="appearance-none bg-slate-50 border border-gray-200 rounded px-2 py-1.5 text-sm text-slate-700 w-24 focus:border-[#0F4C81] outline-none">
                                  <option>{slot.end}</option>
                                  <option>05:00 PM</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                              </div>
                              
                              <button className="p-1.5 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-[#0F4C81]">
                                <Plus size={14} />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-[#0F4C81]">
                                <Copy size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
               <button className="flex items-center gap-1 text-xs text-[#0F4C81] font-medium hover:underline">
                  (UTC-08:00) Pacific Time (US & Canada) <ChevronDown size={12} />
               </button>
            </div>
          </div>

          {/* Date Overrides */}
          <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-soft h-fit">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-slate-400"><Calendar size={20} /></div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Date Overrides</h3>
                  <p className="text-xs text-slate-500 mt-1">Overrides replace the default schedule for that date</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all duration-200">
                Add Hours
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-100/80 hover:border-gray-200/80 hover:shadow-sm transition-all duration-200">
                <div className="text-sm font-medium text-slate-700">Feb 17, 2026</div>
                <div className="text-sm text-slate-600">10:00AM - 10:15 AM</div>
                <div className="flex items-center gap-2">
                   <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0F4C81] px-2 py-1 rounded transition-colors">
                      <Edit2 size={12} /> Edit
                   </button>
                   <button className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors">
                      <Trash2 size={12} /> Delete
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduling Window */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-soft">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-slate-400"><Calendar size={20} /></div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Appointment Scheduling Window</h3>
                <p className="text-xs text-slate-500 mt-1">Define how soon and how far out appointments can be booked on your calendar.</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-[#0F4C81] text-white text-sm font-semibold rounded-lg hover:bg-[#09355E] transition-all duration-200 shadow-sm">
              Save
            </button>
          </div>

          <div className="max-w-lg space-y-6 ml-8">
             <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Sooner available appointment</label>
                <div className="flex gap-2">
                   <input type="number" value={sooner.val} onChange={e => setSooner({...sooner, val: parseInt(e.target.value)})} className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all" />
                   <div className="relative">
                      <select className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all">
                         <option>Hours</option>
                         <option>Days</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none"/>
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Furthest available appointment</label>
                <div className="flex gap-2">
                   <input type="number" value={furthest.val} onChange={e => setFurthest({...furthest, val: parseInt(e.target.value)})} className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all" />
                   <div className="relative">
                      <select className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all">
                         <option>Days</option>
                         <option>Weeks</option>
                         <option>Months</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none"/>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Appointment Types */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-soft">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-slate-400"><Briefcase size={20} /></div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Customize Appointment Type</h3>
                <p className="text-xs text-slate-500 mt-1">Appointment types are managed at the practice level. Changes will affect all providers in this practice.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 ml-8 max-w-2xl">
             {APPOINTMENT_TYPES.map(type => (
                <div key={type.id} className="flex items-center justify-between py-2 border-b border-gray-50/60 last:border-0 hover:bg-slate-50/60 px-2 rounded-lg transition-all duration-200">
                   <span className="text-sm font-semibold text-slate-700">{type.name}</span>
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-4 rounded ${type.color}`}></div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0F4C81] px-2 py-1 rounded transition-colors">
                            <Edit2 size={12} /> Edit
                        </button>
                        <button className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors">
                            <Trash2 size={12} /> Delete
                        </button>
                      </div>
                   </div>
                </div>
             ))}

             <div className="pt-4">
                <button className="px-4 py-2 border border-[#0F4C81] text-[#0F4C81] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200">
                   Add New Appointment Type
                </button>
             </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-soft">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-slate-400"><Monitor size={20} /></div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Calendar & Video Integrations</h3>
                <p className="text-xs text-slate-500 mt-1">Connect your external calendars and video conferencing tools for seamless scheduling.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 ml-8 max-w-4xl">
             {/* Google Calendar - Connected */}
             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl border border-green-200/60 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-4">
                   <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1">
                      <img src={googleCalendarIcon} alt="Google Calendar" className="w-full h-full object-contain" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-semibold text-slate-800">Google Calendar</span>
                         <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                           <Check size={10} strokeWidth={3} /> Connected
                         </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">irene.hoffman@vibrantclinics.com</p>
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                         <Check size={10} /> Sync active • Last sync: 2 min ago
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all">
                      Settings
                   </button>
                   <button className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                      Disconnect
                   </button>
                </div>
             </div>

             {/* Outlook - Connected */}
             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl border border-green-200/60 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-4">
                   <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1">
                      <img src={outlookIcon} alt="Microsoft Outlook" className="w-full h-full object-contain" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-semibold text-slate-800">Microsoft Outlook</span>
                         <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                           <Check size={10} strokeWidth={3} /> Connected
                         </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">ihoffman@vibrantclinics.com</p>
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                         <Check size={10} /> Sync active • Last sync: 5 min ago
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all">
                      Settings
                   </button>
                   <button className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                      Disconnect
                   </button>
                </div>
             </div>

             {/* Zoom - Connected */}
             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl border border-green-200/60 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-4">
                   <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden p-1">
                      <img src={zoomIcon} alt="Zoom" className="w-full h-full object-contain" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-semibold text-slate-800">Zoom</span>
                         <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                           <Check size={10} strokeWidth={3} /> Connected
                         </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Pro Plan • Video meetings enabled</p>
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                         <Check size={10} /> Meeting links auto-generated
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all">
                      Settings
                   </button>
                   <button className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                      Disconnect
                   </button>
                </div>
             </div>

             {/* Add more integrations CTA */}
             <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 group-hover:text-slate-700">
                   <Plus size={16} />
                   Add more integrations
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* Public Booking Page Preview Modal */}
      <PublicBookingPagePreview
        isOpen={showPublicPagePreview}
        onClose={() => setShowPublicPagePreview(false)}
        clinicianName="Dr. Irene Hoffman"
        clinicianPhoto="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face"
        practiceName="Vibrant Health Clinic"
        schedule={schedule}
        appointmentTypes={APPOINTMENT_TYPES}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-3 rounded-xl shadow-xl z-[60] animate-in fade-in slide-in-from-bottom-4">
          Link copied to clipboard
        </div>
      )}
    </div>
  );
};
