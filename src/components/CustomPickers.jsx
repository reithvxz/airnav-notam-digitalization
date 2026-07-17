import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ── Custom Date Picker ────────────────────────────────────────────────────────
export function CustomDatePicker({ value, onChange, label, minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const ref = useRef();
  
  useClickOutside(ref, () => setIsOpen(false));

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const handlePrevMonth = (e) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = (e) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelect = (day) => {
    const yyyy = viewDate.getFullYear();
    const mm = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: isOpen ? 50 : 1 }}>
      {label && <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: `1.5px solid ${isOpen ? '#2563eb' : '#e2e8f0'}`, borderRadius: 10, padding: '0.55rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <Calendar size={16} color={isOpen ? '#2563eb' : '#64748b'} />
        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', flex: 1 }}>
          {value ? value.split('-').reverse().join('/') : 'Pilih Tanggal'}
        </span>
        <ChevronDown size={16} color="#94a3b8" />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'white', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '1rem', zIndex: 50, width: 260 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button type="button" onClick={handlePrevMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer' }}><ChevronLeft size={16} /></button>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button type="button" onClick={handleNextMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer' }}><ChevronRight size={16} /></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 8 }}>
            {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
              <div key={d} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{d}</div>
            ))}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = value && parseInt(value.split('-')[2]) === day && parseInt(value.split('-')[1]) === viewDate.getMonth() + 1 && parseInt(value.split('-')[0]) === viewDate.getFullYear();
              const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
              currentDate.setHours(0,0,0,0);
              
              let isDisabled = false;
              if (minDate) {
                const min = new Date(minDate);
                min.setHours(0,0,0,0);
                if (currentDate < min) isDisabled = true;
              }

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(day)}
                  style={{
                    background: isSelected ? '#2563eb' : 'transparent',
                    color: isDisabled ? '#cbd5e1' : (isSelected ? 'white' : '#1e293b'),
                    border: 'none', borderRadius: 6, padding: '6px 0',
                    fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Time Picker ────────────────────────────────────────────────────────
export function CustomTimePicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useClickOutside(ref, () => setIsOpen(false));

  const timeOnly = value ? value.replace(' UTC', '').replace('.', ':') : '00:00';
  const [h, m] = timeOnly.split(':');

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: isOpen ? 50 : 1 }}>
      {label && <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: `1.5px solid ${isOpen ? '#2563eb' : '#e2e8f0'}`, borderRadius: 10, padding: '0.45rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <Clock size={15} color={isOpen ? '#2563eb' : '#64748b'} />
        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', flex: 1 }}>{value || 'Pilih Waktu'}</span>
        <ChevronDown size={16} color="#94a3b8" />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'white', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '1rem', zIndex: 50, display: 'flex', gap: '1rem', width: 220 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'center', marginBottom: 8 }}>JAM</div>
            <div style={{ height: 180, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              {hours.map(hour => (
                <div
                  key={hour}
                  onClick={() => onChange(`${hour}.${m || '00'} UTC`)}
                  style={{ padding: '6px 12px', textAlign: 'center', cursor: 'pointer', background: hour === h ? '#eff6ff' : 'white', color: hour === h ? '#2563eb' : '#1e293b', fontWeight: hour === h ? 700 : 500 }}
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'center', marginBottom: 8 }}>MENIT</div>
            <div style={{ height: 180, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              {minutes.map(min => (
                <div
                  key={min}
                  onClick={() => { onChange(`${h || '00'}.${min} UTC`); setIsOpen(false); }}
                  style={{ padding: '6px 12px', textAlign: 'center', cursor: 'pointer', background: min === m ? '#eff6ff' : 'white', color: min === m ? '#2563eb' : '#1e293b', fontWeight: min === m ? 700 : 500 }}
                >
                  {min}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Select ─────────────────────────────────────────────────────────────
export function CustomSelect({ value, onChange, options, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: isOpen ? 50 : 1 }}>
      {label && <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: `1.5px solid ${isOpen ? '#2563eb' : '#e2e8f0'}`, borderRadius: 8, padding: '0.5rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        <span style={{ fontWeight: 600, color: selectedOption ? '#1e293b' : '#94a3b8', fontSize: '0.9rem', flex: 1 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} color="#94a3b8" />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: 8, background: 'white', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '0.5rem', zIndex: 50, maxHeight: 250, overflowY: 'auto' }}>
          {options.length === 0 ? (
            <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Tidak ada pilihan</div>
          ) : options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer', background: value === opt.value ? '#eff6ff' : 'transparent' }}
            >
              {value === opt.value && <Check size={14} color="#2563eb" />}
              <span style={{ fontWeight: value === opt.value ? 700 : 500, color: value === opt.value ? '#2563eb' : '#1e293b', fontSize: '0.85rem' }}>
                {opt.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
