import React, { useState, useMemo } from "react";
import { Calendar, Clock, MapPin, Plus, ChevronLeft, ChevronRight, X, Check, Edit3, Trash2 } from "lucide-react";
import FloatingModal from "../../ui/FloatingModal";
import { useLocalStorage } from "../../hooks/useLocalStorage";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const EVENT_TYPES = ["Internal", "Vendor", "Promo", "Delivery", "Meeting", "Other"];

export interface CalEvent {
  id: number;
  title: string;
  time: string;
  type: string;
  location: string;
}

const defaultEvents: Record<string, CalEvent[]> = {
  "2026-03-10": [
    { id: 1, title: "Samsung Rep Meeting", time: "10:00 AM - 11:30 AM", type: "Vendor", location: "Main Office" },
    { id: 2, title: "Stock Audit: LED TVs", time: "02:00 PM", type: "Internal", location: "Warehouse A" },
  ],
  "2026-03-14": [
    { id: 3, title: "Holi Sale Preparation", time: "09:00 AM - 12:00 PM", type: "Promo", location: "Retail Floor" },
  ],
  "2026-03-15": [
    { id: 4, title: "Sony Delivery Arrival", time: "11:00 AM", type: "Delivery", location: "Warehouse B" },
    { id: 5, title: "Staff Training Session", time: "03:00 PM - 05:00 PM", type: "Internal", location: "Conference Room" },
  ],
  "2026-03-22": [
    { id: 6, title: "Quarterly FY Review", time: "10:00 AM - 12:00 PM", type: "Internal", location: "Board Room" },
  ],
  "2026-03-25": [
    { id: 7, title: "Ugadi Sale Kick-off", time: "All Day", type: "Promo", location: "All Stores" },
  ],
  "2026-03-31": [
    { id: 8, title: "FY 2025-26 Closing", time: "All Day", type: "Internal", location: "Accounts" },
    { id: 9, title: "Year-End Inventory Count", time: "06:00 PM - 10:00 PM", type: "Internal", location: "Warehouse A" },
  ],
};

