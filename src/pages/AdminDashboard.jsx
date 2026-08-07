import { useState, useMemo, useEffect } from 'react';
import { useNotams } from '../context/NotamContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CalendarView from '../components/CalendarView';
import ConfirmModal from '../components/ConfirmModal';

import OverviewTab from './tabs/OverviewTab';
import NotamTab from './tabs/NotamTab';
import BriefingTab from './tabs/BriefingTab';
import PostShiftTab from './tabs/PostShiftTab';
import PredutyTab from './tabs/PredutyTab';

export default function AdminDashboard({ defaultTab = 'overview' }) {
  const { notams, deleteNotam, fetchNotams } = useNotams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState(defaultTab);
  const [overviewMode, setOverviewMode] = useState('notam');
  const [initialStatusFilter, setInitialStatusFilter] = useState('all');
  
  useEffect(() => {
    if (location.state?.tab) {
      setMainTab(location.state.tab);
    } else {
      setMainTab(defaultTab);
    }
    
    if (defaultTab === 'notam' && location.state?.statusFilter) {
      setInitialStatusFilter(location.state.statusFilter);
    }
  }, [defaultTab, location.state, location.pathname, navigate]);

  const [briefings, setBriefings] = useState([]);
  const [postshifts, setPostshifts] = useState([]);
  const [preduties, setPreduties] = useState([]);
  const [events, setEvents] = useState([]);
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, type: null, id: null });
  
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
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/briefings`)
        .then(r => r.ok ? r.json() : Promise.reject('Not OK'))
        .then(data => { if (Array.isArray(data)) setBriefings(data); })
        .catch(err => console.error('Failed to fetch briefings', err));
    }
    if (mainTab === 'postshift' || mainTab === 'overview') {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/postshifts`)
        .then(r => r.ok ? r.json() : Promise.reject('Not OK'))
        .then(data => { if (Array.isArray(data)) setPostshifts(data); })
        .catch(err => console.error('Failed to fetch postshifts', err));
    }
    if (mainTab === 'overview' || mainTab === 'preduty') {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/preduties`)
        .then(r => r.ok ? r.json() : Promise.reject('Not OK'))
        .then(data => { if (Array.isArray(data)) setPreduties(data); })
        .catch(err => console.error('Failed to fetch preduties', err));
    }
    
    // Always fetch events for the Upcoming Events widget in notam tab, or for calendar tab
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/events`)
      .then(r => r.ok ? r.json() : Promise.reject('Not OK'))
      .then(data => { if (Array.isArray(data)) setEvents(data); })
      .catch(err => console.error('Failed to fetch events', err));

    if ((mainTab === 'notam' || mainTab === 'overview') && fetchNotams) {
      fetchNotams();
    }
  }, [mainTab, fetchNotams]);

  const handleDeleteBriefing = (id, e) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, type: 'briefing', id });
  };

  const handleDeletePostShift = (id, e) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, type: 'postshift', id });
  };

  const handleDeletePreduty = (id, e) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, type: 'preduty', id });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteDialog;
    
    if (type === 'briefing') {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/briefings/${id}`, { method: 'DELETE' });
      setBriefings(prev => prev.filter(b => b.id !== id));
    } else if (type === 'postshift') {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/postshifts/${id}`, { method: 'DELETE' });
      setPostshifts(prev => prev.filter(p => p.id !== id));
    } else if (type === 'preduty') {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/preduties/${id}`, { method: 'DELETE' });
      setPreduties(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {mainTab === 'overview' && 'Overview'}
            {mainTab === 'notam' && 'NOTAM'}
            {mainTab === 'briefing' && 'Pre-Shift'}
            {mainTab === 'postshift' && 'Post-Shift'}
            {mainTab === 'preduty' && 'Preduty'}
            {mainTab === 'calendar' && 'Calendar'}
          </h1>
          <p className="page-subtitle">
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

      <ConfirmModal 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: null, id: null })}
        onConfirm={confirmDelete}
        title={`Hapus ${deleteDialog.type === 'briefing' ? 'Pre-Shift' : deleteDialog.type === 'postshift' ? 'Post-Shift' : 'Preduty'}?`}
        message={`Apakah Anda yakin ingin menghapus data ${deleteDialog.type === 'briefing' ? 'Pre-Shift' : deleteDialog.type === 'postshift' ? 'Post-Shift' : 'Preduty'} ini? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
