import { useState, useEffect } from 'react';
import { UserPlus, Image as ImageIcon, Lock, User, Briefcase, CheckCircle, Users, Trash2, Power, PowerOff, AlertTriangle } from 'lucide-react';

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
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionTarget, setActionTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users?all=true');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleActionClick = (id, initial, type) => {
    setActionTarget({ id, initial, type });
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    const { id, type } = actionTarget;
    
    let url = `http://localhost:3000/api/users/${id}`;
    let method = 'DELETE';
    if (type === 'deactivate') {
      url = `${url}/deactivate`;
      method = 'PUT';
    } else if (type === 'activate') {
      url = `${url}/activate`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, { method });
      const data = await res.json();
      if (data.success) {
        if (type === 'delete') {
          setUsers(users.filter(u => u.id !== id));
        } else {
          setUsers(users.map(u => u.id === id ? { ...u, isActive: type === 'activate' } : u));
        }
        setActionTarget(null);
      } else {
        alert(data.message || 'Gagal memproses aksi pada akun');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

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
        fetchUsers();
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

        <div className="card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <Users color="var(--primary)" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Daftar Karyawan</h2>
          </div>
          
          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Memuat daftar karyawan...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>INITIAL</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>NAMA</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#475569' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: '#475569' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => !['DY', 'IB', 'YD', 'AY', 'IW', 'EMPLOYEE'].includes(u.initial.toUpperCase())).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: u.isActive === false ? '#fef2f2' : 'transparent' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{u.initial}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{u.nama}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {u.isActive === false ? (
                          <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Nonaktif</span>
                        ) : (
                          <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Aktif</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {u.isActive !== false ? (
                            <button 
                              onClick={() => handleActionClick(u.id, u.initial, 'deactivate')}
                              title="Nonaktifkan"
                              style={{ background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500 }}
                            >
                              <PowerOff size={14} /> Nonaktifkan
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActionClick(u.id, u.initial, 'activate')}
                              title="Aktifkan"
                              style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500 }}
                            >
                              <Power size={14} /> Aktifkan
                            </button>
                          )}
                          <button 
                            onClick={() => handleActionClick(u.id, u.initial, 'delete')}
                            title="Hapus Permanen"
                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500 }}
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => !['DY', 'IB', 'YD', 'AY', 'IW', 'EMPLOYEE'].includes(u.initial.toUpperCase())).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Belum ada data karyawan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionTarget && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '1rem', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.5)',
            textAlign: 'center', animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%', 
              background: actionTarget.type === 'activate' ? '#d1fae5' : actionTarget.type === 'deactivate' ? '#fef3c7' : '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              color: actionTarget.type === 'activate' ? '#10b981' : actionTarget.type === 'deactivate' ? '#f59e0b' : '#ef4444'
            }}>
              {actionTarget.type === 'delete' ? <AlertTriangle size={24} /> : actionTarget.type === 'activate' ? <Power size={24} /> : <PowerOff size={24} />}
            </div>
            
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>
              {actionTarget.type === 'delete' ? 'Hapus Permanen?' : actionTarget.type === 'activate' ? 'Aktifkan Akun?' : 'Nonaktifkan Akun?'}
            </h3>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {actionTarget.type === 'delete' ? (
                <>Anda yakin ingin menghapus akun <strong>{actionTarget.initial}</strong> secara permanen? Jika akun ini pernah membuat form, penghapusan akan ditolak.</>
              ) : actionTarget.type === 'activate' ? (
                <>Anda yakin ingin mengaktifkan akun <strong>{actionTarget.initial}</strong>? Akun ini akan dapat login kembali.</>
              ) : (
                <>Anda yakin ingin menonaktifkan akun <strong>{actionTarget.initial}</strong>? Akun ini tidak akan dapat login lagi.</>
              )}
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setActionTarget(null)}
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', flex: 1
                }}
              >
                Batal
              </button>
              <button 
                onClick={confirmAction}
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none',
                  background: actionTarget.type === 'activate' ? '#10b981' : actionTarget.type === 'deactivate' ? '#f59e0b' : '#ef4444', 
                  color: 'white', fontWeight: 600, cursor: 'pointer', flex: 1,
                  boxShadow: actionTarget.type === 'activate' ? '0 4px 6px -1px rgba(16, 185, 129, 0.2)' : actionTarget.type === 'deactivate' ? '0 4px 6px -1px rgba(245, 158, 11, 0.2)' : '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                }}
              >
                {actionTarget.type === 'delete' ? 'Ya, Hapus' : actionTarget.type === 'activate' ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
