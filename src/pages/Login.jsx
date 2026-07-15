import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, User, Lock, ArrowRight } from 'lucide-react';
import { users } from '../mockDb';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      login(user);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } else {
      setError('Username atau password salah');
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

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          <p>Demo Akun:</p>
          <p style={{ marginTop: '0.25rem' }}>Admin: <strong>admin / admin123</strong> | Karyawan: <strong>karyawan / karyawan123</strong></p>
        </div>
      </div>
    </div>
  );
}
