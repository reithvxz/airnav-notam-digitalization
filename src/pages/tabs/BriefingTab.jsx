import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomPickers';
import ShiftStats from '../../components/dashboard/ShiftStats';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import BriefingTemplate from '../../components/BriefingTemplate';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

export default function BriefingTab({ briefings, incomingOptions, outgoingOptions, selectedBriefing, setSelectedBriefing, onDelete }) {
  const { user } = useAuth();
  const [briefingShiftFilter, setBriefingShiftFilter] = useState('all');
  const [briefingIncomingFilter, setBriefingIncomingFilter] = useState('all');
  const [briefingOutgoingFilter, setBriefingOutgoingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredBriefings = useMemo(() => {
    return briefings.filter(b => {
      const matchShift = briefingShiftFilter === 'all' || b.shift === briefingShiftFilter;
      const matchIncoming = briefingIncomingFilter === 'all' || b.incomingManager?.initial === briefingIncomingFilter;
      const matchOutgoing = briefingOutgoingFilter === 'all' || b.outgoingManager?.initial === briefingOutgoingFilter;
      return matchShift && matchIncoming && matchOutgoing;
    });
  }, [briefings, briefingShiftFilter, briefingIncomingFilter, briefingOutgoingFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [briefingShiftFilter, briefingIncomingFilter, briefingOutgoingFilter]);

  const totalPages = Math.ceil(filteredBriefings.length / itemsPerPage);
  const paginatedBriefings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBriefings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBriefings, currentPage]);

  return (
    <>
      <ShiftStats data={briefings} />
      <div className="card" style={{ borderRadius: '8px' }}>
        <div className="tab-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Daftar Pre-Shift Briefing
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({filteredBriefings.length} dokumen)</span>
          </h3>
          {user?.role === 'admin' && (
            <Link to="/admin/create-briefing" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
              <Plus size={15} /> Buat Briefing Baru
            </Link>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <CustomSelect
              value={briefingShiftFilter}
              onChange={setBriefingShiftFilter}
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
              value={briefingIncomingFilter}
              onChange={setBriefingIncomingFilter}
              placeholder="Semua Incoming Manager"
              options={incomingOptions}
            />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <CustomSelect
              value={briefingOutgoingFilter}
              onChange={setBriefingOutgoingFilter}
              placeholder="Semua Outgoing Manager"
              options={outgoingOptions}
            />
          </div>
        </div>

        {briefings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
            <p>Belum ada Pre-Shift Briefing Checklist.</p>
          </div>
        ) : (
          <div className="table-wrapper">
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
                {paginatedBriefings.map(b => (
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
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedBriefing(b); }}
                        >
                          Lihat PDF
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <Link
                              to="/admin/create-briefing"
                              state={{ briefing: b }}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Edit
                            </Link>
                            <button
                              className="btn"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                              onClick={(e) => onDelete(b.id, e)}
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

        {filteredBriefings.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>

      {selectedBriefing && (
        <DocumentViewerModal
          title="Pre-Shift Briefing"
          subtitle={`${selectedBriefing.date} — ${selectedBriefing.time}`}
          exportFilename={`Pre-Shift_Briefing_${selectedBriefing.date?.replace(/ /g,'_')}.pdf`}
          TemplateComponent={BriefingTemplate}
          templateProps={{ briefing: selectedBriefing }}
          onClose={() => setSelectedBriefing(null)}
        />
      )}
    </>
  );
}
