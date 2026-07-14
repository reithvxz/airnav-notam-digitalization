import React, { forwardRef } from 'react';

const PdfTemplate = forwardRef(({ formData, user, formNo }, ref) => {
  const today = new Date();
  const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][today.getMonth()];
  const displayFormNo = formNo || `01/${monthRoman}/${today.getFullYear()}`;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()} Pukul : ${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')} UTC`;
  };

  const todayStr = `${today.getDate().toString().padStart(2, '0')} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()]} ${today.getFullYear()}`;

  // Generate Nomor Kegiatan format: DDMMYYYY/SURABAYA/XX
  const dd = today.getDate().toString().padStart(2, '0');
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = today.getFullYear();
  const seqNumber = displayFormNo.split('/')[0];
  const nomorKegiatan = `${dd}${mm}${yyyy}/SURABAYA/${seqNumber}`;

  const borderStyle = '1px solid #9ca3af';

  return (
    <div ref={ref} style={{
      width: '800px',
      padding: '10px', // Prevent border clipping by html2canvas
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      boxSizing: 'border-box'
    }}>
      {/* FORM 1 */}
      <div>
        {/* Header - Moved to top left, smaller logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Logo AirNav" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
            <div style={{ display: 'none', width: '50px', height: '50px', backgroundColor: '#e2e8f0', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '8px' }}>
              LOGO AirNav
            </div>
          </div>
          <div style={{ marginLeft: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '11pt', fontWeight: 'bold' }}>AirNav Indonesia</h2>
            <h3 style={{ margin: 0, fontSize: '10pt', fontWeight: 'bold' }}>SURABAYA</h3>
          </div>
        </div>

        <table style={{ width: '99%', margin: '0 auto', borderCollapse: 'collapse', border: borderStyle, tableLayout: 'fixed' }}>
          <tbody>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td colSpan={2} style={{ border: borderStyle, padding: '10px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                <h2 style={{ margin: 0, fontSize: '11pt', fontWeight: 'bold' }}>FORM PERMOHONAN PENERBITAN NOTAM</h2>
              </td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                Form no : {displayFormNo}
              </td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td style={{ border: borderStyle, padding: '0', width: '50%', verticalAlign: 'top' }}>
                <div style={{ padding: '5px 10px', borderBottom: borderStyle }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Kepada</div>
                  <div>Kepala Unit Pia Wilayah Surabaya</div>
                </div>
                <div style={{ padding: '5px 10px' }}>
                  <div style={{ marginTop: '5px', fontWeight: 'normal' }}>cc. General Manager</div>
                  <div>Pusat Informasi Aeronautika</div>
                </div>
              </td>
              <td style={{ border: borderStyle, padding: '5px 10px', width: '50%', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Pemohon</div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '60px' }}>Nama</div>
                  <div>: {user?.name || 'IBNU HARGIYANTO'}</div>
                </div>
                <div style={{ display: 'flex', marginTop: '5px' }}>
                  <div style={{ width: '60px' }}>Jabatan</div>
                  <div>: {user?.jabatan || 'MANAGER OPERASI APP TWR 2'}</div>
                </div>
              </td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td colSpan={2} style={{ border: borderStyle, padding: '10px' }}>
                <div style={{ marginBottom: '5px' }}>Jenis NOTAM :</div>
                <div style={{ display: 'flex', gap: '30px', paddingLeft: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', border: borderStyle, textAlign: 'center', lineHeight: '16px', marginRight: '8px', fontSize: '10px' }}>
                      {formData.jenisNotam === 'NOTAM New' ? 'V' : ''}
                    </div>
                    NOTAM New
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', border: borderStyle, textAlign: 'center', lineHeight: '16px', marginRight: '8px', fontSize: '10px' }}>
                      {formData.jenisNotam === 'NOTAM Replace' ? 'V' : ''}
                    </div>
                    NOTAM Replace (Nomor)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', border: borderStyle, textAlign: 'center', lineHeight: '16px', marginRight: '8px', fontSize: '10px' }}>
                      {formData.jenisNotam === 'NOTAM Cancel' ? 'V' : ''}
                    </div>
                    NOTAM Cancel
                  </div>
                </div>
              </td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td style={{ border: borderStyle, padding: '5px 10px' }}>Lokasi</td>
              <td style={{ border: borderStyle, padding: '5px 10px' }}>{formData.lokasi}</td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td style={{ border: borderStyle, padding: '5px 10px' }}>Waktu Mulai Pelaksanaan</td>
              <td style={{ border: borderStyle, padding: '5px 10px' }}>Tanggal : {formatDate(formData.waktuMulai)}</td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td style={{ border: borderStyle, padding: '5px 10px' }}>Waktu Selesai Pelaksanaan</td>
              <td style={{ border: borderStyle, padding: '5px 10px' }}>Tanggal : {formatDate(formData.waktuSelesai)}</td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td style={{ border: borderStyle, padding: '5px 10px' }}>Jadwal Spesifik (jika ada)</td>
              <td style={{ border: borderStyle, padding: '5px 10px', whiteSpace: 'pre-wrap' }}>{formData.jadwalSpesifik}</td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td colSpan={2} style={{ border: borderStyle, padding: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Deskripsi Informasi Notam :</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{formData.deskripsi}</div>
              </td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                Dokumen Pendukung (jika ada)<br/>
                {formData.dokumenPendukung}
              </td>
            </tr>
            <tr style={{ pageBreakInside: 'avoid' }}>
              <td style={{ border: borderStyle, padding: '10px', textAlign: 'center', width: '50%' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '40px' }}>Pemohon</div>
                <div style={{ textDecoration: 'underline' }}>{user?.name?.replace(' ', '') || 'IBNUHARGIYANTO'}</div>
                <div style={{ marginTop: '10px' }}>Tanggal : {todayStr}</div>
              </td>
              <td style={{ border: borderStyle, padding: '10px', textAlign: 'center', width: '50%', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 'bold' }}>Mengetahui INMC</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FORM 2 */}
      {formData.jenisNotam === 'NOTAM New' && (
        <div style={{ pageBreakBefore: 'always', paddingTop: '10px' }}>
          <table style={{ width: '99%', margin: '0 auto', borderCollapse: 'collapse', border: borderStyle, tableLayout: 'fixed' }}>
            <tbody>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '10px', textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '11pt', fontWeight: 'bold' }}>OPERATIONAL ASSESMENT</h2>
                  <h2 style={{ margin: 0, marginTop: '3px', fontSize: '11pt', fontWeight: 'bold' }}>{formData.namaKegiatan || 'KEGIATAN MILITARY EXERCISE DI WAR11 DAN WAR1'}</h2>
                  <h2 style={{ margin: 0, marginTop: '3px', fontSize: '11pt', fontWeight: 'bold' }}>NOMOR {nomorKegiatan}</h2>
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  APPLICANT : AIRNAV SURABAYA
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  REFF. LETTER : {formData.reffLetter}
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  LOCATION :
                  {formData.mapImage && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <img src={formData.mapImage} alt="Map" style={{ maxWidth: '80%', maxHeight: '250px', objectFit: 'contain' }} />
                    </div>
                  )}
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  ALTITUDE : {formData.altitude}
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  <div>TIME (UTC)</div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '100px' }}>FROM</div>
                    <div>: {formData.waktuMulai ? new Date(formData.waktuMulai).toISOString().substring(11, 16).replace(':', '.') : ''}</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '100px' }}>TO</div>
                    <div>: {formData.waktuSelesai ? new Date(formData.waktuSelesai).toISOString().substring(11, 16).replace(':', '.') : ''}</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '100px' }}>SCHEDULE</div>
                    <div>: {formData.waktuMulai ? new Date(formData.waktuMulai).getDate().toString().padStart(2, '0') : ''} - {formData.waktuSelesai ? new Date(formData.waktuSelesai).getDate().toString().padStart(2, '0') : ''} {formData.waktuMulai ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][new Date(formData.waktuMulai).getMonth()] : ''} {formData.waktuMulai ? new Date(formData.waktuMulai).getFullYear() : ''}</div>
                  </div>
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  <div style={{ fontWeight: 'bold' }}>OPERATIONAL EFFECT & CONDITION :</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.operationalEffect}</div>
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  <div style={{ fontWeight: 'bold' }}>MITIGATION :</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.mitigation}</div>
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  <div style={{ fontWeight: 'bold' }}>PROCEDURE & CAPACITY :</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.procedureCapacity}</div>
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  <div style={{ fontWeight: 'bold' }}>MITIGASI OPERASIONAL :</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.mitigasiOperasional}</div>
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '5px 10px' }}>
                  <div style={{ fontWeight: 'bold' }}>CONCLUSION :</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.conclusion}</div>
                </td>
              </tr>
              <tr style={{ pageBreakInside: 'avoid' }}>
                <td colSpan={2} style={{ border: borderStyle, padding: '10px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '15px' }}>ATS UNIT INVOLVED :</div>
                  <div>{user?.jabatan?.split('APP')[0] || 'Manager Operasi Surabaya'}</div>
                  <div style={{ height: '40px' }}></div>
                  <div style={{ textDecoration: 'underline' }}>{user?.name || 'IBNU HARGIYANTO'}</div>
                  <div>{user?.jabatan || 'Manager Operasi APP TWR 2'}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default PdfTemplate;
