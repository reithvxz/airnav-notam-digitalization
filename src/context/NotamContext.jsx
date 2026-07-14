import { createContext, useContext, useState, useEffect } from 'react';

const NotamContext = createContext();

// Helper to create a date relative to now
const makeDate = (year, month, day, hour = 0, minute = 0) => {
  return new Date(year, month - 1, day, hour, minute).toISOString().slice(0, 16);
};

const defaultDummyData = [
  // ── JANUARI 2026 ──
  {
    id: 'notam-jan-01',
    formNo: '01/I/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-01-10T03:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR1',
      waktuMulai: makeDate(2026, 1, 12, 2, 0),
      waktuSelesai: makeDate(2026, 1, 14, 6, 0),
      jadwalSpesifik: '02.00 - 06.00 UTC',
      deskripsi: 'MILITARY EXERCISE JOINT OPERATION GARUDA SHIELD DI AREA WAR1. KOORDINASI DENGAN LANUD ISWAHYUDI.',
      dokumenPendukung: 'Surat Danlanud No: 012/I/2026',
      namaKegiatan: 'KEGIATAN MILITARY EXERCISE JOINT OPERATION GARUDA SHIELD',
      reffLetter: '012 / I / 2026',
      altitude: 'SFC - FL 350',
      mapImage: null,
      operationalEffect: 'WAR1, L628 SECTOR AFFECTED',
      mitigation: 'Reroute via W39',
      procedureCapacity: 'Reduced capacity by 20%',
      mitigasiOperasional: 'Inform all ATC sectors',
      conclusion: 'Kegiatan dapat dilaksanakan dengan mitigasi'
    }
  },
  {
    id: 'notam-jan-02',
    formNo: '02/I/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-01-22T04:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'ADZ JUANDA',
      waktuMulai: makeDate(2026, 1, 24, 1, 0),
      waktuSelesai: makeDate(2026, 1, 24, 5, 0),
      jadwalSpesifik: '01.00 - 05.00 UTC',
      deskripsi: 'RUNWAY 10/28 CLOSED FOR RESURFACING MAINTENANCE. ALL TRAFFIC DIVERTED TO TAXIWAY HOLDING.',
      dokumenPendukung: 'Memo GM AirNav SBY No: 023/I/2026',
      namaKegiatan: 'MAINTENANCE RUNWAY 10/28 JUANDA',
      reffLetter: '023 / I / 2026',
      altitude: 'SFC',
      mapImage: null,
      operationalEffect: 'RWY 10/28 CLOSED',
      mitigation: 'Use alternate RWY if available',
      procedureCapacity: 'Zero capacity during closure',
      mitigasiOperasional: 'NOTAM to all operators 72h prior',
      conclusion: 'Maintenance critical, approved'
    }
  },
  // ── FEBRUARI 2026 ──
  {
    id: 'notam-feb-01',
    formNo: '01/II/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-02-05T02:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR11',
      waktuMulai: makeDate(2026, 2, 7, 3, 0),
      waktuSelesai: makeDate(2026, 2, 9, 6, 30),
      jadwalSpesifik: '03.00 - 06.30 UTC',
      deskripsi: 'LATIHAN TEMBAK RUDAL TNI-AU DI AREA WAR11. DANGER AREA AKTIF.',
      dokumenPendukung: 'Surat Koops AU No: 031/II/2026',
      namaKegiatan: 'LATIHAN TEMBAK RUDAL TNI-AU',
      reffLetter: '031 / II / 2026',
      altitude: 'SFC - FL 500',
      mapImage: null,
      operationalEffect: 'WAR11 DANGER AREA ACTIVE',
      mitigation: 'Reroute traffic via W15',
      procedureCapacity: 'Normal capacity outside danger area',
      mitigasiOperasional: 'Continuous SIGMET broadcast',
      conclusion: 'Kegiatan dapat dilaksanakan'
    }
  },
  // ── MARET 2026 ──
  {
    id: 'notam-mar-01',
    formNo: '01/III/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-03-02T01:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'DHOHO ATZ',
      waktuMulai: makeDate(2026, 3, 4, 0, 30),
      waktuSelesai: makeDate(2026, 3, 5, 4, 30),
      jadwalSpesifik: '00.30 - 04.30 UTC',
      deskripsi: 'DRONE SURVEY ACTIVITY FOR GEOLOGICAL MAPPING PROJECT BY BADAN GEOLOGI. UNMANNED AERIAL VEHICLE OPERATING.',
      dokumenPendukung: 'Izin Kemenhub No: SKB-041/III/2026',
      namaKegiatan: 'DRONE SURVEY GEOLOGICAL MAPPING',
      reffLetter: 'SKB-041 / III / 2026',
      altitude: 'SFC - 3000FT AGL',
      mapImage: null,
      operationalEffect: 'DHOHO ATZ restricted below 3000FT',
      mitigation: 'VFR traffic maintain 3500FT or above',
      procedureCapacity: 'Reduced VFR capacity',
      mitigasiOperasional: 'Inform pilots via ATIS',
      conclusion: 'Survey approved with altitude restriction'
    }
  },
  {
    id: 'notam-mar-02',
    formNo: '02/III/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-03-15T05:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM Replace',
      lokasi: 'WAR1',
      waktuMulai: makeDate(2026, 3, 17, 2, 0),
      waktuSelesai: makeDate(2026, 3, 19, 6, 0),
      jadwalSpesifik: '',
      deskripsi: 'REPLACE NOTAM - EXTENDED MILITARY EXERCISE GARUDA SHIELD PHASE 2. PERPANJANGAN JADWAL LATIHAN.',
      dokumenPendukung: 'Form No : 01/I/2026'
    }
  },
  {
    id: 'notam-mar-03',
    formNo: '03/III/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-03-25T03:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR2',
      waktuMulai: makeDate(2026, 3, 27, 4, 0),
      waktuSelesai: makeDate(2026, 3, 29, 8, 0),
      jadwalSpesifik: '04.00 - 08.00 UTC daily',
      deskripsi: 'PARACHUTE DROPPING EXERCISE TNI-AD RAIDER BRIGADE. FREEFALL AND STATIC LINE.',
      dokumenPendukung: 'Surat Kodam V No: 055/III/2026',
      namaKegiatan: 'LATIHAN TERJUN PAYUNG TNI-AD',
      reffLetter: '055 / III / 2026',
      altitude: 'SFC - FL 150',
      mapImage: null,
      operationalEffect: 'WAR2 ACTIVE FOR PARADROP',
      mitigation: 'Reroute via W21',
      procedureCapacity: 'Full IFR capacity maintained',
      mitigasiOperasional: 'Broadcast on 121.5 MHz',
      conclusion: 'Kegiatan dapat dilaksanakan'
    }
  },
  // ── APRIL 2026 ──
  {
    id: 'notam-apr-01',
    formNo: '01/IV/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-04-08T02:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'ADZ JUANDA',
      waktuMulai: makeDate(2026, 4, 10, 7, 0),
      waktuSelesai: makeDate(2026, 4, 10, 10, 0),
      jadwalSpesifik: '07.00 - 10.00 UTC',
      deskripsi: 'VVIP FLIGHT KUNJUNGAN PRESIDEN RI KE JAWA TIMUR. TEMPORARY FLIGHT RESTRICTION SEKITAR BANDARA JUANDA.',
      dokumenPendukung: 'Instruksi Kemenhub No: SI-067/IV/2026',
      namaKegiatan: 'VVIP FLIGHT PRESIDEN RI',
      reffLetter: 'SI-067 / IV / 2026',
      altitude: 'SFC - FL 250',
      mapImage: null,
      operationalEffect: 'TFR radius 10NM Juanda',
      mitigation: 'Hold all departures, sequence arrivals',
      procedureCapacity: 'Zero capacity during VVIP window',
      mitigasiOperasional: 'TNI-AU escort coordination',
      conclusion: 'Mandatory compliance per presidential protocol'
    }
  },
  {
    id: 'notam-apr-02',
    formNo: '02/IV/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-04-20T06:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WOT11',
      waktuMulai: makeDate(2026, 4, 22, 1, 0),
      waktuSelesai: makeDate(2026, 4, 24, 5, 0),
      jadwalSpesifik: '01.00 - 05.00 UTC',
      deskripsi: 'NAVAL GUNNERY EXERCISE TNI-AL DI PERAIRAN UTARA JAWA. DANGER AREA WOT11 AKTIF.',
      dokumenPendukung: 'Surat Armabar No: 072/IV/2026',
      namaKegiatan: 'NAVAL GUNNERY EXERCISE TNI-AL',
      reffLetter: '072 / IV / 2026',
      altitude: 'SFC - FL 200',
      mapImage: null,
      operationalEffect: 'WOT11 ACTIVE DANGER AREA',
      mitigation: 'Reroute oceanic traffic',
      procedureCapacity: 'Oceanic routes affected',
      mitigasiOperasional: 'Maritime safety broadcast',
      conclusion: 'Exercise approved with coordination'
    }
  },
  // ── MEI 2026 ──
  {
    id: 'notam-mei-01',
    formNo: '01/V/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-05-03T04:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR11, WAR1',
      waktuMulai: makeDate(2026, 5, 5, 2, 30),
      waktuSelesai: makeDate(2026, 5, 7, 6, 30),
      jadwalSpesifik: '02.30 - 06.30 UTC',
      deskripsi: 'LARGE FORCE EMPLOYMENT EXERCISE TNI-AU SKUADRON 14 & 15. AIR COMBAT MANEUVERING DAN BOMBING RANGE.',
      dokumenPendukung: 'Surat Koops AU No: 081/V/2026',
      namaKegiatan: 'LARGE FORCE EMPLOYMENT EXERCISE',
      reffLetter: '081 / V / 2026',
      altitude: 'SFC - FL 500',
      mapImage: null,
      operationalEffect: 'WAR11, WAR1 ACTIVE',
      mitigation: 'Reroute all traffic W15/W39',
      procedureCapacity: 'Significant delay expected',
      mitigasiOperasional: 'ATC full coordination',
      conclusion: 'Kegiatan dapat dilaksanakan'
    }
  },
  {
    id: 'notam-mei-02',
    formNo: '02/V/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-05-18T03:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM Replace',
      lokasi: 'ADZ JUANDA',
      waktuMulai: makeDate(2026, 5, 20, 0, 0),
      waktuSelesai: makeDate(2026, 5, 20, 4, 0),
      jadwalSpesifik: '',
      deskripsi: 'REPLACE - TAXIWAY BRAVO MAINTENANCE RESCHEDULED. ORIGINAL DATE MOVED DUE TO WEATHER.',
      dokumenPendukung: 'Ref: Memo GM No: 023/I/2026'
    }
  },
  // ── JUNI 2026 ──
  {
    id: 'notam-jun-01',
    formNo: '01/VI/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-06-02T02:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR2',
      waktuMulai: makeDate(2026, 6, 4, 3, 0),
      waktuSelesai: makeDate(2026, 6, 6, 7, 0),
      jadwalSpesifik: '03.00 - 07.00 UTC',
      deskripsi: 'HELICOPTER LOW LEVEL TRAINING SKUADRON 5 TNI-AD. ROTARY WING OPERATION DI AREA WAR2.',
      dokumenPendukung: 'Surat Puspenerbad No: 090/VI/2026',
      namaKegiatan: 'HELICOPTER LOW LEVEL TRAINING',
      reffLetter: '090 / VI / 2026',
      altitude: 'SFC - 5000FT AGL',
      mapImage: null,
      operationalEffect: 'WAR2 below 5000FT restricted',
      mitigation: 'IFR traffic unaffected above FL060',
      procedureCapacity: 'Normal IFR capacity',
      mitigasiOperasional: 'Inform VFR traffic',
      conclusion: 'Training approved'
    }
  },
  {
    id: 'notam-jun-02',
    formNo: '02/VI/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-06-15T01:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'DHOHO ATZ',
      waktuMulai: makeDate(2026, 6, 17, 5, 0),
      waktuSelesai: makeDate(2026, 6, 17, 9, 0),
      jadwalSpesifik: '05.00 - 09.00 UTC',
      deskripsi: 'AIRSHOW DISPLAY TEAM TNI-AU JUPITER AEROBATIC TEAM. AEROBATIC MANEUVER DI ATAS AREA DHOHO.',
      dokumenPendukung: 'Izin Kemenhub No: SKB-102/VI/2026',
      namaKegiatan: 'AIRSHOW JUPITER AEROBATIC TEAM',
      reffLetter: 'SKB-102 / VI / 2026',
      altitude: 'SFC - FL 100',
      mapImage: null,
      operationalEffect: 'DHOHO ATZ CLOSED for aerobatics',
      mitigation: 'All traffic hold/divert',
      procedureCapacity: 'Zero capacity during display',
      mitigasiOperasional: 'Public NOTAM 48h prior',
      conclusion: 'Airshow approved with TFR'
    }
  },
  {
    id: 'notam-jun-03',
    formNo: '03/VI/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-06-25T04:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM Cancel',
      lokasi: 'WAR2',
      waktuMulai: makeDate(2026, 6, 4, 3, 0),
      waktuSelesai: makeDate(2026, 6, 6, 7, 0),
      jadwalSpesifik: '',
      deskripsi: 'CANCEL - HELICOPTER TRAINING DIBATALKAN KARENA UNIT DITARIK KE OPERASI LAIN.',
      dokumenPendukung: 'Ref: 01/VI/2026'
    }
  },
  // ── JULI 2026 ──
  {
    id: 'notam-jul-01',
    formNo: '01/VII/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-07-01T03:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR1, WAR11',
      waktuMulai: makeDate(2026, 7, 3, 2, 30),
      waktuSelesai: makeDate(2026, 7, 5, 6, 30),
      jadwalSpesifik: '02.30 - 06.30 UTC',
      deskripsi: 'MILITARY EXERCISE LARGE FORCE EMPLOYMENT TNI-AU SKUADRON UDARA 14. AIR SUPERIORITY TRAINING.',
      dokumenPendukung: 'Surat Koops AU No: 044 / VII / 2026',
      namaKegiatan: 'MILITARY EXERCISE AIR SUPERIORITY',
      reffLetter: '044 / VII / 2026',
      altitude: 'SFC - FL 500',
      mapImage: null,
      operationalEffect: 'WAR11, WAR1, DHOHO ATZ',
      mitigation: 'Close coordination with military',
      procedureCapacity: 'Take off and landing delay',
      mitigasiOperasional: 'Inform all ATC sectors',
      conclusion: 'Kegiatan dapat dilaksanakan'
    }
  },
  {
    id: 'notam-jul-02',
    formNo: '02/VII/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-07-05T02:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM Replace',
      lokasi: 'WAR2',
      waktuMulai: makeDate(2026, 7, 8, 1, 0),
      waktuSelesai: makeDate(2026, 7, 10, 5, 0),
      jadwalSpesifik: '',
      deskripsi: 'REPLACE NOTAM FOR EXTENDED PARACHUTE DROP ZONE. AREA DIPERLUAS KE SELATAN.',
      dokumenPendukung: 'Ref: 03/III/2026'
    }
  },
  {
    id: 'notam-jul-03',
    formNo: '03/VII/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-07-10T06:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'ADZ JUANDA',
      waktuMulai: makeDate(2026, 7, 12, 22, 0),
      waktuSelesai: makeDate(2026, 7, 13, 3, 0),
      jadwalSpesifik: '22.00 - 03.00 UTC',
      deskripsi: 'ILS CAT II FLIGHT CHECK BY BALAI KALIBRASI PENERBANGAN. INSTRUMENT LANDING SYSTEM CALIBRATION RWY 10.',
      dokumenPendukung: 'Memo Balai Kalibrasi No: 110/VII/2026',
      namaKegiatan: 'ILS CAT II FLIGHT CHECK',
      reffLetter: '110 / VII / 2026',
      altitude: 'SFC - 3000FT',
      mapImage: null,
      operationalEffect: 'ILS RWY 10 UNRELIABLE during check',
      mitigation: 'Visual approach only',
      procedureCapacity: 'Reduced arrival rate',
      mitigasiOperasional: 'ATIS update, pilot advisory',
      conclusion: 'Calibration essential for safety'
    }
  },
  // Incoming NOTAMs (future dates)
  {
    id: 'notam-jul-04',
    formNo: '04/VII/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-07-12T04:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WOT11',
      waktuMulai: makeDate(2026, 7, 20, 2, 0),
      waktuSelesai: makeDate(2026, 7, 22, 6, 0),
      jadwalSpesifik: '02.00 - 06.00 UTC',
      deskripsi: 'RESERVASI UDARA GIAT VVIP KUNJUNGAN MENTERI PERTAHANAN KE SITUBONDO. TEMPORARY FLIGHT RESTRICTION.',
      dokumenPendukung: 'Instruksi Kemenhub No: SI-115/VII/2026',
      namaKegiatan: 'VVIP FLIGHT MENHAN SITUBONDO',
      reffLetter: 'SI-115 / VII / 2026',
      altitude: 'SFC - FL 250',
      mapImage: null,
      operationalEffect: 'TFR radius 5NM Situbondo',
      mitigation: 'Reroute low-level traffic',
      procedureCapacity: 'Minimal impact to en-route',
      mitigasiOperasional: 'Mil escort coordination',
      conclusion: 'VVIP protocol mandatory'
    }
  },
  {
    id: 'notam-jul-05',
    formNo: '05/VII/2026',
    creator: 'admin',
    creatorName: 'IBNU HARGIYANTO',
    creatorJabatan: 'MANAGER OPERASI APP TWR 2',
    createdAt: '2026-07-13T05:00:00.000Z',
    formData: {
      jenisNotam: 'NOTAM New',
      lokasi: 'WAR11',
      waktuMulai: makeDate(2026, 7, 25, 1, 0),
      waktuSelesai: makeDate(2026, 7, 27, 5, 0),
      jadwalSpesifik: '01.00 - 05.00 UTC daily',
      deskripsi: 'MILITARY EXERCISE BOMBING RANGE TNI-AU. LIVE AMMUNITION EXERCISE DI AREA WAR11.',
      dokumenPendukung: 'Surat Koops AU No: 120/VII/2026',
      namaKegiatan: 'BOMBING RANGE EXERCISE TNI-AU',
      reffLetter: '120 / VII / 2026',
      altitude: 'SFC - FL 450',
      mapImage: null,
      operationalEffect: 'WAR11 DANGER AREA ACTIVE',
      mitigation: 'Reroute all traffic',
      procedureCapacity: 'Significant impact',
      mitigasiOperasional: 'NOTAM class I distribution',
      conclusion: 'Live ammo exercise, strict compliance required'
    }
  },
];

export const NotamProvider = ({ children }) => {
  const [notams, setNotams] = useState(() => {
    const saved = localStorage.getItem('airnav_notams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verify all items are in the new format (have formData object)
        const isNewFormat = Array.isArray(parsed) && parsed.length > 0 && parsed.every(item => 
          item && typeof item === 'object' && item.formData && typeof item.formData === 'object'
        );

        // Reset if old dummy data (less than 10 items) or if format is outdated
        if (!isNewFormat || parsed.length < 10) {
          localStorage.removeItem('airnav_notams');
          return defaultDummyData;
        }
        return parsed;
      } catch {
        return defaultDummyData;
      }
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
