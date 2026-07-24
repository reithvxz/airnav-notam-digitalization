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
                  {briefings.map(b => (
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
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedBriefing(b); }}
                        >
                          Lihat PDF
                        </button>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                          onClick={(e) => handleDeleteBriefing(b.id, e)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  {postshifts.map(p => (
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
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                          onClick={(e) => { e.stopPropagation(); setSelectedPostShift(p); }}
                        >
                          Lihat PDF
                        </button>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                          onClick={(e) => handleDeletePostShift(p.id, e)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
