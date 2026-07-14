import { useState, useMemo } from 'react';
import { useNotams } from '../context/NotamContext';
import { Link } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PdfViewerModal from '../components/PdfViewerModal';

export default function AdminDashboard() {
  const { notams } = useNotams();
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'incoming'
  const [selectedNotam, setSelectedNotam] = useState(null);

  const now = new Date();

  // Process data
  const { activeNotams, incomingNotams, filteredNotams, chartData } = useMemo(() => {
    let active = [];
    let incoming = [];

    // Monthly data for chart (using current year)
    const currentYear = now.getFullYear();
    const monthsCount = Array(12).fill(0);

    notams.forEach(notam => {
      const startTime = new Date(notam.formData.waktuMulai);
      if (startTime <= now) {
        active.push(notam);
      } else {
        incoming.push(notam);
      }

      const notamDate = new Date(notam.createdAt);
      if (notamDate.getFullYear() === currentYear) {
        monthsCount[notamDate.getMonth()]++;
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chart = monthsCount.map((count, index) => ({ name: monthNames[index], notams: count }));

    let filtered = notams;
    if (filter === 'active') filtered = active;
    if (filter === 'incoming') filtered = incoming;

    // Sort by created at descending
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { activeNotams: active, incomingNotams: incoming, filteredNotams: filtered, chartData: chart };
  }, [notams, filter, now]);

  return (
    <div>
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

      <div className="stat-cards">
        <div 
          className="stat-card" 
          onClick={() => setFilter('all')} 
          style={{ cursor: 'pointer', border: filter === 'all' ? '2px solid var(--primary)' : '1px solid #e2e8f0', transform: filter === 'all' ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s' }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="stat-title">Total NOTAM Keseluruhan</span>
            <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#1d4ed8' }}>
              <FileText size={20} />
            </div>
          </div>
          <span className="stat-value">{notams.length}</span>
        </div>
        
        <div 
          className="stat-card"
          onClick={() => setFilter('active')} 
          style={{ cursor: 'pointer', border: filter === 'active' ? '2px solid #059669' : '1px solid #e2e8f0', transform: filter === 'active' ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s' }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="stat-title">NOTAM Aktif (Telah Terbit)</span>
            <div style={{ padding: '0.5rem', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <span className="stat-value">{activeNotams.length}</span>
        </div>
        
        <div 
          className="stat-card"
          onClick={() => setFilter('incoming')} 
          style={{ cursor: 'pointer', border: filter === 'incoming' ? '2px solid #d97706' : '1px solid #e2e8f0', transform: filter === 'incoming' ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s' }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="stat-title">Akan Datang (Incoming)</span>
            <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <span className="stat-value">{incomingNotams.length}</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Statistik Penerbitan NOTAM ({now.getFullYear()})</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData.slice(0, now.getMonth() + 1)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Bar dataKey="notams" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          {filter === 'all' ? 'NOTAM Terbaru' : filter === 'active' ? 'NOTAM Aktif' : 'NOTAM Incoming'}
        </h3>
        
        {filteredNotams.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Belum ada NOTAM pada kategori ini.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No Form</th>
                  <th>Jenis NOTAM</th>
                  <th>Lokasi</th>
                  <th>Waktu Mulai (UTC)</th>
                  <th>Waktu Selesai (UTC)</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotams.map((notam) => {
                  const startTime = new Date(notam.formData.waktuMulai);
                  const isActive = startTime <= now;
                  
                  return (
                    <tr key={notam.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedNotam(notam)}>
                      <td style={{ fontWeight: 500 }}>{notam.formNo}</td>
                      <td>{notam.formData.jenisNotam}</td>
                      <td>{notam.formData.lokasi}</td>
                      <td>{notam.formData.waktuMulai.replace('T', ' ')}</td>
                      <td>{notam.formData.waktuSelesai.replace('T', ' ')}</td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-green' : 'badge-yellow'}`}>
                          {isActive ? 'Terbit' : 'Incoming'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedNotam(notam); }}>
                          Lihat PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedNotam && (
        <PdfViewerModal notam={selectedNotam} onClose={() => setSelectedNotam(null)} />
      )}
    </div>
  );
}
