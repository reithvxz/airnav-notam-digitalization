import { forwardRef } from 'react';

function formatDateID(dateStr) {
  if (!dateStr) return '';
  const months = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  
  const d = new Date(dateStr);
  const dayName = days[d.getDay()];
  const [year, month, day] = dateStr.split('-');
  return `${dayName}, ${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

const s = {
  root: {
    width: '100%',
    backgroundColor: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    color: '#000',
    boxSizing: 'border-box'
  },
  coverPage: {
    height: 990, // Approximate A4 ratio
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    boxSizing: 'border-box',
    pageBreakAfter: 'always',
  },
  contentPage: {
    padding: '40px',
    boxSizing: 'border-box',
    pageBreakAfter: 'always',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#000',
    color: 'white',
    padding: '8px 12px',
    marginTop: 20,
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 20,
    tableLayout: 'fixed',
    boxSizing: 'border-box'
  },
  td: {
    border: '1px solid #cbd5e1',
    padding: '12px 15px',
    fontSize: 13,
    color: '#1e293b',
    boxSizing: 'border-box'
  },
  imageContainer: {
    width: '100%',
    textAlign: 'center',
    border: '1px dashed #ccc',
    padding: 10,
    marginBottom: 10,
    minHeight: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    maxWidth: '100%',
    maxHeight: 250,
    objectFit: 'contain',
    border: '1px solid #ccc',
    padding: 5,
    borderRadius: 4
  }
};

const PredutyTemplate = forwardRef(function PredutyTemplate({ preduty }, ref) {
  if (!preduty) return null;

  const {
    date,
    shift,
    managerOnDutyInfo, // { nama, jabatan } parsed from JSON or passed from component
    personelImage,
    fasilitasData, // array of items: { subject, status, remarks }
    notamText,
    trafficImage,
    weatherImage,
    othersData, // array of { title, image }
    reminderText,
    instructionText
  } = preduty;

  const mNama = managerOnDutyInfo?.nama || 'NAMA MANAGER';
  const mJabatan = managerOnDutyInfo?.jabatan || 'MANAGER OPERASI';

  // Helper for Header
  const ContentHeader = () => (
    <div style={s.header}>
      <img src="/logo.png" alt="AirNav" style={{ width: 65, objectFit: 'contain' }} />
      <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#000' }}>
        AirNav Indonesia - Preduty Briefing Cabang Surabaya
      </div>
      <div style={{ width: 65 }}></div> {/* Spacer for balance */}
    </div>
  );

  return (
    <div ref={ref} className="preduty-template-root" style={s.root}>
      <style>{`
        .preduty-template-root, .preduty-template-root * {
          box-sizing: border-box !important;
          font-family: Arial, Helvetica, sans-serif !important;
          white-space: pre-wrap;
        }
        @media print {
          .page-break { page-break-after: always; }
        }
      `}</style>

      {/* ── COVER PAGE ─────────────────────────────────── */}
      <div style={s.coverPage} className="page-break">
        <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 15, color: '#0f172a' }}>PREDUTY BRIEFING</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 25, color: '#334155' }}>DINAS {shift.toUpperCase()}</div>
        <div style={{ fontSize: 20, marginBottom: 60, color: '#475569', fontWeight: 600 }}>
          {formatDateID(date)}
        </div>
        
        <img src="/logo.png" alt="Logo" style={{ width: 180, marginBottom: 70 }} />
        
        <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 5 }}>{mJabatan.toUpperCase()} ON DUTY</div>
        <div style={{ fontSize: 24, fontWeight: 900, textDecoration: 'underline', marginBottom: 60, color: '#000' }}>
          {mNama.toUpperCase()}
        </div>
        
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>CABANG SURABAYA</div>
        <div style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#000' }}>
          PERUM LEMBAGA PENYELENGGARA PELAYANAN NAVIGASI PENERBANGAN INDONESIA
        </div>
      </div>

      {/* ── CONTENT PAGE ─────────────────────────────────── */}
      <div className="page-break"></div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', boxSizing: 'border-box' }}>
        <thead style={{ display: 'table-header-group' }}>
          <tr>
            <th>
              <ContentHeader />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0', verticalAlign: 'top' }}>
              
              {/* Personel */}
              <div style={{ pageBreakInside: 'avoid' }}>
                <div style={{ ...s.sectionTitle, marginTop: 0 }}>1. KESIAPAN PERSONEL</div>
                <div style={s.imageContainer}>
                  {personelImage ? <img src={personelImage} style={s.image} /> : 'Tidak ada gambar personel'}
                </div>
              </div>

              {/* Fasilitas */}
              <div style={s.sectionTitle}>2. STATUS FASILITAS</div>
              <table style={s.table}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ ...s.td, width: '25%' }}>Fasilitas</th>
                    <th style={{ ...s.td, width: '15%' }}>Status</th>
                    <th style={{ ...s.td, width: '60%' }}>Keterangan / Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(fasilitasData || []).map((f, i) => (
                    <tr key={i}>
                      <td style={{ ...s.td, fontWeight: 'bold' }}>{f.subject}</td>
                      <td style={{ ...s.td, color: f.status === 'NORMAL' ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>{f.status}</td>
                      <td style={{ ...s.td, wordWrap: 'break-word', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{f.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* NOTAM */}
              <div style={{ pageBreakInside: 'avoid' }}>
                <div style={s.sectionTitle}>3. NOTAM SUMMARY</div>
                <div style={{ border: '1px solid #ccc', padding: 12, minHeight: 80, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {notamText || 'Tidak ada catatan NOTAM'}
                </div>
              </div>

              {/* Prediksi Traffic */}
              <div style={{ pageBreakInside: 'avoid' }}>
                <div style={s.sectionTitle}>4. PREDIKSI TRAFFIC</div>
                <div style={s.imageContainer}>
                  {trafficImage ? <img src={trafficImage} style={s.image} /> : 'Tidak ada gambar prediksi traffic'}
                </div>
              </div>

              {/* Prediksi Cuaca */}
              <div style={{ pageBreakInside: 'avoid' }}>
                <div style={s.sectionTitle}>5. PREDIKSI CUACA</div>
                <div style={s.imageContainer}>
                  {weatherImage ? <img src={weatherImage} style={s.image} /> : 'Tidak ada gambar prediksi cuaca'}
                </div>
              </div>

              {/* Others (Add+) */}
              {(othersData || []).map((item, idx) => (
                <div key={idx} style={{ pageBreakInside: 'avoid' }}>
                  <div style={s.sectionTitle}>{5 + idx + 1}. {item.title?.toUpperCase() || 'OTHERS'}</div>
                  <div style={s.imageContainer}>
                    {item.image ? <img src={item.image} style={s.image} /> : 'Tidak ada gambar'}
                  </div>
                </div>
              ))}

              {/* Reminder */}
              <div style={{ pageBreakInside: 'avoid' }}>
                <div style={s.sectionTitle}>REMINDER / CATATAN PENTING</div>
                <div style={{ border: '1px solid #ccc', padding: 12, minHeight: 80, marginBottom: 20, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {reminderText || '-'}
                </div>
              </div>

              {/* Instruksi Direktur Operasi */}
              <div style={{ pageBreakInside: 'avoid' }}>
                <div style={s.sectionTitle}>INSTRUKSI DIREKTUR OPERASI</div>
                <div style={{ border: '1px solid #ccc', padding: 12, minHeight: 80, marginBottom: 50, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {instructionText || '-'}
                </div>
              </div>

              {/* Closing words */}
              <div style={{ marginTop: 60, textAlign: 'center', padding: 30, background: '#f8fafc', borderRadius: 8, border: '2px dashed #000', pageBreakInside: 'avoid', boxSizing: 'border-box' }}>
                <h2 style={{ color: '#000', margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>TETAP SEMANGAT DAN JAGA KESELAMATAN PENERBANGAN.</h2>
                <h2 style={{ color: '#000', margin: '10px 0 0 0', fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>TERIMA KASIH</h2>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default PredutyTemplate;
