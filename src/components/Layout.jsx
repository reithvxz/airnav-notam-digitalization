import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEventReminders } from '../context/EventReminderContext';
import { useNotams } from '../context/NotamContext';
import { 
  LayoutDashboard, FileText, CheckSquare, 
  LogOut, User, Key, Users, Settings, 
  Bell, Activity, Calendar as CalendarIcon, Clock,
  ChevronRight, ChevronLeft, Menu, ClipboardCheck, FileCheck
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { events } = useEventReminders() || { events: [] };
  const { notams } = useNotams() || { notams: [] };
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdData, setPwdData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Trigger resize event for FullCalendar when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 350); // Slightly longer than CSS transition (0.3s)
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
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
          initial: user.initial,
          oldPassword: pwdData.oldPassword,
          newPassword: pwdData.newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setPwdSuccess('Password berhasil diubah!');
        setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        setPwdError(data.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setPwdError('Terjadi kesalahan server');
    }
  };

  const isSuperAdmin = ['DY', 'IB', 'YD', 'AY', 'IW'].includes(user.initial);

  // Derive Upcoming Notifications from events
  const upcomingEvents = (events || [])
    .filter(ev => new Date(ev.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  // Derive Recent Activities from NOTAMs
  const recentActivities = (notams || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className={`app-container ${!isSidebarOpen ? 'collapsed' : ''}`}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="left-sidebar" style={{ transition: 'width 0.3s ease' }}>
        <div style={{ padding: isSidebarOpen ? '1.25rem 1.5rem' : '1.25rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          {isSidebarOpen ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent' }}>
                <img src="/logo.png" alt="AirNav Logo" style={{ height: '32px', WebkitUserSelect: 'none', userSelect: 'none' }} />
                <span style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '1.25rem', letterSpacing: '-0.5px', backgroundColor: 'transparent', WebkitUserSelect: 'none', userSelect: 'none' }}>AirNav</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Menu size={20} />
              </button>
            </>
          ) : (
            <div 
              style={{ display: 'flex', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
              onClick={() => setIsSidebarOpen(true)}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <img src="/logo.png" alt="AirNav Logo" style={{ height: '28px' }} title="Buka Sidebar" />
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ padding: isSidebarOpen ? '0 1.5rem 2rem' : '0 0.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div style={{ width: isSidebarOpen ? '48px' : '40px', height: isSidebarOpen ? '48px' : '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: isSidebarOpen ? '1.25rem' : '1.1rem', flexShrink: 0 }}>
            {user.initial}
          </div>
          {isSidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || user.nama}
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3, wordBreak: 'break-word' }}>
                {user.jabatan}
              </p>
            </div>
          )}
        </div>

        {/* Dashboards Menu */}
        <div className="sidebar-nav-section" style={{ padding: isSidebarOpen ? '0 1rem' : '0 0.5rem' }}>
          {isSidebarOpen && <div className="sidebar-nav-title">Dashboards</div>}
          <Link to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} className={`sidebar-link ${location.pathname === '/admin/dashboard' || location.pathname === '/employee/dashboard' ? 'active' : ''}`} title={!isSidebarOpen ? 'Overview' : ''} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}>
            <LayoutDashboard size={18} /> {isSidebarOpen && 'Overview'}
          </Link>
          {user.role === 'admin' && (
            <>
              <Link to="/admin/notams" className={`sidebar-link ${location.pathname === '/admin/notams' || location.pathname === '/admin/create-notam' ? 'active' : ''}`} title={!isSidebarOpen ? 'NOTAM' : ''} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}>
                <FileText size={18} /> {isSidebarOpen && 'NOTAM'}
              </Link>
              <Link to="/admin/preshifts" className={`sidebar-link ${location.pathname === '/admin/preshifts' || location.pathname === '/admin/create-briefing' ? 'active' : ''}`} title={!isSidebarOpen ? 'Pre-Shift' : ''} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}>
                <CheckSquare size={18} /> {isSidebarOpen && 'Pre-Shift'}
              </Link>
              <Link to="/admin/postshifts" className={`sidebar-link ${location.pathname === '/admin/postshifts' || location.pathname === '/admin/create-postshift' ? 'active' : ''}`} title={!isSidebarOpen ? 'Post-Shift' : ''} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}>
                <ClipboardCheck size={18} /> {isSidebarOpen && 'Post-Shift'}
              </Link>
              <Link to="/admin/calendar" className={`sidebar-link ${location.pathname === '/admin/calendar' ? 'active' : ''}`} title={!isSidebarOpen ? 'Calendar' : ''} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}>
                <CalendarIcon size={18} /> {isSidebarOpen && 'Calendar'}
              </Link>
            </>
          )}
        </div>

        {/* Settings Menu */}
        <div className="sidebar-nav-section" style={{ marginTop: 'auto', padding: isSidebarOpen ? '0 1rem' : '0 0.5rem' }}>
          {isSidebarOpen && <div className="sidebar-nav-title">Settings</div>}
          <button 
            onClick={() => setShowPasswordModal(true)} 
            className="sidebar-link" 
            title={!isSidebarOpen ? 'Ganti Password' : ''}
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}
          >
            <Key size={18} /> {isSidebarOpen && 'Ganti Password'}
          </button>
          
          {user.role === 'admin' && (
            <>
              <Link to="/admin/settings/shift" className={`sidebar-link ${location.pathname === '/admin/settings/shift' ? 'active' : ''}`} title={!isSidebarOpen ? 'Pengaturan Shift' : ''} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}>
                <Settings size={18} /> {isSidebarOpen && 'Pengaturan Shift'}
              </Link>
              {isSuperAdmin && (
                <Link to="/admin/accounts" className={`sidebar-link ${location.pathname === '/admin/accounts' ? 'active' : ''}`} title={!isSidebarOpen ? 'Manajemen Akun' : ''} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}>
                  <Users size={18} /> {isSidebarOpen && 'Manajemen Akun'}
                </Link>
              )}
            </>
          )}
          
          <button 
            onClick={handleLogout} 
            className="sidebar-link" 
            title={!isSidebarOpen ? 'Keluar' : ''}
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: '#ef4444', justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '0.6rem 1rem' : '0.6rem 0' }}
          >
            <LogOut size={18} /> {isSidebarOpen && 'Keluar'}
          </button>
        </div>
      </aside>

      {/* 2. CENTER CONTENT */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1e3a8a', fontWeight: 800, letterSpacing: '-0.5px' }}>AirNav Indonesia</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Sistem Digitalisasi NOTAM & Manajemen Shift Cabang Surabaya</p>
        </div>
        <div style={{ flex: 1, overflow: 'visible' }}>
          <Outlet />
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <aside className="right-sidebar">
        {/* Upcoming Reminders / Calendar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} /> Upcoming Reminders
            </h4>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>Tidak ada agenda terdekat.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upcomingEvents.map(ev => {
                const diffDays = Math.ceil((new Date(ev.date) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = diffDays <= 1;
                const badgeColor = isUrgent ? '#ef4444' : diffDays <= 3 ? '#f59e0b' : '#3b82f6';
                const badgeBg = isUrgent ? '#fef2f2' : diffDays <= 3 ? '#fffbeb' : '#eff6ff';
                return (
                  <div key={ev.id} 
                    style={{ 
                      display: 'flex', 
                      gap: '0.75rem', 
                      alignItems: 'flex-start', 
                      cursor: 'pointer', 
                      padding: '0.75rem', 
                      borderRadius: '10px', 
                      transition: 'all 0.2s',
                      background: isUrgent ? '#fef2f2' : 'transparent',
                      border: isUrgent ? '1px solid #fecaca' : '1px solid transparent',
                      boxShadow: isUrgent ? '0 4px 6px -1px rgba(239, 68, 68, 0.1), 0 2px 4px -1px rgba(239, 68, 68, 0.06)' : 'none'
                    }}
                    onClick={() => navigate('/admin/calendar', { state: { targetDate: ev.date, targetEvent: ev } })}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isUrgent ? '#fee2e2' : '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isUrgent ? '#fef2f2' : 'transparent';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: badgeBg, color: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarIcon size={14} />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: isUrgent ? '#991b1b' : '#0f172a', lineHeight: 1.3 }}>{ev.title}</h5>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: isUrgent ? '#ef4444' : '#64748b', fontWeight: isUrgent ? 700 : 500, display: 'inline-block', padding: isUrgent ? '2px 8px' : '0', background: isUrgent ? '#fee2e2' : 'transparent', borderRadius: '12px' }}>
                        {diffDays === 0 ? 'Hari ini!' : diffDays === 1 ? 'Besok' : `${diffDays} hari lagi`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Activities */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} /> Aktivitas Terbaru
            </h4>
          </div>
          
          {recentActivities.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>Belum ada aktivitas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: '15px', top: '20px', bottom: '20px', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
              
              {recentActivities.map(act => {
                const formData = act.formData || {};
                const creatorName = formData.creatorName || act.creatorName || act.creator || act.createdBy || '-';
                return (
                <div key={act.id} style={{ display: 'flex', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={14} />
                  </div>
                  <div style={{ paddingTop: '0.25rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{creatorName}</span> membuat NOTAM <span style={{ fontWeight: 600 }}>{act.formNo}</span>
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={10} />
                      {new Date(act.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </aside>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>Ganti Password</h2>
            
            {pwdError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{pwdError}</div>}
            {pwdSuccess && <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{pwdSuccess}</div>}
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password Lama</label>
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
