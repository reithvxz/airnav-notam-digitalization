import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, LogOut, FilePlus } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = user.role === 'admin' 
    ? [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/create-notam', label: 'Buat NOTAM', icon: <FilePlus size={20} /> },
      ]
    : [
        { path: '/employee/dashboard', label: 'Daftar NOTAM', icon: <FileText size={20} /> },
      ];

  return (
    <div className="app-container">
      <header className="topbar">
        <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.png" 
            alt="AirNav Logo" 
            style={{ width: '40px', height: '40px', objectFit: 'contain' }} 
          />
          <span style={{ letterSpacing: '-0.5px' }}>AirNav <span style={{ color: '#64748b', fontWeight: 500 }}>NOTAM System</span></span>
        </div>

        <nav className="topbar-nav" style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'center', padding: '0 2rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{user.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{user.jabatan}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ color: 'var(--danger)', padding: '0.4rem 0.8rem' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