const CalendarIntegration: React.FC = () => {
  const today = new Date(2026, 2, 10);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  );
  const [events, setEvents] = useLocalStorage<Record<string, CalEvent[]>>("ss_calendar_events", defaultEvents);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CalEvent | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formType, setFormType] = useState("Internal");
  const [formLocation, setFormLocation] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const resetForm = () => { setFormTitle(""); setFormTime(""); setFormType("Internal"); setFormLocation(""); };

  const nextId = () => {
    let max = 0;
    Object.values(events).forEach(arr => arr.forEach(e => { if (e.id > max) max = e.id; }));
    return max + 1;
  };

  const handleAddEvent = () => {
    if (!formTitle.trim()) return;
    const evt: CalEvent = {
      id: nextId(),
      title: formTitle.trim(),
      time: formTime.trim() || "All Day",
      type: formType,
      location: formLocation.trim() || "—",
    };
    setEvents(prev => {
      const copy = { ...prev };
      copy[selectedDate] = [...(copy[selectedDate] || []), evt];
      return copy;
    });
    setShowAddModal(false);
    resetForm();
    showToast(`✅ "${evt.title}" added to ${selectedDate}`);
  };

  const openEditModal = (evt: CalEvent) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormTime(evt.time);
    setFormType(evt.type);
    setFormLocation(evt.location);
  };

  const handleEditEvent = () => {
    if (!editingEvent || !formTitle.trim()) return;
    setEvents(prev => {
      const copy = { ...prev };
      copy[selectedDate] = (copy[selectedDate] || []).map(e =>
        e.id === editingEvent.id ? { ...e, title: formTitle.trim(), time: formTime.trim() || "All Day", type: formType, location: formLocation.trim() || "—" } : e
      );
      return copy;
    });
    setEditingEvent(null);
    resetForm();
    showToast(`✅ Event updated!`);
  };

  const handleDeleteEvent = (evt: CalEvent) => {
    setEvents(prev => {
      const copy = { ...prev };
      copy[selectedDate] = (copy[selectedDate] || []).filter(e => e.id !== evt.id);
      if (copy[selectedDate].length === 0) delete copy[selectedDate];
      return copy;
    });
    setDeleteConfirm(null);
    showToast(`🗑️ "${evt.title}" deleted.`);
  };

  const calendarData = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    return { firstDay, daysInMonth };
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };
  const goToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`);
  };

  const getTypeColors = (type: string) => {
    switch(type) {
      case 'Vendor': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Promo': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Delivery': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Internal': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Meeting': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-white/5 text-white/70 border-white/10';
    }
  };

  const selectedEvents = events[selectedDate] || [];

  // --- Form JSX reused for Add and Edit ---
  const renderEventForm = (onSubmit: () => void, onCancel: () => void, submitLabel: string) => (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Event Title</label>
        <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Supplier Meeting" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Time</label>
          <input value={formTime} onChange={e => setFormTime(e.target.value)} placeholder="e.g. 10:00 AM - 12:00 PM" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
        </div>
        <div>
          <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Type</label>
          <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-xtext-secondary uppercase tracking-widest font-bold mb-1.5 block">Location</label>
        <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="e.g. Conference Room" className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-xbrand/40 transition-all" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onSubmit} className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black py-2.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"><Check size={16} /> {submitLabel}</button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-xcard border border-white/10 rounded-2xl px-5 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] animate-in slide-in-from-right-5 flex items-center gap-3">
          {toast}
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Calendar Integration</h1>
          <p className="text-xtext-secondary text-sm">Manage store operations, vendor meetings, and staff schedules.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
        >
          <Plus size={18} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-xcard border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-bl-[100px] pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-bold">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-background border border-white/10 hover:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>
              <button onClick={goToday} className="px-4 py-2 rounded-lg bg-background border border-white/10 font-bold hover:bg-white/10 transition-colors text-sm text-xtext-secondary">Today</button>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-background border border-white/10 hover:bg-white/10 transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-xtext-secondary uppercase tracking-wider relative z-10">
            {DAY_NAMES.map(day => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2 relative z-10">
            {Array.from({length: calendarData.firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({length: calendarData.daysInMonth}).map((_, i) => {
              const date = i + 1;
              const dateKey = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
              const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && date === today.getDate();
              const isSelected = dateKey === selectedDate;
              const dayEvents = events[dateKey] || [];
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={date}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`aspect-square p-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    isToday ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                    isSelected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 font-bold' :
                    hasEvents ? 'bg-white/5 border-white/10 text-white font-bold hover:bg-white/10' :
                    'bg-transparent border-transparent hover:border-white/10 text-xtext-secondary'
                  }`}
                >
                  <span className="text-sm">{date}</span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((_, idx) => (
                        <div key={idx} className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-cyan-400'}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Schedule Sidebar */}
        <div className="bg-background border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20"><Calendar size={20} /></div>
              <div>
                <h2 className="text-xl font-bold">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </h2>
                <p className="text-sm text-xtext-secondary">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              title="Add event on this date"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xtext-secondary text-sm py-12 opacity-50">
                <Calendar size={32} className="mb-3 opacity-30" />
                No events scheduled
                <button onClick={() => setShowAddModal(true)} className="mt-3 text-cyan-400 text-xs font-bold hover:underline">+ Add one</button>
              </div>
            ) : (
              selectedEvents.map(event => (
                <div key={event.id} className="p-4 bg-xcard border border-white/5 rounded-2xl hover:border-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-white/10 group-hover:bg-cyan-500/50 transition-colors" />
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getTypeColors(event.type)}`}>
                      {event.type}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(event)} className="p-1.5 rounded-lg hover:bg-white/10 text-xtext-secondary hover:text-cyan-400 transition-colors" title="Edit"><Edit3 size={13} /></button>
                      <button onClick={() => setDeleteConfirm(event)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-xtext-secondary hover:text-rose-400 transition-colors" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <h3 className="font-bold text-white mb-3 pl-2 leading-tight">{event.title}</h3>
                  <div className="space-y-1.5 pl-2">
                    <div className="flex items-center gap-2 text-xs text-xtext-secondary">
                      <Clock size={12} className="text-cyan-400/70" /> {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-xtext-secondary">
                      <MapPin size={12} className="text-cyan-400/70" /> {event.location}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <FloatingModal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title={`New Event — ${selectedDate}`}>
        {renderEventForm(handleAddEvent, () => { setShowAddModal(false); resetForm(); }, "Add Event")}
      </FloatingModal>

      {/* Edit Event Modal */}
      <FloatingModal isOpen={!!editingEvent} onClose={() => { setEditingEvent(null); resetForm(); }} title="Edit Event">
        {renderEventForm(handleEditEvent, () => { setEditingEvent(null); resetForm(); }, "Save Changes")}
      </FloatingModal>

      {/* Delete Confirmation Modal */}
      <FloatingModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Event">
        <div className="text-center space-y-4">
          <p className="text-sm text-white/70">Delete <strong>"{deleteConfirm?.title}"</strong> from this day?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => deleteConfirm && handleDeleteEvent(deleteConfirm)} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all">Delete</button>
            <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancel</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default CalendarIntegration;
