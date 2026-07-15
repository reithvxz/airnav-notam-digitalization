import { useState, useMemo } from 'react';
import { useNotams } from '../context/NotamContext';
import { Link } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock, TrendingUp, Activity, MapPin, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import PdfViewerModal from '../components/PdfViewerModal';

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

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const { activeNotams, incomingNotams, pastNotams, completedThisMonth, thisMonthCount, filteredNotams, chartData, pieData, statusPieData, recentActivity } = useMemo(() => {
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

    notams.forEach(notam => {
      const formData = notam.formData || {};
      const startTime = new Date(formData.waktuMulai || notam.waktuMulai || notam.createdAt);
      const endTime = new Date(formData.waktuSelesai || notam.waktuSelesai || notam.createdAt);
      const createdDate = new Date(notam.createdAt);

      if (endTime < now) {
        past.push(notam);
      } else if (startTime <= now) {
        active.push(notam);
      } else {
        incoming.push(notam);
      }

      // Completed this month
      if (endTime < now && createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
        completedMonth++;
      }

      // Created this month
      if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
        monthCount++;
      }

      // Chart data
      if (createdDate.getFullYear() === currentYear) {
        monthsCount[createdDate.getMonth()]++;
      }

      // Pie data
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

    // Recent activity: last 6
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
  }, [notams, statusFilter, jenisFilter, now, currentMonth, currentYear]);

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
          backgroundColor: 'white',
          padding: '12px 16px',
          borderRadius: '10px',
          border: 'none',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: '#3b82f6', fontWeight: 500 }}>{payload[0].value} NOTAM</p>
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
        <Link to="/admin/create-notam" className="btn btn-primary">
          <Plus size={20} />
          Buat NOTAM Baru
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = card.filterKey && statusFilter === card.filterKey;
          return (
            <div
              key={card.label}
              className="stat-card"
              onClick={() => card.filterKey && setStatusFilter(card.filterKey)}
              style={{
                cursor: card.filterKey ? 'pointer' : 'default',
                border: isSelected ? `2px solid ${card.borderColor}` : '1px solid #e2e8f0',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="stat-title">{card.label}</span>
                <div style={{
                  padding: '0.5rem',
                  backgroundColor: card.iconBg,
                  borderRadius: '10px',
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} />
                </div>
              </div>
              <span className="stat-value">{card.value}</span>
              {card.subtitle && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{card.subtitle}</span>
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
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: 'none',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: '10px 14px',
                    }}
                    formatter={(value, name) => [`${value} NOTAM`, name]}
                  />
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
                  <Tooltip
                    cursor={{ fill: 'rgba(59,130,246,0.04)' }}
                    contentStyle={{
                      borderRadius: '10px',
                      border: 'none',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: '10px 14px',
                    }}
                    formatter={(value) => [`${value} NOTAM`, 'Total']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {statusPieData.map((entry, index) => {
                      const colors = {
                        'Terbit': '#10b981',
                        'Incoming': '#f59e0b',
                        'Selesai': '#ef4444'
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

      {selectedNotam && (
        <PdfViewerModal notam={selectedNotam} onClose={() => setSelectedNotam(null)} />
      )}
    </div>
  );
}
