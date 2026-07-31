import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomPickers';
import ShiftStats from '../../components/dashboard/ShiftStats';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import PredutyTemplate from '../../components/PredutyTemplate';
import { useAuth } from '../../context/AuthContext';

export default function PredutyTab({ preduties, selectedPreduty, setSelectedPreduty, onDelete }) {
  const { user } = useAuth();
  const [predutyShiftFilter, setPredutyShiftFilter] = useState('all');

  const filteredPreduties = useMemo(() => {
    return preduties.filter(p => {
      return predutyShiftFilter === 'all' || p.shift === predutyShiftFilter;
    });
  }, [preduties, predutyShiftFilter]);

  return (
    <>
      <ShiftStats data={preduties} />
      <div className="card" style={{ borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
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
        </div>

        {preduties.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
            <p>Belum ada Preduty Briefing Checklist.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Tanggal</th>
                  <th style={{ textAlign: 'center' }}>Waktu</th>
                  <th style={{ textAlign: 'center' }}>Shift</th>
                  <th style={{ textAlign: 'center' }}>Manager/Supervisor</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPreduties.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPreduty(p)}>
                    <td style={{ fontWeight: 600 }}>{p.date}</td>
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
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedPreduty(p); }}
                        >
                          Lihat PDF
                        </button>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/create-preduty"
                            state={{ preduty: p }}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
