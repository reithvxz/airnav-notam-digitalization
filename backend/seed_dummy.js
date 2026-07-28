const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Notam, Briefing, PostShift } = require('./database');

const CHECKLIST_ITEMS_PRE = [
  { no: 1, subject: 'Personnel Attendance' },
  { no: 2, subject: 'Personnel Readiness' },
  { no: 3, subject: 'Traffic' },
  { no: 4, subject: 'Weather' },
  { no: 5, subject: 'Facilities' },
  { no: 6, subject: 'NOTAM' },
  { no: 7, subject: 'Coordination' },
  { no: 8, subject: 'Special Operations' },
  { no: 9, subject: 'Special Procedures in Effect' },
  { no: 10, subject: 'Personnel Allocation', isTextMode: true, defaultText: 'BY SUPERVISOR' },
  { no: 11, subject: 'Focus Session' },
  { no: 12, subject: 'Closing Confirmation' },
];

const CHECKLIST_ITEMS_POST = [
  { no: 1, subject: 'Logbook Review' },
  { no: 2, subject: 'Equipment Status' },
  { no: 3, subject: 'Pending Traffic' },
  { no: 4, subject: 'Weather Update' },
  { no: 5, subject: 'NOTAM Update' },
  { no: 6, subject: 'Handover Coordination' },
  { no: 7, subject: 'Facility Cleanliness' },
  { no: 8, subject: 'Shift Report' },
  { no: 9, subject: 'Personnel Report' },
  { no: 10, subject: 'Closing Validation' },
];

const KATA_KATA_ANOMALI = [
  "radio statis", "genset bermasalah", "genset belum nyala", 
  "cuaca buruk", "angin kencang", "hujan deras", "visibility rendah", 
  "radar delay", "monitor mati", "AC ruangan panas", 
  "personil telat", "sakit", "dokumentasi belum lengkap", 
  "kabel putus", "koordinasi macet", "kertas habis", "tinta printer habis"
];

const LOKASI_NOTAM = ['WIII', 'WARR', 'WADD', 'WAAU', 'WAAA', 'WIPP', 'WALL'];
const KATEGORI_NOTAM = ['Aerodrome', 'En-route', 'Warning'];
const JENIS_NOTAM = ['New', 'Replace', 'Cancel', 'New', 'New', 'New']; // We want more New
const SHIFTS = ['PAGI', 'SIANG', 'MALAM'];

// Helper for random date in last 90 days
function getRandomDate(daysBack = 90) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return { dateString: `${year}-${month}-${day}`, dateObj: d };
}

