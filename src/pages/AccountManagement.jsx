import { useState } from 'react';
import { UserPlus, Image as ImageIcon, Lock, User, Briefcase, CheckCircle } from 'lucide-react';

export default function AccountManagement() {
  const [formData, setFormData] = useState({
    initial: '',
    nama: '',
    jabatan: '',
    password: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'initial') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 8) {
      return setError('Password minimal 8 karakter');
    }
    if (!file) {
      return setError('Harap unggah gambar tanda tangan');
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('initial', formData.initial);
      data.append('nama', formData.nama);
      data.append('jabatan', formData.jabatan || 'PT MANAGER OPERASI APP-TWR');
      data.append('password', formData.password);
      data.append('tanda_tangan_file', file);

      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (result.success) {
        setSuccess('Karyawan berhasil ditambahkan!');
        setFormData({ initial: '', nama: '', jabatan: '', password: '' });
        setFile(null);
        setPreview('');
      } else {
        setError(result.message || result.error || 'Gagal menambahkan karyawan');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Akun</h1>
          <p className="page-subtitle">Tambah akun Karyawan (PT MANAGER OPERASI APP-TWR) ke dalam sistem.</p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <UserPlus color="var(--primary)" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Tambah Karyawan Baru</h2>
          </div>

          {success && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">
                Initial / Username <span style={{ color: '#ef4444' }}>*</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '8px', fontWeight: 'normal' }}>(Otomatis Kapital)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="initial"
                  value={formData.initial}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Contoh: AB"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Nama Lengkap <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="input-field"
                placeholder="Masukkan nama lengkap karyawan"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Jabatan</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Contoh: PT MANAGER OPERASI APP-TWR"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Minimal 8 karakter"
                  style={{ paddingLeft: '40px' }}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Upload Tanda Tangan <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ 
                border: '2px dashed #cbd5e1', 
                borderRadius: '8px', 
                padding: '1.5rem', 
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  required={!file}
                />
                
                {preview ? (
                  <img src={preview} alt="Preview" style={{ maxHeight: '100px', margin: '0 auto' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <ImageIcon size={32} color="#94a3b8" />
                    <div>
                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Klik untuk upload</span> atau drag and drop
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>PNG, JPG up to 2MB</div>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Tambahkan Karyawan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
