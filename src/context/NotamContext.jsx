import { createContext, useContext, useState, useEffect } from 'react';

const NotamContext = createContext();

const defaultDummyData = [
  {
    id: 'notam-1',
    formNo: '01/VII/2026',
    creator: 'admin',
    createdAt: new Date().toISOString(),
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR1, WAR11',
      waktuMulai: new Date(new Date().getTime() - 86400000).toISOString().slice(0, 16), // Yesterday
      waktuSelesai: new Date(new Date().getTime() + 86400000 * 2).toISOString().slice(0, 16), // +2 days
      jadwalSpesifik: '02.30 - 06.30 UTC',
      deskripsi: 'MILITARY EXERCISE LARGE FORCE EMPLOYMENT...',
      dokumenPendukung: 'Form No : 044 / VI / 2026',
      reffLetter: '044 / VI / 2026',
      altitude: 'SFC - FL 500',
      mapImage: null,
      operationalEffect: 'WAR11, WAR1, DHOHO ATZ',
      mitigation: 'Close coordination',
      procedureCapacity: 'Take off and landing delay',
      mitigasiOperasional: 'Inform ATC',
      conclusion: 'Kegiatan dapat dilaksanakan'
    }
  },
  {
    id: 'notam-2',
    formNo: '02/VII/2026',
    creator: 'admin',
    createdAt: new Date().toISOString(),
    formData: {
      jenisNotam: 'NOTAM Replace',
      lokasi: 'WAR2',
      waktuMulai: new Date(new Date().getTime() + 86400000 * 3).toISOString().slice(0, 16), // +3 days
      waktuSelesai: new Date(new Date().getTime() + 86400000 * 5).toISOString().slice(0, 16),
      jadwalSpesifik: '',
      deskripsi: 'REPLACE NOTAM FOR MAINTENANCE...',
      dokumenPendukung: ''
    }
  }
];

export const NotamProvider = ({ children }) => {
  const [notams, setNotams] = useState(() => {
    const saved = localStorage.getItem('airnav_notams');
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultDummyData;
  });

  useEffect(() => {
    localStorage.setItem('airnav_notams', JSON.stringify(notams));
  }, [notams]);

  const addNotam = (newNotam) => {
    setNotams(prev => [newNotam, ...prev]);
  };

  const updateNotam = (id, updatedData) => {
    setNotams(prev => prev.map(notam => notam.id === id ? { ...notam, formData: updatedData } : notam));
  };

  const deleteNotam = (id) => {
    setNotams(prev => prev.filter(notam => notam.id !== id));
  };

  return (
    <NotamContext.Provider value={{ notams, addNotam, updateNotam, deleteNotam }}>
      {children}
    </NotamContext.Provider>
  );
};

export const useNotams = () => useContext(NotamContext);
