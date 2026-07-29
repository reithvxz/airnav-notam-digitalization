import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Plus, Trash2, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { CustomDatePicker, CustomTimePicker, CustomSelect } from '../components/CustomPickers';
import PredutyTemplate from '../components/PredutyTemplate';
import generatePdf from '../utils/pdfGenerator';

const SHIFTS = ['PAGI', 'SIANG', 'MALAM'];

function ImageUpload({ label, value, onChange }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const max_size = 1200;
          if (w > h && w > max_size) {
            h *= max_size / w;
            w = max_size;
          } else if (h > max_size) {
            w *= max_size / h;
            h = max_size;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          onChange(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.5rem' }}>
        {label}
      </label>
      <div style={{
        border: '2px dashed #cbd5e1', borderRadius: 12, padding: '1rem',
        background: value ? '#f8fafc' : 'white', textAlign: 'center', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
      }}>
        {value ? (
          <>
            <img src={value} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.4rem 1rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Hapus Gambar
            </button>
          </>
        ) : (
          <>
            <ImageIcon size={32} color="#94a3b8" />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Klik untuk memilih atau seret gambar ke sini</span>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }} />
          </>
        )}
      </div>
    </div>
  );
}

export default function CreatePreduty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const now = new Date();
  const initTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const [time, setTime] = useState(initTime);
  const [shift, setShift] = useState('PAGI');
  
  const [personelImage, setPersonelImage] = useState(null);
  
  const [fasilitas, setFasilitas] = useState([
    { subject: 'COMMUNICATION', status: 'NORMAL', remarks: '' },
    { subject: 'NAVIGATION', status: 'NORMAL', remarks: '' },
    { subject: 'AUTOMATION', status: 'NORMAL', remarks: '' },
    { subject: 'SUPPORT', status: 'NORMAL', remarks: '' }
  ]);
  
  const [notamText, setNotamText] = useState('');
  const [trafficImage, setTrafficImage] = useState(null);
  const [weatherImage, setWeatherImage] = useState(null);
  
  const [others, setOthers] = useState([]);
  
  const [reminderText, setReminderText] = useState('');
  const [instructionText, setInstructionText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const pdfRef = useRef();

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    const now = new Date();
    setTime(String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'));
    setShift('PAGI');
    setPersonelImage(null);
    setFasilitas([
      { subject: 'COMMUNICATION', status: 'NORMAL', remarks: '' },
      { subject: 'NAVIGATION', status: 'NORMAL', remarks: '' },
      { subject: 'AUTOMATION', status: 'NORMAL', remarks: '' },
      { subject: 'SUPPORT', status: 'NORMAL', remarks: '' }
    ]);
    setNotamText('');
    setTrafficImage(null);
    setWeatherImage(null);
    setOthers([]);
    setReminderText('');
    setInstructionText('');
  };

  const updateFasilitas = (idx, field, val) => {
    const newFas = [...fasilitas];
    newFas[idx][field] = val;
    setFasilitas(newFas);
  };

  const addOther = () => setOthers([...others, { title: '', image: null }]);
  const removeOther = (idx) => {
    const newOthers = [...others];
    newOthers.splice(idx, 1);
    setOthers(newOthers);
  };
  const updateOther = (idx, field, val) => {
    const newOthers = [...others];
    newOthers[idx][field] = val;
    setOthers(newOthers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg('');

    // Validation
    if (!personelImage || !notamText || !trafficImage || !weatherImage || !reminderText || !instructionText) {
      setError('Mohon lengkapi semua kolom dan unggah semua gambar yang wajib sebelum menyimpan!');
      setLoading(false);
      return;
    }
    for (let oth of others) {
      if (!oth.title || !oth.image) {
        setError('Semua item tambahan (Others) wajib diisi judul dan gambarnya!');
        setLoading(false);
        return;
      }
    }

    const payload = {
      id: `PDT-${Date.now()}`,
      date,
      time,
      managerOnDuty: user.initial,
      managerOnDutyInfo: { nama: user?.nama, jabatan: user?.jabatan, ttd: user?.tanda_tangan },
      shift,
      personelImage,
      fasilitasData: fasilitas,
      notamText,
      trafficImage,
      weatherImage,
      othersData: others,
      reminderText,
      instructionText,
      createdBy: user.id
    };

    try {
      // Generate PDF
      if (pdfRef.current) {
        await generatePdf(pdfRef.current, `Preduty_${shift}_${date}.pdf`);
      }

      const res = await fetch('http://localhost:3000/api/preduties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan');
      
      setSuccessMsg('Form Preduty berhasil disimpan dan PDF berhasil diunduh! Mengalihkan...');
      setTimeout(() => {
        navigate('/admin/predutys');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '3rem' }}>
      
      <div style={{ display: 'none' }}>
        <PredutyTemplate ref={pdfRef} preduty={{
          date, shift,
          managerOnDutyInfo: { nama: user?.nama, jabatan: user?.jabatan },
          personelImage, fasilitasData: fasilitas, notamText, trafficImage, weatherImage,
          othersData: others, reminderText, instructionText
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckSquare size={24} color="#2563eb" />
              Form Preduty Briefing
            </h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Pembuatan laporan awal tugas (Preduty)</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }}>
        {/* Info */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>1. Informasi Dinas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ pointerEvents: 'none', opacity: 0.7 }}>
              <CustomDatePicker label="Tanggal" value={date} onChange={() => {}} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', color: '#475569', marginBottom: '0.4rem' }}>SHIFT</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {SHIFTS.map(s => (
                  <button key={s} type="button" onClick={() => setShift(s)} style={{ flex: 1, padding: '0.55rem', border: `1.5px solid ${shift === s ? '#2563eb' : '#e2e8f0'}`, borderRadius: 10, fontWeight: 700, fontSize: '0.82rem', background: shift === s ? '#eff6ff' : '#f8fafc', color: shift === s ? '#2563eb' : '#64748b', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Personel */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>2. Kesiapan Personel</h2>
          <ImageUpload label="Upload Gambar Kesiapan Personel" value={personelImage} onChange={setPersonelImage} />
        </div>

        {/* Fasilitas */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>3. Status Fasilitas</h2>
          {fasilitas.map((f, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: '0.75rem' }}>
              <div style={{ width: 150, fontWeight: 700, color: '#334155' }}>{f.subject}</div>
              <div style={{ width: 220 }}>
                <CustomSelect 
                  value={f.status}
                  onChange={val => updateFasilitas(idx, 'status', val)}
                  options={[
                    { value: 'NORMAL', label: 'NORMAL' },
                    { value: 'UNSERVICEABLE', label: 'UNSERVICEABLE' },
                    { value: 'DEGRADED', label: 'DEGRADED' }
                  ]}
                />
              </div>
              <input type="text" placeholder="Keterangan / Remarks (Opsional)" value={f.remarks} onChange={e => updateFasilitas(idx, 'remarks', e.target.value)} style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }} />
            </div>
          ))}
        </div>

        {/* NOTAM */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>4. NOTAM Summary</h2>
          <textarea rows={4} placeholder="Ketik ringkasan NOTAM di sini..." value={notamText} onChange={e => setNotamText(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
        </div>

        {/* Traffic & Cuaca */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>5. Prediksi Traffic & Cuaca</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <ImageUpload label="Upload Gambar Traffic" value={trafficImage} onChange={setTrafficImage} />
            <ImageUpload label="Upload Gambar Cuaca" value={weatherImage} onChange={setWeatherImage} />
          </div>
        </div>

        {/* Others */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>6. Item Tambahan (Others)</h2>
          {others.map((oth, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px dashed #cbd5e1', marginBottom: '1rem', position: 'relative' }}>
              <button type="button" onClick={() => removeOther(idx)} style={{ position: 'absolute', top: 10, right: 10, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer' }}><Trash2 size={16}/></button>
              <input type="text" placeholder="Judul / Subjek Tambahan" value={oth.title} onChange={e => updateOther(idx, 'title', e.target.value)} style={{ width: '80%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #cbd5e1', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }} />
              <ImageUpload label="Upload Gambar" value={oth.image} onChange={val => updateOther(idx, 'image', val)} />
            </div>
          ))}
          <button type="button" onClick={addOther} style={{ width: '100%', padding: '0.6rem', border: '1.5px dashed #3b82f6', background: '#eff6ff', color: '#2563eb', fontWeight: 700, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Plus size={18}/> Tambah Item Others</button>
        </div>

        {/* Reminder & Instruksi */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>7. Reminder & Instruksi</h2>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}>Reminder / Catatan Penting</label>
          <textarea rows={3} value={reminderText} onChange={e => setReminderText(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: '1rem', fontSize: '0.9rem', fontFamily: 'inherit' }} />
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}>Instruksi Direktur Operasi</label>
          <textarea rows={3} value={instructionText} onChange={e => setInstructionText(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }} />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            {error && <div style={{ color: '#ef4444', fontWeight: 600, background: '#fef2f2', padding: '0.8rem', borderRadius: 8, border: '1px solid #fecaca' }}>⚠️ {error}</div>}
            {successMsg && <div style={{ color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '0.8rem', borderRadius: 8, border: '1px solid #bbf7d0' }}>✅ {successMsg}</div>}
          </div>
          <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 10, padding: '0.8rem 2rem', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', minWidth: 280, justifyContent: 'center' }}>
            <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Preduty Briefing'}
          </button>
        </div>

      </form>
    </div>
  );
}
