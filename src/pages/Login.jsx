import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } else {
      setError('Initial atau password salah');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return setPwdError('Password baru dan konfirmasi tidak cocok');
    }
    if (pwdData.newPassword.length < 8) {
      return setPwdError('Password baru minimal 8 karakter');
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initial: username,
          oldPassword: pwdData.oldPassword,
          newPassword: pwdData.newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setPwdSuccess('Password berhasil diubah! Silakan login.');
        setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        setPwdError(data.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setPwdError('Terjadi kesalahan server');
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/logo.png" 
            alt="AirNav Logo" 
            style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
          />
        </div>
        
        <h1 className="login-title">AirNav NOTAM System</h1>
        <p className="login-subtitle">Masuk untuk mengelola dokumen NOTAM digital</p>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center',
            border: '1px solid #fee2e2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <User size={18} className="login-input-icon" />
            <input
              type="text"
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-input-group">
            <Lock size={18} className="login-input-icon" />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Masuk ke Sistem
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Bukan pengguna awal?{' '}
            <button 
              type="button"
              onClick={() => {
                if(!username) return setError('Harap isi Initial Pengguna terlebih dahulu');
                setShowPasswordModal(true);
                setPwdError('');
                setPwdSuccess('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Ganti Password
            </button>
          </p>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>Ganti Password ({username})</h2>
            
            {pwdError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{pwdError}</div>}
            {pwdSuccess && <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{pwdSuccess}</div>}
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password Lama (admin)</label>
                <input 
                  type="password" 
                  value={pwdData.oldPassword}
                  onChange={e => setPwdData({...pwdData, oldPassword: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password Baru</label>
                <input 
                  type="password" 
                  value={pwdData.newPassword}
                  onChange={e => setPwdData({...pwdData, newPassword: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  value={pwdData.confirmPassword}
                  onChange={e => setPwdData({...pwdData, confirmPassword: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
