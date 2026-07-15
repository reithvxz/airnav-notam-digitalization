import React, { forwardRef } from 'react';

// Constant: printable width in px that maps to A4 content area (210mm - 30mm margins = 180mm)
// At 96dpi, 180mm ≈ 680px. We use 680px to guarantee it fits inside html2canvas windowWidth of 700px.
const PAGE_WIDTH = 680;

const PdfTemplate = forwardRef(({ formData, user, formNo, docMode }, ref) => {
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

  /* ── shared styles ── */
  const border = '1px solid #9ca3af';

  const cellBase = {
    border,
    padding: '5px 10px',
    verticalAlign: 'top',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };

  const pageStyle = {
    width: `${PAGE_WIDTH}px`,
    backgroundColor: 'white',
    color: 'black',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '10pt',
    lineHeight: '1.4',
    boxSizing: 'border-box',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    border,
  };

  /* ── FORM 1 ── */
  const renderForm1 = () => {
    if (docMode === 'assessment') return null;
    return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/logo.png"
            alt="Logo AirNav"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
          />
          <div style={{ display: 'none', width: '50px', height: '50px', backgroundColor: '#e2e8f0', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '8px' }}>
            LOGO AirNav
          </div>
        </div>
        <div style={{ marginLeft: '10px' }}>
          <div style={{ margin: 0, fontSize: '11pt', fontWeight: 'bold' }}>AirNav Indonesia</div>
          <div style={{ margin: 0, fontSize: '10pt', fontWeight: 'bold' }}>SURABAYA</div>
        </div>
      </div>

      {/* Table */}
      <table style={tableStyle}>
        <colgroup>
          <col style={{ width: '50%' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <tbody>
          {/* Title */}
          <tr>
            <td colSpan={2} style={{ ...cellBase, padding: '10px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
              <strong style={{ fontSize: '11pt' }}>FORM PERMOHONAN PENERBITAN NOTAM</strong>
            </td>
          </tr>
          {/* Form No */}
          <tr>
            <td colSpan={2} style={cellBase}>
              Form no : {displayFormNo}
            </td>
          </tr>
          {/* Kepada / Pemohon */}
          <tr>
            <td style={{ ...cellBase, padding: 0 }}>
              <div style={{ padding: '5px 10px', borderBottom: border }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Kepada</div>
                <div>Kepala Unit Pia Wilayah Surabaya</div>
              </div>
              <div style={{ padding: '5px 10px' }}>
                <div style={{ marginTop: '5px' }}>cc. General Manager</div>
                <div>Pusat Informasi Aeronautika</div>
              </div>
            </td>
            <td style={cellBase}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Pemohon</div>
              <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '60px', padding: '2px 0', border: 'none', verticalAlign: 'top' }}>Nama</td>
                    <td style={{ padding: '2px 0', border: 'none', wordBreak: 'break-word' }}>: {formData.creatorName || user?.nama || 'IBNU HARGIYANTO'}</td>
                  </tr>
                  <tr>
                    <td style={{ width: '60px', padding: '2px 0', border: 'none', verticalAlign: 'top' }}>Jabatan</td>
                    <td style={{ padding: '2px 0', border: 'none', wordBreak: 'break-word' }}>: {formData.creatorJabatan || user?.jabatan || 'MANAGER OPERASI APP TWR 2'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          {/* Jenis NOTAM */}
          <tr>
            <td colSpan={2} style={{ ...cellBase, padding: '10px' }}>
              <div style={{ marginBottom: '5px' }}>Jenis NOTAM :</div>
              <div style={{ display: 'flex', gap: '20px', paddingLeft: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '14px', height: '14px', border, textAlign: 'center', lineHeight: '14px', marginRight: '6px', fontSize: '9px', flexShrink: 0 }}>
                    {formData.jenisNotam === 'NOTAM New' ? 'V' : ''}
                  </div>
                  NOTAM New
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '14px', height: '14px', border, textAlign: 'center', lineHeight: '14px', marginRight: '6px', fontSize: '9px', flexShrink: 0 }}>
                    {formData.jenisNotam === 'NOTAM Replace' ? 'V' : ''}
                  </div>
                  NOTAM Replace (Nomor)
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '14px', height: '14px', border, textAlign: 'center', lineHeight: '14px', marginRight: '6px', fontSize: '9px', flexShrink: 0 }}>
                    {formData.jenisNotam === 'NOTAM Cancel' ? 'V' : ''}
                  </div>
                  NOTAM Cancel
                </div>
              </div>
            </td>
          </tr>
          {/* Lokasi */}
          <tr>
            <td style={cellBase}>Lokasi</td>
            <td style={cellBase}>{formData.lokasi}</td>
          </tr>
          {/* Waktu Mulai */}
          <tr>
            <td style={cellBase}>Waktu Mulai Pelaksanaan</td>
            <td style={cellBase}>Tanggal : {formatDate(formData.waktuMulai)}</td>
          </tr>
          {/* Waktu Selesai */}
          <tr>
            <td style={cellBase}>Waktu Selesai Pelaksanaan</td>
            <td style={cellBase}>Tanggal : {formatDate(formData.waktuSelesai)}</td>
          </tr>
          {/* Jadwal Spesifik */}
          <tr>
            <td style={cellBase}>Jadwal Spesifik (jika ada)</td>
            <td style={{ ...cellBase, whiteSpace: 'pre-wrap' }}>{formData.jadwalSpesifik}</td>
          </tr>
          {/* Deskripsi */}
          <tr>
            <td colSpan={2} style={{ ...cellBase, padding: '10px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Deskripsi Informasi Notam :</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{formData.deskripsi}</div>
            </td>
          </tr>
          {/* Dokumen Pendukung */}
          <tr>
            <td colSpan={2} style={cellBase}>
              Dokumen Pendukung (jika ada)<br />
              {formData.dokumenPendukung}
            </td>
          </tr>
          {/* Tanda tangan */}
          <tr>
            <td style={{ ...cellBase, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Pemohon</div>
              {formData.creatorSignature || user?.tanda_tangan ? (
                <img 
                  src={`http://localhost:3000/signatures/${formData.creatorSignature || user?.tanda_tangan}`} 
                  alt="Tanda Tangan Pemohon" 
                  style={{ maxHeight: '60px', display: 'block', margin: '0 auto 10px' }} 
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{ height: '60px', marginBottom: '10px' }}></div>
              )}
              <div style={{ textDecoration: 'underline' }}>{formData.creatorName?.replace(' ', '') || user?.nama?.replace(' ', '') || 'IBNUHARGIYANTO'}</div>
              <div style={{ marginTop: '10px' }}>Tanggal : {todayStr}</div>
            </td>
            <td style={{ ...cellBase, padding: '10px', textAlign: 'center', verticalAlign: 'top' }}>
              <div style={{ fontWeight: 'bold' }}>Mengetahui INMC</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    );
  };

  /* ── FORM 2 (Operational Assessment) ── */
  const renderForm2 = () => {
    if (docMode !== 'assessment' && (formData.jenisNotam !== 'NOTAM New' || !formData.includeOpAssessment)) return null;

    return (
      <div style={{ ...pageStyle, pageBreakBefore: docMode === 'assessment' ? 'auto' : 'always', paddingTop: '10px' }}>
        <table style={tableStyle}>
          <tbody>
            {/* Title */}
            <tr>
              <td colSpan={2} style={{ ...cellBase, padding: '10px', textAlign: 'center' }}>
                <strong style={{ fontSize: '11pt' }}>OPERATIONAL ASSESMENT</strong>
                <div style={{ marginTop: '3px', fontWeight: 'bold', fontSize: '11pt' }}>{formData.namaKegiatan || 'KEGIATAN MILITARY EXERCISE DI WAR11 DAN WAR1'}</div>
                <div style={{ marginTop: '3px', fontWeight: 'bold', fontSize: '11pt' }}>NOMOR {nomorKegiatan}</div>
              </td>
            </tr>
            {/* Applicant */}
            <tr>
              <td colSpan={2} style={cellBase}>APPLICANT : AIRNAV SURABAYA</td>
            </tr>
            {/* Reff Letter */}
            <tr>
              <td colSpan={2} style={cellBase}>REFF. LETTER : {formData.reffLetter}</td>
            </tr>
            {/* Location */}
            <tr>
              <td colSpan={2} style={cellBase}>
                LOCATION :
                {formData.mapImage && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img src={formData.mapImage} alt="Map" style={{ maxWidth: '80%', maxHeight: '250px', objectFit: 'contain' }} />
                  </div>
                )}
              </td>
            </tr>
            {/* Altitude */}
            <tr>
              <td colSpan={2} style={cellBase}>ALTITUDE : {formData.altitude}</td>
            </tr>
            {/* Time */}
            <tr>
              <td colSpan={2} style={cellBase}>
                <div>TIME (UTC)</div>
                <table style={{ borderCollapse: 'collapse', border: 'none' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '80px', padding: '2px 0', border: 'none' }}>FROM</td>
                      <td style={{ padding: '2px 0', border: 'none' }}>: {formData.waktuMulai ? new Date(formData.waktuMulai).toISOString().substring(11, 16).replace(':', '.') : ''}</td>
                    </tr>
                    <tr>
                      <td style={{ width: '80px', padding: '2px 0', border: 'none' }}>TO</td>
                      <td style={{ padding: '2px 0', border: 'none' }}>: {formData.waktuSelesai ? new Date(formData.waktuSelesai).toISOString().substring(11, 16).replace(':', '.') : ''}</td>
                    </tr>
                    <tr>
                      <td style={{ width: '80px', padding: '2px 0', border: 'none' }}>SCHEDULE</td>
                      <td style={{ padding: '2px 0', border: 'none' }}>: {formData.waktuMulai ? new Date(formData.waktuMulai).getDate().toString().padStart(2, '0') : ''} - {formData.waktuSelesai ? new Date(formData.waktuSelesai).getDate().toString().padStart(2, '0') : ''} {formData.waktuMulai ? ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][new Date(formData.waktuMulai).getMonth()] : ''} {formData.waktuMulai ? new Date(formData.waktuMulai).getFullYear() : ''}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            {/* Operational Effect */}
            <tr>
              <td colSpan={2} style={cellBase}>
                <div style={{ fontWeight: 'bold' }}>OPERATIONAL EFFECT &amp; CONDITION :</div>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.operationalEffect}</div>
              </td>
            </tr>
            {/* Mitigation */}
            <tr>
              <td colSpan={2} style={cellBase}>
                <div style={{ fontWeight: 'bold' }}>MITIGATION :</div>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.mitigation}</div>
              </td>
            </tr>
            {/* Procedure */}
            <tr>
              <td colSpan={2} style={cellBase}>
                <div style={{ fontWeight: 'bold' }}>PROCEDURE &amp; CAPACITY :</div>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.procedureCapacity}</div>
              </td>
            </tr>
            {/* Mitigasi Operasional */}
            <tr>
              <td colSpan={2} style={cellBase}>
                <div style={{ fontWeight: 'bold' }}>MITIGASI OPERASIONAL :</div>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.mitigasiOperasional}</div>
              </td>
            </tr>
            {/* Conclusion */}
            <tr>
              <td colSpan={2} style={cellBase}>
                <div style={{ fontWeight: 'bold' }}>CONCLUSION :</div>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{formData.conclusion}</div>
              </td>
            </tr>
            {/* Signature Area */}
            <tr>
              <td style={{ ...cellBase, padding: '10px', textAlign: 'center', verticalAlign: 'bottom' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '40px' }}></div>
              </td>
              <td style={{ ...cellBase, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Surabaya, {todayStr}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Pemohon</div>
                {formData.creatorSignature || user?.tanda_tangan ? (
                  <img 
                    src={`http://localhost:3000/signatures/${formData.creatorSignature || user?.tanda_tangan}`} 
                    alt="Tanda Tangan Pemohon" 
                    style={{ maxHeight: '60px', display: 'block', margin: '0 auto 10px' }} 
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div style={{ height: '60px', marginBottom: '10px' }}></div>
                )}
                <div style={{ textDecoration: 'underline' }}>{formData.creatorName || user?.nama || 'IBNU HARGIYANTO'}</div>
                <div>{formData.creatorJabatan || user?.jabatan || 'MANAGER OPERASI APP TWR 2'}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div ref={ref} className="pdf-template-root" style={{
      width: `${PAGE_WIDTH + 40}px`,
      paddingRight: '40px',
      backgroundColor: 'white',
    }}>
      <style>{`
        .pdf-template-root,
        .pdf-template-root *,
        .pdf-template-root *::before,
        .pdf-template-root *::after {
          box-sizing: content-box !important;
        }
      `}</style>
      {renderForm1()}
      {renderForm2()}
    </div>
  );
});

export default PdfTemplate;
