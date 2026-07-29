import { FileText, Sun, Cloud, Moon } from 'lucide-react';

const ShiftStats = ({ data }) => {
  const pagi = data.filter(d => d.shift === 'PAGI').length;
  const siang = data.filter(d => d.shift === 'SIANG').length;
  const malam = data.filter(d => d.shift === 'MALAM').length;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Total Dokumen</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '10px', color: '#3b82f6' }}>
            <FileText size={20} />
          </div>
        </div>
        <span className="stat-value">{data.length}</span>
      </div>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Shift Pagi</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
            <Sun size={20} />
          </div>
        </div>
        <span className="stat-value">{pagi}</span>
      </div>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Shift Siang</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#d1fae5', borderRadius: '10px', color: '#059669' }}>
            <Cloud size={20} />
          </div>
        </div>
        <span className="stat-value">{siang}</span>
      </div>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Shift Malam</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#e2e8f0', borderRadius: '10px', color: '#475569' }}>
            <Moon size={20} />
          </div>
        </div>
        <span className="stat-value">{malam}</span>
      </div>
    </div>
  );
};

export default ShiftStats;
