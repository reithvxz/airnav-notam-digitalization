import NotamAnalytics from '../../components/dashboard/NotamAnalytics';
import ShiftAnalytics from '../../components/dashboard/ShiftAnalytics';
import PredutyAnalytics from '../../components/dashboard/PredutyAnalytics';

export default function OverviewTab({ overviewMode, setOverviewMode, notams, briefings, postshifts, preduties, events }) {
  return (
    <>
      {/* Toggle Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setOverviewMode('notam')}
            style={{ padding: '0.6rem 2rem', borderRadius: '6px', border: 'none', background: overviewMode === 'notam' ? 'white' : 'transparent', color: overviewMode === 'notam' ? '#1e3a8a' : '#64748b', fontWeight: overviewMode === 'notam' ? 700 : 500, cursor: 'pointer', boxShadow: overviewMode === 'notam' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', fontSize: '0.95rem' }}
          >
            NOTAM
          </button>
          <button 
            onClick={() => setOverviewMode('shift')}
            style={{ padding: '0.6rem 2rem', borderRadius: '6px', border: 'none', background: overviewMode === 'shift' ? 'white' : 'transparent', color: overviewMode === 'shift' ? '#1e3a8a' : '#64748b', fontWeight: overviewMode === 'shift' ? 700 : 500, cursor: 'pointer', boxShadow: overviewMode === 'shift' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', fontSize: '0.95rem' }}
          >
            Pre-Shift & Post-Shift
          </button>
          <button 
            onClick={() => setOverviewMode('preduty')}
            style={{ padding: '0.6rem 2rem', borderRadius: '6px', border: 'none', background: overviewMode === 'preduty' ? 'white' : 'transparent', color: overviewMode === 'preduty' ? '#1e3a8a' : '#64748b', fontWeight: overviewMode === 'preduty' ? 700 : 500, cursor: 'pointer', boxShadow: overviewMode === 'preduty' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', fontSize: '0.95rem' }}
          >
            Preduty
          </button>
        </div>
      </div>

      {overviewMode === 'notam' ? (
        <NotamAnalytics notams={notams} />
      ) : overviewMode === 'shift' ? (
        <ShiftAnalytics briefings={briefings} postshifts={postshifts} />
      ) : (
        <PredutyAnalytics preduties={preduties} />
      )}
    </>
  );
}
