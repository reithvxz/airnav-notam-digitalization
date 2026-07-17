import { forwardRef } from 'react';

const PAGE_WIDTH = 700; // sedikit diperlebar agar tidak nabrak

const s = {
  root: {
    width: PAGE_WIDTH,
    backgroundColor: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    color: '#000',
    padding: '30px 40px 40px 40px', // padding lebih rapi
    boxSizing: 'border-box', // pakai border-box agar padding aman
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 8,
  },
  logoImg: {
    width: 85,
    height: 'auto',
    objectFit: 'contain',
  },
  infoTable: {
    borderCollapse: 'collapse',
    width: '100%',
    marginBottom: 24,
  },
  infoTd: {
    border: '1.5px solid #000',
    padding: '6px 12px',
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 160,
    background: '#fff',
  },
  infoValue: {
    background: '#fff',
  },
  dateValue: {
    fontWeight: 'bold',
    color: '#c00',
  },
  checklistTable: {
    borderCollapse: 'collapse',
    width: '100%',
    marginBottom: 28,
  },
  th: {
    border: '1.5px solid #000',
    padding: '8px 10px',
    fontWeight: 'bold',
    textAlign: 'center',
    background: '#f5f5f5',
    fontSize: 11.5,
  },
  td: {
    border: '1.5px solid #000',
    padding: '7px 10px',
    verticalAlign: 'middle',
    fontSize: 11.5,
  },
  sigTable: {
    borderCollapse: 'collapse',
    width: '100%',
  },
  sigTh: {
    border: '1.5px solid #000',
    padding: '8px 10px',
    fontWeight: 'bold',
    textAlign: 'center',
    background: '#f5f5f5',
    fontSize: 11.5,
  },
  sigTd: {
    border: '1.5px solid #000',
    padding: '8px 10px',
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: 11.5,
  },
};

const BriefingTemplate = forwardRef(function BriefingTemplate({ briefing }, ref) {
  if (!briefing) return null;

  const { date, time, shift, checklistData = [], incomingManager, outgoingManager } = briefing;

  return (
    <div ref={ref} className="briefing-template-root" style={s.root}>
      <style>{`
        .briefing-template-root, .briefing-template-root * {
          box-sizing: border-box !important;
          font-family: Arial, Helvetica, sans-serif !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          white-space: pre-wrap !important;
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <div style={s.title}>PRE-SHIFT BRIEFING CHECKLIST</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <img src="/logo.png" alt="AirNav Indonesia" style={s.logoImg} />
          <div style={{ fontSize: 9.5, color: '#555', marginTop: 4, fontWeight: 'bold' }}>AirNav Indonesia</div>
        </div>
      </div>

      {/* ── INFO TABLE ─────────────────────────────────── */}
      <table style={s.infoTable}>
        <tbody>
          <tr>
            <td style={{ ...s.infoTd, ...s.infoLabel }}>DATE</td>
            <td style={{ ...s.infoTd, ...s.infoValue, ...s.dateValue }}>{date}</td>
          </tr>
          <tr>
            <td style={{ ...s.infoTd, ...s.infoLabel }}>TIME</td>
            <td style={{ ...s.infoTd, ...s.infoValue }}>{time}</td>
          </tr>
          <tr>
            <td style={{ ...s.infoTd, ...s.infoLabel }}>MANAGER ON DUTY</td>
            <td style={{ ...s.infoTd, ...s.infoValue, fontWeight: 'bold' }}>{incomingManager?.nama?.toUpperCase()}</td>
          </tr>
          <tr>
            <td style={{ ...s.infoTd, ...s.infoLabel }}>SHIFT</td>
            <td style={{ ...s.infoTd, ...s.infoValue }}>{shift}</td>
          </tr>
        </tbody>
      </table>

      {/* ── CHECKLIST TABLE ────────────────────────────── */}
      <table style={s.checklistTable}>
        <thead>
          <tr>
            <th style={{ ...s.th, width: '7%' }}>NO.</th>
            <th style={{ ...s.th, width: '28%' }}>SUBJECT</th>
            <th style={{ ...s.th, width: '45%' }}>DETAILS</th>
            <th style={{ ...s.th, width: '20%' }}>CHECKED/ REMARKS</th>
          </tr>
        </thead>
        <tbody>
          {checklistData.map((item, index) => {
            const isNoText = String(item.no).includes('.');
            return (
              <tr key={index}>
                <td style={{ ...s.td, textAlign: 'center', fontWeight: 'bold' }}>{item.no}.</td>
                <td style={{ ...s.td, fontWeight: 'bold', textTransform: 'capitalize' }}>{item.subject}</td>
                <td style={{ ...s.td, fontSize: 11, color: '#222', lineHeight: '1.3' }}>{item.details}</td>
                <td style={{ ...s.td, textAlign: 'center', fontWeight: 'bold' }}>
                  {item.checked === true ? 'V' : (item.remarks || '')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── SIGNATURE TABLE ────────────────────────────── */}
      <table style={s.sigTable}>
        <thead>
          <tr>
            <th style={{ ...s.sigTh, width: '25%' }}>ROLE</th>
            <th style={{ ...s.sigTh, width: '25%' }}>NAME</th>
            <th style={{ ...s.sigTh, width: '15%' }}>INITIAL</th>
            <th style={{ ...s.sigTh, width: '20%' }}>SIGNATURE</th>
            <th style={{ ...s.sigTh, width: '15%' }}>TIME</th>
          </tr>
        </thead>
        <tbody>
          {/* Incoming Manager */}
          <tr>
            <td style={{ ...s.sigTd, textAlign: 'left', fontStyle: 'italic', fontWeight: 'bold' }}>Incoming Manager</td>
            <td style={s.sigTd}>{incomingManager?.nama}</td>
            <td style={s.sigTd}>{incomingManager?.initial}</td>
            <td style={{ ...s.sigTd, height: 70, padding: '4px' }}>
              {incomingManager?.ttd && (
                <img
                  src={`http://localhost:3000/signatures/${incomingManager.ttd}`}
                  alt="TTD"
                  style={{ maxHeight: 65, maxWidth: '100%', objectFit: 'contain' }}
                />
              )}
            </td>
            <td style={s.sigTd}>{incomingManager?.time}</td>
          </tr>
          {/* Outgoing Manager */}
          <tr>
            <td style={{ ...s.sigTd, textAlign: 'left', fontStyle: 'italic', fontWeight: 'bold' }}>Outgoing Manager</td>
            <td style={s.sigTd}>{outgoingManager?.nama}</td>
            <td style={s.sigTd}>{outgoingManager?.initial}</td>
            <td style={{ ...s.sigTd, height: 70, padding: '4px' }}>
              {outgoingManager?.ttd && (
                <img
                  src={`http://localhost:3000/signatures/${outgoingManager.ttd}`}
                  alt="TTD"
                  style={{ maxHeight: 65, maxWidth: '100%', objectFit: 'contain' }}
                />
              )}
            </td>
            <td style={s.sigTd}>{outgoingManager?.time}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default BriefingTemplate;
export { PAGE_WIDTH };
