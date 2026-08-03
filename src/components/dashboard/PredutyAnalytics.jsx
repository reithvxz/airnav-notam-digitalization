import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CustomMonthPicker } from '../CustomPickers';

export default function PredutyAnalytics({ preduties }) {
  const now = new Date();
  const [globalMonth, setGlobalMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const safePreduties = Array.isArray(preduties) ? preduties : [];

  const getValidDate = (f) => {
    const d = new Date(f.createdAt || f.date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOffset = (y, m) => {
    let day = new Date(y, m - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const [selYear, selMonth] = globalMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(selYear, selMonth);
  const monthOffset = getFirstDayOffset(selYear, selMonth);

  const filteredPreduties = useMemo(() => {
    return safePreduties.filter(f => {
      const d = getValidDate(f);
      return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth;
    });
  }, [safePreduties, selYear, selMonth]);

  // C0: Tren Pengajuan Harian
  const trendData = useMemo(() => {
    const data = Array.from({length: daysInMonth}, (_, i) => ({ name: String(i+1), 'Preduty': 0 }));
    filteredPreduties.forEach(f => {
      const day = getValidDate(f).getDate() - 1;
      if (day >= 0 && day < daysInMonth) data[day]['Preduty']++;
    });
    return data;
  }, [filteredPreduties, daysInMonth]);

  // C1: Heatmap Preduty
  const heatmapData = useMemo(() => {
    const counts = new Array(daysInMonth).fill(0);
    filteredPreduties.forEach(f => {
      const day = getValidDate(f).getDate() - 1;
      if (day >= 0 && day < daysInMonth) counts[day]++;
    });
    return counts;
  }, [filteredPreduties, daysInMonth]);

  // C2: Pie Chart (PAGI, SIANG, MALAM)
  const pieData = useMemo(() => {
    const counts = { PAGI: 0, SIANG: 0, MALAM: 0 };
    filteredPreduties.forEach(f => {
      if (counts[f.shift] !== undefined) counts[f.shift]++;
    });
    return [
      { name: 'Shift Pagi', value: counts['PAGI'] },
      { name: 'Shift Siang', value: counts['SIANG'] },
      { name: 'Shift Malam', value: counts['MALAM'] }
    ].filter(d => d.value > 0);
  }, [filteredPreduties]);

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6'];

  // C3: Histogram Manager Terbanyak
  const managerData = useMemo(() => {
    const mng = {};
    filteredPreduties.forEach(f => {
      const name = f.managerOnDuty || 'Unknown';
      if (!mng[name]) mng[name] = { name, 'Total': 0 };
      mng[name]['Total']++;
    });
    
    return Object.values(mng).sort((a,b) => b.Total - a.Total).slice(0, 8);
  }, [filteredPreduties]);

  const renderCalendar = (title, counts, colorBase) => (
    <div className="card">
      <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>{title}</h3>
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', minWidth: '300px', margin: '0 auto' }}>
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
    </div>
  );

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Global Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1.25rem 1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Preduty Analytics</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>Statistik Kesiapan & Pengajuan Shift Baru.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Pilih Periode:</span>
          <CustomMonthPicker value={globalMonth} onChange={setGlobalMonth} />
        </div>
      </div>

      <div className="chart-grid">
        
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Tren Pengajuan Harian Preduty</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Preduty" stroke="#8b5cf6" strokeWidth={3} dot={{r:3}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Sebaran Waktu Preduty (Shift)</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none" label>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Top Pengaju Laporan</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={managerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          {renderCalendar('Heatmap Kepadatan Preduty', heatmapData, (count) => `rgba(139, 92, 246, ${Math.min(count / 3 + 0.3, 1)})`)}
        </div>

      </div>
    </div>
  );
}
