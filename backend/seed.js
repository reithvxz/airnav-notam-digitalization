const { User, initDb } = require('./database');

const managers = [
  {
    initial: 'DY',
    nama: 'DEDY INDARKHO',
    jabatan: 'MANAGER OPERASI APP-TWR 1',
    password: 'admin', // Simple default password
    role: 'admin',
    tanda_tangan: 'ttd_dy.png' // You will need to put these images in public/signatures later
  },
  {
    initial: 'IB',
    nama: 'IBNU HARGIYANTO',
    jabatan: 'MANAGER OPERASI APP-TWR 2',
    password: 'admin',
    role: 'admin',
    tanda_tangan: 'ttd_ib.png'
  },
  {
    initial: 'YD',
    nama: 'SETIYADI',
    jabatan: 'MANAGER OPERASI APP-TWR 3',
    password: 'admin',
    role: 'admin',
    tanda_tangan: 'ttd_yd.png'
  },
  {
    initial: 'AY',
    nama: 'ARI YUWONO',
    jabatan: 'MANAGER OPERASI APP-TWR 4',
    password: 'admin',
    role: 'admin',
    tanda_tangan: 'ttd_ay.png'
  },
  {
    initial: 'IW',
    nama: 'IWAN YUNARIAWAN',
    jabatan: 'MANAGER OPERASI APP-TWR 5',
    password: 'admin',
    role: 'admin',
    tanda_tangan: 'ttd_iw.png'
  },
  {
    initial: 'EMPLOYEE',
    nama: 'KARYAWAN DEFAULT',
    jabatan: 'PT MANAGER OPERASI APP-TWR',
    password: 'password123',
    role: 'employee',
    tanda_tangan: ''
  }
];

const seed = async () => {
  try {
    await initDb();
    
    // Create admins if they don't exist
    for (const manager of managers) {
      const exists = await User.findOne({ where: { initial: manager.initial } });
      if (!exists) {
        await User.create(manager);
        console.log(`Created user: ${manager.initial}`);
      } else {
        console.log(`User ${manager.initial} already exists.`);
      }
    }
    console.log("Seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seed();
