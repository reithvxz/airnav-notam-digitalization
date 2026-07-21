import React, { useState, useEffect } from 'react';
import { Settings, Save, Clock, AlertCircle } from 'lucide-react';
import { CustomTimePicker } from '../components/CustomPickers';

export default function ShiftSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('preshift');

  useEffect(() => {
    fetch('http://localhost:3000/api/settings/shift')
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        setMessage({ text: 'Gagal memuat pengaturan', type: 'error' });
        setLoading(false);
      });
  }, []);

  const handleChange = (type, shift, field, value) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [shift]: { ...prev[type][shift], [field]: value }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('http://localhost:3000/api/settings/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Network error');
      setMessage({ text: 'Pengaturan berhasil disimpan!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Gagal menyimpan pengaturan.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Memuat pengaturan...</div>;

  const shifts = [
    { key: 'PAGI', label: 'Shift Pagi', iconBg: '#eff6ff', iconColor: '#3b82f6', border: '#bfdbfe' },
    { key: 'SIANG', label: 'Shift Siang', iconBg: '#fef3c7', iconColor: '#d97706', border: '#fde68a' },
    { key: 'MALAM', label: 'Shift Malam', iconBg: '#f3f4f6', iconColor: '#475569', border: '#cbd5e1' }
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: 12 }}>
          <Settings size={28} color="#2563eb" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Pengaturan Shift</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>Atur waktu default untuk masing-masing shift operasional.</p>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10,
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: message.type === 'success' ? '#059669' : '#dc2626',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
        }}>
          <AlertCircle size={20} /> {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('preshift')}
          style={{
            padding: '0.75rem 1.5rem', border: 'none', background: 'transparent',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            borderBottom: activeTab === 'preshift' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'preshift' ? '#2563eb' : '#64748b',
            marginBottom: -2, transition: 'all 0.2s',
          }}
        >
          Pre-Shift
        </button>
        <button
          onClick={() => setActiveTab('postshift')}
          style={{
            padding: '0.75rem 1.5rem', border: 'none', background: 'transparent',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            borderBottom: activeTab === 'postshift' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'postshift' ? '#2563eb' : '#64748b',
            marginBottom: -2, transition: 'all 0.2s',
          }}
        >
          Post-Shift
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {shifts.map(s => {
          const shiftData = settings[activeTab]?.[s.key] || { time: '', incoming: '', outgoing: '' };
          return (
            <div key={s.key} style={{ background: 'white', borderRadius: 16, border: `1px solid ${s.border}`, overflow: 'visible', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ background: s.iconBg, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 10, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                <Clock size={20} color={s.iconColor} />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: s.iconColor }}>{s.label}</h2>
              </div>
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <CustomTimePicker
                  label="Waktu Briefing (UTC)"
                  value={shiftData.time}
                  onChange={(val) => handleChange(activeTab, s.key, 'time', val)}
                />
                <CustomTimePicker
                  label="Incoming Manager (UTC)"
                  value={shiftData.incoming}
                  onChange={(val) => handleChange(activeTab, s.key, 'incoming', val)}
                />
                <CustomTimePicker
                  label="Outgoing Manager (UTC)"
                  value={shiftData.outgoing}
                  onChange={(val) => handleChange(activeTab, s.key, 'outgoing', val)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: 10, display: 'flex', gap: 8 }}
        >
          <Save size={20} />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}
