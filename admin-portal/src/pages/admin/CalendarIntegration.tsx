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
  "2026-04-14": [
    { id: 1, title: "Samsung Q2 Stock Delivery", time: "10:00 AM - 12:00 PM", type: "Delivery", location: "Warehouse A" },
  ],
  "2026-04-17": [
    { id: 2, title: "LG Rep Quarterly Review", time: "03:00 PM - 04:30 PM", type: "Vendor", location: "Conference Room" },
  ],
  "2026-04-21": [
    { id: 3, title: "Akshaya Tritiya Mega Sale", time: "All Day", type: "Promo", location: "All Floors" },
    { id: 4, title: "Stock Audit — Smartphones", time: "07:00 PM - 09:00 PM", type: "Internal", location: "Warehouse A" },
  ],
  "2026-04-25": [
    { id: 5, title: "AC Summer Campaign Launch", time: "11:00 AM", type: "Promo", location: "Retail Floor" },
  ],
  "2026-04-30": [
    { id: 6, title: "April Month-End Inventory Count", time: "06:00 PM - 10:00 PM", type: "Internal", location: "Both Warehouses" },
  ],
  "2026-05-01": [
    { id: 7, title: "Labour Day — Reduced Staff", time: "All Day", type: "Internal", location: "All Stores" },
  ],
  "2026-05-12": [
    { id: 8, title: "Mother's Day Weekend Sale", time: "All Day", type: "Promo", location: "All Floors" },
  ],
};

