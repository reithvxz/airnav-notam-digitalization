import { useState, useMemo } from 'react';
import { useNotams } from '../context/NotamContext';
import { FileText } from 'lucide-react';
import PdfViewerModal from '../components/PdfViewerModal';

export default function EmployeeDashboard() {
  const { notams } = useNotams();
  const [activeTab, setActiveTab] = useState('terbit'); // 'terbit' or 'incoming'
  const [selectedNotam, setSelectedNotam] = useState(null);

  const now = new Date();

  const filteredNotams = useMemo(() => {
    return notams.filter(notam => {
      const startTime = new Date(notam.formData.waktuMulai);
      if (activeTab === 'terbit') {
        return startTime <= now;
      } else {
        return startTime > now;
      }
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notams, activeTab, now]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dokumen NOTAM</h1>
          <p className="page-subtitle">Akses dokumen NOTAM yang telah terbit atau yang akan datang</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', minHeight: '600px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('terbit')}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: activeTab === 'terbit' ? 'white' : '#f8fafc',
              border: 'none',
              borderBottom: activeTab === 'terbit' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'terbit' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter',
              transition: 'all 0.2s'
            }}
          >
            Surat Telah Terbit (Aktif)
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: activeTab === 'incoming' ? 'white' : '#f8fafc',
              border: 'none',
              borderBottom: activeTab === 'incoming' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'incoming' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter',
              transition: 'all 0.2s'
            }}
          >
            Surat Incoming (Akan Terbit)
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          {filteredNotams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <p>Tidak ada dokumen NOTAM di kategori ini.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredNotams.map(notam => (
                <div 
                  key={notam.id} 
                  onClick={() => setSelectedNotam(notam)}
                  style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    height: '140px', 
                    backgroundColor: '#f1f5f9', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderBottom: '1px solid #e2e8f0',
                    color: 'var(--primary)',
                    position: 'relative'
                  }}>
                    <FileText size={48} style={{ opacity: 0.8 }} />
                    <span style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '1.1rem' }}>{notam.formNo}</span>
                    
                    <span className={`badge ${activeTab === 'terbit' ? 'badge-green' : 'badge-yellow'}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      {notam.formData.jenisNotam}
                    </span>
                  </div>
                  
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lokasi</span>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{notam.formData.lokasi}</div>
                    </div>
                    
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai (UTC)</span>
                      <div style={{ fontSize: '0.85rem' }}>{notam.formData.waktuMulai.replace('T', ' ')}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selesai (UTC)</span>
                      <div style={{ fontSize: '0.85rem' }}>{notam.formData.waktuSelesai.replace('T', ' ')}</div>
                    </div>
                  </div>
                </div>
              ))}
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
