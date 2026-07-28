import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CustomMonthPicker } from '../CustomPickers';

export default function ShiftAnalytics({ briefings, postshifts }) {
  const now = new Date();
  const [globalMonth, setGlobalMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const safeBriefings = Array.isArray(briefings) ? briefings : [];
  const safePostshifts = Array.isArray(postshifts) ? postshifts : [];

  const getValidDate = (f) => {
    const d = new Date(f.createdAt || f.date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOffset = (y, m) => {
    let day = new Date(y, m - 1, 1).getDay();
    return day === 0 ? 6 : day - 1; // Senin = 0
  };

  // 1. Data Processing
  const [selYear, selMonth] = globalMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(selYear, selMonth);
  const monthOffset = getFirstDayOffset(selYear, selMonth);

  const preShiftForms = useMemo(() => {
    return safeBriefings.filter(f => {
      const d = getValidDate(f);
      return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth;
    });
  }, [safeBriefings, selYear, selMonth]);

  const postShiftForms = useMemo(() => {
    return safePostshifts.filter(f => {
      const d = getValidDate(f);
      return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth;
    });
  }, [safePostshifts, selYear, selMonth]);

  // C0: Tren Pengajuan Harian
  const trendData = useMemo(() => {
    const data = Array.from({length: daysInMonth}, (_, i) => ({ name: String(i+1), 'Pre-Shift': 0, 'Post-Shift': 0 }));
    preShiftForms.forEach(f => {
      const day = getValidDate(f).getDate() - 1;
      if (day >= 0 && day < daysInMonth) data[day]['Pre-Shift']++;
    });
    postShiftForms.forEach(f => {
      const day = getValidDate(f).getDate() - 1;
      if (day >= 0 && day < daysInMonth) data[day]['Post-Shift']++;
    });
    return data;
  }, [preShiftForms, postShiftForms, daysInMonth]);

  // C1: Heatmap Pre-Shift
  const preHeatmap = useMemo(() => {
    const counts = new Array(daysInMonth).fill(0);
    preShiftForms.forEach(f => {
      const day = getValidDate(f).getDate() - 1;
      if (day >= 0 && day < daysInMonth) counts[day]++;
    });
    return counts;
  }, [preShiftForms, daysInMonth]);

  // C2: Heatmap Post-Shift
  const postHeatmap = useMemo(() => {
    const counts = new Array(daysInMonth).fill(0);
    postShiftForms.forEach(f => {
      const day = getValidDate(f).getDate() - 1;
      if (day >= 0 && day < daysInMonth) counts[day]++;
    });
    return counts;
  }, [postShiftForms, daysInMonth]);

  // C3: Pie Chart
  const pieData = [
    { name: 'Pre-Shift', value: preShiftForms.length },
    { name: 'Post-Shift', value: postShiftForms.length }
  ];

  // C4: Histogram Manager Terbanyak
  const managerData = useMemo(() => {
    const mng = {};
    const processForm = (f, type) => {
      const name = f.managerOnDuty || 'Unknown';
      if (!mng[name]) mng[name] = { name, 'Pre-Shift': 0, 'Post-Shift': 0, Total: 0 };
      mng[name][type]++;
      mng[name].Total++;
    };
    preShiftForms.forEach(f => processForm(f, 'Pre-Shift'));
    postShiftForms.forEach(f => processForm(f, 'Post-Shift'));
    
    return Object.values(mng).sort((a,b) => b.Total - a.Total).slice(0, 8);
  }, [preShiftForms, postShiftForms]);

  // C5: Distribusi Berdasarkan Shift (PAGI, SIANG, MALAM)
  const shiftDistData = useMemo(() => {
    const counts = {
      'PAGI': { name: 'Shift Pagi', 'Pre-Shift': 0, 'Post-Shift': 0 },
      'SIANG': { name: 'Shift Siang', 'Pre-Shift': 0, 'Post-Shift': 0 },
      'MALAM': { name: 'Shift Malam', 'Pre-Shift': 0, 'Post-Shift': 0 }
    };
    preShiftForms.forEach(f => {
      if (counts[f.shift]) counts[f.shift]['Pre-Shift']++;
    });
    postShiftForms.forEach(f => {
      if (counts[f.shift]) counts[f.shift]['Post-Shift']++;
    });
    return [counts['PAGI'], counts['SIANG'], counts['MALAM']];
  }, [preShiftForms, postShiftForms]);

  const renderCalendar = (title, counts, colorBase) => (
    <div className="card">
      <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', width: '100%', margin: '0 auto' }}>
        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, paddingBottom: '2px' }}>{d.substring(0,3)}</div>
        ))}
        {Array.from({ length: monthOffset }).map((_, i) => <div key={`empty-${i}`} />)}
        {counts.map((count, idx) => (
          <div key={idx} style={{
            aspectRatio: '1', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: count === 0 ? '#f1f5f9' : colorBase(count),
            color: count > 0 ? '#fff' : '#94a3b8', border: '1px solid transparent'
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{idx + 1}</span>
            {count > 0 && <span style={{ fontSize: '0.6rem', opacity: 0.9 }}>{count}</span>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Global Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1.25rem 1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Pre-Shift & Post-Shift Analytics</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>Heatmap Kepadatan Pelaporan & Rekap Manager.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Pilih Periode:</span>
          <CustomMonthPicker value={globalMonth} onChange={setGlobalMonth} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* NEW 0. Tren Pengajuan (Full Width) */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Tren Pengajuan Harian</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Pre-Shift" stroke="#3b82f6" strokeWidth={3} dot={{r:3}} />
                <Line type="monotone" dataKey="Post-Shift" stroke="#f59e0b" strokeWidth={3} dot={{r:3}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Pie Chart Perbandingan (Dipindahkan ke atas) */}
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Perbandingan Pre-Shift vs Post-Shift</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none" label>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#f59e0b'} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Histogram Pengaju Terbanyak (Dipindahkan ke atas) */}
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Pengaju Laporan Terbanyak</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={managerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Pre-Shift" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Post-Shift" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1. Heatmap Pre-Shift (Dipindahkan ke bawah) */}
        {renderCalendar('Heatmap Kepadatan Pre-Shift', preHeatmap, (count) => `rgba(59, 130, 246, ${Math.min(count / 3 + 0.3, 1)})`)}
        
        {/* 2. Heatmap Post-Shift (Dipindahkan ke bawah) */}
        {renderCalendar('Heatmap Kepadatan Post-Shift', postHeatmap, (count) => `rgba(245, 158, 11, ${Math.min(count / 3 + 0.3, 1)})`)}

        {/* 5. Histogram Distribusi Shift (Full Width di paling bawah) */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Distribusi Laporan Berdasarkan Shift (Pagi/Siang/Malam)</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={shiftDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Pre-Shift" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Post-Shift" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
