import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotams } from '../context/NotamContext';
import { FileText, Map, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import generatePdf from '../utils/pdfGenerator';
import PdfTemplate from '../components/PdfTemplate';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export default function CreateNotam() {
  const { user } = useAuth();
  const { notams, addNotam, updateNotam, deleteNotam } = useNotams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    jenisNotam: 'NOTAM New',
    lokasi: '',
    waktuMulai: '',
    waktuSelesai: '',
    jadwalSpesifik: '',
    deskripsi: '',
    dokumenPendukung: '',
    namaKegiatan: '',
    reffLetter: '',
    altitude: '',
    mapImage: null,
    operationalEffect: '',
    mitigation: '',
    procedureCapacity: '',
    mitigasiOperasional: '',
    conclusion: ''
  });

  const [selectedExistingNotamId, setSelectedExistingNotamId] = useState('');
  const [includeOpAssessment, setIncludeOpAssessment] = useState(false);
  const [docMode, setDocMode] = useState('notam'); // 'notam' or 'assessment'
  const [pdfFormNo, setPdfFormNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const printRef = useRef();

  // Compute minimum date (current UTC time)
  const currentUtcStr = new Date().toISOString().slice(0, 16);

  // Filter existing NOTAMs for Replace/Cancel
  const availableNotams = useMemo(() => {
    const now = new Date();
    
    // Find all formNos that have been cancelled
    const cancelledFormNos = notams
      .filter(n => (n.formData?.jenisNotam === 'NOTAM Cancel' || n.jenis === 'NOTAM Cancel') && n.formData?.targetFormNo)
      .map(n => n.formData.targetFormNo);

    return notams.filter(n => {
      // Must be created by this user
      if (n.createdBy != user.id && n.creator !== user.initial) return false;

      const formData = n.formData || {};
      const jenisNotam = formData.jenisNotam || n.jenis || '';
      
      // Cancel NOTAMs cannot be replaced/cancelled again
      if (jenisNotam === 'NOTAM Cancel') return false;

      // Already cancelled NOTAMs cannot be chosen
      if (cancelledFormNos.includes(n.formNo)) return false;

      // Must be Active or Incoming (waktuSelesai has not passed)
      const waktuSelesai = formData.waktuSelesai || n.waktuSelesai || n.createdAt;
      const endTime = new Date(waktuSelesai);
      if (endTime < now) return false;

      return true;
    });
  }, [notams, user.id, user.initial]);

  // Handle existing NOTAM selection for Replace/Cancel
  const handleExistingNotamChange = (e) => {
    const id = e.target.value;
    setSelectedExistingNotamId(id);
    
    if (id) {
      const existing = notams.find(n => n.id === id);
      if (existing) {
        setFormData({
          ...existing.formData,
          jenisNotam: formData.jenisNotam // keep the current action type
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, mapImage: imageUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const today = new Date();
    const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][today.getMonth()];
    const currentYear = today.getFullYear();
    
    const notamsThisMonth = notams.filter(n => {
      const d = new Date(n.createdAt);
      return d.getMonth() === today.getMonth() && d.getFullYear() === currentYear;
    });

    const nextNumber = notamsThisMonth.length + 1;
    const formNo = `${nextNumber.toString().padStart(2, '0')}/${monthRoman}/${currentYear}`;

    // Get targetFormNo if Replace or Cancel
    let targetFormNo = '';
    if ((formData.jenisNotam === 'NOTAM Replace' || formData.jenisNotam === 'NOTAM Cancel') && selectedExistingNotamId) {
      targetFormNo = notams.find(n => n.id === selectedExistingNotamId)?.formNo || '';
    }

    const finalFormData = {
      ...formData,
      jenisNotam: docMode === 'assessment' ? 'Assessment Only' : formData.jenisNotam,
      includeOpAssessment: docMode === 'assessment' ? true : (formData.jenisNotam === 'NOTAM New' ? includeOpAssessment : false),
      targetFormNo,
      creatorInitial: user.initial,
      creatorName: user.nama,
      creatorJabatan: user.jabatan,
      creatorSignature: user.tanda_tangan
    };

    const newNotam = {
      id: uuidv4(),
      formNo,
      jenis: docMode === 'assessment' ? 'Assessment Only' : formData.jenisNotam,
      lokasi: formData.lokasi || 'N/A',
      waktuMulai: formData.waktuMulai || new Date().toISOString(),
      waktuSelesai: formData.waktuSelesai || new Date().toISOString(),
      createdBy: user.id,
      formData: finalFormData
    };

    // Update state to render the correct formNo in the hidden template
    setPdfFormNo(formNo);

    // Wait for React to render the hidden template with the correct formNo
    setTimeout(async () => {
      try {
        // Generate PDF first before mutating context
        const pdfFilename = `NOTAM_${formData.jenisNotam.replace(' ', '_')}_${formNo.replace(/\//g, '_')}.pdf`;
        
        // Add a safety timeout to prevent infinite hangs
        const pdfPromise = generatePdf(printRef.current, pdfFilename);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('PDF generation timed out')), 8000));
        
        await Promise.race([pdfPromise, timeoutPromise]);
      } catch (err) {
        console.error("PDF Generation failed or timed out:", err);
      }
      
      // Then save data and redirect (will execute even if PDF fails)
      addNotam(newNotam);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        navigate('/admin/dashboard');
      }, 2000);
    }, 100);
  };

  const renderForm1 = () => (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <FileText size={24} color="var(--primary)" />
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Form Permohonan Penerbitan NOTAM</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label className="label">Jenis NOTAM</label>
          <select 
            name="jenisNotam" 
            value={formData.jenisNotam} 
            onChange={(e) => {
              handleInputChange(e);
              setSelectedExistingNotamId('');
            }} 
            className="input-field"
          >
            <option value="NOTAM New">NOTAM New</option>
            <option value="NOTAM Replace">NOTAM Replace</option>
            <option value="NOTAM Cancel">NOTAM Cancel</option>
          </select>
        </div>
        
        {(formData.jenisNotam === 'NOTAM Replace' || formData.jenisNotam === 'NOTAM Cancel') && (
          <div className="form-group">
            <label className="label">Pilih NOTAM yang ingin di-{formData.jenisNotam === 'NOTAM Replace' ? 'replace' : 'cancel'}</label>
            <select 
              value={selectedExistingNotamId}
              onChange={handleExistingNotamChange}
              className="input-field"
              required
            >
              <option value="">-- Pilih NOTAM --</option>
              {availableNotams.map(n => (
                <option key={n.id} value={n.id}>{n.formNo} - {n.formData?.lokasi || ''}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hide form inputs if Cancel is selected */}
      {formData.jenisNotam !== 'NOTAM Cancel' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label">Lokasi</label>
              <input type="text" name="lokasi" value={formData.lokasi} onChange={handleInputChange} className="input-field" placeholder="e.g. WAR1, WAR11" required />
            </div>

            <div className="form-group">
              <label className="label">Jadwal Spesifik (jika ada)</label>
              <input type="text" name="jadwalSpesifik" value={formData.jadwalSpesifik} onChange={handleInputChange} className="input-field" placeholder="e.g. 02.30 - 06.30 UTC" />
            </div>

            <div className="form-group">
              <label className="label">Waktu Mulai Pelaksanaan (UTC)</label>
              <input 
                type="datetime-local" 
                name="waktuMulai" 
                value={formData.waktuMulai} 
                onChange={handleInputChange} 
                className="input-field" 
                min={currentUtcStr}
                required 
              />
            </div>

            <div className="form-group">
              <label className="label">Waktu Selesai Pelaksanaan (UTC)</label>
              <input 
                type="datetime-local" 
                name="waktuSelesai" 
                value={formData.waktuSelesai} 
                onChange={handleInputChange} 
                className="input-field" 
                min={formData.waktuMulai || currentUtcStr}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Deskripsi Informasi NOTAM</label>
            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleInputChange} className="input-field" rows="4" required></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Dokumen Pendukung (jika ada)</label>
            <input type="text" name="dokumenPendukung" value={formData.dokumenPendukung} onChange={handleInputChange} className="input-field" placeholder="e.g. Form No : 044 / VI / 2026" />
          </div>

          {formData.jenisNotam === 'NOTAM New' && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>
                <input 
                  type="checkbox" 
                  checked={includeOpAssessment} 
                  onChange={(e) => setIncludeOpAssessment(e.target.checked)} 
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
                Sertakan Form Operational Assessment
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderForm2 = () => {
    if (docMode !== 'assessment' && (formData.jenisNotam !== 'NOTAM New' || !includeOpAssessment)) return null;

    return (
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <Map size={24} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Operational Assessment</h2>
        </div>

        {docMode === 'assessment' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed #e2e8f0' }}>
            <div className="form-group">
              <label className="label">Lokasi</label>
              <input type="text" name="lokasi" value={formData.lokasi} onChange={handleInputChange} className="input-field" placeholder="e.g. WAR1, WAR11" required />
            </div>
            <div className="form-group">
              <label className="label">Waktu Mulai Pelaksanaan (UTC)</label>
              <input type="datetime-local" name="waktuMulai" value={formData.waktuMulai} onChange={handleInputChange} className="input-field" min={currentUtcStr} required />
            </div>
            <div className="form-group">
              <label className="label">Waktu Selesai Pelaksanaan (UTC)</label>
              <input type="datetime-local" name="waktuSelesai" value={formData.waktuSelesai} onChange={handleInputChange} className="input-field" min={formData.waktuMulai || currentUtcStr} required />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Nama Kegiatan</label>
            <input type="text" name="namaKegiatan" value={formData.namaKegiatan} onChange={handleInputChange} className="input-field" placeholder="e.g. KEGIATAN MILITARY EXERCISE DI WAR11 DAN WAR1" required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="label">Reff. Letter</label>
            <input type="text" name="reffLetter" value={formData.reffLetter} onChange={handleInputChange} className="input-field" placeholder="044 / VI / 2026" required />
          </div>
          
          <div className="form-group">
            <label className="label">Altitude</label>
            <input type="text" name="altitude" value={formData.altitude} onChange={handleInputChange} className="input-field" placeholder="SFC - FL 500" required />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Location Map (Image Upload)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="input-field" required={!formData.mapImage} />
          {formData.mapImage && (
            <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', width: 'fit-content' }}>
              <img src={formData.mapImage} alt="Map Preview" style={{ maxWidth: '100%', maxHeight: '200px', display: 'block' }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="label">Operational Effect & Condition (ATS Sector & Route Effected)</label>
          <textarea name="operationalEffect" value={formData.operationalEffect} onChange={handleInputChange} className="input-field" rows="2" required></textarea>
        </div>

        <div className="form-group">
          <label className="label">Mitigation</label>
          <textarea name="mitigation" value={formData.mitigation} onChange={handleInputChange} className="input-field" rows="3" required></textarea>
        </div>

        <div className="form-group">
          <label className="label">Procedure & Capacity</label>
          <textarea name="procedureCapacity" value={formData.procedureCapacity} onChange={handleInputChange} className="input-field" rows="2" required></textarea>
        </div>

        <div className="form-group">
          <label className="label">Mitigasi Operasional</label>
          <textarea name="mitigasiOperasional" value={formData.mitigasiOperasional} onChange={handleInputChange} className="input-field" rows="3" required></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label">Conclusion</label>
          <textarea name="conclusion" value={formData.conclusion} onChange={handleInputChange} className="input-field" rows="2" required></textarea>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* ── TOP BAR ────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            type="button"
            title="Kembali"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44,
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%',
              cursor: 'pointer', color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.5rem' }}>Buat NOTAM</h1>
            <p className="page-subtitle" style={{ margin: 0, marginTop: '0.25rem' }}>Isi form untuk menerbitkan NOTAM baru, replace, atau cancel.</p>
          </div>
        </div>
      </div>

      {isSuccess && (
        <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <CheckCircle size={20} />
          {formData.jenisNotam === 'NOTAM Cancel' ? 'NOTAM berhasil dibatalkan.' : 'NOTAM berhasil disubmit dan PDF telah digenerate!'}
        </div>
      )}

      <form 
        onSubmit={handleSubmit} 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        {/* Opsi Jenis Dokumen */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Pilih Jenis Dokumen yang Ingin Dibuat</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <input 
                type="radio" 
                value="notam" 
                checked={docMode === 'notam'} 
                onChange={() => setDocMode('notam')} 
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              Permohonan Penerbitan NOTAM
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <input 
                type="radio" 
                value="assessment" 
                checked={docMode === 'assessment'} 
                onChange={() => setDocMode('assessment')} 
                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
              />
              Operational Assessment
            </label>
          </div>
        </div>

        {docMode === 'notam' && renderForm1()}
        {renderForm2()}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/dashboard')}>Batal</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : formData.jenisNotam === 'NOTAM Cancel' ? (
              'Submit Cancel'
            ) : (
              <>
                <Download size={20} />
                Submit & Generate PDF
              </>
            )}
          </button>
        </div>
      </form>

      {/* Hidden print template rendered off-screen to avoid CSS layout interference */}
      <div style={{ position: 'fixed', top: 0, left: '200vw', width: '750px', zIndex: -1000, pointerEvents: 'none' }}>
        <PdfTemplate 
          ref={printRef} 
          formData={{ 
            ...formData, 
            jenisNotam: docMode === 'assessment' ? 'Assessment Only' : formData.jenisNotam,
            includeOpAssessment: docMode === 'assessment' ? true : (formData.jenisNotam === 'NOTAM New' ? includeOpAssessment : false),
            targetFormNo: (formData.jenisNotam === 'NOTAM Replace' || formData.jenisNotam === 'NOTAM Cancel') && selectedExistingNotamId ? notams.find(n => n.id === selectedExistingNotamId)?.formNo : '' 
          }} 
          user={user} 
          formNo={pdfFormNo} 
          docMode={docMode}
        />
      </div>
    </div>
  );
}
