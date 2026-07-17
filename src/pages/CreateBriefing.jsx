import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Plus, Trash2, User, CheckSquare, Check } from 'lucide-react';
import { CustomDatePicker, CustomTimePicker, CustomSelect, useClickOutside } from '../components/CustomPickers';

const CHECKLIST_ITEMS = [
  { no: 1,  subject: 'Personnel Attendance',         details: 'Ensure all ATC and operational personnel are present' },
  { no: 2,  subject: 'Personnel Readiness',          details: 'Ensure all ATC and operational personnel are present and fit for duty.' },
  { no: 3,  subject: 'Traffic',                      details: 'Current and expected traffic volume, sequencing, and flow management.' },
  { no: 4,  subject: 'Weather',                      details: 'Current QAM/METAR/TAF, visibility, wind, and forecast of significant weather.' },
  { no: 5,  subject: 'Facilities',                   details: 'COM/NAV/SUR/ATMAS, lighting, power supply, and system functionality' },
  { no: 6,  subject: 'NOTAM',                        details: 'Review current NOTAMs, and any restrictions.' },
  { no: 7,  subject: 'Coordination',                 details: 'Pending or ongoing coordination with adjacent units or INMC.' },
  { no: 8,  subject: 'Special Operations',           details: 'VIP, military, emergency, or training flight plans.' },
  { no: 9,  subject: 'Special Procedures in Effect', details: 'Contingency plans, reduced separation, or temporary procedures.' },
  { no: 10, subject: 'Personnel Allocation',         details: 'Assignment of positions and rest rotation', defaultText: 'BY SUPERVISOR' },
  { no: 11, subject: 'Focus Session',                details: 'Prayer or meditation, or focus session before duty.' },
  { no: 12, subject: 'Closing Confirmation',         details: 'Ensure all personnel understand briefing content and are ready for duty' },
];

const SHIFTS = ['PAGI', 'SIANG', 'MALAM'];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function formatDateID(dateStr) {
  if (!dateStr) return '';
  const months = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

function initChecklist() {
  return CHECKLIST_ITEMS.map(item => ({
    no: item.no,
    subject: item.subject,
    details: item.details,
    checked: true,
    remarks: item.defaultText || '',
    isTextMode: item.no === 10, // item 10 always text mode
  }));
}

// ── Custom Pickers imported from ../components/CustomPickers ──

// ── Custom Checklist Dropdown ─────────────────────────────────
function ChecklistDropdown({ checked, onChange, isTextMode, onSelectKeterangan }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: 8,
          background: checked ? (isTextMode ? '#f8fafc' : '#f0fdf4') : 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: checked ? (isTextMode ? '#0f172a' : '#16a34a') : '#475569', transition: 'all 0.2s',
          fontWeight: 700, fontSize: isTextMode ? '0.85rem' : '1rem', outline: 'none'
        }}
      >
        {checked ? (isTextMode ? 'BY SUPERVISOR' : <Check size={22} strokeWidth={3} />) : '✎ Keterangan'}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'white', borderRadius: 10, border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={() => { onChange(true); setIsOpen(false); }}
            style={{
              width: '100%', padding: '0.65rem', border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: 700,
              color: isTextMode ? '#0f172a' : '#16a34a', fontSize: '0.85rem', transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {isTextMode ? 'BY SUPERVISOR' : <><Check size={18} strokeWidth={3} /> Centang</>}
          </button>
          <button
            type="button"
            onClick={() => { onChange(false); setIsOpen(false); onSelectKeterangan(); }}
            style={{
              width: '100%', padding: '0.65rem', border: 'none', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.85rem',
              transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ✎ Keterangan
          </button>
        </div>
      )}
    </div>
  );
}

