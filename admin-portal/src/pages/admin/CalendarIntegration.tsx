import React, { useState, useMemo } from "react";
import { Calendar, Clock, MapPin, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const mockEvents: Record<string, Array<{id:number; title:string; time:string; type:string; location:string}>> = {
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
  const today = new Date(2026, 2, 10); // March 10, 2026
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  );

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
      default: return 'bg-white/5 text-white/70 border-white/10';
    }
  };

  const selectedEvents = mockEvents[selectedDate] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">Calendar Integration</h1>
          <p className="text-xtext-secondary text-sm">Manage store operations, vendor meetings, and staff schedules.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
          <Plus size={18} />
          New Event
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
              const hasEvents = !!mockEvents[dateKey];
              
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
                  {hasEvents && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-cyan-400'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Schedule Sidebar */}
        <div className="bg-background border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20"><Calendar size={20} /></div>
            <div>
              <h2 className="text-xl font-bold">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </h2>
              <p className="text-sm text-xtext-secondary">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedEvents.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xtext-secondary text-sm py-12 opacity-50">
                No events scheduled for this day
              </div>
            ) : (
              selectedEvents.map(event => (
                <div key={event.id} className="p-4 bg-xcard border border-white/5 rounded-2xl hover:border-white/10 transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-white/10 group-hover:bg-cyan-500/50 transition-colors" />
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getTypeColors(event.type)}`}>
                      {event.type}
                    </span>
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
    </div>
  );
};

export default CalendarIntegration;
