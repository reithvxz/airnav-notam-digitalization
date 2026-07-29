import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <>
      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff', margin: 0, padding: 0 }}>
        {/* Left Panel - Image Background */}
        <div style={{
          flex: 1,
          position: 'relative',
          backgroundImage: 'url("/login-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          overflow: 'hidden'
        }} className="hide-on-mobile">
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.5) 0%, rgba(30, 58, 138, 0.85) 100%)',
            zIndex: 1
          }}></div>
          
          {/* Top Left Logo */}
          <div style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="AirNav Logo" style={{ width: '45px', height: '45px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.5px' }}>AirNav</span>
          </div>

          <div style={{ position: 'relative', zIndex: 2, color: 'white', maxWidth: '450px' }}>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.05, marginBottom: '1.5rem', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              Welcome<br/>Back!
            </h1>
            <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Sistem Informasi Manajemen Operasi<br/>
              AirNav Cabang Surabaya
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Login</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              Welcome back! Please login to your account.
            </p>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem 1rem',
                borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem',
                textAlign: 'center', border: '1px solid #fee2e2'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>User Name / Initial</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                    border: '1px solid #e2e8f0', outline: 'none', transition: 'border-color 0.2s',
                    fontSize: '0.95rem', color: '#1e293b'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                    border: '1px solid #e2e8f0', outline: 'none', transition: 'border-color 0.2s',
                    fontSize: '0.95rem', color: '#1e293b', letterSpacing: showPassword ? 'normal' : '0.2em'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <div style={{ 
                    width: 18, height: 18, borderRadius: 4, 
                    background: showPassword ? '#8b5cf6' : 'white',
                    border: `1px solid ${showPassword ? '#8b5cf6' : '#cbd5e1'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}>
                    {showPassword && <div style={{ width: 10, height: 10, background: 'white', clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }}></div>}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={showPassword} 
                    onChange={() => setShowPassword(!showPassword)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Show Password</span>
                </label>

                <button 
                  type="button"
                  onClick={() => {
                    if(!username) return setError('Harap isi Initial Pengguna terlebih dahulu');
                    setShowPasswordModal(true);
                    setPwdError('');
                    setPwdSuccess('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                >
                  Ganti Password?
                </button>
              </div>

              <button type="submit" style={{
                width: '100%', padding: '0.875rem', background: '#8b5cf6', color: 'white',
                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.2s',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.background = '#7c3aed'}
              onMouseOut={(e) => e.target.style.background = '#8b5cf6'}
              >
                Login
              </button>
            </form>
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
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', color: '#1e293b' }}>Ganti Password ({username})</h2>
              
              {pwdError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{pwdError}</div>}
              {pwdSuccess && <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{pwdSuccess}</div>}
              
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Password Lama (admin)</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={pwdData.oldPassword}
                    onChange={e => setPwdData({...pwdData, oldPassword: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Password Baru</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={pwdData.newPassword}
                    onChange={e => setPwdData({...pwdData, newPassword: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Konfirmasi Password Baru</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={pwdData.confirmPassword}
                    onChange={e => setPwdData({...pwdData, confirmPassword: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordModal(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b', fontWeight: 500 }}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
