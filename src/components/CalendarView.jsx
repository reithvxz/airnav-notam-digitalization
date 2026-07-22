import { useState, useEffect, useRef, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Plus, X, Calendar, MapPin, AlignLeft, Link as LinkIcon, Paperclip, Clock, Trash2, ChevronDown, Bell, AlertTriangle } from 'lucide-react';

const CATEGORY_COLORS = {
  Daily: '#3b82f6',       // Biru
  Meeting: '#8b5cf6',     // Ungu
  Operation: '#f97316',   // Oranye
  Maintenance: '#eab308', // Kuning
  Deadline: '#ef4444',    // Merah
  Event: '#10b981',       // Hijau
  Other: '#ec4899'        // Pink vibrant (menggantikan abu-abu)
};

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [listCategoryFilter, setListCategoryFilter] = useState('All');
  const [isHolidayDetailOpen, setIsHolidayDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [formData, setFormData] = useState({
    id: '', title: '', date: '', startTime: '', endTime: '', isAllDay: false,
    category: 'Other', notes: '', location: '', url: '', attachment: ''
  });
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    fetchHolidays();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/events');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('API returned non-array:', data);
        setEvents([]);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchHolidays = async () => {
    try {
      // Fetch public holidays for Indonesia for the current year
      const year = new Date().getFullYear();
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
      if (res.ok) {
        const data = await res.json();
        setHolidays(data.map(h => ({
          id: `holiday-${h.date}`,
          title: h.localName,
          start: h.date,
          allDay: true,
          color: '#ef4444', // Bright red
          extendedProps: { isHoliday: true, name: h.localName }
        })));
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    }
  };

  // Convert our custom events to FullCalendar format
  const calendarEvents = [
    ...(currentView === 'listAll' ? [] : holidays),
    ...events
      .filter(ev => {
        if (currentView === 'listAll' && listCategoryFilter !== 'All') {
          return ev.category === listCategoryFilter;
        }
        return true;
      })
      .map(ev => ({
        id: ev.id,
        title: ev.title,
        start: ev.isAllDay ? ev.date : `${ev.date}T${ev.startTime || '00:00'}:00`,
        end: ev.isAllDay ? ev.date : `${ev.date}T${ev.endTime || '23:59'}:00`,
        allDay: ev.isAllDay,
        backgroundColor: CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.Other,
        borderColor: CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.Other,
        extendedProps: { ...ev }
      }))
  ];

  const handleDateClick = (info) => {
    setFormData({
      id: '', title: '', date: info.dateStr, startTime: '', endTime: '',
      isAllDay: info.allDay, category: 'Other', notes: '', location: '', url: '', attachment: ''
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    if (info.event.extendedProps.isHoliday) {
      setSelectedHoliday(info.event.extendedProps);
      setIsHolidayDetailOpen(true);
      return;
    }
    setSelectedEvent(info.event.extendedProps);
    setIsDetailOpen(true);
  };

  const handleEventDrop = async (info) => {
    const ev = info.event;
    const oldProps = ev.extendedProps;
    if (oldProps.isHoliday) {
      info.revert();
      return;
    }

    const startStr = ev.startStr; // e.g. 2026-07-20 or 2026-07-20T10:00:00+07:00
    const endStr = ev.endStr || startStr;
    const date = startStr.split('T')[0];
    let startTime = oldProps.startTime;
    let endTime = oldProps.endTime;
    
    if (!ev.allDay && startStr.includes('T')) {
      startTime = startStr.split('T')[1].substring(0,5);
      endTime = ev.endStr ? ev.endStr.split('T')[1].substring(0,5) : startTime;
    }

    const payload = { ...oldProps, date, startTime, endTime, isAllDay: ev.allDay };
    
    try {
      const res = await fetch(`http://localhost:3000/api/events/${oldProps.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchEvents();
      else info.revert();
    } catch (err) {
      info.revert();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      id: formData.id || `evt-${Date.now()}`
    };

    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `http://localhost:3000/api/events/${formData.id}` : 'http://localhost:3000/api/events';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchEvents();
        setIsModalOpen(false);
        setIsDetailOpen(false);
      } else {
        alert('Gagal menyimpan agenda');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEvents();
        setIsDetailOpen(false);
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      }
    } catch (err) {
      alert('Gagal menghapus agenda');
    }
  };

  const openEditModal = () => {
    setFormData({ ...selectedEvent });
    setIsDetailOpen(false);
    setIsModalOpen(true);
  };

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const handleSelectMonth = (monthIndex) => {
    if (!calendarRef.current) return;
    const api = calendarRef.current.getApi();
    const newDate = new Date(api.getDate());
    newDate.setMonth(monthIndex);
    api.gotoDate(newDate);
    setIsDatePickerOpen(false);
  };

  const handleSelectYear = (year) => {
    if (!calendarRef.current) return;
    const api = calendarRef.current.getApi();
    const newDate = new Date(api.getDate());
    newDate.setFullYear(year);
    api.gotoDate(newDate);
    setIsDatePickerOpen(false);
  };

  const listVisibleRange = useMemo(() => {
    if (events.length === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { 
        start: today.toISOString().split('T')[0], 
        end: tomorrow.toISOString().split('T')[0] 
      };
    }
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    const start = new Date(sorted[0].date);
    start.setFullYear(start.getFullYear() - 1); // 1 year before first event
    
    const end = new Date(sorted[sorted.length - 1].date);
    end.setFullYear(end.getFullYear() + 2); // 2 years after last event
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [events]);

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(ev => {
      const evDate = new Date(ev.date);
      evDate.setHours(0, 0, 0, 0);
      const diffTime = evDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  return (
    <div className={`card p-4 bg-white rounded-xl shadow-sm ${currentView === 'listAll' ? 'is-list-all-view' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar color="var(--primary)" /> Calendar
        </h2>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setFormData({
              id: '', title: '', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '',
              isAllDay: false, category: 'Other', notes: '', location: '', url: '', attachment: ''
            });
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: currentView === 'listAll' ? '1fr' : '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Side: Calendar Wrapper */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: 'inset 0 0 0 1px #e2e8f0',
          minHeight: '600px',
          position: 'relative'
        }}>
        
        {/* Custom Header Dropdowns */}
        <div style={{
          position: 'absolute',
          top: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '0.5rem',
          pointerEvents: 'none' // Prevent this absolute container from blocking toolbar buttons
        }}>
          {currentView === 'listAll' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', pointerEvents: 'auto', marginTop: '-0.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Semua Event</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  onClick={() => setListCategoryFilter('All')}
                  style={{ 
                    padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', 
                    fontWeight: 600, fontSize: '0.75rem', transition: 'all 0.2s',
                    background: listCategoryFilter === 'All' ? '#0f172a' : '#f1f5f9', 
                    color: listCategoryFilter === 'All' ? 'white' : '#64748b' 
                  }}
                >Semua</button>
                {Object.keys(CATEGORY_COLORS).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setListCategoryFilter(cat)}
                    style={{ 
                      padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', 
                      fontWeight: 600, fontSize: '0.75rem', transition: 'all 0.2s',
                      background: listCategoryFilter === cat ? CATEGORY_COLORS[cat] : '#f1f5f9', 
                      color: listCategoryFilter === cat ? 'white' : '#64748b'
                    }}
                  >{cat}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', pointerEvents: 'auto' }}>
              <button 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                style={{
                  background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  padding: '0.25rem 0.75rem', borderRadius: '12px', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                <ChevronDown size={28} strokeWidth={3} style={{ transform: isDatePickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              
              {isDatePickerOpen && (
                <>
                  {/* Invisible overlay */}
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={() => setIsDatePickerOpen(false)} />
                  
                  {/* Custom Picker Dropdown */}
                  <div style={{
                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginTop: '0.5rem', background: 'white', borderRadius: '16px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0',
                    padding: '1.25rem', zIndex: 50, display: 'flex', gap: '1.5rem',
                    animation: 'modalFadeIn 0.2s ease-out'
                  }}>
                    {/* Months Grid */}
                    <div style={{ width: '240px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pilih Bulan</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {months.map((m, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSelectMonth(i)}
                            style={{
                              padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                              background: currentDate.getMonth() === i ? '#3b82f6' : 'transparent',
                              color: currentDate.getMonth() === i ? 'white' : '#334155'
                            }}
                            onMouseOver={(e) => { if(currentDate.getMonth() !== i) e.target.style.background = '#f1f5f9' }}
                            onMouseOut={(e) => { if(currentDate.getMonth() !== i) e.target.style.background = 'transparent' }}
                          >
                            {m.substring(0,3)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ width: '1px', background: '#e2e8f0' }} />
                    
                    {/* Years List */}
                    <div style={{ width: '90px' }}>
                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tahun</div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                         {Array.from({length: 21}, (_, i) => 2020 + i).map(y => (
                           <button
                             key={y}
                             onClick={() => handleSelectYear(y)}
                             style={{
                               padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                               fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', textAlign: 'center',
                               background: currentDate.getFullYear() === y ? '#3b82f6' : 'transparent',
                               color: currentDate.getFullYear() === y ? 'white' : '#334155'
                             }}
                             onMouseOver={(e) => { if(currentDate.getFullYear() !== y) e.target.style.background = '#f1f5f9' }}
                             onMouseOut={(e) => { if(currentDate.getFullYear() !== y) e.target.style.background = 'transparent' }}
                           >
                             {y}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: '',
            right: 'dayGridMonth,listAll'
          }}
          views={useMemo(() => ({
            listAll: {
              type: 'list',
              visibleRange: listVisibleRange,
              buttonText: 'list'
            }
          }), [listVisibleRange])}
          events={calendarEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
          datesSet={(arg) => {
            if (currentView !== arg.view.type) {
              setCurrentView(arg.view.type);
            }
            if (calendarRef.current) {
              const newDate = calendarRef.current.getApi().getDate();
              if (currentDate.getTime() !== newDate.getTime()) {
                setCurrentDate(newDate);
              }
            }
          }}
          height="auto"
          dayCellClassNames={(arg) => {
            const y = arg.date.getFullYear();
            const m = String(arg.date.getMonth() + 1).padStart(2, '0');
            const d = String(arg.date.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            const isHoliday = holidays.some(h => h.start === dateStr);
            return isHoliday ? ['is-holiday'] : [];
          }}
          eventContent={(arg) => {
            // Let FullCalendar handle list view rendering natively
            if (arg.view.type === 'listAll') {
              return undefined;
            }
            if (arg.event.extendedProps.isHoliday) {
              return (
                <div style={{ 
                  color: 'white', 
                  fontSize: '0.6rem', 
                  fontWeight: 600, 
                  textAlign: 'center',
                  padding: '2px 4px',
                  background: '#dc2626',
                  borderRadius: '4px',
                  width: 'fit-content',
                  margin: '10px auto 0 auto', /* Super tight margin */
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'normal',
                  lineHeight: '1.2'
                }}>
                  {arg.event.title}
                </div>
              );
            }
            return (
              <div style={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '4px 8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: arg.event.backgroundColor,
                background: `${arg.event.backgroundColor}26`, // 15% opacity hex
                borderRadius: '6px',
                width: '100%',
                border: `1px solid ${arg.event.backgroundColor}40`
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: arg.event.backgroundColor, flexShrink: 0 }}></div>
                {arg.event.title}
              </div>
            );
          }}
        />
        </div>

        {/* Right Side: Reminders Panel (Only shown in Month View) */}
        {currentView !== 'listAll' && (
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Bell size={20} color="#ef4444" /> Upcoming Reminders
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingReminders.length === 0 ? (
                <div style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center', padding: '2rem 0', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>Tidak ada agenda dalam 7 hari ke depan.</div>
              ) : (
                upcomingReminders.map(ev => {
                  const evDate = new Date(ev.date);
                  evDate.setHours(0, 0, 0, 0);
                  const diffTime = evDate.getTime() - new Date().setHours(0,0,0,0);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  let label = '';
                  if (diffDays === 0) label = 'Hari Ini!';
                  else if (diffDays === 1) label = 'Besok';
                  else label = `H-${diffDays}`;

                  return (
                    <div key={ev.id} onClick={() => { setSelectedEvent(ev); setIsDetailOpen(true); }} style={{ background: 'white', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.Other}`, cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', lineHeight: '1.4' }}>{ev.title}</div>
                        <div style={{ background: diffDays <= 1 ? '#fee2e2' : '#f1f5f9', color: diffDays <= 1 ? '#dc2626' : '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                          {label}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {new Date(ev.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                {formData.id ? 'Edit Agenda' : 'Tambah Agenda Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              {(() => {
                const holidayOnFormDate = holidays.find(h => h.start === formData.date);
                if (holidayOnFormDate) {
                  return (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '50%' }}>
                        <Calendar size={24} color="#dc2626" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#dc2626', marginBottom: '0.25rem' }}>Peringatan Tanggal Merah</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#991b1b' }}>{holidayOnFormDate.title}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="form-group">
                <label className="label">Judul Agenda <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" required placeholder="Contoh: Rapat Evaluasi Bulanan" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Kategori</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                    {Object.keys(CATEGORY_COLORS).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="label">Tanggal <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="checkbox" id="isAllDay" name="isAllDay" checked={formData.isAllDay} onChange={handleChange} style={{ width: '1rem', height: '1rem' }} />
                <label htmlFor="isAllDay" style={{ cursor: 'pointer', fontWeight: 500, color: '#475569' }}>Sepanjang Hari (All-Day Event)</label>
              </div>

              {!formData.isAllDay && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Waktu Mulai</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Waktu Selesai</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="input-field" />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="label">Lokasi</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="Lokasi kegiatan" style={{ paddingLeft: '36px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="label">URL / Link</label>
                <div style={{ position: 'relative' }}>
                  <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="url" name="url" value={formData.url} onChange={handleChange} className="input-field" placeholder="https://..." style={{ paddingLeft: '36px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Catatan / Deskripsi</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field" rows={3} placeholder="Detail tambahan mengenai agenda ini..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedEvent && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ 
              background: CATEGORY_COLORS[selectedEvent.category] || CATEGORY_COLORS.Other, 
              padding: '2rem 1.5rem', position: 'relative', color: 'white' 
            }}>
              <button onClick={() => setIsDetailOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                <X size={18} />
              </button>
              <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                {selectedEvent.category}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 }}>{selectedEvent.title}</h3>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Clock size={20} color="#64748b" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEvent.date}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                      {selectedEvent.isAllDay ? 'Sepanjang Hari' : `${selectedEvent.startTime || '--:--'} s/d ${selectedEvent.endTime || '--:--'}`}
                    </div>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <MapPin size={20} color="#64748b" style={{ marginTop: '2px' }} />
                    <div style={{ color: '#0f172a' }}>
                      {selectedEvent.location}
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedEvent.location)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', marginTop: '2px' }}>
                        Buka di Maps
                      </a>
                    </div>
                  </div>
                )}

                {selectedEvent.url && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <LinkIcon size={20} color="#64748b" style={{ marginTop: '2px' }} />
                    <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}>
                      {selectedEvent.url}
                    </a>
                  </div>
                )}

                {selectedEvent.notes && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <AlignLeft size={20} color="#64748b" style={{ marginTop: '2px' }} />
                    <div style={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedEvent.notes}
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <Calendar size={20} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>Automatic Reminders Active</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                      Sistem akan mengirimkan notifikasi pada H-7, H-3, H-2, H-1, H-12 Jam, dan H-0.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  onClick={openEditModal}
                  className="btn btn-secondary" 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => {
                    setEventToDelete(selectedEvent.id);
                    setIsDeleteModalOpen(true);
                  }}
                  style={{ 
                    flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', 
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', 
                    borderRadius: '8px', padding: '0.75rem', fontWeight: 600, cursor: 'pointer' 
                  }}
                >
                  <Trash2 size={18} /> Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Detail Modal */}
      {isHolidayDetailOpen && selectedHoliday && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '350px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden', animation: 'modalFadeIn 0.2s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              padding: '2rem 1.5rem 1.5rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <button 
                onClick={() => setIsHolidayDetailOpen(false)} 
                style={{ 
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'rgba(255, 255, 255, 0.2)', border: 'none', 
                  cursor: 'pointer', color: 'white',
                  borderRadius: '50%', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <X size={18} />
              </button>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.75rem',
                borderRadius: '50%',
                marginBottom: '1rem'
              }}>
                <Calendar size={28} color="white" />
              </div>
              <h2 style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: 0, letterSpacing: '1px' }}>
                TANGGAL MERAH
              </h2>
            </div>
            
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                {selectedHoliday.name}
              </div>
              <button 
                onClick={() => setIsHolidayDetailOpen(false)}
                style={{ 
                  width: '100%', padding: '0.75rem', 
                  background: '#f1f5f9', color: '#475569', 
                  border: '1px solid #e2e8f0', borderRadius: '10px', 
                  fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s', fontSize: '0.95rem'
                }}
                onMouseOver={(e) => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#475569'; }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out',
            padding: '2rem', textAlign: 'center'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <AlertTriangle size={32} color="#dc2626" />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Hapus Agenda?</h3>
            <p style={{ margin: '0 0 2rem 0', color: '#64748b', fontSize: '0.95rem' }}>
              Tindakan ini tidak dapat dibatalkan. Agenda ini akan dihapus secara permanen dari sistem.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setEventToDelete(null); }}
                style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
              >Batal</button>
              <button 
                onClick={() => handleDelete(eventToDelete)}
                style={{ flex: 1, padding: '0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                onMouseOut={(e) => e.target.style.background = '#dc2626'}
              >Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
