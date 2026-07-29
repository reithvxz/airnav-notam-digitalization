import { useState, useMemo, useEffect } from 'react';
import { useNotams } from '../context/NotamContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Clock, TrendingUp, Activity, MapPin, CheckSquare, Trash2, Calendar, Sun, Cloud, Moon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CustomSelect } from '../components/CustomPickers';
import PdfViewerModal from '../components/PdfViewerModal';
import BriefingViewerModal from '../components/BriefingViewerModal';
import PostShiftViewerModal from '../components/PostShiftViewerModal';
import PredutyViewerModal from '../components/PredutyViewerModal';
import CalendarView from '../components/CalendarView';
import NotamAnalytics from '../components/dashboard/NotamAnalytics';
import ShiftAnalytics from '../components/dashboard/ShiftAnalytics';
import PredutyAnalytics from '../components/dashboard/PredutyAnalytics';

const PIE_COLORS = ['#1e3a8a', '#2563eb', '#60a5fa', '#bfdbfe'];

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} jam lalu`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} hari lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} bulan lalu`;
}

const ShiftStats = ({ data }) => {
  const pagi = data.filter(d => d.shift === 'PAGI').length;
  const siang = data.filter(d => d.shift === 'SIANG').length;
  const malam = data.filter(d => d.shift === 'MALAM').length;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Total Dokumen</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '10px', color: '#3b82f6' }}>
            <FileText size={20} />
          </div>
        </div>
        <span className="stat-value">{data.length}</span>
      </div>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Shift Pagi</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
            <Sun size={20} />
          </div>
        </div>
        <span className="stat-value">{pagi}</span>
      </div>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Shift Siang</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#d1fae5', borderRadius: '10px', color: '#059669' }}>
            <Cloud size={20} />
          </div>
        </div>
        <span className="stat-value">{siang}</span>
      </div>
      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="stat-title">Shift Malam</span>
          <div style={{ padding: '0.5rem', backgroundColor: '#e2e8f0', borderRadius: '10px', color: '#475569' }}>
            <Moon size={20} />
          </div>
        </div>
        <span className="stat-value">{malam}</span>
      </div>
    </div>
  );
};

