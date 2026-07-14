export const users = [
  {
    id: 1,
    username: "admin",
    password: "password123",
    role: "admin", // Admin & Manajemen Operasi
    name: "IBNU HARGIYANTO",
    jabatan: "MANAGER OPERASI APP TWR 2",
    unit: "Kepala Unit Pia Wilayah Surabaya"
  },
  {
    id: 2,
    username: "employee",
    password: "password123",
    role: "employee", // Karyawan Biasa
    name: "Ahmad Karyawan",
    jabatan: "Staf Operasional",
    unit: "Unit Pia Wilayah Surabaya"
  }
];

// Helper to generate a fake future date
const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 16); // YYYY-MM-DDThh:mm
};

// Helper to generate a fake past date
const getPastDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 16);
};

export const dummyNotams = [
  {
    id: "01/VII/2026",
    jenis: "NOTAM New",
    lokasi: "WAR1, WAR11",
    waktuMulai: getPastDate(1), // Already started
    waktuSelesai: getFutureDate(2), // Ends in future
    status: "Active", // "Surat telah terbit"
    deskripsi: "MILITARY EXERCISE LARGE FORCE EMPLOYMENT...",
    pemohon: "IBNU HARGIYANTO"
  },
  {
    id: "02/VII/2026",
    jenis: "NOTAM Replace",
    lokasi: "WAR2",
    waktuMulai: getFutureDate(3), // Starts in future
    waktuSelesai: getFutureDate(5),
    status: "Incoming", // "Surat incoming/akan terbit"
    deskripsi: "REPLACE NOTAM FOR MAINTENANCE...",
    pemohon: "IBNU HARGIYANTO"
  }
];