// ── Manager Card ──────────────────────────────────────────────
function ManagerCard({ role, users, selectedInitial, onChange, time, onTimeChange, disabledInitial, accentColor, isLocked }) {
  const selectedUser = users.find(u => u.initial === selectedInitial);
  return (
    <div style={{
      border: `1.5px solid ${accentColor}30`,
      borderRadius: 14,
      background: 'white',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      opacity: isLocked ? 0.6 : 1,
      pointerEvents: isLocked ? 'none' : 'auto',
      filter: isLocked ? 'grayscale(100%)' : 'none',
      transition: 'all 0.3s'
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        padding: '0.85rem 1.1rem',
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <User size={16} color="white" />
        <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{role}</span>
      </div>
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <CustomSelect
            label="Pilih Manager"
            placeholder="-- Pilih Manager --"
            value={selectedInitial}
            onChange={onChange}
            options={users.filter(u => u.role === 'admin' && u.initial !== disabledInitial).map(u => ({ value: u.initial, label: `${u.initial} – ${u.nama}` }))}
          />
        </div>

        {selectedUser && (
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{selectedUser.nama}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{selectedUser.jabatan}</div>
              </div>
              <div style={{
                background: `${accentColor}20`, color: accentColor,
                borderRadius: 8, padding: '3px 10px',
                fontWeight: 700, fontSize: '0.85rem'
              }}>
                {selectedUser.initial}
              </div>
            </div>
            {selectedUser.tanda_tangan && (
              <div style={{ marginTop: '0.6rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Tanda Tangan:</div>
                <img
                  src={`http://localhost:3000/signatures/${selectedUser.tanda_tangan}`}
                  alt="TTD"
                  style={{ maxHeight: 56, maxWidth: 140, objectFit: 'contain', background: 'white', borderRadius: 4, border: '1px solid #e2e8f0', padding: 3 }}
                />
              </div>
            )}
          </div>
        )}

        <CustomTimePicker label="Waktu (UTC)" value={time} onChange={onTimeChange} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function CreateBriefing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [briefingTime, setBriefingTime] = useState('22.00 UTC');
  const [shift, setShift] = useState('SIANG');
  const [checklist, setChecklist] = useState(initChecklist());
  const [extraItems, setExtraItems] = useState([]); // for "Others"
  const [incomingInitial, setIncomingInitial] = useState('');
  const [incomingTime, setIncomingTime] = useState('23.00 UTC');
  const [outgoingInitial, setOutgoingInitial] = useState('');
  const [outgoingTime, setOutgoingTime] = useState('00.00 UTC');

  useEffect(() => {
    fetch('http://localhost:3000/api/users')
      .then(r => r.json())
      .then(data => setUsers(data))
      .catch(() => setError('Gagal memuat data user'));
  }, []);

  // ── Checklist handlers ────────────────────────────
  const setRemarks = (idx, val) => {
    setChecklist(prev => { const u = [...prev]; u[idx] = { ...u[idx], remarks: val }; return u; });
  };

  // ── Extra "Others" items ──────────────────────────
  const addExtraItem = () => {
    setExtraItems(prev => [...prev, { id: Date.now(), subject: '', details: '', checked: true, remarks: '' }]);
  };
  const updateExtra = (id, field, val) => {
    setExtraItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it));
  };
  const removeExtra = (id) => {
    setExtraItems(prev => prev.filter(it => it.id !== id));
  };

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAttemptedSubmit(true);
    if (!incomingInitial) return setError('Incoming Manager harus dipilih');
    if (!outgoingInitial) return setError('Outgoing Manager harus dipilih');
    if (incomingInitial === outgoingInitial) return setError('Incoming dan Outgoing Manager harus berbeda');

    const inUser = users.find(u => u.initial === incomingInitial);
    const outUser = users.find(u => u.initial === outgoingInitial);

    // Validate extra items
    const hasEmptyExtras = extraItems.some(it => !it.subject.trim() || !it.details.trim() || (!it.checked && (!it.remarks || !it.remarks.trim())));
    if (hasEmptyExtras) return;

    // Build final checklist with extras
    const finalChecklist = [
      ...checklist.map(item => ({
        no: item.no,
        subject: item.subject,
        details: item.details,
        checked: item.isTextMode ? null : item.checked,
        remarks: item.isTextMode ? item.remarks : (!item.checked ? item.remarks : ''),
      })),
      ...extraItems.map((it, i) => ({
        no: 13 + i,
        subject: it.subject,
        details: it.details,
        checked: it.checked,
        remarks: !it.checked ? it.remarks : '',
      }))
    ];

    const payload = {
      id: `BRIEF-${Date.now()}`,
      date: formatDateID(date),
      time: briefingTime,
      managerOnDuty: incomingInitial,
      shift,
      checklistData: finalChecklist,
      incomingManager: { initial: inUser?.initial, nama: inUser?.nama, ttd: inUser?.tanda_tangan, time: incomingTime },
      outgoingManager: { initial: outUser?.initial, nama: outUser?.nama, ttd: outUser?.tanda_tangan, time: outgoingTime },
      createdBy: user?.id,
    };

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/briefings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Gagal menyimpan');
      }
    } catch { setError('Terjadi kesalahan server'); }
    finally { setLoading(false); }
  };

  // ── Render ────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* ── TOP BAR ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            title="Kembali"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44,
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%',
              cursor: 'pointer', color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckSquare size={24} color="#2563eb" />
              Form Pre-Shift Briefing
            </h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Checklist & Validasi Kesiapan Operasional ATC</p>
          </div>
        </div>
      </div>

      <form id="briefing-form" onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>

        {/* ── SECTION 1: INFO ─────────────────── */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.85rem' }}>01</span>
            </div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Informasi Briefing</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.25rem' }}>
            {/* Date */}
            <div>
              <CustomDatePicker label="Tanggal" value={date} onChange={setDate} minDate={today} />
              {date && (
                <span style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: 4, display: 'block', fontWeight: 600 }}>
                  📅 {formatDateID(date)}
                </span>
              )}
            </div>
            {/* Time UTC */}
            <CustomTimePicker label="Waktu Briefing (UTC)" value={briefingTime} onChange={setBriefingTime} />
            {/* Shift */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shift</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {SHIFTS.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setShift(s)}
                    style={{
                      flex: 1, padding: '0.55rem', border: `1.5px solid ${shift === s ? '#2563eb' : '#e2e8f0'}`,
                      borderRadius: 10, fontWeight: 700, fontSize: '0.82rem',
                      background: shift === s ? '#eff6ff' : '#f8fafc',
                      color: shift === s ? '#2563eb' : '#64748b',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: CHECKLIST ─────────────── */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.85rem' }}>02</span>
            </div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Checklist</h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 4 }}>
              — semua item default ✓, hapus centang untuk isi keterangan
            </span>
          </div>

          <div style={{ overflow: 'visible' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.8rem 0.5rem', textAlign: 'center', width: 42, fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>NO.</th>
                  <th style={{ padding: '0.8rem 0.5rem', textAlign: 'left', width: 175, fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>SUBJECT</th>
                  <th style={{ padding: '0.8rem 0.5rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>DETAILS</th>
                  <th style={{ padding: '0.8rem 0.5rem', textAlign: 'center', width: 220, fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>CHECKED / REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {checklist.map((item, idx) => (
                  <tr key={item.no} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.7rem 0.5rem', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{item.no}.</td>
                    <td style={{ padding: '0.7rem 0.5rem', fontWeight: 600, color: '#1e293b' }}>{item.subject}</td>
                    <td style={{ padding: '0.7rem 0.5rem', color: '#475569', fontSize: '0.83rem', lineHeight: 1.4 }}>{item.details}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                      {item.isTextMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <ChecklistDropdown
                            checked={item.checked}
                            isTextMode={true}
                            onChange={(val) => {
                              setChecklist(prev => {
                                const u = [...prev];
                                u[idx] = { ...u[idx], checked: val, remarks: val ? 'BY SUPERVISOR' : '' };
                                return u;
                              });
                            }}
                            onSelectKeterangan={() => {}}
                          />
                          {!item.checked && (
                            <input
                              type="text"
                              autoFocus
                              value={item.remarks || ''}
                              onChange={e => setRemarks(idx, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                              onFocus={(e) => { e.target.style.background = 'white'; e.target.style.border = '1px solid #3b82f6'; }}
                              onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.border = '1px solid #cbd5e1'; }}
                              placeholder="Ketik keterangan..."
                              style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'all 0.2s' }}
                            />
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <ChecklistDropdown
                            checked={item.checked}
                            isTextMode={false}
                            onChange={(val) => {
                              setChecklist(prev => {
                                const u = [...prev];
                                u[idx] = { ...u[idx], checked: val, remarks: val ? '' : u[idx].remarks };
                                return u;
                              });
                            }}
                            onSelectKeterangan={() => {}}
                          />
                          {!item.checked && (
                            <input
                              type="text"
                              autoFocus
                              value={item.remarks || ''}
                              onChange={e => setRemarks(idx, e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                              onFocus={(e) => { e.target.style.background = 'white'; e.target.style.border = '1px solid #3b82f6'; }}
                              onBlur={(e) => { e.target.style.background = '#f8fafc'; e.target.style.border = '1px solid #cbd5e1'; }}
                              placeholder="Ketik keterangan..."
                              style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'all 0.2s' }}
                            />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {/* ── Extra "Others" rows ── */}
                {extraItems.map((item, i) => {
                  const errSub = attemptedSubmit && !item.subject.trim();
                  const errDet = attemptedSubmit && !item.details.trim();
                  const errRem = attemptedSubmit && !item.checked && (!item.remarks || !item.remarks.trim());
                  return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: '#fffbeb' }}>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 700, color: '#d97706' }}>+</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <input
                        type="text"
                        value={item.subject}
                        onChange={e => updateExtra(item.id, 'subject', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.border = `1px solid ${errSub ? '#ef4444' : '#fde68a'}`; }}
                        onBlur={(e) => { e.target.style.background = 'transparent'; e.target.style.border = `1px solid ${errSub ? '#ef4444' : 'transparent'}`; }}
                        placeholder={errSub ? "Subject wajib diisi!" : "Subject baru..."}
                        style={{ width: '100%', padding: '0.45rem 0.6rem', border: `1px solid ${errSub ? '#ef4444' : '#fde68a'}`, borderRadius: 8, fontSize: '0.85rem', outline: 'none', background: errSub ? '#fef2f2' : 'white', fontWeight: 600, color: errSub ? '#b91c1c' : '#1e293b', transition: 'all 0.2s' }}
                      />
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <input
                        type="text"
                        value={item.details}
                        onChange={e => updateExtra(item.id, 'details', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.border = `1px solid ${errDet ? '#ef4444' : '#fde68a'}`; }}
                        onBlur={(e) => { e.target.style.background = 'transparent'; e.target.style.border = `1px solid ${errDet ? '#ef4444' : 'transparent'}`; }}
                        placeholder={errDet ? "Details wajib diisi!" : "Keterangan..."}
                        style={{ width: '100%', padding: '0.45rem 0.6rem', border: `1px solid ${errDet ? '#ef4444' : '#fde68a'}`, borderRadius: 8, fontSize: '0.85rem', outline: 'none', background: errDet ? '#fef2f2' : 'white', color: errDet ? '#b91c1c' : '#475569', transition: 'all 0.2s' }}
                      />
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <ChecklistDropdown
                            checked={item.checked}
                            isTextMode={false}
                            onChange={(val) => {
                              updateExtra(item.id, 'checked', val);
                              updateExtra(item.id, 'remarks', val ? '' : item.remarks);
                            }}
                            onSelectKeterangan={() => {}}
                          />
                          {!item.checked && (
                            <input
                              type="text"
                              autoFocus
                              value={item.remarks || ''}
                              onChange={e => updateExtra(item.id, 'remarks', e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
                              onFocus={(e) => { e.target.style.background = 'white'; e.target.style.border = `1px solid ${errRem ? '#ef4444' : '#3b82f6'}`; }}
                              onBlur={(e) => { e.target.style.background = errRem ? '#fef2f2' : '#f8fafc'; e.target.style.border = `1px solid ${errRem ? '#ef4444' : '#cbd5e1'}`; }}
                              placeholder={errRem ? "Wajib diisi!" : "Ketik keterangan..."}
                              style={{ width: '100%', padding: '0.65rem 0.75rem', border: `1px solid ${errRem ? '#ef4444' : '#cbd5e1'}`, borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: errRem ? '#b91c1c' : '#0f172a', outline: 'none', boxSizing: 'border-box', background: errRem ? '#fef2f2' : '#f8fafc', transition: 'all 0.2s' }}
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExtra(item.id)}
                          title="Hapus baris"
                          style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '0.55rem', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addExtraItem}
            style={{
              marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: 6,
              background: '#fffbeb', border: '1.5px dashed #fcd34d',
              borderRadius: 10, padding: '0.55rem 1rem',
              color: '#d97706', fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', width: '100%', justifyContent: 'center',
            }}
          >
            <Plus size={16} /> Tambah Item "Others"
          </button>
        </div>

        {/* ── SECTION 3: SIGNATURES ────────────── */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, color: '#9333ea', fontSize: '0.85rem' }}>03</span>
            </div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>Tanda Tangan Manager</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <ManagerCard
              role="Incoming Manager"
              users={users}
              selectedInitial={incomingInitial}
              onChange={setIncomingInitial}
              time={incomingTime}
              onTimeChange={setIncomingTime}
              disabledInitial={outgoingInitial}
              accentColor="#2563eb"
            />
            <ManagerCard
              role="Outgoing Manager"
              users={users}
              selectedInitial={outgoingInitial}
              onChange={setOutgoingInitial}
              time={outgoingTime}
              onTimeChange={setOutgoingTime}
              disabledInitial={incomingInitial}
              accentColor="#7c3aed"
              isLocked={!incomingInitial}
            />
          </div>
          {incomingInitial && outgoingInitial && incomingInitial === outgoingInitial && (
            <div style={{ marginTop: '0.75rem', background: '#fff1f2', border: '1px solid #fda4af', borderRadius: 8, padding: '0.6rem 1rem', color: '#be123c', fontSize: '0.85rem', fontWeight: 500 }}>
              ⚠️ Incoming dan Outgoing Manager tidak boleh sama
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <div>
            {error && (
              <div style={{ background: '#fff1f2', border: '1.5px solid #fda4af', borderRadius: 10, padding: '0.65rem 1rem', color: '#be123c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                ⚠️ {error}
              </div>
            )}
          </div>
          <button
            form="briefing-form"
            type="submit"
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '0.8rem 2rem', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Briefing'}
          </button>
        </div>

      </form>
    </div>
  );
}