export default function AdminDashboard({ defaultTab = 'overview' }) {
  const { notams, deleteNotam } = useNotams();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [selectedNotam, setSelectedNotam] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState(defaultTab);
  const [overviewMode, setOverviewMode] = useState('notam');
  
  useEffect(() => {
    setMainTab(defaultTab);
    if (defaultTab === 'notam' && location.state?.statusFilter) {
      setStatusFilter(location.state.statusFilter);
    }
  }, [defaultTab, location.state]);

  const [briefings, setBriefings] = useState([]);
  const [postshifts, setPostshifts] = useState([]);
  const [preduties, setPreduties] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [selectedPostShift, setSelectedPostShift] = useState(null);
  const [selectedPreduty, setSelectedPreduty] = useState(null);

  const [briefingShiftFilter, setBriefingShiftFilter] = useState('all');
  const [briefingIncomingFilter, setBriefingIncomingFilter] = useState('all');
  const [briefingOutgoingFilter, setBriefingOutgoingFilter] = useState('all');

  const [postshiftShiftFilter, setPostshiftShiftFilter] = useState('all');
  const [postshiftIncomingFilter, setPostshiftIncomingFilter] = useState('all');
  const [postshiftOutgoingFilter, setPostshiftOutgoingFilter] = useState('all');

  const [predutyShiftFilter, setPredutyShiftFilter] = useState('all');

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

  const filteredBriefings = useMemo(() => {
    return briefings.filter(b => {
      const matchShift = briefingShiftFilter === 'all' || b.shift === briefingShiftFilter;
      const matchIncoming = briefingIncomingFilter === 'all' || b.incomingManager?.initial === briefingIncomingFilter;
      const matchOutgoing = briefingOutgoingFilter === 'all' || b.outgoingManager?.initial === briefingOutgoingFilter;
      return matchShift && matchIncoming && matchOutgoing;
    });
  }, [briefings, briefingShiftFilter, briefingIncomingFilter, briefingOutgoingFilter]);

  const filteredPostshifts = useMemo(() => {
    return postshifts.filter(p => {
      const matchShift = postshiftShiftFilter === 'all' || p.shift === postshiftShiftFilter;
      const matchIncoming = postshiftIncomingFilter === 'all' || p.incomingManager?.initial === postshiftIncomingFilter;
      const matchOutgoing = postshiftOutgoingFilter === 'all' || p.outgoingManager?.initial === postshiftOutgoingFilter;
      return matchShift && matchIncoming && matchOutgoing;
    });
  }, [postshifts, postshiftShiftFilter, postshiftIncomingFilter, postshiftOutgoingFilter]);

  const filteredPreduties = useMemo(() => {
    return preduties.filter(p => {
      return predutyShiftFilter === 'all' || p.shift === predutyShiftFilter;
    });
  }, [preduties, predutyShiftFilter]);

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

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const { activeNotams, incomingNotams, pastNotams, completedThisMonth, thisMonthCount, filteredNotams, chartData, pieData, statusPieData, recentActivity, notamCreatorData, notamCategoryData, notamTrendData } = useMemo(() => {
    const _now = new Date();
    const _month = _now.getMonth();
    const _year = _now.getFullYear();
    const daysInMonth = new Date(_year, _month + 1, 0).getDate();
    const daysCount = new Array(daysInMonth).fill(0);
    let active = [];
    let incoming = [];
    let past = [];
    let completedMonth = 0;
    let monthCount = 0;

    // Pie data counters
    let newCount = 0;
    let replaceCount = 0;
    let cancelCount = 0;
    let assessmentCount = 0;

    let categoryCounts = { 'Aerodrome': 0, 'En-route': 0, 'Warning': 0, 'Lainnya': 0 };
    let creatorCounts = {};
    let dailyCreated = new Array(daysInMonth).fill(0);
    let dailyCompleted = new Array(daysInMonth).fill(0);

    const safeNotams = Array.isArray(notams) ? notams : [];
    safeNotams.forEach(notam => {
      const formData = notam.formData || {};
      const startTime = new Date(formData.waktuMulai || notam.waktuMulai || notam.createdAt);
      const endTime = new Date(formData.waktuSelesai || notam.waktuSelesai || notam.createdAt);
      const createdDate = new Date(notam.createdAt);
      
      const creator = formData.creatorName || notam.creatorName || notam.creator || notam.createdBy || 'Unknown';
      creatorCounts[creator] = (creatorCounts[creator] || 0) + 1;

      const category = formData.kategori || notam.kategori || 'Lainnya';
      if (category.toLowerCase().includes('aerodrome')) categoryCounts['Aerodrome']++;
      else if (category.toLowerCase().includes('en-route')) categoryCounts['En-route']++;
      else if (category.toLowerCase().includes('warning')) categoryCounts['Warning']++;
      else categoryCounts['Lainnya']++;

      if (endTime < _now) {
        past.push(notam);
        if (endTime.getMonth() === _month && endTime.getFullYear() === _year) {
          dailyCompleted[endTime.getDate() - 1]++;
        }
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
        daysCount[createdDate.getDate() - 1]++;
        dailyCreated[createdDate.getDate() - 1]++;
      }

      const jenisNotam = formData.jenisNotam || notam.jenis || '';
      if (jenisNotam === 'NOTAM New') newCount++;
      else if (jenisNotam === 'NOTAM Replace') replaceCount++;
      else if (jenisNotam === 'NOTAM Cancel') cancelCount++;
      else if (jenisNotam === 'Assessment Only') assessmentCount++;
    });

    const chart = daysCount.map((count, index) => ({ name: (index + 1).toString(), notams: count }));

    const pie = [
      { name: 'NOTAM New', value: newCount },
      { name: 'Replace', value: replaceCount },
      { name: 'Cancel', value: cancelCount },
      { name: 'Assessment', value: assessmentCount },
    ].filter(d => d.value > 0);

    const statusPie = [
      { name: 'Terbit', value: active.length },
      { name: 'Incoming', value: incoming.length },
      { name: 'Selesai', value: past.length },
    ].filter(d => d.value > 0);

    const notamCreatorData = Object.keys(creatorCounts).map(name => ({ name, value: creatorCounts[name] })).sort((a,b) => b.value - a.value).slice(0, 5);
    const notamCategoryData = [
      { name: 'Aerodrome', value: categoryCounts['Aerodrome'] },
      { name: 'En-route', value: categoryCounts['En-route'] },
      { name: 'Warning', value: categoryCounts['Warning'] },
      { name: 'Lainnya', value: categoryCounts['Lainnya'] }
    ].filter(d => d.value > 0);
    const notamTrendData = daysCount.map((_, i) => ({
      name: (i + 1).toString(),
      Dibuat: dailyCreated[i],
      Selesai: dailyCompleted[i]
    }));

    let filtered = notams;
    if (statusFilter === 'active') filtered = active;
    else if (statusFilter === 'incoming') filtered = incoming;
    else if (statusFilter === 'past') filtered = past;

    if (jenisFilter !== 'all') {
      filtered = filtered.filter(n => (n.formData?.jenisNotam || n.jenis) === jenisFilter);
    }
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const recent = [...notams].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

    return {
      activeNotams: active,
      incomingNotams: incoming,
      completedThisMonth: completedMonth,
      thisMonthCount: monthCount,
      pastNotams: past,
      filteredNotams: filtered,
      chartData: chart,
      pieData: pie,
      statusPieData: statusPie,
      recentActivity: recent,
      notamCreatorData,
      notamCategoryData,
      notamTrendData
    };
  }, [notams, statusFilter, jenisFilter]);

  const shiftMetrics = useMemo(() => {
    const _now = new Date();
    const _month = _now.getMonth();
    const _year = _now.getFullYear();
    const daysInMonth = new Date(_year, _month + 1, 0).getDate();
    
    let thisMonthBriefing = 0;
    let thisMonthPostshift = 0;
    let pagi = 0, siang = 0, malam = 0;
    let remarksCount = { standard: 0, remarks: 0 };
    let supervisorCounts = {};
    let weeklyCounts = { 'Mg 1': 0, 'Mg 2': 0, 'Mg 3': 0, 'Mg 4': 0 };
    let dayCounts = { 'Minggu': 0, 'Senin': 0, 'Selasa': 0, 'Rabu': 0, 'Kamis': 0, 'Jumat': 0, 'Sabtu': 0 };
    
    const dailyData = new Array(daysInMonth).fill(0).map((_, i) => ({ name: (i + 1).toString(), pre: 0, post: 0 }));
    const shiftCompareData = [
      { name: 'PAGI', pre: 0, post: 0 },
      { name: 'SIANG', pre: 0, post: 0 },
      { name: 'MALAM', pre: 0, post: 0 }
    ];

    const getWeek = (date) => Math.min(Math.ceil(date.getDate() / 7), 4);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    briefings.forEach(b => {
      const d = new Date(b.createdAt || b.date);
      if (d.getMonth() === _month && d.getFullYear() === _year) {
        thisMonthBriefing++;
        dailyData[d.getDate() - 1].pre++;
        
        dayCounts[days[d.getDay()]]++;
        weeklyCounts[`Mg ${getWeek(d)}`]++;
        
        const creator = b.creatorName || b.creator || 'Unknown';
        supervisorCounts[creator] = (supervisorCounts[creator] || 0) + 1;
        
        const hasRemarks = b.checklist && b.checklist.some(c => c.checked === false);
        if (hasRemarks) remarksCount.remarks++;
        else remarksCount.standard++;

        if (b.shift === 'PAGI') { pagi++; shiftCompareData[0].pre++; }
        else if (b.shift === 'SIANG') { siang++; shiftCompareData[1].pre++; }
        else if (b.shift === 'MALAM') { malam++; shiftCompareData[2].pre++; }
      }
    });

    postshifts.forEach(p => {
      const d = new Date(p.createdAt || p.date);
      if (d.getMonth() === _month && d.getFullYear() === _year) {
        thisMonthPostshift++;
        dailyData[d.getDate() - 1].post++;
        
        dayCounts[days[d.getDay()]]++;
        weeklyCounts[`Mg ${getWeek(d)}`]++;
        
        const creator = p.creatorName || p.creator || 'Unknown';
        supervisorCounts[creator] = (supervisorCounts[creator] || 0) + 1;
        
        const hasRemarks = p.checklist && p.checklist.some(c => c.checked === false);
        if (hasRemarks) remarksCount.remarks++;
        else remarksCount.standard++;

        if (p.shift === 'PAGI') { pagi++; shiftCompareData[0].post++; }
        else if (p.shift === 'SIANG') { siang++; shiftCompareData[1].post++; }
        else if (p.shift === 'MALAM') { malam++; shiftCompareData[2].post++; }
      }
    });

    const shiftPieData = [
      { name: 'PAGI', value: pagi, color: '#3b82f6' },
      { name: 'SIANG', value: siang, color: '#f59e0b' },
      { name: 'MALAM', value: malam, color: '#1e3a8a' }
    ];
    
    const remarksPieData = [
      { name: 'Sesuai Standar', value: remarksCount.standard, color: '#10b981' },
      { name: 'Keterangan Khusus', value: remarksCount.remarks, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const topSupervisors = Object.keys(supervisorCounts).map(name => ({ name, value: supervisorCounts[name] })).sort((a,b) => b.value - a.value).slice(0, 5);
    const weeklyTrendData = Object.keys(weeklyCounts).map(name => ({ name, value: weeklyCounts[name] }));
    
    let mostActiveDay = '-';
    let maxDayCount = -1;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxDayCount) { maxDayCount = count; mostActiveDay = day; }
    }
    const totalForms = thisMonthBriefing + thisMonthPostshift;
    
    const mostActive = [...shiftPieData].sort((a,b) => b.value - a.value)[0] || { name: '-', value: 0 };

    return { thisMonthBriefing, thisMonthPostshift, totalForms, shiftPieData, dailyData, mostActive, mostActiveDay, shiftCompareData, remarksPieData, topSupervisors, weeklyTrendData };
  }, [briefings, postshifts]);

  const shiftStatCards = [
    { label: 'Total Form Keseluruhan', value: shiftMetrics.totalForms, icon: FileText, iconBg: '#eff6ff', iconColor: '#3b82f6', borderColor: '#3b82f6', action: () => setMainTab('briefing'), subtitle: 'Bulan ini' },
    { label: 'Total Pre-Shift', value: shiftMetrics.thisMonthBriefing, icon: CheckSquare, iconBg: '#eff6ff', iconColor: '#3b82f6', borderColor: '#3b82f6', action: () => setMainTab('briefing'), subtitle: 'Bulan ini' },
    { label: 'Total Post-Shift', value: shiftMetrics.thisMonthPostshift, icon: CheckCircle, iconBg: '#eff6ff', iconColor: '#3b82f6', borderColor: '#3b82f6', action: () => setMainTab('postshift'), subtitle: 'Bulan ini' },
    { label: 'Shift Teraktif', value: shiftMetrics.mostActive.name, icon: Activity, iconBg: '#eff6ff', iconColor: '#3b82f6', borderColor: '#3b82f6', subtitle: `${shiftMetrics.mostActive.value} form`, action: () => setMainTab('briefing') },
    { label: 'Hari Paling Aktif', value: shiftMetrics.mostActiveDay, icon: Calendar, iconBg: '#eff6ff', iconColor: '#3b82f6', borderColor: '#3b82f6', subtitle: 'Bulan ini', action: () => setMainTab('briefing') }
  ];

  const statCards = [
    {
      label: 'Total NOTAM',
      value: notams.length,
      icon: FileText,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      borderColor: '#3b82f6',
      filterKey: 'all',
    },
    {
      label: 'NOTAM Aktif',
      value: activeNotams.length,
      icon: CheckCircle,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      borderColor: '#3b82f6',
      filterKey: 'active',
      subtitle: 'Sudah terbit'
    },
    {
      label: 'Incoming',
      value: incomingNotams.length,
      icon: Clock,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      borderColor: '#3b82f6',
      filterKey: 'incoming',
      subtitle: 'Akan terbit'
    },
    {
      label: 'Bulan Ini',
      value: thisMonthCount,
      icon: TrendingUp,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      borderColor: '#3b82f6',
      subtitle: `${completedThisMonth} selesai`
    },
    {
      label: 'Sudah Lewat',
      value: pastNotams.length,
      icon: Clock,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
      borderColor: '#3b82f6',
      filterKey: 'past',
      subtitle: 'Tidak aktif'
    },
  ];

  const CustomTooltip = ({ active: isActive, payload, label }) => {
    if (isActive && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '12px 20px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{label}</p>
          <p style={{ margin: '4px 0 0', color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}>{payload[0].value} NOTAM</p>
        </div>
      );
    }
    return null;
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

      {/* ── OVERVIEW TAB CONTENT ──────────────────────────── */}
      {mainTab === 'overview' && (<>

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

      </>)} {/* end mainTab === 'overview' */}

      {/* ── NOTAM TAB CONTENT ─────────────────────────── */}
      {mainTab === 'notam' && (
        <div className="card" style={{ borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Daftar NOTAM <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({filteredNotams.length} dokumen)</span>
            </h3>
            {user?.role === 'admin' && (
              <Link to="/admin/create-notam" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
                <Plus size={15} /> Buat NOTAM Baru
              </Link>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', width: '320px' }}>
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
            
            <CustomSelect
              value={jenisFilter}
              onChange={setJenisFilter}
              placeholder="Semua Jenis"
              options={[
                { value: 'all', label: 'Semua Jenis' },
                { value: 'NOTAM New', label: 'NOTAM New' },
                { value: 'NOTAM Replace', label: 'NOTAM Replace' },
                { value: 'NOTAM Cancel', label: 'NOTAM Cancel' },
                { value: 'Assessment Only', label: 'Assessment Only' }
              ]}
            />
          </div>

          {filteredNotams.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
              <p>Belum ada NOTAM pada kategori ini.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                              onClick={(e) => { e.stopPropagation(); setSelectedNotam(notam); }}
                            >
                              Lihat PDF
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                className="btn"
                                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); handleDeleteNotam(notam.id, e); }}
                              >
                                <Trash2 size={13} />
                              </button>
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
        </div>
      )}

      {/* ── BRIEFING TAB ─────────────────────────── */}
      {mainTab === 'briefing' && (
        <>
        <ShiftStats data={briefings} />
        <div className="card" style={{ borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Daftar Pre-Shift Briefing
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({filteredBriefings.length} dokumen)</span>
            </h3>
            {user?.role === 'admin' && (
              <Link to="/admin/create-briefing" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
                <Plus size={15} /> Buat Briefing Baru
              </Link>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CustomSelect
                value={briefingShiftFilter}
                onChange={setBriefingShiftFilter}
                placeholder="Semua Shift"
                options={[
                  { value: 'all', label: 'Semua Shift' },
                  { value: 'PAGI', label: 'Pagi' },
                  { value: 'SIANG', label: 'Siang' },
                  { value: 'MALAM', label: 'Malam' }
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CustomSelect
                value={briefingIncomingFilter}
                onChange={setBriefingIncomingFilter}
                placeholder="Semua Incoming Manager"
                options={incomingOptions}
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CustomSelect
                value={briefingOutgoingFilter}
                onChange={setBriefingOutgoingFilter}
                placeholder="Semua Outgoing Manager"
                options={outgoingOptions}
              />
            </div>
          </div>

          {briefings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
              <p>Belum ada Pre-Shift Briefing Checklist.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
                  {filteredBriefings.map(b => (
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
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedBriefing(b); }}
                          >
                            Lihat PDF
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              className="btn"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                              onClick={(e) => handleDeleteBriefing(b.id, e)}
                            >
                              <Trash2 size={13} />
                            </button>
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
        </>
      )}

      {/* ── POST-SHIFT TAB ─────────────────────────── */}
      {mainTab === 'postshift' && (
        <>
        <ShiftStats data={postshifts} />
        <div className="card" style={{ borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Daftar Post-Shift Review
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 8 }}>({filteredPostshifts.length} dokumen)</span>
            </h3>
            {user?.role === 'admin' && (
              <Link to="/admin/create-postshift" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', padding: '0.45rem 1rem' }}>
                <Plus size={15} /> Buat Post-Shift Baru
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CustomSelect
                value={postshiftShiftFilter}
                onChange={setPostshiftShiftFilter}
                placeholder="Semua Shift"
                options={[
                  { value: 'all', label: 'Semua Shift' },
                  { value: 'PAGI', label: 'Pagi' },
                  { value: 'SIANG', label: 'Siang' },
                  { value: 'MALAM', label: 'Malam' }
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CustomSelect
                value={postshiftIncomingFilter}
                onChange={setPostshiftIncomingFilter}
                placeholder="Semua Incoming Manager"
                options={incomingOptions}
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <CustomSelect
                value={postshiftOutgoingFilter}
                onChange={setPostshiftOutgoingFilter}
                placeholder="Semua Outgoing Manager"
                options={outgoingOptions}
              />
            </div>
          </div>

          {postshifts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckSquare size={40} style={{ opacity: 0.15, marginBottom: '0.5rem' }} />
              <p>Belum ada Post-Shift Review Checklist.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
                  {filteredPostshifts.map(p => (
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
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedPostShift(p); }}
                          >
                            Lihat PDF
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              className="btn"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                              onClick={(e) => handleDeletePostShift(p.id, e)}
                            >
                              <Trash2 size={13} />
                            </button>
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
        </>
      )}

      {/* ── PREDUTY TAB CONTENT ──────────────────────────── */}
      {mainTab === 'preduty' && (
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
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Shift</th>
                    <th>Manager/Supervisor</th>
                    <th>Aksi</th>
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
                            <button
                              className="btn"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                              onClick={(e) => handleDeletePreduty(p.id, e)}
                            >
                              <Trash2 size={13} />
                            </button>
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
        </>
      )}

      {/* ── CALENDAR TAB CONTENT ──────────────────────────── */}
      {mainTab === 'calendar' && (
        <CalendarView />
      )}

      {selectedNotam && (
        <PdfViewerModal notam={selectedNotam} onClose={() => setSelectedNotam(null)} />
      )}
      {selectedBriefing && (
        <BriefingViewerModal briefing={selectedBriefing} onClose={() => setSelectedBriefing(null)} />
      )}
      {selectedPostShift && (
        <PostShiftViewerModal postshift={selectedPostShift} onClose={() => setSelectedPostShift(null)} />
      )}
      {selectedPreduty && (
        <PredutyViewerModal preduty={selectedPreduty} onClose={() => setSelectedPreduty(null)} />
      )}
    </div>
  );
}
