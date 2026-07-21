import { useState, useMemo, useEffect } from 'react';
import { useNotams } from '../context/NotamContext';
import { Link, useLocation } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock, TrendingUp, Activity, MapPin, CheckSquare, Trash2, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import PdfViewerModal from '../components/PdfViewerModal';
import BriefingViewerModal from '../components/BriefingViewerModal';
import PostShiftViewerModal from '../components/PostShiftViewerModal';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#64748b'];

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} jam lalu`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} hari lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} bulan lalu`;
}

export default function AdminDashboard() {
  const { notams } = useNotams();
  const [statusFilter, setStatusFilter] = useState('all');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [selectedNotam, setSelectedNotam] = useState(null);
  const location = useLocation();
  const [mainTab, setMainTab] = useState(location.state?.tab || 'notam'); // 'notam' | 'briefing' | 'postshift'
  const [briefings, setBriefings] = useState([]);
  const [postshifts, setPostshifts] = useState([]);
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [selectedPostShift, setSelectedPostShift] = useState(null);

  useEffect(() => {
    if (mainTab === 'briefing') {
      fetch('http://localhost:3000/api/briefings')
        .then(r => r.json())
        .then(data => setBriefings(Array.isArray(data) ? data : []))
        .catch(() => setBriefings([]));
    } else if (mainTab === 'postshift') {
      fetch('http://localhost:3000/api/postshifts')
        .then(r => r.json())
        .then(data => setPostshifts(Array.isArray(data) ? data : []))
        .catch(() => setPostshifts([]));
    }
  }, [mainTab]);

  const handleDeleteBriefing = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Hapus briefing ini?')) return;
    await fetch(`http://localhost:3000/api/briefings/${id}`, { method: 'DELETE' });
    setBriefings(prev => prev.filter(b => b.id !== id));
  };

  const handleDeletePostShift = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Hapus post-shift ini?')) return;
    await fetch(`http://localhost:3000/api/postshifts/${id}`, { method: 'DELETE' });
    setPostshifts(prev => prev.filter(p => p.id !== id));
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const { activeNotams, incomingNotams, pastNotams, completedThisMonth, thisMonthCount, filteredNotams, chartData, pieData, statusPieData, recentActivity } = useMemo(() => {
    const _now = new Date();
    const _month = _now.getMonth();
    const _year = _now.getFullYear();
    let active = [];
    let incoming = [];
    let past = [];
    let completedMonth = 0;
    let monthCount = 0;

    const monthsCount = Array(12).fill(0);

    // Pie data counters
    let newCount = 0;
    let replaceCount = 0;
    let cancelCount = 0;
    let assessmentCount = 0;

    const safeNotams = Array.isArray(notams) ? notams : [];
    safeNotams.forEach(notam => {
      const formData = notam.formData || {};
      const startTime = new Date(formData.waktuMulai || notam.waktuMulai || notam.createdAt);
      const endTime = new Date(formData.waktuSelesai || notam.waktuSelesai || notam.createdAt);
      const createdDate = new Date(notam.createdAt);

      if (endTime < _now) {
        past.push(notam);
      } else if (startTime <= _now) {
        active.push(notam);
      } else {
        incoming.push(notam);
      }

      if (endTime < _now && createdDate.getMonth() === _month && createdDate.getFullYear() === _year) {
        completedMonth++;
      }
      if (createdDate.getMonth() === _month && createdDate.getFullYear() === _year) {
        monthCount++;
      }
      if (createdDate.getFullYear() === _year) {
        monthsCount[createdDate.getMonth()]++;
      }

      const jenisNotam = formData.jenisNotam || notam.jenis || '';
      if (jenisNotam === 'NOTAM New') newCount++;
      else if (jenisNotam === 'NOTAM Replace') replaceCount++;
      else if (jenisNotam === 'NOTAM Cancel') cancelCount++;
      else if (jenisNotam === 'Assessment Only') assessmentCount++;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const chart = monthsCount.map((count, index) => ({ name: monthNames[index], notams: count }));

    const pie = [
      { name: 'NOTAM New', value: newCount },
      { name: 'Replace', value: replaceCount },
      { name: 'Cancel', value: cancelCount },
      { name: 'Assessment', value: assessmentCount },
    ].filter(d => d.value > 0);

    const statusPie = [
      { name: 'Terbit', value: active.length },
      { name: 'Incoming', value: incoming.length },
      { name: 'Selesai', value: past.length },
    ].filter(d => d.value > 0);

    let filtered = notams;
    if (statusFilter === 'active') filtered = active;
    else if (statusFilter === 'incoming') filtered = incoming;
    else if (statusFilter === 'past') filtered = past;

    if (jenisFilter !== 'all') {
      filtered = filtered.filter(n => (n.formData?.jenisNotam || n.jenis) === jenisFilter);
    }
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const recent = [...notams].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

    return {
      activeNotams: active,
      incomingNotams: incoming,
      completedThisMonth: completedMonth,
      thisMonthCount: monthCount,
      pastNotams: past,
      filteredNotams: filtered,
      chartData: chart,
      pieData: pie,
      statusPieData: statusPie,
      recentActivity: recent
    };
  }, [notams, statusFilter, jenisFilter]);

  const statCards = [
    {
      label: 'Total NOTAM',
      value: notams.length,
      icon: FileText,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      borderColor: '#3b82f6',
      filterKey: 'all',
    },
    {
      label: 'NOTAM Aktif',
      value: activeNotams.length,
      icon: CheckCircle,
      iconBg: '#d1fae5',
      iconColor: '#059669',
      borderColor: '#059669',
      filterKey: 'active',
      subtitle: 'Sudah terbit'
    },
    {
      label: 'Incoming',
      value: incomingNotams.length,
      icon: Clock,
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      borderColor: '#d97706',
      filterKey: 'incoming',
      subtitle: 'Akan terbit'
    },
    {
      label: 'Bulan Ini',
      value: thisMonthCount,
      icon: TrendingUp,
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      borderColor: '#7c3aed',
      subtitle: `${completedThisMonth} selesai`
    },
    {
      label: 'Sudah Lewat',
      value: pastNotams.length,
      icon: Clock,
      iconBg: '#f3f4f6',
      iconColor: '#6b7280',
      borderColor: '#6b7280',
      filterKey: 'past',
      subtitle: 'Tidak aktif'
    },
  ];

  const CustomTooltip = ({ active: isActive, payload, label }) => {
    if (isActive && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '12px 20px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}>{payload[0].value} NOTAM</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Admin</h1>
          <p className="page-subtitle">Ringkasan aktivitas dan manajemen NOTAM</p>
        </div>

      </div>

      {/* Main Tab Switch */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
        <button
          onClick={() => setMainTab('notam')}
          style={{
            padding: '0.6rem 1.25rem', border: 'none', background: 'transparent',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            borderBottom: mainTab === 'notam' ? '2px solid #2563eb' : '2px solid transparent',
            color: mainTab === 'notam' ? '#2563eb' : '#64748b',
            marginBottom: -2, transition: 'all 0.2s',
          }}
        >
          <FileText size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          NOTAM
        </button>
        <button
          onClick={() => setMainTab('briefing')}
          style={{
            padding: '0.6rem 1.25rem', border: 'none', background: 'transparent',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            borderBottom: mainTab === 'briefing' ? '2px solid #2563eb' : '2px solid transparent',
            color: mainTab === 'briefing' ? '#2563eb' : '#64748b',
            marginBottom: -2, transition: 'all 0.2s',
          }}
        >
          <CheckSquare size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Pre-Shift
          {briefings.length > 0 && (
            <span style={{ marginLeft: 6, background: '#2563eb', color: 'white', borderRadius: 10, fontSize: '0.7rem', padding: '1px 7px' }}>
              {briefings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setMainTab('postshift')}
          style={{
            padding: '0.6rem 1.25rem', border: 'none', background: 'transparent',
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            borderBottom: mainTab === 'postshift' ? '2px solid #2563eb' : '2px solid transparent',
            color: mainTab === 'postshift' ? '#2563eb' : '#64748b',
            marginBottom: -2, transition: 'all 0.2s',
          }}
        >
          <CheckSquare size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Post-Shift
          {postshifts.length > 0 && (
            <span style={{ marginLeft: 6, background: '#2563eb', color: 'white', borderRadius: 10, fontSize: '0.7rem', padding: '1px 7px' }}>
              {postshifts.length}
            </span>
          )}
        </button>
      </div>
      {/* ── NOTAM TAB CONTENT ──────────────────────────── */}
      {mainTab === 'notam' && (<>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = card.filterKey && statusFilter === card.filterKey;
          return (
            <div
              key={card.label}
              className="metric-card"
              onClick={() => card.filterKey && setStatusFilter(card.filterKey)}
              style={{
                cursor: card.filterKey ? 'pointer' : 'default',
                borderColor: isSelected ? card.borderColor : 'rgba(255,255,255,0.5)',
                boxShadow: isSelected ? `0 0 0 2px ${card.borderColor}33, 0 10px 25px rgba(0,0,0,0.05)` : undefined
              }}
            >
              <div className="metric-icon-wrapper" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <div className="metric-value">{card.value}</div>
              <div className="metric-label">{card.label}</div>
              {card.subtitle && (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem', fontWeight: 500 }}>
                  {card.subtitle}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Statistik Penerbitan</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tahun {currentYear}</p>
            </div>
            <div className="badge badge-blue" style={{ padding: '0.3rem 0.7rem' }}>
              <Calendar size={14} style={{ marginRight: '4px' }} /> Bulanan
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData.slice(0, currentMonth + 1)} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Bar dataKey="notams" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Distribusi Jenis</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Semua NOTAM</p>
          </div>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <defs>
                    <linearGradient id="pieGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="pieGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="pieGradient3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="pieGradient4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => {
                      const gradients = ["url(#pieGradient1)", "url(#pieGradient2)", "url(#pieGradient3)", "url(#pieGradient4)"];
                      return <Cell key={`cell-${index}`} fill={gradients[index % gradients.length]} style={{ filter: `drop-shadow(0px 2px 4px rgba(0,0,0,0.1))` }} />
                    })}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Belum ada data</p>
            )}
          </div>
        </div>

        {/* Status Pie Chart -> Horizontal Bar Chart */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Distribusi Status</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Semua NOTAM</p>
          </div>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusPieData} layout="vertical" barSize={28} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={70} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)' }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {statusPieData.map((entry, index) => {
                      const colors = {
                        'Terbit': 'url(#pieGradient3)',
                        'Incoming': 'url(#pieGradient2)',
                        'Selesai': '#ef4444' // we can add more gradients if needed
                      };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Belum ada data</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity + Table Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem' }}>
        {/* Recent Activity */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Activity size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Aktivitas Terbaru</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {recentActivity.map((notam, idx) => {
              const formData = notam.formData || {};
              const jenisNotam = formData.jenisNotam || notam.jenis || '';
              const lokasi = formData.lokasi || notam.lokasi || '';
              const isNew = jenisNotam === 'NOTAM New';
              const isReplace = jenisNotam === 'NOTAM Replace';
              const dotColor = isNew ? '#3b82f6' : isReplace ? '#f59e0b' : '#ef4444';
              return (
                <div
                  key={notam.id}
                  onClick={() => setSelectedNotam(notam)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: idx < recentActivity.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Timeline dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                    <div style={{
                      width: '10px', height: '10px',
                      borderRadius: '50%',
                      backgroundColor: dotColor,
                      flexShrink: 0,
                    }} />
                    {idx < recentActivity.length - 1 && (
                      <div style={{ width: '2px', flex: 1, backgroundColor: '#e2e8f0', marginTop: '4px' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{notam.formNo}</span>
                      <span className={`badge ${isNew ? 'badge-blue' : isReplace ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '0.65rem', padding: '2px 6px', flexShrink: 0 }}>
                        {jenisNotam.replace('NOTAM ', '')}
                      </span>
                    </div>
                    {formData.targetFormNo && (
                      <div style={{ fontSize: '0.7rem', color: isReplace ? '#d97706' : '#dc2626', marginTop: '2px', fontWeight: 500 }}>
                        👉 {isReplace ? 'Replacing' : 'Canceling'}: {formData.targetFormNo}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <MapPin size={11} color="#94a3b8" />
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{lokasi}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', display: 'block' }}>{timeAgo(notam.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'visible', display: 'flex', flexDirection: 'column', height: '600px', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Daftar NOTAM <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '8px' }}>({filteredNotams.length} dokumen)</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif (Terbit)</option>
                <option value="incoming">Incoming</option>
                <option value="past">Sudah Lewat</option>
              </select>
              
              <select 
                value={jenisFilter} 
                onChange={(e) => setJenisFilter(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="all">Semua Jenis</option>
                <option value="NOTAM New">NOTAM New</option>
                <option value="NOTAM Replace">NOTAM Replace</option>
                <option value="NOTAM Cancel">NOTAM Cancel</option>
                <option value="Assessment Only">Assessment Only</option>
              </select>
            </div>
          </div>

          {filteredNotams.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
              <p>Belum ada NOTAM pada kategori ini.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No Form</th>
                    <th>Jenis</th>
                    <th>Pembuat</th>
                    <th>Lokasi</th>
                    <th>Waktu Mulai</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotams.map((notam) => {
                    const formData = notam.formData || {};
                    const jenisNotam = formData.jenisNotam || notam.jenis || '';
                    const lokasi = formData.lokasi || notam.lokasi || '';
                    const waktuMulai = formData.waktuMulai || notam.waktuMulai || notam.createdAt;
                    const waktuSelesai = formData.waktuSelesai || notam.waktuSelesai || notam.createdAt;
                    const startTime = new Date(waktuMulai);
                    const endTime = new Date(waktuSelesai);
                    const isActive = startTime <= now && endTime >= now;

                    return (
                      <tr key={notam.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedNotam(notam)}>
                        <td style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {notam.formNo}
                          {formData.targetFormNo && (
                            <div style={{ fontSize: '0.72rem', color: jenisNotam === 'NOTAM Replace' ? '#d97706' : '#dc2626', marginTop: '4px' }}>
                              👉 {jenisNotam === 'NOTAM Replace' ? 'Replacing' : 'Canceling'}: {formData.targetFormNo}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${jenisNotam === 'NOTAM New' ? 'badge-blue' : jenisNotam === 'NOTAM Replace' ? 'badge-yellow' : 'badge-red'}`}
                            style={{ fontSize: '0.72rem' }}>
                            {jenisNotam.replace('NOTAM ', '')}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{formData.creatorName || notam.creatorName || notam.creator || notam.createdBy || '-'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formData.creatorInitial || '-'}</div>
                        </td>
                        <td style={{ fontSize: '0.88rem' }}>{lokasi}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{new Date(waktuMulai).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            sd. {new Date(waktuSelesai).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${isActive ? 'badge-green' : endTime < now ? 'badge-red' : 'badge-yellow'}`}>
                            {isActive ? 'Terbit' : endTime < now ? 'Selesai' : 'Incoming'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedNotam(notam); }}
                          >
                            Lihat PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      </>)} {/* end mainTab === 'notam' */}

      {/* ── BRIEFING TAB ─────────────────────────── */}
      {mainTab === 'briefing' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Daftar Pre-Shift Briefing
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({briefings.length} dokumen)</span>
            </h3>
            <Link to="/admin/create-briefing" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
              <Plus size={15} /> Buat Briefing Baru
            </Link>
          </div>

          {briefings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
              <p>Belum ada Pre-Shift Briefing Checklist.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Shift</th>
                    <th>Incoming Manager</th>
                    <th>Outgoing Manager</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {briefings.map(b => (
                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedBriefing(b)}>
                      <td style={{ fontWeight: 600 }}>{b.date}</td>
                      <td>{b.time}</td>
                      <td>
                        <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{b.shift}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{b.incomingManager?.nama}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.incomingManager?.initial}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{b.outgoingManager?.nama}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.outgoingManager?.initial}</div>
                      </td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedBriefing(b); }}
                        >
                          Lihat PDF
                        </button>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                          onClick={(e) => handleDeleteBriefing(b.id, e)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── POST-SHIFT TAB ─────────────────────────── */}
      {mainTab === 'postshift' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Daftar Post-Shift Review
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({postshifts.length} dokumen)</span>
            </h3>
            <Link to="/admin/create-postshift" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
              <Plus size={15} /> Buat Post-Shift Baru
            </Link>
          </div>

          {postshifts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
              <p>Belum ada Post-Shift Review Checklist.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Shift</th>
                    <th>Incoming Manager</th>
                    <th>Outgoing Manager</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {postshifts.map(p => (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPostShift(p)}>
                      <td style={{ fontWeight: 600 }}>{p.date}</td>
                      <td>{p.time}</td>
                      <td>
                        <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{p.shift}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{p.incomingManager?.nama}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.incomingManager?.initial}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{p.outgoingManager?.nama}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.outgoingManager?.initial}</div>
                      </td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedPostShift(p); }}
                        >
                          Lihat PDF
                        </button>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                          onClick={(e) => handleDeletePostShift(p.id, e)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedNotam && (
        <PdfViewerModal notam={selectedNotam} onClose={() => setSelectedNotam(null)} />
      )}
      {selectedBriefing && (
        <BriefingViewerModal briefing={selectedBriefing} onClose={() => setSelectedBriefing(null)} />
      )}
      {selectedPostShift && (
        <PostShiftViewerModal postshift={selectedPostShift} onClose={() => setSelectedPostShift(null)} />
      )}
    </div>
  );
}
