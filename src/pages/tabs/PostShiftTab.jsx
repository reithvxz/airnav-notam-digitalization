import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomPickers';
import ShiftStats from '../../components/dashboard/ShiftStats';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import PostShiftTemplate from '../../components/PostShiftTemplate';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

export default function PostShiftTab({ postshifts, incomingOptions, outgoingOptions, selectedPostShift, setSelectedPostShift, onDelete }) {
  const { user } = useAuth();
  const [postshiftShiftFilter, setPostshiftShiftFilter] = useState('all');
  const [postshiftIncomingFilter, setPostshiftIncomingFilter] = useState('all');
  const [postshiftOutgoingFilter, setPostshiftOutgoingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredPostshifts = useMemo(() => {
    return postshifts.filter(p => {
      const matchShift = postshiftShiftFilter === 'all' || p.shift === postshiftShiftFilter;
      const matchIncoming = postshiftIncomingFilter === 'all' || p.incomingManager?.initial === postshiftIncomingFilter;
      const matchOutgoing = postshiftOutgoingFilter === 'all' || p.outgoingManager?.initial === postshiftOutgoingFilter;
      return matchShift && matchIncoming && matchOutgoing;
    });
  }, [postshifts, postshiftShiftFilter, postshiftIncomingFilter, postshiftOutgoingFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [postshiftShiftFilter, postshiftIncomingFilter, postshiftOutgoingFilter]);

  const totalPages = Math.ceil(filteredPostshifts.length / itemsPerPage);
  const paginatedPostshifts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPostshifts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPostshifts, currentPage]);

  return (
    <>
      <ShiftStats data={postshifts} />
      <div className="card" style={{ borderRadius: '8px' }}>
        <div className="tab-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Daftar Post-Shift Review
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({filteredPostshifts.length} dokumen)</span>
          </h3>
          {user?.role === 'admin' && (
            <Link to="/admin/create-postshift" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
              <Plus size={15} /> Buat Post-Shift Baru
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <CustomSelect
              value={postshiftShiftFilter}
              onChange={setPostshiftShiftFilter}
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
              value={postshiftIncomingFilter}
              onChange={setPostshiftIncomingFilter}
              placeholder="Semua Incoming Manager"
              options={incomingOptions}
            />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <CustomSelect
              value={postshiftOutgoingFilter}
              onChange={setPostshiftOutgoingFilter}
              placeholder="Semua Outgoing Manager"
              options={outgoingOptions}
            />
          </div>
        </div>

        {postshifts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
            <p>Belum ada Post-Shift Review Checklist.</p>
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
                {paginatedPostshifts.map(p => (
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
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedPostShift(p); }}
                        >
                          Lihat PDF
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <Link
                              to="/admin/create-postshift"
                              state={{ postshift: p }}
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

        {filteredPostshifts.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>

      {selectedPostShift && (
        <DocumentViewerModal
          title="Post-Shift Review"
          subtitle={`${selectedPostShift.date} — ${selectedPostShift.time}`}
          exportFilename={`Post-Shift_Review_${selectedPostShift.date?.replace(/ /g,'_')}.pdf`}
          TemplateComponent={PostShiftTemplate}
          templateProps={{ postshift: selectedPostShift }}
          onClose={() => setSelectedPostShift(null)}
        />
      )}
    </>
  );
}
