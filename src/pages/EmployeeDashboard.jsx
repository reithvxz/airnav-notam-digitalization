import { useState, useMemo } from 'react';
import { useNotams } from '../context/NotamContext';
import { FileText, Search, CheckCircle, Clock, MapPin } from 'lucide-react';
import PdfViewerModal from '../components/PdfViewerModal';

export default function EmployeeDashboard() {
  const { notams } = useNotams();
  const [activeTab, setActiveTab] = useState('terbit');
  const [selectedNotam, setSelectedNotam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();

  const { terbitCount, incomingCount, filteredNotams } = useMemo(() => {
    let terbit = [];
    let incoming = [];

    notams.forEach(notam => {
      const formData = notam.formData || {};
      const startTime = new Date(formData.waktuMulai || notam.waktuMulai || notam.createdAt);
      if (startTime <= now) {
        terbit.push(notam);
      } else {
        incoming.push(notam);
      }
    });

    const source = activeTab === 'terbit' ? terbit : incoming;

    // Apply search filter
    let filtered = source;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = source.filter(notam => {
        const formData = notam.formData || {};
        const lokasi = formData.lokasi || notam.lokasi || '';
        const deskripsi = formData.deskripsi || notam.deskripsi || '';
        const jenisNotam = formData.jenisNotam || notam.jenis || '';
        return (
          notam.formNo.toLowerCase().includes(q) ||
          lokasi.toLowerCase().includes(q) ||
          deskripsi.toLowerCase().includes(q) ||
          jenisNotam.toLowerCase().includes(q)
        );
      });
    }

    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { terbitCount: terbit.length, incomingCount: incoming.length, filteredNotams: filtered };
  }, [notams, activeTab, now, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} UTC`;
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dokumen NOTAM</h1>
          <p className="page-subtitle">Akses dokumen NOTAM yang telah terbit atau yang akan datang</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="stat-title">Total Dokumen</span>
            <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '10px', color: '#3b82f6' }}>
              <FileText size={20} />
            </div>
          </div>
          <span className="stat-value">{notams.length}</span>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="stat-title">Sudah Terbit</span>
            <div style={{ padding: '0.5rem', backgroundColor: '#d1fae5', borderRadius: '10px', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <span className="stat-value">{terbitCount}</span>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="stat-title">Akan Terbit</span>
            <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <span className="stat-value">{incomingCount}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '500px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('terbit')}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: activeTab === 'terbit' ? 'white' : '#f8fafc',
              border: 'none',
              borderBottom: activeTab === 'terbit' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'terbit' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={16} />
            Surat Telah Terbit
            <span className="badge badge-green" style={{ marginLeft: '4px' }}>{terbitCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: activeTab === 'incoming' ? 'white' : '#f8fafc',
              border: 'none',
              borderBottom: activeTab === 'incoming' ? '2.5px solid var(--warning)' : '2.5px solid transparent',
              color: activeTab === 'incoming' ? '#d97706' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Clock size={16} />
            Surat Incoming
            <span className="badge badge-yellow" style={{ marginLeft: '4px' }}>{incomingCount}</span>
          </button>
        </div>

        {/* Search bar */}
        <div style={{ padding: '1.25rem 2rem 0' }}>
          <div style={{
            position: 'relative',
            maxWidth: '400px'
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Cari lokasi, nomor, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '40px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem 2rem 2rem' }}>
          {filteredNotams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.15 }} />
              <p style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                {searchQuery ? 'Tidak ada hasil untuk pencarian ini.' : 'Tidak ada dokumen NOTAM di kategori ini.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-secondary"
                  style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}
                >
                  Hapus Pencarian
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filteredNotams.map(notam => {
                const formData = notam.formData || {};
                const jenisNotam = formData.jenisNotam || notam.jenis || '';
                const lokasi = formData.lokasi || notam.lokasi || '';
                const deskripsi = formData.deskripsi || notam.deskripsi || '';
                const waktuMulai = formData.waktuMulai || notam.waktuMulai || notam.createdAt;
                const waktuSelesai = formData.waktuSelesai || notam.waktuSelesai || notam.createdAt;

                const isNew = jenisNotam === 'NOTAM New';
                const isReplace = jenisNotam === 'NOTAM Replace';
                const badgeClass = isNew ? 'badge-blue' : isReplace ? 'badge-yellow' : 'badge-red';
                const accentColor = isNew ? '#3b82f6' : isReplace ? '#f59e0b' : '#ef4444';

                return (
                  <div
                    key={notam.id}
                    onClick={() => setSelectedNotam(notam)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    }}
                  >
                    {/* Accent stripe */}
                    <div style={{ height: '4px', backgroundColor: accentColor }} />

                    {/* Card top */}
                    <div style={{
                      padding: '1.25rem 1.25rem 0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px', height: '40px',
                          borderRadius: '10px',
                          backgroundColor: `${accentColor}12`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: accentColor,
                        }}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{notam.formNo}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <MapPin size={11} color="#94a3b8" />
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{lokasi}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                        {jenisNotam.replace('NOTAM ', '')}
                      </span>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        lineHeight: '1.4',
                        marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {deskripsi}
                      </p>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                      }}>
                        <div>
                          <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Mulai</div>
                          <div style={{ color: '#334155', fontWeight: 500 }}>{formatDate(waktuMulai)}</div>
                        </div>
                        <div>
                          <div style={{ color: '#94a3b8', marginBottom: '2px' }}>Selesai</div>
                          <div style={{ color: '#334155', fontWeight: 500 }}>{formatDate(waktuSelesai)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