function getRandomTime() {
  const h = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${h}:${m}`;
}

async function seed() {
  await sequelize.sync(); // Ensure DB is initialized

  // 1. Fetch Users
  let users = await User.findAll();
  if (users.length === 0) {
    console.log("No users found! Creating default dummy users...");
    await User.bulkCreate([
      { initial: 'ADM', password: '123', nama: 'Admin System', jabatan: 'Supervisor', role: 'admin' },
      { initial: 'MGR1', password: '123', nama: 'Budi Santoso', jabatan: 'Manager 1', role: 'admin' },
      { initial: 'MGR2', password: '123', nama: 'Andi Wijaya', jabatan: 'Manager 2', role: 'admin' },
      { initial: 'MGR3', password: '123', nama: 'Siti Aminah', jabatan: 'Manager 3', role: 'admin' }
    ]);
    users = await User.findAll();
  }

  const getUser = () => users[Math.floor(Math.random() * users.length)];
  const getManagerInfo = (u) => JSON.stringify({ initial: u.initial, nama: u.nama, ttd: null, time: getRandomTime() });

  // 2. Generate NOTAMs
  console.log("Generating 200 NOTAMs...");
  const notamsToInsert = [];
  for (let i = 0; i < 200; i++) {
    const { dateString, dateObj } = getRandomDate();
    const type = KATEGORI_NOTAM[Math.floor(Math.random() * KATEGORI_NOTAM.length)];
    const u = getUser();
    const formNo = `N-${dateString.replace(/-/g, '')}-${String(i).padStart(3, '0')}`;
    
    // Simulate createdAt properly by manipulating time or saving directly?
    // Sequelize sets createdAt on save, but we can override it by using bulkCreate and passing createdAt if the model allows,
    // or just let it use date. For Notam we store date info in "formData" if we want, but let's just insert as usual.
    // However, the charts read from 'createdAt' or 'date'. To fake createdAt, we might have to update it manually, or just define it in formData for NotamAnalytics to read.
    
    const notamDateStr = dateString; // YYYY-MM-DD
    const notamItem = {
      id: uuidv4(),
      formNo,
      jenis: JENIS_NOTAM[Math.floor(Math.random() * JENIS_NOTAM.length)],
      lokasi: LOKASI_NOTAM[Math.floor(Math.random() * LOKASI_NOTAM.length)],
      waktuMulai: `${notamDateStr} 00:00`,
      waktuSelesai: `${notamDateStr} 23:59`,
      formData: JSON.stringify({
        kategori: type,
        date: notamDateStr
      }),
      createdBy: u.id,
      createdAt: dateObj, // Sequelize usually allows forcing createdAt on bulkCreate
      updatedAt: dateObj
    };
    notamsToInsert.push(notamItem);
  }
  await Notam.bulkCreate(notamsToInsert);

  // 3. Generate Briefings (Pre-Shift)
  console.log("Generating 150 Pre-Shift Briefings...");
  const preShiftsToInsert = [];
  for (let i = 0; i < 150; i++) {
    const { dateString, dateObj } = getRandomDate();
    const shift = SHIFTS[Math.floor(Math.random() * SHIFTS.length)];
    const creator = getUser();
    const inManager = getUser();
    const outManager = getUser();

    const checklistData = CHECKLIST_ITEMS_PRE.map(item => {
      if (item.isTextMode) {
        return { ...item, details: '-', checked: null, remarks: item.defaultText };
      }
      
      // 85% Aman (Checked), 15% Ada temuan
      const isChecked = Math.random() > 0.15;
      let remark = '';
      if (!isChecked) {
        remark = KATA_KATA_ANOMALI[Math.floor(Math.random() * KATA_KATA_ANOMALI.length)];
      }

      return {
        ...item,
        details: '-',
        checked: isChecked,
        remarks: remark
      };
    });

    // Time deviation simulation
    let stdTime = '00:00';
    if (shift === 'PAGI') stdTime = '07:00';
    if (shift === 'SIANG') stdTime = '14:00';
    if (shift === 'MALAM') stdTime = '20:00';
    
    // deviate +- 30 mins
    let baseMin = parseInt(stdTime.split(':')[0]) * 60 + parseInt(stdTime.split(':')[1]);
    baseMin += (Math.floor(Math.random() * 61) - 30); // -30 to +30
    
    let simHour = Math.floor(baseMin / 60);
    if (simHour < 0) simHour += 24;
    let simMin = baseMin % 60;
    const timeStr = `${String(simHour).padStart(2, '0')}:${String(simMin).padStart(2, '0')}`;

    preShiftsToInsert.push({
      id: uuidv4(),
      date: dateString,
      time: timeStr,
      managerOnDuty: inManager.initial,
      shift,
      checklistData: JSON.stringify(checklistData),
      incomingManager: getManagerInfo(inManager),
      outgoingManager: getManagerInfo(outManager),
      createdBy: creator.id,
      createdAt: dateObj,
      updatedAt: dateObj
    });
  }
  await Briefing.bulkCreate(preShiftsToInsert);

  // 4. Generate Post-Shift
  console.log("Generating 150 Post-Shift Reports...");
  const postShiftsToInsert = [];
  for (let i = 0; i < 150; i++) {
    const { dateString, dateObj } = getRandomDate();
    const shift = SHIFTS[Math.floor(Math.random() * SHIFTS.length)];
    const creator = getUser();
    const inManager = getUser();
    const outManager = getUser();

    const checklistData = CHECKLIST_ITEMS_POST.map(item => {
      const isChecked = Math.random() > 0.12; // slightly different error rate
      let remark = '';
      if (!isChecked) {
        remark = KATA_KATA_ANOMALI[Math.floor(Math.random() * KATA_KATA_ANOMALI.length)];
      }
      return {
        ...item,
        details: '-',
        checked: isChecked,
        remarks: remark
      };
    });

    let stdTime = '00:00';
    if (shift === 'PAGI') stdTime = '14:00';
    if (shift === 'SIANG') stdTime = '20:00';
    if (shift === 'MALAM') stdTime = '07:00'; // tomorrow morning basically
    
    let baseMin = parseInt(stdTime.split(':')[0]) * 60 + parseInt(stdTime.split(':')[1]);
    baseMin += (Math.floor(Math.random() * 61) - 30);
    
    let simHour = Math.floor(baseMin / 60);
    if (simHour < 0) simHour += 24;
    let simMin = baseMin % 60;
    const timeStr = `${String(simHour).padStart(2, '0')}:${String(simMin).padStart(2, '0')}`;


    postShiftsToInsert.push({
      id: uuidv4(),
      date: dateString,
      time: timeStr,
      managerOnDuty: inManager.initial,
      shift,
      checklistData: JSON.stringify(checklistData),
      incomingManager: getManagerInfo(inManager),
      outgoingManager: getManagerInfo(outManager),
      createdBy: creator.id,
      createdAt: dateObj,
      updatedAt: dateObj
    });
  }
  await PostShift.bulkCreate(postShiftsToInsert);

  console.log("Database successfully seeded with massive dummy data!");
  process.exit();
}

seed().catch(err => {
  console.error("Failed to seed:", err);
  process.exit(1);
});
