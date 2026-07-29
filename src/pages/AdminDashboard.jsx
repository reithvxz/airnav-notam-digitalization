import { useState, useMemo, useEffect } from 'react';
import { useNotams } from '../context/NotamContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CalendarView from '../components/CalendarView';

import OverviewTab from './tabs/OverviewTab';
import NotamTab from './tabs/NotamTab';
import BriefingTab from './tabs/BriefingTab';
import PostShiftTab from './tabs/PostShiftTab';
import PredutyTab from './tabs/PredutyTab';

export default function AdminDashboard({ defaultTab = 'overview' }) {
  const { notams, deleteNotam } = useNotams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState(defaultTab);
  const [overviewMode, setOverviewMode] = useState('notam');
  const [initialStatusFilter, setInitialStatusFilter] = useState('all');
  
  useEffect(() => {
    setMainTab(defaultTab);
    if (defaultTab === 'notam' && location.state?.statusFilter) {
      setInitialStatusFilter(location.state.statusFilter);
    }
  }, [defaultTab, location.state]);

  const [briefings, setBriefings] = useState([]);
  const [postshifts, setPostshifts] = useState([]);
  const [preduties, setPreduties] = useState([]);
  const [events, setEvents] = useState([]);
  
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [selectedPostShift, setSelectedPostShift] = useState(null);
  const [selectedPreduty, setSelectedPreduty] = useState(null);
  const [selectedNotam, setSelectedNotam] = useState(null);

  const { incomingOptions, outgoingOptions } = useMemo(() => {
    const allManagers = new Map();
    [...briefings, ...postshifts].forEach(item => {
      if (item.incomingManager) allManagers.set(item.incomingManager.initial, item.incomingManager.nama);
      if (item.outgoingManager) allManagers.set(item.outgoingManager.initial, item.outgoingManager.nama);
    });
    
    const managerOpts = Array.from(allManagers.entries())
      .filter(([initial, nama]) => !nama.toLowerCase().includes('employee') && !nama.toLowerCase().includes('karyawan'))
      .map(([initial, nama]) => ({ value: initial, label: `${nama} (${initial})` }));

    return {
      incomingOptions: [{ value: 'all', label: 'Semua Incoming Manager' }, ...managerOpts],
      outgoingOptions: [{ value: 'all', label: 'Semua Outgoing Manager' }, ...managerOpts]
    };
  }, [briefings, postshifts]);

  useEffect(() => {
    if (mainTab === 'briefing' || mainTab === 'overview') {
      fetch('http://localhost:3000/api/briefings')
        .then(r => r.json())
        .then(data => setBriefings(Array.isArray(data) ? data : []))
        .catch(() => setBriefings([]));
    }
    if (mainTab === 'postshift' || mainTab === 'overview') {
      fetch('http://localhost:3000/api/postshifts')
        .then(r => r.json())
        .then(data => setPostshifts(Array.isArray(data) ? data : []))
        .catch(() => setPostshifts([]));
    }
    if (mainTab === 'overview' || mainTab === 'preduty') {
      fetch('http://localhost:3000/api/preduties')
        .then(r => r.json())
        .then(data => setPreduties(Array.isArray(data) ? data : []))
        .catch(() => setPreduties([]));
    }
    
    // Always fetch events for the Upcoming Events widget in notam tab, or for calendar tab
    fetch('http://localhost:3000/api/events')
      .then(r => r.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, [mainTab]);

  const handleDeleteBriefing = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Hapus briefing ini?')) return;
    await fetch(`http://localhost:3000/api/briefings/${id}`, { method: 'DELETE' });
    setBriefings(prev => prev.filter(b => b.id !== id));
  };

  const handleDeletePostShift = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Hapus post-shift ini?')) return;
    await fetch(`http://localhost:3000/api/postshifts/${id}`, { method: 'DELETE' });
    setPostshifts(prev => prev.filter(p => p.id !== id));
  };

  const handleDeletePreduty = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Hapus preduty briefing ini?')) return;
    await fetch(`http://localhost:3000/api/preduties/${id}`, { method: 'DELETE' });
    setPreduties(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'block', borderRadius: '12px', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', color: '#1e3a8a', margin: '0 0 0.5rem 0' }}>
            {mainTab === 'overview' && 'Overview'}
            {mainTab === 'notam' && 'NOTAM'}
            {mainTab === 'briefing' && 'Pre-Shift'}
            {mainTab === 'postshift' && 'Post-Shift'}
            {mainTab === 'preduty' && 'Preduty'}
            {mainTab === 'calendar' && 'Calendar'}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.95rem', color: '#3b82f6', margin: 0, fontWeight: 500 }}>
            {mainTab === 'overview' && 'Ringkasan seluruh data operasional AirNav cabang Surabaya.'}
            {mainTab === 'notam' && 'Manajemen dan daftar penerbitan dokumen NOTAM.'}
            {mainTab === 'briefing' && 'Checklist persiapan sebelum pergantian shift dimulai.'}
            {mainTab === 'postshift' && 'Review operasional sesudah shift selesai.'}
            {mainTab === 'preduty' && 'Persiapan awal operasional sebelum bertugas.'}
            {mainTab === 'calendar' && 'Jadwal dan agenda operasional.'}
          </p>
        </div>
      </div>

      {mainTab === 'overview' && (
        <OverviewTab
          overviewMode={overviewMode}
          setOverviewMode={setOverviewMode}
          notams={notams}
          briefings={briefings}
          postshifts={postshifts}
          preduties={preduties}
          events={events}
        />
      )}

      {mainTab === 'notam' && (
        <NotamTab
          notams={notams}
          deleteNotam={deleteNotam}
          selectedNotam={selectedNotam}
          setSelectedNotam={setSelectedNotam}
          initialStatusFilter={initialStatusFilter}
        />
      )}

      {mainTab === 'briefing' && (
        <BriefingTab
          briefings={briefings}
          incomingOptions={incomingOptions}
          outgoingOptions={outgoingOptions}
          selectedBriefing={selectedBriefing}
          setSelectedBriefing={setSelectedBriefing}
          onDelete={handleDeleteBriefing}
        />
      )}

      {mainTab === 'postshift' && (
        <PostShiftTab
          postshifts={postshifts}
          incomingOptions={incomingOptions}
          outgoingOptions={outgoingOptions}
          selectedPostShift={selectedPostShift}
          setSelectedPostShift={setSelectedPostShift}
          onDelete={handleDeletePostShift}
        />
      )}

      {mainTab === 'preduty' && (
        <PredutyTab
          preduties={preduties}
          selectedPreduty={selectedPreduty}
          setSelectedPreduty={setSelectedPreduty}
          onDelete={handleDeletePreduty}
        />
      )}

      {mainTab === 'calendar' && (
        <CalendarView />
      )}

    </div>
  );
}
