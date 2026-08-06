import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock, TrendingUp, Trash2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomPickers';
import PdfViewerModal from '../../components/PdfViewerModal';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

export default function NotamTab({ notams, deleteNotam, selectedNotam, setSelectedNotam, initialStatusFilter = 'all' }) {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [jenisFilter, setJenisFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const now = new Date();

  // Extract unique creators for the dropdown
  const uniqueCreators = useMemo(() => {
    const creators = new Set();
    const safeNotams = Array.isArray(notams) ? notams : [];
    safeNotams.forEach(n => {
      const creator = n.formData?.creatorName || n.creatorName || n.formData?.creatorInitial || n.creator || n.createdBy;
      if (creator) creators.add(creator);
    });
    return Array.from(creators).sort();
  }, [notams]);

  const { activeNotams, incomingNotams, pastNotams, completedThisMonth, thisMonthCount, filteredNotams } = useMemo(() => {
    const _now = new Date();
    const _month = _now.getMonth();
    const _year = _now.getFullYear();
    let active = [];
    let incoming = [];
    let past = [];
    let completedMonth = 0;
    let monthCount = 0;

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
    });

    let filtered = safeNotams;
    if (statusFilter === 'active') filtered = active;
    else if (statusFilter === 'incoming') filtered = incoming;
    else if (statusFilter === 'past') filtered = past;

    if (jenisFilter !== 'all') {
      filtered = filtered.filter(n => (n.formData?.jenisNotam || n.jenis) === jenisFilter);
    }
    if (creatorFilter !== 'all') {
      filtered = filtered.filter(n => {
        const creator = n.formData?.creatorName || n.creatorName || n.formData?.creatorInitial || n.creator || n.createdBy;
        return creator === creatorFilter;
      });
    }
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      activeNotams: active,
      incomingNotams: incoming,
      pastNotams: past,
      completedThisMonth: completedMonth,
      thisMonthCount: monthCount,
      filteredNotams: filtered,
    };
  }, [notams, statusFilter, jenisFilter, creatorFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [statusFilter, jenisFilter, creatorFilter]);

  const totalPages = Math.ceil(filteredNotams.length / itemsPerPage);
  const paginatedNotams = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotams.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotams, currentPage]);

  const handleDeleteNotam = (id, e) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteDialog.id) {
      await deleteNotam(deleteDialog.id);
    }
  };

  return (
    <>
      <div className="card" style={{ borderRadius: '8px' }}>
        <div className="tab-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Daftar NOTAM <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({filteredNotams.length} dokumen)</span>
          </h3>
          {user?.role === 'admin' && (
            <Link to="/admin/create-notam" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
              <Plus size={15} /> Buat NOTAM Baru
            </Link>
          )}
        </div>
        

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', width: '100%' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Semua Status"
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'active', label: 'Aktif (Terbit)' },
                { value: 'incoming', label: 'Incoming' },
                { value: 'past', label: 'Sudah Lewat' }
              ]}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <CustomSelect
              value={jenisFilter}
              onChange={setJenisFilter}
              placeholder="Semua Jenis NOTAM"
              options={[
                { value: 'all', label: 'Semua Jenis NOTAM' },
                { value: 'NOTAM New', label: 'New' },
                { value: 'NOTAM Replace', label: 'Replace' },
                { value: 'NOTAM Cancel', label: 'Cancel' },
                { value: 'Assessment Only', label: 'Assessment Only' }
              ]}
            />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
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

        {filteredNotams.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
            <p>Belum ada NOTAM pada kategori ini.</p>
          </div>
        ) : (
          <div className="table-wrapper">
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
                {paginatedNotams.map(notam => {
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
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedNotam(notam); }}
                          >
                            Lihat PDF
                          </button>
                          {user?.role === 'admin' && (
                            <>
                              <Link
                                to="/admin/create-notam"
                                state={{ notam: notam }}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Edit
                              </Link>
                              <button
                                className="btn"
                                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                onClick={(e) => handleDeleteNotam(notam.id, e)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredNotams.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>

      {selectedNotam && (
        <PdfViewerModal notam={selectedNotam} onClose={() => setSelectedNotam(null)} />
      )}
      <ConfirmModal 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Hapus NOTAM?"
        message="Apakah Anda yakin ingin menghapus dokumen NOTAM ini? Tindakan ini tidak dapat dibatalkan."
      />
    </>
  );
}
