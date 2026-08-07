import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomPickers';
import ShiftStats from '../../components/dashboard/ShiftStats';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import PredutyTemplate from '../../components/PredutyTemplate';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
  return `${day} ${months[month]} ${year}`;
};

export default function PredutyTab({ preduties, selectedPreduty, setSelectedPreduty, onDelete }) {
  const { user } = useAuth();
  const [predutyShiftFilter, setPredutyShiftFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Extract unique creator initials for the dropdown
  const uniqueCreators = useMemo(() => {
    const creators = new Set();
    preduties.forEach(p => {
      const creatorName = p.managerOnDutyInfo?.nama || p.managerOnDuty;
      if (creatorName) creators.add(creatorName);
    });
    return Array.from(creators).sort();
  }, [preduties]);

  const filteredPreduties = useMemo(() => {
    return preduties.filter(p => {
      const matchShift = predutyShiftFilter === 'all' || p.shift === predutyShiftFilter;
      const creatorName = p.managerOnDutyInfo?.nama || p.managerOnDuty;
      const matchCreator = creatorFilter === 'all' || creatorName === creatorFilter;
      return matchShift && matchCreator;
    });
  }, [preduties, predutyShiftFilter, creatorFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [predutyShiftFilter, creatorFilter]);

  const totalPages = Math.ceil(filteredPreduties.length / itemsPerPage);
  const paginatedPreduties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPreduties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPreduties, currentPage]);

  const handleSelectPreduty = async (p, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/preduties/${p.id}`);
      const fullData = await res.json();
      setSelectedPreduty(fullData);
    } catch (err) {
      console.error(err);
      setSelectedPreduty(p);
    }
  };

  return (
    <>
      <ShiftStats data={preduties} />
      <div className="card" style={{ borderRadius: '8px' }}>
        <div className="tab-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Daftar Preduty Briefing
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({filteredPreduties.length} dokumen)</span>
          </h3>
          {user?.role === 'admin' && (
            <Link to="/admin/create-preduty" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
              <Plus size={15} /> Buat Preduty Baru
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <CustomSelect
              value={predutyShiftFilter}
              onChange={setPredutyShiftFilter}
              placeholder="Semua Shift"
              options={[
                { value: 'all', label: 'Semua Shift' },
                { value: 'PAGI', label: 'Pagi' },
                { value: 'SIANG', label: 'Siang' },
                { value: 'MALAM', label: 'Malam' }
              ]}
            />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <CustomSelect
              value={creatorFilter}
              onChange={setCreatorFilter}
              placeholder="Semua Pembuat"
              options={[
                { value: 'all', label: 'Semua Pembuat' },
                ...uniqueCreators.map(creator => {
                  const isMe = user && (creator === user.name || creator === user.nama);
                  return { value: creator, label: isMe ? `${creator} (Saya)` : creator };
                })
              ]}
            />
          </div>
        </div>

        {preduties.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
            <p>Belum ada Preduty Briefing Checklist.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Shift</th>
                  <th>Manager/Supervisor</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPreduties.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={(e) => handleSelectPreduty(p, e)}>
                    <td style={{ fontWeight: 600 }}>{formatDate(p.date)}</td>
                    <td>{p.time}</td>
                    <td>
                      <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{p.shift}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{p.managerOnDutyInfo?.nama || p.managerOnDuty}</div>
                      {p.managerOnDutyInfo?.nama && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.managerOnDuty}</div>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => handleSelectPreduty(p, e)}
                        >
                          Lihat PDF
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <Link
                              to="/admin/create-preduty"
                              state={{ preduty: p }}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Edit
                            </Link>
                            <button
                              className="btn"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                              onClick={(e) => onDelete(p.id, e)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredPreduties.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>

      {selectedPreduty && (
        <DocumentViewerModal
          title="Preduty Briefing"
          subtitle={`${selectedPreduty.date} — ${selectedPreduty.time}`}
          exportFilename={`Preduty_Briefing_${selectedPreduty.date?.replace(/ /g,'_')}.pdf`}
          TemplateComponent={PredutyTemplate}
          templateProps={{ preduty: selectedPreduty }}
          onClose={() => setSelectedPreduty(null)}
        />
      )}
    </>
  );
}