const CalendarIntegration: React.FC = () => {
  const today = new Date(); // Always use real today
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  );
  const [events, setEvents] = useLocalStorage<Record<string, CalEvent[]>>("ss_calendar_events", defaultEvents);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CalEvent | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
    showToast(`Event "${evt.title}" registered!`);
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
    showToast(`Event profile synchronized!`);
  };

  const handleDeleteEvent = (evt: CalEvent) => {
    setEvents(prev => {
      const copy = { ...prev };
      copy[selectedDate] = (copy[selectedDate] || []).filter(e => e.id !== evt.id);
      if (copy[selectedDate].length === 0) delete copy[selectedDate];
      return copy;
    });
    setDeleteConfirm(null);
    showToast(`Event purged from registry.`);
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

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'Vendor': return 'text-accent border-accent/20 bg-accent/5';
      case 'Promo': return 'text-white border-white/20 bg-white/5';
      case 'Delivery': return 'text-accent/60 border-accent/10 bg-accent/5';
      case 'Internal': return 'text-muted/60 border-white/5 bg-black/20';
      case 'Meeting': return 'text-white/80 border-white/10 bg-white/5';
      default: return 'text-muted/40 bg-white/5 border-white/5';
    }
  };

  const selectedEvents = events[selectedDate] || [];

  const renderEventForm = (onSubmit: () => void, onCancel: () => void, submitLabel: string) => (
    <div className="space-y-5 p-2">
      <div>
        <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Event Objective</label>
        <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="ENTER TITLE..." className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Time Window</label>
          <input value={formTime} onChange={e => setFormTime(e.target.value)} placeholder="E.G. 10:00 AM" className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
        </div>
        <div>
          <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Classification</label>
          <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 transition-all uppercase appearance-none cursor-pointer">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-muted/40 uppercase tracking-[0.2em] font-black mb-2 block">Deployment Location</label>
        <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="E.G. WAREHOUSE A" className="w-full bg-black/40 border border-white/8 rounded-2xl py-3.5 px-5 text-xs font-bold text-white focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all uppercase tracking-widest" />
      </div>
      <div className="flex gap-3 pt-4">
        <button onClick={onSubmit} className="flex-1 bg-accent text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all flex items-center justify-center gap-3"><Check size={18} /> {submitLabel}</button>
        <button onClick={onCancel} className="px-6 py-4 rounded-2xl border border-white/10 text-muted/60 hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">ABORT</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-surface border border-accent/20 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl animate-in slide-in-from-right-8 flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          {toast}
          <button onClick={() => setToast(null)} className="text-muted/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Temporal <span className="text-accent">Registry</span>
          </h1>
          <p className="text-muted/60 text-sm">Strategic operational scheduling and vendor synchronization protocol.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent text-black font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-accent/10 transition-all"
        >
          <Plus size={18} /> Log Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-bl-[120px] pointer-events-none" />

          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{MONTH_NAMES[viewMonth]}</h2>
              <p className="text-[10px] text-accent font-black tracking-[0.3em] mt-1">{viewYear} OPERATIONAL CYCLE</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-accent/40 text-muted/40 hover:text-white transition-all"><ChevronLeft size={22} /></button>
              <button onClick={() => {setViewMonth(today.getMonth()); setViewYear(today.getFullYear());}} className="px-6 py-3 rounded-2xl bg-black/40 border border-white/10 font-black text-[10px] uppercase tracking-widest text-muted/40 hover:text-white hover:border-white/20 transition-all">Today</button>
              <button onClick={nextMonth} className="p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-accent/40 text-muted/40 hover:text-white transition-all"><ChevronRight size={22} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-6 relative z-10">
            {DAY_NAMES.map(day => <div key={day} className="text-center text-[10px] font-black text-muted/20 uppercase tracking-[0.2em]">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-3 relative z-10">
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
                  className={`aspect-square p-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 relative group ${
                    isToday ? 'bg-accent border-accent text-black font-black shadow-xl shadow-accent/20' :
                    isSelected ? 'bg-black/60 border-accent/40 text-white font-black' :
                    hasEvents ? 'bg-black/40 border-white/10 text-white/90 font-black hover:border-accent/30' :
                    'bg-transparent border-transparent hover:border-white/10 text-muted/40'
                  }`}
                >
                  <span className="text-sm tabular-nums">{date}</span>
                  {hasEvents && !isToday && (
                    <div className="absolute bottom-2 flex gap-1">
                      {dayEvents.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 rounded-full bg-accent" />
                      ))}
                    </div>
                  )}
                  {isToday && hasEvents && (
                    <div className="absolute bottom-2 flex gap-1">
                      {dayEvents.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 rounded-full bg-black/20" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Schedule Sidebar */}
        <div className="bg-surface border border-white/5 rounded-[32px] p-8 shadow-2xl flex flex-col h-full relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"><Calendar size={22} /></div>
              <div>
                <h2 className="text-xl font-black text-white tracking-widest">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                </h2>
                <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest mt-1">{selectedEvents.length} ACTIVE LOGS</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-3 rounded-2xl bg-accent/5 text-accent border border-accent/10 hover:bg-accent/10 transition-all shadow-lg shadow-accent/5"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar relative z-10">
            {selectedEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted/20 text-[10px] font-black uppercase tracking-[0.3em] py-20">
                <Calendar size={48} className="mb-6 opacity-10" />
                No entries detected
                <button onClick={() => setShowAddModal(true)} className="mt-4 text-accent text-[10px] font-black uppercase tracking-widest border-b border-transparent hover:border-accent transition-all">+ Initialize Log</button>
              </div>
            ) : (
              selectedEvents.map(event => (
                <div key={event.id} className="p-6 bg-black/20 border border-white/5 rounded-[22px] hover:border-accent/40 transition-all group relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1.5 h-full bg-white/5 group-hover:bg-accent shadow-[0_0_15px_rgba(252,163,17,0.4)] transition-all" />
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getTypeStyle(event.type)}`}>
                      {event.type}
                    </span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingEvent(event); setFormTitle(event.title); setFormTime(event.time); setFormType(event.type); setFormLocation(event.location); }} className="p-2 rounded-xl border border-white/5 text-muted/40 hover:text-white transition-all" title="Edit"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(event)} className="p-2 rounded-xl border border-white/5 text-muted/40 hover:text-rose-500 transition-all" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-white mb-4 leading-tight group-hover:text-accent transition-colors uppercase tracking-wide">{event.title}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-black text-muted/40 uppercase tracking-widest">
                      <Clock size={14} className="text-accent/40" /> {event.time}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-muted/40 uppercase tracking-widest">
                      <MapPin size={14} className="text-accent/40" /> {event.location}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FloatingModal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Deployment Log">
        {renderEventForm(handleAddEvent, () => { setShowAddModal(false); resetForm(); }, "Commit Log")}
      </FloatingModal>

      <FloatingModal isOpen={!!editingEvent} onClose={() => { setEditingEvent(null); resetForm(); }} title="Entry Synchronization">
        {renderEventForm(handleEditEvent, () => { setEditingEvent(null); resetForm(); }, "Sync Changes")}
      </FloatingModal>

      <FloatingModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Entry Purge">
        <div className="text-center space-y-8 p-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
            <Trash2 size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-white mb-2 uppercase tracking-widest">Confirm Deletion</p>
            <p className="text-[11px] text-muted/40 leading-relaxed uppercase tracking-widest">Permanently remove registry log <br/><strong className="text-white">"{deleteConfirm?.title}"</strong>?</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => deleteConfirm && handleDeleteEvent(deleteConfirm)} className="px-10 py-3.5 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/10">PURGE</button>
            <button onClick={() => setDeleteConfirm(null)} className="px-10 py-3.5 rounded-2xl border border-white/10 text-muted/60 hover:text-white hover:bg-white/5 text-[11px] font-black uppercase tracking-widest transition-all">ABORT</button>
          </div>
        </div>
      </FloatingModal>
    </div>
  );
};

export default CalendarIntegration;
