import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Treemap } from 'recharts';
import { CustomSelect, CustomMonthPicker } from '../CustomPickers';

const STATUS_COLORS = { 'NOTAM New': '#3b82f6', 'NOTAM Replace': '#f59e0b', 'NOTAM Cancel': '#ef4444' };

export default function NotamAnalytics({ notams }) {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Global Filter State
  const [globalMonth, setGlobalMonth] = useState(currentMonthStr);
  
  // Specific Filter
  const [treeTopN, setTreeTopN] = useState('Top 10');
  
  const safeNotams = Array.isArray(notams) ? notams : [];

  // Helper functions
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getJenis = (n) => (n.formData?.jenisNotam || n.jenis || 'Lainnya');
  
  // Parse global month
  const global_y = globalMonth ? parseInt(globalMonth.split('-')[0], 10) : now.getFullYear();
  const global_m = globalMonth ? parseInt(globalMonth.split('-')[1], 10) - 1 : now.getMonth();

  // 1. Kepadatan Penerbitan Harian
  const heatmapData = useMemo(() => {
    if (!globalMonth) return { days: 0, offset: 0, counts: [] };
    const days = getDaysInMonth(global_m, global_y);
    const dayCounts = new Array(days).fill(0);
    
    safeNotams.forEach(n => {
      const d = new Date(n.createdAt);
      if (d.getMonth() === global_m && d.getFullYear() === global_y) {
        dayCounts[d.getDate() - 1]++;
      }
    });
    
    const firstDay = new Date(global_y, global_m, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    return { days, offset, counts: dayCounts };
  }, [safeNotams, globalMonth, global_m, global_y]);

  // 2. Matrix Heatmap (Jam x Hari)
  const timeMatrix = useMemo(() => {
    if (!globalMonth) return Array.from({ length: 7 }, () => new Array(24).fill(0));
    
    const matrix = Array.from({ length: 7 }, () => new Array(24).fill(0));
    safeNotams.forEach(n => {
      const d = new Date(n.createdAt);
      if (d.getMonth() === global_m && d.getFullYear() === global_y) {
        const day = d.getDay();
        const shiftedDay = day === 0 ? 6 : day - 1;
        const hour = d.getHours();
        matrix[shiftedDay][hour]++;
      }
    });
    return matrix;
  }, [safeNotams, globalMonth, global_m, global_y]);

  // 3. Lokasi Hotspot
  const hotspotData = useMemo(() => {
    const locs = {};
    safeNotams.forEach(n => {
      const d = new Date(n.createdAt);
      if (d.getMonth() === global_m && d.getFullYear() === global_y) {
        const l = n.formData?.lokasi || n.lokasi || 'Unknown';
        locs[l] = (locs[l] || 0) + 1;
      }
    });
    const sorted = Object.keys(locs).map(name => ({ name, size: locs[name] })).sort((a,b) => b.size - a.size);
    const limit = treeTopN === 'Top 3' ? 3 : treeTopN === 'Top 10' ? 10 : 5;
    return sorted.slice(0, limit);
  }, [safeNotams, treeTopN, global_m, global_y]);

  // 4. Tren Penerbitan NOTAM Harian
  const trendData = useMemo(() => {
    if (!globalMonth) return [];
    const days = getDaysInMonth(global_m, global_y);
    const data = Array.from({ length: days }, (_, i) => ({ name: (i+1).toString(), Total: 0 }));
    
    safeNotams.forEach(n => {
      const d = new Date(n.createdAt);
      if (d.getMonth() === global_m && d.getFullYear() === global_y) {
        data[d.getDate() - 1].Total++;
      }
    });
    return data;
  }, [safeNotams, globalMonth, global_m, global_y]);

  // 5. Distribusi Status Jenis NOTAM
  const statusPieData = useMemo(() => {
    const counts = { 'NOTAM New': 0, 'NOTAM Replace': 0, 'NOTAM Cancel': 0 };
    safeNotams.forEach(n => {
      const d = new Date(n.createdAt);
      if (d.getMonth() === global_m && d.getFullYear() === global_y) {
        const j = getJenis(n);
        if (counts[j] !== undefined) counts[j]++;
      }
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] })).filter(d => d.value > 0);
  }, [safeNotams, global_m, global_y]);

  // 7. Pengaju Terbanyak
  const creatorData = useMemo(() => {
    const counts = {};
    safeNotams.forEach(n => {
      const d = new Date(n.createdAt);
      if (d.getMonth() === global_m && d.getFullYear() === global_y) {
        const creator = n.formData?.creatorName || n.creatorName || n.creator || n.createdBy || 'Unknown';
        counts[creator] = (counts[creator] || 0) + 1;
      }
    });
    const sorted = Object.keys(counts).map(k => ({ name: k, value: counts[k] })).sort((a,b) => b.value - a.value);
    return sorted.slice(0, 5);
  }, [safeNotams, global_m, global_y]);

  // 8. Komparasi Aktif vs Selesai
  const compareData = useMemo(() => {
    if (!globalMonth) return [];
    const days = getDaysInMonth(global_m, global_y);
    const data = Array.from({ length: days }, (_, i) => ({ name: (i+1).toString(), Aktif: 0, Selesai: 0 }));
    
    safeNotams.forEach(n => {
      const created = new Date(n.createdAt);
      const expired = new Date(n.waktuSelesai || n.createdAt);
      
      if (created.getMonth() === global_m && created.getFullYear() === global_y) {
        data[created.getDate() - 1].Aktif++;
      }
      if (expired.getMonth() === global_m && expired.getFullYear() === global_y) {
        data[expired.getDate() - 1].Selesai++;
      }
    });
    return data;
  }, [safeNotams, globalMonth, global_m, global_y]);


  return (
    <div>
      {/* Global Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#fff', padding: '1.2rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Visualisasi Data NOTAM</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Analitik berdasarkan periode bulan</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Pilih Periode:</span>
          <CustomMonthPicker value={globalMonth} onChange={(val) => setGlobalMonth(val)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* 1. Calendar Heatmap */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Kepadatan Penerbitan Harian</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calendar Heatmap</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{d}</div>
            ))}
            {Array.from({ length: heatmapData.offset }).map((_, i) => <div key={`empty-${i}`} />)}
            {heatmapData.counts.map((count, idx) => (
              <div key={idx} style={{
                aspectRatio: '1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: count === 0 ? '#f1f5f9' : `rgba(59, 130, 246, ${Math.min(count / 5 + 0.2, 1)})`,
                color: count > 3 ? '#fff' : '#475569', fontSize: '0.8rem', fontWeight: 500,
                cursor: 'pointer'
              }} title={`${count} NOTAM diterbitkan`}>
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 8. Area Komparasi Aktif vs Selesai */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Komparasi Aktif vs Selesai Harian</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Volume pembuatan dan berakhirnya masa berlaku NOTAM</p>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={compareData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAktif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Aktif" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAktif)" />
                <Area type="monotone" dataKey="Selesai" stroke="#10b981" fillOpacity={1} fill="url(#colorSelesai)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Lokasi Hotspot */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Lokasi Hotspot</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Konsentrasi gangguan per ICAO</p>
            </div>
            <CustomSelect value={treeTopN} onChange={setTreeTopN} options={[{label:'Top 3',value:'Top 3'}, {label:'Top 5',value:'Top 5'}, {label:'Top 10',value:'Top 10'}]} />
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <Treemap data={hotspotData} dataKey="size" aspectRatio={4/3} stroke="#fff" fill="#3b82f6">
                <Tooltip content={<CustomTooltipTree />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Tren Penerbitan */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Tren Penerbitan NOTAM</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total NOTAM dibuat harian</p>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Pie Status */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Distribusi Status NOTAM</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Porsi jenis dokumen</p>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            {statusPieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {statusPieData.map((entry, index) => <Cell key={index} fill={STATUS_COLORS[entry.name] || '#64748b'} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>Belum ada data</p>}
          </div>
        </div>

        {/* 7. Bar Pengaju */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Aktivitas Pengaju Terbanyak</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pembuat NOTAM Tertinggi</p>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={creatorData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} width={80} />
                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} name="Total Dibuat">
                  {creatorData.map((e, i) => <Cell key={i} fillOpacity={1 - (i * 0.1)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Matrix Heatmap */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Waktu Penerbitan</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jam vs Hari (Heatmap)</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', height: '240px', overflowY: 'auto', paddingRight: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <div style={{ width: '45px' }}></div>
              <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                {Array.from({ length: 24 }).map((_, hIdx) => (
                  <div key={hIdx} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: '#64748b' }}>
                    {String(hIdx).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, dIdx) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '45px', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{day.substring(0,3)}</div>
                <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
                  {timeMatrix[dIdx].map((count, hIdx) => (
                    <div key={hIdx} style={{
                      flex: 1, height: '20px', borderRadius: '2px',
                      backgroundColor: count === 0 ? '#f1f5f9' : `rgba(245, 158, 11, ${Math.min(count / 3 + 0.2, 1)})`
                    }} title={`${day} ${hIdx}:00 - ${count} NOTAM`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const CustomTooltipTree = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].payload.name}</p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{payload[0].value} NOTAM</p>
      </div>
    );
  }
  return null;
};
